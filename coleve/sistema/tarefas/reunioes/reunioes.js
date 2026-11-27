// Sistema Coleve · resumo executivo de reunião (modelo do Manu, 28/10/2026)
// O plano de ação e os próximos passos viram tarefas (gatilho no banco); ?imprimir=<id> mostra a versão de PDF.
import { banco, quemSou } from '../../conexao.js?v=2';
import { docHTML, montarResumoIA } from './reuniao-doc.js?v=1';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../../entrar/'); throw 0; }
const P = eu.pessoa;
const chefe = ['admin', 'gestor'].includes(P.papel);
if (P.area === 'marketing' && !chefe) document.querySelectorAll('.barra__nav a[href$="clientes/"], .barra__nav a[href$="propostas/"]').forEach(a => a.remove());

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? d.slice(0, 10).split('-').reverse().join('/') : '';
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
$('r-prox-resp').innerHTML = opPessoas('', 'A definir');
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
      ${r.publicada_cliente ? `<span class="rn-pubtag">Publicada para o cliente${r.enviar_resumo ? (r.resumo_enviado_em ? ' · resumo enviado' : ' · envio na fila') : ''}</span>` : ''}
      <span class="rn-barra" aria-hidden="true"><i style="width:${r.acoes ? Math.round(r.acoes_feitas / r.acoes * 100) : 0}%"></i></span>
      <span class="rn-card__pe"><span>${r.acoes ? `${r.acoes_feitas} de ${r.acoes} ações concluídas` : 'sem plano de ação'}${r.pendencias_n ? ` · ${r.pendencias_n} pendência${r.pendencias_n > 1 ? 's' : ''}` : ''}${r.proximo_acomp ? ' · volta em ' + dataBR(r.proximo_acomp).slice(0, 5) : ''}</span>${r.acompanha_nome ? `<span class="mini" title="${esc(r.acompanha_nome)}">${iniciais(r.acompanha_nome)}</span>` : ''}</span>
    </button>`).join('') || '<p class="fv">Nenhuma reunião registrada. Use "+ Reunião" logo depois de cada reunião: o plano de ação já cai no quadro de cada um.</p>';
}

// ===== editor =====
let atual = null, linhas = {};
const MODELOS = {
  assuntos: { campos: [['assunto', 'Assunto'], ['sintese', 'Síntese do que foi discutido'], ['status', 'Status', 'sel']], vazio: { assunto: '', sintese: '', status: 'andamento' } },
  plano: { campos: [['descricao', 'Tarefa ou entrega'], ['responsavel_id', 'Responsável', 'pes'], ['solicitante_id', 'Solicitante', 'pes'], ['prazo', 'Prazo', 'data']], vazio: { descricao: '', responsavel_id: '', solicitante_id: '', prazo: '' } },
  pendencia: { campos: [['descricao', 'Pendência'], ['falta', 'O que falta'], ['responsavel_id', 'Responsável', 'pes'], ['prazo', 'Prazo', 'data']], vazio: { descricao: '', falta: '', responsavel_id: '', prazo: '' } },
  riscos: { campos: [['risco', 'Risco ou impedimento'], ['impacto', 'Impacto'], ['acao', 'Ação preventiva'], ['responsavel', 'Responsável', 'pes']], vazio: { risco: '', impacto: '', acao: '', responsavel: '' } },
  proximo: { campos: [['descricao', 'Ação'], ['responsavel_id', 'Responsável', 'pes'], ['prazo', 'Prazo', 'data'], ['gatilho', 'ou Gatilho (quando...)']], vazio: { descricao: '', responsavel_id: '', prazo: '', gatilho: '' } }
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
  linhas = { assuntos: structuredClone(atual?.assuntos || []), riscos: structuredClone(atual?.riscos || []), plano: [], proximo: [], pendencia: [] };
  $('r-transcricao').value = atual?.transcricao || ''; $('rn-ia').open = !!atual?.transcricao; $('r-ia-saida').hidden = true;
  $('r-prox-resp').value = atual?.proximo_acomp_resp_id || '';
  $('r-publica').checked = !!atual?.publicada_cliente; $('r-envia').checked = !!atual?.enviar_resumo;
  regraPublica();
  $('r-reservado').value = '';
  const podeReserv = chefe || !atual || atual.criado_por === P.id;
  $('h-reserv').hidden = $('r-reservado').hidden = !podeReserv;
  if (atual) {
    const [{ data: acs }, { data: res }] = await Promise.all([
      banco.from('reuniao_acao').select('*,tarefa:tarefa(status)').eq('reuniao_id', atual.id).order('ordem'),
      podeReserv ? banco.from('reuniao_reservado').select('texto').eq('reuniao_id', atual.id).maybeSingle() : Promise.resolve({ data: null })
    ]);
    (acs || []).forEach(a => linhas[a.tipo].push({ id: a.id, descricao: a.descricao, responsavel_id: a.responsavel_id || '', solicitante_id: a.solicitante_id || '', prazo: a.prazo || '', gatilho: a.gatilho || '', falta: a.falta || '', tarefa_status: a.tarefa?.status }));
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
      assuntos: limpa(linhas.assuntos, 'assunto'), riscos: limpa(linhas.riscos, 'risco'),
      transcricao: $('r-transcricao').value.trim() || null, proximo_acomp_resp_id: $('r-prox-resp').value || null,
      publicada_cliente: !!$('r-empresa').value && $('r-publica').checked,
      enviar_resumo: !!$('r-empresa').value && $('r-publica').checked && $('r-envia').checked
    };
    const semQuando = linhas.proximo.find(l => String(l.descricao || '').trim() && !l.prazo && !String(l.gatilho || '').trim());
    if (semQuando) throw new Error(`o próximo passo "${semQuando.descricao.trim()}" precisa de prazo ou gatilho`);
    let id = atual?.id;
    if (id) { const { error } = await banco.from('reuniao').update(campos).eq('id', id); if (error) throw error; }
    else { const { data, error } = await banco.from('reuniao').insert(campos).select('id').single(); if (error) throw error; id = data.id; }
    // ações: atualiza as que existem, cria as novas (o banco gera a tarefa de quem tem responsável)
    if (linhas._apagar?.length) await banco.from('reuniao_acao').delete().in('id', linhas._apagar);
    let novas = 0;
    for (const tipo of ['plano', 'proximo', 'pendencia']) for (const [i, l] of linhas[tipo].entries()) {
      if (!String(l.descricao || '').trim()) continue;
      const linha = { reuniao_id: id, tipo, ordem: i, descricao: l.descricao.trim(), responsavel_id: l.responsavel_id || null, solicitante_id: l.solicitante_id || null, prazo: l.prazo || null,
        gatilho: String(l.gatilho || '').trim() || null, falta: String(l.falta || '').trim() || null };
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

// ===== PDF: o resumo inteiro numa página com a cara da Coleve (o reservado e a transcrição nunca entram) =====
async function mostraDoc(id) {
  const [{ data: r }, { data: acs }] = await Promise.all([
    banco.from('v_reuniao').select('*').eq('id', id).single(),
    banco.from('reuniao_acao').select('*,tarefa:tarefa(status)').eq('reuniao_id', id).order('ordem')
  ]);
  document.title = 'Resumo de reunião · ' + (r?.titulo || '');
  document.querySelector('.barra').hidden = true; document.querySelector('main').hidden = true; document.body.classList.add('modo-doc');
  $('doc').hidden = false;
  if (!r) { $('doc').innerHTML = '<p>Reunião não encontrada.</p>'; return; }
  const nome = id => pessoas.get(id) || '';
  $('doc').innerHTML = docHTML({
    ...r, proximo_resp_nome: r.proximo_resp_nome,
    riscos: (r.riscos || []).map(x => ({ ...x, responsavel_nome: nome(x.responsavel) })),
    acoes: (acs || []).map(a => ({ ...a, responsavel_nome: nome(a.responsavel_id), solicitante_nome: nome(a.solicitante_id), status: a.tarefa?.status }))
  });
}

// ===== publicar: só reunião com cliente; envio só do que está publicado =====
function regraPublica() {
  const temEmp = !!$('r-empresa').value;
  $('r-publica').disabled = !temEmp;
  if (!temEmp) $('r-publica').checked = false;
  $('r-envia').disabled = !$('r-publica').checked;
  if (!$('r-publica').checked) $('r-envia').checked = false;
  $('r-publica-dica').textContent = temEmp ? 'O cliente vê este resumo e baixa o PDF na Área do cliente. O reservado e a transcrição nunca aparecem.' : 'Escolha o cliente acima para poder publicar.';
  $('r-envia-dica').textContent = atual?.resumo_enviado_em ? 'Resumo enviado em ' + new Date(atual.resumo_enviado_em).toLocaleString('pt-BR') + '.' : atual?.enviar_resumo ? 'Na fila de envios.' : 'Fica na fila de envios (WhatsApp ou e-mail dos contatos da empresa).';
}
['r-empresa', 'r-publica'].forEach(id => $(id).addEventListener('change', regraPublica));

// ===== "Montar resumo pela IA": monta o texto pronto para colar (sem IA ligada ao sistema ainda; ver reuniao-doc.js) =====
$('r-ia').onclick = async () => {
  const transcricao = $('r-transcricao').value.trim();
  if (!transcricao) { $('r-ia-dica').textContent = 'Cole a transcrição ou as anotações primeiro.'; return; }
  const txt = montarResumoIA({ transcricao, titulo: $('r-titulo').value.trim(), participantes: $('r-part').value.trim(), equipe: (equipe || []).map(p => p.nome) });
  $('r-ia-prompt').value = txt; $('r-ia-saida').hidden = false; $('r-ia-dica').textContent = '';
  try { await navigator.clipboard.writeText(txt); avisa('Texto copiado. Cole na IA e traga a resposta.'); } catch { $('r-ia-prompt').select(); }
};
$('r-ia-preenche').onclick = () => {
  let j;
  try { const t = $('r-ia-resp').value; j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch { return avisa('Não reconheci a resposta. Cole só o JSON que a IA devolveu.'); }
  const pid = n => { if (!n) return ''; const a = String(n).toLowerCase().trim(); const p = (equipe || []).find(x => x.nome.toLowerCase() === a) || (equipe || []).find(x => x.nome.toLowerCase().startsWith(a.split(' ')[0])); return p?.id || ''; };
  const data = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '';
  const set = (id, v) => { if (v && !$(id).value.trim()) $(id).value = Array.isArray(v) ? v.join('\n') : v; };
  set('r-objetivo', j.objetivo); set('r-definido', j.definido); set('r-feito', j.feito); set('r-informes', j.informes); set('r-result', j.resultado_esperado);
  if (data(j.proximo_acomp) && !$('r-prox').value) $('r-prox').value = j.proximo_acomp;
  (j.assuntos || []).forEach(a => linhas.assuntos.push({ assunto: a.assunto || '', sintese: a.sintese || '', status: ['andamento', 'concluido', 'pendente'].includes(a.status) ? a.status : 'andamento' }));
  linhas.plano = linhas.plano.filter(l => String(l.descricao || '').trim() || l.id);
  (j.plano || []).forEach(a => linhas.plano.push({ descricao: a.descricao || '', responsavel_id: pid(a.responsavel), solicitante_id: P.id, prazo: data(a.prazo) }));
  (j.pendencias || []).forEach(a => linhas.pendencia.push({ descricao: a.descricao || a.item || '', falta: a.falta || '', responsavel_id: pid(a.responsavel), prazo: data(a.prazo) }));
  (j.riscos || []).forEach(a => linhas.riscos.push({ risco: a.risco || '', impacto: a.impacto || '', acao: a.acao || '', responsavel: pid(a.responsavel) }));
  (j.proximos || []).forEach(a => linhas.proximo.push({ descricao: a.descricao || '', responsavel_id: pid(a.responsavel), prazo: data(a.prazo), gatilho: data(a.prazo) ? '' : (a.gatilho || '') }));
  Object.keys(MODELOS).forEach(desenhaLinhas);
  avisa('Resumo preenchido. Confira responsáveis e prazos antes de salvar.');
};

await carrega();
const alvo = location.hash.slice(1);
if (alvo && reunioes.some(r => r.id === alvo)) await abre(alvo);
document.body.classList.remove('carregando');
