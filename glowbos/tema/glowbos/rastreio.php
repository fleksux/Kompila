<?php
// Rastreio dos anúncios (16/10/2026). Pixel "Glowbos" no Gerenciador da Kompila.
// Quatro momentos: ver produto, colocar no carrinho, ir pro checkout e compra paga.
// Cada evento leva um event_id, pra quando a API de Conversões entrar pelo servidor
// a Meta não contar a mesma compra duas vezes.

const GLOWBOS_PIXEL = '2329466134467831';
const GLOWBOS_TIKTOK = 'DB96BRRC77UAEK319QHG'; // pixel TikTok "Glowbos", conta de anúncios Animar Balões
const GLOWBOS_GA4   = 'G-11H893WBQ3'; // Google Analytics, conta Glowbos no Google do fleks.ux

function glowbos_px_valor( $v ) {
	return round( (float) $v, 2 );
}

// API de Conversões: o mesmo evento sai do servidor com o mesmo event_id, e a Meta
// junta os dois. Pega a compra do iPhone e de quem usa bloqueador, e o Pix pago
// depois que a pessoa já fechou a página. Token no option glowbos_capi_token
// (usuário de sistema da Kompila), nunca no repositório.
function glowbos_capi( $ev, $id, $data, $order = null ) {
	$token = get_option( 'glowbos_capi_token' );
	if ( ! $token ) {
		return;
	}
	$h    = function ( $v ) {
		$v = strtolower( trim( (string) $v ) );
		return '' === $v ? null : hash( 'sha256', $v );
	};
	$user = array_filter( array(
		'client_ip_address' => $order ? $order->get_customer_ip_address() : ( $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '' ),
		'client_user_agent' => $order ? $order->get_customer_user_agent() : ( $_SERVER['HTTP_USER_AGENT'] ?? '' ),
		'fbp'               => $order ? $order->get_meta( '_gb_fbp' ) : ( $_COOKIE['_fbp'] ?? '' ),
		'fbc'               => $order ? $order->get_meta( '_gb_fbc' ) : ( $_COOKIE['_fbc'] ?? '' ),
	) );
	if ( isset( $user['client_ip_address'] ) ) {
		$user['client_ip_address'] = trim( explode( ',', $user['client_ip_address'] )[0] );
	}
	if ( $order ) {
		$fone = preg_replace( '/\D/', '', $order->get_billing_phone() );
		if ( $fone && 0 !== strpos( $fone, '55' ) ) {
			$fone = '55' . $fone;
		}
		$user += array_filter( array(
			'em'          => $h( $order->get_billing_email() ),
			'ph'          => $h( $fone ),
			'fn'          => $h( $order->get_billing_first_name() ),
			'ln'          => $h( $order->get_billing_last_name() ),
			'ct'          => $h( str_replace( ' ', '', $order->get_billing_city() ) ),
			'st'          => $h( $order->get_billing_state() ),
			'zp'          => $h( preg_replace( '/\D/', '', $order->get_billing_postcode() ) ),
			'country'     => $h( 'br' ),
			'external_id' => $h( $order->get_customer_id() ? 'c' . $order->get_customer_id() : $order->get_billing_email() ),
		) );
	}
	$url = $order ? $order->get_checkout_order_received_url() : home_url( add_query_arg( array() ) );
	wp_remote_post( 'https://graph.facebook.com/v21.0/' . GLOWBOS_PIXEL . '/events', array(
		'blocking' => false,
		'timeout'  => 3,
		'body'     => array(
			'access_token' => $token,
			'data'         => wp_json_encode( array( array(
				'event_name'       => $ev,
				'event_time'       => time(),
				'event_id'         => $id,
				'action_source'    => 'website',
				'event_source_url' => $url,
				'user_data'        => $user,
				'custom_data'      => $data,
			) ) ),
		),
	) );
}

// Guarda os cookies da Meta no pedido, pra compra paga depois (Pix) ainda casar com o anúncio.
add_action( 'woocommerce_checkout_create_order', function ( $order ) {
	foreach ( array( '_fbp', '_fbc' ) as $c ) {
		if ( ! empty( $_COOKIE[ $c ] ) ) {
			$order->update_meta_data( '_gb' . $c, sanitize_text_field( wp_unslash( $_COOKIE[ $c ] ) ) );
		}
	}
} );

function glowbos_px_dados_pedido( $o ) {
	$ids = array();
	$n   = 0;
	foreach ( $o->get_items() as $it ) {
		$ids[] = (string) $it->get_product_id();
		$n    += (int) $it->get_quantity();
	}
	return array(
		'content_ids'  => $ids,
		'content_type' => 'product',
		'num_items'    => $n,
		'value'        => glowbos_px_valor( $o->get_total() ),
		'currency'     => 'BRL',
		'order_id'     => (string) $o->get_id(),
	);
}

// Compra paga, pelo servidor: vale pro cartão e pro Pix que cai minutos depois.
add_action( 'woocommerce_order_status_changed', function ( $oid, $de, $para, $o ) {
	if ( ! in_array( $para, array( 'processing', 'completed' ), true ) || $o->get_meta( '_gb_capi_compra' ) ) {
		return;
	}
	$o->update_meta_data( '_gb_capi_compra', time() );
	$o->save();
	glowbos_capi( 'Purchase', 'pedido_' . $o->get_id(), glowbos_px_dados_pedido( $o ), $o );
}, 10, 4 );

// O carrinho quase sempre muda por AJAX (home, monte seu pacote, lista do arco) e
// depois a página troca. O evento fica guardado na sessão e sai na próxima página.
add_action( 'woocommerce_add_to_cart', function ( $key, $pid, $q, $vid ) {
	if ( ! WC()->session ) {
		return;
	}
	$p   = wc_get_product( $vid ? $vid : $pid );
	$fila = (array) WC()->session->get( 'gb_px_fila', array() );
	$fila[] = array(
		'ev'   => 'AddToCart',
		'id'   => 'atc_' . wp_generate_password( 12, false ),
		'data' => array(
			'content_ids'  => array( (string) $pid ),
			'content_type' => 'product',
			'content_name' => $p ? $p->get_name() : '',
			'value'        => $p ? glowbos_px_valor( (float) $p->get_price() * $q ) : 0,
			'currency'     => 'BRL',
		),
	);
	WC()->session->set( 'gb_px_fila', array_slice( $fila, -10 ) );
	$e = end( $fila );
	glowbos_capi( $e['ev'], $e['id'], $e['data'] );
}, 10, 4 );

// Pedido criado no checkout: guarda o número pra mandar a compra só quando estiver pago
// (o Pix fica pendente até a pessoa pagar).
add_action( 'woocommerce_checkout_order_processed', function ( $order_id ) {
	if ( WC()->session ) {
		WC()->session->set( 'gb_px_pedido', (int) $order_id );
	}
} );

function glowbos_px_compra() {
	$oid = 0;
	if ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) {
		$oid = absint( get_query_var( 'order-received' ) );
	} elseif ( WC()->session ) {
		$oid = (int) WC()->session->get( 'gb_px_pedido', 0 );
	}
	if ( ! $oid ) {
		return null;
	}
	$o = wc_get_order( $oid );
	if ( ! $o || ! $o->is_paid() || $o->get_meta( '_gb_px_compra' ) ) {
		return null;
	}
	// Só quem fez o pedido dispara: na página de pedido recebido a chave confere.
	if ( is_order_received_page() && ( $_GET['key'] ?? '' ) !== $o->get_order_key() ) {
		return null;
	}
	$o->update_meta_data( '_gb_px_compra', time() );
	$o->save();
	if ( WC()->session ) {
		WC()->session->set( 'gb_px_pedido', 0 );
	}
	return array(
		'ev'   => 'Purchase',
		'id'   => 'pedido_' . $o->get_id(),
		'data' => glowbos_px_dados_pedido( $o ),
	);
}


add_action( 'wp_head', function () {
	if ( is_admin() ) {
		return;
	}
	$eventos = array();

	if ( WC()->session ) {
		$eventos = (array) WC()->session->get( 'gb_px_fila', array() );
		WC()->session->set( 'gb_px_fila', array() );
	}

	if ( is_product() ) {
		$p = wc_get_product( get_queried_object_id() );
		if ( $p ) {
			$eventos[] = array(
				'ev'   => 'ViewContent',
				'id'   => 'vc_' . wp_generate_password( 12, false ),
				'data' => array(
					'content_ids'  => array( (string) $p->get_id() ),
					'content_type' => 'product',
					'content_name' => $p->get_name(),
					'value'        => glowbos_px_valor( $p->get_price() ),
					'currency'     => 'BRL',
				),
			);
		}
	}

	if ( is_checkout() && ! is_order_received_page() && WC()->cart && ! WC()->cart->is_empty() ) {
		$ids = array();
		foreach ( WC()->cart->get_cart() as $c ) {
			$ids[] = (string) $c['product_id'];
		}
		$eventos[] = array(
			'ev'   => 'InitiateCheckout',
			'id'   => 'ic_' . wp_generate_password( 12, false ),
			'data' => array(
				'content_ids'  => $ids,
				'content_type' => 'product',
				'num_items'    => WC()->cart->get_cart_contents_count(),
				'value'        => glowbos_px_valor( WC()->cart->get_total( 'edit' ) ),
				'currency'     => 'BRL',
			),
		);
	}

	foreach ( $eventos as $e ) {
		if ( in_array( $e['ev'], array( 'ViewContent', 'InitiateCheckout' ), true ) ) {
			glowbos_capi( $e['ev'], $e['id'], $e['data'] );
		}
	}

	$compra = glowbos_px_compra();
	if ( $compra ) {
		$eventos[] = $compra;
	}

	// Os mesmos momentos no Google Analytics, com os nomes de comércio do GA4.
	$ga_nome = array( 'ViewContent' => 'view_item', 'AddToCart' => 'add_to_cart', 'InitiateCheckout' => 'begin_checkout', 'Purchase' => 'purchase' );
	$js = '';
	foreach ( $eventos as $e ) {
		$js .= sprintf( "fbq('track',%s,%s,{eventID:%s});\n", wp_json_encode( $e['ev'] ), wp_json_encode( $e['data'] ), wp_json_encode( $e['id'] ) );
		$itens = array();
		foreach ( (array) ( $e['data']['content_ids'] ?? array() ) as $pid ) {
			$p       = wc_get_product( (int) $pid );
			$itens[] = array( 'item_id' => (string) $pid, 'item_name' => $p ? $p->get_name() : '', 'price' => $p ? glowbos_px_valor( $p->get_price() ) : 0 );
		}
		$ga = array( 'currency' => 'BRL', 'value' => $e['data']['value'] ?? 0, 'items' => $itens );
		if ( 'Purchase' === $e['ev'] ) {
			$ga['transaction_id'] = $e['data']['order_id'] ?? $e['id'];
		}
		$js .= sprintf( "gtag('event',%s,%s);\n", wp_json_encode( $ga_nome[ $e['ev'] ] ), wp_json_encode( $ga ) );
		$tt = array(
			'contents'     => array_map( function ( $i ) { return array( 'content_id' => $i['item_id'], 'content_name' => $i['item_name'], 'price' => $i['price'], 'quantity' => 1 ); }, $itens ),
			'content_type' => 'product',
			'value'        => $e['data']['value'] ?? 0,
			'currency'     => 'BRL',
		);
		$js .= sprintf( "ttq.track(%s,%s,{event_id:%s});\n", wp_json_encode( 'Purchase' === $e['ev'] ? 'CompletePayment' : $e['ev'] ), wp_json_encode( $tt ), wp_json_encode( $e['id'] ) );
	}
	?>
<!-- Google Analytics, Meta Pixel e TikTok Pixel: Glowbos -->
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( GLOWBOS_GA4 ); ?>"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','<?php echo esc_js( GLOWBOS_GA4 ); ?>');
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','<?php echo esc_js( GLOWBOS_PIXEL ); ?>');
fbq('track','PageView');
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('<?php echo esc_js( GLOWBOS_TIKTOK ); ?>');ttq.page();}(window,document,'ttq');
<?php echo $js; // phpcs:ignore -- montado com wp_json_encode ?>
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=<?php echo esc_attr( GLOWBOS_PIXEL ); ?>&ev=PageView&noscript=1"></noscript>
	<?php
}, 5 );
