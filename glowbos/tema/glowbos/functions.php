<?php
// Tema Glowbos: home aprovada como página inicial + WooCommerce no tom da marca.

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
} );

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'glowbos-fontes', 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap', array(), null );
	wp_enqueue_style( 'glowbos', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
} );

// IDs dos produtos usados pela home (gravados pelo script de instalação).
function glowbos_ids() {
	return get_option( 'glowbos_produtos', array() );
}

// A paleta escolhida no "Monte seu arco" vai junto com o item do carrinho e aparece no pedido.
add_filter( 'woocommerce_add_cart_item_data', function ( $data, $product_id ) {
	if ( ! empty( $_POST['paleta'] ) ) {
		$data['glowbos_paleta'] = sanitize_text_field( wp_unslash( $_POST['paleta'] ) );
	}
	return $data;
}, 10, 2 );

add_filter( 'woocommerce_get_item_data', function ( $itens, $cart_item ) {
	if ( ! empty( $cart_item['glowbos_paleta'] ) ) {
		$itens[] = array( 'key' => 'Cores', 'value' => $cart_item['glowbos_paleta'] );
	}
	return $itens;
}, 10, 2 );

add_action( 'woocommerce_checkout_create_order_line_item', function ( $item, $key, $values ) {
	if ( ! empty( $values['glowbos_paleta'] ) ) {
		$item->add_meta_data( 'Cores', $values['glowbos_paleta'] );
	}
}, 10, 3 );

// O carrinho da home vira o carrinho do WooCommerce na hora de finalizar.
// Recebe [{k: chave do produto, q: quantidade, paleta: nome}] e devolve o link do checkout.
add_action( 'wc_ajax_glowbos_sync', function () {
	$itens = json_decode( wp_unslash( $_POST['itens'] ?? '[]' ), true );
	$ids   = glowbos_ids();
	if ( ! is_array( $itens ) || ! WC()->cart ) {
		wp_send_json_error();
	}
	if ( WC()->session && ! WC()->session->has_session() ) {
		WC()->session->set_customer_session_cookie( true );
	}
	WC()->cart->empty_cart();
	foreach ( $itens as $it ) {
		$k = sanitize_key( $it['k'] ?? '' );
		$q = max( 1, min( 99, (int) ( $it['q'] ?? 1 ) ) );
		if ( empty( $ids[ $k ] ) ) {
			continue;
		}
		$extra = array();
		if ( ! empty( $it['paleta'] ) ) {
			$extra['glowbos_paleta'] = sanitize_text_field( $it['paleta'] );
		}
		if ( ! empty( $it['img'] ) ) {
			$foto = glowbos_salva_foto( $it['img'] );
			if ( $foto ) {
				$extra['glowbos_img'] = $foto;
			}
		}
		WC()->cart->add_to_cart( (int) $ids[ $k ], $q, 0, array(), $extra );
	}
	// CEP digitado no Ver prazo já entra no checkout.
	$cep = preg_replace( '/\\D/', '', wp_unslash( $_POST['cep'] ?? '' ) );
	if ( 8 === strlen( $cep ) && WC()->customer ) {
		$cep = substr( $cep, 0, 5 ) . '-' . substr( $cep, 5 );
		WC()->customer->set_shipping_postcode( $cep );
		WC()->customer->set_billing_postcode( $cep );
		WC()->customer->save();
	}
	WC()->cart->calculate_totals();
	WC()->cart->set_session();
	WC()->cart->maybe_set_cart_cookies();
	wp_send_json_success( array( 'checkout' => wc_get_checkout_url(), 'itens' => WC()->cart->get_cart_contents_count() ) );
} );

// Página do produto: entrega no mesmo dia, CEP e garantias logo abaixo do botão de comprar.
add_action( 'woocommerce_single_product_summary', function () {
	?>
	<div class="gb-pdp">
		<div class="gb-hoje"><span class="i">🚚</span><span><b>Chega hoje em São Paulo e Grande SP</b>Pedido aprovado até o horário de corte sai no mesmo dia.</span></div>
		<div><span class="i">📍</span><span style="flex:1"><b>Ver prazo pro seu CEP</b>
			<span class="gb-cep"><input inputmode="numeric" maxlength="9" placeholder="00000-000" id="gbcep"><button type="button" id="gbcepb">Ver</button></span>
			<span class="gb-cepr" id="gbcepr"></span></span></div>
		<div><span class="i">⭐</span><span><b>Nota 4,9 na Shopee</b>67 mil avaliações de quem já fez festa.</span></div>
		<div><span class="i">↩️</span><span><b>Troca fácil</b>7 dias pra se arrepender. <a href="/trocas-e-devolucoes/">Ver regras</a></span></div>
	</div>
	<script>
	(function(){var i=document.getElementById('gbcep'),b=document.getElementById('gbcepb'),r=document.getElementById('gbcepr');
	i.addEventListener('input',function(){i.value=i.value.replace(/\D/g,'').replace(/^(\d{5})(\d)/,'$1-$2')});
	b.onclick=function(){var d=i.value.replace(/\D/g,'');if(d.length!==8){r.textContent='Digite os 8 números do CEP.';return}var n=+d;
	r.textContent=(n>=1000000&&n<=9999999)?'🎉 Chega hoje! Esse CEP tem entrega no mesmo dia.':'📦 Enviamos pro seu CEP. O prazo aparece no carrinho.'};})();
	</script>
	<?php
}, 35 );

// Foto da montagem: o JPEG gerado na home é salvo em uploads e acompanha o item até o pedido.
function glowbos_salva_foto( $data_url ) {
	if ( ! is_string( $data_url ) || strpos( $data_url, 'data:image/jpeg;base64,' ) !== 0 || strlen( $data_url ) > 400000 ) {
		return '';
	}
	$bin = base64_decode( substr( $data_url, 23 ), true );
	if ( ! $bin || substr( $bin, 0, 3 ) !== "\xFF\xD8\xFF" ) {
		return '';
	}
	$up  = wp_upload_dir();
	$dir = trailingslashit( $up['basedir'] ) . 'glowbos-montagens';
	wp_mkdir_p( $dir );
	$nome = md5( $bin ) . '.jpg';
	if ( ! file_exists( "$dir/$nome" ) ) {
		file_put_contents( "$dir/$nome", $bin );
	}
	return trailingslashit( $up['baseurl'] ) . 'glowbos-montagens/' . $nome;
}

add_filter( 'woocommerce_cart_item_thumbnail', function ( $thumb, $item ) {
	if ( ! empty( $item['glowbos_img'] ) ) {
		return '<img src="' . esc_url( $item['glowbos_img'] ) . '" alt="Sua montagem" width="300" height="300" style="border-radius:10px">';
	}
	return $thumb;
}, 10, 2 );

add_action( 'woocommerce_checkout_create_order_line_item', function ( $item, $key, $values ) {
	if ( ! empty( $values['glowbos_img'] ) ) {
		$item->add_meta_data( 'Foto da montagem', esc_url_raw( $values['glowbos_img'] ) );
	}
}, 11, 3 );

add_filter( 'woocommerce_order_item_display_meta_value', function ( $valor, $meta ) {
	if ( 'Foto da montagem' === $meta->key ) {
		return '<a href="' . esc_url( $meta->value ) . '" target="_blank"><img src="' . esc_url( $meta->value ) . '" alt="" style="width:120px;border-radius:8px;display:block"></a>';
	}
	return $valor;
}, 10, 2 );

// Carrinho e checkout em blocos (Store API) também mostram a foto da montagem.
add_filter( 'woocommerce_store_api_cart_item_images', function ( $imagens, $cart_item ) {
	if ( empty( $cart_item['glowbos_img'] ) ) {
		return $imagens;
	}
	$url = esc_url_raw( $cart_item['glowbos_img'] );
	return array( (object) array(
		'id'        => 0,
		'src'       => $url,
		'thumbnail' => $url,
		'srcset'    => '',
		'sizes'     => '',
		'name'      => 'Sua montagem',
		'alt'       => 'Sua montagem',
	) );
}, 10, 2 );

// Prévia de link (WhatsApp, Instagram, Facebook): título, descrição e imagem.
add_action( 'wp_head', function () {
	$titulo = 'Glowbos · Balões e festa';
	$desc   = 'Balões e kits de festa com entrega no mesmo dia em São Paulo e Grande SP.';
	$img    = get_template_directory_uri() . '/img/og_glowbos.jpg';
	$url    = home_url( '/' );
	if ( is_singular( 'product' ) ) {
		$titulo = get_the_title() . ' · Glowbos';
		$resumo = wp_strip_all_tags( get_the_excerpt() );
		if ( $resumo ) {
			$desc = wp_trim_words( $resumo, 30 );
		}
		if ( has_post_thumbnail() ) {
			$img = get_the_post_thumbnail_url( null, 'large' );
		}
		$url = get_permalink();
	}
	printf( '<meta name="description" content="%s">' . "\n", esc_attr( $desc ) );
	printf( '<meta property="og:type" content="website">' . "\n" );
	printf( '<meta property="og:site_name" content="Glowbos">' . "\n" );
	printf( '<meta property="og:locale" content="pt_BR">' . "\n" );
	printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $titulo ) );
	printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $desc ) );
	printf( '<meta property="og:url" content="%s">' . "\n", esc_url( $url ) );
	printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $img ) );
	printf( '<meta name="twitter:card" content="summary_large_image">' . "\n" );
}, 1 );

// Sem o script de emoji do WordPress: ele trocava os emojis por imagem e soltava fora do lugar na home.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

// Ícone da loja (o G com a estrela) na aba do navegador e no atalho do celular.
add_action( 'wp_head', function () {
	$i = get_template_directory_uri() . '/img/';
	echo '<link rel="icon" href="' . esc_url( $i . 'fav_32.png' ) . '" sizes="32x32" type="image/png">' . "\n";
	echo '<link rel="icon" href="' . esc_url( $i . 'fav_192.png' ) . '" sizes="192x192" type="image/png">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( $i . 'fav_180.png' ) . '">' . "\n";
}, 2 );

// Dados da loja pra Google e IAs entenderem quem é a Glowbos (só na home).
add_action( 'wp_head', function () {
	if ( ! is_front_page() ) {
		return;
	}
	$i    = get_template_directory_uri() . '/img/';
	$casa = home_url( '/' );
	$dados = array(
		'@context' => 'https://schema.org',
		'@graph'   => array(
			array(
				'@type'       => 'OnlineStore',
				'@id'         => $casa . '#loja',
				'name'        => 'Glowbos',
				'url'         => $casa,
				'logo'        => $i . 'D_logo_crop.png',
				'image'       => $i . 'og_glowbos.jpg',
				'description' => 'Loja online de balões e kits de festa: pacotes de balões, kits de arco, números gigantes e linha premium. Entrega no mesmo dia em São Paulo e Grande SP e envio para todo o Brasil.',
				'areaServed'  => array( 'São Paulo', 'Grande São Paulo', 'Brasil' ),
				'currenciesAccepted' => 'BRL',
			),
			array(
				'@type'      => 'WebSite',
				'@id'        => $casa . '#site',
				'name'       => 'Glowbos',
				'url'        => $casa,
				'inLanguage' => 'pt-BR',
				'publisher'  => array( '@id' => $casa . '#loja' ),
			),
		),
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}, 3 );

// Orçamentos de balão personalizado (gaveta Ver prazo da home): ficam no painel em "Orçamentos".
add_action( 'init', function () {
	register_post_type( 'glowbos_orcamento', array(
		'labels'       => array( 'name' => 'Orçamentos', 'singular_name' => 'Orçamento' ),
		'public'       => false,
		'show_ui'      => true,
		'menu_icon'    => 'dashicons-format-chat',
		'supports'     => array( 'title', 'editor' ),
		'capabilities' => array( 'create_posts' => 'do_not_allow' ),
		'map_meta_cap' => true,
	) );
} );

add_action( 'wc_ajax_glowbos_orcamento', function () {
	$campo = function ( $k ) {
		return sanitize_text_field( wp_unslash( $_POST[ $k ] ?? '' ) );
	};
	$wpp = preg_replace( '/\\D/', '', $campo( 'wpp' ) );
	if ( strlen( $wpp ) < 10 ) {
		wp_send_json_error();
	}
	$tipo  = $campo( 'tipo' ) ?: 'Balão personalizado';
	$texto = sprintf( "Tipo: %s\nNome ou frase: %s\nData da festa: %s\nWhatsApp: %s\nCEP: %s", $tipo, $campo( 'nome' ), $campo( 'data' ), $wpp, $campo( 'cep' ) );
	$id    = wp_insert_post( array(
		'post_type'    => 'glowbos_orcamento',
		'post_status'  => 'private',
		'post_title'   => $tipo . ' · ' . $wpp,
		'post_content' => $texto,
	) );
	$id ? wp_send_json_success() : wp_send_json_error();
} );
