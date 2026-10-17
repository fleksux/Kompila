from motor import IMG, ESP, mk
# Linha B · tutorial pra quem nunca montou: o arco orgânico em 3 passos, com a especialista
POST = dict(ordem=4, slug='b1_comecaaqui', tipo='carrossel', leg="""
Nunca montou um arco de balões? Começa aqui 👇

A especialista mostra o caminho mais simples:
1. Encha e amarre os balões de dois em dois
2. Junte duas duplas e forme um cacho de 4
3. Encaixe os cachos na fita, alternando as cores, e preencha os buracos com balão pequeno

Dica de quem já fez: dá pra montar na véspera. Uma cliente contou que fez o arco de um dia pro outro e nenhum murchou 💗

Fita para arco 5 m + dupla face: R$ 11,98
👉 glowbos.com.br

Salva pra ter na mão no dia da festa.

#arcodebaloes #comofazer #tutorial #festaemcasa #decoracaodefesta #glowbos
""", slides=[
 dict(fundo='creme', html=f"""
  <div class="full"><img src="{ESP}fita.jpg" style="object-position:50% 60%"></div>
  <div class="velc"></div>
  <div class="blk" style="bottom:260px"><div class="k">tutorial pra quem nunca fez</div>
  <h1 class="t" style="margin-top:20px">Nunca montou um arco?<br>{mk('*Começa aqui.*')}</h1>
  <p class="p" style="margin-top:24px;color:var(--ink)">3 passos. Sem decoradora.</p></div>"""),
 dict(fundo='pessego', html=f"""
  <div class="blk" style="top:270px"><div class="k">antes de começar</div><h2 class="t2" style="margin-top:16px">Você vai {mk('*precisar de*')}</h2></div>
  <div class="cartao" style="left:96px;top:480px;width:420px;padding:22px"><div style="height:300px;border-radius:20px;overflow:hidden"><img src="{IMG}pack_candy.webp" style="width:100%;height:100%;object-fit:cover"></div><p class="p" style="margin-top:18px;color:var(--ink);font-size:30px"><b>Balões</b><br>pacote ou kit de arco</p></div>
  <div class="cartao" style="left:564px;top:480px;width:420px;padding:22px"><div style="height:300px;border-radius:20px;overflow:hidden"><img src="{IMG}fita_arco_rose.webp" style="width:100%;height:100%;object-fit:cover"></div><p class="p" style="margin-top:18px;color:var(--ink);font-size:30px"><b>Fita 5 m + dupla face</b><br>R$ 11,98</p></div>
  <div class="blk" style="top:1040px;display:flex;gap:24px;align-items:center"><div class="ftc" style="position:relative;width:150px;height:150px;border-width:6px;flex:none"><img src="{ESP}bomba.jpg" style="object-position:50% 40%"></div>
  <p class="p" style="color:var(--ink)"><b>Uma bomba manual</b> poupa o fôlego. Encher na boca cansa rápido.</p></div>"""),
 dict(fundo='lilas', html=f"""
  <div class="ft" style="left:96px;top:250px;width:560px;height:650px"><img src="{IMG}montagem/a09_1.webp"></div>
  <div style="position:absolute;left:690px;top:240px;font:800 260px/1 'Bricolage Grotesque';color:var(--lilas);letter-spacing:-.06em">1</div>
  <div class="blk" style="top:950px"><h2 class="t2">Faça {mk('*cachos de 4*')}</h2>
  <p class="p" style="margin-top:20px;color:var(--ink)">Encha e amarre os balões de dois em dois. Junte duas duplas torcendo pelo nó: pronto, um cacho.</p></div>"""),
 dict(fundo='rosa', html=f"""
  <div class="blk" style="top:270px;display:flex;gap:26px;align-items:center"><span class="num">2</span><h2 class="t2">Encaixe {mk('*na fita*')}</h2></div>
  <div class="ft" style="left:96px;top:470px;width:430px;height:510px"><img src="{IMG}montagem/a09_2.webp"></div>
  <div class="ft" style="left:554px;top:470px;width:430px;height:510px"><img src="{IMG}montagem/a09_3.webp"></div>
  <div class="mao" style="position:absolute;left:470px;top:680px;font-size:80px;color:var(--pink)">→</div>
  <div class="blk" style="top:1030px"><p class="p" style="color:var(--ink)">Um cacho em cada furo, <b>alternando as cores</b>. O arco vai crescendo sozinho.</p></div>"""),
 dict(fundo='grafite', html=f"""
  <div class="ft" style="left:96px;top:250px;width:888px;height:660px"><img src="{IMG}montagem/a09_4.webp" style="object-position:50% 35%"></div>
  <div class="blk" style="top:950px;display:flex;gap:26px;align-items:center"><span class="num">3</span><h2 class="t2" style="color:#fff">Preencha {mk('*os buracos*')}</h2></div>
  <div class="blk" style="top:1080px"><p class="p">Balão pequeno de 5" nos vãos. Prenda a fita na parede com a dupla face.</p></div>"""),
 dict(fundo='berry', html=f"""
  <div class="ftc" style="left:96px;top:260px;width:260px;height:260px"><img src="{ESP}pronto.jpg" style="object-position:55% 30%"></div>
  <div class="mao" style="position:absolute;left:390px;top:360px">dica da especialista</div>
  <h2 class="t2 blk" style="top:580px;color:#fff">Monte {mk('*na véspera.*')}<br>No dia, só pendura.</h2>
  <div class="bolha" style="left:96px;right:96px;top:830px;font-size:30px">"Fizemos o arco de um dia para o outro e nenhum murchou, cores lindas pessoalmente!"<br><span class="estrela" style="font-size:24px">★★★★★</span> <b style="font-size:24px">cliente da loja na Shopee</b></div>
  <div class="blk" style="top:1110px;display:flex;gap:18px;flex-wrap:wrap"><span class="pill br">glowbos.com.br</span></div>"""),
])
