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
		WC()->customer->set_shipping_country( 'BR' );
		WC()->customer->set_billing_country( 'BR' );
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
		<div class="gb-hoje"><span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg></span><span><b>Chega hoje em São Paulo e Grande SP</b>Pedido pago até 12h sai no mesmo dia; depois disso, chega no dia seguinte.</span></div>
		<div><span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg></span><span style="flex:1"><b>Ver prazo pro seu CEP</b>
			<span class="gb-cep"><input inputmode="numeric" maxlength="9" placeholder="00000-000" id="gbcep"><button type="button" id="gbcepb">Ver</button></span>
			<span class="gb-cepr" id="gbcepr"></span></span></div>
		<div><span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></svg></span><span><b>Nota 4,9 na Shopee</b>A Glowbos é a loja própria da Mayara Festas: +67 mil avaliações e +121 mil vendidos. <a href="https://shopee.com.br/shop/414535277" target="_blank" rel="noopener">Ver na Shopee ↗</a></span></div>
		<div><span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg></span><span><b>Troca fácil</b>7 dias pra se arrepender. <a href="/trocas-e-devolucoes/">Ver regras</a></span></div>
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

// Frete do motoboy (SP e Grande SP): o nome mostra se chega hoje ou amanhã pelo corte das 12h.
add_filter( 'woocommerce_package_rates', function ( $rates ) {
	$hora = (int) ( new DateTime( 'now', new DateTimeZone( 'America/Sao_Paulo' ) ) )->format( 'G' );
	foreach ( $rates as $rate ) {
		if ( 'flat_rate' === $rate->get_method_id() && 0 === strpos( $rate->get_label(), 'Motoboy' ) ) {
			$rate->set_label( $hora < 12 ? 'Motoboy · chega hoje' : 'Motoboy · chega amanhã (pedidos até 12h chegam no mesmo dia)' );
		}
	}
	return $rates;
}, 20 );

// Checkout: bairro obrigatório (Melhor Envio e antifraude do Mercado Pago usam o endereço completo).
add_filter( 'woocommerce_billing_fields', function ( $f ) {
	if ( isset( $f['billing_neighborhood'] ) ) {
		$f['billing_neighborhood']['required'] = true;
	}
	return $f;
}, 20 );
add_filter( 'woocommerce_shipping_fields', function ( $f ) {
	if ( isset( $f['shipping_neighborhood'] ) ) {
		$f['shipping_neighborhood']['required'] = true;
	}
	return $f;
}, 20 );

// Checkout com a cara da Glowbos: estilo e script próprios, CEP primeiro e campos em ordem de quem preenche.
add_action( 'wp_enqueue_scripts', function () {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
		return;
	}
	$v = wp_get_theme()->get( 'Version' ) . '.16';
	wp_enqueue_style( 'glowbos-checkout', get_template_directory_uri() . '/checkout.css', array( 'glowbos' ), $v );
	wp_enqueue_script( 'glowbos-checkout', get_template_directory_uri() . '/checkout.js', array( 'jquery', 'wc-checkout' ), $v, true );
}, 30 );
add_filter( 'woocommerce_checkout_fields', function ( $f ) {
	$ordem = array(
		'billing_first_name'   => array( 10, 'form-row-first' ),
		'billing_last_name'    => array( 20, 'form-row-last' ),
		'billing_email'        => array( 22, 'form-row-wide' ),
		'billing_phone'        => array( 24, 'form-row-first' ),
		'billing_cpf'          => array( 26, 'form-row-last' ),
		'billing_postcode'     => array( 40, 'form-row-first' ),
		'billing_address_1'    => array( 50, 'form-row-wide' ),
		'billing_number'       => array( 55, 'form-row-first' ),
		'billing_address_2'    => array( 60, 'form-row-last' ),
		'billing_neighborhood' => array( 65, 'form-row-first' ),
		'billing_city'         => array( 70, 'form-row-last' ),
		'billing_state'        => array( 80, 'form-row-wide' ),
	);
	foreach ( $ordem as $k => $o ) {
		if ( isset( $f['billing'][ $k ] ) ) {
			$f['billing'][ $k ]['priority'] = $o[0];
			$f['billing'][ $k ]['class']    = array( $o[1] );
		}
	}
	if ( isset( $f['billing']['billing_address_1'] ) ) {
		$f['billing']['billing_address_1']['placeholder'] = 'Preenche sozinho pelo CEP';
	}
	if ( isset( $f['billing']['billing_address_2'] ) ) {
		$f['billing']['billing_address_2']['label']       = 'Complemento';
		$f['billing']['billing_address_2']['placeholder'] = 'Apto, bloco (opcional)';
	}
	if ( isset( $f['billing']['billing_phone'] ) ) {
		$f['billing']['billing_phone']['label'] = 'Celular (WhatsApp)';
	}
	if ( isset( $f['billing']['billing_cpf'] ) ) {
		$f['billing']['billing_cpf']['required'] = true;
	}
	return $f;
}, 99 );
// O WooCommerce reordena os campos de endereço pelo país; para o Brasil, a ordem é a nossa.
add_filter( 'woocommerce_get_country_locale', function ( $l ) {
	$l['BR']['postcode']['priority']  = 40;
	$l['BR']['address_1']['priority'] = 50;
	$l['BR']['address_2']['priority'] = 60;
	$l['BR']['city']['priority']      = 70;
	$l['BR']['state']['priority']     = 80;
	return $l;
} );

// Sem caixinha de "Li e concordo": o aceite dos termos vai numa linha discreta junto do aviso de privacidade.
add_filter( 'woocommerce_checkout_show_terms', '__return_false' );
add_action( 'woocommerce_review_order_before_submit', function () {
	echo '<div class="woocommerce-privacy-policy-text"><p>' . wp_kses_post( wc_replace_policy_page_link_placeholders( wc_get_privacy_policy_text( 'checkout' ) ) ) . '</p></div>';
} );

// Carrinho, minha conta, acompanhar pedido e 404 no visual da loja.
add_action( 'wp_enqueue_scripts', function () {
	if ( is_404() || ( function_exists( 'is_cart' ) && ( is_cart() || is_account_page() || is_page( 'acompanhar-pedido' ) ) ) || is_page() ) {
		wp_enqueue_style( 'glowbos-paginas', get_template_directory_uri() . '/paginas.css', array( 'glowbos' ), wp_get_theme()->get( 'Version' ) . '.2' );
	}
}, 31 );
// Minha conta: textos em português da casa e atalho para acompanhar pedido sem senha.
add_filter( 'woocommerce_account_menu_items', function ( $i ) {
	unset( $i['downloads'] );
	$novo = array();
	foreach ( $i as $k => $v ) {
		$novo[ $k ] = array( 'dashboard' => 'Início', 'orders' => 'Meus pedidos', 'edit-address' => 'Endereços', 'edit-account' => 'Meus dados', 'customer-logout' => 'Sair' )[ $k ] ?? $v;
	}
	return $novo;
} );
add_action( 'woocommerce_after_customer_login_form', function () {
	echo '<p class="gb-rastreio">Comprou sem criar conta? <a href="' . esc_url( home_url( '/acompanhar-pedido/' ) ) . '">Acompanhe pelo número do pedido</a>.</p>';
} );
// No checkout, criar conta já vem marcado (senha chega por e-mail), pra o cliente ter "Meus pedidos".
add_filter( 'woocommerce_create_account_default_checked', '__return_true' );
add_filter( 'gettext', function ( $t, $orig, $dom ) {
	if ( 'woocommerce' === $dom ) {
		if ( 'Proceed to checkout' === $orig ) {
			return 'Finalizar compra';
		}
		if ( 'Order ID' === $orig ) {
			return 'Número do pedido';
		}
		if ( 'Track' === $orig ) {
			return 'Acompanhar';
		}
	}
	return $t;
}, 20, 3 );

// App da Glowbos (PWA): instala no celular e no computador; carrinho e checkout nunca ficam em cache.
add_action( 'wp_head', function () {
	$i = get_template_directory_uri() . '/img/app/';
	echo '<link rel="manifest" href="/manifest.webmanifest">' . "\n";
	echo '<meta name="theme-color" content="#FF1F7A">' . "\n";
	echo '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">' . "\n";
	echo '<meta name="apple-mobile-web-app-title" content="Glowbos"><meta name="apple-mobile-web-app-status-bar-style" content="default">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( $i . 'icone-180.png' ) . '">' . "\n";
}, 2 );
add_action( 'wp_footer', function () {
	?>
	<div class="gb-app" id="gbApp" hidden>
		<img src="<?php echo esc_url( get_template_directory_uri() . '/img/app/icone-192.png' ); ?>" alt="">
		<span><b>Baixe o app da Glowbos</b><small id="gbAppTxt">Compre mais rápido, direto da tela inicial.</small></span>
		<button type="button" id="gbAppOk">Baixar</button>
		<button type="button" id="gbAppX" aria-label="Fechar">×</button>
	</div>
	<style>
	.gb-app{position:fixed;left:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #f1d9e3;border-radius:16px;padding:10px 10px 10px 12px;box-shadow:0 14px 34px rgba(29,26,31,.16);max-width:380px;font:14px/1.3 Inter,system-ui,sans-serif;color:#1d1a1f}
	.gb-app[hidden]{display:none}.gb-app img{width:42px;height:42px;border-radius:10px}
	.gb-app span{flex:1}.gb-app b{display:block;font-size:14.5px}.gb-app small{color:#5f5a63;font-size:12.5px}
	.gb-app #gbAppOk{background:#FF1F7A;color:#fff;border:0;border-radius:10px;height:38px;padding:0 14px;font:700 14px Inter;cursor:pointer}
	.gb-app #gbAppX{background:none;border:0;font-size:22px;color:#a39ca6;cursor:pointer;padding:0 4px}
	@media (max-width:640px){.gb-app{left:10px;right:10px;bottom:74px;max-width:none}}
	</style>
	<script>
	(function(){
		if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){});}
		var app=document.getElementById('gbApp'),ok=document.getElementById('gbAppOk'),x=document.getElementById('gbAppX'),txt=document.getElementById('gbAppTxt');
		if(!app)return;
		var instalado=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
		var fechou=false;try{fechou=localStorage.getItem('gb_app_x')==='1'}catch(e){}
		if(instalado||fechou||/finalizar-compra|carrinho/.test(location.pathname))return;
		var ev=null,ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!window.MSStream;
		function mostra(){setTimeout(function(){app.hidden=false},2500)}
		addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;mostra();});
		if(ios){txt.textContent='No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início".';ok.textContent='Como?';mostra();}
		ok.onclick=function(){if(ev){ev.prompt();ev.userChoice.then(function(){app.hidden=true;ev=null;});}else if(ios){txt.innerHTML='Toque em <b>Compartilhar</b> (o quadrado com a seta) e depois em <b>Adicionar à Tela de Início</b>.';ok.hidden=true;}};
		x.onclick=function(){app.hidden=true;try{localStorage.setItem('gb_app_x','1')}catch(e){}};
		addEventListener('appinstalled',function(){app.hidden=true;});
	})();
	</script>
	<?php
}, 99 );
