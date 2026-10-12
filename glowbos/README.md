# Loja Glowbos

Loja no ar em **https://glowbos.com.br** (WordPress + WooCommerce na VPS da Kompila). Montada em 09 e 10/10/2026.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Home aprovada (identidade D, Chiclete, refinada) | `prototipo/home_D.html` |
| Tema do WordPress | `tema/glowbos/` (a home do site é `tema/glowbos/home.html`, cópia da `home_D.html`) |
| Textos das páginas do rodapé | `tema/paginas/*.html` |
| Gerador das 4 homes da primeira rodada (estudo) | `scripts/gerar_homes.py`, resultado em `prototipo/estudos/v1/` |
| Servidor | VPS 191.101.18.206, pasta `/opt/glowbos` (compose.yaml + .env com as senhas do banco) |
| Acesso ao painel | `~/Documents/GLOWBOS_WP_ACESSO.txt` (usuário alex) |
| Originais das imagens do Magnific | `~/Documents/GLOWBOS_MAGNIFIC/` (fora do HD Dados) |

## Como subir uma mudança

1. Editar `prototipo/home_D.html` e conferir no navegador.
2. `cp prototipo/home_D.html tema/glowbos/home.html`
3. `rsync -az tema/glowbos/ root@191.101.18.206:/opt/glowbos/wp/wp-content/themes/glowbos/`
4. `ssh root@191.101.18.206 'chown -R 33:33 /opt/glowbos/wp/wp-content/themes/glowbos'`
5. Se mudou `ponte.js`, subir o número em `ponte.js?v=` dentro de `front-page.php`.

WP-CLI na VPS: `docker run --rm --network glowbos_glowbos --volumes-from glowbos-wp --user 33:33 -e WORDPRESS_DB_HOST=db -e WORDPRESS_DB_NAME=glowbos -e WORDPRESS_DB_USER=glowbos -e WORDPRESS_DB_PASSWORD=<.env> -e WORDPRESS_TABLE_PREFIX=gb_ -e HOME=/tmp wordpress:cli wp ...`

## Como a home conversa com o WooCommerce

- O carrinho da home vive no navegador (localStorage `glowbos_cart_D`).
- Em **Finalizar compra**, `ponte.js` manda os itens para `?wc-ajax=glowbos_sync` (em `functions.php`), que monta o carrinho do WooCommerce e leva ao checkout.
- Os IDs dos produtos ficam na opção `glowbos_produtos` (chaves: pack_azul, pack_preto, pack_laranja, pack_candy, pct50, pct75, pct100, pct125, kit60, kit100, fita).
- A cor/paleta escolhida vai como "Cores" no item do pedido.
- **Foto da montagem:** a home desenha o cacho num canvas (`gbFoto`), o JPEG vai junto, é salvo em `wp-content/uploads/glowbos-montagens/` e aparece no carrinho, no checkout e no pedido ("Foto da montagem").

## O que a home tem

Hero tela cheia com 3 banners com pessoas (entrega no mesmo dia, festa de criança, Halloween) e CEP (01000-000 a 09999-999 = chega hoje) · selos · festas · linha premium (6 fotos) · números 0 a 9 em 4 estilos (40 fotos `num_<estilo>_<n>.webp`) · monte seu arco (13 paletas, kit 60 e 100) · temas prontos (torcidas por apelido, datas, heróis genéricos, festas) · monte seu pacote (50/75/100/125 balões = 2/3/4/5 cores, 21 cores com foto real `b_<cor>.webp`) · pacotes prontos · prova (Shopee e Bling) · galeria · rodapé com 8 páginas.

Regras de direção de arte: site claro e adulto, rosa #FF1F7A só como acento, nada de balão desenhado (sempre foto), nada de nome ou escudo de clube nem personagem licenciado.

## Números de base (medidos em 09/10/2026)

Bling: 4.478 pedidos em 30 dias, R$ 127.586, ticket ~R$ 28,50. Shopee Mayara Festas: 828 produtos, nota 4,9, ~121 mil vendidos (91,6 mil avaliações na loja). Público dos 4 mil clientes mais recentes: SP 32,5%, MG 16,4%, RJ 10,1%, ~77% mulheres (estimativa pelo nome). Detalhe em `../02_ESTRATEGIA/publico_bling_2026-10-09.md`.

## Falta

- Forma de pagamento (Mercado Pago, Pagar.me ou Pix).
- Frete: valor da entrega no mesmo dia, horário de corte e transportadora para o resto do Brasil.
- WhatsApp, e-mail, Instagram e CNPJ (marcados "a confirmar" nas páginas).
- Importar os demais formatos do catálogo (9", 5", Joy 12" e 16", kits 80/econômico/112/120, inflador, base) com foto nova.
