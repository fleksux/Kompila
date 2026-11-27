// Sistema Coleve · Paralegal (Backlog #2 do Manu, Doc "Paralegal", 27/11/2026)
// Kanban de processos (abertura, alteração, baixa, regularização, licenças, outros). Etapa e histórico mudam só
// pelas funções do banco (paralegal_mover, paralegal_marcar_etapa, paralegal_exigencia...), que gravam quem, quando,
// observação e próxima ação. O resto do card é editado direto e o banco anota no histórico.
import { banco, quemSou } from '../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;
const CHEFE = ['admin', 'gestor'].includes(P.papel);

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dataBR = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '';
const curta = d => { if (!d) return ''; const [a, m, dd] = String(d).slice(0, 10).split('-'); return `${dd}/${m}${new Date().getFullYear() == a ? '' : '/' + a.slice(2)}`; };
const hora = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const iniciais = n => (n || '?').split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase();
const hojeISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const maisDias = n => { const d = new Date(); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
let avisoT; const avisa = t => { $('aviso').textContent = t; clearTimeout(avisoT); avisoT = setTimeout(() => { $('aviso').textContent = ''; }, 4500); };
const erroBanco = e => e?.message || 'erro';
const ICO_FLAG = '<svg viewBox="0 0 16 16"><path d="M3.5 14V2.5M3.5 3h8.5l-2 3 2 3H3.5" fill="currentColor" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const ICO_DOC = '<svg viewBox="0 0 12 12"><path d="M3 1.5h4l2 2v7H3z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';

const PRIO = { 1: 'Urgente', 2: 'Alta', 3: 'Normal', 4: 'Baixa' };
const INDS = [
  ['aguardando_cliente', 'Aguardando cliente'], ['aguardando_assinatura', 'Aguardando assinatura'], ['aguardando_orgao', 'Aguardando órgão público'],
  ['aguardando_pagamento', 'Aguardando pagamento ou taxa'], ['exigencia', 'Exigência recebida'], ['correcao_interna', 'Correção interna'],
  ['bloqueado', 'Bloqueado'], ['em_atraso', 'Em atraso'], ['pronto_revisao', 'Pronto para revisão'], ['pronto_entrega', 'Pronto para entrega']
];
const NOME_IND = Object.fromEntries(INDS);
const PROTOCOLO = { nao_protocolado: 'Não protocolado', protocolado: 'Protocolado', em_analise: 'Em análise', exigencia: 'Em exigência', deferido: 'Deferido', indeferido: 'Indeferido' };
const DOC_ST = { pendente: 'Pendente', recebido: 'Recebido', conferido: 'Conferido', recusado: 'Recusado', dispensado: 'Dispensado' };
const ST_DOCS = { completo: 'Completos', parcial: 'Parciais', pendente: 'Pendentes', sem_lista: 'Sem lista' };

// barra de cima
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Acesso total' : P.papel === 'gestor' ? 'Gestão' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

// marketing não vê dado de cliente (regra 0020)
if (!CHEFE && P.area === 'marketing') {
  $('corpo').innerHTML = '<p class="pl-sem">O Paralegal tem dados de clientes e fica com a equipe da contabilidade.</p>';
  $('novo').hidden = true;
  document.body.classList.remove('carregando');
  throw 0;
}

// ===== catálogo, equipe e clientes =====
const [rT, rE, rN, rP, rEm] = await Promise.all([
  banco.from('paralegal_tipo').select('*').eq('ativo', true).order('ordem'),
  banco.from('paralegal_etapa').select('*').eq('ativo', true).order('tipo').order('ordem'),
  banco.from('paralegal_natureza').select('*').order('ordem'),
  banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia,cnpj,municipio,uf').eq('ativo', true).order('razao_social')
]);
if (rT.error || rE.error) {
  $('corpo').innerHTML = '<p class="pl-sem">Não deu para abrir o Paralegal. O módulo ainda não está no banco ou você está sem acesso.</p>';
  document.body.classList.remove('carregando');
  throw 0;
}
const TIPOS = rT.data, ETAPAS = rE.data, NATS = rN.data || [], equipe = rP.data || [], emps = rEm.data || [];
const TIPO = Object.fromEntries(TIPOS.map(t => [t.codigo, t]));
const ETAPA = Object.fromEntries(ETAPAS.map(e => [e.id, e]));
const etapasDe = tipo => ETAPAS.filter(e => e.tipo === tipo);
const nomeDe = id => equipe.find(p => p.id === id)?.nome || '';
const nomeEmp = e => e?.nome_fantasia || e?.razao_social || '';
const optsPessoas = equipe.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
['f-resp', 'n-resp', 'n-exec', 'x-resp'].forEach(id => $(id).insertAdjacentHTML('beforeend', optsPessoas));
$('n-emp').insertAdjacentHTML('beforeend', emps.map(e => `<option value="${e.id}">${esc(nomeEmp(e))}</option>`).join(''));
$('n-tipo').innerHTML = TIPOS.map(t => `<option value="${t.codigo}">${esc(t.nome)}</option>`).join('');
$('n-nat').innerHTML = NATS.map(n => `<label><input type="checkbox" value="${n.codigo}"> ${esc(n.nome)}</label>`).join('');

// ===== estado =====
const guarda = (k, v) => { try { localStorage.setItem('coleve_pl_' + k, JSON.stringify(v)); } catch {} };
const lembra = (k, d) => { try { return JSON.parse(localStorage.getItem('coleve_pl_' + k)) ?? d; } catch { return d; } };
let tipo = lembra('tipo', 'todos'); if (tipo !== 'todos' && !TIPO[tipo]) tipo = 'todos';
let visao = lembra('visao', 'andamento');
let vista = lembra('vista', 'quadro');
let ind = null;
let procs = [], tempos = [];
let aberto = null, abertoEt = [], abertoDocs = [], abertoMov = [];

async function carrega() {
  const [{ data, error }, { data: tp }] = await Promise.all([
    banco.from('v_paralegal').select('*').order('ultima_mov', { ascending: false }).limit(2000),
    banco.from('v_paralegal_tempo_etapa').select('*')
  ]);
  if (error) return avisa('Não deu para carregar os processos.');
  procs = data || []; tempos = tp || [];
  desenhaLado(); desenha();
  if (aberto) { const p = procs.find(x => x.id === aberto.id); if (p) { aberto = p; desenhaCabecalho(); } }
}

// ===== lateral =====
const VISOES = [['andamento', 'Em andamento'], ['meus', 'Meus processos'], ['atrasados', 'Atrasados'], ['concluidos', 'Concluídos'], ['cancelados', 'Cancelados']];
const ICO_V = {
  andamento: '<svg viewBox="0 0 16 16"><rect x="2" y="2.5" width="3.5" height="11" rx="1" stroke="currentColor" stroke-width="1.4" fill="none"/><rect x="7" y="2.5" width="3.5" height="7" rx="1" stroke="currentColor" stroke-width="1.4" fill="none"/><rect x="12" y="2.5" width="2.5" height="9" rx="1" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
  meus: '<svg viewBox="0 0 16 16"><circle cx="8" cy="5.5" r="2.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2.8 13.5c.8-2.6 2.8-4 5.2-4s4.4 1.4 5.2 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  atrasados: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  concluidos: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.6 8.2l1.7 1.7 3.2-3.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cancelados: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 6l4 4M10 6l-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
};
const naVisao = (p, v) => v === 'andamento' ? p.situacao === 'andamento'
  : v === 'meus' ? p.situacao === 'andamento' && (p.responsavel_id === P.id || p.executor_id === P.id)
  : v === 'atrasados' ? p.situacao === 'andamento' && (p.em_atraso || p.etapa_atrasada)
  : v === 'concluidos' ? p.situacao === 'concluido' : p.situacao === 'cancelado';
const temInd = (p, i) => i === 'em_atraso' ? (p.em_atraso || p.etapa_atrasada) : (p.indicadores || []).includes(i);
const indsDe = p => INDS.map(([k]) => k).filter(k => temInd(p, k));

function desenhaLado() {
  const it = (attr, k, nome, ico, n, on) => `<li><button type="button" data-${attr}="${k}" class="${on ? 'is-on' : ''}">${ico}<span title="${nome}">${nome}</span><b>${n || ''}</b></button></li>`;
  $('visoes').innerHTML = VISOES.map(([k, n]) => it('v', k, n, ICO_V[k], procs.filter(p => naVisao(p, k) && (tipo === 'todos' || p.tipo === tipo)).length, visao === k)).join('');
  const naV = procs.filter(p => naVisao(p, visao));
  $('tipos').innerHTML = it('t', 'todos', 'Todos os tipos', '<span class="ui-ponto" style="--cor:#8A919C"></span>', naV.length, tipo === 'todos') +
    TIPOS.map(t => it('t', t.codigo, esc(t.nome), '<span class="ui-ponto" style="--cor:#7C5CDB"></span>', naV.filter(p => p.tipo === t.codigo).length, tipo === t.codigo)).join('');
  const base = naV.filter(p => tipo === 'todos' || p.tipo === tipo);
  $('inds').innerHTML = INDS.map(([k, n]) => `<li><button type="button" data-i="${k}" data-ind="${k}" class="${ind === k ? 'is-on' : ''}"><span class="ui-ponto"></span><span title="${n}">${n}</span><b>${base.filter(p => temInd(p, k)).length || ''}</b></button></li>`).join('');
  $('tipo-cel').innerHTML = [['todos', 'Todos os tipos'], ...TIPOS.map(t => [t.codigo, t.nome])].map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('');
  $('tipo-cel').value = tipo;
  $('t-nome').textContent = tipo === 'todos' ? 'Paralegal' : TIPO[tipo].nome;
  $('f-ind').hidden = !ind;
  if (ind) $('f-ind').innerHTML = `<span class="pl-ind" data-ind="${ind}">${NOME_IND[ind]}</span><button type="button" id="f-ind-x" aria-label="Tirar filtro">×</button>`;
}
document.querySelector('.tf-lado').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v) { visao = b.dataset.v; guarda('visao', visao); }
  else if (b.dataset.t) { tipo = b.dataset.t; guarda('tipo', tipo); }
  else if (b.dataset.i) { ind = ind === b.dataset.i ? null : b.dataset.i; }
  else return;
  desenhaLado(); desenha();
});
$('tipo-cel').onchange = () => { tipo = $('tipo-cel').value; guarda('tipo', tipo); desenhaLado(); desenha(); };
$('f-ind').addEventListener('click', e => { if (e.target.id === 'f-ind-x') { ind = null; desenhaLado(); desenha(); } });
['f-busca', 'f-resp', 'f-pr'].forEach(id => $(id).addEventListener('input', desenha));
document.querySelector('.tf-vistas').addEventListener('click', e => {
  const b = e.target.closest('button[data-v]'); if (!b) return;
  vista = b.dataset.v; guarda('vista', vista); desenha();
});

function filtrados() {
  const b = $('f-busca').value.trim().toLowerCase(), r = $('f-resp').value, pr = $('f-pr').value;
  return procs.filter(p => naVisao(p, visao) && (tipo === 'todos' || p.tipo === tipo) && (!ind || temInd(p, ind)) &&
    (!b || [p.numero, p.cliente_nome, p.razao_social, p.cnpj, p.empresa_nome, p.municipio, p.proxima_acao, p.pendencia].join(' ').toLowerCase().includes(b)) &&
    (!r || (r === '-' ? !p.responsavel_id && !p.executor_id : p.responsavel_id === r || p.executor_id === r)) &&
    (!pr || String(p.prioridade) === pr));
}

// ===== pedaços =====
const prazoDe = p => [p.prazo_interno, p.prazo_externo].filter(Boolean).sort()[0] || null;
function prazoHTML(p) {
  const d = prazoDe(p); if (!d) return '<span class="tf-vazio-c">·</span>';
  const hoje = hojeISO();
  const cls = p.situacao === 'andamento' && d < hoje ? ' tf-prazo--atraso' : d === hoje ? ' tf-prazo--hoje' : '';
  return `<span class="tf-prazo${cls}" title="Prazo interno ${dataBR(p.prazo_interno) || '·'} · externo ${dataBR(p.prazo_externo) || '·'}">${d === hoje ? 'Hoje' : curta(d)}</span>`;
}
const prioHTML = p => p.prioridade ? `<span class="tf-pr" data-pr="${p.prioridade}">${ICO_FLAG}${PRIO[p.prioridade]}</span>` : '<span class="tf-vazio-c">·</span>';
function rostos(p) {
  const ids = [...new Set([p.responsavel_id, p.executor_id].filter(Boolean))];
  if (!ids.length) return '<span class="ui-mini ui-mini--vazio" title="Sem responsável">+</span>';
  return ids.map(id => `<span class="ui-mini${id === p.responsavel_id ? '' : ' mini--seg'}" title="${esc(nomeDe(id))} · ${id === p.responsavel_id ? 'responsável' : 'executor'}">${iniciais(nomeDe(id))}</span>`).join('');
}
const indHTML = p => indsDe(p).map(k => `<span class="pl-ind" data-ind="${k}">${NOME_IND[k]}</span>`).join('');
const docsHTML = p => p.doc_total ? `<span class="pl-docs-mini${p.doc_obrig_falta === 0 ? ' is-ok' : ''}" title="Documentos: ${ST_DOCS[p.status_docs]}">${ICO_DOC}${p.doc_ok}/${p.doc_total}</span>` : '';
const diasHTML = p => p.situacao === 'andamento' ? `<span class="pl-dias${p.etapa_atrasada || p.dias_na_etapa > 15 ? ' is-muito' : ''}" title="Dias nesta etapa">${p.dias_na_etapa}d</span>` : '';
const nomeCard = p => p.empresa_nome || p.razao_social || p.cliente_nome;

// ===== quadro =====
function cardHTML(p) {
  return `<article class="tf-card${p.em_atraso && p.situacao === 'andamento' ? ' tf-card--atraso' : ''}" draggable="${p.situacao !== 'cancelado'}" data-id="${p.id}" tabindex="0">
    <div class="pl-card__top"><span class="pl-num">${esc(p.numero)}</span>${p.prioridade && p.prioridade <= 2 ? prioHTML(p) : ''}</div>
    <p class="tf-card__t">${esc(nomeCard(p))}</p>
    ${p.tipo_juridico || p.municipio ? `<p class="tf-card__emp">${esc([p.tipo_juridico, [p.municipio, p.uf].filter(Boolean).join('/')].filter(Boolean).join(' · '))}</p>` : ''}
    ${p.proxima_acao && p.situacao === 'andamento' ? `<p class="pl-prox"><b>Próxima:</b> ${esc(p.proxima_acao)}</p>` : ''}
    ${indsDe(p).length ? `<div class="pl-card__inds">${indHTML(p)}</div>` : ''}
    <div class="tf-card__pe">${prazoHTML(p)}${docsHTML(p)}${diasHTML(p)}<div class="tf-resp">${rostos(p)}</div></div>
  </article>`;
}
function quadroDe(tp, ps) {
  return `<div class="tf-quadro pl-quadro" data-tipo="${tp}">${etapasDe(tp).map(e => {
    const cs = ps.filter(p => p.etapa_id === e.id);
    return `<section class="tf-col${e.papel === 'exigencia' ? ' pl-col--exig' : ''}${e.papel === 'concluido' ? ' pl-col--fim' : ''}" data-etapa="${e.id}">
      <header class="tf-col__cab"><span class="pl-ord">${e.ordem}</span><b title="${esc(e.nome)}">${esc(e.nome)}</b><small>${cs.length || ''}</small></header>
      ${cs.map(cardHTML).join('')}
    </section>`;
  }).join('')}</div>`;
}
function desenhaQuadro(ps) {
  if (tipo !== 'todos') { $('corpo').innerHTML = quadroDe(tipo, ps); return; }
  const comCards = TIPOS.filter(t => ps.some(p => p.tipo === t.codigo));
  $('corpo').innerHTML = comCards.length
    ? comCards.map(t => `<section class="tf-grupo"><div class="tf-grupo__cab"><span class="tf-st" style="--st:#7C5CDB">${esc(t.nome)}</span><small>${ps.filter(p => p.tipo === t.codigo).length}</small></div>${quadroDe(t.codigo, ps.filter(p => p.tipo === t.codigo))}</section>`).join('')
    : '<p class="tf-nada">Nenhum processo aqui. Use + Processo para abrir um.</p>';
}

// ===== lista =====
function desenhaLista(ps) {
  if (!ps.length) { $('corpo').innerHTML = '<p class="tf-nada">Nenhum processo aqui.</p>'; return; }
  $('corpo').innerHTML = `<table class="tf-tab pl-tab"><thead><tr>
    <th class="c-num">Processo</th><th class="c-nome">Cliente</th><th class="c-tipo">Tipo</th><th class="c-etapa">Etapa</th>
    <th class="c-resp">Resp.</th><th class="c-prazo">Prazo</th><th class="c-pr">Prioridade</th><th class="c-docs">Docs</th><th class="c-mov">Movimento</th></tr></thead><tbody>
    ${ps.map(p => `<tr class="tf-lin" data-id="${p.id}" tabindex="0">
      <td class="c-num"><span class="pl-num">${esc(p.numero)}</span></td>
      <td class="c-nome"><div class="tf-nome"><span class="tf-nome__t" title="${esc(nomeCard(p))}">${esc(nomeCard(p))}</span>${indsDe(p).length > 1 ? `<span class="tf-contador" title="${indsDe(p).map(k => NOME_IND[k]).join(', ')}">+${indsDe(p).length - 1}</span>` : ''}${indsDe(p).slice(0, 1).map(k => `<span class="pl-ind" data-ind="${k}">${NOME_IND[k]}</span>`).join('')}</div><small class="pl-cel-etapa">${p.situacao === 'andamento' ? `${p.etapa_ordem}/${p.etapas_total} · ${esc(p.etapa_nome)}` : p.situacao === 'concluido' ? 'Concluído' : 'Cancelado'}${indsDe(p).length ? ' · ' + indsDe(p).map(k => NOME_IND[k]).join(', ') : ''}</small></td>
      <td class="c-tipo"><span class="tf-emp">${esc(p.tipo_nome)}</span></td>
      <td class="c-etapa">${p.situacao === 'andamento' ? `<span class="pl-etapa-sel"><i>${p.etapa_ordem}/${p.etapas_total}</i>${esc(p.etapa_nome)}</span>` : `<span class="pl-sit pl-sit--${p.situacao}">${p.situacao === 'concluido' ? 'Concluído ' + curta(p.concluido_em) : 'Cancelado'}</span>`}</td>
      <td class="c-resp"><div class="tf-resp">${rostos(p)}</div></td>
      <td class="c-prazo">${prazoHTML(p)}</td>
      <td class="c-pr">${prioHTML(p)}</td>
      <td class="c-docs">${docsHTML(p) || '<span class="tf-vazio-c">·</span>'}</td>
      <td class="c-mov"><span class="tf-prazo">${curta(p.ultima_mov)}</span></td>
    </tr>`).join('')}</tbody></table>`;
}

// ===== painel (Doc §8) =====
function desenhaPainel() {
  const and = procs.filter(p => p.situacao === 'andamento' && (tipo === 'todos' || p.tipo === tipo));
  const n = f => and.filter(f).length;
  const tiles = [
    ['', 'Em andamento', and.length], ['aguardando_cliente', 'Aguardando cliente', n(p => temInd(p, 'aguardando_cliente'))],
    ['aguardando_orgao', 'Aguardando órgão', n(p => temInd(p, 'aguardando_orgao'))], ['exigencia', 'Com exigência', n(p => temInd(p, 'exigencia'))],
    ['em_atraso', 'Em atraso', n(p => temInd(p, 'em_atraso'))], ['bloqueado', 'Bloqueados', n(p => temInd(p, 'bloqueado'))],
    ['pronto_revisao', 'Prontos para revisão', n(p => temInd(p, 'pronto_revisao'))], ['pronto_entrega', 'Prontos para entrega', n(p => temInd(p, 'pronto_entrega'))]
  ];
  const tiposVer = tipo === 'todos' ? TIPOS.filter(t => procs.some(p => p.tipo === t.codigo)) : [TIPO[tipo]];
  const porEtapa = tiposVer.map(t => {
    const ets = etapasDe(t.codigo).filter(e => e.papel !== 'concluido');
    const max = Math.max(1, ...ets.map(e => and.filter(p => p.etapa_id === e.id).length));
    return `<tbody>${tipo === 'todos' ? `<tr><th colspan="4" class="pl-grupo">${esc(t.nome)}</th></tr>` : ''}${ets.map(e => {
      const q = and.filter(p => p.etapa_id === e.id).length, tm = tempos.find(x => x.etapa_id === e.id);
      return `<tr><td>${e.ordem}. ${esc(e.nome)}</td><td><div class="pl-barra"><i style="width:${q / max * 100}%"></i></div></td><td class="n">${q || '<span class="tf-vazio-c">·</span>'}</td><td class="n">${tm ? String(tm.dias_media).replace('.', ',') + ' d' : '<span class="tf-vazio-c">·</span>'}</td></tr>`;
    }).join('')}</tbody>`;
  }).join('');
  const resp = [...new Set(and.map(p => p.responsavel_id || '-'))].map(id => {
    const ps = and.filter(p => (p.responsavel_id || '-') === id);
    return { nome: id === '-' ? 'Sem responsável' : nomeDe(id), q: ps.length, at: ps.filter(p => temInd(p, 'em_atraso')).length, ex: ps.filter(p => temInd(p, 'exigencia')).length, rev: ps.filter(p => temInd(p, 'pronto_revisao') || temInd(p, 'pronto_entrega')).length };
  }).sort((a, b) => b.q - a.q);
  $('corpo').innerHTML = `<div class="pl-painel">
    <div class="pl-nums">${tiles.map(([k, nome, q]) => `<button type="button" class="pl-num-c" data-tile="${k}" data-alerta="${(k === 'em_atraso' || k === 'exigencia' || k === 'bloqueado') && q ? 1 : 0}"><strong>${q}</strong><span>${nome}</span></button>`).join('')}</div>
    <div class="pl-duas">
      <section class="pl-bloco"><h3>Em que etapa estão <small>quantos agora e tempo médio em cada etapa</small></h3>
        ${tiposVer.length ? `<table class="pl-tab-p"><thead><tr><th>Etapa</th><th style="width:28%"></th><th class="n">Agora</th><th class="n">Média</th></tr></thead>${porEtapa}</table>` : '<p class="tf-nada">Sem processos ainda.</p>'}
      </section>
      <section class="pl-bloco"><h3>Por responsável</h3>
        ${resp.length ? `<table class="pl-tab-p"><thead><tr><th>Pessoa</th><th class="n">Ativos</th><th class="n">Atraso</th><th class="n">Exigência</th><th class="n">Revisão/entrega</th></tr></thead><tbody>
        ${resp.map(r => `<tr><td>${esc(r.nome)}</td><td class="n">${r.q}</td><td class="n">${r.at ? `<span class="tf-prazo--atraso">${r.at}</span>` : '·'}</td><td class="n">${r.ex || '·'}</td><td class="n">${r.rev || '·'}</td></tr>`).join('')}</tbody></table>` : '<p class="tf-nada">Nenhum processo em andamento.</p>'}
      </section>
    </div>
  </div>`;
}

function desenha() {
  document.querySelectorAll('.tf-vistas button').forEach(b => b.classList.toggle('is-on', b.dataset.v === vista));
  const ps = filtrados();
  $('total').textContent = vista === 'painel' ? '' : ps.length + (ps.length === 1 ? ' processo' : ' processos');
  vista === 'painel' ? desenhaPainel() : vista === 'quadro' ? desenhaQuadro(ps) : desenhaLista(ps);
}

$('corpo').addEventListener('click', e => {
  const tile = e.target.closest('[data-tile]');
  if (tile) { ind = tile.dataset.tile || null; visao = 'andamento'; vista = 'lista'; guarda('vista', vista); desenhaLado(); desenha(); return; }
  const c = e.target.closest('[data-id]'); if (c) abre(c.dataset.id);
});
$('corpo').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('[data-id]'); if (c) abre(c.dataset.id); } });

// arrastar no quadro: soltar abre o "mover" com a etapa escolhida (pede observação e próxima ação)
let arrastando = null;
$('corpo').addEventListener('dragstart', e => { const c = e.target.closest('.tf-card'); if (c) { arrastando = c.dataset.id; c.classList.add('voando'); } });
$('corpo').addEventListener('dragend', e => { e.target.closest?.('.tf-card')?.classList.remove('voando'); document.querySelectorAll('.tf-col.alvo').forEach(x => x.classList.remove('alvo')); });
$('corpo').addEventListener('dragover', e => {
  const col = e.target.closest('.tf-col'); if (!col || !arrastando) return;
  const p = procs.find(x => x.id === arrastando);
  if (ETAPA[col.dataset.etapa]?.tipo !== p?.tipo) return;
  e.preventDefault(); document.querySelectorAll('.tf-col.alvo').forEach(x => x !== col && x.classList.remove('alvo')); col.classList.add('alvo');
});
$('corpo').addEventListener('drop', async e => {
  const col = e.target.closest('.tf-col'); if (!col || !arrastando) return;
  e.preventDefault(); col.classList.remove('alvo');
  const p = procs.find(x => x.id === arrastando); arrastando = null;
  if (!p || +col.dataset.etapa === p.etapa_id) return;
  abreMover(p, +col.dataset.etapa);
});

// ===== diálogos =====
document.querySelectorAll('[data-fecha-dlg]').forEach(b => b.onclick = () => b.closest('dialog').close());

// novo processo
$('novo').onclick = () => {
  $('f-novo').reset();
  if (tipo !== 'todos') $('n-tipo').value = tipo;
  $('n-nat-box').hidden = !TIPO[$('n-tipo').value]?.usa_natureza;
  if (P.area === 'paralegal') $('n-exec').value = P.id;
  $('dlg-novo').showModal(); $('n-cliente').focus();
};
$('n-tipo').onchange = () => { $('n-nat-box').hidden = !TIPO[$('n-tipo').value]?.usa_natureza; };
$('n-emp').onchange = () => {
  const e = emps.find(x => x.id === $('n-emp').value); if (!e) return;
  if (!$('n-cliente').value.trim()) $('n-cliente').value = nomeEmp(e);
  if (!$('n-mun').value) $('n-mun').value = e.municipio || '';
  if (!$('n-uf').value) $('n-uf').value = e.uf || '';
};
$('f-novo').onsubmit = async ev => {
  ev.preventDefault();
  const tp = $('n-tipo').value, e = emps.find(x => x.id === $('n-emp').value);
  const nats = TIPO[tp]?.usa_natureza ? [...$('n-nat').querySelectorAll('input:checked')].map(i => i.value) : [];
  const linha = {
    tipo: tp, cliente_nome: $('n-cliente').value.trim(), empresa_id: e?.id || null, naturezas: nats,
    razao_social: e?.razao_social || null, cnpj: e?.cnpj || null, tipo_juridico: $('n-tj').value.trim() || null,
    municipio: $('n-mun').value.trim() || null, uf: $('n-uf').value.trim().toUpperCase() || null,
    responsavel_id: $('n-resp').value || null, executor_id: $('n-exec').value || null,
    prioridade: +$('n-pr').value || null, prazo_interno: $('n-prazo').value || null,
    proxima_acao: $('n-prox').value.trim() || null, link_pasta: $('n-pasta').value.trim() || null
  };
  if (!linha.cliente_nome) return;
  const { data, error } = await banco.from('paralegal_processo').insert(linha).select('id,numero').single();
  if (error) return avisa('Não deu para abrir: ' + erroBanco(error));
  $('dlg-novo').close();
  avisa(`Processo ${data.numero} aberto.`);
  await carrega(); abre(data.id);
};

// mover
let moverDe = null;
function abreMover(p, para) {
  moverDe = p;
  const ets = etapasDe(p.tipo);
  $('m-titulo').textContent = `Mover ${p.numero}`;
  $('m-etapa').innerHTML = ets.map(e => `<option value="${e.id}"${e.id === p.etapa_id ? ' disabled' : ''}>${e.ordem}. ${esc(e.nome)}${e.id === p.etapa_id ? ' (atual)' : ''}</option>`).join('');
  $('m-etapa').value = String(para || '');
  $('m-obs').value = ''; $('m-prox').value = ''; $('m-erro').hidden = true;
  atualizaBotaoMover();
  $('dlg-mover').showModal();
}
const atualizaBotaoMover = () => {
  const e = ETAPA[$('m-etapa').value], de = moverDe && ETAPA[moverDe.etapa_id];
  $('m-ok').textContent = !e || !de ? 'Mover' : e.papel === 'concluido' ? 'Concluir' : e.ordem < de.ordem ? 'Devolver' : 'Avançar';
};
$('m-etapa').onchange = atualizaBotaoMover;
$('f-mover').onsubmit = async ev => {
  ev.preventDefault();
  $('m-ok').disabled = true;
  const { error } = await banco.rpc('paralegal_mover', { p_processo: moverDe.id, p_para: +$('m-etapa').value, p_obs: $('m-obs').value, p_proxima: $('m-prox').value });
  $('m-ok').disabled = false;
  if (error) { $('m-erro').textContent = error.message; $('m-erro').hidden = false; return; }
  $('dlg-mover').close();
  avisa('Card movido. Ficou no histórico.');
  await carrega(); if (aberto?.id === moverDe.id) recarregaGaveta();
};

// texto curto (justificativa, motivo, entrega)
let textoOk = null;
function pedeTexto(titulo, botao, obrigatorio, fn, inicial = '') {
  $('tx-titulo').textContent = titulo; $('tx-ok').textContent = botao;
  $('tx-campo').value = inicial; $('tx-campo').required = obrigatorio; $('tx-campo').minLength = obrigatorio ? 3 : 0;
  textoOk = fn; $('dlg-texto').showModal(); $('tx-campo').focus();
}
$('f-texto').onsubmit = async ev => {
  ev.preventDefault();
  const ok = await textoOk?.($('tx-campo').value.trim());
  if (ok !== false) $('dlg-texto').close();
};

// ===== gaveta =====
const gav = $('gaveta');
gav.addEventListener('click', e => { if (e.target.closest('[data-fecha]')) fecha(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !gav.hidden && !document.querySelector('dialog[open]')) fecha(); });
function fecha() { gav.hidden = true; aberto = null; if (location.hash) history.replaceState(null, '', location.pathname + location.search); }

async function abre(id) {
  const p = procs.find(x => x.id === id); if (!p) return;
  aberto = p; gav.hidden = false;
  history.replaceState(null, '', '#' + id);
  desenhaCabecalho(); desenhaProps();
  await recarregaGaveta();
  $('d-miolo').scrollTop = 0;
}
async function recarregaGaveta() {
  if (!aberto) return;
  const id = aberto.id;
  const [{ data: et }, { data: ds }, { data: mv }, { data: falta }] = await Promise.all([
    banco.from('paralegal_processo_etapa').select('*').eq('processo_id', id),
    banco.from('paralegal_doc_item').select('*').eq('processo_id', id).order('grupo').order('ordem').order('nome'),
    banco.from('paralegal_movimento').select('*').eq('processo_id', id).order('criado_em', { ascending: false }).order('id', { ascending: false }),
    banco.rpc('paralegal_falta_concluir', { p_processo: id })
  ]);
  if (aberto?.id !== id) return;
  const p = procs.find(x => x.id === id); if (p) aberto = p;
  abertoEt = et || []; abertoDocs = ds || []; abertoMov = mv || [];
  desenhaCabecalho(); desenhaProps(); desenhaEtapas(); desenhaDocs(); desenhaHist(); desenhaExigs();
  const f = falta || [];
  $('d-falta').hidden = aberto.situacao !== 'andamento' || !f.length || !['entrega'].includes(aberto.etapa_papel);
  $('d-falta').innerHTML = '<b>Falta para concluir:</b> ' + f.map(esc).join(' · ');
}

function desenhaCabecalho() {
  const p = aberto; if (!p) return;
  $('d-onde').innerHTML = `<span class="pl-num">${esc(p.numero)}</span> · ${esc(p.tipo_nome)}`;
  if (document.activeElement !== $('d-cliente')) $('d-cliente').textContent = p.cliente_nome;
  const sit = p.situacao === 'concluido' ? `<span class="pl-sit pl-sit--concluido">Concluído em ${dataBR(p.concluido_em)}</span>`
    : p.situacao === 'cancelado' ? `<span class="pl-sit">Cancelado: ${esc(p.cancelado_motivo || '')}</span>` : '';
  $('d-etapa').innerHTML = `<span class="tf-st">${p.etapa_ordem}/${p.etapas_total} · ${esc(p.etapa_nome)}</span>
    ${p.situacao === 'andamento' ? `<span>há ${p.dias_na_etapa} ${p.dias_na_etapa === 1 ? 'dia' : 'dias'} nesta etapa</span>` : ''}
    ${p.entregue_em ? `<span>Entregue em ${dataBR(p.entregue_em)}</span>` : ''}${sit}`;
  const vivo = p.situacao === 'andamento';
  $('a-avancar').hidden = !vivo || p.etapa_papel === 'concluido';
  $('a-exig').hidden = !vivo; $('a-entrega').hidden = !vivo; $('a-cancelar').hidden = !vivo;
  $('a-entrega').textContent = p.entregue_em ? 'Entrega registrada' : 'Registrar entrega';
  $('a-entrega').disabled = !!p.entregue_em;
  $('a-mover').hidden = p.situacao === 'cancelado';
  $('a-mover').textContent = p.situacao === 'concluido' ? 'Reabrir' : 'Mover';
  $('d-inds').innerHTML = INDS.map(([k, n]) => `<button type="button" class="pl-chip" data-ind="${k}" data-chip="${k}" aria-pressed="${temInd(p, k)}"${k === 'em_atraso' || !vivo ? ' disabled' : ''}${k === 'em_atraso' ? ' title="Automático: passa do prazo interno, do externo ou do tempo da etapa"' : ''}>${n}</button>`).join('');
}

// propriedades do card (Doc §4)
const CAMPOS = [
  ['empresa_id', 'Empresa', 'emp'], ['razao_social', 'Razão social', 'txt'], ['cnpj', 'CNPJ', 'txt'], ['tipo_juridico', 'Tipo jurídico', 'tj'],
  ['natureza_desc', 'Natureza', 'txt'], ['municipio', 'Município', 'txt'], ['uf', 'UF', 'uf'], ['orgaos', 'Órgãos', 'txt'],
  ['responsavel_id', 'Responsável', 'pes'], ['executor_id', 'Executor', 'pes'], ['aberto_em', 'Aberto em', 'data'], ['prioridade', 'Prioridade', 'pr'],
  ['prazo_interno', 'Prazo interno', 'data'], ['prazo_externo', 'Prazo externo', 'data'], ['prazo_externo_validado', 'Externo validado', 'chk'],
  ['status_protocolo', 'Protocolo', 'prot'], ['protocolo_numero', 'Nº protocolo', 'txt'], ['protocolo_orgao', 'Órgão do protocolo', 'txt'],
  ['protocolo_data', 'Data protocolo', 'data'], ['link_pasta', 'Pasta', 'link'],
  ['pendencia', 'Pendência principal', 'area'], ['proxima_acao', 'Próxima ação', 'area'], ['observacoes', 'Observações', 'area']
];
function campoHTML([col, rot, tp]) {
  const v = aberto[col];
  const opts = (lista, vazio) => `<option value="">${vazio}</option>` + lista.map(([k, n]) => `<option value="${k}"${String(v ?? '') === String(k) ? ' selected' : ''}>${esc(n)}</option>`).join('');
  let ctl;
  if (tp === 'emp') ctl = `<select class="ui-in" data-col="${col}">${opts(emps.map(e => [e.id, nomeEmp(e)]), 'Sem empresa cadastrada')}</select>`;
  else if (tp === 'pes') ctl = `<select class="ui-in" data-col="${col}">${opts(equipe.map(p => [p.id, p.nome]), 'Ninguém')}</select>`;
  else if (tp === 'pr') ctl = `<select class="ui-in" data-col="${col}">${opts(Object.entries(PRIO), 'Sem')}</select>`;
  else if (tp === 'prot') ctl = `<select class="ui-in" data-col="${col}">${Object.entries(PROTOCOLO).map(([k, n]) => `<option value="${k}"${v === k ? ' selected' : ''}>${n}</option>`).join('')}</select>`;
  else if (tp === 'data') ctl = `<input class="ui-in" type="date" data-col="${col}" value="${esc(v ? String(v).slice(0, 10) : '')}">`;
  else if (tp === 'chk') ctl = `<label class="tf-chk"><input type="checkbox" data-col="${col}"${v ? ' checked' : ''}> sim</label>`;
  else if (tp === 'area') ctl = `<textarea class="ui-in" rows="1" data-col="${col}">${esc(v)}</textarea>`;
  else if (tp === 'link') ctl = `<span class="pl-link"><input class="ui-in" type="url" data-col="${col}" value="${esc(v)}" placeholder="Link da pasta">${v ? `<a href="${esc(v)}" target="_blank" rel="noopener">Abrir</a>` : ''}</span>`;
  else ctl = `<input class="ui-in" data-col="${col}" value="${esc(v)}"${tp === 'uf' ? ' maxlength="2"' : ''}${tp === 'tj' ? ' list="tipos-juridicos"' : ''}>`;
  return `<div${tp === 'area' || tp === 'link' ? ' class="pl-largo"' : ''}><dt>${rot}</dt><dd>${ctl}</dd></div>`;
}
function desenhaProps() {
  const p = aberto; if (!p) return;
  const ativo = document.activeElement?.dataset?.col;
  if (ativo && $('d-props').contains(document.activeElement)) return;   // não apaga o que a pessoa está digitando
  $('d-props').innerHTML = CAMPOS.map(campoHTML).join('');
  const usa = TIPO[p.tipo]?.usa_natureza;
  $('d-nat-box').hidden = !usa;
  if (usa) $('d-nat').innerHTML = NATS.map(n => `<label><input type="checkbox" value="${n.codigo}"${(p.naturezas || []).includes(n.codigo) ? ' checked' : ''}${p.situacao !== 'andamento' ? ' disabled' : ''}> ${esc(n.nome)}</label>`).join('');
}
$('d-props').addEventListener('change', async e => {
  const el = e.target.closest('[data-col]'); if (!el || !aberto) return;
  const col = el.dataset.col;
  let v = el.type === 'checkbox' ? el.checked : el.value.trim();
  if (v === '') v = null;
  if (col === 'prioridade' && v) v = +v;
  if (col === 'uf' && v) v = v.toUpperCase();
  const mud = { [col]: v };
  if (col === 'empresa_id' && v) {
    const em = emps.find(x => x.id === v);
    if (em && !aberto.razao_social) mud.razao_social = em.razao_social;
    if (em && !aberto.cnpj) mud.cnpj = em.cnpj;
  }
  const { error } = await banco.from('paralegal_processo').update(mud).eq('id', aberto.id);
  if (error) return avisa('Não salvou: ' + erroBanco(error));
  Object.assign(aberto, mud);
  el.blur?.();
  carrega().then(() => recarregaGaveta());
});
$('d-cliente').addEventListener('blur', async () => {
  const t = $('d-cliente').textContent.trim();
  if (!aberto || !t || t === aberto.cliente_nome) { if (aberto) $('d-cliente').textContent = aberto.cliente_nome; return; }
  const { error } = await banco.from('paralegal_processo').update({ cliente_nome: t }).eq('id', aberto.id);
  if (error) return avisa('Não salvou o nome.');
  aberto.cliente_nome = t; carrega();
});
$('d-cliente').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('d-cliente').blur(); } });
$('d-nat').addEventListener('change', async () => {
  const nats = [...$('d-nat').querySelectorAll('input:checked')].map(i => i.value);
  const { error } = await banco.rpc('paralegal_naturezas', { p_processo: aberto.id, p_naturezas: nats });
  if (error) return avisa('Não salvou a natureza: ' + erroBanco(error));
  avisa('Natureza salva. Etapas que não se aplicam foram dispensadas com justificativa.');
  await carrega(); recarregaGaveta();
});

// indicadores
$('d-inds').addEventListener('click', async e => {
  const b = e.target.closest('[data-chip]'); if (!b || b.disabled || !aberto) return;
  const liga = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', String(liga));
  const { error } = await banco.rpc('paralegal_indicador', { p_processo: aberto.id, p_ind: b.dataset.chip, p_liga: liga });
  if (error) { b.setAttribute('aria-pressed', String(!liga)); return avisa('Não salvou: ' + erroBanco(error)); }
  await carrega(); recarregaGaveta();
});

// etapas do processo
const ST_ET = { pendente: 'Pendente', feita: 'Feita', dispensada: 'Dispensada' };
function desenhaEtapas() {
  const p = aberto; const ets = etapasDe(p.tipo);
  const est = Object.fromEntries(abertoEt.map(x => [x.etapa_id, x]));
  const aplic = abertoEt.filter(x => x.status !== 'dispensada').length, feitas = abertoEt.filter(x => x.status === 'feita').length;
  $('d-et-conta').textContent = `${feitas} de ${aplic} aplicáveis`;
  const vivo = p.situacao === 'andamento';
  $('d-etapas').innerHTML = ets.map(e => {
    const x = est[e.id] || { status: 'pendente' };
    const info = x.status === 'feita' ? `Feita em ${dataBR(x.feita_em)}${x.feita_por ? ' por ' + esc(nomeDe(x.feita_por).split(' ')[0]) : ''}`
      : x.status === 'dispensada' ? 'Dispensada: ' + esc(x.justificativa || '')
      : [!e.obrigatoria ? 'Só quando houver' : '', e.prazo_dias ? `Até ${e.prazo_dias} dias` : ''].filter(Boolean).join(' · ');
    let acoes = '';
    if (vivo && e.papel !== 'concluido') acoes = x.status === 'pendente'
      ? `<button type="button" data-et="${e.id}" data-acao="feita">Feita</button><button type="button" data-et="${e.id}" data-acao="dispensada">Dispensar</button>`
      : `<button type="button" data-et="${e.id}" data-acao="pendente">Reabrir</button>`;
    return `<li data-s="${x.status}" class="${e.id === p.etapa_id ? 'is-atual' : ''}">
      <span class="pl-et-bol" title="${ST_ET[x.status]}"></span>
      <div><button type="button" class="pl-et-nome" data-desc="${e.id}">${e.ordem}. ${esc(e.nome)}</button>${info ? `<span class="pl-et-info">${info}</span>` : ''}
        <div class="pl-et-desc" id="et-desc-${e.id}" hidden>${esc(e.descricao || 'Sem descrição.').replace(/\n/g, '<br>')}</div></div>
      <span class="pl-et-acao">${acoes}</span>
    </li>`;
  }).join('');
}
$('d-etapas').addEventListener('click', async e => {
  const d = e.target.closest('[data-desc]');
  if (d) { const box = $('et-desc-' + d.dataset.desc); box.hidden = !box.hidden; return; }
  const b = e.target.closest('[data-acao]'); if (!b || !aberto) return;
  const et = +b.dataset.et, acao = b.dataset.acao;
  const marca = async just => {
    const { error } = await banco.rpc('paralegal_marcar_etapa', { p_processo: aberto.id, p_etapa: et, p_status: acao, p_justificativa: just || null });
    if (error) { avisa(erroBanco(error)); return false; }
    await carrega(); recarregaGaveta();
  };
  if (acao === 'dispensada') pedeTexto(`Dispensar "${ETAPA[et].nome}"`, 'Dispensar', true, marca, '');
  else marca(null);
});

// documentos
function desenhaDocs() {
  const ok = abertoDocs.filter(d => ['recebido', 'conferido', 'dispensado'].includes(d.status)).length;
  $('d-doc-conta').textContent = abertoDocs.length ? `${ok} de ${abertoDocs.length}` : '';
  const grupo = (g, titulo) => {
    const ds = abertoDocs.filter(d => d.grupo === g); if (!ds.length) return '';
    return `<li class="pl-grupo">${titulo}</li>` + ds.map(d => `<li data-doc="${d.id}">
      <b title="${esc(d.nome)}">${esc(d.nome)}${d.obrigatorio ? '' : '<small>opcional</small>'}</b>
      <select class="ui-in pl-doc-st" data-s="${d.status}" data-doc-st aria-label="Status do documento">${Object.entries(DOC_ST).map(([k, n]) => `<option value="${k}"${d.status === k ? ' selected' : ''}>${n}</option>`).join('')}</select>
      <span class="pl-doc-link"><input class="ui-in" type="url" data-doc-link value="${esc(d.link)}" placeholder="Link do arquivo na pasta" aria-label="Link do arquivo">${d.link ? `<a href="${esc(d.link)}" target="_blank" rel="noopener">Abrir</a>` : ''}</span>
      ${d.status === 'dispensado' && d.observacao ? `<span class="pl-et-info" style="grid-column:1/-1">Dispensado: ${esc(d.observacao)}</span>` : ''}
    </li>`).join('');
  };
  $('d-docs').innerHTML = grupo('cliente', 'Do cliente') + grupo('final', 'Entregáveis (guardar antes de concluir)') || '<li class="pl-et-info">Sem documentos na lista.</li>';
}
$('d-docs').addEventListener('change', async e => {
  const li = e.target.closest('[data-doc]'); if (!li) return;
  const id = li.dataset.doc;
  if (e.target.matches('[data-doc-st]')) {
    const st = e.target.value;
    const salva = async obs => {
      const { error } = await banco.from('paralegal_doc_item').update(st === 'dispensado' ? { status: st, observacao: obs } : { status: st }).eq('id', id);
      if (error) { avisa('Não salvou: ' + erroBanco(error)); return false; }
      await carrega(); recarregaGaveta();
    };
    if (st === 'dispensado') pedeTexto('Por que esse documento não é necessário?', 'Dispensar', true, salva);
    else salva();
  } else if (e.target.matches('[data-doc-link]')) {
    const { error } = await banco.from('paralegal_doc_item').update({ link: e.target.value.trim() || null }).eq('id', id);
    if (error) return avisa('Não salvou o link.');
    recarregaGaveta();
  }
});
$('d-doc-novo').onsubmit = async ev => {
  ev.preventDefault();
  const nome = $('d-doc-nome').value.trim(); if (!nome || !aberto) return;
  const { error } = await banco.from('paralegal_doc_item').insert({ processo_id: aberto.id, nome, grupo: 'cliente', obrigatorio: false, ordem: 500 });
  if (error) return avisa('Não adicionou: ' + erroBanco(error));
  $('d-doc-nome').value = ''; await carrega(); recarregaGaveta();
};

// exigências (cada uma é uma tarefa na lista Paralegal)
async function desenhaExigs() {
  const ex = abertoMov.filter(m => m.tipo === 'exigencia');
  $('d-exig-sec').hidden = !ex.length;
  if (!ex.length) return;
  const ids = ex.map(m => m.tarefa_id).filter(Boolean);
  const { data: ts } = ids.length ? await banco.from('tarefa').select('id,status,prazo,responsavel_id').in('id', ids) : { data: [] };
  const T = Object.fromEntries((ts || []).map(t => [t.id, t]));
  const NST = { a_fazer: 'A fazer', fazendo: 'Fazendo', conferencia: 'Conferência', pronto: 'Pronto', enviado: 'Enviado', cancelado: 'Cancelado' };
  $('d-exigs').innerHTML = ex.map(m => {
    const t = T[m.tarefa_id];
    return `<li><time class="tf-prazo">${curta(m.criado_em)}</time><p>${esc(m.observacao)}</p>
      ${t ? `<span class="tf-st" data-st="${t.status}">${NST[t.status]}</span><span class="tf-prazo${t.prazo < hojeISO() && !['pronto', 'enviado', 'cancelado'].includes(t.status) ? ' tf-prazo--atraso' : ''}">${curta(t.prazo)}</span><span class="ui-mini" title="${esc(nomeDe(t.responsavel_id))}">${iniciais(nomeDe(t.responsavel_id))}</span>` : ''}</li>`;
  }).join('');
}

// histórico
const ROTULO_EDICAO = { responsavel: 'responsável', executor: 'executor', prazo_interno: 'prazo interno', prazo_externo: 'prazo externo', prioridade: 'prioridade',
  status_protocolo: 'protocolo', protocolo_numero: 'nº do protocolo', pendencia: 'pendência', proxima_acao: 'próxima ação', naturezas: 'natureza' };
const valorEdicao = (k, v) => v == null || v === '' ? 'vazio' : k === 'prioridade' ? PRIO[v] : k === 'status_protocolo' ? PROTOCOLO[v] : /prazo/.test(k) ? dataBR(v) : v;
function textoMov(m) {
  const de = ETAPA[m.de_etapa]?.nome, para = ETAPA[m.para_etapa]?.nome, d = m.detalhe || {};
  switch (m.tipo) {
    case 'abertura': return 'abriu o processo';
    case 'avanco': return `avançou de <b>${esc(de)}</b> para <b>${esc(para)}</b>`;
    case 'volta': return `devolveu de <b>${esc(de)}</b> para <b>${esc(para)}</b>`;
    case 'reabertura': return `reabriu o processo em <b>${esc(para)}</b>`;
    case 'conclusao': return '<b>concluiu o processo</b>';
    case 'exigencia': return `registrou exigência, tarefa para ${esc(d.responsavel || 'o executor')} até ${dataBR(d.prazo)}`;
    case 'etapa': return `marcou <b>${esc(para)}</b> como ${({ feita: 'feita', dispensada: 'dispensada', pendente: 'pendente' })[d.status] || d.status}`;
    case 'indicador': return `${d.ligado ? 'ligou' : 'desligou'} <b>${esc(NOME_IND[d.indicador] || d.indicador)}</b>`;
    case 'documento': return `documento <b>${esc(d.documento)}</b>: ${esc(DOC_ST[d.status] || d.status)}`;
    case 'edicao': return 'alterou ' + Object.entries(d).map(([k, v]) => `${ROTULO_EDICAO[k] || k} para <b>${esc(valorEdicao(k, v))}</b>`).join(', ');
    case 'entrega': return '<b>registrou a entrega ao cliente</b>';
    case 'cancelamento': return '<b>cancelou o processo</b>';
    case 'nota': return 'anotou';
    default: return m.tipo;
  }
}
function desenhaHist() {
  $('d-hist').innerHTML = abertoMov.map(m => `<li><time>${hora(m.criado_em)}</time><span><b>${esc(nomeDe(m.pessoa_id).split(' ')[0] || 'Sistema')}</b> ${textoMov(m)}
    ${m.observacao && m.tipo !== 'abertura' ? `<em>${esc(m.observacao)}</em>` : ''}${m.proxima_acao ? `<span class="pl-prox-h">Próxima ação: ${esc(m.proxima_acao)}</span>` : ''}</span></li>`).join('');
}
$('d-nota').onsubmit = async ev => {
  ev.preventDefault();
  const t = $('d-nota-txt').value.trim(); if (!t || !aberto) return;
  const { error } = await banco.from('paralegal_movimento').insert({ processo_id: aberto.id, tipo: 'nota', observacao: t, para_etapa: aberto.etapa_id, pessoa_id: P.id });
  if (error) return avisa('Não anotou.');
  $('d-nota-txt').value = ''; recarregaGaveta();
};

// ações do card
function proximaEtapa() {
  const ets = etapasDe(aberto.tipo), atual = ETAPA[aberto.etapa_id];
  const st = Object.fromEntries(abertoEt.map(x => [x.etapa_id, x.status]));
  return ets.find(e => e.ordem > atual.ordem && st[e.id] !== 'dispensada' && e.papel !== 'exigencia');
}
$('a-avancar').onclick = () => { const n = proximaEtapa(); if (n) abreMover(aberto, n.id); };
$('a-mover').onclick = () => {
  if (aberto.situacao === 'concluido') { const ent = etapasDe(aberto.tipo).find(e => e.papel === 'entrega'); abreMover(aberto, ent?.id); }
  else abreMover(aberto, null);
};
$('a-exig').onclick = () => {
  $('f-exig').reset(); $('x-prazo').value = maisDias(5);
  $('x-mover').checked = ETAPA[aberto.etapa_id]?.papel !== 'exigencia';
  $('dlg-exig').showModal(); $('x-desc').focus();
};
$('f-exig').onsubmit = async ev => {
  ev.preventDefault();
  const { error } = await banco.rpc('paralegal_exigencia', { p_processo: aberto.id, p_descricao: $('x-desc').value.trim(),
    p_responsavel: $('x-resp').value || null, p_prazo: $('x-prazo').value, p_mover: $('x-mover').checked });
  if (error) return avisa('Não registrou: ' + erroBanco(error));
  $('dlg-exig').close();
  avisa('Exigência registrada. A tarefa de correção está na lista Paralegal.');
  await carrega(); recarregaGaveta();
};
$('a-entrega').onclick = () => pedeTexto('Registrar a entrega ao cliente', 'Registrar', false, async obs => {
  const { error } = await banco.rpc('paralegal_entregar', { p_processo: aberto.id, p_obs: obs || null });
  if (error) { avisa(erroBanco(error)); return false; }
  avisa('Entrega registrada.'); await carrega(); recarregaGaveta();
}, 'Documentos enviados ao cliente por ');
$('a-cancelar').onclick = () => pedeTexto(`Cancelar ${aberto.numero}? Escreva o motivo`, 'Cancelar processo', true, async motivo => {
  const { error } = await banco.rpc('paralegal_cancelar', { p_processo: aberto.id, p_motivo: motivo });
  if (error) { avisa(erroBanco(error)); return false; }
  avisa('Processo cancelado.'); await carrega(); recarregaGaveta();
});

// tempo real: outro colega mexeu
let rtT;
banco.channel('coleve-paralegal').on('postgres_changes', { event: '*', schema: 'public', table: 'paralegal_processo' }, () => {
  clearTimeout(rtT); rtT = setTimeout(() => carrega().then(() => { if (aberto && !document.querySelector('dialog[open]')) recarregaGaveta(); }), 600);
}).subscribe();

await carrega();
document.body.classList.remove('carregando');
const hash = location.hash.slice(1);
if (hash && procs.some(p => p.id === hash)) abre(hash);
