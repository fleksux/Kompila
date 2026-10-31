<?php
/**
 * Plugin Name: Glowbos · CRM Kompila
 * Description: Liga a loja ao CRM da Kompila (kmp_glowbos): visitas do site, pedido pago, carrinho abandonado e Pix/boleto não pago.
 *
 * 29/10/2026 (Alex: "a loja tbm quero integrar irmão, a ideia é a gente estar todo integrado"). Molde = loja da Maslu
 * (maslu-secoes: loader.php, carrinho.php, campanha.php), com os nomes da Glowbos. Nada de segredo trafega:
 * - visitas: acessos.js da Kompila (o domínio precisa estar em tenant.acessos_dominios);
 * - pedido pago: a loja manda número + order_key pra Edge loja_evento, que confere de volta em /glowbos/v1/pedido-confere;
 * - carrinho abandonado (30 min) e Pix (30 min) ou boleto (24 h) não pago viram lead pela Edge acesso (lead_do_formulario).
 * Telefone de teste da Kompila (+55 11 90000-xxxx) nunca vira lead de verdade.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

const GLOWBOS_CRM_CHAVE  = 'kmp_glowbos';
const GLOWBOS_CRM_FUNCS  = 'https://fmbxnfebumfhrviumkbu.supabase.co/functions/v1/';
const GLOWBOS_CRM_ESPERA = 30 * MINUTE_IN_SECONDS;
const GLOWBOS_CRM_DESDE  = '2026-10-30 02:00:00 UTC';   // só pedido novo vira aviso de não pago

function glowbos_crm_digitos( $t ) { $d = preg_replace( '/\D/', '', (string) $t ); if ( strlen( $d ) > 11 && 0 === strpos( $d, '55' ) ) $d = substr( $d, 2 ); return $d; }
function glowbos_crm_teste( $tel ) { return 0 === strpos( $tel, '1190000' ); }
function glowbos_crm_hex() { return bin2hex( random_bytes( 16 ) ); }

/* 1) visitas: o mesmo acessos.js de todo cliente da Kompila */
add_action( 'wp_head', function () {
	if ( is_admin() ) return;
	echo '<script src="https://crm.kompila.com.br/acessos.js" data-chave="' . esc_attr( GLOWBOS_CRM_CHAVE ) . '" defer></script>' . "\n";
	// 31/10: medição avançada (formulário com desistência, cliques, rolagem, grupo de página) no Google Analytics que a loja já tem e no CRM
	echo '<script src="https://crm.kompila.com.br/medicao.js" data-ga="G-11H893WBQ3" defer></script>' . "\n";
}, 99 );

/* manda um "formulário do site" pro CRM (vira lead com a primeira fala "Preencheu o formulário do site (<rotulo>)") */
function glowbos_crm_formulario( $tel, $nome, $email, $rotulo, $titulo, $visitante = '' ) {
	$url = home_url( '/finalizar-compra/' );
	$r = wp_remote_post( GLOWBOS_CRM_FUNCS . 'acesso', [
		'timeout' => 10,
		'headers' => [ 'Content-Type' => 'text/plain', 'Origin' => home_url(), 'Referer' => $url, 'User-Agent' => 'Mozilla/5.0 (Glowbos ' . $titulo . ')' ],
		'body'    => wp_json_encode( [ 'chave' => GLOWBOS_CRM_CHAVE, 'visitante' => $visitante ?: glowbos_crm_hex(), 'sessao' => glowbos_crm_hex(), 'eventos' => [ [
			'tipo' => 'formulario', 'em' => (int) ( microtime( true ) * 1000 ), 'url' => $url, 'caminho' => '/finalizar-compra/', 'titulo' => $titulo, 'referrer' => '',
			'dados' => array_filter( [ 'telefone' => $tel, 'nome' => trim( (string) $nome ), 'email' => $email, 'formulario' => mb_substr( $rotulo, 0, 60 ) ] ),
		] ] ] ),
	] );
	return ! is_wp_error( $r ) && 200 === wp_remote_retrieve_response_code( $r );
}

/* 2) pedido pago avisa o CRM; o CRM confere de volta (sem segredo) */
function glowbos_crm_pago( $status ) { return ! in_array( $status, [ 'pending', 'failed', 'cancelled', 'refunded', 'on-hold', 'checkout-draft', 'trash' ], true ); }
add_action( 'woocommerce_order_status_changed', function ( $id, $de, $para, $o ) {
	if ( ! glowbos_crm_pago( $para ) || ! $o || $o->get_meta( '_glowbos_crm_pago' ) ) return;
	$o->update_meta_data( '_glowbos_crm_pago', time() ); $o->save();
	wp_remote_post( GLOWBOS_CRM_FUNCS . 'loja_evento', [
		'timeout' => 5, 'blocking' => false, 'headers' => [ 'Content-Type' => 'application/json' ],
		'body' => wp_json_encode( [ 'chave' => GLOWBOS_CRM_CHAVE, 'evento' => 'pedido_pago', 'pedido' => (int) $id, 'chave_pedido' => $o->get_order_key() ] ),
	] );
}, 20, 4 );

add_action( 'rest_api_init', function () {
	register_rest_route( 'glowbos/v1', '/pedido-confere', [ 'methods' => 'GET', 'permission_callback' => '__return_true',
		'callback' => function ( $r ) {
			$o = wc_get_order( absint( $r['pedido'] ) );
			if ( ! $o || ! hash_equals( (string) $o->get_order_key(), (string) $r['chave'] ) || ! glowbos_crm_pago( $o->get_status() ) ) return [ 'ok' => false ];
			$itens = [];
			foreach ( $o->get_items() as $it ) $itens[] = ( $it->get_quantity() > 1 ? $it->get_quantity() . 'x ' : '' ) . trim( $it->get_name() );
			$m = function ( $k ) use ( $o ) { return (string) $o->get_meta( '_wc_order_attribution_' . $k ); };
			$ent = $m( 'session_entry' ); $ref = $m( 'referrer' );
			return [ 'ok' => true, 'pedido' => $o->get_id(), 'tel' => glowbos_crm_digitos( $o->get_billing_phone() ), 'valor' => (float) $o->get_total(), 'status' => $o->get_status(),
				'pagamento' => str_replace( 'woo-mercado-pago-', 'mp-', $o->get_payment_method() ), 'campanha' => 0, 'itens' => implode( '; ', $itens ),
				'origem' => [ 'fonte' => $m( 'utm_source' ), 'meio' => $m( 'utm_medium' ), 'campanha' => $m( 'utm_campaign' ),
					'fbclid' => false !== strpos( $ent . $ref, 'fbclid' ), 'gclid' => false !== strpos( $ent . $ref, 'gclid' ),
					'entrada' => $ent ? (string) wp_parse_url( $ent, PHP_URL_PATH ) : '' ],
				'em' => $o->get_date_created() ? $o->get_date_created()->format( 'c' ) : '' ];
		} ] );
	register_rest_route( 'glowbos/v1', '/carrinhos', [ 'methods' => 'GET', 'permission_callback' => function () { return current_user_can( 'manage_woocommerce' ); },
		'callback' => function ( $r ) {
			if ( $r->get_param( 'rodar' ) ) glowbos_crm_rodar( (bool) $r->get_param( 'teste' ) );
			return array_values( array_map( function ( $c ) { return [ 'tel' => '…' . substr( $c['tel'], -4 ), 'nome' => $c['nome'], 'itens' => glowbos_crm_resumo( $c ), 'status' => $c['status'], 'ha_min' => round( ( time() - $c['em'] ) / 60 ) ]; }, glowbos_crm_carrinhos() ) );
		} ] );
} );

/* 3) carrinho abandonado: o checkout avisa quando o celular está preenchido; 30 min sem pedido, vai pro CRM */
function glowbos_crm_carrinhos() { $l = get_option( 'glowbos_carrinhos', [] ); return is_array( $l ) ? $l : []; }
function glowbos_crm_grava( $l ) { uasort( $l, function ( $a, $b ) { return ( $b['em'] ?? 0 ) <=> ( $a['em'] ?? 0 ); } ); update_option( 'glowbos_carrinhos', array_slice( $l, 0, 300, true ), false ); }

add_action( 'wp_footer', function () {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_order_received_page() ) return;
	echo '<script>(function(){var u=' . wp_json_encode( admin_url( 'admin-ajax.php' ) ) . ',ult="";function v(id){var e=document.getElementById(id);return e?e.value.trim():""}'
		. 'function manda(){var t=v("billing_phone").replace(/\D/g,"");if(t.length<10)return;var k=t+"|"+v("billing_first_name")+"|"+v("billing_email");if(k===ult)return;ult=k;'
		. 'var f=new FormData();f.append("action","glowbos_carrinho");f.append("tel",t);f.append("nome",v("billing_first_name")+" "+v("billing_last_name"));f.append("email",v("billing_email"));'
		. 'try{f.append("kmp",localStorage.getItem("kmp_v")||"")}catch(e){}fetch(u,{method:"POST",body:f,credentials:"same-origin"}).catch(function(){})}'
		. 'document.addEventListener("change",function(e){if(e.target&&/^billing_(phone|first_name|last_name|email)$/.test(e.target.id))manda()});'
		. 'document.addEventListener("focusout",function(e){if(e.target&&e.target.id==="billing_phone")manda()});})();</script>';
}, 50 );

add_action( 'wp_ajax_glowbos_carrinho', 'glowbos_crm_carrinho_salvar' );
add_action( 'wp_ajax_nopriv_glowbos_carrinho', 'glowbos_crm_carrinho_salvar' );
function glowbos_crm_carrinho_salvar() {
	$tel = glowbos_crm_digitos( wp_unslash( $_POST['tel'] ?? '' ) );
	if ( strlen( $tel ) < 10 || strlen( $tel ) > 11 || ! function_exists( 'WC' ) || ! WC()->cart || WC()->cart->is_empty() ) wp_send_json( [ 'ok' => false ] );
	$itens = [];
	foreach ( WC()->cart->get_cart() as $c ) { $p = $c['data'] ?? null; if ( $p ) $itens[] = [ 'nome' => trim( $p->get_name() ), 'qtd' => (int) $c['quantity'] ]; }
	$l = glowbos_crm_carrinhos(); $tk = 't' . $tel; $antes = $l[ $tk ] ?? [];
	$kmp = preg_replace( '/[^a-f0-9]/', '', strtolower( (string) wp_unslash( $_POST['kmp'] ?? '' ) ) );
	$l[ $tk ] = [ 'tel' => $tel, 'nome' => sanitize_text_field( wp_unslash( $_POST['nome'] ?? '' ) ), 'email' => sanitize_email( wp_unslash( $_POST['email'] ?? '' ) ),
		'kmp' => 32 === strlen( $kmp ) ? $kmp : ( $antes['kmp'] ?? '' ), 'itens' => $itens, 'total' => (float) WC()->cart->get_total( 'edit' ), 'em' => time(),
		'status' => ( ( $antes['status'] ?? '' ) === 'enviado' && time() - ( $antes['em'] ?? 0 ) < DAY_IN_SECONDS ) ? 'enviado' : 'aberto' ];
	glowbos_crm_grava( $l );
	wp_send_json( [ 'ok' => true ] );
}

add_action( 'woocommerce_checkout_order_created', function ( $o ) {
	$tk = 't' . glowbos_crm_digitos( $o->get_billing_phone() ); $l = glowbos_crm_carrinhos();
	if ( isset( $l[ $tk ] ) ) { $l[ $tk ]['status'] = 'comprou'; glowbos_crm_grava( $l ); }
} );

function glowbos_crm_resumo( $c ) {
	$p = array_map( function ( $i ) { return ( $i['qtd'] > 1 ? $i['qtd'] . 'x ' : '' ) . $i['nome']; }, (array) $c['itens'] );
	return 'Carrinho abandonado R$ ' . number_format( (float) $c['total'], 0, ',', '.' ) . ': ' . implode( ', ', $p );
}

add_filter( 'cron_schedules', function ( $s ) { $s['glowbos_10min'] = [ 'interval' => 600, 'display' => 'A cada 10 minutos' ]; return $s; } );
add_action( 'init', function () { if ( ! wp_next_scheduled( 'glowbos_crm_cron' ) ) wp_schedule_event( time() + 300, 'glowbos_10min', 'glowbos_crm_cron' ); } );
add_action( 'glowbos_crm_cron', 'glowbos_crm_rodar' );
function glowbos_crm_rodar( $teste = false ) {
	if ( ! function_exists( 'wc_get_orders' ) ) return;
	// carrinhos: 30 min sem pedido com esse celular
	$l = glowbos_crm_carrinhos(); $mudou = false;
	foreach ( $l as $tk => $c ) {
		if ( 'aberto' !== ( $c['status'] ?? '' ) || ( time() - (int) $c['em'] < GLOWBOS_CRM_ESPERA && ! ( $teste && glowbos_crm_teste( $c['tel'] ) ) ) ) continue;
		if ( time() - (int) $c['em'] > 2 * DAY_IN_SECONDS ) { $l[ $tk ]['status'] = 'velho'; $mudou = true; continue; }
		$ped = false;
		foreach ( wc_get_orders( [ 'limit' => 50, 'date_created' => '>' . ( (int) $c['em'] - HOUR_IN_SECONDS ) ] ) as $o ) if ( glowbos_crm_digitos( $o->get_billing_phone() ) === $c['tel'] ) { $ped = true; break; }
		$l[ $tk ]['status'] = $ped ? 'comprou' : ( glowbos_crm_formulario( $c['tel'], $c['nome'], $c['email'], glowbos_crm_resumo( $c ), 'Carrinho abandonado', $c['kmp'] ) ? 'enviado' : 'erro' );
		$mudou = true;
	}
	if ( $mudou ) glowbos_crm_grava( $l );
	// Pix (30 min) ou boleto (24 h) gerado e não pago: um aviso por pedido
	foreach ( wc_get_orders( [ 'status' => [ 'pending', 'on-hold' ], 'limit' => 30, 'date_created' => '>' . ( time() - 3 * DAY_IN_SECONDS ) ] ) as $o ) {
		if ( $o->get_meta( '_glowbos_crm_pendente' ) ) continue;
		$boleto = false !== strpos( $o->get_payment_method(), 'ticket' ) || false !== strpos( $o->get_payment_method(), 'boleto' );
		$criado = $o->get_date_created() ? $o->get_date_created()->getTimestamp() : time();
		if ( time() - $criado < ( $boleto ? DAY_IN_SECONDS : GLOWBOS_CRM_ESPERA ) || $criado < strtotime( GLOWBOS_CRM_DESDE ) ) continue;
		$o->update_meta_data( '_glowbos_crm_pendente', time() ); $o->save();
		$tel = glowbos_crm_digitos( $o->get_billing_phone() );
		if ( strlen( $tel ) < 10 || glowbos_crm_teste( $tel ) ) continue;
		$itens = []; foreach ( $o->get_items() as $it ) $itens[] = trim( $it->get_name() );
		glowbos_crm_formulario( $tel, $o->get_billing_first_name() . ' ' . $o->get_billing_last_name(), $o->get_billing_email(),
			( $boleto ? 'Boleto' : 'Pix' ) . ' não pago #' . $o->get_order_number() . ' R$ ' . number_format( (float) $o->get_total(), 0, ',', '.' ) . ': ' . implode( ', ', $itens ), 'Pedido não pago' );
	}
}
