/* Apps de produto da Glowbos: a página do produto é o montador.
   Tipos: sequencia (pacote, candy, kit) e quantidade (pacote fechado, metalizado). */
(function () {
	var box = document.getElementById('gbApp2');
	if (!box) return;
	var D = box.dataset, IMG = D.img, $ = function (s, r) { return (r || document).querySelector(s); };
	var R = function (v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
	var ARQ = ['branco', 'preto', 'vermelho', 'amarelo', 'laranja', 'pink', 'rosa', 'lilas', 'roxo', 'azul_cobalto', 'azul_royal', 'azul_celeste', 'azul_baby', 'tiffany', 'verde_agua', 'verde_bandeira', 'verde_citrus', 'marrom', 'bege', 'cinza', 'dourado'];
	var LISOS = [['Branco', 0], ['Preto', 1], ['Vermelho', 2], ['Amarelo', 3], ['Laranja', 4], ['Pink', 5], ['Rosa', 6], ['Lilás', 7], ['Roxo', 8], ['Azul Cobalto', 9], ['Azul Royal', 10], ['Azul Celeste', 11], ['Azul Baby', 12], ['Tiffany', 13], ['Verde Água', 14], ['Verde Bandeira', 15], ['Verde Citrus', 16], ['Marrom', 17], ['Bege', 18], ['Cinza', 19], ['Dourado', 20]];
	var CANDY = [['Rosa candy', 6], ['Azul candy', 12], ['Lilás candy', 7], ['Verde candy', 14], ['Branco', 0], ['Bege', 18]];
	var METAL = [['Dourado', '#c9a24a', '#f3dc8b'], ['Prata', '#9da3a8', '#e9ecef'], ['Rosê gold', '#c98f7f', '#f4cfc3'], ['Rosa', '#e86aa0', '#ffc3dc'], ['Vermelho', '#b81d27', '#ff7a80'], ['Azul', '#2153b8', '#8fb4ff'], ['Verde', '#16804a', '#86e0ad'], ['Roxo', '#6a32b0', '#c4a1f2'], ['Grafite', '#2b2b30', '#8a8a92']];
	var PAL = D.paleta === 'candy' ? CANDY : D.paleta === 'metal' ? METAL : LISOS;
	var preco = +D.preco, pid = D.pid, nome = D.nome;
	var POS = [[50, 22, 30, -3], [34, 30, 29, 9], [66, 29, 29, -8], [42, 40, 31, 4], [60, 42, 30, -5], [25, 48, 28, 11], [75, 48, 28, -11], [50, 54, 31, 1], [36, 62, 29, 7], [64, 63, 29, -6], [50, 72, 30, 2], [22, 66, 26, 13], [78, 66, 26, -13]];
	function cacho(ks) {
		var ord = POS.map(function (p, i) { return [p, i]; }).sort(function (a, b) { return a[0][1] - b[0][1]; });
		return '<span class="cc-sombra"></span>' + ord.map(function (o) { var p = o[0], k = ks[o[1] % ks.length]; return '<img class="cc-b" src="' + IMG + 'b_' + ARQ[k] + '.webp" alt="" style="left:' + p[0] + '%;top:' + p[1] + '%;height:' + p[2] + '%;transform:translate(-50%,-50%) rotate(' + p[3] + 'deg)">'; }).join('');
	}
	function foto(ks) {
		return new Promise(function (res) {
			try {
				var S = 480, c = document.createElement('canvas'); c.width = c.height = S; var x = c.getContext('2d');
				x.fillStyle = '#F7F3EA'; x.fillRect(0, 0, S, S);
				var ord = POS.map(function (p, i) { return [p, i]; }).sort(function (a, b) { return a[0][1] - b[0][1]; }), falta = ord.length, imgs = [];
				ord.forEach(function (o, j) { var im = new Image(); im.onload = im.onerror = function () { if (--falta) return; try { ord.forEach(function (o2, j2) { var m = imgs[j2], p = o2[0]; if (!m.naturalWidth) return; var h = S * p[2] / 100, w = m.naturalWidth * h / m.naturalHeight; x.save(); x.translate(S * p[0] / 100, S * p[1] / 100); x.rotate(p[3] * Math.PI / 180); x.drawImage(m, -w / 2, -h / 2, w, h); x.restore(); }); res(c.toDataURL('image/jpeg', .82)); } catch (e) { res(null); } }; imgs[j] = im; im.src = IMG + 'b_' + ARQ[ks[o[1] % ks.length]] + '.webp'; });
			} catch (e) { res(null); }
		});
	}
	function toast(t, link) {
		var e = $('#gbToast'); if (!e) { e = document.createElement('div'); e.id = 'gbToast'; document.body.appendChild(e); }
		e.innerHTML = t + (link ? ' <a href="' + link + '">Ver carrinho</a>' : ''); e.className = 'on'; clearTimeout(e._t); e._t = setTimeout(function () { e.className = ''; }, 4200);
	}
	function contaMenu(n) { var c = $('.gb-cart'); if (!c) return; var q = c.querySelector('.gb-qt'); if (!q) { q = document.createElement('em'); q.className = 'gb-qt'; c.appendChild(q); } q.textContent = n; }

	// prévia grande no lugar da foto do produto (apps de sequência)
	var prev = null;
	if (D.tipo === 'sequencia') {
		var gal = $('.woocommerce-product-gallery');
		if (gal) { prev = document.createElement('div'); prev.className = 'gb-prev'; gal.appendChild(prev); }
	}

	if (D.tipo === 'sequencia') {
		var N = +D.cores, SEQ = [];
		box.innerHTML = '<p class="gb-st"><i>1</i> Escolha ' + N + ' cores, na ordem do cacho <small id="gbCnt"></small></p><div class="gb-slots" id="gbSlots"></div><div class="gb-cores" id="gbCores"></div>' +
			'<div class="gb-buy"><div><small>' + D.resumo + '</small><b>' + R(preco) + '</b></div><button type="button" class="gb-btn" id="gbAdd" disabled></button></div><p class="gb-nota">Em SP e Grande SP, pago até 12h chega hoje.</p>';
		$('#gbCores').innerHTML = PAL.map(function (c, i) { return '<button type="button" class="gb-cor" data-i="' + i + '"><img src="' + IMG + 'b_' + ARQ[c[1]] + '.webp" alt="">' + c[0] + '</button>'; }).join('');
		var pinta = function () {
			$('#gbSlots').innerHTML = Array.from({ length: N }, function (_, i) { var k = SEQ[i]; return k === undefined ? '<div class="gb-slot"><i>' + (i + 1) + '</i>escolha</div>' : '<button type="button" class="gb-slot cheio" data-s="' + i + '" title="Tirar"><i>' + (i + 1) + '</i><img src="' + IMG + 'b_' + ARQ[PAL[k][1]] + '.webp" alt="">' + PAL[k][0] + ' <span>×</span></button>'; }).join('');
			box.querySelectorAll('.gb-cor').forEach(function (b) { b.classList.toggle('usada', SEQ.indexOf(+b.dataset.i) > -1 || SEQ.length >= N); });
			$('#gbCnt').textContent = SEQ.length + ' de ' + N;
			var falta = N - SEQ.length, b = $('#gbAdd'); b.disabled = falta > 0; b.textContent = falta > 0 ? 'Escolha ' + (falta === 1 ? 'mais 1 cor' : 'mais ' + falta + ' cores') : 'Colocar no carrinho';
			if (prev) { prev.innerHTML = '<div class="cacho' + (SEQ.length ? '' : ' vazio') + '">' + (SEQ.length ? cacho(SEQ.map(function (k) { return PAL[k][1]; })) : '<img class="cc-foto" src="' + IMG + 'pack_branco.webp" alt="">') + (SEQ.length ? '<span class="gb-tag">' + SEQ.map(function (k) { return PAL[k][0]; }).join(' · ') + '</span>' : '<div class="gb-vazio"><b>Escolha suas cores<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M14 7l5 5-5 5"/></svg></b></div>') + '</div>'; }
		};
		$('#gbCores').addEventListener('click', function (e) { var b = e.target.closest('.gb-cor'); if (!b || SEQ.length >= N || SEQ.indexOf(+b.dataset.i) > -1) return; SEQ.push(+b.dataset.i); pinta(); });
		$('#gbSlots').addEventListener('click', function (e) { var s = e.target.closest('.gb-slot.cheio'); if (!s) return; SEQ.splice(+s.dataset.s, 1); pinta(); });
		$('#gbAdd').onclick = function () {
			var b = this; b.disabled = true; b.textContent = 'Montando a foto...';
			foto(SEQ.map(function (k) { return PAL[k][1]; })).then(function (img) {
				var f = $('#gbForm'); f.paleta.value = SEQ.map(function (k) { return PAL[k][0]; }).join(', '); f.gb_img.value = img || ''; f.submit();
			});
		};
		pinta();
	}

	if (D.tipo === 'quantidade') {
		var Q = PAL.map(function () { return 0; });
		var sw = function (c, i) { return D.paleta === 'metal' ? '<i class="gb-sw" style="background:radial-gradient(circle at 32% 28%,' + c[2] + ' 0,' + c[1] + ' 62%)"></i>' : '<img src="' + IMG + 'b_' + ARQ[c[1]] + '.webp" alt="">'; };
		box.innerHTML = '<p class="gb-st"><i>1</i> Quantos pacotes de cada cor? <small>' + D.resumo + ' por pacote</small></p><div class="gb-qcores" id="gbQ"></div>' +
			'<div class="gb-buy"><div><small id="gbQsel">Nenhum pacote ainda</small><b id="gbQtot">' + R(0) + '</b></div><button type="button" class="gb-btn" id="gbQadd" disabled>Escolha as cores</button></div><p class="gb-nota">Em SP e Grande SP, pago até 12h chega hoje.</p>';
		$('#gbQ').innerHTML = PAL.map(function (c, i) { return '<div class="gb-q" data-i="' + i + '">' + sw(c, i) + '<span>' + c[0] + '</span><div class="gb-step"><button type="button" data-d="-1" aria-label="Menos">−</button><em>0</em><button type="button" data-d="1" aria-label="Mais">+</button></div></div>'; }).join('');
		var soma = function () {
			var n = Q.reduce(function (a, b) { return a + b; }, 0);
			$('#gbQsel').textContent = n ? n + (n === 1 ? ' pacote' : ' pacotes') + ' · ' + Q.map(function (q, i) { return q ? q + '× ' + PAL[i][0] : ''; }).filter(Boolean).join(', ') : 'Nenhum pacote ainda';
			$('#gbQtot').textContent = R(n * preco);
			var b = $('#gbQadd'); b.disabled = !n; b.textContent = n ? 'Colocar ' + n + (n === 1 ? ' pacote' : ' pacotes') + ' no carrinho' : 'Escolha as cores';
		};
		$('#gbQ').addEventListener('click', function (e) { var b = e.target.closest('button[data-d]'); if (!b) return; var r = b.closest('.gb-q'), i = +r.dataset.i; Q[i] = Math.max(0, Math.min(50, Q[i] + +b.dataset.d)); r.querySelector('em').textContent = Q[i]; r.classList.toggle('on', Q[i] > 0); soma(); });
		$('#gbQadd').onclick = function () {
			var b = this, itens = Q.map(function (q, i) { return q ? { pid: +pid, q: q, paleta: PAL[i][0] } : null; }).filter(Boolean);
			b.disabled = true; b.textContent = 'Colocando...';
			var fd = new FormData(); fd.append('itens', JSON.stringify(itens));
			fetch(D.add, { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
				if (j && j.success) { toast('✓ Pacotes no carrinho.', j.data.carrinho); contaMenu(j.data.qtd); Q = Q.map(function () { return 0; }); box.querySelectorAll('.gb-q').forEach(function (r) { r.classList.remove('on'); r.querySelector('em').textContent = 0; }); }
				else toast('Não deu certo. Tente de novo.');
				soma();
			}).catch(function () { toast('Sem conexão. Tente de novo.'); soma(); });
		};
		soma();
	}
	if (D.tipo === 'bubble') {
		var BS = [];
		box.innerHTML = '<p class="gb-st"><i>1</i> O nome ou a frase</p><div class="gb-orc" style="grid-template-columns:1fr;margin-bottom:16px"><input id="gbFr" maxlength="40" placeholder="Ex.: Alice 1 aninho"></div>' +
			'<p class="gb-st"><i>2</i> Até 3 cores pros balõezinhos de dentro <small id="gbBc"></small></p><div class="gb-cores" id="gbBcores" style="margin-bottom:16px"></div>' +
			'<p class="gb-st"><i>3</i> Pra quando e onde</p><div class="gb-orc"><input id="gbW" inputmode="tel" placeholder="Seu WhatsApp com DDD" autocomplete="tel"><input id="gbDt" type="date" aria-label="Data da festa"><input id="gbCep" inputmode="numeric" placeholder="CEP da festa" maxlength="9"></div>' +
			'<div class="gb-buy"><div><small id="gbBsel">Bubble personalizado</small><b>Sob encomenda</b></div><button type="button" class="gb-btn" id="gbOrc">Pedir orçamento</button></div><p class="gb-nota2">A gente responde no WhatsApp com o valor e a data de entrega.</p>';
		$('#gbBcores').innerHTML = PAL.map(function (c, i) { return '<button type="button" class="gb-cor" data-i="' + i + '"><img src="' + IMG + 'b_' + ARQ[c[1]] + '.webp" alt="">' + c[0] + '</button>'; }).join('');
		var bp = function () { box.querySelectorAll('#gbBcores .gb-cor').forEach(function (b) { b.classList.toggle('on', BS.indexOf(+b.dataset.i) > -1); }); $('#gbBc').textContent = BS.length + ' de 3'; var fr = $('#gbFr').value.trim(); $('#gbBsel').textContent = 'Bubble' + (fr ? ' "' + fr + '"' : '') + (BS.length ? ' · ' + BS.map(function (k) { return PAL[k][0]; }).join(', ') : ''); };
		$('#gbBcores').addEventListener('click', function (e) { var b = e.target.closest('.gb-cor'); if (!b) return; var i = +b.dataset.i, k = BS.indexOf(i); if (k > -1) BS.splice(k, 1); else if (BS.length < 3) BS.push(i); bp(); });
		$('#gbFr').addEventListener('input', bp);
		$('#gbOrc').onclick = function () {
			var w = $('#gbW'), b = this;
			if (w.value.replace(/\D/g, '').length < 10) { w.focus(); w.classList.add('erro'); toast('Coloque seu WhatsApp com DDD pra gente responder.'); return; }
			w.classList.remove('erro'); b.disabled = true; b.textContent = 'Enviando...';
			var fd = new FormData(); fd.append('tipo', 'Bubble · cores: ' + (BS.map(function (k) { return PAL[k][0]; }).join(', ') || 'a combinar')); fd.append('nome', $('#gbFr').value); fd.append('wpp', w.value); fd.append('data', $('#gbDt').value); fd.append('cep', $('#gbCep').value);
			fetch(D.orc, { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (j) {
				if (j && j.success) { box.querySelector('.gb-buy').outerHTML = '<div class="gb-ok"><b>✓ Pedido recebido!</b> A gente te chama no WhatsApp com o valor do seu bubble.</div>'; }
				else { b.disabled = false; b.textContent = 'Pedir orçamento'; toast('Não deu certo. Tente de novo.'); }
			}).catch(function () { b.disabled = false; b.textContent = 'Pedir orçamento'; });
		};
		bp();
	}
	if (D.tipo === 'numero') {
		var NUM = '5', EST = ['rose', 'Rosé'], ESTS = [['rose', 'Rosé'], ['ouro', 'Ouro e preto'], ['lilas', 'Candy'], ['azul', 'Azul']];
		var gimg = $('.woocommerce-product-gallery'), pv = null;
		if (gimg) { pv = document.createElement('div'); pv.className = 'gb-prev gb-prev-num'; gimg.appendChild(pv); }
		box.innerHTML = '<p class="gb-st"><i>1</i> O número</p><div class="gb-dig" id="gbDig"></div>' +
			'<p class="gb-st"><i>2</i> O estilo</p><div class="gb-est" id="gbEst"></div>' +
			'<p class="gb-st"><i>3</i> Pra quando e onde</p><div class="gb-orc"><input id="gbW" inputmode="tel" placeholder="Seu WhatsApp com DDD" autocomplete="tel"><input id="gbDt" type="date" aria-label="Data da festa"><input id="gbCep" inputmode="numeric" placeholder="CEP da festa" maxlength="9"></div>' +
			'<div class="gb-buy"><div><small id="gbNsel"></small><b>Sob encomenda</b></div><button type="button" class="gb-btn" id="gbOrc">Pedir orçamento</button></div><p class="gb-nota2">A gente responde no WhatsApp com o valor e a data de entrega.</p>';
		$('#gbDig').innerHTML = Array.from({ length: 10 }, function (_, k) { return '<button type="button" data-n="' + k + '"' + (k === 5 ? ' class="on"' : '') + '>' + k + '</button>'; }).join('');
		var est = function () { $('#gbEst').innerHTML = ESTS.map(function (e) { return '<button type="button" data-e="' + e[0] + '"' + (e[0] === EST[0] ? ' class="on"' : '') + '><img src="' + IMG + 'num_' + e[0] + '_' + NUM + '.webp" alt="">' + e[1] + '</button>'; }).join(''); };
		var pn = function () { est(); $('#gbNsel').textContent = 'Número ' + NUM + ' · ' + EST[1]; if (pv) pv.innerHTML = '<img src="' + IMG + 'num_' + EST[0] + '_' + NUM + '.webp" alt="Coluna com número ' + NUM + '">'; };
		$('#gbDig').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; box.querySelectorAll('#gbDig button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); NUM = b.dataset.n; pn(); });
		$('#gbEst').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; EST = ESTS.filter(function (x) { return x[0] === b.dataset.e; })[0]; pn(); });
		$('#gbOrc').onclick = function () {
			var w = $('#gbW'), b = this;
			if (w.value.replace(/\D/g, '').length < 10) { w.focus(); w.classList.add('erro'); toast('Coloque seu WhatsApp com DDD pra gente responder.'); return; }
			w.classList.remove('erro'); b.disabled = true; b.textContent = 'Enviando...';
			var fd = new FormData(); fd.append('tipo', 'Número ' + NUM + ' · ' + EST[1]); fd.append('wpp', w.value); fd.append('data', $('#gbDt').value); fd.append('cep', $('#gbCep').value); fd.append('nome', '');
			fetch(D.orc, { method: 'POST', body: fd }).then(function (r) { return r.json(); }).then(function (j) {
				if (j && j.success) { box.querySelector('.gb-buy').outerHTML = '<div class="gb-ok"><b>✓ Pedido recebido!</b> A gente te chama no WhatsApp com o valor do número ' + NUM + ' ' + EST[1] + '.</div>'; }
				else { b.disabled = false; b.textContent = 'Pedir orçamento'; toast('Não deu certo. Tente de novo.'); }
			}).catch(function () { b.disabled = false; b.textContent = 'Pedir orçamento'; toast('Sem conexão. Tente de novo.'); });
		};
		pn();
	}
})();
