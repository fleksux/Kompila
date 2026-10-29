// Sistema Coleve · clientes (área interna): lista de empresas e a ficha de cada uma
import { banco, quemSou } from '../conexao.js?v=2';
import { TIPOS, reais, mesNome, checklistWhats, checklistEmail } from '../documentos.js?v=3';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;
if (P.area === 'marketing' && !['admin', 'gestor'].includes(P.papel)) { location.replace('../'); throw 0; }

const REGIMES = { mei: 'MEI', simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real' };
const AREAS = { fiscal: 'Fiscal', contabil: 'Contábil', dp: 'Dep. pessoal', bpo: 'BPO financeiro', paralegal: 'Paralegal' };
const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? d.split('-').reverse().join('/') : '';
const horaBR = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 4000); };

// CNPJ: máscara e dígito verificador (vazio pode, enquanto o cadastro não está completo)
const soDig = s => String(s || '').replace(/\D/g, '');
const mascara = s => { const d = soDig(s).slice(0, 14); return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); };
function cnpjOk(s) {
  const d = soDig(s); if (!d) return true;
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const dv = n => { let soma = 0, p = n - 7; for (let i = 0; i < n; i++) { soma += d[i] * p--; if (p < 2) p = 9; } const r = soma % 11; return r < 2 ? 0 : 11 - r; };
  return dv(12) === +d[12] && dv(13) === +d[13];
}
['e-cnpj', 'n-cnpj'].forEach(id => $(id).addEventListener('input', e => { e.target.value = mascara(e.target.value); }));

// barra de cima
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

Object.entries(REGIMES).forEach(([k, v]) => ['f-regime', 'e-regime-sel', 'n-regime'].forEach(id => $(id).insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`)));
$('n-regime').value = 'simples';
const { data: equipe } = await banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome');
(equipe || []).forEach(p => $('f-resp').insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`));

let empresas = [];
async function carrega() {
  const { data, error } = await banco.from('v_empresa').select('*').order('ativo', { ascending: false }).order('razao_social');
  if (error) return avisa('Não deu para carregar as empresas.');
  empresas = data;
  const ativas = data.filter(e => e.ativo);
  $('numeros').innerHTML =
    `<div class="num"><strong>${ativas.length}</strong><span>empresas ativas</span></div>` +
    `<div class="num"><strong>${ativas.reduce((s, e) => s + e.tarefas_abertas, 0)}</strong><span>tarefas abertas</span></div>` +
    `<div class="num"><strong>${ativas.reduce((s, e) => s + e.tarefas_atrasadas, 0)}</strong><span>tarefas atrasadas</span></div>`;
  desenha();
}

function desenha() {
  const b = $('f-busca').value.trim().toLowerCase(), bd = soDig(b), rg = $('f-regime').value, rp = $('f-resp').value;
  const lista = empresas.filter(e =>
    (!b || (e.razao_social + ' ' + (e.nome_fantasia || '')).toLowerCase().includes(b) || (bd && soDig(e.cnpj).includes(bd))) &&
    (!rg || e.regime === rg) &&
    (!rp || Object.values(e.responsaveis).some(r => r.id === rp)));
  $('total').textContent = `· ${lista.length}`;
  $('lista').innerHTML = lista.map(e => {
    const resp = Object.entries(e.responsaveis);
    return `<button type="button" class="emp${e.ativo ? '' : ' emp--off'}" data-id="${e.id}">
      <span class="emp__topo"><span class="ico"><svg viewBox="0 0 24 24"><path d="M4 21V5l8-3v19M12 9h8v12M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/></svg></span><em>${REGIMES[e.regime]}</em></span>
      <b>${esc(e.nome_fantasia || e.razao_social)}${e.teste ? ' <i class="tag-teste">teste</i>' : ''}</b>
      <small>${e.nome_fantasia ? esc(e.razao_social) + ' · ' : ''}${e.cnpj ? esc(e.cnpj) : 'CNPJ a cadastrar'}</small>
      <span class="emp__pe">
        <span class="emp__n${e.tarefas_atrasadas ? ' emp__n--atraso' : ''}">${e.tarefas_atrasadas ? `${e.tarefas_atrasadas} atrasada${e.tarefas_atrasadas > 1 ? 's' : ''}` : `${e.tarefas_abertas} aberta${e.tarefas_abertas === 1 ? '' : 's'}`}${e.ativo ? '' : ' · inativa'}</span>
        <span class="rostos-c">${resp.slice(0, 4).map(([a, r]) => `<span class="mini" title="${esc(r.nome)} · ${AREAS[a] || a}">${iniciais(r.nome)}</span>`).join('') || '<span class="mini mini--vazio" title="Sem responsável">+</span>'}</span>
      </span></button>`;
  }).join('') || '<p class="fv">Nenhuma empresa com esse filtro.</p>';
}
['f-busca', 'f-regime', 'f-resp'].forEach(id => $(id).addEventListener('input', desenha));

// ===== ficha =====
let aberta = null;
$('lista').addEventListener('click', e => { const c = e.target.closest('.emp'); if (c) abre(c.dataset.id); });
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', fecha));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden) fecha(); });
function fecha() { $('gaveta').hidden = true; aberta = null; history.replaceState(null, '', location.pathname); carrega(); }

async function abre(id) {
  const e = empresas.find(x => x.id === id); if (!e) return;
  aberta = e;
  history.replaceState(null, '', '#' + id);
  $('e-regime').textContent = REGIMES[e.regime] + (e.teste ? ' · empresa de teste' : '');
  $('e-titulo').textContent = e.nome_fantasia || e.razao_social;
  $('e-tarefas').href = '../tarefas/?emp=' + id;
  $('e-tarefas').textContent = `Ver tarefas desta empresa (${e.tarefas_abertas} abertas)`;
  $('e-razao').value = e.razao_social; $('e-fantasia').value = e.nome_fantasia || ''; $('e-cnpj').value = e.cnpj || '';
  $('e-regime-sel').value = e.regime; $('e-municipio').value = e.municipio || ''; $('e-uf').value = e.uf || '';
  $('e-plano').value = e.plano || ''; $('e-inicio').value = e.inicio_atendimento || ''; $('e-ativo').checked = e.ativo;
  $('e-resp').innerHTML = Object.entries(AREAS).map(([a, nome]) => `<label class="cp-t">${nome}<select data-area="${a}"><option value="">Sem responsável</option>${(equipe || []).map(p => `<option value="${p.id}"${e.responsaveis[a]?.id === p.id ? ' selected' : ''}>${esc(p.nome)}</option>`).join('')}</select></label>`).join('');
  $('e-obrig').innerHTML = $('e-contatos').innerHTML = $('e-docs').innerHTML = '';
  $('gaveta').hidden = false;
  carregaFicha(id);
}

async function carregaFicha(id) {
  const [{ data: tipos }, { data: liga }, { data: cont }, { data: docs }, { data: pts }, { data: pend }] = await Promise.all([
    banco.from('obrigacao_tipo').select('codigo,nome,area,regimes').eq('ativo', true).order('area').order('nome'),
    banco.from('empresa_obrigacao').select('obrigacao,ativa').eq('empresa_id', id),
    banco.from('empresa_pessoa').select('funcao,pessoa:pessoa(nome,email,telefone)').eq('empresa_id', id),
    banco.from('documento').select('nome,tipo,valor,competencia,protocolo(enviado_em,lido_em)').eq('empresa_id', id).eq('vindo_do_cliente', false).order('criado_em', { ascending: false }).limit(8),
    banco.from('pendencia_tipo').select('*').eq('ativo', true).order('ordem'),
    banco.from('pendencia_cliente').select('tipo,competencia,prazo,recebido_em').eq('empresa_id', id).order('competencia', { ascending: false })
  ]);
  if (aberta?.id !== id) return;
  desenhaOnboarding(id);
  // checklist do mês: o mesmo conteúdo que vai no WhatsApp, no e-mail e na Área do cliente
  const mensais = (pend || []).filter(p => pts.find(t => t.codigo === p.tipo)?.dia);
  const comp = mensais[0]?.competencia;
  checklist = comp ? {
    empresa: aberta.nome_fantasia || aberta.razao_social, competencia: comp,
    contato: (cont || [])[0]?.pessoa?.nome?.split(' ')[0] || '',
    itens: mensais.filter(p => p.competencia === comp).sort((a, b) => pts.find(t => t.codigo === a.tipo).ordem - pts.find(t => t.codigo === b.tipo).ordem).map(p => { const t = pts.find(x => x.codigo === p.tipo); return { nome: t.nome, explica: t.explica, formato: t.formato, prazo: p.prazo, recebido: !!p.recebido_em }; })
  } : null;
  $('e-check-mes').textContent = comp ? mesNome(comp) + ' · ' + checklist.itens.filter(i => !i.recebido).length + ' faltando' : 'o que o cliente manda';
  $('e-check').innerHTML = checklist ? checklist.itens.map(i => `<li><span class="d-docs__t"><b>${esc(i.nome)}</b><small>${esc(i.formato || '')}${i.prazo ? ' · até ' + dataBR(i.prazo).slice(0, 5) : ''}</small></span>${i.recebido ? '<em class="st st--lido">recebido</em>' : i.prazo && i.prazo < new Date().toISOString().slice(0, 10) ? '<em class="st st--atraso">atrasado</em>' : '<em class="st st--novo">falta</em>'}</li>`).join('')
    : '<li class="vazio">O checklist aparece quando o mês for gerado em Tarefas.</li>';
  $('e-whats').disabled = $('e-email').disabled = !checklist;
  const on = new Map((liga || []).map(o => [o.obrigacao, o.ativa]));
  // mostra as do regime e as que já estão ligadas
  const visiveis = (tipos || []).filter(o => o.regimes.includes(aberta.regime) || on.get(o.codigo));
  $('e-obrig').innerHTML = visiveis.map(o => `<label class="obrig__i${on.get(o.codigo) ? ' is-on' : ''}"><input type="checkbox" data-cod="${o.codigo}"${on.get(o.codigo) ? ' checked' : ''}><span>${esc(o.nome)}</span><small>${AREAS[o.area] || o.area}</small></label>`).join('') || '<p class="fv">Nenhuma obrigação para este regime.</p>';
  $('e-contatos').innerHTML = (cont || []).map(c => `<li><b>${esc(c.pessoa?.nome)}</b><span>${esc(c.funcao)}</span><p>${esc([c.pessoa?.email, c.pessoa?.telefone].filter(Boolean).join(' · '))}</p></li>`).join('')
    || '<li class="vazio">Nenhum contato com acesso ainda. O convite do cliente entra quando for decidido se vai por e-mail ou WhatsApp.</li>';
  $('e-docs').innerHTML = (docs || []).map(d => {
    const p = d.protocolo?.[0];
    const st = !p ? '<em class="st st--novo">não enviado</em>' : p.lido_em ? `<em class="st st--lido">aberto ${horaBR(p.lido_em)}</em>` : `<em class="st st--env">enviado ${horaBR(p.enviado_em)}</em>`;
    return `<li><span class="d-docs__t"><b>${esc(d.nome)}</b><small>${[TIPOS[d.tipo], d.competencia ? dataBR(d.competencia).slice(3) : null, d.valor != null ? reais(d.valor) : null].filter(Boolean).join(' · ')}</small></span>${st}</li>`;
  }).join('') || '<li class="vazio">Nada enviado ainda.</li>';
}

// ===== onboarding interno: os passos da equipe quando o cliente entra (tarefas origem onboarding) =====
async function desenhaOnboarding(id) {
  const { data: ps } = await banco.from('tarefa').select('id,titulo,area,status,responsavel:pessoa!tarefa_responsavel_id_fkey(nome)').eq('empresa_id', id).eq('origem', 'onboarding').neq('status', 'cancelado').order('criado_em');
  if (aberta?.id !== id) return;
  const feitos = (ps || []).filter(p => p.status === 'enviado').length;
  $('e-onb-n').textContent = ps?.length ? `${feitos} de ${ps.length} feitos` : 'o que a equipe faz quando o cliente entra';
  $('e-onb').innerHTML = ps?.length ? `<span class="onb__barra" aria-hidden="true"><i style="width:${Math.round(feitos / ps.length * 100)}%"></i></span>` +
    ps.map(p => `<label class="onb__i${p.status === 'enviado' ? ' is-on' : ''}"><input type="checkbox" data-t="${p.id}"${p.status === 'enviado' ? ' checked' : ''}><span>${esc(p.titulo)}</span><small>${AREAS[p.area] || { atendimento: 'Atendimento', tecnologia: 'Tecnologia', marketing: 'Marketing' }[p.area] || p.area}${p.responsavel?.nome ? ' · ' + esc(p.responsavel.nome.split(' ')[0]) : ''}</small></label>`).join('')
    : '<p class="fv">Sem passos de onboarding para esta empresa.</p>';
}
$('e-onb').addEventListener('change', async ev => {
  const c = ev.target.closest('input[data-t]'); if (!c || !aberta) return;
  const { error } = await banco.from('tarefa').update({ status: c.checked ? 'enviado' : 'a_fazer' }).eq('id', c.dataset.t);
  if (error) { c.checked = !c.checked; return avisa('Não deu para marcar o passo.'); }
  desenhaOnboarding(aberta.id);
});

$('e-ficha').onsubmit = async ev => {
  ev.preventDefault(); if (!aberta) return;
  if (!cnpjOk($('e-cnpj').value)) { $('e-cnpj').focus(); return avisa('CNPJ inválido: confira os números.'); }
  const campos = {
    razao_social: $('e-razao').value.trim(), nome_fantasia: $('e-fantasia').value.trim() || null, cnpj: $('e-cnpj').value || null,
    regime: $('e-regime-sel').value, municipio: $('e-municipio').value.trim() || null, uf: $('e-uf').value.trim().toUpperCase() || null,
    plano: $('e-plano').value.trim() || null, inicio_atendimento: $('e-inicio').value || null, ativo: $('e-ativo').checked
  };
  const trocouRegime = campos.regime !== aberta.regime;
  const { error } = await banco.from('empresa').update(campos).eq('id', aberta.id);
  if (error) return avisa(error.code === '23505' ? 'Já existe uma empresa com esse CNPJ.' : 'Não deu para salvar.');
  Object.assign(aberta, campos);
  $('e-titulo').textContent = campos.nome_fantasia || campos.razao_social;
  $('e-regime').textContent = REGIMES[campos.regime] + (aberta.teste ? ' · empresa de teste' : '');
  avisa(trocouRegime ? 'Salvo. As obrigações foram ajustadas para o regime novo.' : 'Salvo.');
  if (trocouRegime) carregaFicha(aberta.id);
};

$('e-resp').addEventListener('change', async ev => {
  const s = ev.target.closest('select'); if (!s || !aberta) return;
  const area = s.dataset.area;
  const { error } = s.value
    ? await banco.from('empresa_responsavel').upsert({ empresa_id: aberta.id, area, pessoa_id: s.value })
    : await banco.from('empresa_responsavel').delete().eq('empresa_id', aberta.id).eq('area', area);
  if (error) return avisa('Não deu para salvar o responsável.');
  if (s.value) aberta.responsaveis[area] = { id: s.value, nome: s.selectedOptions[0].text }; else delete aberta.responsaveis[area];
  avisa(`Responsável de ${AREAS[area]} salvo.`);
});

$('e-obrig').addEventListener('change', async ev => {
  const c = ev.target.closest('input[data-cod]'); if (!c || !aberta) return;
  const { error } = await banco.from('empresa_obrigacao').upsert({ empresa_id: aberta.id, obrigacao: c.dataset.cod, ativa: c.checked });
  if (error) { c.checked = !c.checked; return avisa('Não deu para mudar a obrigação.'); }
  c.closest('.obrig__i').classList.toggle('is-on', c.checked);
  avisa(c.checked ? 'Ligada: entra no calendário do próximo mês.' : 'Desligada: o calendário não gera mais esta tarefa.');
});

// ===== checklist: copiar pro WhatsApp e ver/copiar o e-mail =====
let checklist = null;
$('e-whats').onclick = async () => {
  if (!checklist) return;
  await navigator.clipboard.writeText(checklistWhats(checklist));
  avisa('Mensagem copiada. É só colar no WhatsApp do cliente.');
};
$('e-email').onclick = () => { if (!checklist) return; $('email-corpo').innerHTML = checklistEmail(checklist); $('dlg-email').showModal(); };
$('email-fecha').onclick = () => $('dlg-email').close();
$('email-copia').onclick = async () => {
  const html = checklistEmail(checklist);
  await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([checklistWhats(checklist)], { type: 'text/plain' }) })]);
  $('email-copia').textContent = 'Copiado: cole no Gmail';
  setTimeout(() => { $('email-copia').textContent = 'Copiar e-mail'; }, 3000);
};

// ===== nova empresa =====
$('nova-e').onclick = () => { $('f-nova-e').reset(); $('n-erro').textContent = ''; $('dlg-e').showModal(); $('n-razao').focus(); };
$('n-cancela').onclick = () => $('dlg-e').close();
$('f-nova-e').addEventListener('submit', async ev => {
  ev.preventDefault();
  if (!cnpjOk($('n-cnpj').value)) { $('n-erro').textContent = 'CNPJ inválido: confira os números.'; return $('n-cnpj').focus(); }
  const { data, error } = await banco.from('empresa').insert({
    razao_social: $('n-razao').value.trim(), nome_fantasia: $('n-fantasia').value.trim() || null, cnpj: $('n-cnpj').value || null,
    regime: $('n-regime').value, municipio: $('n-municipio').value.trim() || null, uf: $('n-uf').value.trim().toUpperCase() || null
  }).select('id').single();
  if (error) { $('n-erro').textContent = error.code === '23505' ? 'Já existe uma empresa com esse CNPJ.' : 'Não deu para criar.'; return; }
  $('dlg-e').close(); avisa('Empresa criada com as obrigações do regime.');
  await carrega(); abre(data.id);
});

await carrega();
if (location.hash.length > 1) abre(location.hash.slice(1));
document.body.classList.remove('carregando');
