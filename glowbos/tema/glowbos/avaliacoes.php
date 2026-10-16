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
</style>
	<?php
} );
