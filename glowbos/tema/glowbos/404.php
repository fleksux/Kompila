<?php
get_header();
?>
<div class="gb-404">
	<span class="gb-404-n">404</span>
	<h1>Esse balão voou pra longe</h1>
	<p>A página que você procurou não existe ou mudou de lugar. Mas a sua festa continua aqui.</p>
	<div class="acoes">
		<a class="btn pri" href="<?php echo esc_url( home_url( '/loja/' ) ); ?>">Ver os balões</a>
		<a class="btn lin" href="<?php echo esc_url( home_url( '/#monte' ) ); ?>">Montar meu arco</a>
	</div>
</div>
<?php
get_footer();
