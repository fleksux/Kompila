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
);
$ponte = '<script>window.GB=' . wp_json_encode( $gb ) . ';</script>';

// wp_head e wp_footer entram pra o WordPress e o WooCommerce funcionarem na home.
ob_start();
wp_head();
$head = ob_get_clean();
ob_start();
wp_footer();
$foot = ob_get_clean();

$html = str_replace( '</head>', $head . '</head>', $html );
$html = str_replace( '</body>', $ponte . $foot . '<script src="' . esc_url( $uri . '/ponte.js?v=3' ) . '"></script></body>', $html );
echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- HTML do próprio tema.
