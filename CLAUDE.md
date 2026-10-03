# Site da Kompila (kompila.com.br) · regras pra toda sessão

Lido no começo de toda sessão. Criado em 03/10/2026. As regras de quem decide o quê e o quadro de pedidos
valem pros dois produtos e moram no repositório do CRM:
- `~/Documents/GitHub/kompila-lead-recovery/CLAUDE.md` (quem decide o quê, protocolo entre sessões)
- `~/Documents/GitHub/kompila-lead-recovery/PEDIDOS.md` (o que está pedido, em andamento, esperando o Alex e pronto)

## Publicar
- Sempre os dois lugares: commit + push neste repositório (conta `fleksux`) **e** `rsync -a --exclude .git --exclude .DS_Store ./ /Volumes/Dados/KOMPILA/03_SITE/` (nunca `--delete`).
- Localhost: `http://localhost:8080` serve `03_SITE`.
- Depois do push, conferir no ar (curl) antes de dizer que subiu.

## Regras do site
- **Menu e rodapé têm um lugar só**: `partes/menu.html` e `partes/rodape.html`. Nunca editar o menu dentro de uma página: editar a parte e rodar `python3 scripts/montar_site.py` (copia pras 9 páginas). `python3 scripts/montar_site.py --checar` confere antes de publicar.
- **Só dois caminhos**: botão de chamada = `data-liz href="#liz"` (abre o chat da Liz); falar direto = consultor `wa.me/5511967342512?text=Ol%C3%A1%2C%20vim%20pelo%20site%20Kompila`. Nunca link pro WhatsApp oficial. Antes de publicar, listar o destino de cada `<a>` e clicar de verdade.
- **Movimento**: toda página carrega `/js/anima.js`. Nada de grade de cards iguais e parados.
- **Régua**: páginas de produto carregam `css/regua.css` (menu, rodapé, 1.200 px, título 64). A home e a Trabalhos têm o CSS próprio com os mesmos valores.
- **Só fato**: nenhuma frase que o produto não sustenta (tempo de resposta = o medido; Instagram só quando existir; Meta: disparo em massa no cartão do cliente).
- **Coleve é parceira** (o Alex tem 10%). P1LED só como cliente/parceiro onde ele autorizou.
- **Rascunho não vai pro repositório**: os antigos (antiga, v2, nova, humana) saíram em 03/10; versão nova se testa em branch, não em pasta. Aprovação de cliente (`aprovacao/`, `convite/`) é link sem login por decisão de 30/09, com noindex.
- Sem travessão (— ou –) em texto do site.
