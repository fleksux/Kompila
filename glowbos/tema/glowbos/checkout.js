/* Checkout da Glowbos: preenche pelo CEP, lembra os dados e leva o cliente até o pagamento. */
(function ($) {
	if (!$ || !document.querySelector('form.woocommerce-checkout')) return;
	var LS = 'glowbos_ck', GUARDA = ['billing_first_name', 'billing_email', 'billing_phone', 'billing_postcode', 'billing_address_1', 'billing_number', 'billing_address_2', 'billing_neighborhood', 'billing_city', 'billing_state'];

	// títulos e textos
	function titulos() {
		var h = document.querySelector('.woocommerce-billing-fields h3');
		if (h && !h.querySelector('.n')) h.innerHTML = '<span class="n">1</span>Seus dados e endereço';
		var a = document.querySelector('.woocommerce-additional-fields h3');
		if (a && !a.querySelector('.n')) a.innerHTML = '<span class="n">2</span>Observações <small style="font:500 13px Inter;color:var(--vinho2)">(opcional)</small>';
		var o = document.getElementById('order_review_heading');
		if (o && !o.querySelector('.n')) o.innerHTML = '<span class="n">3</span>Resumo e pagamento';
		var t = document.querySelector('.woocommerce-checkout .gb-main h1, .woocommerce-checkout h1.entry-title');
		if (t && !document.querySelector('.gb-ck-sub')) t.insertAdjacentHTML('afterend', '<p class="gb-ck-sub">Digite o CEP que a gente completa o endereço. Em SP e Grande SP, pedido pago até 12h <b>chega hoje até 21h</b>. Depois das 12h, chega amanhã até 21h.</p>');
		var m = document.querySelector('.woocommerce-checkout .woocommerce-message');
		if (m && /carrinho/.test(m.textContent)) m.style.display = 'none';
	}

	// selos embaixo do botão (o WooCommerce redesenha o resumo, então reaplica)
	function selos() {
		var b = document.getElementById('place_order');
		if (!b || document.querySelector('.gb-selos')) return;
		b.textContent = 'Finalizar pedido';
		b.insertAdjacentHTML('afterend', '<div class="gb-selos"><div><i><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"/></svg></i><span><b>Pagamento seguro</b>Mercado Pago</span></div><div><i><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3 21 12 12 21 3 12Z\"/><path d=\"m8 12 4-4 4 4-4 4Z\"/></svg></i><span><b>Pix</b>confirma na hora</span></div><div><i><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 6h12v10H2zM14 9h4l3 3.5V16h-7\"/><circle cx=\"6\" cy=\"17.5\" r=\"1.8\"/><circle cx=\"17\" cy=\"17.5\" r=\"1.8\"/></svg></i><span><b>Chega hoje até 21h</b>pago até 12h em SP</span></div></div><a class="gb-shopee" href="https://shopee.com.br/shop/414535277" target="_blank" rel="noopener"><span class="st">★★★★★</span><span><b>4,9 na Shopee</b> · +67 mil avaliações · +121 mil vendidos</span><em>Ver a loja ↗</em></a><p class="gb-cnpj">Mayara Festas e Decorações LTDA · CNPJ 45.147.944/0001-24 · Santo André/SP</p>');
	}

	// lembra os dados da última compra (nunca o CPF)
	function restaura() {
		var d; try { d = JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { d = {}; }
		GUARDA.forEach(function (id) { var el = document.getElementById(id); if (el && !el.value && d[id]) { el.value = d[id]; } });
		if (d.billing_state) $('#billing_state').val(d.billing_state).trigger('change');
	}
	function guarda() {
		var d = {}; GUARDA.forEach(function (id) { var el = document.getElementById(id); if (el && el.value) d[id] = el.value; });
		try { localStorage.setItem(LS, JSON.stringify(d)); } catch (e) {}
	}

	// CEP preenche rua, bairro, cidade e estado
	function cep(pre) {
		var $c = $('#' + pre + '_postcode');
		if (!$c.length) return;
		var $msg = $('<div class="gb-cep-ok" hidden></div>').insertAfter($c);
		$c.attr({ inputmode: 'numeric', autocomplete: 'postal-code' });
		$c.on('input', function () {
			var v = this.value.replace(/\D/g, '').slice(0, 8);
			this.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
			if (v.length !== 8) { $msg.prop('hidden', true); return; }
			$msg.prop('hidden', false).removeClass('err').text('Buscando o endereço...');
			fetch('https://viacep.com.br/ws/' + v + '/json/').then(function (r) { return r.json(); }).then(function (j) {
				if (j.erro) { $msg.addClass('err').text('CEP não encontrado. Confira os números.'); return; }
				if (j.logradouro) $('#' + pre + '_address_1').val(j.logradouro);
				if (j.bairro) $('#' + pre + '_neighborhood').val(j.bairro);
				if (j.localidade) $('#' + pre + '_city').val(j.localidade);
				if (j.uf) $('#' + pre + '_state').val(j.uf).trigger('change');
				$msg.text('✓ ' + [j.logradouro, j.bairro, j.localidade + '/' + j.uf].filter(Boolean).join(', '));
				$(document.body).trigger('update_checkout');
				setTimeout(function () { var n = document.getElementById(pre + '_number'); if (n && !n.value) n.focus(); }, 60);
				guarda();
			}).catch(function () { $msg.prop('hidden', true); });
		});
	}

	// quando tudo que é obrigatório estiver preenchido, desce até o pagamento (uma vez)
	var desceu = false;
	function completo() {
		var falta = $('.woocommerce-billing-fields .validate-required').filter(function () {
			var i = $(this).find('input,select').first(); return i.length && !String(i.val() || '').trim();
		});
		return falta.length === 0;
	}
	function talvezDesce() {
		if (desceu || !completo()) return;
		desceu = true;
		var p = document.getElementById('order_review_heading');
		if (p && window.innerWidth < 900) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
		var b = document.getElementById('place_order'); if (b) { b.classList.add('pulsa'); setTimeout(function () { b.classList.remove('pulsa'); }, 1600); }
	}

	// telefone: a máscara é a do plugin brasileiro (duas máscaras brigavam); aqui só o teclado numérico
	$('#billing_phone').attr({ inputmode: 'tel', autocomplete: 'tel' });


	// ordem e largura dos campos (o WooCommerce reordena pelo país; aqui manda a nossa)
	var ORDEM = [['billing_postcode','first'],['billing_address_1','wide'],['billing_number','first'],['billing_address_2','last'],['billing_neighborhood','first'],['billing_city','last'],['billing_state','wide'],['billing_first_name','wide'],['billing_email','wide'],['billing_phone','first'],['billing_cpf','last']];
	function ordena() {
		var w = document.querySelector('.woocommerce-billing-fields__field-wrapper'); if (!w) return;
		ORDEM.forEach(function (o, i) {
			var r = document.getElementById(o[0] + '_field'); if (!r) return;
			r.classList.remove('form-row-first', 'form-row-last', 'form-row-wide'); r.classList.add('form-row-' + o[1]);
			r.setAttribute('data-priority', (i + 1) * 10); w.appendChild(r);
		});
		var a1 = document.getElementById('billing_address_1'); if (a1) a1.placeholder = 'Preenche sozinho pelo CEP';
		var a2 = document.getElementById('billing_address_2'); if (a2) a2.placeholder = 'Apto, bloco (opcional)';
		var f2 = document.getElementById('billing_address_2_field'); if (f2 && !f2.querySelector('label.gb')) { var l = f2.querySelector('label'); if (l) { l.classList.remove('screen-reader-text'); l.classList.add('gb'); l.textContent = 'Complemento'; } }
		var pl = document.querySelector('#billing_phone_field label'); if (pl && !/Celular/.test(pl.textContent)) pl.firstChild.textContent = 'Celular (WhatsApp) ';
	}
	ordena(); setTimeout(ordena, 300);
	$(document.body).on('country_to_state_changed updated_checkout', function () { setTimeout(ordena, 30); });

	titulos(); restaura(); cep('billing'); cep('shipping'); selos();
	$(document.body).on('updated_checkout', function () { selos(); });
	$('form.woocommerce-checkout').on('change blur', 'input,select', function () { guarda(); talvezDesce(); });
	if ($('#billing_postcode').val()) $(document.body).trigger('update_checkout');
})(window.jQuery);
