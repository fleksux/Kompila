<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<?php echo glowbos_util_html(); // phpcs:ignore ?>
<header class="gb-head"><div class="gb-hd">
	<a class="gb-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo esc_url( get_template_directory_uri() . '/img/D_logo_crop.png' ); ?>" alt="Glowbos"></a>
	<?php echo glowbos_mega_html(); // phpcs:ignore ?>
	<nav class="gb-nav">
		<a href="<?php echo esc_url( home_url( '/categoria/decoracao-pronta/' ) ); ?>"<?php echo is_product_category( 'decoracao-pronta' ) ? ' class="on"' : ''; ?>>Decoração Pronta</a>
		<a href="<?php echo esc_url( home_url( '/categoria/pacotes/' ) ); ?>"<?php echo is_product_category( 'pacotes' ) ? ' class="on"' : ''; ?>>Pacotes sortidos</a>
		<a href="<?php echo esc_url( home_url( '/categoria/baloes-joy/' ) ); ?>"<?php echo is_product_category( 'baloes-joy' ) ? ' class="on"' : ''; ?>>Balões Joy</a>
		<a href="<?php echo esc_url( home_url( '/categoria/numeros/' ) ); ?>"<?php echo is_product_category( 'numeros' ) ? ' class="on"' : ''; ?>>Números</a>
		<a href="<?php echo esc_url( home_url( '/categoria/acessorios/' ) ); ?>"<?php echo is_product_category( 'acessorios' ) ? ' class="on"' : ''; ?>>Acessórios</a>
	</nav>
	<?php if ( function_exists( 'wc_get_cart_url' ) ) : ?>
		<a class="gb-conta" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>" aria-label="Minha conta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span><?php echo is_user_logged_in() ? 'Minha conta' : 'Entrar'; ?></span></a>
		<a class="gb-cart" href="<?php echo esc_url( wc_get_cart_url() ); ?>"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span>Carrinho</span><?php $gq = WC()->cart ? WC()->cart->get_cart_contents_count() : 0; if ( $gq ) : ?> <em class="gb-qt"><?php echo (int) $gq; ?></em><?php endif; ?></a>
	<?php endif; ?>
</div></header>
<main class="gb-main">
