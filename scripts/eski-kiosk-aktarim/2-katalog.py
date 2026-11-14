import json,sys,re,unicodedata,collections,os
S=sys.argv[1]
N=lambda s: unicodedata.normalize('NFC',s)
res=json.load(open(f'{S}/map.json')); inv=json.load(open(f'{S}/inv.json'))
TR=str.maketrans('çğıöşüÇĞİÖŞÜ','cgiosuCGIOSU')
def tr_lower(s): return s.replace('I','ı').replace('İ','i').lower()
def tr_upper(s): return s.replace('i','İ').replace('ı','I').upper()
PAT=re.compile(r'^\s*([A-Za-zİ])\s*-\s*(\d{1,3})\s*(?:\[\s*([A-Za-zÇĞİÖŞÜçğıöşü])\s*[\]\})]\s*|([A-ZÇĞİÖŞÜ])(?=\s)\s*)?[-\s]*(.*?)\s*$')
VORDER='ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'
items={}; notes=[]
def add(L,n,v,name,src,origin):
    L=tr_upper(L); v=tr_upper(v) if v else ''
    key=(L,int(n),v)
    if key in items:
        if re.sub(r'\W','',items[key]['name'].lower())!=re.sub(r'\W','',name.lower()): notes.append(('dup',origin,key,name))
        return False
    items[key]=dict(L=L,n=int(n),v=v,name=re.sub(r'\s+',' ',name).strip(' -').strip(),src=src,origin=origin); return True
pending=[]
for r in res:
    t=N(r['title']); src='wamp64/www/kioks/i/wp-content/uploads/'+N(r['found'][0])
    m=PAT.match(t)
    if m: add(m.group(1),m.group(2),m.group(3) or m.group(4),m.group(5),src,'db:'+t)
    else: pending.append((r,src,t))
# başlığında kod olmayanlar: excerpt'ten (a22ler → A-22)
merged=set()
for r,src,t in pending:
    m2=re.match(r'(.+)_(\d)$',t)
    if m2:
        base=m2.group(1); twins=[(rr,ss) for rr,ss,tt in pending if tt.startswith(base+'_')]
        if base in merged: continue
        merged.add(base)
        m=re.match(r'([a-z])(\d+)',r['exc'])
        if add(m.group(1),m.group(2),'',base.replace('_',' '),src,'db-exc:'+t): items[(tr_upper(m.group(1)),int(m.group(2)),'')]['extra']=[ss for rr,ss in twins[1:]]
        continue
    m=re.match(r'([a-z])(\d+)',r['exc'])
    L,n=m.group(1),int(m.group(2))
    if (tr_upper(L),n,'') not in items: add(L,n,'',t.replace('_',' ').replace('-',' '),src,'db-exc:'+t)
    else:
        used={k[2] for k in items if k[0]==tr_upper(L) and k[1]==n}
        v=next(c for c in VORDER if c not in used)
        add(L,n,v,t.replace('_',' ').replace('-',' '),src,'db-exc-var:'+t); notes.append(('assigned variant',t,f'{L.upper()}-{n} [{v}]'))
# klasörde olup veritabanında olmayanlar
for p,s in inv:
    if p.startswith('wamp64'): continue
    b=os.path.splitext(os.path.basename(N(p)))[0]
    m=PAT.match(b)
    if not m: notes.append(('folder unparsed',p)); continue
    L,n,v=m.group(1),m.group(2),m.group(3) or m.group(4)
    key=(tr_upper(L),int(n),tr_upper(v) if v else '')
    d=re.match(r'([A-Za-zİ])\s*-\s*(\d+)',os.path.basename(os.path.dirname(N(p))))
    if d and (tr_upper(d.group(1)),int(d.group(2)))!=key[:2]: notes.append(('folder code mismatch',p)); continue
    if key in items: continue
    add(L,n,v,m.group(5),N(p),'folder:'+p)
cat=sorted(items.values(),key=lambda x:(x['L'],x['n'],VORDER.index(x['v']) if x['v'] else -1))
c=collections.Counter(x['L'] for x in cat)
print(len(cat),sorted(c.items()))
print('origins',collections.Counter(x['origin'].split(':')[0] for x in cat))
for n in notes: print(n)
json.dump(cat,open(f'{S}/catalog.json','w'),ensure_ascii=False,indent=0)
