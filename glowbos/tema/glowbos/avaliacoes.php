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

add_filter( 'woocommerce_product_tabs', function ( $tabs ) {
	unset( $tabs['reviews'] );
	$tabs['gb_aval'] = array(
		'title'    => 'Avaliações na Shopee',
		'priority' => 30,
		'callback' => 'glowbos_aval_aba',
	);
	return $tabs;
}, 99 );

function glowbos_aval_aba() {
	list( $p, $loja ) = glowbos_aval_dados( get_the_ID() );
	$estrela = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>';
	if ( $p ) {
		$nota  = number_format( $p['nota'], 1, ',', '' );
		$linha = sprintf(
			'<b>%s avaliações</b> de quem comprou %s na nossa loja da Shopee%s.',
			glowbos_aval_num( $p['total'] ),
			$p['anuncios'] > 1 ? 'este tipo de pacote' : 'esta mesma combinação',
			$p['com_foto'] ? ', ' . glowbos_aval_num( $p['com_foto'] ) . ' delas com foto da festa' : ''
		);
		$url = $p['url'];
		$ver = 'Ler as avaliações na Shopee ↗';
	} else {
		$nota  = number_format( $loja['nota'] ?? 4.9, 1, ',', '' );
		$linha = '<b>+' . glowbos_aval_num( $loja['total'] ?? 67000 ) . ' avaliações</b> da nossa loja na Shopee, a Mayara Festas. Este produto é novo aqui e ainda não tem avaliação própria.';
		$url   = $loja['url'] ?? 'https://shopee.com.br/shop/414535277';
		$ver   = 'Ver a loja na Shopee ↗';
	}
	?>
	<div class="gb-aval">
		<div class="gb-aval-n"><span class="gb-aval-nota"><?php echo esc_html( $nota ); ?></span><span class="gb-aval-est"><?php echo str_repeat( $estrela, 5 ); // phpcs:ignore ?></span><small>de 5 na Shopee</small></div>
		<div class="gb-aval-t">
			<p><?php echo wp_kses( $linha, array( 'b' => array() ) ); ?></p>
			<p class="gb-aval-q">A Glowbos é a loja própria da Mayara Festas, com o mesmo preço da Shopee. Aqui chega no mesmo dia em SP.</p>
			<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $ver ); ?></a>
		</div>
	</div>
	<div class="gb-avc" data-grupo="<?php echo esc_attr( glowbos_aval_grupo( get_the_ID() ) ); ?>" data-base="<?php echo esc_url( get_template_directory_uri() . '/img/avaliacoes/shopee/' ); ?>" data-json="<?php echo esc_url( get_template_directory_uri() . '/avaliacoes_shopee.json' ); ?>">
		<h3>Quem já comprou</h3>
		<div class="avw"><button type="button" class="avs-b avs-ant" aria-label="Anteriores">‹</button><div class="avl"></div><button type="button" class="avs-b avs-prox" aria-label="Próximas">›</button></div>
		<span class="avs-n"></span>
	</div>
	<?php
}

add_action( 'wp_head', function () {
	if ( ! is_product() ) {
		return;
	}
	?>
<style>
.gb-aval{display:flex;gap:28px;align-items:center;padding:22px 24px;border:1px solid #ECEAF0;border-radius:12px;background:#fff;max-width:760px}
.gb-aval-n{display:flex;flex-direction:column;align-items:flex-start;min-width:150px}
.gb-aval-nota{font:800 52px/1 "Inter Tight",Inter,sans-serif;color:#16141A;letter-spacing:-.02em}
.gb-aval-est{color:#FF1F7A;display:flex;gap:2px;margin:6px 0 4px}
.gb-aval-n small{color:#5B5866;font-size:13px}
.gb-aval-t p{margin:0 0 8px;font-size:15px;color:#16141A}
.gb-aval-t .gb-aval-q{color:#5B5866;font-size:14px}
.gb-aval-t a{color:#C2185B;font-weight:600;font-size:14px}
@media(max-width:600px){.gb-aval{flex-direction:column;align-items:flex-start;gap:12px;padding:18px}}
/* comentários da Shopee no produto (mesmo cartão da home) */
.gb-avc{margin-top:28px;max-width:100%}
.gb-avc h3{font:800 22px "Inter Tight",Inter;letter-spacing:-.02em;margin:0 0 4px}
.gb-avc .avw{position:relative;margin-top:14px}
.gb-avc .avl{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;padding:10px 14px 30px;margin:-10px -14px -16px;scroll-padding:0 14px}
.gb-avc .avl::-webkit-scrollbar{display:none}
.gb-avc .avc{flex:0 0 calc((100% - 54px)/4);scroll-snap-align:start;background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 2px rgba(29,26,31,.04),0 8px 24px rgba(29,26,31,.07)}
.gb-avc .avc-f{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#f3eef1}
.gb-avc .avc-b{padding:0 16px 16px;display:flex;flex-direction:column;flex:1}
.gb-avc .avc-h{display:flex;align-items:flex-start;gap:10px;margin-top:-22px}
.gb-avc .avc-av{width:44px;height:44px;border-radius:50%;flex:none;overflow:hidden;border:3px solid #fff;background:linear-gradient(135deg,#FFD0E1,#F8A5C2);display:grid;place-items:center;font:800 16px "Inter Tight",Inter;color:#8E1446;text-transform:uppercase}
.gb-avc .avc-av img{width:100%;height:100%;object-fit:cover;display:block}
.gb-avc .avc-h>div{min-width:0;flex:1;margin-top:26px}
.gb-avc .avc-h b{display:block;font:700 13.5px Inter;color:#1d1a1f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gb-avc .avc-e{display:flex;gap:1px;margin-top:2px}.gb-avc .avc-e svg{width:12px;height:12px;fill:#FF1F7A}
.gb-avc .avc-b>p{margin:10px 0 12px;font-size:14px;line-height:1.5;color:#3a343d;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;min-height:calc(1.5em*4);flex:1}
.gb-avc .avc-t{align-self:flex-start;font:600 11.5px Inter;color:#8E1446;background:#FFF0F5;border-radius:99px;padding:4px 9px}
.gb-avc .avs-b{position:absolute;top:calc(50% - 28px);width:44px;height:44px;border-radius:50%;border:0;background:#fff;color:#8E1446;font:600 26px/1 Inter;cursor:pointer;box-shadow:0 6px 20px rgba(29,26,31,.12);display:grid;place-items:center;z-index:2}
.gb-avc .avs-b:hover{background:#8E1446;color:#fff}.gb-avc .avs-ant{left:-20px}.gb-avc .avs-prox{right:-20px}
.gb-avc .avs-b:disabled{opacity:0;pointer-events:none}
.gb-avc .avs-n{display:block;text-align:center;font:500 12.5px Inter;color:#8a838d;margin-top:12px}
@media(max-width:1100px){.gb-avc .avc{flex-basis:calc((100% - 36px)/3)}}
@media(max-width:760px){.gb-avc .avc{flex-basis:80%}.gb-avc .avs-b{display:none}}

</style>
<script>
document.addEventListener('DOMContentLoaded',function(){
var w=document.querySelector('.gb-avc');if(!w)return;
var l=w.querySelector('.avl'),ant=w.querySelector('.avs-ant'),prox=w.querySelector('.avs-prox'),n=w.querySelector('.avs-n'),B=w.dataset.base,G=w.dataset.grupo,carregou=false;
var EST='<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg>'.repeat(5);
var esc=function(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML};
function carrega(){if(carregou)return;carregou=true;fetch(w.dataset.json).then(function(r){return r.json()}).then(function(d){
  var ok=d.filter(function(x){return G==='pacote'||(G==='montada'?x.m:(x.t||[]).indexOf(G)>-1)});ok.sort(function(a,b){return (b.m||0)-(a.m||0)});
  if(!ok.length){w.hidden=true;return}
  l.innerHTML=ok.slice(0,80).map(function(x){var av=x.a?'<img src="'+B+'../perfil/'+x.a+'" alt="" loading="lazy">':esc((x.n||'?').replace(/[^a-z0-9]/gi,'').charAt(0)||'?');
    return '<article class="avc"><img class="avc-f" src="'+B+x.f+'" alt="Festa de '+esc(x.n)+'" loading="lazy"><div class="avc-b"><div class="avc-h"><span class="avc-av">'+av+'</span><div><b>'+esc(x.n)+'</b><div class="avc-e" aria-label="5 de 5 estrelas">'+EST+'</div></div></div><p>“'+esc(x.c)+'”</p><span class="avc-t">'+esc(x.p)+'</span></div></article>'}).join('');
  conta()}).catch(function(){})}
function conta(){var c=l.querySelectorAll('.avc');if(!c.length)return;var wd=c[0].getBoundingClientRect().width+18,i=Math.round(l.scrollLeft/wd),v=Math.max(1,Math.round(l.clientWidth/wd));
  n.textContent=(i+1)+'–'+Math.min(c.length,i+v)+' de '+c.length;ant.disabled=l.scrollLeft<5;prox.disabled=l.scrollLeft+l.clientWidth>=l.scrollWidth-5}
ant.onclick=function(){l.scrollBy({left:-l.clientWidth,behavior:'smooth'})};prox.onclick=function(){l.scrollBy({left:l.clientWidth,behavior:'smooth'})};
l.addEventListener('scroll',function(){clearTimeout(l._t);l._t=setTimeout(conta,80)},{passive:true});addEventListener('resize',conta);
var io=window.IntersectionObserver?new IntersectionObserver(function(e){if(e.some(function(x){return x.isIntersecting})){carrega();io.disconnect()}},{rootMargin:'400px'}):null;
if(io)io.observe(w);else carrega();
document.addEventListener('click',function(e){if(e.target.closest('.reviews_tab,#tab-title-gb_aval,a[href="#tab-gb_aval"]'))setTimeout(function(){carrega();conta()},60)});
});
</script>
	<?php
} );
