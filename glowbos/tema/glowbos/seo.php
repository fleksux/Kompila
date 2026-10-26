<?php
// SEO e GEO da Glowbos (16/10/2026): descrição própria por página, endereço oficial (canonical),
// caminho de navegação, FAQ e dados da loja e do frete no formato que Google e IAs leem.

// Descrição de cada categoria e página. A home e os produtos ficam com a regra de functions.php.
function glowbos_seo_desc() {
	$cats = array(
		'arcos'            => 'Arcos de balões pra montar em casa: escolha o arco pela foto, ajuste o tamanho e receba a lista de balões. Chega hoje em SP e Grande SP.',
		'decoracao-pronta' => 'Decoração pronta: kits de arco de balões de 60 a 120 peças e kit bubble encapsulado. Você escolhe as cores. Chega hoje em SP e Grande SP.',
		'pacotes'          => 'Pacotes de 50 a 125 balões de 8 polegadas, com cores à escolha ou combinações prontas, a partir de R$ 17,50. Chega hoje em SP e Grande SP.',
		'pacotes-fechados' => 'Pacotes fechados de balões, uma cor por pacote, de 5 a 16 polegadas, a partir de R$ 8,99. Entrega no mesmo dia em São Paulo e Grande SP.',
		'candy-colors'     => 'Balões candy em tons pastel pra chá de bebê, chá revelação e festa infantil, de 50 a 100 balões com cores à escolha. Chega hoje em SP.',
		'baloes-joy'       => 'Balões Joy de 5, 9, 12 e 16 polegadas, com cores à escolha. Entrega no mesmo dia em São Paulo e Grande SP.',
		'formatos'         => 'Balões metalizados em formatos: coração, estrela, bola e safári pra dar destaque à festa. Entrega no mesmo dia em São Paulo e Grande SP.',
		'numeros'          => 'Número metalizado gigante de 0 a 9 sobre coluna de balões, no estilo da festa. Sob encomenda, com entrega em São Paulo.',
		'bubbles'          => 'Balão bubble transparente personalizado com nome ou frase e balõezinhos dentro. Sob encomenda, com entrega em São Paulo.',
		'acessorios'       => 'Fita para arco e adesivo dupla face pra montar arco de balões em casa. Chega hoje em SP e Grande SP.',
	);
	$pags = array(
		'loja'                    => 'Loja Glowbos: balões, kits de arco, números e pacotes de festa. Em SP e Grande SP, pedido pago até 12h chega hoje até 21h. Envio pra todo o Brasil.',
		'entrega-e-frete'         => 'Em São Paulo e Grande SP, de motoboy: pedido pago até 12h chega hoje até 21h; depois das 12h, amanhã até 21h. Outras regiões pelos Correios, com prazo e valor pelo CEP.',
		'trocas-e-devolucoes'     => 'Trocas e devoluções na Glowbos: 7 dias pra se arrepender da compra e troca de balão com defeito pelo WhatsApp.',
		'perguntas-frequentes'    => 'Dúvidas sobre balões, cores, tamanhos, gás hélio, quantos balões vão num arco, entrega no mesmo dia e trocas na Glowbos.',
		'como-montar'             => 'Passo a passo pra montar um arco de balões desconstruído em casa: quantos balões usar, como encher, prender na fita e fixar na parede.',
		'sobre'                   => 'A Glowbos é a loja própria da Mayara Festas, nota 4,9 na Shopee com mais de 121 mil vendidos. Balões e kits de festa com entrega no mesmo dia em SP.',
		'contato'                 => 'Fale com a Glowbos pelo WhatsApp (11) 94523-1106 ou pelo e-mail contato@glowbos.com.br.',
		'acompanhar-pedido'       => 'Acompanhe o seu pedido da Glowbos com o número do pedido e o e-mail da compra.',
		'politica-de-privacidade' => 'Como a Glowbos usa e protege os seus dados.',
		'termos-de-uso'           => 'Termos de uso da loja Glowbos.',
	);
	if ( function_exists( 'is_shop' ) && is_shop() ) {
		return $pags['loja'];
	}
	if ( function_exists( 'is_product_category' ) && is_product_category() ) {
		$t = get_queried_object();
		return $cats[ $t->slug ] ?? ( $t->description ? wp_strip_all_tags( $t->description ) : null );
	}
	if ( is_page() ) {
		return $pags[ get_post_field( 'post_name', get_queried_object_id() ) ] ?? null;
	}
	return null;
}

// Endereço oficial da página onde o WordPress não põe sozinho (home, loja, categorias).
add_action( 'wp_head', function () {
	$url = null;
	if ( is_front_page() ) {
		$url = home_url( '/' );
	} elseif ( function_exists( 'is_shop' ) && is_shop() ) {
		$url = get_permalink( wc_get_page_id( 'shop' ) );
	} elseif ( function_exists( 'is_product_category' ) && is_product_category() ) {
		$url = get_term_link( get_queried_object() );
	}
	if ( $url && ! is_wp_error( $url ) ) {
		$p = (int) get_query_var( 'paged' );
		if ( $p > 1 ) {
			$url = trailingslashit( $url ) . 'page/' . $p . '/';
		}
		echo '<link rel="canonical" href="' . esc_url( $url ) . '">' . "\n";
	}
}, 4 );

function glowbos_seo_ld( $dados ) {
	echo '<script type="application/ld+json">' . wp_json_encode( array( '@context' => 'https://schema.org' ) + $dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}

// Caminho de navegação (Início > Categoria > Produto) pro Google mostrar no resultado.
add_action( 'wp_head', function () {
	$itens = array( array( 'Início', home_url( '/' ) ) );
	if ( is_singular( 'product' ) ) {
		$cats = get_the_terms( get_the_ID(), 'product_cat' );
		if ( $cats && ! is_wp_error( $cats ) ) {
			$c       = $cats[0];
			$itens[] = array( $c->name, get_term_link( $c ) );
		}
		$itens[] = array( get_the_title(), get_permalink() );
	} elseif ( function_exists( 'is_product_category' ) && is_product_category() ) {
		$t       = get_queried_object();
		$itens[] = array( 'Loja', get_permalink( wc_get_page_id( 'shop' ) ) );
		$itens[] = array( $t->name, get_term_link( $t ) );
	} elseif ( is_page() && ! is_front_page() ) {
		$itens[] = array( get_the_title(), get_permalink() );
	} else {
		return;
	}
	$lista = array();
	foreach ( $itens as $i => $it ) {
		$lista[] = array( '@type' => 'ListItem', 'position' => $i + 1, 'name' => $it[0], 'item' => $it[1] );
	}
	glowbos_seo_ld( array( '@type' => 'BreadcrumbList', 'itemListElement' => $lista ) );
}, 6 );

// FAQ marcada como FAQ: cada <h2> da página é a pergunta e o parágrafo seguinte é a resposta.
add_action( 'wp_head', function () {
	if ( ! is_page( 'perguntas-frequentes' ) ) {
		return;
	}
	$html = (string) get_post_field( 'post_content', get_queried_object_id() );
	preg_match_all( '#<h2[^>]*>(.*?)</h2>\s*<p[^>]*>(.*?)</p>#s', $html, $m, PREG_SET_ORDER );
	if ( ! $m ) {
		return;
	}
	$q = array();
	foreach ( $m as $par ) {
		$q[] = array(
			'@type'          => 'Question',
			'name'           => wp_strip_all_tags( $par[1] ),
			'acceptedAnswer' => array( '@type' => 'Answer', 'text' => trim( wp_strip_all_tags( $par[2] ) ) ),
		);
	}
	glowbos_seo_ld( array( '@type' => 'FAQPage', 'mainEntity' => $q ) );
}, 6 );

// Produto: frete do mesmo dia na Grande SP e política de troca, que o Google pede no Shopping.
add_filter( 'woocommerce_structured_data_product', function ( $m ) {
	if ( empty( $m['offers'] ) || ! is_array( $m['offers'] ) ) {
		return $m;
	}
	foreach ( $m['offers'] as &$o ) {
		$o['seller']                  = array( '@type' => 'Organization', 'name' => 'Glowbos' );
		$o['hasMerchantReturnPolicy'] = array(
			'@type'                => 'MerchantReturnPolicy',
			'applicableCountry'    => 'BR',
			'returnPolicyCategory' => 'https://schema.org/MerchantReturnFiniteReturnWindow',
			'merchantReturnDays'   => 7,
			'returnMethod'         => 'https://schema.org/ReturnByMail',
		);
		$o['shippingDetails']         = array(
			'@type'               => 'OfferShippingDetails',
			'shippingRate'        => array( '@type' => 'MonetaryAmount', 'value' => 10, 'currency' => 'BRL' ),
			'shippingDestination' => array(
				'@type'             => 'DefinedRegion',
				'addressCountry'    => 'BR',
				'postalCodeRange'   => array( 'postalCodeBegin' => '01000-000', 'postalCodeEnd' => '09999-999' ),
			),
			'deliveryTime'        => array(
				'@type'        => 'ShippingDeliveryTime',
				'handlingTime' => array( '@type' => 'QuantitativeValue', 'minValue' => 0, 'maxValue' => 0, 'unitCode' => 'DAY' ),
				'transitTime'  => array( '@type' => 'QuantitativeValue', 'minValue' => 0, 'maxValue' => 1, 'unitCode' => 'DAY' ),
			),
		);
	}
	return $m;
} );

// GEO: quem é a loja, de quem é, onde fica e como falar, pra IA citar com o nome certo.
add_filter( 'glowbos_dados_loja', function ( $loja ) {
	return $loja + array(
		'legalName'    => 'Mayara Festas e Decorações LTDA',
		'taxID'        => '45.147.944/0001-24',
		'address'      => array( '@type' => 'PostalAddress', 'addressLocality' => 'Santo André', 'addressRegion' => 'SP', 'addressCountry' => 'BR' ),
		'email'        => 'contato@glowbos.com.br',
		'telephone'    => '+55 11 94523-1106',
		'contactPoint' => array( '@type' => 'ContactPoint', 'contactType' => 'customer service', 'telephone' => '+55 11 94523-1106', 'email' => 'contato@glowbos.com.br', 'availableLanguage' => 'pt-BR' ),
		'sameAs'       => array( 'https://www.instagram.com/glowbosbaloes/', 'https://shopee.com.br/shop/414535277' ),
	);
} );

// robots.txt aponta o mapa do site e o resumo pra IAs.
add_filter( 'robots_txt', function ( $txt ) {
	return rtrim( $txt ) . "\n\nSitemap: " . home_url( '/wp-sitemap.xml' ) . "\n# Resumo da loja para IAs: " . home_url( '/llms.txt' ) . "\n";
}, 99 );
