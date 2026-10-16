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
		var pk = nome.match(/^Pacote (50|75|100|125) balões · (.+)$/);
		if (pk) return { k: 'pct' + pk[1], paleta: pk[2] };
		var av = nome.match(/^Pacote (\d+) balões (\d+)" · (.+)$/);
		if (av) return { k: 'pct' + av[2] + '_' + av[1], paleta: av[3] };
		var m = nome.match(/^Kit arco (60|100) peças[^·]*·\s*(.+)$/);
		if (m) return { k: m[1] === '60' ? 'kit60' : 'kit100', paleta: m[2] };
		return null;
	}
	var btn = document.querySelector('.gf .btn');
	if (!btn || !window.GB) return;
	btn.addEventListener('click', function (e) {
		e.preventDefault();
		var C = [];
		try { C = JSON.parse(localStorage.getItem('glowbos_cart_D')) || []; } catch (x) {}
		var itens = C.map(function (c) { var k = chaveDe(c.n); if (!k) return null; k.q = c.q; if (c.i && c.i.indexOf('data:image/jpeg') === 0) k.img = c.i; return k; }).filter(Boolean);
		if (!itens.length) return;
		btn.textContent = 'Indo pro checkout...';
		var fd = new FormData();
		fd.append('itens', JSON.stringify(itens));
		fetch(GB.sync, { method: 'POST', body: fd, credentials: 'same-origin' })
			.then(function (r) { return r.json(); })
			.then(function (j) {
				if (j && j.success) {
					try { localStorage.removeItem('glowbos_cart_D'); } catch (x) {}
					location.href = j.data.checkout;
				} else { btn.textContent = 'Finalizar compra'; }
			})
			.catch(function () { btn.textContent = 'Finalizar compra'; });
	});
})();
