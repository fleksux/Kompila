<?php
/**
 * Início da Minha conta da Glowbos: saudação, último pedido e atalhos.
 */
defined( 'ABSPATH' ) || exit;
$u      = wp_get_current_user();
$nome   = $u->first_name ? $u->first_name : $u->display_name;
$ultimo = wc_get_orders( array( 'customer_id' => get_current_user_id(), 'limit' => 1, 'orderby' => 'date', 'order' => 'DESC' ) );
$o      = $ultimo ? $ultimo[0] : null;
$svg    = function ( $d ) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' . $d . '</svg>'; };
?>
<div class="gb-dash">
	<div class="gb-dash-oi">
		<h2>Olá, <?php echo esc_html( $nome ); ?>!</h2>
		<p>Aqui ficam seus pedidos, endereços e dados. <a href="<?php echo esc_url( wc_logout_url() ); ?>">Sair da conta</a></p>
	</div>

	<?php if ( $o ) : ?>
		<a class="gb-dash-ped" href="<?php echo esc_url( $o->get_view_order_url() ); ?>">
			<span class="gb-dash-ic"><?php echo $svg( '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>' ); // phpcs:ignore ?></span>
			<span class="t"><small>Último pedido · #<?php echo esc_html( $o->get_order_number() ); ?> · <?php echo esc_html( wc_format_datetime( $o->get_date_created(), 'd/m/Y' ) ); ?></small><b><?php echo esc_html( wc_get_order_status_name( $o->get_status() ) ); ?></b><?php echo wp_kses_post( $o->get_formatted_order_total() ); ?> · <?php echo (int) $o->get_item_count(); ?> item(ns)</span>
			<em>Ver pedido →</em>
		</a>
	<?php else : ?>
		<div class="gb-dash-ped vazio"><span class="t"><b>Você ainda não tem pedidos</b>Que tal começar pela festa?</span><a class="btn pri" href="<?php echo esc_url( home_url( '/loja/' ) ); ?>">Ver os balões</a></div>
	<?php endif; ?>

	<div class="gb-dash-atalhos">
		<a href="<?php echo esc_url( wc_get_account_endpoint_url( 'orders' ) ); ?>"><?php echo $svg( '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>' ); // phpcs:ignore ?><b>Meus pedidos</b><small>Status, nota e repetir compra</small></a>
		<a href="<?php echo esc_url( wc_get_account_endpoint_url( 'edit-address' ) ); ?>"><?php echo $svg( '<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>' ); // phpcs:ignore ?><b>Endereços</b><small>Onde a festa chega</small></a>
		<a href="<?php echo esc_url( wc_get_account_endpoint_url( 'edit-account' ) ); ?>"><?php echo $svg( '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>' ); // phpcs:ignore ?><b>Meus dados</b><small>Nome, e-mail e senha</small></a>
		<a href="https://wa.me/5511945231106?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20meu%20pedido%20na%20Glowbos" target="_blank" rel="noopener"><?php echo $svg( '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2Z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/>' ); // phpcs:ignore ?><b>Ajuda</b><small>Fale com a gente no WhatsApp</small></a>
	</div>
</div>
