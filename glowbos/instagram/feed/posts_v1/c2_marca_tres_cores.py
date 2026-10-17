from motor import IMG, ESP, mk
# Linha C · post de marca do meio: uma dica, título centralizado, a especialista
POST = dict(ordem=8, slug='c2_marca_tres_cores', tipo='carrossel', css='.pg{display:none}', leg="""
A regra mais fácil pra acertar as cores da festa 💡

Escolha 3 cores do tema e some uma neutra: branco, marfim ou nude.
O arco fica leve e as cores do tema aparecem mais.

Salva pra usar no próximo pacote 👉 glowbos.com.br

#dicasdefesta #arcodebaloes #festaemcasa #glowbos
""", slides=[
 dict(fundo='lilasf', pe='', html=f"""
  <div class="ftc" style="left:300px;top:260px;width:480px;height:480px;border-width:12px"><img src="{ESP}cores.jpg" style="object-position:50% 38%"></div>
  <div style="position:absolute;left:96px;right:96px;top:790px;text-align:center"><div class="k">dica da especialista</div>
  <h1 class="t" style="color:#fff;margin-top:20px">3 cores e<br>uma {mk('*neutra*')}</h1>
  <p class="p" style="margin-top:26px">Escolha 3 cores do tema e some branco, marfim ou nude. O arco fica leve e o tema aparece mais.</p></div>"""),
])
