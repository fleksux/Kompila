from motor import IMG, ESP, mk, esc
# Linha G · prova social · números medidos 09/10/2026 (nota 4,9, 69 mil avaliações, 121 mil vendidos na loja Mayara Festas
# da Shopee) e comentários reais com foto, sem repetir as 10 festas da votação.
HD = '../../carrossel/2026-10-16_votacao/hd/'
AV = IMG + 'avaliacoes/perfil/'
def av(a, n, sz=86):
    dentro = f'<img src="{AV}{a}" style="width:100%;height:100%;object-fit:cover">' if a else f'<b style="font:800 {sz//2.6:.0f}px Inter;color:var(--berry)">{n[0].upper()}</b>'
    return (f'<span style="width:{sz}px;height:{sz}px;border-radius:50%;padding:4px;background:conic-gradient(var(--pessego),var(--pink),var(--lilas),var(--pessego));flex:none;display:block">'
            f'<span style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;border:4px solid #fff;overflow:hidden;background:#FFE1EC">{dentro}</span></span>')
CHAT = [
 ('jojoaninhalin', 'c-mnit2ffn3ima51.webp', 'As bexigas chegaram certinho. Cores vivas e muito bonita. Chegou rápido.'),
 ('maah_costa2', 'b-mqgohql8x88w67.webp', 'As bexigas são lindas e muito resistente, comprem sem medo ♥️'),
 ('vitoria.mangueira5', 'j-mucvrez3cqgy29.webp', 'Os balões são ótimos, comprei pra fazer uma festinha pra minha filha'),
 ('dani_paj', 'o-m51soml9ygr4b1.webp', 'Balões perfeitos, amei o material, chegou antes do prazo'),
]
chat = ''.join(f'<div style="display:flex;gap:22px;align-items:flex-start">{av(a, n, 80)}<div class="bolha" style="position:relative;flex:1;font-size:28px;padding:20px 26px"><b style="display:block;font-size:24px;color:var(--berry);margin-bottom:4px">{n}</b>{esc(c)}<div class="estrela" style="font-size:22px;margin-top:6px">★★★★★</div></div></div>' for n, a, c in CHAT)
GR = [('r022.jpg', 'jojoaninhalin'), ('r023.jpg', 'maah_costa2'), ('r033.jpg', 'dani_paj'), ('r035.jpg', 'adrianalealdasilva')]
gr = ''.join(f'<div style="position:relative;border-radius:26px;overflow:hidden;box-shadow:0 14px 30px rgba(29,26,31,.14)"><img src="{HD}{f}" style="width:100%;height:100%;object-fit:cover"><span style="position:absolute;left:14px;bottom:14px;background:#fff;border-radius:99px;padding:8px 16px;font:700 22px Inter">{n}</span></div>' for f, n in GR)

POST = dict(css='', ordem=22, slug='g1_avaliacoes', tipo='carrossel', leg="""
Nota 4,9 com mais de 69 mil avaliações ⭐⭐⭐⭐⭐

A Glowbos é a loja própria da Mayara Festas, a mesma loja da Shopee que já vendeu mais de 121 mil vezes. Agora com site próprio e entrega no mesmo dia em SP e Grande SP.

Essas fotos e comentários são de clientes de verdade. Obrigado por cada festa 💗

👉 glowbos.com.br

#baloes #festainfantil #arcodebaloes #avaliacao #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="blk" style="top:260px"><div class="k">a mesma loja da Shopee</div>
  <div style="display:flex;align-items:flex-end;gap:26px;margin-top:10px"><span style="font:800 300px/0.82 'Bricolage Grotesque';letter-spacing:-.06em;color:var(--berry)">4,9</span>
  <span class="estrela" style="font-size:52px;margin-bottom:26px">★★★★★</span></div>
  <h1 class="t" style="margin-top:46px;font-size:84px">Olha o que {mk('*dizem*')} da gente</h1></div>
  <div class="blk" style="top:920px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
   <div class="cartao" style="position:relative"><div style="font:800 76px 'Bricolage Grotesque';color:var(--pink);letter-spacing:-.04em">69 mil</div><p class="p" style="font-size:28px">avaliações</p></div>
   <div class="cartao" style="position:relative"><div style="font:800 76px 'Bricolage Grotesque';color:var(--lilas);letter-spacing:-.04em">121 mil</div><p class="p" style="font-size:28px">vendidos</p></div></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:110px;top:270px;width:590px;height:740px;transform:rotate(-2deg)"><img src="{HD}r043.jpg" style="object-position:50% 40%"></div>
  <div class="mao" style="position:absolute;right:96px;top:330px;width:250px;text-align:right">nunca tinha montado?</div>
  <div class="bolha" style="left:300px;right:96px;top:930px;font-size:40px;border-radius:34px 34px 8px 34px"><div style="display:flex;gap:18px;align-items:center;margin-bottom:14px">{av('k-mdz1ypwipgxve6.webp','brendhaalexia',70)}<b style="font-size:28px">brendhaalexia</b></div>"O arco foi fácil de montar, ficou lindo e super rápido!!!"</div>"""),
 dict(fundo='pessego', html=f"""
  <div class="ftc" style="right:-80px;top:240px;width:600px;height:600px"><img src="{HD}r045.jpg" style="object-position:50% 40%"></div>
  <div class="blk" style="top:330px;right:600px"><div class="k">dura?</div><div style="font:800 150px/0.9 'Bricolage Grotesque';letter-spacing:-.05em;color:var(--berry);margin-top:14px;white-space:nowrap">1 mês</div></div>
  <div class="blk" style="top:910px"><p style="font:700 46px/1.25 'Bricolage Grotesque';letter-spacing:-.02em">"Ja tem quase 1 mês que fiz um bolinho para o meu filho e as bolas continuam {mk('*intactas*')}"</p>
  <div style="display:flex;gap:18px;align-items:center;margin-top:30px">{av('o-lyqvbw0qmdg544.webp','thaiselima2',76)}<b style="font:800 28px Inter">thaiselima2</b><span class="estrela">★★★★★</span></div></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="blk" style="top:260px"><h2 class="t2" style="color:#fff">O que mais {mk('*aparece*')}</h2></div>
  <div class="blk" style="top:400px;display:flex;flex-direction:column;gap:22px">{chat}</div>"""),
 dict(fundo='rosa', html=f"""
  <div class="blk" style="top:260px"><h2 class="t2">Festas {mk('*de verdade*')}</h2><p class="p" style="margin-top:10px">fotos mandadas pelas clientes</p></div>
  <div class="blk" style="top:450px;height:770px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:20px">{gr}</div>"""),
 dict(fundo='berry', sem_topo=True, html=f"""
  <img src="{IMG}D_logo_crop.png" style="position:absolute;left:50%;top:260px;width:420px;transform:translateX(-50%);filter:drop-shadow(0 20px 40px rgba(0,0,0,.25))">
  <div class="blk" style="top:720px;text-align:center"><h2 class="t2" style="color:#fff">A loja própria da<br>{mk('*Mayara Festas*')}</h2>
  <p class="p" style="margin-top:24px">Agora com site e entrega no mesmo dia em SP e Grande SP.</p>
  <div style="margin-top:50px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap"><span class="pill br">glowbos.com.br</span><span class="pill" style="background:rgba(255,255,255,.16)">★ 4,9 na Shopee</span></div></div>"""),
])
