from motor import IMG, ESP, mk, LOGO
# Linha E · post de marca do meio (1 slide, título centralizado): chá revelação
POST = dict(ordem=14, slug='e2_marca_cha', tipo='marca', leg="""
Menino ou menina? A cor é sua 💗💙

Rosa e azul, candy, branco com dourado: no pacote você escolhe até 5 cores e a sequência delas.
E tem o Set Chá Revelação pronto, com o balão da interrogação.

glowbos.com.br · chega hoje em SP e Grande SP

#charevelacao #chadebebe #baloes #festaemcasa #glowbos
""", slides=[
 dict(fundo='lilas', pe='', sem_topo=True, html=f"""
  <img class="lg" src="{LOGO}" alt="" style="left:50%;transform:translateX(-50%);top:60px;height:90px">
  <div class="ft" style="left:190px;top:190px;width:700px;height:830px;border-radius:350px 350px 30px 30px"><img src="{IMG}cena_02_cha_revelacao.webp" style="object-position:50% 30%"></div>
  <div class="blk" style="top:1070px;text-align:center"><h1 class="t" style="font-size:82px">Menino ou menina?<br>{mk('*A cor é sua.*')}</h1></div>
  <span class="pill" style="position:absolute;right:96px;top:900px;transform:rotate(6deg)">rosa</span>
  <span class="pill" style="position:absolute;left:96px;top:760px;background:#7FB4E8;transform:rotate(-6deg)">azul</span>"""),
])
