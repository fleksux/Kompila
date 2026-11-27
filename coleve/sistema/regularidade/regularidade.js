// Sistema Coleve · Central de Regularidade Fiscal, operação interna (27/11/2026)
// Fase 1 da especificação do Manu (09/11): consulta manual registrada com evidência, validação contábil antes
// de publicar ao cliente, pendência vira tarefa no Fiscal (gatilho no banco), fila de trabalho e filtros.
// Banco: migração 0038_regularidade.sql (coleve-sistema).
import { banco, quemSou } from '../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace(eu?.pessoa ? 'cliente.html' : '../../entrar/'); throw 0; }
const P = eu.pessoa;
const VE_CLIENTES = ['admin', 'gestor'].includes(P.papel) || P.area !== 'marketing';
const PODE_VALIDAR = ['admin', 'gestor'].includes(P.papel) || ['fiscal', 'contabil'].includes(P.area);   // mesma regra de pode_validar_fiscal()

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const reais = v => v == null || v === '' ? '-' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '';
const quando = d => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
const mesAno = d => d ? String(d).slice(5, 7) + '/' + String(d).slice(0, 4) : '';
let avisoT; const avisa = t => { $('aviso').textContent = t; clearTimeout(avisoT); avisoT = setTimeout(() => { $('aviso').textContent = ''; }, 4500); };
const ICO_ARQ = '<svg viewBox="0 0 16 16"><path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2z M9 2v4h4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

// ===== rótulos (cor só em status) =====
const SIT = {
  regular: ['Regular', 'ok'], irregular: ['Irregular', 'erro'], pendencia: ['Pendência', 'pend'],
  sem_informacao: ['Sem informação', 'cinza'], indisponivel: ['Consulta indisponível', 'cinza'], nao_consultado: ['Não consultado', 'cinza'],
  desatualizada: ['Consulta desatualizada', 'cinza'], nao_aplica: ['Não se aplica', 'cinza'],
  vencida: ['Vencida', 'erro'], vence_15: ['Vence em até 15 dias', 'pend'], valida: ['Válida', 'ok']
};
const selo = (k, txt) => { const [n, c] = SIT[k] || [k || '-', 'cinza']; return `<span class="rg-selo rg-selo--${c}">${esc(txt || n)}</span>`; };
const STATUS = [['identificada', 'Pendência identificada'], ['aguardando_analise', 'Aguardando análise contábil'], ['em_analise', 'Em análise'],
  ['cliente_comunicado', 'Cliente comunicado'], ['aguardando_cliente', 'Aguardando documentação ou pagamento'], ['em_regularizacao', 'Em processo de regularização'],
  ['regularizado', 'Regularizado'], ['arquivado', 'Concluído e arquivado']];
const NOME_ST = Object.fromEntries(STATUS);
const seloSt = s => `<span class="rg-selo rg-selo--${s === 'regularizado' ? 'ok' : s === 'arquivado' ? 'cinza' : 'pend'}">${esc(NOME_ST[s] || s)}</span>`;
const SITDEB = { exigivel: ['Exigível', 'erro'], inscrito: ['Dívida ativa', 'erro'], parcelado: ['Parcelado', 'pend'], suspenso: ['Suspenso', 'cinza'] };
const seloDeb = s => s ? `<span class="rg-selo rg-selo--${SITDEB[s][1]}">${SITDEB[s][0]}</span>` : '<span class="rg-selo rg-selo--cinza">Sem valor</span>';
const CERT = { negativa: 'Negativa (CND)', positiva_efeito_negativa: 'Positiva com efeito de negativa', positiva: 'Positiva' };
const seloCert = s => `<span class="rg-selo rg-selo--${s === 'negativa' ? 'ok' : s === 'positiva' ? 'erro' : 'pend'}">${CERT[s]}</span>`;
const RES = { regular: 'Regular', irregular: 'Irregular', sem_informacao: 'Sem informação', indisponivel: 'Consulta indisponível', nao_aplica: 'Não se aplica' };
const TIPO_P = { debito: 'Débito', obrigacao: 'Obrigação acessória', cadastral: 'Pendência cadastral', outro: 'Outro' };
const AUT = { procuracao_ecac: 'Procuração e-CAC', procuracao_sefaz: 'Procuração SEFAZ', procuracao_prefeitura: 'Procuração Prefeitura', certificado_a1: 'Certificado A1', certificado_a3: 'Certificado A3', autorizacao_cliente: 'Autorização do cliente', outro: 'Outro' };
const URG = { 1: 'Alta', 2: 'Média', 3: 'Baixa' };
const ITEM = { pendencia: 'Pendência', validar: 'Validar', certidao: 'Certidão', consultar: 'Consultar' };

// ===== barra =====
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Acesso total' : (P.papel === 'gestor' ? 'Gestão' : 'Equipe');
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

if (!VE_CLIENTES) {
  $('corpo').innerHTML = '<p class="rg-nada">A Central de Regularidade mostra dados de clientes. Seu acesso (marketing) não inclui esses dados.</p>';
  ['kpis', 'filtros', 'nova-c'].forEach(id => { $(id).hidden = true; });
  document.body.classList.remove('carregando');
  throw 0;
}

// ===== cadastros =====
const [{ data: pes }, { data: es }, { data: ors }] = await Promise.all([
  banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia,cnpj,uf,municipio,regime,teste').eq('ativo', true).order('razao_social'),
  banco.from('orgao').select('*').eq('ativo', true).order('ordem')
]);
const equipe = pes || [], emps = es || [], orgaos = ors || [];
const nomeEmp = id => { const e = emps.find(x => x.id === id); return e ? (e.nome_fantasia || e.razao_social) : ''; };
const orgao = id => orgaos.find(o => o.id === id) || { sigla: id, nome: id };
$('f-resp').insertAdjacentHTML('beforeend', equipe.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join(''));
$('f-orgao').insertAdjacentHTML('beforeend', orgaos.map(o => `<option value="${o.id}">${esc(o.sigla)}</option>`).join(''));
$('f-status').insertAdjacentHTML('beforeend', STATUS.map(([k, n]) => `<option value="${k}">${n}</option>`).join(''));
const locais = [...new Set(emps.map(e => [e.municipio, e.uf].filter(Boolean).join('/')).filter(Boolean))].sort();
$('f-local').insertAdjacentHTML('beforeend', locais.map(l => `<option>${esc(l)}</option>`).join(''));
$('c-emp').innerHTML = '<option value="">Escolha a empresa</option>' + emps.map(e => `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}${e.cnpj ? ' · ' + esc(e.cnpj) : ''}</option>`).join('');
$('c-orgao').innerHTML = '<option value="">Escolha o órgão</option>' + orgaos.map(o => `<option value="${o.id}">${esc(o.nome)}</option>`).join('');

// ===== visões =====
const VISOES = [
  ['fila', 'Fila de trabalho', '<svg viewBox="0 0 16 16"><path d="M5 4h8M5 8h8M5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>'],
  ['empresas', 'Empresas monitoradas', '<svg viewBox="0 0 16 16"><rect x="3" y="2.5" width="10" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 6h4M6 9h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'],
  ['certidoes', 'Certidões', '<svg viewBox="0 0 16 16"><path d="M4 2.5h8v11l-4-2.5-4 2.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'],
  ['conectores', 'Conectores', '<svg viewBox="0 0 16 16"><path d="M6 3v3M10 3v3M4.5 6h7v2a3.5 3.5 0 0 1-7 0zM8 11.5V14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>']
];
const guarda = (k, v) => { try { localStorage.setItem('coleve_rg_' + k, JSON.stringify(v)); } catch {} };
const lembra = (k, d) => { try { return JSON.parse(localStorage.getItem('coleve_rg_' + k)) ?? d; } catch { return d; } };
let vista = lembra('vista', 'fila');
if (!VISOES.some(v => v[0] === vista)) vista = 'fila';
$('vista-cel').innerHTML = VISOES.map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
$('vista-cel').onchange = () => troca($('vista-cel').value);
function troca(v) { vista = v; guarda('vista', v); desenha(); }

// ===== dados =====
let fila = [], painel = [], orgEmp = [], certs = [], conectores = [];
async function carrega() {
  const [f, p, o, c, k] = await Promise.all([
    banco.from('v_regularidade_fila').select('*'),
    banco.from('v_regularidade_empresa').select('*').order('empresa_nome'),
    banco.from('v_regularidade_orgao').select('empresa_id,orgao_id,situacao,ordem'),
    banco.from('v_certidao').select('*').eq('vigente', true).order('valida_ate'),
    banco.from('conector').select('*').order('orgao_id')
  ]);
  const erro = [f, p, o, c, k].find(r => r.error);
  if (erro) { avisa('Não deu para carregar: ' + erro.error.message); }
  fila = f.data || []; painel = p.data || []; orgEmp = o.data || []; certs = c.data || []; conectores = k.data || [];
  desenha();
}

// ===== filtros =====
['f-busca', 'f-resp', 'f-orgao', 'f-regime', 'f-local', 'f-status', 'f-urg', 'f-valor', 'f-data'].forEach(id => $(id).addEventListener('input', desenha));
const semAcento = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function passa(x) {
  const b = semAcento($('f-busca').value).trim(), dig = $('f-busca').value.replace(/\D/g, '');
  if (b && !semAcento(x.empresa_nome).includes(b) && !(dig && String(x.cnpj || '').replace(/\D/g, '').includes(dig))) return false;
  const r = $('f-resp').value; const resp = x.responsavel_id ?? x.responsavel_fiscal_id ?? null;
  if (r === '-' ? resp : r && resp !== r) return false;
  if ($('f-orgao').value && x.orgao_id !== undefined && x.orgao_id !== $('f-orgao').value) return false;
  if ($('f-regime').value && x.regime !== $('f-regime').value) return false;
  if ($('f-local').value && [x.municipio, x.uf].filter(Boolean).join('/') !== $('f-local').value) return false;
  if ($('f-status').value && x.status !== undefined && x.status !== $('f-status').value) return false;
  if ($('f-urg').value && x.urgencia !== undefined && String(x.urgencia) !== $('f-urg').value) return false;
  const v = Number($('f-valor').value); const val = x.valor ?? x.total_em_aberto;
  if (v && !(Number(val) >= v)) return false;
  const d = $('f-data').value; const ult = x.ultima_consulta;
  if (d && ult && String(ult).slice(0, 10) >= d) return false;
  return true;
}

// ===== desenho =====
function kpis() {
  const consultasPend = painel.reduce((s, e) => s + e.consultas_a_validar, 0) + fila.filter(f => f.item === 'consultar').length;
  const k = [
    ['empresas', 'Empresas monitoradas', painel.length, ''],
    ['empresas', 'Com irregularidades', painel.filter(e => e.situacao_geral === 'irregular').length, 'erro'],
    ['fila', 'Consultas pendentes', consultasPend, 'pend'],
    ['fila', 'Em regularização', painel.reduce((s, e) => s + e.em_regularizacao, 0), '']
  ];
  $('kpis').innerHTML = k.map(([v, n, q, c], i) => `<button type="button" class="rg-kpi${c ? ' rg-kpi--' + c : ''}" data-v="${v}" data-i="${i}"><small>${n}</small><b>${q}</b></button>`).join('');
}
$('kpis').addEventListener('click', e => {
  const b = e.target.closest('.rg-kpi'); if (!b) return;
  troca(b.dataset.v);
});

function desenha() {
  $('visoes').innerHTML = VISOES.map(([k, n, ico]) => {
    const q = k === 'fila' ? fila.length : k === 'empresas' ? painel.length : k === 'certidoes' ? certs.filter(c => c.validade !== 'valida').length : conectores.length;
    return `<li><button type="button" data-v="${k}" class="${k === vista ? 'is-on' : ''}">${ico}${n}<b>${q || ''}</b></button></li>`;
  }).join('');
  $('vista-cel').value = vista;
  $('t-nome').textContent = VISOES.find(v => v[0] === vista)[1];
  kpis();
  ({ fila: desenhaFila, empresas: desenhaEmpresas, certidoes: desenhaCertidoes, conectores: desenhaConectores })[vista]();
}
$('visoes').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b) troca(b.dataset.v); });

const celEmp = x => `<td class="rg-emp"><b>${esc(x.empresa_nome)}${x.empresa_teste ? '<span class="rg-teste">teste</span>' : ''}</b><small>${esc(x.cnpj || 'sem CNPJ')}${x.municipio ? ' · ' + esc(x.municipio) + '/' + esc(x.uf || '') : ''}</small></td>`;
const celResp = id => { const n = equipe.find(p => p.id === id)?.nome; return n ? `<span class="ui-mini" title="${esc(n)}">${iniciais(n)}</span>` : '<span class="ui-mini ui-mini--vazio" title="Sem responsável">?</span>'; };

function desenhaFila() {
  const l = fila.filter(passa).sort((a, b) => a.urgencia - b.urgencia || (Number(b.valor) || 0) - (Number(a.valor) || 0));
  $('total').textContent = `· ${l.length}`;
  if (!l.length) { $('corpo').innerHTML = '<p class="rg-nada">Nada na fila com esses filtros.</p>'; return; }
  $('corpo').innerHTML = `<table class="rg-tab"><colgroup><col style="width:22px"><col style="width:26%"><col><col class="so-largo" style="width:150px"><col style="width:110px"><col class="so-largo" style="width:60px"><col class="so-largo" style="width:96px"></colgroup>
    <thead><tr><th></th><th>Empresa</th><th>Situação</th><th class="so-largo">Etapa</th><th class="n">Valor</th><th class="so-largo">Resp.</th><th class="so-largo">Últ. consulta</th></tr></thead><tbody>
    ${l.map(x => `<tr class="rg-lin" tabindex="0" data-emp="${x.empresa_id}" data-ref="${x.ref_id || ''}">
      <td><span class="rg-urg rg-urg--${x.urgencia}" title="Urgência ${URG[x.urgencia]}"></span></td>
      ${celEmp(x)}
      <td class="rg-flex"><b style="font-weight:500">${esc(ITEM[x.item])} · ${esc(x.orgao_sigla)}</b> <span class="rg-muted">${esc(x.descricao)}</span></td>
      <td class="so-largo">${x.item === 'pendencia' ? seloSt(x.status) : x.item === 'validar' ? '<span class="rg-selo rg-selo--val">Aguardando validação</span>' : x.item === 'certidao' ? selo(x.situacao) : selo(x.situacao)}</td>
      <td class="n">${x.valor != null ? reais(x.valor) : '<span class="rg-muted">-</span>'}</td>
      <td class="so-largo">${celResp(x.responsavel_id)}</td>
      <td class="so-largo"><small>${x.ultima_consulta ? dataBR(x.ultima_consulta) : '-'}</small></td></tr>`).join('')}
    </tbody></table>`;
}

function desenhaEmpresas() {
  const l = painel.map(e => ({ ...e, responsavel_id: e.responsavel_fiscal_id })).filter(passa)
    .filter(e => !$('f-orgao').value || orgEmp.some(o => o.empresa_id === e.empresa_id && o.orgao_id === $('f-orgao').value && o.situacao !== 'regular'))
    .sort((a, b) => ({ irregular: 0, sem_informacao: 1, pendencia: 2, regular: 3 }[a.situacao_geral] - { irregular: 0, sem_informacao: 1, pendencia: 2, regular: 3 }[b.situacao_geral]) || a.indice - b.indice);
  $('total').textContent = `· ${l.length}`;
  if (!l.length) { $('corpo').innerHTML = '<p class="rg-nada">Nenhuma empresa com esses filtros.</p>'; return; }
  const cls = s => ({ regular: 'ok', irregular: 'erro', pendencia: 'pend' }[s] || '');
  $('corpo').innerHTML = `<table class="rg-tab"><colgroup><col style="width:30%"><col style="width:140px"><col class="so-largo" style="width:70px"><col style="width:120px"><col class="so-largo" style="width:80px"><col class="so-largo" style="width:90px"><col class="so-largo" style="width:96px"><col class="so-largo" style="width:60px"></colgroup>
    <thead><tr><th>Empresa</th><th>Situação geral</th><th class="so-largo n">Índice</th><th class="n">Em aberto</th><th class="so-largo n">Pendências</th><th class="so-largo">Órgãos</th><th class="so-largo">Últ. consulta</th><th class="so-largo">Resp.</th></tr></thead><tbody>
    ${l.map(e => `<tr class="rg-lin" tabindex="0" data-emp="${e.empresa_id}">
      ${celEmp(e)}
      <td>${selo(e.situacao_geral)}</td>
      <td class="so-largo n">${e.indice}</td>
      <td class="n">${reais(e.total_em_aberto)}</td>
      <td class="so-largo n">${e.pendencias}</td>
      <td class="so-largo"><span class="rg-orgs">${orgEmp.filter(o => o.empresa_id === e.empresa_id).sort((a, b) => a.ordem - b.ordem).map(o => `<i class="${cls(o.situacao)}" title="${esc(orgao(o.orgao_id).sigla)}: ${esc((SIT[o.situacao] || [o.situacao])[0])}"></i>`).join('')}</span></td>
      <td class="so-largo"><small>${e.ultima_consulta ? dataBR(e.ultima_consulta) : 'nunca'}</small></td>
      <td class="so-largo">${celResp(e.responsavel_fiscal_id)}</td></tr>`).join('')}
    </tbody></table>`;
}

function desenhaCertidoes() {
  const l = certs.map(c => ({ ...c, empresa_nome: nomeEmp(c.empresa_id), ...pick(emps.find(e => e.id === c.empresa_id)) })).filter(passa);
  $('total').textContent = `· ${l.length}`;
  if (!l.length) { $('corpo').innerHTML = '<p class="rg-nada">Nenhuma certidão lançada ainda. Ela entra junto com a consulta do órgão.</p>'; return; }
  $('corpo').innerHTML = `<table class="rg-tab"><colgroup><col style="width:28%"><col><col class="so-largo" style="width:200px"><col style="width:130px"><col class="so-largo" style="width:150px"></colgroup>
    <thead><tr><th>Empresa</th><th>Certidão</th><th class="so-largo">Situação</th><th>Validade</th><th class="so-largo">Publicada</th></tr></thead><tbody>
    ${l.map(c => `<tr class="rg-lin" tabindex="0" data-emp="${c.empresa_id}">${celEmp(c)}
      <td class="rg-flex">${esc(c.tipo)} <small>${esc(c.orgao_sigla)}</small></td>
      <td class="so-largo">${seloCert(c.situacao)}</td>
      <td>${selo(c.validade, dataBR(c.valida_ate))}</td>
      <td class="so-largo">${c.publicada ? '<small>sim</small>' : '<span class="rg-selo rg-selo--val">Aguardando validação</span>'}</td></tr>`).join('')}
    </tbody></table>`;
}
const pick = e => e ? { cnpj: e.cnpj, regime: e.regime, uf: e.uf, municipio: e.municipio, empresa_teste: e.teste } : {};

function desenhaConectores() {
  $('total').textContent = `· ${conectores.length}`;
  const ST = { ativo: ['Ativo', 'ok'], em_avaliacao: ['Em avaliação', 'cinza'], em_desenvolvimento: ['Em desenvolvimento', 'pend'], desligado: ['Desligado', 'cinza'], com_falha: ['Com falha', 'erro'] };
  const gestor = ['admin', 'gestor'].includes(P.papel);
  $('corpo').innerHTML = `<p class="rg-dica" style="margin-top:10px">Cada órgão tem um conector manual (a equipe consulta no portal) e um automático para a Fase 2. Antes de desenvolver cada automático: confirmar API oficial, contrato, autenticação e se o órgão permite automação.</p>
    <table class="rg-tab"><colgroup><col style="width:130px"><col style="width:26%"><col style="width:100px"><col style="width:160px"><col class="so-largo"></colgroup>
    <thead><tr><th>Órgão</th><th>Conector</th><th>Tipo</th><th>Status</th><th class="so-largo">Forma de acesso</th></tr></thead><tbody>
    ${conectores.sort((a, b) => orgao(a.orgao_id).ordem - orgao(b.orgao_id).ordem || a.tipo.localeCompare(b.tipo)).map(k => `<tr>
      <td>${esc(orgao(k.orgao_id).sigla)}</td><td class="rg-flex">${esc(k.nome)}</td><td>${k.tipo === 'manual' ? 'Manual' : 'Automático'}</td>
      <td>${gestor ? `<select class="ui-in" data-con="${k.id}" style="height:26px;font-size:12px">${Object.entries(ST).map(([v, [n]]) => `<option value="${v}"${v === k.status ? ' selected' : ''}>${n}</option>`).join('')}</select>` : `<span class="rg-selo rg-selo--${ST[k.status][1]}">${ST[k.status][0]}</span>`}</td>
      <td class="so-largo" title="${esc(k.observacao || '')}"><small>${esc(k.forma_acesso || '')}</small></td></tr>`).join('')}
    </tbody></table>`;
}
$('corpo').addEventListener('change', async e => {
  const s = e.target.closest('select[data-con]'); if (!s) return;
  const { error } = await banco.from('conector').update({ status: s.value }).eq('id', s.dataset.con);
  avisa(error ? 'Não deu para salvar: ' + error.message : 'Status do conector salvo.');
  if (!error) conectores.find(k => k.id === s.dataset.con).status = s.value;
});
$('corpo').addEventListener('click', e => { const tr = e.target.closest('tr[data-emp]'); if (tr) abre(tr.dataset.emp, tr.dataset.ref); });
$('corpo').addEventListener('keydown', e => { if (e.key === 'Enter') { const tr = e.target.closest('tr[data-emp]'); if (tr) abre(tr.dataset.emp, tr.dataset.ref); } });

// ===== gaveta da empresa =====
let atual = null;
const baixa = async caminho => {
  const { data, error } = await banco.storage.from('regularidade').createSignedUrl(caminho, 120);
  if (error) return avisa('Não deu para abrir o arquivo: ' + error.message);
  window.open(data.signedUrl, '_blank', 'noopener');
};

async function abre(empId, foco) {
  atual = empId;
  const e = emps.find(x => x.id === empId);
  if (!e) return avisa('Empresa não encontrada.');
  $('gaveta').hidden = false;
  $('g-cliente').href = 'cliente.html?empresa=' + empId;
  $('g-pdf').href = 'cliente.html?empresa=' + empId + '&imprimir=1';
  history.replaceState(null, '', '#e=' + empId);
  $('g-miolo').innerHTML = '<p class="rg-muted">Carregando…</p>';
  const [pa, og, pe, co, ce, ev, au, idx, rz, nt, hi] = await Promise.all([
    banco.from('v_regularidade_empresa').select('*').eq('empresa_id', empId).maybeSingle(),
    banco.from('v_regularidade_orgao').select('*').eq('empresa_id', empId).order('ordem'),
    banco.from('v_pendencia_fiscal').select('*').eq('empresa_id', empId).order('criado_em', { ascending: false }),
    banco.from('consulta_fiscal').select('*').eq('empresa_id', empId).order('consultado_em', { ascending: false }).limit(60),
    banco.from('v_certidao').select('*').eq('empresa_id', empId).order('valida_ate', { ascending: false }),
    banco.from('evidencia_fiscal').select('*').eq('empresa_id', empId),
    banco.from('autorizacao').select('*').eq('empresa_id', empId).order('criado_em', { ascending: false }),
    banco.rpc('indice_regularidade', { p_empresa: empId }),
    banco.from('regularizacao').select('*').eq('empresa_id', empId).order('criado_em'),
    banco.from('regularidade_nota').select('*').eq('empresa_id', empId).order('criado_em'),
    banco.from('historico').select('acao,detalhe,pessoa_id,criado_em').eq('empresa_id', empId).like('acao', 'regularidade:%').order('criado_em', { ascending: false }).limit(25)
  ]);
  if (atual !== empId) return;
  const R = pa.data || {}, I = idx.data || { indice: '-', criterios: [] };
  const pends = pe.data || [], cons = co.data || [], cers = ce.data || [], evs = ev.data || [], auts = au.data || [];
  const etapas = rz.data || [], notas = nt.data || [];
  const nomeP = id => equipe.find(p => p.id === id)?.nome || '-';
  const evDe = cid => evs.filter(x => x.consulta_id === cid);
  const abertas = pends.filter(p => p.aberta), fechadas = pends.filter(p => !p.aberta);

  const itemPend = p => `<li class="rg-item${p.aberta ? '' : ' is-feita'}" id="p-${p.id}">
    <button type="button" class="rg-item__cab" data-abre>
      <span class="rg-item__t"><b>${esc(p.tributo)}${p.periodo ? ' · ' + mesAno(p.periodo) : ''}</b><small>${esc(p.orgao_sigla)} · ${esc(TIPO_P[p.tipo])}${p.processo ? ' · ' + esc(p.processo) : ''}${p.validada_em ? '' : ' · aguardando validação contábil'}</small></span>
      ${p.tipo === 'debito' ? seloDeb(p.situacao) : '<span class="rg-selo rg-selo--pend">' + esc(TIPO_P[p.tipo]) + '</span>'}
      <span class="rg-item__v">${p.valor_referencia != null ? reais(p.valor_referencia) : '<span class="rg-muted">sem valor</span>'}</span>
      ${seloSt(p.status)}
    </button>
    <div class="rg-item__miolo" hidden>
      <dl class="rg-campos">
        ${[['Código da receita', p.codigo_receita], ['Período', mesAno(p.periodo)], ['Vencimento', dataBR(p.vencimento)], ['Principal', reais(p.valor_principal)], ['Multa', reais(p.valor_multa)], ['Juros', reais(p.valor_juros)],
           ['Valor original', reais(p.valor_original)], ['Atualizado', reais(p.valor_atualizado)], ['Consolidado', reais(p.valor_consolidado)], ['Parcelado', reais(p.valor_parcelado)], ['Suspenso', reais(p.valor_suspenso)], ['Exigível', reais(p.valor_exigivel)],
           ['Identificador de origem', p.id_origem], ['Consulta de origem', quando(p.consultado_em) + ' · ' + (p.consulta_origem === 'manual' ? 'manual' : 'automática')], ['Validação', p.validada_em ? 'validada em ' + quando(p.validada_em) + (p.publicada ? ', publicada' : '') : 'aguardando validação contábil'],
           ['Tarefa', p.tarefa_id ? `<a href="../tarefas/#${p.tarefa_id}" target="_blank" rel="noopener">abrir tarefa</a>${p.responsavel_nome ? ' · ' + esc(p.responsavel_nome) : ''}${p.tarefa_prazo ? ' · prazo ' + dataBR(p.tarefa_prazo) : ''}` : '-']]
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'Tarefa' ? v : esc(v || '-')}</dd></div>`).join('')}
      </dl>
      ${p.orientacao ? `<p class="rg-dica"><b>Orientação ao cliente:</b> ${esc(p.orientacao)}</p>` : ''}
      <div class="rg-form" data-pend="${p.id}">
        <label><span>Etapa da regularização</span><select class="ui-in" data-k="status">${STATUS.map(([k, n]) => `<option value="${k}"${k === p.status ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="rg-larga"><span>Registro da solução (o cliente lê)</span><textarea class="ui-txt" rows="2" data-k="solucao">${esc(p.solucao || '')}</textarea></label>
      </div>
      <details class="rg-det"><summary>Corrigir valores e dados (a validação cai e precisa validar de novo)</summary>
        <div class="rg-form" data-edita="${p.id}">
          <label><span>Situação</span><select class="ui-in" data-k="situacao"><option value="">Sem</option>${Object.entries(SITDEB).map(([k, [n]]) => `<option value="${k}"${k === p.situacao ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
          <label><span>Vencimento</span><input class="ui-in" type="date" data-k="vencimento" value="${p.vencimento || ''}"></label>
          ${['valor_principal', 'valor_multa', 'valor_juros', 'valor_original', 'valor_atualizado', 'valor_consolidado', 'valor_parcelado', 'valor_suspenso', 'valor_exigivel'].map(k => `<label><span>${k.replace('valor_', '').replace(/^./, c => c.toUpperCase())}</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="${k}" value="${p[k] ?? ''}"></label>`).join('')}
          <label><span>Processo ou inscrição</span><input class="ui-in" data-k="processo" value="${esc(p.processo || '')}"></label>
          <label class="rg-larga"><span>Orientação de regularização (o cliente lê)</span><textarea class="ui-txt" rows="2" data-k="orientacao">${esc(p.orientacao || '')}</textarea></label>
          <div class="rg-larga"><button class="ui-btn" type="button" data-salva-edita="${p.id}">Salvar correção</button></div>
        </div>
      </details>
      <p class="rg-sub-t">Histórico</p>
      <ul class="rg-hist">${etapas.filter(x => x.pendencia_id === p.id).map(x => `<li><time>${quando(x.criado_em)}</time><span>${x.de ? esc(NOME_ST[x.de]) + ' → ' : ''}${esc(NOME_ST[x.para])} · ${esc(nomeP(x.pessoa_id))}</span></li>`).join('')}
        ${notas.filter(n => n.pendencia_id === p.id).map(n => `<li><time>${quando(n.criado_em)}</time><span><b>${esc(nomeP(n.autor_id))}:</b> ${esc(n.texto)}</span></li>`).join('')}</ul>
      <form class="rg-acoes" data-nota-p="${p.id}"><input class="ui-in" style="flex:1;min-width:160px" placeholder="Observação interna (o cliente não vê)" required><button class="ui-btn" type="submit">Anotar</button></form>
    </div></li>`;

  const itemCons = c => {
    const evc = evDe(c.id), np = pends.filter(p => p.consulta_id === c.id).length, nc = cers.filter(x => x.consulta_id === c.id).length;
    return `<li class="rg-item" id="c-${c.id}">
    <button type="button" class="rg-item__cab" data-abre>
      <span class="rg-item__t"><b>${esc(orgao(c.orgao_id).sigla)} · ${quando(c.consultado_em)}</b><small>${c.origem === 'manual' ? 'Consulta manual' : 'Consulta automática'} · ${esc(nomeP(c.consultado_por))}${np ? ` · ${np} pendência(s)` : ''}${nc ? ` · ${nc} certidão(ões)` : ''} · ${evc.length} evidência(s)</small></span>
      ${selo(c.resultado, RES[c.resultado])}
      <span></span>
      ${c.publicada ? '<span class="rg-selo rg-selo--ok rg-selo--sem-ponto">Publicada</span>' : '<span class="rg-selo rg-selo--val">Aguardando validação contábil</span>'}
    </button>
    <div class="rg-item__miolo" hidden>
      ${c.resumo ? `<p class="rg-dica"><b>Resumo para o cliente:</b> ${esc(c.resumo)}</p>` : ''}
      ${c.inscricao ? `<p class="rg-dica">Inscrição usada: ${esc(c.inscricao)}</p>` : ''}
      <ul class="rg-evid">${evc.map(x => `<li><button type="button" data-baixa="${esc(x.arquivo)}">${ICO_ARQ}<span>${esc(x.nome)}</span></button></li>`).join('') || '<li class="rg-muted" style="font-size:12px">Sem evidência anexada.</li>'}</ul>
      ${c.resultado === 'regular' && !evc.length ? '<p class="rg-alerta">Resultado regular só é validado com a evidência anexada.</p>' : ''}
      ${c.validada_em ? `<p class="rg-dica">Validada por ${esc(nomeP(c.validada_por))} em ${quando(c.validada_em)}${c.publicada ? ' e publicada ao cliente' : ''}.</p>` : ''}
      <div class="rg-acoes">
        ${!c.publicada ? `<label class="ui-btn"><input type="file" hidden multiple data-anexa="${c.id}">Anexar evidência</label>` : ''}
        ${PODE_VALIDAR && !c.publicada ? `<button class="ui-btn ui-btn--pri" type="button" data-publica="${c.id}">Validar e publicar ao cliente</button>` : ''}
        ${PODE_VALIDAR && c.publicada ? `<button class="ui-btn" type="button" data-despublica="${c.id}">Tirar da vista do cliente</button>` : ''}
        ${!PODE_VALIDAR && !c.publicada ? '<span class="rg-dica">A validação é feita por gestor, fiscal ou contábil.</span>' : ''}
      </div>
      <p class="rg-sub-t">Observações internas</p>
      <ul class="rg-hist">${notas.filter(n => n.consulta_id === c.id).map(n => `<li><time>${quando(n.criado_em)}</time><span><b>${esc(nomeP(n.autor_id))}:</b> ${esc(n.texto)}</span></li>`).join('') || '<li class="rg-muted">Nenhuma.</li>'}</ul>
      <form class="rg-acoes" data-nota-c="${c.id}"><input class="ui-in" style="flex:1;min-width:160px" placeholder="Observação interna (o cliente não vê)" required><button class="ui-btn" type="submit">Anotar</button></form>
    </div></li>`;
  };

  $('g-miolo').innerHTML = `
    <h2 id="g-nome">${esc(e.nome_fantasia || e.razao_social)}${e.teste ? '<span class="rg-teste">teste</span>' : ''}</h2>
    <p class="rg-gav__sub">${esc(e.razao_social)} · ${esc(e.cnpj || 'sem CNPJ')} · ${esc([e.municipio, e.uf].filter(Boolean).join('/') || 'sem município')} · ${esc((e.regime || '').toUpperCase())}${R.responsavel_fiscal_nome ? ' · Fiscal: ' + esc(R.responsavel_fiscal_nome) : ''}</p>
    <div class="rg-resumo">
      <div class="rg-cx"><small>Situação geral</small>${selo(R.situacao_geral)}<p>${R.orgaos_sem_info ? R.orgaos_sem_info + ' órgão(s) sem informação válida' : 'todos os órgãos com consulta válida'}</p></div>
      <div class="rg-cx"><small>Débitos em aberto</small><b>${reais(R.total_em_aberto)}</b><p>exigível + dívida ativa</p></div>
      <div class="rg-cx"><small>Órgãos consultados</small><b>${R.orgaos_consultados ?? 0}</b><p>${R.consultas_com_falha ? R.consultas_com_falha + ' com falha' : 'nenhuma falha'}</p></div>
      <div class="rg-cx"><small>Índice de regularidade</small><b>${I.indice}<span class="rg-muted" style="font-size:12px">/100</span></b><p>regra provisória, validar com o Manu</p></div>
    </div>
    <div class="rg-valores"><span>Exigível <b>${reais(R.total_exigivel)}</b></span><span>Dívida ativa <b>${reais(R.total_divida_ativa)}</b></span><span>Parcelado <b>${reais(R.total_parcelado)}</b></span><span>Suspenso <b>${reais(R.total_suspenso)}</b></span><span>Sem valor identificado <b>${R.sem_valor ?? 0}</b></span>
      <span>Federal <b>${reais(R.total_federal)}</b></span><span>Estadual <b>${reais(R.total_estadual)}</b></span><span>Municipal <b>${reais(R.total_municipal)}</b></span></div>
    ${I.criterios?.length ? `<details class="rg-det"><summary>Como o índice foi calculado</summary><ul class="rg-crit">${I.criterios.map(c => `<li><span>${esc(c.criterio)}</span><span>${c.pontos}</span></li>`).join('')}</ul></details>` : ''}

    <section class="rg-sec"><h3>Resumo por órgão</h3>
      <table class="rg-tab"><colgroup><col><col style="width:150px"><col style="width:110px"><col class="so-largo" style="width:120px"><col style="width:96px"></colgroup>
      <tbody>${(og.data || []).map(o => `<tr>
        <td class="rg-flex"><b style="font-weight:500">${esc(o.orgao_nome)}</b>${orgao(o.orgao_id).portal_url ? ` <a class="rg-muted" href="${esc(orgao(o.orgao_id).portal_url)}" target="_blank" rel="noopener" style="font-size:11px">portal</a>` : ''}</td>
        <td>${selo(o.situacao)}</td>
        <td class="n">${reais(o.em_aberto)}</td>
        <td class="so-largo"><small>${o.consultado_em ? dataBR(o.consultado_em) + (o.publicada ? '' : ' · a validar') : 'nunca'}</small></td>
        <td class="n"><button class="ui-btn" type="button" data-consulta-orgao="${o.orgao_id}" style="height:26px;font-size:12px">Consultar</button></td></tr>`).join('')}</tbody></table>
    </section>

    <section class="rg-sec"><h3>Pendências <small>${abertas.length} em aberto</small></h3>
      <ul class="rg-itens">${abertas.map(itemPend).join('') || '<li class="rg-muted" style="font-size:12px">Nenhuma pendência em aberto.</li>'}</ul>
      ${fechadas.length ? `<details class="rg-det"><summary>Regularizadas e arquivadas (${fechadas.length})</summary><ul class="rg-itens" style="margin-top:6px">${fechadas.map(itemPend).join('')}</ul></details>` : ''}
    </section>

    <section class="rg-sec"><h3>Certidões</h3>
      ${cers.length ? `<table class="rg-tab"><colgroup><col><col style="width:190px"><col style="width:130px"><col style="width:60px"></colgroup><tbody>${cers.map(c => `<tr>
        <td class="rg-flex">${esc(c.tipo)} <small>${esc(c.orgao_sigla)}${c.vigente ? '' : ' · substituída'}${c.publicada ? '' : ' · a validar'}</small></td>
        <td>${seloCert(c.situacao)}</td><td>${selo(c.validade, dataBR(c.valida_ate))}</td>
        <td class="n">${c.arquivo ? `<button class="ui-btn ui-btn--fan" type="button" data-baixa="${esc(c.arquivo)}" style="height:26px">PDF</button>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="rg-dica">Nenhuma certidão lançada. Use "+ Certidão" ao registrar a consulta do órgão.</p>'}
    </section>

    <section class="rg-sec"><h3>Histórico de consultas <small>cada consulta fica registrada, nada é sobrescrito</small></h3>
      <ul class="rg-itens">${cons.map(itemCons).join('') || '<li class="rg-muted" style="font-size:12px">Nenhuma consulta registrada.</li>'}</ul>
    </section>

    <section class="rg-sec"><h3>Autorizações <small>procuração e certificado, só controle: nunca registre senha</small></h3>
      ${auts.length ? `<table class="rg-tab"><tbody>${auts.map(a => `<tr><td class="rg-flex">${esc(AUT[a.tipo])}${a.orgao_id ? ' · ' + esc(orgao(a.orgao_id).sigla) : ''} <small>${esc(a.outorgado || '')}${a.onde_fica ? ' · ' + esc(a.onde_fica) : ''}</small></td>
        <td style="width:130px"><small>${a.valida_ate ? 'até ' + dataBR(a.valida_ate) : 'sem validade'}</small></td>
        <td style="width:100px"><span class="rg-selo rg-selo--${a.situacao === 'ativa' ? 'ok' : a.situacao === 'pendente' ? 'pend' : a.situacao === 'vencida' ? 'erro' : 'cinza'}">${esc(a.situacao.replace(/^./, c => c.toUpperCase()))}</span></td></tr>`).join('')}</tbody></table>` : ''}
      <details class="rg-det"><summary>Registrar autorização</summary>
        <form class="rg-form" id="f-aut">
          <label><span>Tipo</span><select class="ui-in" name="tipo" required>${Object.entries(AUT).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
          <label><span>Órgão</span><select class="ui-in" name="orgao_id"><option value="">Todos</option>${orgaos.map(o => `<option value="${o.id}">${esc(o.sigla)}</option>`).join('')}</select></label>
          <label><span>Situação</span><select class="ui-in" name="situacao"><option value="ativa">Ativa</option><option value="pendente" selected>Pendente</option><option value="vencida">Vencida</option><option value="revogada">Revogada</option></select></label>
          <label><span>Outorgado</span><input class="ui-in" name="outorgado" placeholder="Coleve, contador"></label>
          <label><span>Válida de</span><input class="ui-in" type="date" name="valida_de"></label>
          <label><span>Válida até</span><input class="ui-in" type="date" name="valida_ate"></label>
          <label class="rg-larga"><span>Onde fica (sem senha)</span><input class="ui-in" name="onde_fica" placeholder="Ex.: certificado A1 com o fiscal"></label>
          <div class="rg-larga"><button class="ui-btn" type="submit">Salvar autorização</button></div>
        </form>
      </details>
    </section>

    <section class="rg-sec"><h3>Registro de ações <small>auditoria</small></h3>
      <ul class="rg-hist">${(hi.data || []).map(h => `<li><time>${quando(h.criado_em)}</time><span>${esc(nomeP(h.pessoa_id))} · ${esc(h.acao.split(':').slice(1).join(' ').replace('_fiscal', '').replace('insert', 'incluiu').replace('update', 'alterou').replace('delete', 'excluiu'))}</span></li>`).join('') || '<li class="rg-muted">Nada ainda.</li>'}</ul>
    </section>`;

  if (foco) { const alvo = $('p-' + foco) || $('c-' + foco); if (alvo) { alvo.querySelector('.rg-item__miolo').hidden = false; alvo.scrollIntoView({ block: 'center' }); } }
}

// ações dentro da gaveta
const fecha = () => { $('gaveta').hidden = true; atual = null; history.replaceState(null, '', location.pathname); };
$('gaveta').addEventListener('click', async e => {
  if (e.target.closest('[data-fecha]')) return fecha();
  const cab = e.target.closest('[data-abre]');
  if (cab) { const m = cab.nextElementSibling; m.hidden = !m.hidden; return; }
  const bx = e.target.closest('[data-baixa]'); if (bx) return baixa(bx.dataset.baixa);
  const co = e.target.closest('[data-consulta-orgao]'); if (co) return novaConsulta(atual, co.dataset.consultaOrgao);
  const pb = e.target.closest('[data-publica]');
  if (pb) {
    pb.disabled = true;
    const { data, error } = await banco.rpc('regularidade_publicar', { p_consulta: pb.dataset.publica });
    if (error) { pb.disabled = false; return avisa('Não publicou: ' + error.message); }
    avisa(`Validada e publicada: ${data.pendencias} pendência(s) e ${data.certidoes} certidão(ões). O cliente já vê.`);
    await recarrega(pb.dataset.publica); return;
  }
  const dp = e.target.closest('[data-despublica]');
  if (dp) {
    if (!confirm('Tirar esta consulta (e o que foi lançado nela) da vista do cliente? A validação cai.')) return;
    const { error } = await banco.rpc('regularidade_despublicar', { p_consulta: dp.dataset.despublica });
    avisa(error ? 'Não deu: ' + error.message : 'Saiu da vista do cliente.');
    await recarrega(dp.dataset.despublica); return;
  }
  const se = e.target.closest('[data-salva-edita]');
  if (se) {
    const box = se.closest('[data-edita]'), dados = {};
    box.querySelectorAll('[data-k]').forEach(i => { const v = i.value.trim(); dados[i.dataset.k] = v === '' ? null : (i.type === 'number' ? Number(v) : v); });
    const { error } = await banco.from('pendencia_fiscal').update(dados).eq('id', box.dataset.edita);
    avisa(error ? 'Não salvou: ' + msgErro(error) : 'Correção salva. A pendência voltou para "aguardando validação contábil".');
    await recarrega(box.dataset.edita);
  }
});
$('gaveta').addEventListener('change', async e => {
  const st = e.target.closest('[data-pend] [data-k="status"]');
  if (st) {
    const id = st.closest('[data-pend]').dataset.pend;
    const { error } = await banco.from('pendencia_fiscal').update({ status: st.value }).eq('id', id);
    avisa(error ? 'Não salvou: ' + error.message : 'Etapa salva: ' + NOME_ST[st.value] + (['regularizado', 'arquivado'].includes(st.value) ? '. A tarefa foi concluída.' : '.'));
    return recarrega(id);
  }
  const so = e.target.closest('[data-pend] [data-k="solucao"]');
  if (so) {
    const { error } = await banco.from('pendencia_fiscal').update({ solucao: so.value.trim() || null }).eq('id', so.closest('[data-pend]').dataset.pend);
    avisa(error ? 'Não salvou: ' + error.message : 'Solução registrada.');
    return;
  }
  const an = e.target.closest('input[data-anexa]');
  if (an && an.files.length) {
    const ok = await subirEvidencias(atual, an.dataset.anexa, an.files);
    avisa(ok ? 'Evidência anexada.' : 'Uma ou mais evidências não subiram.');
    return recarrega(an.dataset.anexa);
  }
});
$('gaveta').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'f-aut') {
    const d = Object.fromEntries(new FormData(f)); Object.keys(d).forEach(k => { if (d[k] === '') d[k] = null; });
    const { error } = await banco.from('autorizacao').insert({ ...d, empresa_id: atual });
    avisa(error ? 'Não salvou: ' + error.message : 'Autorização registrada.');
    return recarrega();
  }
  const inp = f.querySelector('input'); const texto = inp.value.trim(); if (!texto) return;
  const linha = f.dataset.notaP ? { pendencia_id: f.dataset.notaP } : { consulta_id: f.dataset.notaC };
  const { error } = await banco.from('regularidade_nota').insert({ ...linha, empresa_id: atual, texto });
  avisa(error ? 'Não salvou: ' + error.message : 'Anotado.');
  recarrega(f.dataset.notaP || f.dataset.notaC);
});
async function recarrega(foco) { const id = atual; await carrega(); if (id) await abre(id, foco); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden && !$('dlg').open) fecha(); });
$('g-consulta').onclick = () => novaConsulta(atual);

// ===== registrar consulta =====
const msgErro = err => err?.code === '23505' ? 'esse débito já está lançado e aberto nesse órgão (mesmo identificador de origem). Atualize o que já existe.' : (err?.message || 'erro');
const nomeArq = n => n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.\-]+/g, '_').slice(-80);
async function subirEvidencias(empId, consultaId, files) {
  let ok = true;
  for (const f of files) {
    const caminho = `${empId}/${consultaId}/${Date.now()}-${nomeArq(f.name)}`;
    const up = await banco.storage.from('regularidade').upload(caminho, f, { contentType: f.type || undefined });
    if (up.error) { ok = false; continue; }
    const { error } = await banco.from('evidencia_fiscal').insert({ empresa_id: empId, consulta_id: consultaId, nome: f.name, arquivo: caminho, tipo_mime: f.type || null, tamanho: f.size });
    if (error) ok = false;
  }
  return ok;
}
const agoraLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
function novaConsulta(empId = '', orgaoId = '') {
  $('f-consulta').reset();
  $('c-pends').innerHTML = ''; $('c-certs').innerHTML = ''; $('c-alerta').hidden = true;
  $('c-emp').value = empId || ''; $('c-orgao').value = orgaoId || ''; $('c-quando').value = agoraLocal();
  const e = emps.find(x => x.id === empId); if (e?.cnpj) $('c-insc').value = e.cnpj;
  $('dlg').showModal();
}
$('nova-c').onclick = () => novaConsulta(atual || '');
$('c-cancela').onclick = () => $('dlg').close();
$('c-emp').onchange = () => { const e = emps.find(x => x.id === $('c-emp').value); if (e?.cnpj && !$('c-insc').value) $('c-insc').value = e.cnpj; };
const alerta = () => {
  const r = $('c-res').value, a = $('c-alerta');
  const msg = r === 'regular' && !$('c-arqs').files.length ? 'Resultado regular só é validado com a evidência anexada.'
    : r === 'nao_aplica' && !$('c-resumo').value.trim() ? 'Em "Não se aplica", explique no resumo por quê (ex.: empresa sem inscrição estadual).'
    : r === 'irregular' && !$('c-pends').children.length && !$('c-resumo').value.trim() ? 'Resultado irregular: lance as pendências abaixo ou explique no resumo.' : '';
  a.textContent = msg; a.hidden = !msg;
};
['c-res', 'c-arqs', 'c-resumo'].forEach(id => $(id).addEventListener('input', alerta));

const blocoPend = () => `<fieldset class="rg-bloco" data-bloco="p"><legend>Pendência</legend><button class="ui-btn ui-btn--fan rg-tira" type="button" data-tira>Tirar</button>
  <div class="rg-form">
    <label><span>Tipo</span><select class="ui-in" data-k="tipo">${Object.entries(TIPO_P).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
    <label><span>Tributo ou natureza</span><input class="ui-in" data-k="tributo" required placeholder="IRPJ, ICMS, ISS, omissão DCTFWeb"></label>
    <label><span>Código da receita</span><input class="ui-in" data-k="codigo_receita"></label>
    <label><span>Período de apuração</span><input class="ui-in" type="month" data-k="periodo"></label>
    <label><span>Vencimento</span><input class="ui-in" type="date" data-k="vencimento"></label>
    <label><span>Situação do débito</span><select class="ui-in" data-k="situacao"><option value="">Sem (não é débito)</option>${Object.entries(SITDEB).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
    <label><span>Principal</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_principal"></label>
    <label><span>Multa</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_multa"></label>
    <label><span>Juros</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_juros"></label>
    <label><span>Valor original</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_original"></label>
    <label><span>Valor atualizado</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_atualizado"></label>
    <label><span>Consolidado</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_consolidado"></label>
    <label><span>Parcelado</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_parcelado"></label>
    <label><span>Suspenso</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_suspenso"></label>
    <label><span>Exigível</span><input class="ui-in" type="number" step="0.01" min="0" inputmode="decimal" data-k="valor_exigivel"></label>
    <label><span>Processo ou inscrição</span><input class="ui-in" data-k="processo"></label>
    <label><span>Identificador de origem</span><input class="ui-in" data-k="id_origem" placeholder="automático: tributo-código-período"></label>
    <label class="rg-larga"><span>Orientação de regularização (o cliente lê)</span><textarea class="ui-txt" rows="2" data-k="orientacao"></textarea></label>
  </div><p class="rg-dica">O identificador de origem impede contar o mesmo débito duas vezes. Se o débito saiu da Receita e foi inscrito na PGFN, use o mesmo identificador: o lançamento antigo é arquivado sozinho.</p></fieldset>`;
const blocoCert = () => `<fieldset class="rg-bloco" data-bloco="c"><legend>Certidão</legend><button class="ui-btn ui-btn--fan rg-tira" type="button" data-tira>Tirar</button>
  <div class="rg-form">
    <label class="rg-larga"><span>Certidão</span><input class="ui-in" data-k="tipo" required list="tipos-cert" placeholder="Certidão conjunta federal, CRF do FGTS, CNDT"></label>
    <label><span>Situação</span><select class="ui-in" data-k="situacao" required>${Object.entries(CERT).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
    <label><span>Emissão</span><input class="ui-in" type="date" data-k="emitida_em" required></label>
    <label><span>Validade</span><input class="ui-in" type="date" data-k="valida_ate" required></label>
    <label><span>Código de controle</span><input class="ui-in" data-k="codigo_controle"></label>
    <label class="rg-larga"><span>Arquivo da certidão</span><input class="ui-in" type="file" data-arq style="padding-top:4px"></label>
  </div><datalist id="tipos-cert"><option>Certidão conjunta federal (RFB/PGFN)</option><option>CRF do FGTS</option><option>CNDT (Justiça do Trabalho)</option><option>Certidão de débitos tributários estaduais</option><option>Certidão de tributos mobiliários</option></datalist></fieldset>`;
$('c-mais-p').onclick = () => { $('c-pends').insertAdjacentHTML('beforeend', blocoPend()); alerta(); };
$('c-mais-c').onclick = () => $('c-certs').insertAdjacentHTML('beforeend', blocoCert());
$('dlg').addEventListener('click', e => { const t = e.target.closest('[data-tira]'); if (t) { t.closest('fieldset').remove(); alerta(); } });
const lerBloco = b => { const d = {}; b.querySelectorAll('[data-k]').forEach(i => { const v = i.value.trim(); d[i.dataset.k] = v === '' ? null : (i.type === 'number' ? Number(v) : v); }); return d; };

$('f-consulta').addEventListener('submit', async e => {
  e.preventDefault();
  const empId = $('c-emp').value, orgaoId = $('c-orgao').value, res = $('c-res').value;
  if (!empId || !orgaoId || !res || !$('c-quando').value) return avisa('Preencha empresa, órgão, data e resultado.');
  if (res === 'nao_aplica' && !$('c-resumo').value.trim()) return avisa('Em "Não se aplica", explique no resumo.');
  const pends = [...$('c-pends').querySelectorAll('[data-bloco="p"]')].map(lerBloco);
  for (const p of pends) {
    if (!p.tributo) return avisa('Toda pendência precisa do tributo ou natureza.');
    if (p.tipo === 'debito' && !p.situacao) return avisa('Débito precisa da situação: exigível, suspenso, parcelado ou dívida ativa.');
    if (p.periodo) p.periodo += '-01';
    if (!p.id_origem) p.id_origem = [p.tributo, p.codigo_receita, p.periodo?.slice(0, 7), p.processo].filter(Boolean).join('-').toUpperCase().replace(/\s+/g, '');
  }
  const blocosC = [...$('c-certs').querySelectorAll('[data-bloco="c"]')];
  for (const b of blocosC) { const c = lerBloco(b); if (!c.tipo || !c.emitida_em || !c.valida_ate) return avisa('Certidão precisa do nome, emissão e validade.'); }

  $('c-salva').disabled = true;
  try {
    const { data: c, error } = await banco.from('consulta_fiscal').insert({
      empresa_id: empId, orgao_id: orgaoId, resultado: res, consultado_em: new Date($('c-quando').value).toISOString(),
      inscricao: $('c-insc').value.trim() || null, resumo: $('c-resumo').value.trim() || null, origem: 'manual'
    }).select('id').single();
    if (error) return avisa('Não salvou a consulta: ' + error.message);
    const falhas = [];
    if ($('c-arqs').files.length && !(await subirEvidencias(empId, c.id, $('c-arqs').files))) falhas.push('evidência');
    for (const p of pends) {
      const { error: ep } = await banco.from('pendencia_fiscal').insert({ ...p, empresa_id: empId, orgao_id: orgaoId, consulta_id: c.id });
      if (ep) falhas.push(`${p.tributo}: ${msgErro(ep)}`);
    }
    for (const b of blocosC) {
      const d = lerBloco(b), f = b.querySelector('[data-arq]').files[0];
      if (f) {
        const caminho = `${empId}/${c.id}/certidao-${Date.now()}-${nomeArq(f.name)}`;
        const up = await banco.storage.from('regularidade').upload(caminho, f, { contentType: f.type || undefined });
        if (up.error) falhas.push('arquivo da certidão'); else { d.arquivo = caminho; d.arquivo_nome = f.name; }
      }
      const { error: ec } = await banco.from('certidao').insert({ ...d, empresa_id: empId, orgao_id: orgaoId, consulta_id: c.id });
      if (ec) falhas.push('certidão: ' + ec.message);
    }
    $('dlg').close();
    avisa(falhas.length ? 'Consulta salva, mas: ' + falhas.join(' · ') : `Consulta salva${pends.length ? ` com ${pends.length} pendência(s) e tarefa(s) no Fiscal` : ''}. Falta a validação contábil para o cliente ver.`);
    await carrega(); await abre(empId, c.id);
  } finally { $('c-salva').disabled = false; }
});

// ===== início =====
await carrega();
const h = new URLSearchParams(location.hash.slice(1));
if (h.get('e')) await abre(h.get('e'));
else if (h.get('p')) {   // link da tarefa: #p=<pendência>
  const { data } = await banco.from('pendencia_fiscal').select('empresa_id').eq('id', h.get('p')).maybeSingle();
  if (data) await abre(data.empresa_id, h.get('p'));
}
document.body.classList.remove('carregando');
