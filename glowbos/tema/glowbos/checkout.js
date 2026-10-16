/* Checkout da Glowbos: preenche pelo CEP, lembra os dados e leva o cliente até o pagamento. */
(function ($) {
	if (!$ || !document.querySelector('form.woocommerce-checkout')) return;
	var LS = 'glowbos_ck', GUARDA = ['billing_first_name', 'billing_last_name', 'billing_email', 'billing_phone', 'billing_postcode', 'billing_address_1', 'billing_number', 'billing_address_2', 'billing_neighborhood', 'billing_city', 'billing_state'];

	// títulos e textos
	function titulos() {
		var h = document.querySelector('.woocommerce-billing-fields h3');
		if (h && !h.querySelector('.n')) h.innerHTML = '<span class="n">1</span>Seus dados e endereço';
		var a = document.querySelector('.woocommerce-additional-fields h3');
		if (a && !a.querySelector('.n')) a.innerHTML = '<span class="n">2</span>Observações <small style="font:500 13px Inter;color:var(--vinho2)">(opcional)</small>';
		var o = document.getElementById('order_review_heading');
		if (o && !o.querySelector('.n')) o.innerHTML = '<span class="n">3</span>Resumo e pagamento';
		var t = document.querySelector('.woocommerce-checkout .gb-main h1, .woocommerce-checkout h1.entry-title');
		if (t && !document.querySelector('.gb-ck-sub')) t.insertAdjacentHTML('afterend', '<p class="gb-ck-sub">Digite o CEP que a gente completa o endereço. Em SP e Grande SP, pedido pago até 12h <b>chega hoje</b>.</p>');
		var m = document.querySelector('.woocommerce-checkout .woocommerce-message');
		if (m && /carrinho/.test(m.textContent)) m.style.display = 'none';
	}

	// selos embaixo do botão (o WooCommerce redesenha o resumo, então reaplica)
	function selos() {
		var b = document.getElementById('place_order');
		if (!b || document.querySelector('.gb-selos')) return;
		b.textContent = 'Finalizar pedido';
		b.insertAdjacentHTML('afterend', '<div class="gb-selos"><div><b>🔒 Pagamento seguro</b>Mercado Pago</div><div><b>⚡ Pix</b>confirma na hora</div><div><b>🚚 Chega hoje</b>pago até 12h em SP</div></div>');
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
				setTimeout(function () { var n = document.getElementById(pre + '_number'); if (n) n.focus(); }, 60);
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
	var ORDEM = [['billing_first_name','first'],['billing_last_name','last'],['billing_email','wide'],['billing_phone','first'],['billing_cpf','last'],['billing_postcode','first'],['billing_address_1','wide'],['billing_number','first'],['billing_address_2','last'],['billing_neighborhood','first'],['billing_city','last'],['billing_state','wide']];
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
