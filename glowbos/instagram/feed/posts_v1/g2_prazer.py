from motor import IMG, ESP, mk
# Linha G · post de marca do meio (1 slide): apresenta a Glowbos com a paleta inteira em faixas
FAIXAS = ''.join(f'<div style="flex:1;background:var(--{c})"></div>' for c in ('berry', 'pink', 'rosa', 'pessego', 'lilas'))
POST = dict(css='', ordem=23, slug='g2_prazer', tipo='carrossel', leg="""
Prazer, Glowbos 💗

Somos a loja própria da Mayara Festas, a mesma da Shopee com nota 4,9.
Balões, kits de arco, números e sets prontos pra você montar a festa em casa.
Em SP e Grande SP, pago até 12h chega no mesmo dia.

Segue a gente pra dicas, tutoriais e novidades 🎈
👉 glowbos.com.br

#glowbos #baloes #festaemcasa #arcodebaloes #festainfantil
""", slides=[
 dict(fundo='creme', sem_topo=True, pe='', html=f"""
  <div style="position:absolute;left:0;right:0;top:0;height:640px;display:flex">{FAIXAS}</div>
  <img src="{IMG}D_logo_crop.png" style="position:absolute;left:50%;top:400px;width:520px;transform:translateX(-50%);filter:drop-shadow(0 24px 40px rgba(176,18,79,.28))">
  <div class="blk" style="top:860px;text-align:center"><h1 class="t" style="font-size:104px">Prazer, {mk('*Glowbos*')}</h1>
  <p class="p" style="margin-top:24px">A loja própria da Mayara Festas.<br>Balões, kits de arco e festa pronta.</p>
  <div style="margin-top:46px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap"><span class="pill">chega hoje em SP</span><span class="pill gr">★ 4,9 na Shopee</span></div></div>"""),
])
