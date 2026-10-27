<?php
/**
 * Pedido recebido da Glowbos: confirmação, linha do tempo, Pix (quando falta pagar) e resumo.
 * Baseado no checkout/thankyou.php do WooCommerce; os ganchos do Mercado Pago continuam rodando.
 */
defined( 'ABSPATH' ) || exit;

$gb_svg = function ( $d ) {
	return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' . $d . '</svg>';
};

if ( ! $order ) {
	echo '<div class="gb-ty"><div class="gb-ty-hero"><h1>Pedido recebido</h1><p>Obrigado! Seu pedido chegou pra gente.</p></div></div>';
	return;
}

do_action( 'woocommerce_before_thankyou', $order->get_id() );

$falhou  = $order->has_status( 'failed' );
$pago    = $order->is_paid();
$metodo  = $order->get_payment_method();
$pix     = 'woo-mercado-pago-pix' === $metodo;
$frete   = $order->get_shipping_method();
$motoboy = false !== stripos( $frete, 'motoboy' );
$hoje    = $motoboy && false !== stripos( $frete, 'hoje' );
$numero  = $order->get_order_number();
$nome    = $order->get_billing_first_name();

if ( $falhou ) {
	$titulo = 'O pagamento não passou';
	$sub    = 'Nenhum valor foi cobrado. Tente de novo, de preferência com Pix, que confirma na hora.';
	$icone  = $gb_svg( '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>' );
	$classe = 'erro';
} elseif ( $pago ) {
	$titulo = ( $nome ? esc_html( $nome ) . ', seu' : 'Seu' ) . ' pedido está confirmado!';
	$sub    = $hoje ? 'Pagamento aprovado. Já estamos separando os balões: <b>chega hoje até 21h</b>.' : 'Pagamento aprovado. Já estamos separando os seus balões.';
	$icone  = $gb_svg( '<path d="m5 12.5 4.5 4.5L19 7.5"/>' );
	$classe = 'ok';
} elseif ( $pix ) {
	$titulo = 'Falta só pagar o Pix';
	$sub    = 'Seu pedido está reservado. Pague com o QR Code abaixo e a confirmação chega na hora.';
	$icone  = $gb_svg( '<path d="M12 3 21 12 12 21 3 12Z"/><path d="m8 12 4-4 4 4-4 4Z"/>' );
	$classe = 'pix';
} else {
	$titulo = 'Pedido recebido!';
	$sub    = 'Estamos aguardando a confirmação do pagamento.';
	$icone  = $gb_svg( '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' );
	$classe = 'pix';
}

// linha do tempo: em que etapa o pedido está
$etapa = $falhou ? 1 : ( $pago ? 2 : 1 );
if ( $order->has_status( 'completed' ) ) {
	$etapa = 5;
}
$passos = array( 'Pedido feito', 'Pagamento', 'Separando', 'A caminho', 'Entregue' );
?>
<div class="gb-ty">
	<div class="gb-ty-hero <?php echo esc_attr( $classe ); ?>">
		<span class="gb-ty-ic"><?php echo $icone; // phpcs:ignore ?></span>
		<div>
			<small>Pedido #<?php echo esc_html( $numero ); ?> · <?php echo esc_html( wc_format_datetime( $order->get_date_created(), 'd/m/Y \à\s H:i' ) ); ?></small>
			<h1><?php echo wp_kses_post( $titulo ); ?></h1>
			<p><?php echo wp_kses_post( $sub ); ?></p>
		</div>
	</div>

	<?php if ( ! $falhou ) : ?>
	<ol class="gb-ty-passos">
		<?php foreach ( $passos as $i => $p ) : ?>
			<li class="<?php echo $i < $etapa ? 'feito' : ( $i === $etapa ? 'agora' : '' ); ?>"><span><?php echo $i < $etapa ? '✓' : (int) ( $i + 1 ); ?></span><?php echo esc_html( $p ); ?></li>
		<?php endforeach; ?>
	</ol>
	<?php endif; ?>

	<div class="gb-ty-grade">
		<div class="gb-ty-col">
			<?php if ( $falhou ) : ?>
				<div class="gb-ty-card"><div class="acoes"><a class="btn pri" href="<?php echo esc_url( add_query_arg( 'gb_cartao', '1', $order->get_checkout_payment_url() ) ); ?>">Tentar pagar de novo</a><a class="btn lin" href="<?php echo esc_url( home_url( '/' ) ); ?>">Voltar pra loja</a></div></div>
			<?php endif; ?>

			<?php if ( ! $pago && ! $falhou ) : ?>
				<div class="gb-ty-card gb-ty-pix">
					<?php
					ob_start();
					do_action( 'woocommerce_thankyou_' . $metodo, $order->get_id() );
					echo str_replace( array( '30 minutes', 'QR code' ), array( '30 minutos', 'QR Code' ), ob_get_clean() ); // phpcs:ignore -- HTML do Mercado Pago
					?>
					<?php if ( $pix && $order->needs_payment() ) : // 27/10: trocar Pix por cartão sem refazer o pedido ?>
						<a class="gb-ty-troca" href="<?php echo esc_url( add_query_arg( 'gb_cartao', '1', $order->get_checkout_payment_url() ) ); ?>">Prefere pagar com cartão? <b>Trocar forma de pagamento</b></a>
					<?php endif; ?>
				</div>
			<?php else : ?>
				<div class="gb-ty-card gb-ty-prox">
					<h3>O que acontece agora</h3>
					<ul>
						<li><?php echo $gb_svg( '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>' ); // phpcs:ignore ?><span><b>Confirmação no seu e-mail</b><?php echo esc_html( $order->get_billing_email() ); ?></span></li>
						<li><?php echo $gb_svg( '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>' ); // phpcs:ignore ?><span><b>Separação com as suas cores</b>A gente confere cor por cor antes de fechar a caixa.</span></li>
						<?php if ( $frete ) : ?><li><?php echo $gb_svg( '<path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>' ); // phpcs:ignore ?><span><b><?php echo $hoje ? 'Chega hoje até 21h' : ( $motoboy ? 'Chega amanhã até 21h' : 'Enviamos pelos Correios' ); ?></b><?php echo esc_html( $frete ? $frete : 'Entrega' ); ?></span></li><?php endif; ?>
					</ul>
				</div>
			<?php endif; ?>
			<?php
			// outros plugins que escrevem no "obrigado" continuam funcionando; a tabela padrão sai porque o resumo é nosso
			remove_action( 'woocommerce_thankyou', 'woocommerce_order_details_table', 10 );
			do_action( 'woocommerce_thankyou', $order->get_id() );
			?>
		</div>

		<aside class="gb-ty-card gb-ty-resumo">
			<h3>Resumo do pedido</h3>
			<ul class="itens">
				<?php foreach ( $order->get_items() as $item ) : ?>
					<li>
						<span><b><?php echo esc_html( $item->get_name() ); ?></b> <em>× <?php echo (int) $item->get_quantity(); ?></em>
						<?php $cores = $item->get_meta( 'Cores' ); if ( $cores ) : ?><small><?php echo esc_html( $cores ); ?></small><?php endif; ?></span>
						<strong><?php echo wp_kses_post( $order->get_formatted_line_subtotal( $item ) ); ?></strong>
					</li>
				<?php endforeach; ?>
			</ul>
			<dl>
				<?php if ( $frete ) : ?><dt>Entrega</dt><dd><?php echo wp_kses_post( wc_price( $order->get_shipping_total() ) ); ?></dd><?php endif; ?>
				<dt class="tot">Total</dt><dd class="tot"><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></dd>
				<dt>Pagamento</dt><dd><?php echo esc_html( $order->get_payment_method_title() ); ?></dd>
			</dl>
			<?php if ( $order->has_shipping_address() || $order->get_billing_address_1() ) : ?>
				<div class="end"><b>Endereço</b><?php echo wp_kses_post( $order->get_formatted_shipping_address() ? $order->get_formatted_shipping_address() : $order->get_formatted_billing_address() ); ?></div>
			<?php endif; ?>
			<div class="acoes">
				<a class="btn pri" href="<?php echo esc_url( home_url( '/' ) ); ?>">Continuar comprando</a>
				<a class="btn lin" href="<?php echo esc_url( wc_get_account_endpoint_url( 'orders' ) ); ?>">Meus pedidos</a>
			</div>
		</aside>
	</div>
</div>
