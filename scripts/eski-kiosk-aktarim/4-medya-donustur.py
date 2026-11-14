# Eski kiosk medyasını yeni uygulamaya hazırlar: video → H.264 MP4 (≤720p, sessiz, faststart),
# resim → JPG (≤1280px); her biri için 360px önizleme. Dosya içeriği (logo/filigran) değiştirilmez.
import json, os, subprocess, sys
root = sys.argv[1]; out = os.path.join(root, 'kiosk-medya'); th = os.path.join(out, 'thumbs')
os.makedirs(th, exist_ok=True)
jobs = json.load(open(os.path.join(root, 'kiosk-medya', 'jobs.json'), encoding='utf-8'))
log = open(os.path.join(out, 'donustur.log'), 'a', encoding='utf-8')
def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    return r.returncode == 0, r.stderr[-400:]
for j in jobs:
    src = os.path.join(root, j['src'])
    if j['kind'] == 'v':
        dst = os.path.join(out, j['out'] + '.mp4')
        if not os.path.exists(dst):
            ok, err = run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24',
                '-vf', "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30",
                '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-movflags', '+faststart', dst + '.part.mp4'])
            if ok: os.replace(dst + '.part.mp4', dst)
            else: log.write('HATA ' + j['src'] + ' ' + err + '\n'); continue
        t = os.path.join(th, j['out'] + '.jpg')
        if not os.path.exists(t):
            run(['ffmpeg', '-v', 'error', '-y', '-ss', '0.6', '-i', dst, '-frames:v', '1', '-vf', 'scale=360:-2', '-q:v', '5', t])
            if not os.path.exists(t): run(['ffmpeg', '-v', 'error', '-y', '-i', dst, '-frames:v', '1', '-vf', 'scale=360:-2', '-q:v', '5', t])
    else:
        dst = os.path.join(out, j['out'] + '.jpg')
        if not os.path.exists(dst):
            ok, err = run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-frames:v', '1', '-vf',
                "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease", '-q:v', '3', dst])
            if not ok: log.write('HATA ' + j['src'] + ' ' + err + '\n'); continue
        t = os.path.join(th, j['out'] + '.jpg')
        if not os.path.exists(t): run(['ffmpeg', '-v', 'error', '-y', '-i', dst, '-vf', 'scale=360:-2', '-q:v', '5', t])
    log.write('ok ' + j['out'] + '\n'); log.flush()
log.write('BITTI\n')
