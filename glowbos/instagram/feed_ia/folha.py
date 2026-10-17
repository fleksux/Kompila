import sys,os,glob
from PIL import Image,ImageDraw
B=os.path.dirname(os.path.abspath(__file__));slug=sys.argv[1]
rows=[]
for mod in ['nano','cine']:
    fs=sorted(glob.glob(os.path.join(B,slug,mod,'*.jpg')));rows.append((mod,fs))
W=300;n=max(len(f) for _,f in rows) or 1;H=max(int(W*Image.open(f).height/Image.open(f).width) for _,fs in rows for f in fs)
sh=Image.new('RGB',(n*(W+6)+60,len(rows)*(H+6)),'#bbb');d=ImageDraw.Draw(sh)
for r,(mod,fs) in enumerate(rows):
    d.text((4,r*(H+6)+4),mod,fill='black')
    for k,f in enumerate(fs):
        im=Image.open(f);im=im.resize((W,int(W*im.height/im.width)));sh.paste(im,(60+k*(W+6),r*(H+6)))
out=f'/private/tmp/claude-501/-Users-alexsandroregesdelima/f5ccfc18-b9d5-4704-b8ed-466842bd98b9/scratchpad/ia_{slug}.jpg';sh.save(out,quality=82);print(out)
