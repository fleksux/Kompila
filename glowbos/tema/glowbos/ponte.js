// Liga o carrinho da home ao WooCommerce: o botão "Finalizar compra" manda os itens
// pro carrinho de verdade (com a paleta do kit) e leva pro checkout.
(function () {
	var CHAVE = {
		'Azul, vermelho e amarelo': 'pack_azul',
		'Vermelho, preto e amarelo': 'pack_preto',
		'Laranja, marrom e verde': 'pack_laranja',
		'Candy: rosa, lilás e azul': 'pack_candy',
		'Fita 5 m + dupla face': 'fita'
	};
	function chaveDe(nome) {
		if (CHAVE[nome]) return { k: CHAVE[nome] };
		var pk = nome.match(/^Pacote (25|50|75|100|125) balões · (.+)$/);
		if (pk) return { k: 'pct' + pk[1], paleta: pk[2] };
		var av = nome.match(/^Pacote (\d+) balões (\d+)" · (.+)$/);
		if (av) return { k: 'pct' + av[2] + '_' + av[1], paleta: av[3] };
		var m = nome.match(/^Kit arco (60|80|100|112|120) peças[^·]*·\s*(.+)$/);
		if (m) return { k: 'kit' + m[1], paleta: m[2] };
		return null;
	}
	window.gbChave = chaveDe;
	// 27/10: o cantinho já é o carrinho da loja; Finalizar compra vai direto pro checkout
	var btn = document.querySelector('.gf .btn');
	if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); btn.textContent = 'Indo pro checkout...'; location.href = '/finalizar-compra/'; });
})();
