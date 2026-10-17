# uso: python3 baixa.py <<< "slug modelo NN url" (uma por linha). Salva <slug>/<modelo>/NN.jpg em 1080x1440 (ou 1080x1920 se vertical)
import sys,os,urllib.request,io
from PIL import Image
B=os.path.dirname(os.path.abspath(__file__))
for l in sys.stdin:
    p=l.split()
    if len(p)<4: continue
    slug,mod,nn,url=p
    d=os.path.join(B,slug,mod);os.makedirs(d,exist_ok=True)
    im=Image.open(io.BytesIO(urllib.request.urlopen(url,timeout=60).read())).convert('RGB')
    W,H=(1080,1920) if im.height/im.width>1.5 else (1080,1440)
    im.resize((W,H)).save(os.path.join(d,nn+'.jpg'),quality=92);print(slug,mod,nn,im.size)
