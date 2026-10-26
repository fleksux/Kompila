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
	wp_enqueue_style( 'glowbos', get_stylesheet_uri(), array(), (string) filemtime( get_stylesheet_directory() . '/style.css' ) );
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
	$gc = glowbos_app_config( get_the_ID() );
	if ( $gc && in_array( $gc[0], array( 'numero', 'bubble' ), true ) ) {
		return; // sob encomenda: prazo e valor vêm pelo WhatsApp
	}
	?>
	<div class="gb-pdp">
		<div class="gb-hoje"><span class="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg></span><span><b>Chega hoje em São Paulo e Grande SP</b>Pedido pago até 12h chega hoje até 21h. Depois das 12h, chega amanhã até 21h.</span></div>
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
	var f=window.gbFrete(d);r.textContent=(f.ok?'🎉 ':'📦 ')+f.msg};})();
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

// 18/10: o resumo do checkout mostra a foto de cada item (a montagem, se tiver; senão a do produto).
add_filter( 'woocommerce_cart_item_name', function ( $nome, $item ) {
	if ( ! is_checkout() ) {
		return $nome;
	}
	$url = ! empty( $item['glowbos_img'] ) ? $item['glowbos_img'] : ( isset( $item['data'] ) ? wp_get_attachment_image_url( $item['data']->get_image_id(), 'thumbnail' ) : '' );
	if ( ! $url ) {
		return $nome;
	}
	return '<span class="gb-rv"><img src="' . esc_url( $url ) . '" alt="" width="56" height="56"><span>' . $nome . '</span></span>';
}, 20, 2 );
add_action( 'wp_head', function () {
	if ( is_checkout() ) {
		echo '<style>.gb-rv{display:inline-flex;align-items:center;gap:12px;vertical-align:middle}.gb-rv img{flex:0 0 56px;width:56px;height:56px;object-fit:cover;border-radius:10px;background:#F7F3EA}</style>';
	}
} );

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
	} elseif ( function_exists( 'glowbos_seo_desc' ) && ( $d = glowbos_seo_desc() ) ) {
		$desc   = $d;
		$titulo = wp_get_document_title();
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
			apply_filters( 'glowbos_dados_loja', array(
				'@type'       => 'OnlineStore',
				'@id'         => $casa . '#loja',
				'name'        => 'Glowbos',
				'url'         => $casa,
				'logo'        => $i . 'D_logo_crop.png',
				'image'       => $i . 'og_glowbos.jpg',
				'description' => 'Loja online de balões e kits de festa: pacotes de balões, kits de arco, números gigantes e linha premium. Entrega no mesmo dia em São Paulo e Grande SP e envio para todo o Brasil.',
				'areaServed'  => array( 'São Paulo', 'Grande São Paulo', 'Brasil' ),
				'currenciesAccepted' => 'BRL',
			) ),
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
			$rate->set_label( $hora < 12 ? 'Motoboy · chega hoje até 21h' : 'Motoboy · chega amanhã até 21h (pago até 12h chega no mesmo dia)' );
		}
	}
	return $rates;
}, 20 );

// 17/10: as calculadoras de CEP (home, produto, "Chega hoje?") leem as faixas das próprias zonas do
// WooCommerce, que seguem a tabela PEX Collect. Mudou a zona no painel, muda o aviso junto.
function glowbos_faixas_frete() {
	$faixas = get_transient( 'glowbos_faixas_frete' );
	if ( false !== $faixas ) {
		return $faixas;
	}
	$faixas = array();
	foreach ( WC_Shipping_Zones::get_zones() as $z ) {
		$custo = null;
		$nome  = '';
		foreach ( $z['shipping_methods'] as $m ) {
			if ( 'yes' === $m->enabled && 'flat_rate' === $m->id && ( null === $custo || (float) $m->get_option( 'cost' ) < $custo ) ) {
				$custo = (float) $m->get_option( 'cost' );
				$nome  = $m->get_option( 'title' );
			}
		}
		if ( null === $custo ) {
			continue;
		}
		foreach ( $z['zone_locations'] as $l ) {
			if ( 'postcode' === $l->type && preg_match( '/^(\d{8})\.\.\.(\d{8})$/', $l->code, $p ) ) {
				$faixas[] = array( (int) $p[1], (int) $p[2], $nome, $custo );
			}
		}
	}
	set_transient( 'glowbos_faixas_frete', $faixas, HOUR_IN_SECONDS );
	return $faixas;
}
add_action( 'woocommerce_shipping_zone_method_status_toggled', function () { delete_transient( 'glowbos_faixas_frete' ); } );
add_action( 'woocommerce_after_shipping_zone_object_save', function () { delete_transient( 'glowbos_faixas_frete' ); } );

add_action( 'wp_head', function () {
	?>
	<script>window.GB_FRETE=<?php echo wp_json_encode( glowbos_faixas_frete() ); ?>;
	// devolve {ok, msg} pro CEP: ok = chega por entrega própria (hoje, amanhã ou 2 dias úteis)
	window.gbFrete=function(cep){var n=+String(cep).replace(/\D/g,''),f=null;(window.GB_FRETE||[]).some(function(x){if(n>=x[0]&&n<=x[1]){f=x;return true}});
	if(!f||!/^(Motoboy|Entrega expressa)/.test(f[2]))return{ok:false,msg:'Enviamos pelos Correios. O frete aparece no pagamento.'};
	var v='R$ '+f[3].toFixed(2).replace('.',','),h=new Date().getHours();
	if(/^Motoboy/.test(f[2]))return{ok:true,msg:h<12?'Chega hoje até 21h! Motoboy por '+v+'.':'Chega amanhã até 21h. Motoboy por '+v+'. Pago até 12h chega no mesmo dia.'};
	if(/amanh/.test(f[2]))return{ok:true,msg:'Chega amanhã. Entrega expressa por '+v+'.'};
	return{ok:true,msg:'Chega em até 2 dias úteis. Entrega expressa por '+v+'.'}};</script>
	<?php
}, 2 );

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
	$v = wp_get_theme()->get( 'Version' ) . '.18';
	wp_enqueue_style( 'glowbos-checkout', get_template_directory_uri() . '/checkout.css', array( 'glowbos' ), $v );
	wp_enqueue_script( 'glowbos-checkout', get_template_directory_uri() . '/checkout.js', array( 'jquery', 'wc-checkout' ), $v, true );
}, 30 );
add_filter( 'woocommerce_checkout_fields', function ( $f ) {
	// 16/10: CEP primeiro (o frete aparece na hora) e nome completo num campo só.
	$ordem = array(
		'billing_postcode'     => array( 5, 'form-row-first' ),
		'billing_address_1'    => array( 10, 'form-row-wide' ),
		'billing_number'       => array( 12, 'form-row-first' ),
		'billing_address_2'    => array( 14, 'form-row-last' ),
		'billing_neighborhood' => array( 16, 'form-row-first' ),
		'billing_city'         => array( 18, 'form-row-last' ),
		'billing_state'        => array( 19, 'form-row-wide' ),
		'billing_first_name'   => array( 30, 'form-row-wide' ),
		'billing_email'        => array( 32, 'form-row-wide' ),
		'billing_phone'        => array( 34, 'form-row-first' ),
		'billing_cpf'          => array( 36, 'form-row-last' ),
	);
	if ( isset( $f['billing']['billing_first_name'] ) ) {
		$f['billing']['billing_first_name']['label']       = 'Nome completo';
		$f['billing']['billing_first_name']['placeholder'] = 'Como está no documento';
		$f['billing']['billing_first_name']['autocomplete'] = 'name';
	}
	unset( $f['billing']['billing_last_name'] );
	if ( isset( $f['billing']['billing_postcode'] ) ) {
		$f['billing']['billing_postcode']['label'] = 'CEP';
		$f['billing']['billing_postcode']['placeholder'] = '00000-000';
	}
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
	$l['BR']['postcode']['priority']  = 5;
	$l['BR']['address_1']['priority'] = 10;
	$l['BR']['address_2']['priority'] = 14;
	$l['BR']['address_2']['label']    = 'Complemento';
	$l['BR']['address_2']['label_class'] = array();
	$l['BR']['city']['priority']      = 18;
	$l['BR']['state']['priority']     = 19;
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
		wp_enqueue_style( 'glowbos-paginas', get_template_directory_uri() . '/paginas.css', array( 'glowbos' ), wp_get_theme()->get( 'Version' ) . '.5' );
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
// 16/10: sem caixinha de "criar conta". A conta nasce sozinha depois da compra, com o e-mail do
// pedido, e o WooCommerce manda o link pra pessoa definir a senha e ver "Meus pedidos".
add_filter( 'pre_option_woocommerce_enable_signup_and_login_from_checkout', function () { return 'no'; } );
add_filter( 'pre_option_woocommerce_enable_guest_checkout', function () { return 'yes'; } );
// Nome completo num campo só: separa em nome e sobrenome pro pedido, Bling e Mercado Pago.
add_filter( 'woocommerce_checkout_posted_data', function ( $d ) {
	$nome = trim( preg_replace( '/\s+/', ' ', (string) ( $d['billing_first_name'] ?? '' ) ) );
	if ( '' !== $nome && empty( $d['billing_last_name'] ) ) {
		$p = explode( ' ', $nome, 2 );
		$d['billing_first_name'] = $p[0];
		$d['billing_last_name']  = $p[1] ?? '';
	}
	return $d;
} );
add_action( 'woocommerce_checkout_order_processed', function ( $oid ) {
	$o = wc_get_order( $oid );
	if ( ! $o || $o->get_customer_id() ) {
		return;
	}
	$email = $o->get_billing_email();
	if ( ! is_email( $email ) ) {
		return;
	}
	$uid = email_exists( $email );
	if ( ! $uid ) {
		add_filter( 'pre_option_woocommerce_registration_generate_password', function () { return 'yes'; } );
		add_filter( 'pre_option_woocommerce_registration_generate_username', function () { return 'yes'; } );
		$base = sanitize_user( strtolower( strstr( $email, '@', true ) ), true );
		$login = $base ?: 'cliente';
		for ( $i = 2; username_exists( $login ); $i++ ) {
			$login = $base . $i;
		}
		$uid = wc_create_new_customer( $email, $login, '', array( 'first_name' => $o->get_billing_first_name(), 'last_name' => $o->get_billing_last_name() ) );
		if ( is_wp_error( $uid ) ) {
			return;
		}
		foreach ( array( 'first_name', 'last_name', 'phone', 'postcode', 'address_1', 'address_2', 'city', 'state', 'country' ) as $c ) {
			update_user_meta( $uid, 'billing_' . $c, $o->{'get_billing_' . $c}() );
		}
	}
	$o->set_customer_id( $uid );
	$o->save();
}, 20 );
add_filter( 'gettext', function ( $t, $orig, $dom ) {
	if ( 'woocommerce' === $dom ) {
		if ( 'Proceed to checkout' === $orig ) {
			return 'Finalizar compra';
		}
		if ( 'Coupon code' === $orig ) {
			return 'Cupom';
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
		// 16/10: na primeira visita o aviso cobria os números de confiança; agora só a partir da 2ª visita
		// (uma visita = uma sessão do navegador) ou na página de pedido recebido, depois de comprar.
		var visitas=1;try{visitas=+localStorage.getItem('gb_visitas')||0;if(!sessionStorage.getItem('gb_v')){visitas++;localStorage.setItem('gb_visitas',visitas);sessionStorage.setItem('gb_v','1')}}catch(e){}
		var comprou=/order-received|pedido-recebido/.test(location.href);
		if(instalado||fechou||(/finalizar-compra|carrinho/.test(location.pathname)&&!comprou)||(visitas<2&&!comprou))return;
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

// ===== Apps de produto: a página do produto é o montador =====
// Qual app cada produto usa (chave do glowbos_produtos => tipo, nº de cores, cartela, resumo)
function glowbos_app_config( $pid ) {
	$mapa = array_flip( (array) get_option( 'glowbos_produtos', array() ) );
	$k    = $mapa[ (string) $pid ] ?? '';
	$c    = array(
		'pct50' => array( 'sequencia', 2, 'lisos8', '50 balões de 8"' ), 'pct75' => array( 'sequencia', 3, 'lisos8', '75 balões de 8"' ),
		'pct100' => array( 'sequencia', 4, 'lisos8', '100 balões de 8"' ), 'pct125' => array( 'sequencia', 5, 'lisos8', '125 balões de 8"' ),
		'candy50' => array( 'sequencia', 2, 'candy', '50 balões candy de 8"' ), 'candy75' => array( 'sequencia', 3, 'candy', '75 balões candy de 8"' ), 'candy100' => array( 'sequencia', 4, 'candy', '100 balões candy de 8"' ),
		'kit60' => array( 'sequencia', 3, 'lisos', 'kit 60 peças' ), 'kit80' => array( 'sequencia', 3, 'lisos', 'kit 80 peças' ), 'kit100' => array( 'sequencia', 3, 'lisos', 'kit 100 peças' ), 'kit112' => array( 'sequencia', 4, 'lisos', 'kit 112 peças' ),
		'kit120' => array( 'sequencia', 3, 'lisos', 'kit 120 peças' ), 'kiteco100' => array( 'sequencia', 2, 'lisos', 'kit econômico 100 balões' ),
		'pct5_50' => array( 'quantidade', 0, 'lisos', '50 balões de 5"' ), 'pct7_50' => array( 'quantidade', 0, 'lisos', '50 balões de 7"' ), 'pct9_50' => array( 'quantidade', 0, 'lisos', '50 balões de 9"' ),
		'pct12_25' => array( 'quantidade', 0, 'lisos', '25 balões de 12"' ), 'pct16_12' => array( 'quantidade', 0, 'lisos', '12 balões de 16"' ),
		'metal5_25' => array( 'quantidade', 0, 'metal', '25 balões metalizados de 5"' ),
		'numero' => array( 'numero', 0, '', 'coluna com número' ),
		// 16/10: sets prontos sob encomenda, mesmo orçamento do número (WhatsApp + data + CEP).
		'set_carros_4anos' => array( 'numero', 0, '', 'set pronto Carros, número 4' ), 'set_menina_5anos' => array( 'numero', 0, '', 'set pronto Borboleta Rosê, número 5' ),
		'set_safari_1ano' => array( 'numero', 0, '', 'set pronto Safári, número 1' ), 'set_cha_revelacao' => array( 'numero', 0, '', 'set pronto Chá Revelação' ),
		'bubble' => array( 'bubble', 3, 'lisos', 'bubble personalizado' ),
		// 19/10: mini arco (arco de mesa, 50 balões de 5") e número metalizado de 32" vendido na hora (0 a 9, dourado, prata ou rosa).
		'miniarco' => array( 'sequencia', 3, 'lisos', '50 balões de 5"' ),
		'num32' => array( 'num32', 0, '', 'número metalizado de 32"' ),
		// 19/10: 9" sortido como a Shopee vende (50 em 2 cores, 75 em 3 cores)
		'pct9_50_2c' => array( 'sequencia', 2, 'lisos', '50 balões de 9"' ), 'pct9_75_3c' => array( 'sequencia', 3, 'lisos', '75 balões de 9"' ),
		// 19/10: mesa da festa (pratinhos e guardanapo da Shopee): escolhe a cor e quantos pacotes
		'prato20' => array( 'quantidade', 0, 'pratos', '20 pratinhos de 15 cm' ), 'prato30' => array( 'quantidade', 0, 'pratos30', '30 pratos de 15 cm' ), 'guardanapo' => array( 'quantidade', 0, 'guardanapo', '50 guardanapos' ),
	);
	return $c[ $k ] ?? null;
}
add_action( 'wp_enqueue_scripts', function () {
	if ( function_exists( 'is_product' ) && is_product() && glowbos_app_config( get_queried_object_id() ) ) {
		// versão pela data do arquivo: mudou o app, o navegador baixa de novo sozinho
		$d = get_template_directory();
		wp_enqueue_style( 'glowbos-app', get_template_directory_uri() . '/app.css', array( 'glowbos' ), (string) filemtime( $d . '/app.css' ) );
		wp_enqueue_script( 'glowbos-app', get_template_directory_uri() . '/app.js', array(), (string) filemtime( $d . '/app.js' ), true );
	}
}, 32 );
add_action( 'woocommerce_single_product_summary', function () {
	global $product;
	$c = glowbos_app_config( $product->get_id() );
	if ( ! $c ) {
		return;
	}
	remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_add_to_cart', 30 );
	printf(
		'<div class="gb-app2" id="gbApp2" data-tipo="%s" data-cores="%d" data-paleta="%s" data-resumo="%s" data-preco="%s" data-pid="%d" data-nome="%s" data-img="%s" data-add="%s" data-orc="%s"></div>',
		esc_attr( $c[0] ), (int) $c[1], esc_attr( $c[2] ), esc_attr( $c[3] ), esc_attr( wc_get_price_to_display( $product ) ), (int) $product->get_id(),
		esc_attr( $product->get_name() ), esc_url( get_template_directory_uri() . '/img/' ), esc_url( add_query_arg( 'wc-ajax', 'glowbos_add', home_url( '/' ) ) ), esc_url( add_query_arg( 'wc-ajax', 'glowbos_orcamento', home_url( '/' ) ) )
	);
	printf(
		'<form id="gbForm" method="post" action="%s" style="display:none"><input type="hidden" name="add-to-cart" value="%d"><input type="hidden" name="quantity" value="1"><input type="hidden" name="paleta" value=""><input type="hidden" name="gb_img" value=""></form>',
		esc_url( wc_get_cart_url() ), (int) $product->get_id()
	);
}, 25 );
// foto da montagem enviada pelo app vai junto do item
add_filter( 'woocommerce_add_cart_item_data', function ( $data ) {
	if ( ! empty( $_POST['gb_img'] ) ) {
		$f = glowbos_salva_foto( wp_unslash( $_POST['gb_img'] ) );
		if ( $f ) {
			$data['glowbos_img'] = $f;
		}
	}
	return $data;
}, 11 );
// vários itens de uma vez (pacotes fechados, metalizados), somando ao carrinho
add_action( 'wc_ajax_glowbos_add', function () {
	$itens = json_decode( wp_unslash( $_POST['itens'] ?? '[]' ), true );
	if ( ! is_array( $itens ) || ! WC()->cart ) {
		wp_send_json_error();
	}
	if ( WC()->session && ! WC()->session->has_session() ) {
		WC()->session->set_customer_session_cookie( true );
	}
	foreach ( array_slice( $itens, 0, 40 ) as $it ) {
		$pid = absint( $it['pid'] ?? 0 );
		$q   = max( 1, min( 50, (int) ( $it['q'] ?? 1 ) ) );
		if ( ! $pid || ! glowbos_app_config( $pid ) ) {
			continue;
		}
		WC()->cart->add_to_cart( $pid, $q, 0, array(), array( 'glowbos_paleta' => sanitize_text_field( $it['paleta'] ?? '' ) ) );
	}
	wp_send_json_success( array( 'qtd' => WC()->cart->get_cart_contents_count(), 'carrinho' => wc_get_cart_url() ) );
} );

// Endereços antigos de categoria levam pro nome novo (18 e 19/10).
add_action( 'template_redirect', function () {
	$path = (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH );
	foreach ( array( 'cromados' => 'formatos', 'decorativos' => 'formatos', 'kits-de-arco' => 'decoracao-pronta' ) as $de => $para ) {
		if ( preg_match( '#^/categoria/' . $de . '(/.*)?$#', $path ) ) {
			wp_safe_redirect( home_url( '/categoria/' . $para . '/' ), 301 );
			exit;
		}
	}
} );

// ===== Departamentos: banner no topo, filtros e vitrine =====
function glowbos_departamentos() {
	return array(
		'arcos'            => array( 'Arcos de balões', 'Monte o seu arco escolhendo as cores, ou leve o kit com tudo pronto pra montar.', 'banner_arcos.webp' ),
		'decoracao-pronta' => array( 'Decoração Pronta', 'Kits de arco de 60 a 120 peças e bubble encapsulado, com as cores que você escolher.', 'banner_kits.webp' ),
		'mini-arco'        => array( 'Mini Arco', 'O arco de mesa: 50 balões de 5" nas cores que você escolher, pronto em minutos.', 'banner_miniarco.webp' ),
		'baloes-joy'       => array( 'Balões Joy', 'Balões Joy de 5, 9, 12 e 16 polegadas. Você escolhe as cores.', 'banner_joy.webp' ),
		'pacotes'          => array( 'Pacotes sortidos', '50 a 125 balões de 8" em até 5 cores, na sequência que você montar.', 'banner_pacotes.webp' ),
		'pacotes-fechados' => array( 'Pacotes fechados', 'Uma cor por pacote, do 5" ao 16". Escolha quantos de cada cor.', 'banner_fechados.webp' ),
		'candy-colors'     => array( 'Candy colors', 'Os tons pastel que viraram a cara do chá revelação e da festa infantil.', 'banner_candy.webp' ),
		'bubbles'          => array( 'Bubbles', 'Balão transparente com o nome da festa e balõezinhos coloridos dentro.', 'banner_bubbles.webp' ),
		'formatos'         => array( 'Formatos', 'Metalizados de coração, estrela, bola e safári pro destaque da festa.', 'banner_cromados.webp' ),
		'numeros'          => array( 'Números', 'Número metalizado gigante, de 0 a 9, no estilo da festa.', 'banner_numeros.webp' ),
		'sets-prontos'     => array( 'Sets prontos', 'Número, base de balões, figuras e buquê montados no estilo da festa. Escolha o tema e a idade.', 'banner_sets.webp' ),
		'acessorios'       => array( 'Acessórios', 'Fita, bomba e o que mais precisa pra montar.', 'banner_acessorios.webp' ),
		'mesa-da-festa'    => array( 'Mesa da festa', 'Pratinhos e guardanapos na cor da festa, pra mesa combinar com os balões.', 'banner_mesa.webp' ),
	);
}
add_action( 'wp_head', function () {
	if ( is_product_category() || is_shop() ) {
		echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap" rel="stylesheet">';
	}
} );
add_filter( 'woocommerce_show_page_title', function ( $show ) {
	return ( is_product_category() || is_shop() ) ? false : $show;
} );
remove_action( 'woocommerce_archive_description', 'woocommerce_taxonomy_archive_description', 10 );
function glowbos_dep_topo() {
	if ( ! is_product_category() && ! is_shop() ) {
		return;
	}
	$d    = glowbos_departamentos();
	$slug = is_product_category() ? get_queried_object()->slug : '';
	$c    = $d[ $slug ] ?? array( 'Loja Glowbos', 'Todos os balões, kits e pacotes. Em SP e Grande SP, pago até 12h chega hoje até 21h.', 'banner_loja.webp' );
	$img  = get_template_directory_uri() . '/img/' . $c[2];
	$esc  = in_array( $slug, array( 'pacotes-fechados', 'pacotes', 'sets-prontos' ), true ) ? ' esc' : '';
	$imgm = preg_replace( '#(banner_[a-z]+)\.webp$#', '$1_m.webp', $img );
	$ver  = '?v=' . (int) @filemtime( get_template_directory() . '/img/' . $c[2] );
	$img .= $ver;
	$imgm .= $ver;
	echo '<section class="gb-dep-banner gb-dep2' . $esc . '" style="--img:url(' . esc_url( $img ) . ');--imgm:url(' . esc_url( $imgm ) . ')"><div><small><a href="' . esc_url( home_url( '/' ) ) . '">Início</a> / ' . ( $slug ? '<a href="' . esc_url( home_url( '/loja/' ) ) . '">Loja</a> / ' : '' ) . esc_html( $slug ? get_queried_object()->name : 'Loja' ) . '</small><h1>' . esc_html( $c[0] ) . '</h1><p>' . esc_html( $c[1] ) . '</p></div></section>';
	// atalhos de departamento
	echo '<nav class="gb-dep-nav"><a href="' . esc_url( home_url( '/loja/' ) ) . '"' . ( $slug ? '' : ' class="on"' ) . '>Tudo</a>';
	foreach ( $d as $s => $x ) {
		$t = get_term_by( 'slug', $s, 'product_cat' );
		if ( ! $t || ! $t->count ) {
			continue;
		}
		printf( '<a href="%s"%s>%s</a>', esc_url( get_term_link( $t ) ), $s === $slug ? ' class="on"' : '', esc_html( $t->name ) );
	}
	echo '</nav>';
	if ( 'arcos' === $slug ) {
		glowbos_arco_app();
	}
	if ( 'pacotes' === $slug ) {
		glowbos_pacotes_grade();
	}
}
// 26/10 (relatório etapa 1): Pacotes sortidos = só 8", grade de 2 colunas, nome no meio da foto, sem preço
function glowbos_pacotes_grade() {
	$mapa = (array) get_option( 'glowbos_produtos', array() );
	$h    = '';
	foreach ( array( 'pct50' => array( 50, '2 cores' ), 'pct75' => array( 75, '3 cores' ), 'pct100' => array( 100, '4 cores' ), 'pct125' => array( 125, 'até 5 cores' ) ) as $k => $t ) {
		$p = empty( $mapa[ $k ] ) ? null : wc_get_product( $mapa[ $k ] );
		if ( ! $p ) {
			continue;
		}
		$h .= sprintf( '<a class="pg-c" href="%s"><img src="%s" alt="" loading="lazy"><span class="pg-t"><b>%d balões</b><em>%s</em></span></a>', esc_url( $p->get_permalink() ), esc_url( wp_get_attachment_image_url( $p->get_image_id(), 'large' ) ), $t[0], esc_html( $t[1] ) );
	}
	echo '<style>
.term-pacotes .gb-filtros,.term-pacotes ul.products,.term-pacotes .woocommerce-result-count,.term-pacotes .woocommerce-ordering,.term-pacotes .woocommerce-pagination{display:none!important}
.pg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:720px;margin:24px auto 0}
.pg-c{position:relative;display:block;border-radius:14px;overflow:hidden;background:#f7f3ea;text-decoration:none;color:var(--vinho,#1a1720)}
.pg-c img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .35s}
.pg-c:hover img{transform:scale(1.03)}
.pg-t{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:6px 14px;border-radius:99px;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);text-align:center;white-space:nowrap;font:600 15px/1.2 Inter,sans-serif}
.pg-t b{font-weight:700}
.pg-t em{font-style:normal;color:var(--vinho2,#5c5560)}
.pg-t em::before{content:" · "}
@media (max-width:640px){.pg{gap:8px;margin-top:16px}.pg-c{border-radius:12px}.pg-t{padding:4px 10px;font-size:12.5px}.pg-t em{display:block}.pg-t em::before{content:none}.pg-t{border-radius:10px}}
</style><div class="pg">' . $h . '</div>'; // phpcs:ignore
}
// filtros: tamanho e preço (o WooCommerce entende ?filter_tamanho= e ?min_price/max_price)
add_action( 'woocommerce_before_shop_loop', function () {
	if ( is_product_category( 'numeros' ) ) {
		return;
	}
	$base  = remove_query_arg( array( 'filter_tamanho', 'query_type_tamanho', 'min_price', 'max_price', 'paged' ) );
	$tam   = isset( $_GET['filter_tamanho'] ) ? sanitize_title( wp_unslash( $_GET['filter_tamanho'] ) ) : '';
	$pmax  = isset( $_GET['max_price'] ) ? (int) $_GET['max_price'] : 0;
	echo '<div class="gb-filtros"><div class="gb-f"><span>Tamanho</span>';
	$termos = get_terms( array( 'taxonomy' => 'pa_tamanho', 'hide_empty' => true, 'orderby' => 'slug' ) );
	usort( $termos, function ( $a, $b ) { return (int) $a->slug - (int) $b->slug; } );
	foreach ( $termos as $t ) {
		$on = $tam === $t->slug;
		printf( '<a class="%s" href="%s">%s</a>', $on ? 'on' : '', esc_url( $on ? remove_query_arg( 'filter_tamanho' ) : add_query_arg( 'filter_tamanho', $t->slug, remove_query_arg( 'paged' ) ) ), esc_html( $t->name ) );
	}
	echo '</div><div class="gb-f"><span>Preço</span>';
	foreach ( array( 20 => 'até R$ 20', 40 => 'até R$ 40', 80 => 'até R$ 80' ) as $v => $r ) {
		$on = $pmax === $v;
		printf( '<a class="%s" href="%s">%s</a>', $on ? 'on' : '', esc_url( $on ? remove_query_arg( array( 'min_price', 'max_price' ) ) : add_query_arg( array( 'min_price' => 0, 'max_price' => $v ), remove_query_arg( 'paged' ) ) ), esc_html( $r ) );
	}
	if ( $tam || $pmax ) {
		printf( '<a class="limpa" href="%s">Limpar filtros</a>', esc_url( $base ) );
	}
	echo '</div></div>';
}, 15 );

// produto com app: na vitrine o botão leva pro montador (as cores se escolhem lá)
add_filter( 'woocommerce_loop_add_to_cart_link', function ( $html, $product ) {
	$c = glowbos_app_config( $product->get_id() );
	if ( ! $c ) {
		return $html;
	}
	return sprintf( '<a href="%s" class="button gb-escolher">%s</a>', esc_url( $product->get_permalink() ), 'bubble' === $c[0] ? 'Personalizar' : ( in_array( $c[0], array( 'numero', 'num32' ), true ) ? 'Escolher o número' : ( 'quantidade' === $c[0] ? 'Escolher as cores' : 'Montar as cores' ) ) );
}, 10, 2 );

// ===== Assinatura de novidades (perto do rodapé, em todas as páginas) =====
function glowbos_news_html() {
	$url = esc_url( add_query_arg( 'wc-ajax', 'glowbos_news', home_url( '/' ) ) );
	return '<style>
.gb-news{background:var(--bebe,#fff0f6);padding:34px 0;margin-top:72px}
.gb-news~footer,.gb-news~.gb-foot{margin-top:0!important}
.gb-news-w{max-width:1240px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:20px 40px;flex-wrap:wrap}
.gb-news h3{font:800 24px/1.15 "Inter Tight",sans-serif;letter-spacing:-.02em;margin:0 0 4px;color:var(--vinho,#1a1720)}
.gb-news p{margin:0;font-size:14.5px;color:var(--vinho2,#5c5560)}
.gb-news form{display:flex;gap:8px;flex:1;max-width:460px;min-width:280px}
.gb-news input[type=email]{flex:1;height:48px;border:1.5px solid #ecd9e1;border-radius:10px;padding:0 14px;font:500 15px Inter,sans-serif;background:#fff;min-width:0}
.gb-news input[type=email]:focus{outline:0;border-color:var(--forte,#ff1f7a)}
.gb-news button{height:48px;padding:0 20px;border:0;border-radius:10px;background:var(--vinho,#1a1720);color:#fff;font:700 15px Inter,sans-serif;cursor:pointer;white-space:nowrap}
.gb-news button:hover{background:var(--forte,#ff1f7a)}
.gb-news .ok{font-weight:700;color:#17803d}
.gb-news .hp{position:absolute;left:-9999px}
@media (max-width:640px){.gb-news-w{padding:0 16px}.gb-news form{min-width:0;width:100%;max-width:none}.gb-news h3{font-size:20px}}
</style>
<section class="gb-news"><div class="gb-news-w"><div><h3>Novidades e paletas da semana</h3><p>Lançamentos, temas de época e promoções no seu e-mail. Sem spam.</p></div>
<form id="gbNews" data-url="' . $url . '"><input type="email" name="email" placeholder="Seu e-mail" required autocomplete="email"><input class="hp" type="text" name="site" tabindex="-1" autocomplete="off"><button type="submit">Quero receber</button></form></div></section>
<script>(function(){var f=document.getElementById("gbNews");if(!f)return;f.addEventListener("submit",function(e){e.preventDefault();var b=f.querySelector("button");b.disabled=true;b.textContent="Enviando...";fetch(f.dataset.url,{method:"POST",body:new FormData(f)}).then(function(r){return r.json()}).then(function(j){if(j&&j.success){f.outerHTML="<p class=\"ok\">✓ Pronto! Você vai receber as novidades da Glowbos.</p>"}else{b.disabled=false;b.textContent="Quero receber";var i=f.querySelector("input[type=email]");i.focus();i.style.borderColor="#d7262e"}}).catch(function(){b.disabled=false;b.textContent="Quero receber"})})})();</script>';
}
add_action( 'wc_ajax_glowbos_news', function () {
	$email = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) );
	if ( ! empty( $_POST['site'] ) || ! is_email( $email ) ) {
		wp_send_json_error();
	}
	$lista = (array) get_option( 'glowbos_news', array() );
	if ( ! isset( $lista[ $email ] ) ) {
		$lista[ $email ] = current_time( 'mysql' );
		update_option( 'glowbos_news', $lista, false );
		wp_mail( 'contato@glowbos.com.br', '[Glowbos] Nova assinatura de novidades', $email . "\n" . count( $lista ) . ' assinantes no total.' );
	}
	wp_send_json_success();
} );

// número sob encomenda: mostra "Sob encomenda" no lugar do preço vazio
add_filter( 'woocommerce_get_price_html', function ( $html, $product ) {
	return ( '' === $product->get_price() && glowbos_app_config( $product->get_id() ) ) ? '<span class="gb-sob">Sob encomenda</span>' : $html;
}, 10, 2 );

// ===== Menu da loja: "Produtos" abre um painel com todas as categorias, os produtos e um destaque =====
function glowbos_mega_html() {
	$deps  = glowbos_departamentos();
	$mapa  = (array) get_option( 'glowbos_produtos', array() );
	$cols  = '';
	$paine = '';
	$i     = 0;
	foreach ( $deps as $slug => $d ) {
		$t = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $t || ! $t->count ) {
			continue;
		}
		$ps = wc_get_products( array( 'category' => array( $slug ), 'limit' => 6, 'status' => 'publish', 'orderby' => 'price', 'order' => 'ASC' ) );
		$cols .= sprintf( '<a href="%s" data-gm="%d"%s>%s <small>%d</small></a>', esc_url( get_term_link( $t ) ), $i, $i ? '' : ' class="on"', esc_html( $t->name ), (int) $t->count );
		$it = '';
		foreach ( $ps as $p ) {
			$img = wp_get_attachment_image_url( $p->get_image_id(), 'thumbnail' );
			$it .= sprintf( '<a class="gm-p" href="%s">%s<span><b>%s</b><em>%s</em></span></a>', esc_url( $p->get_permalink() ), $img ? '<img src="' . esc_url( $img ) . '" alt="" loading="lazy">' : '<i></i>', esc_html( $p->get_name() ), wp_kses_post( $p->get_price_html() ) );
		}
		$paine .= sprintf( '<div class="gm-g%s" data-gm="%d"><div class="gm-gt"><b>%s</b><a href="%s">Ver tudo →</a></div><div class="gm-ps">%s</div></div>', $i ? '' : ' on', $i, esc_html( $d[0] ), esc_url( get_term_link( $t ) ), $it );
		$i++;
	}
	$dest = ! empty( $mapa['pct75'] ) ? wc_get_product( $mapa['pct75'] ) : null;
	$card = '';
	if ( $dest ) {
		$card = sprintf( '<a class="gm-dest" href="%s"><span class="gm-tag">Mais vendido</span><img src="%s" alt=""><b>%s</b><small>Você escolhe 3 cores e a sequência</small><span class="gm-pr">%s <em>Montar →</em></span></a>', esc_url( $dest->get_permalink() ), esc_url( wp_get_attachment_image_url( $dest->get_image_id(), 'medium' ) ), esc_html( $dest->get_name() ), wp_kses_post( $dest->get_price_html() ) );
	}
	$links = '';
	foreach ( array( 'arcos' => 'Arcos', 'mini-arco' => 'Mini Arco', 'decoracao-pronta' => 'Decoração Pronta', 'pacotes' => 'Pacotes sortidos', 'acessorios' => 'Acessórios' ) as $s => $n ) {
		$on     = function_exists( 'is_product_category' ) && is_product_category( $s );
		$links .= sprintf( '<a class="gm-l%s" href="%s">%s</a>', $on ? ' on' : '', esc_url( home_url( '/categoria/' . $s . '/' ) ), $n );
	}
	return '<nav class="gm"><div class="gm-item"><button type="button" class="gm-btn" aria-expanded="false">Produtos <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button>'
		. '<div class="gm-pan"><div class="gm-in"><div class="gm-cats">' . $cols . '<a class="gm-all" href="' . esc_url( home_url( '/loja/' ) ) . '">Ver a loja inteira</a></div><div class="gm-mid">' . $paine . '</div>' . $card . '</div></div></div>' . $links . '<button type="button" class="gm-cta" data-prazo><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>Chega hoje? Calcule o frete</button></nav>'
		. '<style>
.gm{display:flex;align-items:center;gap:2px;flex:1;justify-content:center}
.gm-l,.gm-btn{font:600 14.5px Inter,sans-serif;padding:9px 14px;border-radius:10px;text-decoration:none;color:var(--vinho,#1a1720);background:none;border:0;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.gm-l:hover,.gm-btn:hover,.gm-item.open .gm-btn{background:var(--bebe,#fff0f6)}
.gm-l.on{color:var(--forte,#ff1f7a)}
.gm-cta{display:inline-flex;align-items:center;gap:8px;margin-left:8px;height:38px;padding:0 14px;border:1.5px solid var(--forte,#ff1f7a);border-radius:10px;background:#fff;color:var(--forte,#ff1f7a);font:700 14px Inter,sans-serif;cursor:pointer;white-space:nowrap}
.gm-cta:hover{background:var(--forte,#ff1f7a);color:#fff}
@media (max-width:1180px){.gm-cta{display:none}}
.gm-item.open .gm-btn svg{transform:rotate(180deg)}
.gm-pan{position:absolute;left:0;right:0;top:100%;background:#fff;border-top:1px solid #f1e6ea;box-shadow:0 24px 40px rgba(26,23,32,.10);opacity:0;visibility:hidden;transform:translateY(-6px);transition:.18s;z-index:60}
.gm-item.open .gm-pan{opacity:1;visibility:visible;transform:none}
.gm-in{max-width:1240px;margin:0 auto;padding:22px 24px 26px;display:grid;grid-template-columns:220px minmax(0,1fr) 260px;gap:26px;text-align:left}
.gm-cats{display:flex;flex-direction:column;gap:2px;border-right:1px solid #f1eef0;padding-right:16px}
.gm-cats a{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:9px;font:600 14.5px Inter,sans-serif;color:var(--vinho2,#5c5560);text-decoration:none}
.gm-cats a small{font-size:12px;color:#b8b1bb;font-weight:600}
.gm-cats a.on,.gm-cats a:hover{background:#f7f6f8;color:var(--vinho,#1a1720)}
.gm-cats a.gm-all{margin-top:8px;color:var(--forte,#ff1f7a);background:none}
.gm-g{display:none}.gm-g.on{display:block}
.gm-gt{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.gm-gt b{font:800 19px "Inter Tight",sans-serif;letter-spacing:-.02em;color:var(--vinho,#1a1720)}
.gm-gt a{font:600 13.5px Inter,sans-serif;color:var(--vinho2,#5c5560);text-decoration:none}
.gm-gt a:hover{color:var(--forte,#ff1f7a)}
.gm-ps{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}
.gm-p{display:flex;align-items:center;gap:12px;padding:8px;border-radius:10px;text-decoration:none;color:var(--vinho,#1a1720)}
.gm-p:hover{background:#f7f6f8}
.gm-p img,.gm-p i{width:52px;height:52px;border-radius:9px;object-fit:cover;flex:none;background:#f7f3ea}
.gm-p b{display:block;font:600 13.5px/1.25 Inter,sans-serif}
.gm-p em{font-style:normal;font-size:13px;font-weight:700;color:var(--forte,#ff1f7a)}
.gm-p em del{color:#b8b1bb;font-weight:500}
.gm-dest{position:relative;display:flex;flex-direction:column;gap:4px;padding:12px;border-radius:14px;background:#f7f3ea;text-decoration:none;color:var(--vinho,#1a1720)}
.gm-dest img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;margin-bottom:6px}
.gm-dest b{font:700 14.5px/1.25 Inter,sans-serif}
.gm-dest small{font-size:12.5px;color:var(--vinho2,#5c5560)}
.gm-pr{display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-weight:800;color:var(--forte,#ff1f7a)}
.gm-pr em{font-style:normal;font-size:13px;color:var(--vinho,#1a1720)}
.gm-tag{position:absolute;top:20px;left:20px;background:#fff;font:700 11.5px Inter,sans-serif;padding:4px 9px;border-radius:99px}
@media (max-width:1100px){.gm-in{grid-template-columns:200px minmax(0,1fr)}.gm-dest{display:none}}
@media (max-width:900px){.gm{display:none!important}}
.gm-l,.gm-btn{white-space:nowrap}
@media (max-width:1280px){.gm-l,.gm-btn{padding:9px 10px;font-size:14px}}
</style>'
		. '<script>(function(){var it=document.currentScript.parentNode.querySelector(".gm-item");if(!it||it.dataset.ok)return;it.dataset.ok=1;var b=it.querySelector(".gm-btn"),t;function ab(){clearTimeout(t);it.classList.add("open");b.setAttribute("aria-expanded","true")}function fe(){t=setTimeout(function(){it.classList.remove("open");b.setAttribute("aria-expanded","false")},160)}
if(matchMedia("(hover:hover)").matches){it.addEventListener("mouseenter",ab);it.addEventListener("mouseleave",fe)}b.addEventListener("click",function(){it.classList.contains("open")?(it.classList.remove("open"),b.setAttribute("aria-expanded","false")):ab()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")fe()});
it.querySelectorAll(".gm-cats a[data-gm]").forEach(function(a){a.addEventListener("mouseenter",function(){it.querySelectorAll(".gm-cats a").forEach(function(x){x.classList.remove("on")});a.classList.add("on");it.querySelectorAll(".gm-g").forEach(function(g){g.classList.toggle("on",g.dataset.gm===a.dataset.gm)})})})})();</script>';
}

// ===== App do arco na página de Arcos: escolhe pela foto, ajusta os metros, a lista vira pacotes no carrinho =====
add_action( 'wp_enqueue_scripts', function () {
	if ( function_exists( 'is_product_category' ) && is_product_category( 'arcos' ) ) {
		$v = wp_get_theme()->get( 'Version' ) . '.4';
		wp_enqueue_style( 'glowbos-arco', get_template_directory_uri() . '/arco.css', array( 'glowbos' ), $v );
		wp_enqueue_script( 'glowbos-arco', get_template_directory_uri() . '/arco.js', array(), $v, true );
	}
}, 33 );
function glowbos_arco_app() {
	$img = get_template_directory_uri() . '/img/';
	$add = add_query_arg( 'wc-ajax', 'glowbos_lista', home_url( '/' ) );
	?>
	<section class="gb-arco" id="gbArco" data-img="<?php echo esc_url( $img ); ?>" data-add="<?php echo esc_url( $add ); ?>">
		<div class="ma-hd"><div><b>Monte seu arco</b><p>Escolha pela foto, ajuste o tamanho da parede e a gente calcula os balões, com 10% de reserva.</p></div></div>
		<div class="ma-tabs" id="maTabs"></div>
		<div class="ma">
			<div class="ma-foto" id="maFoto"><img class="at" id="maImg" src="<?php echo esc_url( $img . 'arco_09_candy_algodao.webp' ); ?>" alt="Arco de balões"><span class="ma-mont" id="maMont">Arraste os metros e veja o arco crescer</span></div>
			<div class="ma-cfg">
				<div class="ma-arcos" id="maArcos"></div>
				<div class="ma-box"><div class="ma-sl"><span>Tamanho do arco</span><b id="maMv">3 m</b></div><input id="maM" type="range" min="2" max="5" step=".5" value="3" aria-label="Tamanho do arco em metros"><div class="ma-esc"><span>2 m</span><span>5 m</span></div></div>
				<div class="ma-box" id="maTab"></div>
				<div class="ma-buy"><div><small>Sua lista sai por</small><b id="maTot">R$ 0,00</b><small id="maPk"></small></div></div>
				<div class="ma-acoes"><button class="btn pri" id="maComprar">Comprar esta lista</button><button class="btn lin" id="maTrocar">Trocar as cores</button></div>
				<div class="ma-cores" id="maCores" hidden></div>
				<p class="mnote">Em São Paulo e Grande SP, pedido pago até 12h chega hoje até 21h.</p>
			</div>
		</div>
	</section>
	<div class="gb-arco-hd"><span class="gb-eb">Novidades</span><h2 class="gb-arco-sub">Ou leve o kit pronto</h2><p>Kits com tudo separado pra montar em casa, com as cores que você escolher.</p></div>
	<?php
}
// lista de pacotes do arco: soma ao carrinho (não apaga o que já está lá)
add_action( 'wc_ajax_glowbos_lista', function () {
	$itens = json_decode( wp_unslash( $_POST['itens'] ?? '[]' ), true );
	$ids   = (array) get_option( 'glowbos_produtos', array() );
	if ( ! is_array( $itens ) || ! WC()->cart ) {
		wp_send_json_error();
	}
	if ( WC()->session && ! WC()->session->has_session() ) {
		WC()->session->set_customer_session_cookie( true );
	}
	$ok = 0;
	foreach ( array_slice( $itens, 0, 10 ) as $it ) {
		$k = sanitize_key( $it['k'] ?? '' );
		if ( ! in_array( $k, array( 'pct5_50', 'pct9_50', 'pct12_25', 'pct16_12', 'fita' ), true ) || empty( $ids[ $k ] ) ) {
			continue;
		}
		$extra = empty( $it['paleta'] ) ? array() : array( 'glowbos_paleta' => sanitize_text_field( $it['paleta'] ) );
		$ok   += WC()->cart->add_to_cart( (int) $ids[ $k ], max( 1, min( 99, (int) ( $it['q'] ?? 1 ) ) ), 0, array(), $extra ) ? 1 : 0;
	}
	$ok ? wp_send_json_success( array( 'carrinho' => wc_get_cart_url() ) ) : wp_send_json_error();
} );

// ===== Guia "Monte sua festa": CEP + todas as linhas, aberto de qualquer página (o chamariz da loja) =====
function glowbos_guia_linhas() {
	$mapa = (array) get_option( 'glowbos_produtos', array() );
	$prod = function ( $k ) use ( $mapa ) {
		return empty( $mapa[ $k ] ) ? '' : get_permalink( $mapa[ $k ] );
	};
	$cat = function ( $s ) {
		return home_url( '/categoria/' . $s . '/' );
	};
	// [nome, imagem, frase, a partir de, link do app, rótulo do app, link da categoria]
	return array(
		'arcos'    => array( 'Arcos', 'arco_10_candy_morango.webp', 'Escolha pela foto, diga os metros e a gente calcula os balões.', 'R$ 35,99', $cat( 'arcos' ) . '#gbArco', 'Montar meu arco', $cat( 'arcos' ) ),
		'kits'     => array( 'Decoração Pronta', 'kit_503.webp', 'De 60 a 120 peças, com as cores que você escolher.', 'R$ 31,99', $prod( 'kit100' ), 'Montar meu kit', $cat( 'decoracao-pronta' ) ),
		'sortidos' => array( 'Pacotes sortidos', 'pack_azul_verm_amar.webp', '50 a 125 balões de 8" em até 5 cores, na sua sequência.', 'R$ 17,50', $prod( 'pct75' ), 'Montar meu pacote', $cat( 'pacotes' ) ),
		'fechados' => array( 'Pacotes fechados', 'emb_lilas.webp', 'Uma cor por pacote, do 5" ao 16". Escolha quantos de cada.', 'R$ 8,99', $prod( 'pct9_50' ), 'Escolher as cores', $cat( 'pacotes-fechados' ) ),
		'candy'    => array( 'Candy colors', 'pack_candy.webp', 'Os tons pastel do chá revelação e da festa infantil.', 'R$ 19,87', $prod( 'candy75' ), 'Montar candy', $cat( 'candy-colors' ) ),
		'formatos' => array( 'Formatos', 'premium_4_cromado.webp', 'Metalizados de coração, estrela, bola e safári.', 'R$ 14,98', $prod( 'metal5_25' ), 'Escolher as cores', $cat( 'formatos' ) ),
		'numeros'  => array( 'Números', 'num_rose_5.webp', 'Número gigante de 0 a 9 sobre coluna de balões.', 'sob encomenda', $prod( 'numero' ), 'Escolher o número', $cat( 'numeros' ) ),
		'bubbles'  => array( 'Bubbles', 'cena_04_bubble_alice.webp', 'Balão transparente com o nome e balõezinhos dentro.', 'sob encomenda', $prod( 'bubble' ), 'Personalizar', $cat( 'bubbles' ) ),
	);
}
add_action( 'wp_footer', function () {
	$img = get_template_directory_uri() . '/img/';
	$L   = glowbos_guia_linhas();
	?>
<style>
.gg-fab{position:fixed;right:20px;bottom:20px;z-index:58;display:flex;align-items:center;gap:10px;height:56px;padding:0 22px 0 10px;border:0;border-radius:99px;background:linear-gradient(135deg,var(--berry,#b0124f),var(--pink,#ff1f7a));color:#fff;font:800 15px Inter,sans-serif;cursor:pointer;box-shadow:0 14px 30px rgba(176,18,79,.35);overflow:visible;animation:ggpulse 2.4s ease-in-out infinite}
.gg-fab i{width:38px;height:38px;border-radius:50%;background:#fff;display:grid;place-items:center;font-style:normal;flex:none}
.gg-fab i svg{width:21px;height:21px;color:var(--berry,#b0124f)}
.gg-fab small{display:block;font-weight:600;font-size:11.5px;opacity:.92;text-align:left}
.gg-fab .bl{position:absolute;width:30px;bottom:30px;opacity:0;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(0,0,0,.15));animation:ggsobe 4.2s ease-out infinite}
.gg-fab .bl.b1{left:18px;animation-delay:0s}.gg-fab .bl.b2{left:46%;width:24px;animation-delay:1.4s}.gg-fab .bl.b3{right:22px;width:27px;animation-delay:2.8s}
@keyframes ggsobe{0%{transform:translateY(10px) scale(.6) rotate(-6deg);opacity:0}15%{opacity:1}70%{opacity:1}100%{transform:translateY(-46px) scale(1) rotate(8deg);opacity:0}}
@keyframes ggpulse{0%,100%{box-shadow:0 14px 30px rgba(176,18,79,.35),0 0 0 0 rgba(255,31,122,.35)}50%{box-shadow:0 14px 30px rgba(176,18,79,.35),0 0 0 10px rgba(255,31,122,0)}}
@media (prefers-reduced-motion:reduce){.gg-fab,.gg-fab .bl{animation:none}.gg-fab .bl{display:none}}
.gg-fab{right:22px;width:290px;height:56px;box-sizing:border-box}
@media (min-width:761px){.wpp{width:290px;height:56px;box-sizing:border-box;bottom:22px!important;right:22px!important}.gg-fab{bottom:20px;transition:transform .7s cubic-bezier(.22,1,.36,1),opacity .5s ease!important;will-change:transform}.mostra-wpp .gg-fab{transform:translateY(-70px)}.wpp{transition:opacity .6s ease,transform .7s cubic-bezier(.22,1,.36,1)!important}}
.gg-fab,.wpp{transition:opacity .3s,transform .3s}
body.no-rodape .gg-fab,body.no-rodape .wpp{opacity:0!important;pointer-events:none!important}
.gg-v{position:fixed;inset:0;background:rgba(29,26,31,.45);opacity:0;pointer-events:none;transition:.3s;z-index:70}
.gg{position:fixed;top:0;right:0;bottom:0;width:min(520px,100%);background:#fff;z-index:71;transform:translateX(105%);transition:.38s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;font-family:Inter,sans-serif;color:var(--vinho,#1a1720)}
.gg-on .gg-v{opacity:1;pointer-events:auto}.gg-on .gg{transform:none}
.gg-h{display:flex;justify-content:space-between;align-items:flex-start;padding:22px 24px 12px}
.gg-h b{display:block;font:800 25px/1.1 "Inter Tight",sans-serif;letter-spacing:-.02em}
.gg-h small{display:block;font-size:13.5px;color:var(--vinho2,#5c5560);margin-top:4px}
.gg-h button{width:40px;height:40px;border:0;border-radius:10px;background:var(--bebe,#fff0f6);font-size:18px;cursor:pointer;flex:none}
.gg-b{flex:1;overflow:auto;padding:0 24px 28px}
.gg-cep{display:flex;gap:8px}
.gg-cep input{flex:1;height:50px;border:1.5px solid #e6e1e4;border-radius:12px;padding:0 14px;font:600 16px Inter,sans-serif;min-width:0}
.gg-cep input:focus{outline:0;border-color:var(--forte,#ff1f7a)}
.gg-cep button{height:50px;padding:0 18px;border:0;border-radius:12px;background:var(--vinho,#1a1720);color:#fff;font:700 15px Inter,sans-serif;cursor:pointer}
.gg-r{margin:10px 0 0;font-weight:800;font-size:15px;min-height:20px}.gg-r.ok{color:var(--forte,#ff1f7a)}
.gg-q{margin:20px 0 12px;font:800 19px "Inter Tight",sans-serif;letter-spacing:-.01em}
.gg-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gg-g button{border:1.5px solid #ece7ea;background:#fff;border-radius:12px;padding:6px 6px 8px;cursor:pointer;text-align:left;font:700 12.5px/1.2 Inter,sans-serif;color:var(--vinho,#1a1720);transition:.15s}
.gg-g button img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;margin-bottom:6px;display:block;background:#f7f3ea}
.gg-g button em{display:block;font-style:normal;font-weight:600;font-size:11px;color:var(--vinho2,#5c5560);margin-top:2px}
.gg-g button:hover{border-color:#d9cdd3}
.gg-g button.on{border-color:var(--forte,#ff1f7a);box-shadow:0 0 0 3px #ffd3e3}
.gg-d{margin-top:16px;padding:16px;border-radius:14px;background:#f7f6f8}.gg-d[hidden]{display:none}
.gg-d b{display:block;font:800 18px "Inter Tight",sans-serif}
.gg-d p{margin:4px 0 12px;font-size:14px;color:var(--vinho2,#5c5560)}
.gg-d .gg-a{display:flex;gap:8px}
.gg-d .gg-a a{flex:1;display:flex;align-items:center;justify-content:center;height:48px;border-radius:11px;font:800 14.5px Inter,sans-serif;text-decoration:none}
.gg-d .gg-a a.p{background:var(--forte,#ff1f7a);color:#fff}
.gg-d .gg-a a.s{background:#fff;color:var(--vinho,#1a1720);border:1.5px solid var(--vinho,#1a1720)}
.gg-n{font-size:12.5px;color:var(--vinho2,#5c5560);margin:14px 0 0}
@media (max-width:640px){.gg{top:auto;left:0;width:100%;max-height:92svh;border-radius:18px 18px 0 0;transform:translateY(105%)}.gg-h{padding:18px 18px 10px}.gg-b{padding:0 18px 22px}.gg-g{gap:6px}.gg-g button{font-size:11.5px;padding:5px 5px 7px}.gg-g button em{display:none}.gg-fab{left:12px;bottom:12px;height:48px;font-size:14px}.gg-fab small{display:none}}
body.gg-on{overflow:hidden}
@media (max-width:640px){.mbar~.gg-fab{display:none}}
</style>
<button type="button" class="gg-fab" data-prazo aria-label="Chega hoje? Calcule o frete"><img class="bl b1" src="<?php echo esc_url( $img ); ?>b_rosa.webp" alt=""><img class="bl b2" src="<?php echo esc_url( $img ); ?>b_lilas.webp" alt=""><img class="bl b3" src="<?php echo esc_url( $img ); ?>b_dourado.webp" alt=""><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg></i><span>Chega hoje?<small>Calcule o frete pro seu CEP</small></span></button>
<div class="gg-v" id="ggV"></div>
<aside class="gg" id="gg" aria-hidden="true" aria-label="Calcule o frete">
	<div class="gg-h"><div><b>Chega hoje? Calcule o frete</b><small>Em SP e Grande SP, pago até 12h chega hoje até 21h. Depois das 12h, amanhã até 21h.</small></div><button type="button" id="ggX" aria-label="Fechar">✕</button></div>
	<div class="gg-b">
		<form class="gg-cep" id="ggCep"><input inputmode="numeric" maxlength="9" placeholder="Digite seu CEP" aria-label="CEP" autocomplete="postal-code"><button>Ver prazo</button></form>
		<p class="gg-r" id="ggR"></p>
		<p class="gg-q">O que você está buscando?</p>
		<div class="gg-g" id="ggG">
			<?php foreach ( $L as $k => $l ) : ?>
				<button type="button" data-l="<?php echo esc_attr( $k ); ?>"><img src="<?php echo esc_url( $img . $l[1] ); ?>" alt="" loading="lazy"><?php echo esc_html( $l[0] ); ?><em><?php echo esc_html( 'sob encomenda' === $l[3] ? 'sob encomenda' : 'a partir de ' . $l[3] ); ?></em></button>
			<?php endforeach; ?>
		</div>
		<?php foreach ( $L as $k => $l ) : ?>
			<div class="gg-d" data-d="<?php echo esc_attr( $k ); ?>" hidden><b><?php echo esc_html( $l[0] ); ?></b><p><?php echo esc_html( $l[2] ); ?></p><div class="gg-a"><a class="p" href="<?php echo esc_url( $l[4] ? $l[4] : $l[6] ); ?>"><?php echo esc_html( $l[5] ); ?> →</a><a class="s" href="<?php echo esc_url( $l[6] ); ?>">Ver todos</a></div></div>
		<?php endforeach; ?>
		<p class="gg-n">Mesma loja da Shopee, mesmo preço · 4,9★ com 67 mil avaliações</p>
	</div>
</aside>
<script>
(function(){var g=document.getElementById('gg');if(!g||g.dataset.ok)return;g.dataset.ok=1;var q=function(s){return g.querySelector(s)};
var abre=function(e){if(e)e.preventDefault();document.body.classList.add('gg-on');g.setAttribute('aria-hidden','false');setTimeout(function(){var i=q('#ggCep input');if(!i.value&&matchMedia('(hover:hover)').matches)i.focus()},380)};
var fecha=function(){document.body.classList.remove('gg-on');g.setAttribute('aria-hidden','true')};
document.addEventListener('click',function(e){if(e.target.closest('[data-prazo]'))abre(e)});
document.getElementById('ggV').onclick=fecha;q('#ggX').onclick=fecha;document.addEventListener('keydown',function(e){if(e.key==='Escape')fecha()});
var inp=q('#ggCep input'),r=q('#ggR');try{var c=localStorage.getItem('glowbos_cep');if(c)inp.value=c}catch(x){}
inp.addEventListener('input',function(){var d=inp.value.replace(/\D/g,'').slice(0,8);inp.value=d.length>5?d.slice(0,5)+'-'+d.slice(5):d});
function prazo(){var d=inp.value.replace(/\D/g,'');if(d.length!==8){r.className='gg-r';r.textContent='Digite os 8 números do CEP.';return}
try{localStorage.setItem('glowbos_cep',inp.value)}catch(x){}var f=window.gbFrete(d);r.className=f.ok?'gg-r ok':'gg-r';r.textContent=f.msg}
q('#ggCep').onsubmit=function(e){e.preventDefault();prazo()};if(inp.value)prazo();
q('#ggG').onclick=function(e){var b=e.target.closest('button');if(!b)return;g.querySelectorAll('#ggG button').forEach(function(x){x.classList.toggle('on',x===b)});
g.querySelectorAll('.gg-d').forEach(function(d){d.hidden=d.dataset.d!==b.dataset.l});var d=q('.gg-d[data-d="'+b.dataset.l+'"]');d.scrollIntoView({behavior:'smooth',block:'nearest'})};
if(location.hash==='#monte-sua-festa')abre();
var rf=document.querySelector('.rf');if(rf&&'IntersectionObserver' in window){new IntersectionObserver(function(es){document.body.classList.toggle('no-rodape',es[0].isIntersecting)},{rootMargin:'0px 0px -40px 0px'}).observe(rf)}})();
</script>
	<?php
}, 30 );

// ===== Rodapé único (home e páginas): links da loja, ajuda, contato e selos de compra segura =====
function glowbos_rodape_html() {
	$ic  = get_template_directory_uri() . '/img/D_icone.webp';
	$svg = function ( $d ) {
		return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' . $d . '</svg>';
	};
	$cats = '';
	foreach ( array( 'arcos' => 'Arcos', 'decoracao-pronta' => 'Decoração Pronta', 'mini-arco' => 'Mini Arco', 'baloes-joy' => 'Balões Joy', 'pacotes' => 'Pacotes sortidos', 'pacotes-fechados' => 'Pacotes fechados', 'candy-colors' => 'Candy colors', 'formatos' => 'Formatos', 'numeros' => 'Números', 'bubbles' => 'Bubbles', 'sets-prontos' => 'Sets prontos', 'mesa-da-festa' => 'Mesa da festa' ) as $s => $n ) {
		$cats .= '<a href="' . esc_url( home_url( '/categoria/' . $s . '/' ) ) . '">' . esc_html( $n ) . '</a>';
	}
	$selos = array(
		array( $svg( '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>' ), 'Compra segura', 'site com SSL, dados protegidos' ),
		array( $svg( '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>' ), 'Mercado Pago', 'Pix e cartão em até 3x' ),
		array( $svg( '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>' ), '4,9 de 5 na Shopee', '67 mil avaliações · ver ↗' ),
		array( $svg( '<path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>' ), 'Chega hoje até 21h', 'SP e Grande SP, pago até 12h' ),
	);
	$sh = '';
	foreach ( $selos as $n => $s ) {
		$tag = 2 === $n ? 'a href="https://shopee.com.br/shop/414535277" target="_blank" rel="noopener"' : 'div';
		$sh .= '<' . $tag . ' class="rf-s"><i>' . $s[0] . '</i><span><b>' . esc_html( $s[1] ) . '</b>' . esc_html( $s[2] ) . '</span></' . ( 2 === $n ? 'a' : 'div' ) . '>';
	}
	return '<style>
.rf{background:#141216!important;color:#fff;font-family:Inter,sans-serif;margin:0!important;padding:0!important}
.rf a{color:inherit;text-decoration:none}
.rf-w{max-width:1240px;margin:0 auto;padding:0 24px}
.rf-selos{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:30px 0;border-bottom:1px solid rgba(255,255,255,.1)}
.rf-s:hover{border-color:rgba(255,127,179,.6)}
.rf-s{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid rgba(255,255,255,.12);border-radius:12px}
.rf-s i{width:40px;height:40px;border-radius:10px;background:rgba(255,31,122,.16);color:#ff7fb3;display:grid;place-items:center;flex:none}
.rf-s i svg{width:21px;height:21px}
.rf-s span{font-size:12.5px;color:rgba(255,255,255,.65);line-height:1.35}
.rf-s b{display:block;font:700 15px Inter,sans-serif;color:#fff}
.rf-g{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:30px;padding:40px 0 30px}
.rf-g h5{font:700 15px Inter,sans-serif;margin:0 0 12px;color:#fff}
.rf-g a{display:block;color:rgba(255,255,255,.7);margin:7px 0;font-size:14px}
.rf-g a:hover{color:#ff7fb3}
.rf-m img{width:64px;border-radius:12px;margin-bottom:12px}
.rf-m p{color:rgba(255,255,255,.7);font-size:14px;line-height:1.5;margin:0 0 14px;max-width:300px}
.rf-pg{display:flex;flex-wrap:wrap;gap:6px}
.rf-pg span{font:700 11.5px Inter,sans-serif;padding:5px 9px;border-radius:6px;background:#fff;color:#141216}
.rf-b{display:flex;justify-content:space-between;gap:10px 24px;flex-wrap:wrap;padding:18px 0 26px;border-top:1px solid rgba(255,255,255,.1);font-size:12.5px;color:rgba(255,255,255,.55)}
@media (max-width:980px){.rf-selos{grid-template-columns:1fr 1fr}.rf-g{grid-template-columns:1fr 1fr}}
@media (max-width:560px){.rf-w{padding:0 16px}.rf-selos{gap:8px;padding:22px 0}.rf-s{padding:10px;gap:10px}.rf-s i{width:34px;height:34px}.rf-s b{font-size:13.5px}.rf-s span{font-size:11.5px}.rf-g{gap:22px}.rf-m{grid-column:1/-1}}
</style>
<footer class="rf"><div class="rf-w">
<div class="rf-selos">' . $sh . '</div>
<div class="rf-g">
<div class="rf-m"><img src="' . esc_url( $ic ) . '" alt="Glowbos"><p>Balões e festa com cara de sonho. Em São Paulo e Grande SP, chega no mesmo dia.</p><div class="rf-pg"><span>Pix</span><span>Visa</span><span>Mastercard</span><span>Elo</span><span>Mercado Pago</span></div></div>
<div><h5>Loja</h5>' . $cats . '</div>
<div><h5>Ajuda</h5><a href="/como-montar/">Como montar seu arco</a><a href="/entrega-e-frete/">Entrega e frete</a><a href="/trocas-e-devolucoes/">Trocas e devoluções</a><a href="/perguntas-frequentes/">Perguntas frequentes</a><a href="/acompanhar-pedido/">Acompanhar pedido</a><a href="/minha-conta/">Minha conta</a></div>
<div><h5>Fale com a gente</h5><a href="https://wa.me/5511945231106" target="_blank" rel="noopener">WhatsApp (11) 94523-1106</a><a href="https://instagram.com/glowbosbaloes" target="_blank" rel="noopener">Instagram @glowbosbaloes</a><a href="mailto:contato@glowbos.com.br">contato@glowbos.com.br</a><a href="/sobre/">Sobre a Glowbos</a><a href="/politica-de-privacidade/">Privacidade</a><a href="/termos-de-uso/">Termos de uso</a></div>
</div>
<div class="rf-b"><span>© 2026 Glowbos · Mayara Festas e Decorações LTDA · CNPJ 45.147.944/0001-24 · Santo André/SP</span><a href="https://shopee.com.br/shop/414535277" target="_blank" rel="noopener">Mesma loja da Shopee ↗</a></div>
</div></footer>';
}

// ===== Menu do celular: barra branca de ícones embaixo (no lugar das faixas rosas) =====
add_action( 'wp_footer', function () {
	$q   = ( function_exists( 'WC' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;
	$svg = function ( $d ) {
		return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' . $d . '</svg>';
	};
	$on  = function ( $c ) {
		return $c ? ' class="on"' : '';
	};
	$home = is_front_page();
	$loja = function_exists( 'is_woocommerce' ) && ( is_shop() || is_product_category() || is_product() );
	$cart = function_exists( 'is_cart' ) && is_cart();
	$conta = function_exists( 'is_account_page' ) && is_account_page();
	?>
<style>
.mb{display:none}
@media (max-width:760px){
.mb{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:60;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-top:1px solid #efe9ec;padding:6px 4px calc(6px + env(safe-area-inset-bottom));font-family:Inter,sans-serif}
.mb a,.mb button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0;background:none;border:0;color:#77707a;font:600 10.5px Inter,sans-serif;text-decoration:none;position:relative;cursor:pointer}
.mb svg{width:23px;height:23px}
.mb .on{color:var(--vinho,#1a1720)}
.mb .on::before{content:"";position:absolute;top:-6px;width:22px;height:2.5px;border-radius:2px;background:var(--forte,#ff1f7a)}
.mb .mb-c{color:var(--forte,#ff1f7a)}
.mb .mb-c i{width:44px;height:44px;margin-top:-18px;border-radius:50%;background:#fff;border:1.5px solid #f3d3e0;display:grid;place-items:center;box-shadow:0 6px 16px rgba(26,23,32,.10)}
.mb em{position:absolute;top:0;left:calc(50% + 6px);min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:var(--forte,#ff1f7a);color:#fff;font:800 10px/17px Inter,sans-serif;font-style:normal;text-align:center}
body{padding-bottom:calc(64px + env(safe-area-inset-bottom))}
.mbar,.gg-fab{display:none!important}
.wpp{bottom:calc(76px + env(safe-area-inset-bottom))!important}
}
</style>
<nav class="mb" aria-label="Menu">
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>"<?php echo $on( $home ); // phpcs:ignore ?>><?php echo $svg( '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>' ); // phpcs:ignore ?>Início</a>
	<a href="<?php echo esc_url( home_url( '/loja/' ) ); ?>"<?php echo $on( $loja ); // phpcs:ignore ?>><?php echo $svg( '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>' ); // phpcs:ignore ?>Produtos</a>
	<button type="button" class="mb-c" data-prazo><i><?php echo $svg( '<path d="M12 3c3.3 0 6 2.6 6 6 0 3.6-3 6.5-6 7.5-3-1-6-3.9-6-7.5 0-3.4 2.7-6 6-6Z"/><path d="M12 16.5v1.5c0 1.5-1 2-2 3"/>' ); // phpcs:ignore ?></i>Frete</button>
	<a href="<?php echo esc_url( wc_get_cart_url() ); ?>"<?php echo $on( $cart ); // phpcs:ignore ?>><?php echo $svg( '<path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/>' ); // phpcs:ignore ?><?php if ( $q ) : ?><em><?php echo (int) $q; ?></em><?php endif; ?>Carrinho</a>
	<a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>"<?php echo $on( $conta ); // phpcs:ignore ?>><?php echo $svg( '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>' ); // phpcs:ignore ?>Conta</a>
</nav>
	<?php
}, 31 );

// ===== Paleta: família de tons dos balões (pink só no acento; rosa, lilás, pêssego e coral em volta) =====
add_action( 'wp_head', function () {
	?>
<style id="gb-paleta">
:root{--berry:#B0124F;--pink:#FF1F7A;--rosa:#FF8DB8;--coral:#FF7A6B;--pessego:#FFC2A1;--lilas:#B99CF0;--roxo:#7A4FD6;
--t-rosa:#FFF0F5;--t-lilas:#F5F0FF;--t-pessego:#FFF3EC;--t-coral:#FFEFEC;
--faixa:linear-gradient(90deg,var(--berry) 0 20%,var(--pink) 20% 40%,var(--rosa) 40% 60%,var(--pessego) 60% 80%,var(--lilas) 80% 100%)}
/* faixa das cores dos balões: marca da loja */
header.gb-head::after,body>header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:4px;background:var(--faixa)}
@media (max-width:760px){header.gb-head::after{display:none}.gb-nav{border-bottom:4px solid transparent!important;background:linear-gradient(#fff,#fff) padding-box,var(--faixa) border-box!important}}
.rf::before{content:"";display:block;height:5px;background:var(--faixa)}
/* barra do topo em degradê suave de tons */
.gb-barra,.barra{background:linear-gradient(90deg,var(--t-rosa),var(--t-lilas),var(--t-pessego))!important;color:var(--vinho)!important}
/* sobretítulos no tom profundo, não no pink */
.eyebrow{color:var(--berry)!important}
/* fundos de seção em tons vizinhos, não só rosa */
.bloco{background:linear-gradient(180deg,var(--t-lilas),#fff)!important}
.gb-news{background:linear-gradient(90deg,var(--t-pessego),var(--t-rosa))!important}
.gb-arco{background:linear-gradient(180deg,var(--t-lilas),var(--t-rosa))!important}
/* ícones em tons alternados */
.selos div:nth-child(1) i{background:var(--t-rosa)!important;color:var(--berry)!important}
.selos div:nth-child(2) i{background:var(--t-lilas)!important;color:var(--roxo)!important}
.selos div:nth-child(3) i{background:var(--t-pessego)!important;color:#C9561E!important}
.selos div:nth-child(4) i{background:var(--t-coral)!important;color:#D2433A!important}
.rf-s:nth-child(1) i{background:rgba(255,141,184,.16);color:var(--rosa)}
.rf-s:nth-child(2) i{background:rgba(185,156,240,.16);color:var(--lilas)}
.rf-s:nth-child(3) i{background:rgba(255,194,161,.16);color:var(--pessego)}
.rf-s:nth-child(4) i{background:rgba(255,122,107,.16);color:var(--coral)}
.p3v li:nth-child(1){border-color:var(--pink)}.p3v li:nth-child(2){border-color:var(--lilas)}.p3v li:nth-child(3){border-color:var(--pessego)}
/* guia: chips das linhas com tons de fundo */
.gg-g button:nth-child(4n+1) img{background:var(--t-rosa)}.gg-g button:nth-child(4n+2) img{background:var(--t-lilas)}.gg-g button:nth-child(4n+3) img{background:var(--t-pessego)}.gg-g button:nth-child(4n) img{background:var(--t-coral)}
.gg-d{background:linear-gradient(135deg,var(--t-rosa),var(--t-lilas))!important}
.mb .mb-c i{border:0;background:linear-gradient(#fff,#fff) padding-box,var(--faixa) border-box;border:2px solid transparent}
/* banner de departamento e filtros */
.gb-dep-nav a.on{background:var(--berry);border-color:var(--berry)}
.gb-f a.on{background:var(--berry)}
.gm-dest{background:linear-gradient(160deg,var(--t-pessego),var(--t-rosa))!important}
.gm-tag{color:var(--berry)}
</style>
	<?php
}, 99 );

// ===== Barra fina do topo: prazo e site seguro à esquerda; pedidos, telefone e Instagram à direita =====
function glowbos_util_html() {
	$i = function ( $d ) {
		return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' . $d . '</svg>';
	};
	return '<style>
.ub{background:linear-gradient(90deg,var(--t-rosa,#fff0f5),var(--t-lilas,#f5f0ff),var(--t-pessego,#fff3ec));color:var(--vinho,#1d1a1f);font:500 12.5px/1 Inter,sans-serif}
.ub-w{max-width:1240px;margin:0 auto;padding:0 24px;height:36px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.ub-l,.ub-r{display:flex;align-items:center;gap:18px;white-space:nowrap}
.ub span,.ub a{display:inline-flex;align-items:center;gap:6px;color:inherit;text-decoration:none}
.ub a:hover{color:var(--berry,#b0124f)}
.ub svg{width:15px;height:15px;opacity:.75}
.ub .ub-ig svg{width:17px;height:17px;opacity:.9}
@media (max-width:760px){.ub-w{padding:0 14px;height:32px;font-size:12px}.ub-l span+span,.ub-r a:not(.ub-ig){display:none}.ub-w{justify-content:space-between}}
</style>
<div class="ub"><div class="ub-w">
<div class="ub-l"><span>' . $i( '<path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>' ) . 'Pagou até 12h, chega hoje até 21h em SP e Grande SP</span><span>' . $i( '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>' ) . 'Site seguro</span></div>
<div class="ub-r"><a href="' . esc_url( wc_get_account_endpoint_url( 'orders' ) ) . '">' . $i( '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>' ) . 'Meus pedidos</a><a href="https://wa.me/5511945231106" target="_blank" rel="noopener">' . $i( '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>' ) . '(11) 94523-1106</a><a class="ub-ig" href="https://instagram.com/glowbosbaloes" target="_blank" rel="noopener" aria-label="Instagram da Glowbos">' . $i( '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>' ) . '</a></div>
</div></div>';
}

// ===== Régua "Os mais vendidos": os campeões da Shopee, com o número real de vendas de lá =====
// 19/10: vitrine da home em quadrantes (relatório do Vitor): Categorias, Decoração Pronta, Balões Joy,
// Formatos e Acessórios; Pacotes fechados segue como fileira de produtos.
function glowbos_linhas_html() {
	$mapa = (array) get_option( 'glowbos_produtos', array() );
	$img  = get_template_directory_uri() . '/img/';
	$cat  = function ( $s ) { $t = get_term_by( 'slug', $s, 'product_cat' ); return $t ? get_term_link( $t ) : home_url( '/loja/' ); };
	$prod = function ( $k ) use ( $mapa ) { return empty( $mapa[ $k ] ) ? null : wc_get_product( $mapa[ $k ] ); };
	$q    = function ( $titulo, $foto, $link, $sub = '', $extra = '' ) {
		$tag = $link ? 'a href="' . esc_url( $link ) . '"' : 'div';
		$fim = $link ? 'a' : 'div';
		return '<' . $tag . ' class="vq-c' . $extra . '"' . ( $link && 0 === strpos( $link, '#' ) ? ' data-app="' . esc_attr( substr( $link, 1 ) ) . '"' : '' ) . '><span class="vq-f"><img src="' . esc_url( $foto ) . '" alt="' . esc_attr( $titulo ) . '" loading="lazy"></span><b>' . esc_html( $titulo ) . '</b>' . ( $sub ? '<small>' . wp_kses_post( $sub ) . '</small>' : '' ) . '</' . $fim . '>';
	};
	$pq = function ( $k, $titulo = '' ) use ( $prod, $q ) {
		$p = $prod( $k );
		if ( ! $p ) {
			return '';
		}
		return $q( $titulo ?: $p->get_name(), wp_get_attachment_image_url( $p->get_image_id(), 'medium_large' ), $p->get_permalink(), wc_price( $p->get_price() ) );
	};
	$sec = function ( $id, $titulo, $sub, $ver, $cards ) {
		return '<section class="vq" id="vq-' . esc_attr( $id ) . '"><div class="w"><div class="vq-h"><div><h2>' . esc_html( $titulo ) . '</h2>' . ( $sub ? '<p>' . esc_html( $sub ) . '</p>' : '' ) . '</div>' . ( $ver ? '<a href="' . esc_url( $ver ) . '">Ver tudo</a>' : '' ) . '</div><div class="vq-l">' . $cards . '</div></div></section>';
	};
	$met5 = $prod( 'metal5_25' );
	$h  = $sec( 'categorias', 'Categorias', 'Escolha a linha e monte a sua festa.', home_url( '/loja/' ),
		$q( 'Balões Cromados', $img . 'banner_cromados_m.webp', $met5 ? $met5->get_permalink() : $cat( 'formatos' ), $met5 ? 'a partir de ' . wc_price( $met5->get_price() ) : '' ) .
		$q( 'Linha Candy', $img . 'banner_candy_m.webp', $cat( 'candy-colors' ), 'tons pastel' ) .
		$q( 'Balões Lisos', wp_get_attachment_image_url( get_post_thumbnail_id( $mapa['fech8_rosa'] ?? 0 ), 'medium_large' ) ?: $img . 'banner_fechados_m.webp', $cat( 'pacotes-fechados' ), 'uma cor por pacote' ) .
		$q( 'Arco Desconstruído', wp_get_attachment_image_url( get_post_thumbnail_id( $mapa['kit100'] ?? 0 ), 'medium_large' ) ?: $img . 'banner_kits_m.webp', '#monte', 'monte o seu' ) .
		$q( 'Pacotes Sortidos', $img . 'banner_pacotes_m.webp', '#pacotes', 'escolha as cores' ) );
	$h .= $sec( 'decoracao', 'Decoração Pronta', 'Kits pra montar em casa, com as cores que você escolher.', $cat( 'decoracao-pronta' ),
		$pq( 'kit60', 'Kit Arco 60 peças' ) . $pq( 'kit80', 'Kit Arco 80 peças' ) . $pq( 'kit100', 'Kit Arco 100 peças' ) . $pq( 'miniarco', 'Mini Arco de mesa' ) . $pq( 'bubble_encap', 'Bubble Encapsulado' ) );
	$h .= $sec( 'joy', 'Balões Joy', 'A marca Joy em 4 tamanhos. Você escolhe as cores.', $cat( 'baloes-joy' ),
		$pq( 'pct5_50', 'Joy 5" · 50 un.' ) . $pq( 'pct9_50', 'Joy 9" · 50 un.' ) . $pq( 'pct12_25', 'Joy 12" · 25 un.' ) . $pq( 'pct16_12', 'Joy 16" · 12 un.' ) .
		$q( 'Joy Big 25"', $img . 'banner_joy_m.webp', '', 'em breve', ' vq-breve' ) );
	$h .= $sec( 'formatos', 'Formatos', 'Números e balões de formato pro destaque da festa.', $cat( 'formatos' ),
		$q( 'Balões de Números', $img . 'num_rose_5.webp', $cat( 'numeros' ), 'de 0 a 9' ) .
		$pq( 'num32', 'Número metalizado 32" · 81 cm' ) .
		$q( 'Balões de Formatos', wp_get_attachment_image_url( get_post_thumbnail_id( $mapa['met18_estrela'] ?? 0 ), 'medium_large' ) ?: $img . 'banner_cromados_m.webp', $cat( 'formatos' ), 'coração, estrela, bola e safári' ) );
	$h .= $sec( 'acessorios', 'Acessórios', 'O que precisa pra montar.', $cat( 'acessorios' ), $pq( 'fita', 'Fita para arco + dupla face' ) . $pq( 'inflador', 'Inflador manual' ) );
	$h .= $sec( 'mesa', 'Mesa da festa', 'Pratinho e guardanapo na cor dos balões.', $cat( 'mesa-da-festa' ),
		$pq( 'prato20', 'Pratinho 15 cm · 20 un.' ) . $pq( 'prato30', 'Pratos 15 cm · 30 un.' ) . $pq( 'guardanapo', 'Guardanapo colorido · 50 folhas' ) );
	return '<style>
.vq{padding:72px 0 0}
.vq-h{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px}
.vq-h h2{margin:0;font:700 clamp(26px,2.6vw,36px)/1.05 Fredoka,"Inter Tight",sans-serif;color:#B0124F}
.vq-h p{margin:6px 0 0;font:500 15px/1.4 Inter;color:#6b5560}
.vq-h a{font:700 14px Inter;color:#F93388;text-decoration:none;white-space:nowrap}
.vq-l{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
.vq-c{display:flex;flex-direction:column;text-decoration:none;color:#2a0f22;cursor:pointer}
.vq-f{display:block;aspect-ratio:1;border-radius:20px;overflow:hidden;background:#F7F3EA;box-shadow:inset 0 0 0 1.5px #F6E3EB;transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s}
.vq-f img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.vq-c:hover .vq-f{transform:translateY(-4px);box-shadow:0 18px 36px -18px rgba(176,18,79,.4)}
.vq-c:hover .vq-f img{transform:scale(1.05)}
.vq-c b{margin-top:12px;font:700 18px/1.15 Fredoka,"Inter Tight",sans-serif;color:#2a0f22;text-align:center}
.vq-c small{margin-top:4px;font:700 14px Inter;color:#B0124F;text-align:center}
.vq-c small .woocommerce-Price-amount{color:inherit}
.vq-breve{cursor:default}.vq-breve .vq-f{filter:grayscale(.2) opacity(.75)}.vq-breve small{color:#a08a94}
@media (max-width:900px){.vq-l{grid-template-columns:repeat(3,1fr)}}
@media (max-width:640px){.vq{padding-top:48px}.vq-l{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 16px;gap:14px;margin:0 -16px;padding:0 16px 6px;scrollbar-width:none}.vq-l::-webkit-scrollbar{display:none}.vq-c{flex:0 0 42%;scroll-snap-align:start}.vq-c b{font-size:16px}}
</style>' . $h . glowbos_linha_fechados_html();
}

// Fileira de produtos (hoje só Pacotes fechados).
function glowbos_linha_fechados_html() {
	$linhas = array(
		'pacotes-fechados'  => array( 'Pacotes Fechados', 'Uma cor por pacote: Glowbos de 8" e Joy de 5" a 16".' ),
	);
	$h = '';
	foreach ( $linhas as $slug => $t ) {
		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $term ) {
			continue;
		}
		$ps = wc_get_products( array( 'status' => 'publish', 'limit' => 30, 'category' => array( $slug ), 'orderby' => array( 'menu_order' => 'ASC', 'title' => 'ASC' ), 'visibility' => 'catalog' ) );
		if ( ! $ps ) {
			continue;
		}
		$c = '';
		foreach ( $ps as $p ) {
			$img = wp_get_attachment_image_url( $p->get_image_id(), 'medium_large' );
			if ( ! $img ) {
				continue; // produto sem foto não entra na vitrine
			}
			$c  .= sprintf(
				'<a class="lj-c" href="%1$s"><span class="lj-f"><img src="%2$s" alt="%3$s" loading="lazy"></span><span class="lj-n">%3$s</span><span class="lj-p">%4$s</span><span class="lj-b">Comprar</span></a>',
				esc_url( $p->get_permalink() ),
				esc_url( $img ),
				esc_html( $p->get_name() ),
				wp_kses_post( $p->get_price_html() )
			);
		}
		$h .= sprintf(
			'<section class="lj" id="linha-%1$s"><div class="w"><div class="lj-h"><div><h2>%2$s</h2><p>%3$s</p></div><div class="lj-ac"><a href="%4$s">Ver todos (%5$d)</a><button type="button" class="lj-s" data-d="-1" aria-label="Voltar">‹</button><button type="button" class="lj-s" data-d="1" aria-label="Avançar">›</button></div></div><div class="lj-l">%6$s</div></div></section>',
			esc_attr( $slug ),
			esc_html( $t[0] ),
			esc_html( $t[1] ),
			esc_url( get_term_link( $term ) ),
			(int) $term->count,
			$c
		);
	}
	if ( ! $h ) {
		return '';
	}
	return '<style>
.lj{padding:80px 0 0}
.lj-h{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:24px}
.lj-h h2{margin:0;font:700 clamp(24px,2.4vw,32px)/1.05 Fredoka,"Inter Tight",sans-serif;color:#B0124F}
.lj-h p{margin:6px 0 0;font:500 14.5px/1.4 Inter;color:#6b5560}
.lj-ac{display:flex;align-items:center;gap:8px;flex:0 0 auto}
.lj-ac a{font:700 14px Inter;color:#F93388;text-decoration:none;margin-right:8px;white-space:nowrap}
.lj-ac a:hover{text-decoration:underline}
.lj-s{width:40px;height:40px;border-radius:50%;border:0;background:#fff;color:#B0124F;font:400 26px/38px Inter;cursor:pointer;box-shadow:inset 0 0 0 1.5px #FFD8E8}
.lj-s:hover{background:#F93388;color:#fff}
.lj-l{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:4px 2px 16px;scrollbar-width:none}
.lj-l::-webkit-scrollbar{display:none}
.lj-c{flex:0 0 calc((100% - 72px)/5);scroll-snap-align:start;display:flex;flex-direction:column;background:#fff;border-radius:18px;padding:10px;text-decoration:none;color:#2a0f22;box-shadow:inset 0 0 0 1.5px #F6E3EB;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s}
.lj-c:hover{transform:translateY(-4px);box-shadow:0 16px 34px -16px rgba(176,18,79,.35),inset 0 0 0 1.5px #FFD8E8}
.lj-f{display:block;aspect-ratio:1;border-radius:12px;overflow:hidden;background:#F7F3EA}
.lj-f img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.lj-c:hover .lj-f img{transform:scale(1.05)}
.lj-n{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em;margin:10px 2px 0;font:600 14px/1.3 Inter}
.lj-p{display:block;margin:6px 2px 10px;font:800 18px "Inter Tight";color:#B0124F}
.lj-p del{font-size:13px;color:#a08a94;font-weight:500;margin-right:4px}
.lj-p ins{text-decoration:none}
.lj-p .woocommerce-Price-amount{color:inherit}
.lj-b{margin-top:auto;display:flex;align-items:center;justify-content:center;height:40px;border-radius:12px;background:#FFF0F6;color:#B0124F;font:800 14px Inter;transition:background .2s,color .2s}
.lj-c:hover .lj-b{background:#F93388;color:#fff}
@media (max-width:1100px){.lj-c{flex-basis:calc((100% - 54px)/4)}}
@media (max-width:760px){.lj-c{flex-basis:calc((100% - 36px)/3)}}
@media (max-width:640px){.lj{padding-top:52px}.lj-l{margin:0 -16px;padding:4px 16px 14px;scroll-padding:0 16px}.lj-c{flex-basis:44%}.lj-s{display:none}.lj-h{align-items:flex-start}.lj-ac a{margin:6px 0 0}}
</style>
' . $h . '<script>document.querySelectorAll(".lj").forEach(function(s){var l=s.querySelector(".lj-l");s.querySelectorAll(".lj-s").forEach(function(b){b.onclick=function(){l.scrollBy({left:+b.dataset.d*l.clientWidth*.9})}})});</script>';
}

function glowbos_mais_vendidos_html() {
	$mapa = (array) get_option( 'glowbos_produtos', array() );
	// chave => [selo de vendas na Shopee, nome curto]
	$top  = array( 'pack_azul' => array( '5 mil+', 'Azul, vermelho e amarelo' ), 'pack_laranja' => array( '5 mil+', 'Laranja, marrom e verde' ), 'pack_preto' => array( '4 mil+', 'Vermelho, preto e amarelo' ), 'pct50' => array( '3 mil+', '50 balões, 2 cores à escolha' ) );
	$c    = '';
	$n    = 1;
	foreach ( $top as $k => $t ) {
		$p = empty( $mapa[ $k ] ) ? null : wc_get_product( $mapa[ $k ] );
		if ( ! $p ) {
			continue;
		}
		$c .= sprintf( '<a class="mv-c" href="%s"><span class="mv-n">%d</span><img src="%s" alt="" loading="lazy"><span class="mv-t"><em>%s vendidos</em><b>%s</b><strong>%s</strong></span></a>', esc_url( $p->get_permalink() ), $n++, esc_url( wp_get_attachment_image_url( $p->get_image_id(), 'medium' ) ), esc_html( $t[0] ), esc_html( $t[1] ), wp_kses_post( wc_price( $p->get_price() ) ) );
	}
	return '<style>
.mv{position:relative;margin:70px 0 0;padding:34px 0;background:linear-gradient(110deg,#2a0f22 0%,#5a1240 45%,#8e1650 100%);color:#fff;overflow:hidden}
.mv::before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:var(--faixa)}
.mv-w{max-width:1240px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:260px minmax(0,1fr);gap:28px;align-items:center;position:relative}
.mv-h small{display:block;font:700 12px Inter;letter-spacing:.16em;text-transform:uppercase;color:#ffb3d0;margin-bottom:8px}
.mv-h b{display:block;font:800 34px/1.02 "Inter Tight";letter-spacing:-.03em}
.mv-h p{margin:10px 0 16px;color:rgba(255,255,255,.75);font-size:14px;line-height:1.45}
.mv-h a{display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:10px;background:#fff;color:#2a0f22;font:800 14px Inter;text-decoration:none}
.mv-l{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.mv-c{position:relative;display:flex;flex-direction:column;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:12px;text-decoration:none;color:#fff;transition:transform .2s,background .2s}
.mv-c:hover{transform:translateY(-4px);background:rgba(255,255,255,.12)}
.mv-c img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;background:#f7f3ea}
.mv-n{position:absolute;top:18px;left:18px;width:30px;height:30px;border-radius:50%;background:#fff;color:#8e1650;font:800 15px/30px "Inter Tight";text-align:center;z-index:1}
.mv-t{display:block;padding:10px 2px 0}
.mv-t em{display:inline-block;font-style:normal;font:700 11.5px Inter;color:#2a0f22;background:#ffd1e3;padding:3px 8px;border-radius:99px;margin-bottom:6px}
.mv-t b{display:block;font:700 14px/1.25 Inter}
.mv-t strong{display:block;margin-top:4px;font:800 17px "Inter Tight";color:#ffb3d0}
.mv-t strong .woocommerce-Price-amount{color:inherit}
@media (max-width:980px){.mv-w{grid-template-columns:1fr;text-align:center}.mv-h a{margin:0 auto}}
@media (max-width:640px){.mv{margin-top:44px;padding:26px 0}.mv-w{padding:0 16px}.mv-h b{font-size:28px}.mv-l{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px;padding:0 16px;scrollbar-width:none}.mv-l::-webkit-scrollbar{display:none}.mv-c{flex:0 0 62%;scroll-snap-align:start;text-align:left}}
</style>
<section class="mv"><div class="mv-w"><div class="mv-h"><small>Na Shopee</small><b>Os mais vendidos</b><p>Os pacotes que mais saem na nossa loja da Shopee, pelo mesmo preço e com entrega no mesmo dia em SP.</p><a href="' . esc_url( home_url( '/categoria/pacotes/' ) ) . '">Ver todos os pacotes →</a></div><div class="mv-l">' . $c . '</div></div></section>';
}

// Pixel da Meta e eventos de compra.
require_once __DIR__ . '/rastreio.php';

// Avaliações da Shopee no lugar da aba vazia do WooCommerce.
require_once __DIR__ . '/avaliacoes.php';

// 16/10: ao descer a página, o "Chega hoje?" e o WhatsApp viram duas bolinhas no canto
// direito (desktop). Antes eram duas pílulas de 290 px que cobriam produto e texto.
add_action( 'wp_footer', function () {
	?>
<style>
@media (min-width:761px){
.gg-fab,.wpp{transition:width .35s ease,padding .35s ease,transform .7s cubic-bezier(.22,1,.36,1),opacity .4s ease!important}
body.gb-desceu .gg-fab{width:56px!important;padding:0!important;justify-content:center;gap:0;animation:none}
body.gb-desceu .gg-fab>span,body.gg-fab-x .gg-fab .bl,body.gb-desceu .gg-fab .bl{display:none!important}
body.gb-desceu .gg-fab i{width:56px;height:56px;background:transparent}
body.gb-desceu .gg-fab i svg{color:#fff;width:24px;height:24px}
body.gb-desceu .wpp{width:56px!important;padding:0!important;justify-content:center;gap:0}
body.gb-desceu .wpp span{display:none!important}
body.gb-desceu .wpp svg{width:30px;height:30px}
}
</style>
<script>(function(){var b=document.body,f=function(){b.classList.toggle('gb-desceu',scrollY>120)};addEventListener('scroll',f,{passive:true});f();})();</script>
	<?php
}, 99 );

// SEO por página e GEO (dados pra Google e IAs).
require_once __DIR__ . '/seo.php';

// 16/10: o login do WordPress não fica mais à mostra. Lista de usuários da API, mapa de autores e
// ?author=1 só pra quem está logado; sem versão do PHP no cabeçalho; HTTPS obrigatório (HSTS).
add_filter( 'rest_endpoints', function ( $e ) {
	if ( ! is_user_logged_in() ) {
		unset( $e['/wp/v2/users'], $e['/wp/v2/users/(?P<id>[\d]+)'] );
	}
	return $e;
} );
add_filter( 'wp_sitemaps_add_provider', function ( $p, $nome ) {
	return 'users' === $nome ? false : $p;
}, 10, 2 );
add_action( 'template_redirect', function () {
	if ( ( is_author() || isset( $_GET['author'] ) ) && ! is_user_logged_in() ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}, 1 );
add_action( 'send_headers', function () {
	header_remove( 'X-Powered-By' );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=15552000' );
	}
} );

// 16/10: seção "Sets prontos" na home, logo depois de "Os mais vendidos". Lê os produtos da
// categoria sets-prontos (sob encomenda, sem preço), então set novo entra sozinho.
function glowbos_sets_html() {
	$ps = wc_get_products( array( 'category' => array( 'sets-prontos' ), 'status' => 'publish', 'limit' => 8, 'orderby' => 'menu_order', 'order' => 'ASC' ) );
	if ( ! $ps ) {
		return '';
	}
	$c = '';
	foreach ( $ps as $p ) {
		$c .= sprintf( '<a class="sp-c" href="%s"><img src="%s" alt="%s" loading="lazy"><span><b>%s</b><em>Sob encomenda · chega montado</em><i>Pedir orçamento</i></span></a>', esc_url( $p->get_permalink() ), esc_url( wp_get_attachment_image_url( $p->get_image_id(), 'large' ) ), esc_attr( $p->get_name() ), esc_html( $p->get_name() ) );
	}
	return '<style>
.sp{padding:64px 0 10px}
.sp-w{max-width:1240px;margin:0 auto;padding:0 24px}
.sp-h{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:22px}
.sp-h small{display:block;font:700 12px Inter;letter-spacing:.16em;text-transform:uppercase;color:#C2185B;margin-bottom:8px}
.sp-h b{display:block;font:800 34px/1.05 "Inter Tight";letter-spacing:-.03em;color:#1d1a1f}
.sp-h p{margin:8px 0 0;color:#5b5560;font-size:15px;line-height:1.45;max-width:560px}
.sp-h a{flex:none;font:700 14px Inter;color:#C2185B;text-decoration:none}
.sp-l{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.sp-c{display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;text-decoration:none;color:#1d1a1f;border:1px solid #f1e3e8;transition:transform .2s}
.sp-c:hover{transform:translateY(-4px)}
.sp-c img{width:100%;aspect-ratio:4/5;object-fit:cover;background:#f3ece4;display:block}
.sp-c span{display:flex;flex-direction:column;gap:4px;padding:14px 14px 16px}
.sp-c b{font:700 15px/1.25 Inter}
.sp-c em{font-style:normal;font:600 12.5px Inter;color:#7a6c74}
.sp-c i{font-style:normal;margin-top:8px;align-self:flex-start;height:36px;line-height:36px;padding:0 14px;border-radius:10px;background:linear-gradient(135deg,#5E0B2E,#8E1446 55%,#B0124F);color:#fff;font:700 13px/36px Inter}
@media (max-width:768px){.sp{padding:44px 0 0}.sp-h{flex-direction:column;align-items:flex-start}.sp-h b{font-size:26px}.sp-l{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sp-c span{padding:10px 10px 12px}.sp-c b{font-size:13.5px}.sp-c em{font-size:11.5px}.sp-c i{height:32px;font-size:12px;line-height:32px;padding:0 10px}}
</style><section class="sp" id="sets"><div class="sp-w"><div class="sp-h"><div><small>Sets prontos</small><b>A festa montada, do jeito do tema</b><p>Número, base de balões, figuras e buquê no estilo da festa. Escolha o tema e a idade, a gente monta.</p></div><a href="' . esc_url( home_url( '/categoria/sets-prontos/' ) ) . '">Ver todos os sets →</a></div><div class="sp-l">' . $c . '</div></div></section>';
}
