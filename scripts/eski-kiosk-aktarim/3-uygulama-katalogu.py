import json,sys,re,os,unicodedata
S=sys.argv[1]
cat=json.load(open(f'{S}/catalog.json'))
ASC={'Ç':'c2','Ğ':'g2','İ':'i','I':'i2','Ö':'o2','Ş':'s2','Ü':'u2'}
GROUP={'A':'omuz','B':'gogus','C':'kanat','D':'arkakol','E':'pazu','F':'bacak','G':'karin','H':'oblik','K':'bilek','M':'deadlift','O':'plank'}
VIDEO=('.mp4','.webm','.flv','.ts','.gif','.avi','.mov','.m4v')
def tidy(name,src,code_label=''):
    n=name.strip(' -_').strip()
    if not n:
        b=os.path.splitext(os.path.basename(src))[0]
        n=re.sub(r'^[A-Za-zİ]-\d+[-\s]*','',b)
    if ' ' not in n.strip() or n.count('-')>=2 and n.count(' ')<=1:
        n=n.replace('-',' ')
    n=re.sub(r'\s+',' ',n.replace('_',' ')).strip(' -')
    if not n: n='Hareket '+code_label
    if n: n=(n[0].replace('i','İ').replace('ı','I').upper())+n[1:]
    return n
out=[];jobs=[]
for x in cat:
    vid=ASC.get(x['v'],x['v'].lower())
    i=f"{x['L'].lower()}{x['n']}"+(f"-{vid}" if x['v'] else '')
    code=f"{x['L']}{x['n']}"+(f"[{x['v']}]" if x['v'] else '')
    isv=os.path.splitext(x['src'])[1].lower() in VIDEO
    e={'id':'k-'+i,'code':code,'region':GROUP[x['L']],'name':tidy(x['name'],x['src'],f"{x['L']}-{x['n']}")}
    if isv: e['video']=i+'.mp4'
    else: e['image']=i+'.jpg'
    extra=x.get('extra') or []
    if extra: e['images']=[i+'.jpg']+[f'{i}-{k+2}.jpg' for k in range(len(extra))]
    out.append(e)
    jobs.append({'src':x['src'],'out':i,'kind':'v' if isv else 'i'})
    for k,ex in enumerate(extra): jobs.append({'src':ex,'out':f'{i}-{k+2}','kind':'i'})
json.dump(out,open(f'{S}/catalog-app.json','w'),ensure_ascii=False)
json.dump(jobs,open(f'{S}/jobs.json','w'),ensure_ascii=False)
print(len(out),len(jobs), sum(1 for j in jobs if j['kind']=='v'))
for e in out[:6]+out[200:204]: print(e)
print([e for e in out if e['code'] in ('G50','H12','E2','M1')])
