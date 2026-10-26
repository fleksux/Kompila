<?php
/**
 * Meus pedidos da Glowbos: lista leve, status em etiqueta colorida, ações discretas.
 * Substitui o myaccount/orders.php do WooCommerce (mesmas variáveis: $customer_orders, $has_orders, $current_page).
 */
defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_account_orders', $has_orders );

$gb_cor = array( 'processing' => 'ok', 'completed' => 'ok', 'on-hold' => 'esp', 'pending' => 'esp', 'cancelled' => 'off', 'refunded' => 'off', 'failed' => 'off' );
?>
<?php if ( $has_orders ) : ?>
	<h2 class="gb-ped-t">Meus pedidos</h2>
	<ul class="gb-peds">
		<?php
		foreach ( $customer_orders->orders as $customer_order ) :
			$order = wc_get_order( $customer_order ); // phpcs:ignore
			if ( ! $order ) {
				continue;
			}
			$st    = $order->get_status();
			$qtd   = $order->get_item_count() - $order->get_item_count_refunded();
			$acoes = wc_get_account_orders_actions( $order );
			?>
			<li class="gb-ped <?php echo esc_attr( $gb_cor[ $st ] ?? '' ); ?>">
				<a class="gb-ped-n" href="<?php echo esc_url( $order->get_view_order_url() ); ?>">
					<b>Pedido #<?php echo esc_html( $order->get_order_number() ); ?></b>
					<small><?php echo esc_html( wc_format_datetime( $order->get_date_created(), 'd/m/Y' ) ); ?> · <?php echo esc_html( $qtd . ( 1 === $qtd ? ' item' : ' itens' ) ); ?></small>
				</a>
				<span class="gb-ped-st"><?php echo esc_html( wc_get_order_status_name( $st ) ); ?></span>
				<strong class="gb-ped-v"><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></strong>
				<span class="gb-ped-a">
					<?php
					// "Pagar" vira o botão principal; o resto vira link
					foreach ( $acoes as $k => $a ) {
						$rotulo = 'view' === $k ? 'Ver detalhes' : $a['name'];
						printf( '<a href="%s" class="%s"%s>%s</a>', esc_url( $a['url'] ), 'pay' === $k ? 'gb-ped-pagar' : 'gb-ped-link ' . sanitize_html_class( $k ), 'cancel' === $k ? ' onclick="return confirm(\'Cancelar este pedido?\')"' : '', esc_html( $rotulo ) );
					}
					?>
				</span>
			</li>
		<?php endforeach; ?>
	</ul>

	<?php do_action( 'woocommerce_before_account_orders_pagination' ); ?>
	<?php if ( 1 < $customer_orders->max_num_pages ) : ?>
		<div class="gb-ped-pag">
			<?php if ( 1 !== $current_page ) : ?><a href="<?php echo esc_url( wc_get_endpoint_url( 'orders', $current_page - 1 ) ); ?>">← Mais recentes</a><?php endif; ?>
			<?php if ( intval( $customer_orders->max_num_pages ) !== $current_page ) : ?><a href="<?php echo esc_url( wc_get_endpoint_url( 'orders', $current_page + 1 ) ); ?>">Mais antigos →</a><?php endif; ?>
		</div>
	<?php endif; ?>
<?php else : ?>
	<div class="gb-ped-vazio"><b>Você ainda não fez nenhum pedido</b><p>Escolha as cores e a gente entrega. Em SP, pago até 12h chega hoje até 21h.</p><a class="button" href="<?php echo esc_url( home_url( '/loja/' ) ); ?>">Ver a loja</a></div>
<?php endif; ?>

<?php do_action( 'woocommerce_after_account_orders', $has_orders ); ?>
