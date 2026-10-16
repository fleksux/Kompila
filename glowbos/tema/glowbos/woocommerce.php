<?php
get_header();
if ( function_exists( 'glowbos_dep_topo' ) ) {
	glowbos_dep_topo();
}
woocommerce_content();
get_footer();
