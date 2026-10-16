<?php
// Avaliações da Shopee no produto (16/10/2026). A aba "Avaliações (0)" do WooCommerce
// dizia zero do lado do botão, enquanto o topo do site diz 67 mil. Agora a aba mostra a
// nota e o número reais dos anúncios equivalentes da Mayara Festas na Shopee, com link
// pra conferir. Dados em avaliacoes.json (coleta de 09/10/2026). Comentários escritos
// entram depois, quando der pra coletar sem a Shopee bloquear.

function glowbos_aval_dados( $pid ) {
	static $d = null;
	if ( null === $d ) {
		$d = json_decode( (string) file_get_contents( __DIR__ . '/avaliacoes.json' ), true ) ?: array();
	}
	$p = $d['produtos'][ (string) $pid ] ?? null;
	return array( $p, $d['loja'] ?? array() );
}

// Quais fotos de cliente combinam com cada produto (separadas uma a uma em 16/10):
// ava = azul, vermelho e amarelo; vpa = vermelho, preto e amarelo; lmv = laranja, marrom e verde;
// candy = tons pastel; montada = arco ou festa montada (kits, fita, tamanhos avulsos, sob encomenda);
// pacote = qualquer foto (pacotes de cores à escolha e pacotes de uma cor).
function glowbos_aval_grupo( $pid ) {
	$m = array(
		18 => 'ava', 20 => 'vpa', 22 => 'lmv',
		24 => 'candy', 78 => 'candy', 79 => 'candy', 80 => 'candy',
		26 => 'montada', 28 => 'montada', 57 => 'montada', 59 => 'montada', 30 => 'montada',
		49 => 'montada', 51 => 'montada', 53 => 'montada', 61 => 'montada', 81 => 'montada', 83 => 'montada', 85 => 'montada',
	);
	return $m[ (int) $pid ] ?? 'pacote';
}

function glowbos_aval_num( $n ) {
	return $n >= 1000 ? number_format( $n / 1000, $n >= 10000 ? 0 : 1, ',', '.' ) . ' mil' : number_format( $n, 0, ',', '.' );
}

// 16/10: avaliações de cara e pequenas, na coluna da compra: nota numa linha, 4 comentários
// em lista e "Ver mais" que abre de 6 em 6. Só fotos que combinam com o produto (glowbos_aval_grupo).
// 16/10: "Avaliações" é a primeira aba (aberta), antes de Descrição e Informação adicional,
// e as abas sobem pra coluna da esquerda, embaixo da foto do produto.
function glowbos_aval_lista() {
	list( $p, $loja ) = glowbos_aval_dados( get_the_ID() );
	$nota  = number_format( $p ? $p['nota'] : ( $loja['nota'] ?? 4.9 ), 1, ',', '' );
	$total = $p ? glowbos_aval_num( $p['total'] ) : '+' . glowbos_aval_num( $loja['total'] ?? 67000 );
	$url   = $p ? $p['url'] : ( $loja['url'] ?? 'https://shopee.com.br/shop/414535277' );
	?>
	<div class="gbr" data-grupo="<?php echo esc_attr( glowbos_aval_grupo( get_the_ID() ) ); ?>" data-base="<?php echo esc_url( get_template_directory_uri() . '/img/avaliacoes/shopee/' ); ?>" data-json="<?php echo esc_url( get_template_directory_uri() . '/avaliacoes_shopee.json' ); ?>">
		<div class="gbr-top"><span class="gbr-st">★★★★★</span><b><?php echo esc_html( $nota ); ?></b><span><?php echo esc_html( $total ); ?> avaliações na Shopee</span><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener">ver ↗</a></div>
		<ul class="gbr-l"></ul>
		<button type="button" class="gbr-mais" hidden>Ver mais avaliações</button>
	</div>
	<?php
}
add_filter( 'woocommerce_product_tabs', function ( $tabs ) {
	unset( $tabs['reviews'] );
	list( $p, $loja ) = glowbos_aval_dados( get_the_ID() );
	$total = $p ? glowbos_aval_num( $p['total'] ) : glowbos_aval_num( $loja['total'] ?? 67000 );
	$tabs['gb_aval'] = array( 'title' => 'Avaliações (' . $total . ')', 'priority' => 1, 'callback' => 'glowbos_aval_lista' );
	return $tabs;
}, 50 );

add_action( 'wp_head', function () {
	if ( ! is_product() ) {
		return;
	}
	?>
<style>
.gbr{margin:4px 0 6px}
@media (min-width:769px){.single-product div.product{display:grid;grid-template-columns:1fr 1fr;column-gap:48px;align-items:start}.single-product div.product>*{grid-column:1/-1}.single-product div.product>.woocommerce-product-gallery{grid-column:1;grid-row:1;width:auto!important;float:none!important;margin:0!important}.single-product div.product>.summary{grid-column:2;grid-row:1/span 2;width:auto!important;float:none!important;margin:0!important}.single-product div.product>.woocommerce-tabs{grid-column:1;grid-row:2;margin-top:28px;min-width:0}}
.single-product .woocommerce-tabs .panel>h2:first-child{display:none}
.single-product div.product>*{min-width:0;max-width:100%}.single-product .woocommerce-tabs,.single-product .woocommerce-tabs ul.tabs{min-width:0;max-width:100%}
@media (max-width:768px){.woocommerce div.product .woocommerce-tabs ul.tabs{gap:20px}.woocommerce div.product .woocommerce-tabs ul.tabs li a{font-size:14px!important}}
.gbr-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13.5px;color:#5b5560}
.gbr-top .gbr-st{color:#FF1F7A;letter-spacing:1px;font-size:14px}
.gbr-top b{font:800 15px Inter;color:#1d1a1f}
.gbr-top a{color:#C2185B;font-weight:600;margin-left:auto}
.gbr-l{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:10px}
.gbr-l li{display:flex;gap:10px;align-items:flex-start}
.gbr-av{width:30px;height:30px;border-radius:50%;flex:none;overflow:hidden;background:linear-gradient(135deg,#FFD0E1,#F8A5C2);display:grid;place-items:center;font:800 12px Inter;color:#8E1446;text-transform:uppercase}
.gbr-av img{width:100%;height:100%;object-fit:cover;display:block}
.gbr-tx{flex:1;min-width:0}
.gbr-tx b{font:700 12.5px Inter;color:#1d1a1f}
.gbr-tx b small{color:#FF1F7A;font-size:10px;letter-spacing:1px;margin-left:4px}
.gbr-tx p{margin:2px 0 0;font-size:13px;line-height:1.45;color:#4a444d;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gbr-ft{width:46px;height:46px;border-radius:8px;object-fit:cover;flex:none;cursor:zoom-in}
.gbr-mais{margin-top:10px;background:none;border:0;padding:0;font:600 13px Inter;color:#C2185B;cursor:pointer}
.gbr-mais:after{content:" ▾"}
.gbr-zoom{position:fixed;inset:0;background:rgba(20,18,22,.8);display:grid;place-items:center;z-index:99;cursor:zoom-out}
.gbr-zoom img{max-width:min(92vw,520px);max-height:80vh;border-radius:14px}
</style>
<script>
document.addEventListener('DOMContentLoaded',function(){
var w=document.querySelector('.gbr');if(!w)return;
var l=w.querySelector('.gbr-l'),mais=w.querySelector('.gbr-mais'),B=w.dataset.base,G=w.dataset.grupo,lista=[],mostr=0;
var esc=function(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML};
function poe(n){lista.slice(mostr,mostr+n).forEach(function(x){
  var av=x.a?'<img src="'+B+'../perfil/'+x.a+'" alt="" loading="lazy">':esc((x.n||'?').replace(/[^a-z0-9]/gi,'').charAt(0)||'?');
  l.insertAdjacentHTML('beforeend','<li><span class="gbr-av">'+av+'</span><div class="gbr-tx"><b>'+esc(x.n)+'<small>★★★★★</small></b><p>'+esc(x.c)+'</p></div><img class="gbr-ft" src="'+B+x.f+'" alt="Foto de '+esc(x.n)+'" loading="lazy"></li>')});
  mostr=Math.min(lista.length,mostr+n);mais.hidden=mostr>=lista.length;}
fetch(w.dataset.json).then(function(r){return r.json()}).then(function(d){
  lista=d.filter(function(x){return G==='pacote'||(G==='montada'?x.m:(x.t||[]).indexOf(G)>-1)});lista.sort(function(a,b){return (b.m||0)-(a.m||0)});
  if(!lista.length){l.remove();return}poe(4);}).catch(function(){});
mais.onclick=function(){poe(6)};
l.addEventListener('click',function(e){var i=e.target.closest('.gbr-ft');if(!i)return;var z=document.createElement('div');z.className='gbr-zoom';z.innerHTML='<img src="'+i.src+'" alt="">';z.onclick=function(){z.remove()};document.body.appendChild(z)});
});
</script>
	<?php
} );
