/*
 * Bedri Ayzet Kiosk — yerel sunucu
 * ------------------------------------------------------------
 * Tek dosyalık, bağımlılıksız mini HTTP sunucusu.
 *  - app/     klasörünü  /          altında sunar
 *  - videos/  klasörünü  /videos/   altında sunar (Range destekli → video ileri/geri sarma)
 *  - data/db.json dosyasını /api/db üzerinden okur/yazar (atomik yazım + günlük yedek)
 *  - /api/videos  : video listesi (GET) ve yükleme (POST ?name=)
 *
 * Yalnızca 127.0.0.1'e bağlanır; dışarıdan erişilemez.
 * Windows 7+ (32-bit exe, 64-bit sistemlerde de çalışır) ve Linux'ta derlenir.
 *
 * Derleme:
 *   Windows (Linux'tan çapraz):  i686-w64-mingw32-gcc -O2 -s -mwindows kiosk-server.c -o kiosk-server.exe -lws2_32
 *   Linux (test için):           gcc -O2 kiosk-server.c -o kiosk-server -lpthread
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>
#include <sys/stat.h>

#ifdef _WIN32
  #define WIN32_LEAN_AND_MEAN
  #include <winsock2.h>
  #include <windows.h>
  #include <process.h>
  #include <direct.h>
  typedef SOCKET sock_t;
  #define CLOSESOCK closesocket
  #define MKDIR(p) _mkdir(p)
  #define FSEEK64 _fseeki64
  typedef __int64 off64;
#else
  #include <unistd.h>
  #include <dirent.h>
  #include <pthread.h>
  #include <signal.h>
  #include <arpa/inet.h>
  #include <netinet/in.h>
  #include <sys/socket.h>
  typedef int sock_t;
  #define INVALID_SOCKET (-1)
  #define CLOSESOCK close
  #define MKDIR(p) mkdir(p, 0755)
  #define FSEEK64 fseeko
  typedef long long off64;
#endif

#define DEFAULT_PORT   8765
#define MAX_HEADER     16384
#define MAX_DB_BYTES   (32LL * 1024 * 1024)      /* 32 MB — fazlasıyla yeterli */
#define MAX_VIDEO_BYTES (2000LL * 1024 * 1024)  /* 2 GB */
#define IO_CHUNK       65536

static FILE *g_log = NULL;

/* ---------------------------------------------------------------- yardımcılar */

static void log_msg(const char *fmt, const char *arg) {
    if (!g_log) return;
    time_t t = time(NULL);
    char ts[32];
    strftime(ts, sizeof ts, "%Y-%m-%d %H:%M:%S", localtime(&t));
    fprintf(g_log, "[%s] ", ts);
    fprintf(g_log, fmt, arg ? arg : "");
    fputc('\n', g_log);
    fflush(g_log);
}

static int send_all(sock_t s, const char *buf, off64 len) {
    while (len > 0) {
        int n = send(s, buf, (int)(len > IO_CHUNK ? IO_CHUNK : len), 0);
        if (n <= 0) return -1;
        buf += n; len -= n;
    }
    return 0;
}

static off64 file_size(const char *path) {
#ifdef _WIN32
    struct __stat64 st;
    if (_stat64(path, &st) != 0 || (st.st_mode & _S_IFDIR)) return -1;
#else
    struct stat st;
    if (stat(path, &st) != 0 || S_ISDIR(st.st_mode)) return -1;
#endif
    return (off64)st.st_size;
}

static int ends_with(const char *s, const char *suf) {
    size_t a = strlen(s), b = strlen(suf);
    if (b > a) return 0;
#ifdef _WIN32
    return _stricmp(s + a - b, suf) == 0;
#else
    return strcasecmp(s + a - b, suf) == 0;
#endif
}

static const char *mime_of(const char *p) {
    if (ends_with(p, ".html")) return "text/html; charset=utf-8";
    if (ends_with(p, ".css"))  return "text/css; charset=utf-8";
    if (ends_with(p, ".js"))   return "application/javascript; charset=utf-8";
    if (ends_with(p, ".json")) return "application/json; charset=utf-8";
    if (ends_with(p, ".svg"))  return "image/svg+xml";
    if (ends_with(p, ".png"))  return "image/png";
    if (ends_with(p, ".jpg") || ends_with(p, ".jpeg")) return "image/jpeg";
    if (ends_with(p, ".webp")) return "image/webp";
    if (ends_with(p, ".ico"))  return "image/x-icon";
    if (ends_with(p, ".mp4") || ends_with(p, ".m4v")) return "video/mp4";
    if (ends_with(p, ".webm")) return "video/webm";
    if (ends_with(p, ".ogv"))  return "video/ogg";
    if (ends_with(p, ".woff2")) return "font/woff2";
    return "application/octet-stream";
}

static int is_video_name(const char *n) {
    return ends_with(n, ".mp4") || ends_with(n, ".webm") || ends_with(n, ".m4v") || ends_with(n, ".ogv");
}

/* %XX çözümü; '?' sonrası atılır. */
static void url_decode(char *dst, const char *src, size_t cap) {
    size_t o = 0;
    while (*src && *src != '?' && o + 1 < cap) {
        if (*src == '%' && isxdigit((unsigned char)src[1]) && isxdigit((unsigned char)src[2])) {
            char hex[3] = { src[1], src[2], 0 };
            dst[o++] = (char)strtol(hex, NULL, 16);
            src += 3;
        } else {
            dst[o++] = (*src == '+') ? ' ' : *src;
            src++;
        }
    }
    dst[o] = 0;
}

/* Yol güvenliği: "..", ters bölü, sürücü harfi ve kontrol karakterleri yasak. */
static int path_is_safe(const char *p) {
    if (strstr(p, "..") || strchr(p, '\\') || strchr(p, ':')) return 0;
    for (; *p; p++) if ((unsigned char)*p < 32) return 0;
    return 1;
}

/* Yüklenen video adı: yalnızca [a-z0-9._-]; diğer karakterler '-' olur. */
static int sanitize_name(char *dst, const char *src, size_t cap) {
    size_t o = 0;
    for (; *src && o + 1 < cap; src++) {
        unsigned char c = (unsigned char)tolower((unsigned char)*src);
        if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '.' || c == '_' || c == '-') dst[o++] = (char)c;
        else if (o && dst[o - 1] != '-') dst[o++] = '-';
    }
    dst[o] = 0;
    return o > 0 && dst[0] != '.' && !strstr(dst, "..") && is_video_name(dst);
}

static const char *query_param(const char *url, const char *key, char *out, size_t cap) {
    const char *q = strchr(url, '?');
    size_t kl = strlen(key);
    while (q) {
        q++;
        if (strncmp(q, key, kl) == 0 && q[kl] == '=') {
            url_decode(out, q + kl + 1, cap);
            char *amp = strchr(out, '&');
            if (amp) *amp = 0;
            return out;
        }
        q = strchr(q, '&');
    }
    return NULL;
}

/* ---------------------------------------------------------------- yanıtlar */

static void respond(sock_t s, int code, const char *status, const char *type, const char *body, off64 len) {
    char h[512];
    int n = snprintf(h, sizeof h,
        "HTTP/1.1 %d %s\r\nContent-Type: %s\r\nContent-Length: %lld\r\n"
        "Cache-Control: no-store\r\nConnection: close\r\n\r\n",
        code, status, type, (long long)len);
    send_all(s, h, n);
    if (len > 0) send_all(s, body, len);
}

static void respond_json(sock_t s, int code, const char *status, const char *json) {
    respond(s, code, status, "application/json; charset=utf-8", json, (off64)strlen(json));
}

static void send_file(sock_t s, const char *path, const char *range_hdr, int cache) {
    off64 size = file_size(path);
    if (size < 0) { respond_json(s, 404, "Not Found", "{\"error\":\"not_found\"}"); return; }
    FILE *f = fopen(path, "rb");
    if (!f) { respond_json(s, 500, "Error", "{\"error\":\"open_failed\"}"); return; }

    off64 start = 0, end = size - 1;
    int partial = 0;
    if (range_hdr && size > 0) {
        long long a = -1, b = -1;
        const char *r = strstr(range_hdr, "bytes=");
        if (r) {
            r += 6;
            if (*r == '-') { b = strtoll(r + 1, NULL, 10); if (b > 0) { start = size - b; if (start < 0) start = 0; partial = 1; } }
            else {
                char *e; a = strtoll(r, &e, 10);
                if (*e == '-') { e++; if (isdigit((unsigned char)*e)) b = strtoll(e, NULL, 10); }
                if (a >= 0 && a < size) { start = a; if (b >= a && b < size) end = b; partial = 1; }
                else if (a >= size) {
                    char h[160];
                    int n = snprintf(h, sizeof h, "HTTP/1.1 416 Range Not Satisfiable\r\nContent-Range: bytes */%lld\r\nContent-Length: 0\r\nConnection: close\r\n\r\n", (long long)size);
                    send_all(s, h, n); fclose(f); return;
                }
            }
        }
    }
    off64 len = end - start + 1;
    char h[640];
    int n;
    if (partial) {
        n = snprintf(h, sizeof h,
            "HTTP/1.1 206 Partial Content\r\nContent-Type: %s\r\nContent-Length: %lld\r\n"
            "Content-Range: bytes %lld-%lld/%lld\r\nAccept-Ranges: bytes\r\n%s\r\nConnection: close\r\n\r\n",
            mime_of(path), (long long)len, (long long)start, (long long)end, (long long)size,
            cache ? "Cache-Control: max-age=86400" : "Cache-Control: no-cache");
    } else {
        n = snprintf(h, sizeof h,
            "HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %lld\r\nAccept-Ranges: bytes\r\n%s\r\nConnection: close\r\n\r\n",
            mime_of(path), (long long)len, cache ? "Cache-Control: max-age=86400" : "Cache-Control: no-cache");
    }
    if (send_all(s, h, n) == 0 && len > 0) {
        char *buf = (char *)malloc(IO_CHUNK);
        if (buf) {
            FSEEK64(f, start, SEEK_SET);
            while (len > 0) {
                size_t want = (size_t)(len > IO_CHUNK ? IO_CHUNK : len);
                size_t got = fread(buf, 1, want, f);
                if (got == 0 || send_all(s, buf, (off64)got) != 0) break;
                len -= (off64)got;
            }
            free(buf);
        }
    }
    fclose(f);
}

/* ---------------------------------------------------------------- dosya işlemleri */

static int replace_file(const char *tmp, const char *dst) {
#ifdef _WIN32
    return MoveFileExA(tmp, dst, MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH) ? 0 : -1;
#else
    return rename(tmp, dst);
#endif
}

static void copy_file(const char *src, const char *dst) {
    FILE *a = fopen(src, "rb");
    if (!a) return;
    FILE *b = fopen(dst, "wb");
    if (!b) { fclose(a); return; }
    char buf[8192]; size_t n;
    while ((n = fread(buf, 1, sizeof buf, a)) > 0) fwrite(buf, 1, n, b);
    fclose(a); fclose(b);
}

/* Günde bir kez: mevcut db.json → data/backups/db-YYYY-MM-DD.json */
static void daily_backup(void) {
    char name[96], day[16];
    time_t t = time(NULL);
    strftime(day, sizeof day, "%Y-%m-%d", localtime(&t));
    snprintf(name, sizeof name, "data/backups/db-%s.json", day);
    if (file_size(name) >= 0 || file_size("data/db.json") < 0) return;
    MKDIR("data/backups");
    copy_file("data/db.json", name);
}

/* Soketten gövdeyi okuyup dosyaya yazar. pre: başlıkla birlikte gelmiş gövde parçası. */
static int receive_body_to_file(sock_t s, const char *pre, off64 pre_len, off64 total, const char *path) {
    FILE *f = fopen(path, "wb");
    if (!f) return -1;
    off64 done = 0;
    if (pre_len > 0) { fwrite(pre, 1, (size_t)pre_len, f); done = pre_len; }
    char *buf = (char *)malloc(IO_CHUNK);
    if (!buf) { fclose(f); return -1; }
    while (done < total) {
        int want = (int)((total - done) > IO_CHUNK ? IO_CHUNK : (total - done));
        int n = recv(s, buf, want, 0);
        if (n <= 0) break;
        if (fwrite(buf, 1, (size_t)n, f) != (size_t)n) break;
        done += n;
    }
    free(buf);
    fflush(f);
    fclose(f);
    return done == total ? 0 : -1;
}

static void list_videos(sock_t s) {
    size_t cap = 4096, len = 0;
    char *out = (char *)malloc(cap);
    if (!out) { respond_json(s, 500, "Error", "[]"); return; }
    out[len++] = '[';
#ifdef _WIN32
    WIN32_FIND_DATAA fd;
    HANDLE h = FindFirstFileA("videos\\*", &fd);
    if (h != INVALID_HANDLE_VALUE) {
        do {
            const char *n = fd.cFileName;
#else
    DIR *d = opendir("videos");
    struct dirent *e;
    if (d) {
        while ((e = readdir(d)) != NULL) {
            const char *n = e->d_name;
#endif
            if (n[0] == '.' || !is_video_name(n) || strchr(n, '"') || strchr(n, '\\')) continue;
            size_t need = strlen(n) + 4;
            if (len + need + 2 > cap) { cap = (cap + need) * 2; char *nb = (char *)realloc(out, cap); if (!nb) break; out = nb; }
            len += (size_t)sprintf(out + len, "%s\"%s\"", len > 1 ? "," : "", n);
#ifdef _WIN32
        } while (FindNextFileA(h, &fd));
        FindClose(h);
    }
#else
        }
        closedir(d);
    }
#endif
    out[len++] = ']';
    out[len] = 0;
    respond_json(s, 200, "OK", out);
    free(out);
}

/* ---------------------------------------------------------------- istek işleme */

static void handle(sock_t s) {
    char *req = (char *)malloc(MAX_HEADER + 1);
    if (!req) return;
    int got = 0, hdr_end = -1;
    while (got < MAX_HEADER) {
        int n = recv(s, req + got, MAX_HEADER - got, 0);
        if (n <= 0) break;
        got += n;
        req[got] = 0;
        char *p = strstr(req, "\r\n\r\n");
        if (p) { hdr_end = (int)(p - req) + 4; break; }
    }
    if (hdr_end < 0) { free(req); return; }

    char method[8] = {0}, rawurl[2048] = {0};
    if (sscanf(req, "%7s %2047s", method, rawurl) != 2) { free(req); return; }

    /* başlıklar (büyük/küçük harf duyarsız arama için küçük harfli kopya) */
    char save = req[hdr_end]; req[hdr_end] = 0;
    char *lower = strdup(req);
    req[hdr_end] = save;
    if (!lower) { free(req); return; }
    for (char *c = lower; *c; c++) *c = (char)tolower((unsigned char)*c);

    off64 content_len = 0;
    char *cl = strstr(lower, "\r\ncontent-length:");
    if (cl) content_len = strtoll(cl + 17, NULL, 10);
    char range[128] = {0};
    char *rg = strstr(lower, "\r\nrange:");
    if (rg) { sscanf(rg + 8, " %127[^\r\n]", range); }

    char path[2048];
    url_decode(path, rawurl, sizeof path);
    const char *pre = req + hdr_end;
    off64 pre_len = got - hdr_end;

    if (!path_is_safe(path)) {
        respond_json(s, 400, "Bad Request", "{\"error\":\"bad_path\"}");
    }
    /* ---- API ---- */
    else if (strcmp(path, "/api/ping") == 0) {
        respond_json(s, 200, "OK", "{\"ok\":true}");
    }
    else if (strcmp(path, "/api/db") == 0 && strcmp(method, "GET") == 0) {
        if (file_size("data/db.json") < 0) respond_json(s, 404, "Not Found", "{\"error\":\"empty\"}");
        else send_file(s, "data/db.json", NULL, 0);
    }
    else if (strcmp(path, "/api/db") == 0 && strcmp(method, "PUT") == 0) {
        if (content_len <= 0 || content_len > MAX_DB_BYTES) respond_json(s, 413, "Too Large", "{\"error\":\"size\"}");
        else {
            MKDIR("data");
            daily_backup();
            if (receive_body_to_file(s, pre, pre_len, content_len, "data/db.json.tmp") == 0) {
                FILE *chk = fopen("data/db.json.tmp", "rb");
                int first = chk ? fgetc(chk) : EOF;
                if (chk) fclose(chk);
                if (first == '{' && replace_file("data/db.json.tmp", "data/db.json") == 0)
                    respond_json(s, 200, "OK", "{\"ok\":true}");
                else { remove("data/db.json.tmp"); respond_json(s, 400, "Bad Request", "{\"error\":\"invalid\"}"); }
            } else {
                remove("data/db.json.tmp");
                respond_json(s, 500, "Error", "{\"error\":\"write_failed\"}");
                log_msg("db yazilamadi", NULL);
            }
        }
    }
    else if (strcmp(path, "/api/videos") == 0 && strcmp(method, "GET") == 0) {
        list_videos(s);
    }
    else if (strcmp(path, "/api/videos") == 0 && strcmp(method, "POST") == 0) {
        char raw[256], name[200], dst[260], tmp[270];
        if (!query_param(rawurl, "name", raw, sizeof raw) || !sanitize_name(name, raw, sizeof name))
            respond_json(s, 400, "Bad Request", "{\"error\":\"name\"}");
        else if (content_len <= 0 || content_len > MAX_VIDEO_BYTES)
            respond_json(s, 413, "Too Large", "{\"error\":\"size\"}");
        else {
            MKDIR("videos");
            snprintf(dst, sizeof dst, "videos/%s", name);
            snprintf(tmp, sizeof tmp, "videos/%s.part", name);
            if (receive_body_to_file(s, pre, pre_len, content_len, tmp) == 0 && replace_file(tmp, dst) == 0) {
                char js[300];
                snprintf(js, sizeof js, "{\"ok\":true,\"name\":\"%s\"}", name);
                respond_json(s, 200, "OK", js);
                log_msg("video yuklendi: %s", name);
            } else {
                remove(tmp);
                respond_json(s, 500, "Error", "{\"error\":\"upload_failed\"}");
            }
        }
    }
    else if (strncmp(path, "/api/", 5) == 0) {
        respond_json(s, 404, "Not Found", "{\"error\":\"unknown\"}");
    }
    /* ---- statik dosyalar ---- */
    else if (strcmp(method, "GET") == 0 || strcmp(method, "HEAD") == 0) {
        char fs[2100];
        if (strncmp(path, "/videos/", 8) == 0) {
            snprintf(fs, sizeof fs, "videos/%s", path + 8);
            send_file(s, fs, range[0] ? range : NULL, 1);
        } else {
            snprintf(fs, sizeof fs, "app%s%s", path, (path[strlen(path) - 1] == '/') ? "index.html" : "");
            send_file(s, fs, NULL, 0);
        }
    }
    else {
        respond_json(s, 405, "Method Not Allowed", "{\"error\":\"method\"}");
    }

    free(lower);
    free(req);
}

#ifdef _WIN32
static unsigned __stdcall worker(void *arg) {
#else
static void *worker(void *arg) {
#endif
    sock_t s = (sock_t)(size_t)arg;
    handle(s);
#ifdef _WIN32
    shutdown(s, SD_SEND);
#else
    shutdown(s, SHUT_WR);
#endif
    CLOSESOCK(s);
    return 0;
}

/* exe'nin bulunduğu klasörü çalışma dizini yap (kısayoldan açılsa bile doğru klasör) */
static void chdir_to_exe(const char *argv0) {
#ifdef _WIN32
    char p[MAX_PATH];
    DWORD n = GetModuleFileNameA(NULL, p, MAX_PATH);
    if (n == 0 || n >= MAX_PATH) return;
    char *slash = strrchr(p, '\\');
    if (slash) { *slash = 0; SetCurrentDirectoryA(p); }
    (void)argv0;
#else
    char p[1024];
    snprintf(p, sizeof p, "%s", argv0);
    char *slash = strrchr(p, '/');
    if (slash) { *slash = 0; if (chdir(p) != 0) {} }
#endif
}

int main(int argc, char **argv) {
    int port = DEFAULT_PORT;
    if (argc > 1) { int p = atoi(argv[1]); if (p > 0 && p < 65536) port = p; }
    chdir_to_exe(argv[0]);
    MKDIR("data");
    MKDIR("videos");
    g_log = fopen("data/server.log", "a");

#ifdef _WIN32
    WSADATA w;
    if (WSAStartup(MAKEWORD(2, 2), &w) != 0) return 1;
#else
    signal(SIGPIPE, SIG_IGN);
#endif

    sock_t ls = socket(AF_INET, SOCK_STREAM, 0);
    if (ls == INVALID_SOCKET) return 1;
#ifndef _WIN32
    int yes = 1;
    setsockopt(ls, SOL_SOCKET, SO_REUSEADDR, (const char *)&yes, sizeof yes);
#endif
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_port = htons((unsigned short)port);
    addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    if (bind(ls, (struct sockaddr *)&addr, sizeof addr) != 0 || listen(ls, 32) != 0) {
        /* port doluysa büyük ihtimalle sunucu zaten çalışıyor → sessizce çık */
        log_msg("port kullanimda, cikiliyor%s", "");
        return 0;
    }
    log_msg("sunucu basladi%s", "");

    for (;;) {
        sock_t c = accept(ls, NULL, NULL);
        if (c == INVALID_SOCKET) continue;
#ifdef _WIN32
        HANDLE th = (HANDLE)_beginthreadex(NULL, 256 * 1024, worker, (void *)(size_t)c, 0, NULL);
        if (th) CloseHandle(th); else CLOSESOCK(c);
#else
        pthread_t th;
        if (pthread_create(&th, NULL, worker, (void *)(size_t)c) == 0) pthread_detach(th);
        else CLOSESOCK(c);
#endif
    }
    return 0;
}
