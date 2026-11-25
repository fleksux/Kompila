// Sistema Coleve · Propostas (item #1 do Backlog Order do Manu, 24/11/2026)
// Funil: reunião comercial -> proposta -> aceite -> contrato (Autentique) -> cliente + onboarding.
// A tela só pergunta e mostra: plano, motivo, desconto e preço saem do banco (gatilho proposta_calcula).
import { banco, quemSou, raiz } from '../conexao.js?v=2';
import { deLinha, docHTML, textoWhats, reais } from '../proposta-doc.js?v=1';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;
const chefe = ['admin', 'gestor'].includes(P.papel);
if (P.area === 'marketing' && !chefe) { location.replace('../'); throw 0; }

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '';
const soDig = s => String(s || '').replace(/\D/g, '');
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 6000); };
const link = p => raiz + 'proposta/?t=' + p.token;

$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

const [{ data: planos }, { data: reunioes }] = await Promise.all([
  banco.from('plano_comercial').select('*').order('ordem'),
  banco.from('v_reuniao').select('id,titulo,quando,empresa_nome').order('quando', { ascending: false }).limit(40)
]);
const PLANOS = planos || [];
$('plano_codigo').innerHTML = PLANOS.filter(p => p.ativo).map(p => `<option value="${p.codigo}">${esc(p.nome)} · ${reais(p.preco)}</option>`).join('');
(reunioes || []).forEach(r => $('reuniao_id').insertAdjacentHTML('beforeend', `<option value="${r.id}">${dataBR(r.quando)} · ${esc(r.titulo)}${r.empresa_nome ? ' · ' + esc(r.empresa_nome) : ''}</option>`));

// ===== prévia / PDF: ?ver=<id> =====
const ver = new URLSearchParams(location.search).get('ver');
if (ver) {
  const { data: p } = await banco.from('v_proposta').select('*').eq('id', ver).maybeSingle();
  document.querySelector('.barra').hidden = true; document.querySelector('main').hidden = true;
  document.body.classList.add('modo-doc');
  $('doc').hidden = false;
  $('doc').innerHTML = p
    ? `<div class="pc-acoes"><button type="button" class="btn-a" onclick="print()">Salvar PDF</button></div>` + docHTML(deLinha(p, PLANOS), { raizImg: '../../img/' })
    : '<p>Proposta não encontrada.</p>';
  document.title = 'Proposta ' + (p?.numero || '');
  document.body.classList.remove('carregando');
  throw 0;
}

// ===== funil =====
const ETAPAS = [
  ['rascunho', 'Rascunho', 'Montando'],
  ['enviada', 'Enviada', 'Esperando o cliente abrir'],
  ['vista', 'Vista', 'O cliente abriu'],
  ['aceita', 'Aceita', 'Mandar o contrato'],
  ['assinada', 'Contrato assinado', 'Virou cliente'],
  ['perdida', 'Perdida', '']
];
let lista = [];
async function carrega() {
  const { data, error } = await banco.from('v_proposta').select('*').order('atualizado_em', { ascending: false });
  if (error) return avisa('Não deu para carregar as propostas.');
  lista = data || [];
  $('total').textContent = `· ${lista.length}`;
  const abertas = lista.filter(p => ['enviada', 'vista'].includes(p.status));
  const mes = new Date().toISOString().slice(0, 7);
  const fechadas = lista.filter(p => p.status === 'assinada' && (p.contrato_assinado_em || '').startsWith(mes));
  const decididas = lista.filter(p => ['assinada', 'perdida', 'aceita'].includes(p.status));
  $('numeros').innerHTML = [
    [abertas.length, 'com o cliente agora'],
    [reais(abertas.reduce((s, p) => s + Number(p.preco_final || 0) * p.qtd_cnpj, 0)), 'por mês em aberto'],
    [fechadas.length, 'contratos assinados no mês'],
    [decididas.length ? Math.round(lista.filter(p => ['aceita', 'assinada'].includes(p.status)).length / decididas.length * 100) + '%' : '-', 'das decididas foram aceitas']
  ].map(([n, t]) => `<div class="num"><strong>${n}</strong><span>${t}</span></div>`).join('');
  $('funil').innerHTML = ETAPAS.map(([st, nome, dica]) => {
    const itens = lista.filter(p => p.status === st);
    return `<div class="pp-col pp-col--${st}">
      <header><b>${nome}</b><span>${itens.length}</span>${dica ? `<small>${dica}</small>` : ''}</header>
      ${itens.map(card).join('') || '<p class="pp-col__vazio">Nada aqui.</p>'}
    </div>`;
  }).join('');
}
function card(p) {
  const dias = Math.floor((Date.now() - new Date(p.atualizado_em)) / 864e5);
  return `<button type="button" class="pp-card" data-id="${p.id}">
    <span class="pp-card__topo"><small>${esc(p.numero)}</small>${p.vencida ? '<em class="st st--novo">vencida</em>' : ''}</span>
    <b>${esc(p.nome_fantasia || p.razao_social)}</b>
    <small>${esc(p.plano_nome || '')}</small>
    <span class="pp-card__pe"><strong>${reais(p.preco_final)}</strong>${p.qtd_cnpj > 1 ? `<small>× ${p.qtd_cnpj}</small>` : ''}<span class="mini" title="${esc(p.vendedor_nome || '')}">${iniciais(p.vendedor_nome)}</span></span>
    <small class="pp-card__t">${dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : `há ${dias} dias`}${p.motivo_perda ? ' · ' + esc(p.motivo_perda) : ''}</small>
  </button>`;
}

// ===== gaveta: montar a proposta =====
let atual = null, salvando = null, pendente = false;
const CAMPOS_TXT = ['cnpj', 'razao_social', 'nome_fantasia', 'municipio', 'uf', 'contato_nome', 'contato_telefone', 'contato_email', 'observacao', 'motivo', 'validade'];
const radio = n => document.querySelector(`input[name="${n}"]:checked`)?.value;
const marca = (n, v) => { const i = document.querySelector(`input[name="${n}"][value="${v}"]`); if (i) i.checked = true; };

function mascaraCnpj(v) {
  const d = soDig(v).slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}
function cnpjOk(s) {
  const c = soDig(s); if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const dv = n => { let t = 0, p = n - 7; for (let i = 0; i < n; i++) { t += +c[i] * p--; if (p < 2) p = 9; } const r = t % 11; return r < 2 ? 0 : 11 - r; };
  return dv(12) === +c[12] && dv(13) === +c[13];
}

function preenche(p) {
  CAMPOS_TXT.forEach(k => { $(k).value = p?.[k] ?? ''; });
  $('validade').value = p?.validade || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  marca('tem', p?.abrir_empresa ? 'abrir' : 'tem');
  marca('funcionario', String(!!p?.funcionario)); marca('prolabore', String(!!p?.prolabore));
  marca('acompanhamento', p?.acompanhamento || 'nao'); marca('regime', p?.regime || 'simples');
  $('qtd_cnpj').value = p?.qtd_cnpj || 1;
  $('ev').checked = p?.segmento === 'ev';
  $('abertura_gratis').checked = p ? p.abertura_gratis : true;
  $('reuniao_id').value = p?.reuniao_id || '';
  $('preco_combinado').value = p?.preco_combinado != null ? String(p.preco_combinado).replace('.', ',') : '';
  if (p?.plano_codigo) $('plano_codigo').value = p.plano_codigo;
  ajustaTem();
}
function ajustaTem() {
  const abrir = radio('tem') === 'abrir';
  $('l-cnpj').hidden = abrir;
  $('l-razao').textContent = abrir ? 'Nome do cliente ou da futura empresa' : 'Razão social';
}

function campos() {
  const comb = $('preco_combinado').value.trim().replace(/\./g, '').replace(',', '.');
  const o = Object.fromEntries(CAMPOS_TXT.map(k => [k, $(k).value.trim() || null]));
  return {
    ...o,
    uf: o.uf ? o.uf.toUpperCase() : null,
    cnpj: radio('tem') === 'abrir' ? null : o.cnpj,
    validade: o.validade || undefined,
    abrir_empresa: radio('tem') === 'abrir',
    funcionario: radio('funcionario') === 'true',
    prolabore: radio('prolabore') === 'true',
    acompanhamento: radio('acompanhamento'),
    regime: radio('regime'),
    qtd_cnpj: Math.min(50, Math.max(1, parseInt($('qtd_cnpj').value) || 1)),
    segmento: $('ev').checked ? 'ev' : 'geral',
    abertura_gratis: $('abertura_gratis').checked,
    reuniao_id: $('reuniao_id').value || null,
    plano_codigo: atual ? $('plano_codigo').value : null,
    preco_combinado: comb && !isNaN(+comb) ? +comb : null
  };
}

// salva sozinho: o banco recalcula plano e preço e a tela mostra o que voltou
let timer;
function agenda() { clearTimeout(timer); $('g-salvo').textContent = ''; timer = setTimeout(salva, 450); }
async function salva() {
  if (salvando) { pendente = true; return; }
  const c = campos();
  if (!c.razao_social) { mostra(null); return; }
  if (c.cnpj && !cnpjOk(c.cnpj)) { $('g-salvo').textContent = 'CNPJ incompleto ou inválido: confira os números.'; return; }
  salvando = (async () => {
    $('g-salvo').textContent = 'Salvando…';
    const q = atual ? banco.from('proposta').update(c).eq('id', atual.id) : banco.from('proposta').insert(c);
    const { data, error } = await q.select('id').single();
    if (error) { $('g-salvo').textContent = 'Não salvou: ' + error.message; return; }
    const { data: v } = await banco.from('v_proposta').select('*').eq('id', data.id).single();
    atual = v; history.replaceState(null, '', '#' + v.id);
    mostra(v); $('g-salvo').textContent = 'Salvo';
  })();
  await salvando; salvando = null;
  if (pendente) { pendente = false; salva(); }
}

function mostra(p) {
  $('res-vazio').hidden = !!p; $('res-cheio').hidden = !p;
  $('g-num').textContent = p ? `${p.numero} · ${({ rascunho: 'rascunho', enviada: 'enviada', vista: 'o cliente abriu', aceita: 'aceita', assinada: 'contrato assinado', perdida: 'perdida' })[p.status]}` : 'Nova proposta';
  $('g-titulo').textContent = p ? (p.nome_fantasia || p.razao_social) : 'Nova proposta';
  if (p) {
    $('res-plano').textContent = p.plano_nome;
    $('res-motivo').textContent = p.motivo || 'Plano escolhido à mão: escreva o motivo em "Ajustar".';
    $('res-motivo').classList.toggle('pp-motivo--vazio', !p.motivo);
    const desc = Number(p.desconto_pct) > 0;
    $('res-tab').textContent = desc ? reais(p.preco_tabela) : '';
    $('res-final').textContent = reais(p.preco_final);
    $('res-mes').textContent = p.qtd_cnpj > 1 ? `por mês, por empresa (${p.qtd_cnpj})` : 'por mês';
    $('res-desc').textContent = desc ? `${Number(p.desconto_pct).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% de desconto` : '';
    $('plano_codigo').value = p.plano_codigo;
    const manual = p.plano_codigo !== p.plano_recomendado;
    if (document.activeElement !== $('motivo')) $('motivo').value = manual ? (p.motivo || '') : '';
    if (manual) $('ajuste').open = true;
  }
  botoes(p);
}

function botoes(p) {
  const b = $('botoes');
  if (!p) { b.innerHTML = ''; return; }
  const ver = `<a class="sair" href="?ver=${p.id}" target="_blank">Prévia e PDF</a>`;
  const tel = soDig(p.contato_telefone);
  if (['rascunho', 'enviada', 'vista'].includes(p.status)) {
    b.innerHTML = `
      ${p.status === 'rascunho' ? '<button type="button" class="pp-apaga" data-acao="apagar">Apagar</button>' : '<button type="button" class="pp-apaga" data-acao="perdida">Perdida</button>'}
      ${ver}
      <button type="button" class="sair" data-acao="copiar">Copiar mensagem</button>
      <button type="button" class="btn-a" data-acao="whats"${tel.length >= 10 ? '' : ' title="Sem WhatsApp do contato: a mensagem é copiada"'}>${p.status === 'rascunho' ? 'Enviar pelo WhatsApp' : 'Reenviar pelo WhatsApp'}</button>
      <div class="pp-perdida" id="perdida" hidden>
        <select id="motivo_perda"><option>Preço</option><option>Sumiu sem resposta</option><option>Fechou com outro contador</option><option>Não era o momento</option><option>Outro</option></select>
        <button type="button" class="btn-a" data-acao="perdida-ok">Marcar perdida</button>
      </div>`;
  } else if (p.status === 'aceita') {
    b.innerHTML = `<p class="pp-etapa">Aceita por <b>${esc(p.aceite_nome)}</b> em ${new Date(p.aceita_em).toLocaleDateString('pt-BR')}. Mande o contrato pelo Autentique; quando ele assinar, marque aqui e o cliente entra com o onboarding.</p>
      ${ver}<button type="button" class="btn-a" data-acao="assinado">Contrato assinado</button>`;
  } else if (p.status === 'assinada') {
    b.innerHTML = `<p class="pp-etapa">Contrato assinado em ${new Date(p.contrato_assinado_em).toLocaleDateString('pt-BR')}. <b>${esc(p.empresa_nome || '')}</b> já é cliente e o onboarding está no quadro.</p>${ver}<a class="btn-a pp-link" href="../clientes/#${p.empresa_id}">Abrir o cliente</a>`;
  } else {
    b.innerHTML = `<p class="pp-etapa">Perdida${p.motivo_perda ? ': ' + esc(p.motivo_perda) : ''}.</p>${ver}<button type="button" class="sair" data-acao="reabrir">Reabrir</button>`;
  }
  // proposta fora de rascunho: só preço, plano e recado ainda mudam antes do aceite; depois, nada
  const trava = ['aceita', 'assinada', 'perdida'].includes(p.status);
  $('f').querySelectorAll('input,select,button').forEach(x => { x.disabled = trava; });
  $('res-cheio').querySelectorAll('input,select').forEach(x => { x.disabled = trava; });
}

async function muda(st, extra = {}) {
  const { error } = await banco.from('proposta').update({ status: st, ...extra }).eq('id', atual.id);
  if (error) { avisa('Não deu: ' + error.message); return false; }
  const { data: v } = await banco.from('v_proposta').select('*').eq('id', atual.id).single();
  atual = v; mostra(v); return true;
}
async function copia(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch { return false; }
}

$('botoes').addEventListener('click', async e => {
  const a = e.target.closest('[data-acao]')?.dataset.acao; if (!a) return;
  await salvando;
  const p = atual;
  if (a === 'copiar' || a === 'whats') {
    if (!p.contato_nome) { $('contato_nome').focus(); return $('g-salvo').textContent = 'Falta o nome do contato.'; }
    if (p.status === 'rascunho' && !(await muda('enviada'))) return;
    const txt = textoWhats(deLinha(atual, PLANOS), link(atual));
    const tel = soDig(atual.contato_telefone);
    if (a === 'whats' && tel.length >= 10) window.open(`https://wa.me/${tel.length <= 11 ? '55' + tel : tel}?text=${encodeURIComponent(txt)}`, '_blank');
    else $('g-salvo').textContent = (await copia(txt)) ? 'Mensagem copiada. Cole no WhatsApp do cliente.' : 'Não deu para copiar.';
  }
  if (a === 'perdida') { $('perdida').hidden = false; $('motivo_perda').focus(); }
  if (a === 'perdida-ok') await muda('perdida', { motivo_perda: $('motivo_perda').value });
  if (a === 'reabrir') await muda(p.enviada_em ? 'enviada' : 'rascunho', { motivo_perda: null });
  if (a === 'apagar') {
    const { error } = await banco.from('proposta').delete().eq('id', p.id);
    if (error) return avisa('Não deu para apagar: ' + error.message);
    fecha(); avisa('Rascunho apagado.');
  }
  if (a === 'assinado') {
    const { error } = await banco.rpc('proposta_contrato_assinado', { p_id: p.id });
    if (error) return avisa('Não deu: ' + error.message);
    const { data: v } = await banco.from('v_proposta').select('*').eq('id', p.id).single();
    atual = v; mostra(v); avisa('Virou cliente. O onboarding já está no quadro.');
  }
});

// mudou qualquer coisa: salva
$('gaveta').addEventListener('input', e => {
  if (e.target.id === 'cnpj') e.target.value = mascaraCnpj(e.target.value);
  if (e.target.closest('#f,#res-cheio') && !e.target.closest('#perdida')) agenda();
});
$('gaveta').addEventListener('change', e => {
  if (e.target.name === 'tem') ajustaTem();
  if (e.target.closest('#f,#res-cheio') && !e.target.closest('#perdida')) agenda();
});
document.querySelectorAll('[data-qtd]').forEach(b => b.onclick = () => {
  $('qtd_cnpj').value = Math.min(50, Math.max(1, (parseInt($('qtd_cnpj').value) || 1) + +b.dataset.qtd)); agenda();
});

// CNPJ completo e válido: busca nome e cidade (Brasil API) sem apagar o que já foi digitado
$('cnpj').addEventListener('input', async () => {
  const c = soDig($('cnpj').value);
  if (c.length !== 14) { $('cnpj-dica').textContent = 'Com o CNPJ completo, o nome e a cidade vêm sozinhos.'; return; }
  if (!cnpjOk(c)) { $('cnpj-dica').textContent = 'CNPJ inválido: confira os números.'; return; }
  $('cnpj-dica').textContent = 'Buscando…';
  try {
    const r = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + c);
    if (!r.ok) throw 0;
    const d = await r.json();
    const poe = (id, v) => { if (v && !$(id).value.trim()) $(id).value = v; };
    poe('razao_social', d.razao_social); poe('nome_fantasia', d.nome_fantasia ? d.nome_fantasia.replace(/\b\w+/g, w => w[0] + w.slice(1).toLowerCase()) : '');
    poe('municipio', d.municipio ? d.municipio.replace(/\b\w+/g, w => w[0] + w.slice(1).toLowerCase()) : ''); poe('uf', d.uf);
    if (d.opcao_pelo_mei) marca('regime', 'mei'); else if (d.opcao_pelo_simples) marca('regime', 'simples');
    $('cnpj-dica').textContent = d.situacao_cadastral === 2 || /ATIVA/i.test(d.descricao_situacao_cadastral || '') ? 'Empresa ativa na Receita.' : 'Atenção: situação na Receita ' + (d.descricao_situacao_cadastral || 'não ativa') + '.';
    agenda();
  } catch { $('cnpj-dica').textContent = 'Não achei na Receita agora. Preencha à mão.'; }
});

async function abre(id) {
  atual = id ? lista.find(p => p.id === id) || null : null;
  history.replaceState(null, '', id ? '#' + id : location.pathname);
  $('ajuste').open = false; $('g-salvo').textContent = '';
  preenche(atual); mostra(atual);
  $('gaveta').hidden = false;
  (atual ? $('contato_nome') : $('cnpj')).focus();
}
function fecha() { clearTimeout(timer); $('gaveta').hidden = true; atual = null; history.replaceState(null, '', location.pathname); carrega(); }
$('nova').onclick = () => abre(null);
$('funil').addEventListener('click', e => { const c = e.target.closest('.pp-card'); if (c) abre(c.dataset.id); });
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', async () => { await salvando; fecha(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden) fecha(); });

await carrega();
const alvo = location.hash.slice(1);
if (alvo && lista.some(p => p.id === alvo)) await abre(alvo);
document.body.classList.remove('carregando');
