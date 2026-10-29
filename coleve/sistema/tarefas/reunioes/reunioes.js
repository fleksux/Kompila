// Sistema Coleve · resumo executivo de reunião (modelo do Manu, 28/10/2026)
// O plano de ação e os próximos passos viram tarefas (gatilho no banco); ?imprimir=<id> mostra a versão de PDF.
import { banco, quemSou } from '../../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../../entrar/'); throw 0; }
const P = eu.pessoa;
const chefe = ['admin', 'gestor'].includes(P.papel);
if (P.area === 'marketing' && !chefe) document.querySelectorAll('.barra__nav a[href$="clientes/"]').forEach(a => a.remove());

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? d.slice(0, 10).split('-').reverse().join('/') : '';
const quandoBR = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 5000); };
const STATUS = { a_fazer: 'A fazer', andamento: 'Em andamento', atencao: 'Em atenção', concluido: 'Concluído' };
const ST_COR = { a_fazer: 'st--novo', andamento: 'st--env', atencao: 'st--atraso', concluido: 'st--lido' };
const ST_ASS = { andamento: 'Em andamento', concluido: 'Concluído', pendente: 'Pendente' };
const ST_TAREFA = { a_fazer: 'A fazer', fazendo: 'Em andamento', conferencia: 'Em conferência', pronto: 'Pronto', enviado: 'Concluído', cancelado: 'Cancelado' };

$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../../entrar/'); };

const [{ data: equipe }, { data: empresas }] = await Promise.all([
  banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia').eq('ativo', true).order('razao_social')
]);
const pessoas = new Map((equipe || []).map(p => [p.id, p.nome]));
const opPessoas = (sel, vazio = 'Ninguém') => `<option value="">${vazio}</option>` + (equipe || []).map(p => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}>${esc(p.nome)}</option>`).join('');
$('r-acomp').innerHTML = opPessoas('');
(empresas || []).forEach(e => $('r-empresa').insertAdjacentHTML('beforeend', `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`));

// ===== versão de impressão =====
const imprimir = new URLSearchParams(location.search).get('imprimir');
if (imprimir) { await mostraDoc(imprimir); document.body.classList.remove('carregando'); throw 0; }

// ===== lista =====
let reunioes = [];
async function carrega() {
  const { data, error } = await banco.from('v_reuniao').select('*').order('quando', { ascending: false });
  if (error) return avisa('Não deu para carregar as reuniões.');
  reunioes = data || [];
  $('total').textContent = `· ${reunioes.length}`;
  $('lista').innerHTML = reunioes.map(r => `
    <button type="button" class="rn-card" data-id="${r.id}">
      <span class="rn-card__topo"><span class="rn-data"><b>${new Date(r.quando).toLocaleDateString('pt-BR', { day: '2-digit' })}</b>${new Date(r.quando).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span><em class="st ${ST_COR[r.status]}">${STATUS[r.status]}</em></span>
      <b class="rn-card__t">${esc(r.titulo)}</b>
      <small>${r.empresa_nome ? esc(r.empresa_nome) + ' · ' : 'Interna · '}${esc(r.participantes || 'participantes a preencher')}</small>
      <span class="rn-barra" aria-hidden="true"><i style="width:${r.acoes ? Math.round(r.acoes_feitas / r.acoes * 100) : 0}%"></i></span>
      <span class="rn-card__pe"><span>${r.acoes ? `${r.acoes_feitas} de ${r.acoes} ações concluídas` : 'sem plano de ação'}${r.proximo_acomp ? ' · volta em ' + dataBR(r.proximo_acomp).slice(0, 5) : ''}</span>${r.acompanha_nome ? `<span class="mini" title="${esc(r.acompanha_nome)}">${iniciais(r.acompanha_nome)}</span>` : ''}</span>
    </button>`).join('') || '<p class="fv">Nenhuma reunião registrada. Use "+ Reunião" logo depois de cada reunião: o plano de ação já cai no quadro de cada um.</p>';
}

// ===== editor =====
let atual = null, linhas = {};
const MODELOS = {
  assuntos: { campos: [['assunto', 'Assunto'], ['sintese', 'Síntese do que foi discutido'], ['status', 'Status', 'sel']], vazio: { assunto: '', sintese: '', status: 'andamento' } },
  plano: { campos: [['descricao', 'Tarefa ou entrega'], ['responsavel_id', 'Responsável', 'pes'], ['solicitante_id', 'Solicitante', 'pes'], ['prazo', 'Prazo', 'data']], vazio: { descricao: '', responsavel_id: '', solicitante_id: '', prazo: '' } },
  pendencias: { campos: [['item', 'Pendência'], ['falta', 'O que falta'], ['responsavel', 'Responsável', 'pes'], ['prazo', 'Prazo', 'data']], vazio: { item: '', falta: '', responsavel: '', prazo: '' } },
  riscos: { campos: [['risco', 'Risco ou impedimento'], ['impacto', 'Impacto'], ['acao', 'Ação preventiva'], ['responsavel', 'Responsável', 'pes']], vazio: { risco: '', impacto: '', acao: '', responsavel: '' } },
  proximo: { campos: [['descricao', 'Ação'], ['responsavel_id', 'Responsável', 'pes'], ['prazo', 'Prazo', 'data']], vazio: { descricao: '', responsavel_id: '', prazo: '' } }
};
function desenhaLinhas(lista) {
  const m = MODELOS[lista];
  document.querySelector(`[data-lista="${lista}"]`).innerHTML = linhas[lista].map((l, i) => `
    <div class="linha linha--${lista}" data-i="${i}">
      ${m.campos.map(([k, rot, tipo]) => tipo === 'pes' ? `<label class="cp-t">${rot}<select data-k="${k}">${opPessoas(l[k], '-')}</select></label>`
        : tipo === 'data' ? `<label class="cp-t">${rot}<input type="date" data-k="${k}" value="${esc(l[k] || '')}"></label>`
        : tipo === 'sel' ? `<label class="cp-t">${rot}<select data-k="${k}">${Object.entries(ST_ASS).map(([v, n]) => `<option value="${v}"${l[k] === v ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`
        : `<label class="cp-t">${rot}<input data-k="${k}" value="${esc(l[k] || '')}"></label>`).join('')}
      ${l.tarefa_status ? `<em class="st ${l.tarefa_status === 'enviado' ? 'st--lido' : 'st--env'} linha__st">tarefa: ${ST_TAREFA[l.tarefa_status]}</em>` : ''}
      <button type="button" class="linha__x" data-tira="${i}" aria-label="Tirar linha">×</button>
    </div>`).join('') || '<p class="fv">Nada ainda.</p>';
}
document.querySelector('.rn-form').addEventListener('input', e => {
  const k = e.target.dataset.k, row = e.target.closest('.linha'); if (!k || !row) return;
  linhas[row.parentElement.dataset.lista][+row.dataset.i][k] = e.target.value;
});
document.querySelector('.rn-form').addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) { const l = add.dataset.add; linhas[l].push({ ...MODELOS[l].vazio, ...(['plano'].includes(l) ? { solicitante_id: P.id } : {}) }); desenhaLinhas(l); document.querySelector(`[data-lista="${l}"] .linha:last-child input`)?.focus(); return; }
  const x = e.target.closest('[data-tira]');
  if (x) { const l = x.closest('[data-lista]').dataset.lista, i = +x.dataset.tira; if (linhas[l][i].id) (linhas._apagar ||= []).push(linhas[l][i].id); linhas[l].splice(i, 1); desenhaLinhas(l); }
});

const local = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
async function abre(id) {
  atual = id ? reunioes.find(r => r.id === id) : null;
  history.replaceState(null, '', id ? '#' + id : location.pathname);
  $('r-titulo-h').textContent = atual ? atual.titulo : 'Nova reunião';
  $('r-titulo').value = atual?.titulo || ''; $('r-quando').value = local(atual?.quando || new Date());
  $('r-part').value = atual?.participantes || ''; $('r-acomp').value = atual?.acompanha_id || P.id;
  $('r-empresa').value = atual?.empresa_id || ''; $('r-status').value = atual?.status || 'andamento';
  ['objetivo', 'definido', 'feito', 'informes'].forEach(k => { $('r-' + k).value = atual?.[k] || ''; });
  $('r-prox').value = atual?.proximo_acomp || ''; $('r-result').value = atual?.resultado_esperado || '';
  linhas = { assuntos: structuredClone(atual?.assuntos || []), pendencias: structuredClone(atual?.pendencias || []), riscos: structuredClone(atual?.riscos || []), plano: [], proximo: [] };
  $('r-reservado').value = '';
  const podeReserv = chefe || !atual || atual.criado_por === P.id;
  $('h-reserv').hidden = $('r-reservado').hidden = !podeReserv;
  if (atual) {
    const [{ data: acs }, { data: res }] = await Promise.all([
      banco.from('reuniao_acao').select('*,tarefa:tarefa(status)').eq('reuniao_id', atual.id).order('ordem'),
      podeReserv ? banco.from('reuniao_reservado').select('texto').eq('reuniao_id', atual.id).maybeSingle() : Promise.resolve({ data: null })
    ]);
    (acs || []).forEach(a => linhas[a.tipo].push({ id: a.id, descricao: a.descricao, responsavel_id: a.responsavel_id || '', solicitante_id: a.solicitante_id || '', prazo: a.prazo || '', tarefa_status: a.tarefa?.status }));
    $('r-reservado').value = res?.texto || '';
  }
  if (!atual && !linhas.plano.length) linhas.plano.push({ ...MODELOS.plano.vazio, solicitante_id: P.id });
  Object.keys(MODELOS).forEach(desenhaLinhas);
  $('r-pdf').hidden = !atual; if (atual) $('r-pdf').href = '?imprimir=' + atual.id;
  $('gaveta').hidden = false; $('r-titulo').focus();
}
$('nova').onclick = () => abre(null);
$('lista').addEventListener('click', e => { const c = e.target.closest('.rn-card'); if (c) abre(c.dataset.id); });
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', fecha));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden) fecha(); });
function fecha() { $('gaveta').hidden = true; atual = null; history.replaceState(null, '', location.pathname); carrega(); }

const limpa = (arr, chave) => arr.filter(l => String(l[chave] || '').trim()).map(({ tarefa_status, id, ...l }) => Object.fromEntries(Object.entries(l).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])));
$('f-r').addEventListener('submit', async e => {
  e.preventDefault();
  $('r-salva').disabled = true;
  try {
    const campos = {
      titulo: $('r-titulo').value.trim(), quando: new Date($('r-quando').value).toISOString(), participantes: $('r-part').value.trim() || null,
      acompanha_id: $('r-acomp').value || null, empresa_id: $('r-empresa').value || null, status: $('r-status').value,
      objetivo: $('r-objetivo').value.trim() || null, definido: $('r-definido').value.trim() || null, feito: $('r-feito').value.trim() || null,
      informes: $('r-informes').value.trim() || null, proximo_acomp: $('r-prox').value || null, resultado_esperado: $('r-result').value.trim() || null,
      assuntos: limpa(linhas.assuntos, 'assunto'), pendencias: limpa(linhas.pendencias, 'item'), riscos: limpa(linhas.riscos, 'risco')
    };
    let id = atual?.id;
    if (id) { const { error } = await banco.from('reuniao').update(campos).eq('id', id); if (error) throw error; }
    else { const { data, error } = await banco.from('reuniao').insert(campos).select('id').single(); if (error) throw error; id = data.id; }
    // ações: atualiza as que existem, cria as novas (o banco gera a tarefa de quem tem responsável)
    if (linhas._apagar?.length) await banco.from('reuniao_acao').delete().in('id', linhas._apagar);
    let novas = 0;
    for (const tipo of ['plano', 'proximo']) for (const [i, l] of linhas[tipo].entries()) {
      if (!String(l.descricao || '').trim()) continue;
      const linha = { reuniao_id: id, tipo, ordem: i, descricao: l.descricao.trim(), responsavel_id: l.responsavel_id || null, solicitante_id: l.solicitante_id || null, prazo: l.prazo || null };
      if (l.id) await banco.from('reuniao_acao').update(linha).eq('id', l.id);
      else { const { error } = await banco.from('reuniao_acao').insert(linha); if (error) throw error; if (linha.responsavel_id) novas++; }
    }
    const reserv = $('r-reservado').value.trim();
    if (!$('r-reservado').hidden && (reserv || atual)) await banco.from('reuniao_reservado').upsert({ reuniao_id: id, texto: reserv || null });
    await carrega();
    avisa(novas ? `Salvo. ${novas} tarefa${novas > 1 ? 's' : ''} nova${novas > 1 ? 's' : ''} no quadro de quem vai fazer.` : 'Salvo.');
    await abre(id);
  } catch (er) { avisa('Não deu para salvar: ' + (er.message || er)); }
  $('r-salva').disabled = false;
});

// ===== PDF: o resumo inteiro numa página com a cara da Coleve (o reservado nunca entra) =====
async function mostraDoc(id) {
  const [{ data: r }, { data: acs }] = await Promise.all([
    banco.from('v_reuniao').select('*').eq('id', id).single(),
    banco.from('reuniao_acao').select('*,tarefa:tarefa(status)').eq('reuniao_id', id).order('ordem')
  ]);
  document.title = 'Resumo de reunião · ' + (r?.titulo || '');
  document.querySelector('.barra').hidden = true; document.querySelector('main').hidden = true; document.body.classList.add('modo-doc');
  if (!r) { $('doc').hidden = false; $('doc').innerHTML = '<p>Reunião não encontrada.</p>'; return; }
  const nome = id => esc(pessoas.get(id) || '-');
  const lista = t => (t || '').split('\n').map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  const ul = t => lista(t).length ? `<ul>${lista(t).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="vz">-</p>';
  const tab = (cab, linhas) => linhas.length ? `<table><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr>${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>` : '<p class="vz">-</p>';
  const stp = (s, cls) => `<span class="pill pill--${cls}">${s}</span>`;
  const sec = (n, t, html) => `<section><h3><span>${n}</span>${t}</h3>${html}</section>`;
  const plano = (acs || []).filter(a => a.tipo === 'plano'), prox = (acs || []).filter(a => a.tipo === 'proximo');
  const stT = a => a.tarefa ? stp(ST_TAREFA[a.tarefa.status], a.tarefa.status === 'enviado' ? 'ok' : a.tarefa.status === 'a_fazer' ? 'novo' : 'and') : stp('Sem responsável', 'novo');
  $('doc').hidden = false;
  $('doc').innerHTML = `
    <div class="doc__barra"><button type="button" class="btn-a" onclick="print()">Salvar PDF</button></div>
    <header class="doc__topo"><img src="../../../img/logo_contabilidade.svg" alt="Coleve contabilidade"><address>Travessa Dona Paula, 13 · Higienópolis, São Paulo<br>www.coleve.com.br</address></header>
    <div class="doc__tit"><h1>Resumo Executivo de Reunião</h1><p>COLEVE CONTABILIDADE</p></div>
    <div class="doc__info"><div><small>Data da reunião</small><b>${quandoBR(r.quando)}</b></div><div><small>Participantes</small><b>${esc(r.participantes || '-')}</b></div><div><small>Projeto / área</small><b>${esc(r.titulo)}${r.empresa_nome ? ' · ' + esc(r.empresa_nome) : ''}</b></div><div><small>Acompanhamento</small><b>${esc(r.acompanha_nome || '-')}</b></div><div><small>Status geral</small>${stp(STATUS[r.status], { concluido: 'ok', atencao: 'pend', a_fazer: 'novo' }[r.status] || 'and')}</div></div>
    ${sec(1, 'Objetivo da reunião', `<p>${esc(r.objetivo || '-')}</p>`)}
    ${sec(2, 'Assuntos tratados', tab(['Assunto', 'Síntese / contexto', 'Status'], (r.assuntos || []).map(a => [esc(a.assunto), esc(a.sintese), stp(ST_ASS[a.status] || a.status, { concluido: 'ok', pendente: 'pend' }[a.status] || 'and')])))}
    ${sec(3, 'O que foi definido', ul(r.definido))}
    ${sec(4, 'Plano de ação · tarefas delegadas', tab(['Tarefa / entrega', 'Responsável', 'Solicitante', 'Prazo', 'Status'], plano.map(a => [esc(a.descricao), nome(a.responsavel_id), nome(a.solicitante_id), dataBR(a.prazo) || '-', stT(a)])))}
    <div class="doc__2">${sec(5, 'O que já foi feito', ul(r.feito))}${sec(6, 'Pendências e assuntos em aberto', tab(['Pendência', 'O que falta', 'Responsável', 'Prazo'], (r.pendencias || []).map(p => [esc(p.item), esc(p.falta), nome(p.responsavel), dataBR(p.prazo) || '-'])))}</div>
    <div class="doc__2">${sec(7, 'Pontos de atenção e riscos', tab(['Risco', 'Impacto', 'Ação preventiva', 'Responsável'], (r.riscos || []).map(x => [esc(x.risco), esc(x.impacto), esc(x.acao), nome(x.responsavel)])))}${sec(8, 'Informes compartilhados', ul(r.informes))}</div>
    ${sec(9, 'Próximos passos', tab(['Ordem', 'Ação', 'Responsável', 'Prazo'], prox.map((a, i) => [i + 1, esc(a.descricao), nome(a.responsavel_id), dataBR(a.prazo) || '-'])))}
    <footer class="doc__pe"><div><small>Próximo acompanhamento</small><b>${dataBR(r.proximo_acomp) || '-'}</b></div><div><small>Resultado esperado</small><b>${esc(r.resultado_esperado || '-')}</b></div></footer>`;
}

await carrega();
const alvo = location.hash.slice(1);
if (alvo && reunioes.some(r => r.id === alvo)) await abre(alvo);
document.body.classList.remove('carregando');
