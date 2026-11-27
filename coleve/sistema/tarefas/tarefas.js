// Sistema Coleve · Tarefas no molde do ClickUp (27/11/2026)
// Lateral com listas (áreas), vista Lista agrupada por status ou Quadro, subtarefas, descrição, prioridade, etiquetas.
import { banco, quemSou } from '../conexao.js?v=2';
import { anexar, baixar, TIPOS, reais } from '../documentos.js?v=3';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;

// listas = áreas, na ordem em que a Coleve trabalha
const LISTAS = [
  ['fiscal', 'Fiscal', '#1A71FF'], ['contabil', 'Contábil', '#2F9E66'], ['dp', 'Departamento pessoal', '#E8A33D'],
  ['bpo', 'BPO financeiro', '#1E9AAE'], ['paralegal', 'Paralegal', '#7C5CDB'], ['atendimento', 'Atendimento', '#E5484D'],
  ['gestao', 'Gestão interna', '#4B5563'], ['comercial', 'Comercial', '#C2410C'], ['marketing', 'Marketing', '#D6409F'],
  ['tecnologia', 'Sistema', '#0E7490']
];
const AREA = Object.fromEntries(LISTAS.map(([k, n, c]) => [k, { n, c }]));
const STATUS = [['a_fazer', 'A fazer'], ['fazendo', 'Fazendo'], ['conferencia', 'Conferência'], ['pronto', 'Pronto'], ['enviado', 'Enviado']];
const NOME_ST = Object.fromEntries(STATUS);
const FECHADO = s => s === 'pronto' || s === 'enviado';
const PRIO = { 1: 'Urgente', 2: 'Alta', 3: 'Normal', 4: 'Baixa' };

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dataBR = d => d ? d.split('-').reverse().join('/') : '';
const curta = d => { if (!d) return ''; const [a, m, dd] = d.split('-'); const ano = new Date().getFullYear() == a ? '' : '/' + a.slice(2); return `${dd}/${m}${ano}`; };
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const hojeISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const hora = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
let avisoT; const avisa = t => { $('aviso').textContent = t; clearTimeout(avisoT); avisoT = setTimeout(() => { $('aviso').textContent = ''; }, 3500); };
const ICO_FLAG = '<svg viewBox="0 0 16 16"><path d="M3.5 14V2.5M3.5 3h8.5l-2 3 2 3H3.5" fill="currentColor" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const ICO_SETA = '<svg viewBox="0 0 10 10"><path d="M3 1.5L7 5l-4 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICO_SUB = '<svg viewBox="0 0 12 12"><path d="M3 2v4.5a1.5 1.5 0 0 0 1.5 1.5H9M7 6l2 2-2 2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// barra de cima
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Acesso total' : (AREA[P.area]?.n || 'Equipe');
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

// gerar guias do mês: admin e gestor
if (['admin', 'gestor'].includes(P.papel)) {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  $('gerar-mes').value = d.toISOString().slice(0, 7);
  $('gerar').hidden = false;
  $('gerar-btn').onclick = async () => {
    const comp = $('gerar-mes').value + '-01';
    const [t, p] = await Promise.all([banco.rpc('gerar_tarefas_mes', { p_competencia: comp }), banco.rpc('gerar_pendencias_mes', { p_competencia: comp })]);
    if (t.error || p.error) return avisa('Não deu para gerar: ' + (t.error || p.error).message);
    avisa(`${t.data} tarefa(s) e ${p.data} pendência(s) novas. O que já existia não duplicou.`);
    carrega();
  };
}

// equipe e clientes
let equipe = [], emps = [], tarefas = [], acompanha = new Map();
const nomeDe = id => equipe.find(p => p.id === id)?.nome || '';
const [{ data: pes }, { data: es }] = await Promise.all([
  banco.from('pessoa').select('id,nome,acompanha_tudo').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia').eq('ativo', true).order('razao_social')
]);
equipe = pes || []; emps = es || [];
const optsPessoas = equipe.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
const optsEmps = emps.map(e => `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`).join('');
const optsListas = LISTAS.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
['f-resp', 'n-resp', 'd-resp'].forEach(id => $(id).insertAdjacentHTML('beforeend', optsPessoas));
['f-emp', 'n-emp'].forEach(id => $(id).insertAdjacentHTML('beforeend', optsEmps));
$('n-area').innerHTML = optsListas; $('d-area').innerHTML = optsListas;
$('d-status').innerHTML = STATUS.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');

// envolvidos: responsável, quem acompanha o card e quem acompanha tudo
const envolvidos = t => {
  const ids = [t.responsavel_id, ...(acompanha.get(t.id) || []), ...equipe.filter(p => p.acompanha_tudo).map(p => p.id)];
  if (t.demanda) ids.push(t.demanda.pedido_por);
  return [...new Set(ids.filter(Boolean))];
};

// ===== estado da tela (lista escolhida, vista, grupos fechados, subtarefas abertas) =====
const guarda = (k, v) => { try { localStorage.setItem('coleve_tf_' + k, JSON.stringify(v)); } catch {} };
const lembra = (k, d) => { try { return JSON.parse(localStorage.getItem('coleve_tf_' + k)) ?? d; } catch { return d; } };
const empDaFicha = new URLSearchParams(location.search).get('emp');
let lista = empDaFicha ? 'todas' : lembra('lista', ['tecnologia', 'marketing'].includes(P.area) ? 'minhas' : (P.area && AREA[P.area] ? P.area : 'todas'));
let vista = lembra('vista', 'lista');
const fechados = new Set(lembra('fechados', ['pronto', 'enviado']));
const abertas = new Set();
if (empDaFicha) $('f-emp').value = empDaFicha;

// pedido de marketing vira card que anda sozinho com o fluxo do Marketing
const ST_DEMANDA = { pedido: 'a_fazer', ajuste: 'a_fazer', produzindo: 'fazendo', aprovacao: 'conferencia', aprovado: 'pronto', publicado: 'enviado' };
const FORMATO = { feed: 'Post', carrossel: 'Carrossel', story: 'Story', reels: 'Reels', outro: 'Peça' };
const comoCard = d => ({
  id: 'd:' + d.id, demanda: d, titulo: d.titulo, area: 'marketing', status: ST_DEMANDA[d.status] || 'a_fazer',
  empresa_nome: FORMATO[d.formato] + ' · pedido por ' + (d.pedido_por_nome || '').split(' ')[0],
  prazo: d.data_prevista, responsavel_id: d.responsavel_id, prioridade: d.status === 'ajuste' ? 1 : null, etiquetas: [],
  ajuste: d.status === 'ajuste', sub_total: 0, sub_feitas: 0,
  atrasada: !!d.data_prevista && d.data_prevista < hojeISO() && !['aprovado', 'publicado'].includes(d.status)
});

async function carrega() {
  const { data, error } = await banco.from('v_tarefa').select('*').neq('status', 'cancelado')
    .order('prazo', { ascending: true, nullsFirst: false }).order('criado_em').limit(1000);
  if (error) return avisa('Não deu para carregar as tarefas.');
  const [{ data: ds }, { data: ac }] = await Promise.all([
    banco.from('v_demanda').select('id,titulo,formato,status,data_prevista,responsavel_id,pedido_por,pedido_por_nome').neq('status', 'cancelado'),
    banco.from('tarefa_acompanha').select('tarefa_id,pessoa_id')
  ]);
  acompanha = new Map(); (ac || []).forEach(a => { if (!acompanha.has(a.tarefa_id)) acompanha.set(a.tarefa_id, new Set()); acompanha.get(a.tarefa_id).add(a.pessoa_id); });
  tarefas = [...data, ...(ds || []).map(comoCard)];
  desenhaLado(); desenha();
  if (aberta) { const t = tarefas.find(x => x.id === aberta.id); if (t) { aberta = t; desenhaSubs(); } }
}

// ===== lateral =====
const naLista = (t, l) => l === 'todas' ? true : l === 'minhas' ? (t.responsavel_id === P.id || (acompanha.get(t.id)?.has(P.id))) : l === 'atrasadas' ? t.atrasada : t.area === l;
const abertasDe = l => tarefas.filter(t => !FECHADO(t.status) && naLista(t, l)).length;
const ICO_V = {
  todas: '<svg viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="4.5" height="4.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  minhas: '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="2.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2.8 13.5c.8-2.6 2.8-4 5.2-4s4.4 1.4 5.2 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  atrasadas: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
};
function desenhaLado() {
  const it = (k, nome, ico) => `<li><button type="button" data-l="${k}" class="${lista === k ? 'is-on' : ''}">${ico}<span>${nome}</span><b>${abertasDe(k) || ''}</b></button></li>`;
  $('visoes').innerHTML = it('minhas', 'Minhas tarefas', ICO_V.minhas) + it('todas', 'Todas', ICO_V.todas) + it('atrasadas', 'Atrasadas', ICO_V.atrasadas);
  $('listas').innerHTML = LISTAS.map(([k, n, c]) => it(k, n, `<span class="ui-ponto" style="--cor:${c}"></span>`)).join('');
  $('lista-cel').innerHTML = [['minhas', 'Minhas tarefas'], ['todas', 'Todas'], ['atrasadas', 'Atrasadas'], ...LISTAS].map(([k, n]) => `<option value="${k}">${n} (${abertasDe(k)})</option>`).join('');
  $('lista-cel').value = lista;
}
const trocaLista = l => { lista = l; guarda('lista', l); desenhaLado(); desenha(); };
document.querySelector('.tf-lado').addEventListener('click', e => { const b = e.target.closest('button[data-l]'); if (b) trocaLista(b.dataset.l); });
$('lista-cel').onchange = () => trocaLista($('lista-cel').value);

// ===== filtros =====
function filtradas() {
  const b = $('f-busca').value.trim().toLowerCase(), r = $('f-resp').value, e = $('f-emp').value, pr = $('f-pr').value,
    at = $('f-atraso').checked;
  return tarefas.filter(t =>
    naLista(t, lista) &&
    (!b || (t.titulo + ' ' + (t.empresa_nome || '') + ' ' + (t.descricao || '') + ' ' + (t.etiquetas || []).join(' ')).toLowerCase().includes(b)) &&
    (!r || (r === '-' ? !t.responsavel_id : t.responsavel_id === r)) &&
    (!e || (e === 'interno' ? !t.empresa_id && !t.demanda : t.empresa_id === e)) &&
    (!pr || String(t.prioridade) === pr) &&
    (!at || t.atrasada));
}

// pedaços de linha
function prazoHTML(t) {
  if (!t.prazo) return '<span class="tf-vazio-c">·</span>';
  const hoje = hojeISO();
  const cls = t.atrasada ? ' tf-prazo--atraso' : t.prazo === hoje ? ' tf-prazo--hoje' : '';
  return `<span class="tf-prazo${cls}" title="${dataBR(t.prazo)}">${t.prazo === hoje ? 'Hoje' : curta(t.prazo)}</span>`;
}
const prioHTML = t => t.prioridade ? `<span class="tf-pr" data-pr="${t.prioridade}">${ICO_FLAG}${PRIO[t.prioridade]}</span>` : '<span class="tf-vazio-c">·</span>';
function rostos(t, max = 3) {
  const ids = [...new Set([t.responsavel_id, ...(acompanha.get(t.id) || [])].filter(Boolean))].slice(0, max);
  if (!ids.length) return '<span class="ui-mini ui-mini--vazio" title="Sem responsável">+</span>';
  return ids.map(id => `<span class="ui-mini${id === t.responsavel_id ? '' : ' mini--seg'}" title="${esc(nomeDe(id))}${id === t.responsavel_id ? ' · responsável' : ' · acompanha'}">${iniciais(nomeDe(id))}</span>`).join('');
}
const tagsHTML = t => [
  ...(t.etiquetas || []).slice(0, 2).map(g => `<span class="tf-tag">${esc(g)}</span>`),
  t.ajuste ? '<span class="tf-tag tf-tag--mk">ajuste pedido</span>' : '',
  t.demanda && t.status === 'conferencia' ? '<span class="tf-tag tf-tag--mk">esperando aprovação</span>' : '',
  t.empresa_teste ? '<span class="tf-tag tf-tag--teste">teste</span>' : ''
].join('');
const subHTML = t => t.sub_total ? `<span class="tf-contador" title="Subtarefas">${ICO_SUB}${t.sub_feitas}/${t.sub_total}</span>` : '';
const empHTML = t => t.empresa_id || t.demanda ? esc(t.empresa_nome) : '<span class="tf-vazio-c">·</span>';

// ===== vista lista =====
function linha(t, sub = false) {
  const filhos = tarefas.filter(x => x.pai_id === t.id);
  const temFilhos = !sub && filhos.length;
  const aberto = abertas.has(t.id);
  const mostraLista = lista === 'todas' || lista === 'minhas' || lista === 'atrasadas';
  let h = `<tr class="tf-lin${sub ? ' is-sub' : ''}${FECHADO(t.status) ? ' is-feita' : ''}" data-id="${t.id}" data-st="${t.status}" tabindex="0">
    <td class="c-nome"><div class="tf-nome">
      ${sub ? '' : `<button type="button" class="tf-sub-ico${temFilhos ? (aberto ? ' is-aberto' : '') : ' tf-sub-ico--vazio'}" data-abre="${t.id}" aria-label="Mostrar subtarefas" ${temFilhos ? '' : 'tabindex="-1"'}>${ICO_SETA}</button>`}
      <span class="tf-bol" title="${NOME_ST[t.status]}"></span>
      <span class="tf-nome__t">${esc(t.titulo)}</span>${subHTML(t)}${tagsHTML(t)}
    </div></td>
    ${mostraLista ? `<td class="c-lista"><span class="tf-emp"><span class="ui-ponto" style="color:${AREA[t.area]?.c};display:inline-block;margin-right:6px"></span>${AREA[t.area]?.n || ''}</span></td>` : ''}
    <td class="c-resp"><div class="tf-resp">${rostos(t)}</div></td>
    <td class="c-prazo">${prazoHTML(t)}</td>
    <td class="c-pr">${prioHTML(t)}</td>
    <td class="c-emp"><span class="tf-emp">${empHTML(t)}</span></td>
  </tr>`;
  if (temFilhos && aberto) h += filhos.map(f => linha(f, true)).join('');
  return h;
}
function desenhaLista(ts) {
  const mostraLista = lista === 'todas' || lista === 'minhas' || lista === 'atrasadas';
  const ids = new Set(ts.map(t => t.id));
  // subtarefa aparece dentro do pai; sozinha só se o pai não estiver na tela
  const topo = ts.filter(t => !t.pai_id || !ids.has(t.pai_id));
  const fe = $('f-fechadas').checked;
  const grupos = STATUS.filter(([st]) => !FECHADO(st) || fe || topo.some(t => t.status === st));
  const html = grupos.map(([st, nome]) => {
    const cs = topo.filter(t => t.status === st);
    if (!cs.length && FECHADO(st)) return '';
    const fechado = fechados.has(st);
    return `<section class="tf-grupo${fechado ? ' is-fechado' : ''}" data-st="${st}">
      <button type="button" class="tf-grupo__cab" data-grupo="${st}" aria-expanded="${!fechado}"><svg class="tf-seta" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span class="tf-st">${nome}</span><small>${cs.length}</small></button>
      <table class="tf-tab"><colgroup><col class="c-nome">${mostraLista ? '<col class="c-lista">' : ''}<col class="c-resp"><col class="c-prazo"><col class="c-pr"><col class="c-emp"></colgroup>
        <thead><tr><th>Nome</th>${mostraLista ? '<th>Lista</th>' : ''}<th>Responsável</th><th>Prazo</th><th>Prioridade</th><th>Cliente</th></tr></thead>
        <tbody>${cs.map(t => linha(t)).join('')}
        ${st === 'a_fazer' ? `<tr class="tf-add-lin"><td colspan="${mostraLista ? 6 : 5}" data-nova>+ Nova tarefa</td></tr>` : ''}</tbody>
      </table></section>`;
  }).join('');
  $('corpo').innerHTML = html || '<p class="tf-nada">Nenhuma tarefa aqui.</p>';
}

// ===== vista quadro =====
function desenhaQuadro(ts) {
  $('corpo').innerHTML = `<div class="tf-quadro">${STATUS.map(([st, nome]) => {
    const cs = ts.filter(t => t.status === st && !t.pai_id);
    return `<div class="tf-col" data-status="${st}" data-st="${st}">
      <div class="tf-col__cab"><span class="tf-st">${nome}</span><small>${cs.length}</small></div>
      ${cs.map(t => `<article class="tf-card${t.atrasada ? ' tf-card--atraso' : ''}" draggable="true" data-id="${t.id}" tabindex="0">
        <p class="tf-card__t">${esc(t.titulo)}</p>
        <p class="tf-card__emp">${lista === 'todas' || lista === 'minhas' || lista === 'atrasadas' ? (AREA[t.area]?.n || '') + ' · ' : ''}${t.empresa_id || t.demanda ? esc(t.empresa_nome) : 'Interno · Coleve'}</p>
        <div class="tf-card__meta">${tagsHTML(t)}${subHTML(t)}</div>
        <div class="tf-card__pe">${prazoHTML(t)}${t.prioridade ? prioHTML(t) : ''}<div class="tf-resp">${rostos(t)}</div></div>
      </article>`).join('')}
    </div>`;
  }).join('')}</div>`;
}

function desenha() {
  const nome = lista === 'todas' ? 'Todas as tarefas' : lista === 'minhas' ? 'Minhas tarefas' : lista === 'atrasadas' ? 'Atrasadas' : AREA[lista].n;
  $('t-nome').textContent = nome;
  $('t-ponto').style.setProperty('--cor', AREA[lista]?.c || '#8A919C');
  $('t-ponto').hidden = !AREA[lista];
  document.querySelectorAll('.tf-vistas button').forEach(b => b.classList.toggle('is-on', b.dataset.v === vista));
  const ts = filtradas();
  const abertasN = ts.filter(t => !FECHADO(t.status)).length;
  $('total').textContent = `${abertasN} em aberto`;
  vista === 'quadro' ? desenhaQuadro(ts) : desenhaLista(ts);
}
['f-busca', 'f-resp', 'f-emp', 'f-pr', 'f-atraso', 'f-fechadas'].forEach(id => $(id).addEventListener('input', () => {
  if (id === 'f-fechadas') { ['pronto', 'enviado'].forEach(s => $('f-fechadas').checked ? fechados.delete(s) : fechados.add(s)); guarda('fechados', [...fechados]); }
  desenha();
}));
document.querySelector('.tf-vistas').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; vista = b.dataset.v; guarda('vista', vista); desenha(); });

// cliques no corpo: grupo, seta de subtarefa, linha, nova
$('corpo').addEventListener('click', e => {
  const g = e.target.closest('[data-grupo]');
  if (g) { const st = g.dataset.grupo; fechados.has(st) ? fechados.delete(st) : fechados.add(st); guarda('fechados', [...fechados]); desenha(); return; }
  const s = e.target.closest('[data-abre]');
  if (s) { const id = s.dataset.abre; abertas.has(id) ? abertas.delete(id) : abertas.add(id); desenha(); return; }
  if (e.target.closest('[data-nova]')) { novaTarefa(); return; }
  const l = e.target.closest('.tf-lin,.tf-card'); if (l) abre(l.dataset.id);
});
$('corpo').addEventListener('keydown', e => { if (e.key === 'Enter') { const l = e.target.closest('.tf-lin,.tf-card'); if (l) abre(l.dataset.id); } });

// arrastar no quadro
let arrastando = null;
$('corpo').addEventListener('dragstart', e => { const c = e.target.closest('.tf-card'); if (c) { arrastando = c.dataset.id; c.classList.add('voando'); } });
$('corpo').addEventListener('dragend', e => { e.target.closest('.tf-card')?.classList.remove('voando'); document.querySelectorAll('.tf-col.alvo').forEach(c => c.classList.remove('alvo')); });
$('corpo').addEventListener('dragover', e => { const col = e.target.closest('.tf-col'); if (col) { e.preventDefault(); document.querySelectorAll('.tf-col.alvo').forEach(c => c !== col && c.classList.remove('alvo')); col.classList.add('alvo'); } });
$('corpo').addEventListener('drop', async e => {
  const col = e.target.closest('.tf-col'); if (!col || !arrastando) return;
  e.preventDefault(); col.classList.remove('alvo');
  await mudaStatus(arrastando, col.dataset.status); arrastando = null;
});

async function mudaStatus(id, status) {
  const t = tarefas.find(x => x.id === id); if (!t || t.status === status) return;
  if (t.demanda) {
    if (status === 'fazendo' && t.status === 'a_fazer') { t.status = 'fazendo'; desenha(); await banco.from('demanda').update({ status: 'produzindo' }).eq('id', t.demanda.id); }
    else avisa('Pedido de marketing anda pelo Marketing: envie a arte e a aprovação por lá.');
    return;
  }
  const antes = t.status; t.status = status; desenha();
  const { error } = await banco.from('tarefa').update({ status }).eq('id', id);
  if (error) { t.status = antes; desenha(); avisa('Não deu para mudar o status.'); }
}

// ===== detalhe =====
let aberta = null;
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', fecha));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden && !document.querySelector('dialog[open]')) fecha(); });
function fecha() { $('gaveta').hidden = true; aberta = null; history.replaceState(null, '', location.pathname + location.search); carrega(); }

async function abre(id) {
  const t = tarefas.find(x => x.id === id); if (!t) return;
  if (t.demanda) { location.href = '../marketing/#' + t.demanda.id; return; }
  aberta = t;
  history.replaceState(null, '', '#' + t.id);
  const a = AREA[t.area] || { n: t.area, c: '#8A919C' };
  $('d-onde').innerHTML = `<span class="ui-ponto" style="--cor:${a.c}"></span>${a.n}${t.clickup_id ? ' · veio do ClickUp' : ''}`;
  const pai = t.pai_id && tarefas.find(x => x.id === t.pai_id);
  $('d-pai').hidden = !pai; if (pai) $('d-pai').textContent = '↑ ' + pai.titulo.slice(0, 40);
  $('d-titulo').textContent = t.titulo;
  $('d-status').value = t.status; $('d-status').closest('dd').dataset.st = t.status; $('d-status').dataset.st = t.status;
  $('d-resp').value = t.responsavel_id || '';
  $('d-prazo').value = t.prazo || '';
  $('d-pr').value = t.prioridade || '';
  $('d-area').value = t.area;
  $('d-empresa').textContent = t.empresa_id ? t.empresa_nome : 'Interno · Coleve';
  $('d-comp-l').hidden = !t.competencia; $('d-comp').textContent = t.competencia ? dataBR(t.competencia).slice(3) : '';
  $('d-tags').value = (t.etiquetas || []).join(', ');
  $('d-visivel-l').hidden = !t.empresa_id; $('d-visivel').checked = t.visivel_cliente;
  $('d-desc').value = t.descricao || '';
  desenhaSubs(); desenhaEnvolvidos(t);
  $('d-docs').hidden = !t.empresa_id; $('d-doc-lista').innerHTML = ''; $('d-entregar').hidden = true;
  $('gaveta').hidden = false;
  $('gaveta').querySelector('.tf-gav__miolo').scrollTop = 0;
  carregaAtividade(id);
  if (t.empresa_id) carregaDocs(id);
}
$('d-pai').onclick = () => { if (aberta?.pai_id) abre(aberta.pai_id); };

const salva = async (campos, msg = 'Salvo.') => {
  if (!aberta) return;
  const { error } = await banco.from('tarefa').update(campos).eq('id', aberta.id);
  if (error) return avisa('Não deu para salvar.');
  Object.assign(aberta, campos); avisa(msg); desenha();
};
$('d-titulo').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('d-titulo').blur(); } });
$('d-titulo').addEventListener('blur', () => { const v = $('d-titulo').textContent.trim(); if (aberta && v && v !== aberta.titulo) salva({ titulo: v }); else if (aberta) $('d-titulo').textContent = aberta.titulo; });
$('d-status').onchange = async () => { const st = $('d-status').value; $('d-status').dataset.st = st; await mudaStatus(aberta.id, st); carregaAtividade(aberta.id); };
$('d-resp').onchange = async () => { await salva({ responsavel_id: $('d-resp').value || null }); desenhaEnvolvidos(aberta); };
$('d-prazo').onchange = () => salva({ prazo: $('d-prazo').value || null });
$('d-pr').onchange = () => salva({ prioridade: $('d-pr').value ? +$('d-pr').value : null });
$('d-area').onchange = () => salva({ area: $('d-area').value }, 'Movida para ' + AREA[$('d-area').value].n + '.');
$('d-visivel').onchange = () => salva({ visivel_cliente: $('d-visivel').checked });
$('d-tags').onchange = () => salva({ etiquetas: [...new Set($('d-tags').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean))] });
$('d-desc').addEventListener('blur', () => { const v = $('d-desc').value.trim() || null; if (aberta && v !== (aberta.descricao || null)) salva({ descricao: v }, 'Descrição salva.'); });

// subtarefas
function desenhaSubs() {
  if (!aberta) return;
  const subs = tarefas.filter(x => x.pai_id === aberta.id);
  const feitas = subs.filter(s => FECHADO(s.status)).length;
  $('d-sub-conta').textContent = subs.length ? `${feitas} de ${subs.length}` : '';
  $('d-subs').innerHTML = subs.map(s => `<li class="${FECHADO(s.status) ? 'is-feita' : ''}" data-id="${s.id}" data-st="${s.status}">
    <input type="checkbox" ${FECHADO(s.status) ? 'checked' : ''} aria-label="Concluir">
    <button type="button" class="tf-subs__t">${esc(s.titulo)}</button>${prazoHTML(s)}${s.responsavel_id ? `<span class="ui-mini" title="${esc(nomeDe(s.responsavel_id))}">${iniciais(nomeDe(s.responsavel_id))}</span>` : ''}</li>`).join('');
}
$('d-subs').addEventListener('change', async e => {
  const li = e.target.closest('li'); if (!li) return;
  await mudaStatus(li.dataset.id, e.target.checked ? 'pronto' : 'a_fazer'); desenhaSubs();
});
$('d-subs').addEventListener('click', e => { const b = e.target.closest('.tf-subs__t'); if (b) abre(b.closest('li').dataset.id); });
$('d-sub-nova').onsubmit = async e => {
  e.preventDefault();
  const titulo = $('d-sub-titulo').value.trim(); if (!titulo || !aberta) return;
  const { data, error } = await banco.from('tarefa').insert({
    titulo, origem: 'equipe', area: aberta.area, pai_id: aberta.id, empresa_id: aberta.empresa_id,
    responsavel_id: aberta.responsavel_id, visivel_cliente: false, criado_por: P.id
  }).select('id').single();
  if (error) return avisa('Não deu para criar a subtarefa.');
  $('d-sub-titulo').value = '';
  const { data: nova } = await banco.from('v_tarefa').select('*').eq('id', data.id).single();
  if (nova) tarefas.push(nova);
  aberta.sub_total = (aberta.sub_total || 0) + 1;
  abertas.add(aberta.id); desenhaSubs(); desenha();
};

// documentos (vão pro Drive, envio com protocolo)
Object.entries(TIPOS).forEach(([k, v]) => $('d-doc-tipo').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));
let docs = [];
async function carregaDocs(id) {
  const { data } = await banco.from('documento').select('id,nome,tipo,valor,vencimento,criado_em,protocolo(enviado_em,lido_em,destinatario)').eq('tarefa_id', id).order('criado_em');
  if (aberta?.id !== id) return;
  docs = data || [];
  $('d-doc-lista').innerHTML = docs.map(d => {
    const p = d.protocolo?.[0];
    const st = !p ? '<span class="ui-selo">não enviado</span>' : p.lido_em ? `<span class="ui-selo" style="background:#E7F6EE;color:#1E7A4C">aberto ${hora(p.lido_em)}</span>` : `<span class="ui-selo" style="background:#EAF1FF;color:#155FD9">enviado ${hora(p.enviado_em)}</span>`;
    const meta = [TIPOS[d.tipo], d.valor != null ? reais(d.valor) : null, d.vencimento ? 'vence ' + dataBR(d.vencimento) : null, p ? 'para ' + esc(p.destinatario) : null].filter(Boolean).join(' · ');
    return `<li><span><b>${esc(d.nome)}</b><small>${meta}</small></span>${st}<button type="button" class="ui-btn ui-btn--fan d-baixar" data-id="${d.id}">Baixar</button></li>`;
  }).join('') || '<li><small>Nenhum documento anexado.</small></li>';
  const novos = docs.filter(d => !d.protocolo?.length).length;
  $('d-entregar').hidden = !novos;
  $('d-entregar').textContent = novos > 1 ? `Enviar ${novos} documentos ao cliente` : 'Enviar ao cliente';
}
$('d-arq').onchange = () => { $('d-arq-nome').textContent = $('d-arq').files[0]?.name || 'Escolher arquivo'; };
$('d-anexo').onsubmit = async e => {
  e.preventDefault();
  const arq = $('d-arq').files[0]; if (!arq || !aberta) return avisa('Escolha o arquivo.');
  const t = aberta, btn = $('d-anexar');
  btn.disabled = true; btn.textContent = 'Enviando…';
  try {
    await anexar(t, arq, { tipo: $('d-doc-tipo').value, valor: $('d-doc-valor').value, vencimento: $('d-doc-venc').value }, p => { btn.textContent = `Enviando ${Math.round(p * 100)}%`; });
    $('d-anexo').reset(); $('d-arq-nome').textContent = 'Escolher arquivo';
    avisa('Anexado. Está na pasta da empresa no Drive.'); carregaDocs(t.id);
  } catch (err) { avisa('Não deu para anexar: ' + err.message); }
  btn.disabled = false; btn.textContent = 'Anexar';
};
$('d-doc-lista').addEventListener('click', async e => {
  const b = e.target.closest('.d-baixar'); if (!b) return;
  b.disabled = true; b.textContent = 'Baixando…';
  try { await baixar(docs.find(d => d.id === b.dataset.id)); } catch (err) { avisa(err.message); }
  b.disabled = false; b.textContent = 'Baixar';
});
$('d-entregar').onclick = async () => {
  if (!aberta) return;
  const t = aberta, b = $('d-entregar'); b.disabled = true;
  const { data, error } = await banco.rpc('entregar_documentos', { p_tarefa: t.id });
  b.disabled = false;
  if (error) return avisa('Não deu para enviar: ' + error.message);
  avisa(`${data} documento${data > 1 ? 's' : ''} enviado${data > 1 ? 's' : ''} ao cliente. Protocolo registrado.`);
  t.status = 'enviado'; t.visivel_cliente = true; $('d-visivel').checked = true; $('d-status').value = 'enviado'; $('d-status').dataset.st = 'enviado';
  carregaDocs(t.id); carregaAtividade(t.id); desenha();
};

// atividade: comentários e histórico juntos, como no ClickUp
async function carregaAtividade(id) {
  const [{ data: cs }, { data: hs }] = await Promise.all([
    banco.from('tarefa_comentario').select('texto,criado_em,autor:pessoa(nome)').eq('tarefa_id', id).order('criado_em'),
    banco.from('historico').select('acao,detalhe,criado_em,quem:pessoa(nome)').eq('tarefa_id', id).order('criado_em').limit(60)
  ]);
  if (aberta?.id !== id) return;
  const itens = [
    ...(hs || []).map(h => ({ d: h.criado_em, h: `<li><time>${hora(h.criado_em)}</time><span>${esc(h.quem?.nome?.split(' ')[0] || 'Sistema')} ${h.acao === 'status' ? `mudou de <b>${NOME_ST[h.detalhe?.de] || h.detalhe?.de}</b> para <b>${NOME_ST[h.detalhe?.para] || h.detalhe?.para}</b>` : esc(h.acao)}</span></li>` })),
    ...(cs || []).map(c => ({ d: c.criado_em, h: `<li class="c-coment"><b>${esc(c.autor?.nome || 'Equipe')}</b><time>${hora(c.criado_em)}</time><p>${esc(c.texto)}</p></li>` }))
  ].sort((a, b) => a.d.localeCompare(b.d));
  $('d-ativ').innerHTML = itens.map(i => i.h).join('') || '<li>Nada ainda.</li>';
}
$('d-novo').onsubmit = async e => {
  e.preventDefault();
  const texto = $('d-texto').value.trim(); if (!texto || !aberta) return;
  const { error } = await banco.from('tarefa_comentario').insert({ tarefa_id: aberta.id, autor_id: P.id, texto, interno: true });
  if (error) return avisa('Não deu para comentar.');
  $('d-texto').value = ''; carregaAtividade(aberta.id);
};

function desenhaEnvolvidos(t) {
  const seg = acompanha.get(t.id) || new Set();
  $('d-envolvidos').innerHTML = equipe.map(p => {
    const resp = p.id === t.responsavel_id, tudo = p.acompanha_tudo, on = resp || tudo || seg.has(p.id);
    return `<button type="button" class="${on ? 'is-on' : ''}" data-id="${p.id}" ${resp || tudo ? 'disabled' : ''} title="${resp ? 'Responsável' : tudo ? 'Acompanha tudo' : on ? 'Acompanha: toque para tirar' : 'Toque para incluir'}">
      <span class="ui-mini">${iniciais(p.nome)}</span>${esc(p.nome.split(' ')[0])}${resp ? ' <small>resp.</small>' : ''}</button>`;
  }).join('');
}
$('d-envolvidos').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b || b.disabled || !aberta) return;
  const seg = acompanha.get(aberta.id) || new Set(); acompanha.set(aberta.id, seg);
  const id = b.dataset.id;
  if (seg.has(id)) { seg.delete(id); await banco.from('tarefa_acompanha').delete().eq('tarefa_id', aberta.id).eq('pessoa_id', id); }
  else { seg.add(id); await banco.from('tarefa_acompanha').insert({ tarefa_id: aberta.id, pessoa_id: id }); }
  desenhaEnvolvidos(aberta); desenha();
});

// ===== nova tarefa =====
function novaTarefa() {
  $('f-nova-t').reset();
  $('n-area').value = AREA[lista] ? lista : (AREA[P.area] ? P.area : 'gestao');
  $('n-resp').value = P.id;
  if ($('f-emp').value && $('f-emp').value !== 'interno') $('n-emp').value = $('f-emp').value;
  $('dlg-t').showModal(); $('n-titulo').focus();
}
$('nova-t').onclick = novaTarefa;
$('n-cancela').onclick = () => $('dlg-t').close();
$('f-nova-t').addEventListener('submit', async e => {
  e.preventDefault();
  const titulo = $('n-titulo').value.trim(); if (!titulo) return;
  const empresa = $('n-emp').value || null;
  const { error } = await banco.from('tarefa').insert({
    titulo, descricao: $('n-desc').value.trim() || null, origem: 'equipe', area: $('n-area').value,
    responsavel_id: $('n-resp').value || null, prazo: $('n-prazo').value || null, prazo_original: $('n-prazo').value || null,
    prioridade: $('n-pr').value ? +$('n-pr').value : null, empresa_id: empresa, visivel_cliente: !!empresa, criado_por: P.id
  });
  if (error) return avisa('Não deu para criar a tarefa.');
  $('dlg-t').close(); avisa('Tarefa criada.'); carrega();
});

// tempo real
let espera;
banco.channel('coleve-tarefas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefa' }, () => { clearTimeout(espera); espera = setTimeout(carrega, 500); })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'demanda' }, () => { clearTimeout(espera); espera = setTimeout(carrega, 500); })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tarefa_comentario' }, ({ new: c }) => { if (aberta && c.tarefa_id === aberta.id) carregaAtividade(aberta.id); })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'protocolo' }, () => { if (aberta?.empresa_id) carregaDocs(aberta.id); })
  .subscribe();

await carrega();
document.body.classList.remove('carregando');
const doLink = location.hash.slice(1); if (doLink) abre(doLink);
