<?php
// Rastreio dos anúncios (16/10/2026). Pixel "Glowbos" no Gerenciador da Kompila.
// Quatro momentos: ver produto, colocar no carrinho, ir pro checkout e compra paga.
// Cada evento leva um event_id, pra quando a API de Conversões entrar pelo servidor
// a Meta não contar a mesma compra duas vezes.

const GLOWBOS_PIXEL = '2329466134467831';

function glowbos_px_valor( $v ) {
	return round( (float) $v, 2 );
}

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
	$ids = array();
	$n   = 0;
	foreach ( $o->get_items() as $it ) {
		$ids[] = (string) $it->get_product_id();
		$n    += (int) $it->get_quantity();
	}
	return array(
		'ev'   => 'Purchase',
		'id'   => 'pedido_' . $o->get_id(),
		'data' => array(
			'content_ids'  => $ids,
			'content_type' => 'product',
			'num_items'    => $n,
			'value'        => glowbos_px_valor( $o->get_total() ),
			'currency'     => 'BRL',
		),
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

	$compra = glowbos_px_compra();
	if ( $compra ) {
		$eventos[] = $compra;
	}

	$js = '';
	foreach ( $eventos as $e ) {
		$js .= sprintf( "fbq('track',%s,%s,{eventID:%s});\n", wp_json_encode( $e['ev'] ), wp_json_encode( $e['data'] ), wp_json_encode( $e['id'] ) );
	}
	?>
<!-- Meta Pixel: Glowbos -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','<?php echo esc_js( GLOWBOS_PIXEL ); ?>');
fbq('track','PageView');
<?php echo $js; // phpcs:ignore -- montado com wp_json_encode ?>
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=<?php echo esc_attr( GLOWBOS_PIXEL ); ?>&ev=PageView&noscript=1"></noscript>
	<?php
}, 5 );
