// Coleve · site EV (kompila.com.br/coleve)
const topo = document.getElementById('topo');
const burger = topo.querySelector('.topo__burger');

// topo sólido depois do hero
const solido = () => topo.classList.toggle('is-solido', scrollY > 40);
solido();
addEventListener('scroll', solido, { passive: true });

// menu do celular
burger.addEventListener('click', () => {
  const aberto = topo.classList.toggle('is-aberto');
  burger.setAttribute('aria-expanded', aberto);
});
topo.querySelectorAll('.topo__nav a').forEach(a => a.addEventListener('click', () => {
  topo.classList.remove('is-aberto');
  burger.setAttribute('aria-expanded', false);
}));

// contadores dos números do setor
const fmt = (n, dec) => n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const contar = el => {
  const alvo = parseFloat(el.dataset.conta), dec = +(el.dataset.dec || 0);
  const pre = el.dataset.pre || '', suf = el.dataset.suf || '';
  const t0 = performance.now(), dur = 1600;
  const passo = t => {
    const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + fmt(alvo * e, dec) + suf;
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { contar(e.target); io.unobserve(e.target); }
  }), { threshold: .6 });
  document.querySelectorAll('[data-conta]').forEach(el => io.observe(el));
}

// uma dúvida aberta por vez
document.querySelectorAll('.duv').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) document.querySelectorAll('.duv[open]').forEach(o => o !== d && (o.open = false));
}));

// diagnóstico: valida e abre o WhatsApp da Coleve com as respostas
const form = document.getElementById('form-diag');
const aviso = form.querySelector('.form__aviso');
form.addEventListener('submit', ev => {
  ev.preventDefault();
  form.querySelectorAll('.erro').forEach(x => x.classList.remove('erro'));
  const d = Object.fromEntries(new FormData(form));
  const faltas = [];
  ['modelo', 'momento'].forEach(n => { if (!d[n]) faltas.push(form.querySelector(`[name=${n}]`).closest('fieldset')); });
  ['cidade', 'nome', 'whats'].forEach(n => { if (!d[n]?.trim()) faltas.push(form.querySelector(`[name=${n}]`).closest('.campo')); });
  if (faltas.length) {
    faltas.forEach(f => f.classList.add('erro'));
    aviso.textContent = 'Falta preencher o campo marcado.';
    faltas[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    faltas[0].querySelector('input')?.focus({ preventScroll: true });
    return;
  }
  aviso.textContent = '';
  const msg = [
    'Olá! Quero o diagnóstico EV Structure gratuito.',
    `Nome: ${d.nome}`,
    `WhatsApp: ${d.whats}`,
    `Modelo: ${d.modelo}`,
    `Momento: ${d.momento}`,
    `Cidade: ${d.cidade}`,
    d.carregadores ? `Carregadores: ${d.carregadores}` : ''
  ].filter(Boolean).join('\n');
  open('https://wa.me/5511920027321?text=' + encodeURIComponent(msg), '_blank', 'noopener');
});

// hero: troca de imagem a cada 6 s, traços na base
const slides = [...document.querySelectorAll('.hero .slide')];
const tracos = [...document.querySelectorAll('.hero__tracos button')];
let atual = 0, timer;
const mostra = i => {
  atual = i;
  slides.forEach((s, k) => s.classList.toggle('is-ativo', k === i));
  tracos.forEach((t, k) => t.classList.toggle('is-ativo', k === i));
};
const roda = () => { clearInterval(timer); timer = setInterval(() => mostra((atual + 1) % slides.length), 6000); };
tracos.forEach((t, k) => t.addEventListener('click', () => { mostra(k); roda(); }));
if (slides.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) roda();
