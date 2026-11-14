import re,sys,json,collections,urllib.parse,os
S=sys.argv[1]
def tsv(n): return [l.rstrip('\n').split('\t') for l in open(f'{S}/{n}',encoding='utf-8')]
posts=tsv('pc.tsv'); pl={r[0]:r[1] for r in tsv('pl.tsv')}; vid={r[0]:r for r in tsv('vid.tsv')}
att=collections.defaultdict(list)
for r in tsv('att.tsv'): att[r[1]].append((r[2],r[3]))
def upath(u):
    u=urllib.parse.unquote(u)
    m=re.search(r'wp-content/uploads/(.+)$',u)
    return m.group(1) if m else None
res=[];stat=collections.Counter()
for pid,exc,title,content in posts:
    media=[]
    for fid in re.findall(r'fvplayer[^\]]*id="(\d+)"',content):
        for v in (pl.get(fid) or '').split(','):
            v=v.strip()
            if v in vid:
                for s in (vid[v][1],vid[v][2]):
                    p=upath(s) if s and s!='NULL' else None
                    if p: media.append(p)
    for m in re.findall(r'(?:src|href)="([^"]+wp-content/uploads/[^"]+)"',content): media.append(upath(m))
    for g,mime in att.get(pid,[]): 
        p=upath(g); 
        if p: media.append(p)
    media=list(dict.fromkeys(media))
    stat['with media' if media else 'no media']+=1
    res.append({'id':pid,'exc':exc,'title':title,'media':media})
json.dump(res,open(f'{S}/map.json','w'),ensure_ascii=False,indent=0)
print(stat)
for r in res[:5]: print(r)
print([ (r['title']) for r in res if not r['media']][:40])
