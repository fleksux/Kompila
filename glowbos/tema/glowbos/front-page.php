<?php
// Página inicial: a home aprovada (home.html), com as imagens apontando pro tema
// e os botões de compra ligados aos produtos do WooCommerce.
$uri  = get_template_directory_uri();
$html = file_get_contents( __DIR__ . '/home.html' );
$html = preg_replace( '#(["\'`(=])img/#', '$1' . $uri . '/img/', $html );

// Some o título do protótipo: quem dá título e prévia de link é o wp_head.
$html = preg_replace( '#<title>.*?</title>\s*#s', '', $html, 1 );

// Some a faixa de troca de versões do protótipo.
$html = preg_replace( '#<div class="troca">.*?</div>\s*#s', '', $html, 1 );

$gb = array(
	'sync' => esc_url_raw( add_query_arg( 'wc-ajax', 'glowbos_sync', home_url( '/' ) ) ),
	'img'  => $uri . '/img/',
	'orc'  => esc_url_raw( add_query_arg( 'wc-ajax', 'glowbos_orcamento', home_url( '/' ) ) ),
);
// menu da loja com o painel de produtos no lugar do menu do protótipo
$html = str_replace( '<div class="barra">🚚 Chega hoje em São Paulo e Grande SP</div>', glowbos_util_html(), $html );
$html = str_replace( '<!--MAIS_VENDIDOS-->', glowbos_mais_vendidos_html() . glowbos_sets_html(), $html );
$gbn = strpos( $html, '<nav><a href="/categoria/' );
if ( false !== $gbn ) {
	$html = substr_replace( $html, glowbos_mega_html(), $gbn, strpos( $html, '</nav>', $gbn ) + 6 - $gbn );
}
// rodapé único do tema no lugar do rodapé do protótipo
$gbr = strpos( $html, '<footer>' );
if ( false !== $gbr ) {
	$html = substr_replace( $html, glowbos_rodape_html(), $gbr, strpos( $html, '</footer>', $gbr ) + 9 - $gbr );
}
$gbf  = strpos( $html, '<style>
.rf{' );
if ( false !== $gbf ) {
	$html = substr_replace( $html, glowbos_news_html(), $gbf, 0 );
}
$ponte = '<script>window.GB=' . wp_json_encode( $gb ) . ';</script>';

// wp_head e wp_footer entram pra o WordPress e o WooCommerce funcionarem na home.
ob_start();
wp_head();
$head = ob_get_clean();
ob_start();
wp_footer();
$foot = ob_get_clean();

$html = str_replace( '</head>', $head . '</head>', $html );
$html = str_replace( '</body>', $ponte . $foot . '<script src="' . esc_url( $uri . '/ponte.js?v=4' ) . '"></script></body>', $html );
echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- HTML do próprio tema.
