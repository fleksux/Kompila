// Sistema Coleve · transferências de responsabilidade técnica (pedido do Manu, 28/10/2026)
// Contador anterior → Coleve → novo contador: checklist das 10 categorias com arquivo e conferência, certificado e histórico.
import { banco, quemSou } from '../../conexao.js?v=2';
import { baixar } from '../../documentos.js?v=3';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../../entrar/'); throw 0; }
const P = eu.pessoa;
if (P.area === 'marketing' && !['admin', 'gestor'].includes(P.papel)) { location.replace('../../'); throw 0; }

const ETAPAS = [
  ['iniciada', 'Solicitação iniciada', 'Transferência cadastrada'],
  ['aguardando', 'Aguardando envio', 'Contador anterior ainda não enviou tudo'],
  ['parcial', 'Recebimento parcial', 'Existem documentos faltantes'],
  ['conferencia', 'Em conferência', 'Equipe técnica verificando os arquivos'],
  ['pendencias', 'Com pendências', 'Precisa de complemento ou correção'],
  ['aprovada', 'Aprovada tecnicamente', 'Documentação conferida'],
  ['concluida', 'Concluída', 'Transição formalizada e responsabilidades registradas']
];
const NOME_ET = Object.fromEntries(ETAPAS.map(([k, n]) => [k, n]));
const COR_ET = { iniciada: 'st--env', aguardando: 'st--novo', parcial: 'st--novo', conferencia: 'st--env', pendencias: 'st--atraso', aprovada: 'st--lido', concluida: 'st--lido' };
const ST_ITEM = { pendente: ['falta', 'st--novo'], recebido: ['recebido', 'st--env'], conferencia: ['em conferência', 'st--env'], aprovado: ['aprovado', 'st--lido'], recusado: ['recusado', 'st--atraso'], substituido: ['substituído', 'st--novo'] };
const LINK_BASE = new URL('../../../envio-contador/?t=', location.href).href;

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? d.slice(0, 10).split('-').reverse().join('/') : '';
const horaBR = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 4000); };
const rota = t => t.sentido === 'entrada' ? `${t.contador_origem || 'Contador anterior'} → Coleve` : `Coleve → ${t.contador_destino || 'novo contador'}`;

$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../../entrar/'); };

const [{ data: equipe }, { data: empresas }, { data: cats }] = await Promise.all([
  banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia').order('razao_social'),
  banco.from('transf_categoria').select('*').eq('ativo', true).order('ordem')
]);
const pessoas = new Map((equipe || []).map(p => [p.id, p.nome]));
['n-resp', 'd-resp'].forEach(id => (equipe || []).forEach(p => $(id).insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`)));
(empresas || []).forEach(e => $('n-empresa').insertAdjacentHTML('beforeend', `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`));
const CAT = new Map((cats || []).map(c => [c.codigo, c]));

// ===== termo de conclusão (?termo=<id>): versão para imprimir =====
const termoId = new URLSearchParams(location.search).get('termo');
if (termoId) { await mostraTermo(termoId); document.body.classList.remove('carregando'); throw 0; }

// ===== painel =====
let lista = [];
async function carrega() {
  const { data, error } = await banco.from('v_transferencia').select('*').order('criado_em', { ascending: false });
  if (error) return avisa('Não deu para carregar as transferências.');
  lista = data || [];
  const abertas = lista.filter(t => t.etapa !== 'concluida');
  $('numeros').innerHTML =
    `<div class="num"><strong>${abertas.length}</strong><span>em andamento</span></div>` +
    `<div class="num"><strong>${abertas.filter(t => t.etapa === 'pendencias' || t.recusados).length}</strong><span>com pendências</span></div>` +
    `<div class="num"><strong>${lista.length - abertas.length}</strong><span>concluídas</span></div>`;
  $('total').textContent = `· ${abertas.length}`;
  const { data: al } = await banco.from('v_transf_alerta').select('*').order('dias');
  $('alertas').hidden = !(al || []).length;
  $('alertas').innerHTML = (al || []).map(a => `<button type="button" class="tt-al tt-al--${a.dias < 0 ? 'atraso' : 'perto'}" ${a.transferencia_id ? `data-id="${a.transferencia_id}"` : ''}>
    <b>${esc(a.empresa_nome)}</b><span>${esc(a.mensagem)}</span><small>${a.tipo === 'certificado' ? 'Certificado digital' : 'Prazo da transferência'} · ${dataBR(a.data_ref)}</small></button>`).join('');
  $('lista').innerHTML = lista.map(t => `
    <button type="button" class="emp${t.etapa === 'concluida' ? ' emp--off' : ''}" data-id="${t.id}">
      <span class="emp__topo"><span class="ico ico--${t.sentido}"><svg viewBox="0 0 24 24">${t.sentido === 'entrada' ? '<path d="M4 12h12M11 7l5 5-5 5M20 4v16"/>' : '<path d="M20 12H8M13 7l-5 5 5 5M4 4v16"/>'}</svg></span><em class="st ${COR_ET[t.etapa]}">${NOME_ET[t.etapa]}</em></span>
      <b>${esc(t.empresa_nome)}</b>
      <small>${t.sentido === 'entrada' ? 'Entrada' : 'Saída'} · ${esc(rota(t))}</small>
      <span class="tt-barra" aria-hidden="true"><i style="width:${t.itens ? Math.round(t.aprovados / t.itens * 100) : 0}%"></i></span>
      <span class="emp__pe">
        <span class="emp__n${t.recusados ? ' emp__n--atraso' : ''}">${t.aprovados} de ${t.itens} conferidos${t.recusados ? ` · ${t.recusados} recusado${t.recusados > 1 ? 's' : ''}` : ''}${t.data_prevista ? ' · até ' + dataBR(t.data_prevista).slice(0, 5) : ''}</span>
        <span class="rostos-c">${t.responsavel_nome ? `<span class="mini" title="${esc(t.responsavel_nome)}">${iniciais(t.responsavel_nome)}</span>` : '<span class="mini mini--vazio" title="Sem responsável">+</span>'}</span>
      </span></button>`).join('') || '<p class="fv">Nenhuma transferência ainda. Use "+ Transferência" quando um cliente chegar de outro contador ou sair da Coleve.</p>';
}

// ===== nova =====
$('nova-t').onclick = () => { $('f-nova').reset(); $('n-erro').textContent = ''; $('n-resp').value = P.id; trocaSentido(); $('dlg-t').showModal(); };
$('n-cancela').onclick = () => $('dlg-t').close();
const trocaSentido = () => { const s = $('f-nova').sentido.value; $('n-outro-l').firstChild.textContent = s === 'entrada' ? 'Contador anterior' : 'Novo contador'; };
$('f-nova').addEventListener('change', e => { if (e.target.name === 'sentido') trocaSentido(); });
$('f-nova').addEventListener('submit', async e => {
  e.preventDefault();
  const sentido = $('f-nova').sentido.value, outro = $('n-outro').value.trim() || null;
  const { data, error } = await banco.from('transferencia').insert({
    empresa_id: $('n-empresa').value, sentido, responsavel_id: $('n-resp').value || null, data_prevista: $('n-data').value || null,
    contador_origem: sentido === 'entrada' ? outro : 'Coleve', contador_destino: sentido === 'saida' ? outro : 'Coleve'
  }).select('id').single();
  if (error) { $('n-erro').textContent = 'Não deu para abrir a transferência.'; return; }
  $('dlg-t').close(); avisa('Transferência aberta com o checklist das 10 categorias.');
  await carrega(); abre(data.id);
});

// ===== gaveta =====
let aberta = null, itens = [], docs = [];
$('lista').addEventListener('click', e => { const c = e.target.closest('.emp'); if (c) abre(c.dataset.id); });
$('alertas').addEventListener('click', e => { const c = e.target.closest('[data-id]'); if (c) abre(c.dataset.id); });
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', fecha));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden) fecha(); });
function fecha() { $('gaveta').hidden = true; aberta = null; history.replaceState(null, '', location.pathname); carrega(); }

async function abre(id) {
  aberta = lista.find(t => t.id === id); if (!aberta) return;
  history.replaceState(null, '', '#' + id);
  $('gaveta').hidden = false;
  desenhaTopo();
  $('d-origem').value = aberta.contador_origem || ''; $('d-destino').value = aberta.contador_destino || '';
  $('d-resp').value = aberta.responsavel_id || ''; $('d-data').value = aberta.data_prevista || '';
  $('d-motivo').value = aberta.motivo || ''; $('d-obs').value = aberta.observacoes || '';
  $('t-termo').href = '?termo=' + id;
  await carregaItens(); carregaCert(); carregaHist(); carregaLinks();
}
function desenhaTopo() {
  const t = aberta;
  $('t-sentido').textContent = (t.sentido === 'entrada' ? 'Entrada' : 'Saída') + (t.cnpj ? ' · ' + t.cnpj : '');
  $('t-titulo').textContent = t.empresa_nome;
  $('t-rota').textContent = rota(t) + (t.data_prevista ? ' · prevista para ' + dataBR(t.data_prevista) : '');
  const i = ETAPAS.findIndex(([k]) => k === t.etapa);
  $('t-etapas').innerHTML = ETAPAS.map(([k, n, d], j) => `<li class="${j < i ? 'ok' : j === i ? 'agora' : ''}${k === 'pendencias' && k !== t.etapa ? ' opc' : ''}" title="${esc(d)}"><span>${j < i ? '✓' : j + 1}</span>${n}</li>`).join('');
  $('t-acoes').innerHTML = t.etapa === 'concluida'
    ? `<p class="h3-dica" style="margin:0">Concluída em ${horaBR(t.concluida_em)}. <button type="button" class="link-b" data-et="aprovada">Reabrir</button></p>`
    : `${['parcial', 'aguardando', 'iniciada'].includes(t.etapa) ? '<button type="button" class="sair" data-et="conferencia">Marcar em conferência</button>' : ''}
       ${t.etapa === 'aprovada' ? '<button type="button" class="btn-a" data-et="concluida">Concluir transferência</button>' : ''}`;
}
$('t-acoes').addEventListener('click', async e => {
  const b = e.target.closest('[data-et]'); if (!b || !aberta) return;
  if (b.dataset.et === 'concluida' && aberta.etapa !== 'aprovada' && !confirm('Ainda há categorias sem aprovação. Concluir mesmo assim? As pendências ficam registradas no histórico.')) return;
  const { error } = await banco.from('transferencia').update({ etapa: b.dataset.et }).eq('id', aberta.id);
  if (error) return avisa('Não deu para mudar a etapa.');
  await recarregaAberta(); avisa(b.dataset.et === 'concluida' ? 'Transferência concluída.' : 'Etapa atualizada.');
});
async function recarregaAberta() {
  const { data } = await banco.from('v_transferencia').select('*').eq('id', aberta.id).single();
  if (data) { aberta = data; const k = lista.findIndex(t => t.id === data.id); if (k >= 0) lista[k] = data; }
  desenhaTopo(); carregaHist(); carrega();
}

// checklist: cada arquivo tem protocolo, competência, quem mandou e o próprio status
let recs = [];
async function carregaItens() {
  const { data: its } = await banco.from('transf_item').select('*').eq('transferencia_id', aberta.id);
  itens = (its || []).sort((a, b) => (CAT.get(a.categoria)?.ordem || 0) - (CAT.get(b.categoria)?.ordem || 0));
  const ids = itens.map(i => i.id);
  const [{ data: ds }, { data: rs }] = await Promise.all([
    banco.from('documento').select('id,nome,transf_item_id,criado_em,enviado_por,competencia,mime').in('transf_item_id', ids).order('criado_em'),
    banco.from('transf_recebimento').select('*').in('transf_item_id', ids).order('recebido_em')
  ]);
  docs = ds || []; recs = rs || [];
  desenhaItens();
}
const compBR = c => c ? c.slice(0, 7).split('-').reverse().join('/') : '';
const quemMandou = r => r.origem === 'contador' ? `${esc(r.remetente_nome || 'Contador anterior')} (contador)` : esc((pessoas.get(r.enviado_por) || 'Equipe').split(' ')[0]);
function desenhaItens() {
  const ok = itens.filter(i => i.status === 'aprovado').length;
  $('t-check-n').textContent = `${ok} de ${itens.length} conferidas`;
  $('t-check').innerHTML = itens.map(i => {
    const c = CAT.get(i.categoria) || { nome: i.categoria, grupo: '' };
    const [st, cor] = ST_ITEM[i.status];
    const arqs = recs.filter(r => r.transf_item_id === i.id).map(r => ({ r, d: docs.find(d => d.id === r.documento_id) || {} }));
    const abertos = arqs.filter(({ r }) => ['recebido', 'conferencia'].includes(r.status)).length;
    return `<li class="tt-i tt-i--${i.status}" data-i="${i.id}">
      <div class="tt-i__topo"><span class="tt-i__t"><b>${esc(c.nome)}</b><small>${esc(c.grupo)}${arqs.length ? ` · ${arqs.length} arquivo${arqs.length > 1 ? 's' : ''}` : ''}</small></span><em class="st ${cor}">${st}</em>${arqs.length ? '' : `<label class="sair tt-anexa">Anexar<input type="file" multiple hidden data-anexa="${i.id}"></label>`}</div>
      ${i.status === 'recusado' && i.motivo_recusa ? `<p class="tt-i__motivo">Recusado: ${esc(i.motivo_recusa)}</p>` : ''}
      ${i.status === 'aprovado' && i.conferido_por ? `<p class="tt-i__ok">Conferido por ${esc((pessoas.get(i.conferido_por) || '').split(' ')[0])} em ${horaBR(i.conferido_em)}</p>` : ''}
      ${arqs.length ? `<ul class="tt-arqs">${arqs.map(({ r, d }) => `<li class="tt-arq tt-arq--${r.status}">
          <span class="tt-arq__t"><button type="button" class="link-b" data-baixa="${d.id}">${esc(d.nome || 'arquivo')}</button>
            <small>${esc(r.protocolo)} · ${horaBR(r.recebido_em)} · ${quemMandou(r)}${d.competencia ? ' · competência ' + compBR(d.competencia) : ''}${r.status === 'recusado' && r.motivo_recusa ? ' · recusado: ' + esc(r.motivo_recusa) : ''}</small></span>
          <em class="st ${ST_ITEM[r.status]?.[1] || ''}">${ST_ITEM[r.status]?.[0] || r.status}</em>
          <span class="tt-arq__ac">
            ${r.status === 'recebido' ? `<button type="button" class="link-b" data-rst="conferencia" data-r="${r.id}">Conferir</button>` : ''}
            ${['recebido', 'conferencia'].includes(r.status) ? `<button type="button" class="link-b" data-recusa="${r.id}">Recusar</button><button type="button" class="link-b" data-rst="aprovado" data-r="${r.id}">Aprovar</button>` : ''}
            ${['aprovado', 'recusado'].includes(r.status) ? `<button type="button" class="link-b" data-rst="recebido" data-r="${r.id}">Desfazer</button>` : ''}
          </span>
          <form class="tt-recusa" data-form="${r.id}" hidden><input placeholder="O que falta ou está errado?" required><button class="btn-a" type="submit">Recusar</button></form>
        </li>`).join('')}</ul>` : ''}
      ${arqs.length ? `<div class="tt-i__acoes">
        <label class="sair tt-anexa">Anexar mais<input type="file" multiple hidden data-anexa="${i.id}"></label>
        ${abertos > 1 ? `<button type="button" class="btn-a" data-aprova-tudo="${i.id}">Aprovar os ${abertos}</button>` : ''}
      </div>` : ''}
    </li>`;
  }).join('');
  desenhaPedido();
}
function desenhaPedido() {
  const faltam = itens.filter(i => ['pendente', 'recusado'].includes(i.status));
  $('t-pede-n').textContent = faltam.length ? `${faltam.length} categoria${faltam.length > 1 ? 's' : ''} faltando` : 'nada faltando';
  $('t-pede-txt').textContent = faltam.length ? textoPedido(faltam) : 'Tudo recebido. Quando a conferência terminar, conclua a transferência.';
  $('t-copia').disabled = !faltam.length;
}
const linkAtivo = () => links.find(l => !l.revogado_em && new Date(l.validade) > new Date());
const textoPedido = faltam => [
  `Olá! Somos a Coleve Contabilidade e vamos assumir a contabilidade da ${aberta.empresa_nome}${aberta.cnpj ? ' (CNPJ ' + aberta.cnpj + ')' : ''}.`,
  `Para a transferência técnica, pedimos o envio dos itens abaixo:`,
  ...faltam.map(i => `• ${CAT.get(i.categoria)?.nome}${i.status === 'recusado' && i.motivo_recusa ? ' (correção: ' + i.motivo_recusa + ')' : ''}`),
  ...(linkAtivo() ? [``, `Envie por este link, sem precisar de login (válido até ${dataBR(linkAtivo().validade)}):`, LINK_BASE + linkAtivo().token] : []),
  `Obrigado! Equipe Coleve`
].join('\n');
$('t-copia').onclick = async () => {
  const faltam = itens.filter(i => ['pendente', 'recusado'].includes(i.status));
  await navigator.clipboard.writeText(textoPedido(faltam));
  if (aberta.etapa === 'iniciada') { await banco.from('transferencia').update({ etapa: 'aguardando' }).eq('id', aberta.id); await recarregaAberta(); }
  avisa('Pedido copiado. Cole no e-mail ou WhatsApp do contador anterior.');
};

$('t-check').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.baixa) { try { await baixar(docs.find(d => d.id === b.dataset.baixa)); } catch (er) { avisa(er.message); } return; }
  if (b.dataset.recusa) { const f = $('t-check').querySelector(`[data-form="${b.dataset.recusa}"]`); f.hidden = false; f.querySelector('input').focus(); return; }
  if (b.dataset.rst) return mudaRec([b.dataset.r], { status: b.dataset.rst });
  if (b.dataset.aprovaTudo) return mudaRec(recs.filter(r => r.transf_item_id === b.dataset.aprovaTudo && ['recebido', 'conferencia'].includes(r.status)).map(r => r.id), { status: 'aprovado' });
});
$('t-check').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target.closest('[data-form]'); if (!f) return;
  mudaRec([f.dataset.form], { status: 'recusado', motivo_recusa: f.querySelector('input').value.trim() });
});
async function mudaRec(ids, campos) {
  if (!ids.length) return;
  const { error } = await banco.from('transf_recebimento').update(campos).in('id', ids);
  if (error) return avisa('Não deu para salvar.');
  await carregaItens(); await recarregaAberta();
}

// link externo do contador anterior: token com validade, revogável
let links = [];
async function carregaLinks() {
  const { data } = await banco.from('transf_link').select('*').eq('transferencia_id', aberta.id).order('criado_em', { ascending: false });
  links = data || [];
  const agora = new Date();
  $('t-links').innerHTML = links.map(l => {
    const vencido = new Date(l.validade) <= agora, st = l.revogado_em ? ['revogado', 'st--atraso'] : vencido ? ['vencido', 'st--novo'] : ['ativo', 'st--lido'];
    return `<li><span class="d-docs__t"><b>${esc(l.destinatario || 'Contador anterior')}</b><small>até ${dataBR(l.validade)} · ${l.envios} envio${l.envios === 1 ? '' : 's'}${l.ultimo_uso_em ? ' · último ' + horaBR(l.ultimo_uso_em) : ''}</small></span>
      <em class="st ${st[1]}">${st[0]}</em>
      ${st[0] === 'ativo' ? `<button type="button" class="link-b" data-copia-link="${l.token}">Copiar link</button><button type="button" class="link-b" data-revoga-link="${l.id}">Revogar</button>` : ''}</li>`;
  }).join('') || '<li class="vazio">Nenhum link gerado.</li>';
  if (aberta.sentido !== 'entrada') $('f-link').hidden = true; else $('f-link').hidden = false;
  if (!$('l-dest').value) $('l-dest').value = aberta.contador_origem || '';
  desenhaPedido();
}
$('f-link').addEventListener('submit', async e => {
  e.preventDefault();
  const validade = new Date(Date.now() + (+$('l-dias').value) * 864e5).toISOString();
  const { data, error } = await banco.from('transf_link').insert({ transferencia_id: aberta.id, destinatario: $('l-dest').value.trim() || null, validade }).select('token').single();
  if (error) return avisa('Não deu para gerar o link.');
  await navigator.clipboard.writeText(LINK_BASE + data.token).catch(() => {});
  if (aberta.etapa === 'iniciada') { await banco.from('transferencia').update({ etapa: 'aguardando' }).eq('id', aberta.id); await recarregaAberta(); }
  await carregaLinks(); avisa('Link gerado e copiado. Mande para o contador anterior.');
});
$('t-links').addEventListener('click', async e => {
  const c = e.target.closest('[data-copia-link]');
  if (c) { await navigator.clipboard.writeText(LINK_BASE + c.dataset.copiaLink); return avisa('Link copiado.'); }
  const r = e.target.closest('[data-revoga-link]');
  if (r && confirm('Revogar este link? O contador não consegue mais enviar por ele.')) {
    await banco.from('transf_link').update({ revogado_em: new Date().toISOString(), revogado_por: P.id }).eq('id', r.dataset.revogaLink);
    carregaLinks(); avisa('Link revogado.');
  }
});

// ficha de transferência: resumo pronto para colar (e-mail, WhatsApp, Drive)
$('t-ficha').onclick = async () => {
  const t = aberta;
  const { data: cs } = await banco.from('certificado').select('titular,tipo,validade').eq('empresa_id', t.empresa_id).is('revogado_em', null);
  const txt = [
    `FICHA DE TRANSFERÊNCIA TÉCNICA · COLEVE`,
    `Empresa: ${t.empresa_nome}${t.cnpj ? ' · CNPJ ' + t.cnpj : ''}`,
    `Sentido: ${t.sentido === 'entrada' ? 'Entrada' : 'Saída'} (${rota(t)})`,
    `Responsável na Coleve: ${t.responsavel_nome || 'A definir'}`,
    `Data prevista: ${dataBR(t.data_prevista) || 'A definir'} · Etapa: ${NOME_ET[t.etapa]}`,
    `Motivo: ${t.motivo || '-'}`,
    ``,
    `Checklist (${itens.filter(i => i.status === 'aprovado').length} de ${itens.length} aprovadas):`,
    ...itens.map(i => { const n = recs.filter(r => r.transf_item_id === i.id && r.status !== 'substituido').length; return `• ${CAT.get(i.categoria)?.nome}: ${ST_ITEM[i.status][0]}${n ? ` (${n} arquivo${n > 1 ? 's' : ''})` : ''}${i.status === 'recusado' && i.motivo_recusa ? ' · ' + i.motivo_recusa : ''}`; }),
    ``,
    `Certificado digital: ${(cs || []).map(c => `${c.titular} ${c.tipo} até ${dataBR(c.validade)}`).join('; ') || 'nenhum registrado'}`,
    ...(t.observacoes ? [``, `Observações: ${t.observacoes}`] : []),
    ...(linkAtivo() ? [``, `Link de envio do contador: ${LINK_BASE + linkAtivo().token}`] : [])
  ].join('\n');
  await navigator.clipboard.writeText(txt);
  avisa('Ficha copiada.');
};

// anexar: direto do navegador pro Drive (pasta Transferência técnica/<categoria> da empresa), sem link público
$('t-check').addEventListener('change', async e => {
  const inp = e.target.closest('[data-anexa]'); if (!inp || !inp.files.length) return;
  const item = inp.dataset.anexa, fs = [...inp.files]; inp.value = '';
  try {
    for (const [k, f] of fs.entries()) {
      avisa(`Enviando ${k + 1} de ${fs.length}: ${f.name}`);
      const { data: ab, error } = await banco.functions.invoke('documento', { body: { acao: 'enviar_transferencia', item_id: item, nome: f.name, tipo: f.type || 'application/octet-stream', tamanho: f.size } });
      if (error || ab?.erro) throw new Error(ab?.erro || error.message);
      const r = await fetch(ab.envio, { method: 'PUT', body: f });
      if (!r.ok) throw new Error('Drive ' + r.status);
      const up = await r.json();
      const { error: e2 } = await banco.from('documento').insert({ empresa_id: ab.empresa_id, nome: f.name, tipo: 'transferencia', arquivo: 'drive:' + up.id,
        mime: f.type || null, tamanho: f.size, transf_item_id: item, enviado_por: P.id, visivel_cliente: false });
      if (e2) throw e2;
    }
    avisa(fs.length > 1 ? `${fs.length} arquivos recebidos.` : 'Arquivo recebido.');
  } catch (er) { avisa('Não deu para enviar: ' + er.message); }
  await carregaItens(); await recarregaAberta();
});

// certificado: controle de validade e uso (nunca senha nem arquivo)
async function carregaCert() {
  const { data } = await banco.from('certificado').select('*').eq('empresa_id', aberta.empresa_id).is('revogado_em', null).order('validade');
  const hoje = new Date(new Date().toISOString().slice(0, 10));
  $('t-cert').innerHTML = (data || []).map(c => {
    const dias = Math.round((new Date(c.validade) - hoje) / 864e5);
    const st = dias < 0 ? '<em class="st st--atraso">vencido</em>' : dias <= 30 ? `<em class="st st--novo">vence em ${dias} dia${dias === 1 ? '' : 's'}</em>` : '<em class="st st--lido">válido</em>';
    return `<li><span class="d-docs__t"><b>${esc(c.titular)} · ${c.tipo}</b><small>até ${dataBR(c.validade)}${c.quem_pode_usar ? ' · usa: ' + esc(c.quem_pode_usar) : ''}${c.finalidade ? ' · ' + esc(c.finalidade) : ''}</small></span>${st}<button type="button" class="link-b" data-revoga="${c.id}">Revogar</button></li>`;
  }).join('') || '<li class="vazio">Nenhum certificado registrado para esta empresa.</li>';
}
$('f-cert').addEventListener('submit', async e => {
  e.preventDefault();
  const { error } = await banco.from('certificado').insert({ empresa_id: aberta.empresa_id, titular: $('c-titular').value.trim(), tipo: $('c-tipo').value,
    validade: $('c-validade').value, quem_pode_usar: $('c-quem').value.trim() || null, finalidade: $('c-final').value.trim() || null });
  if (error) return avisa('Não deu para salvar o certificado.');
  $('f-cert').reset(); carregaCert(); avisa('Certificado registrado.');
});
$('t-cert').addEventListener('click', async e => {
  const b = e.target.closest('[data-revoga]'); if (!b) return;
  if (!confirm('Revogar este certificado? Ele sai da lista e fica registrado como revogado hoje.')) return;
  await banco.from('certificado').update({ revogado_em: new Date().toISOString().slice(0, 10) }).eq('id', b.dataset.revoga);
  carregaCert();
});

// dados
$('f-dados').addEventListener('submit', async e => {
  e.preventDefault();
  const campos = { contador_origem: $('d-origem').value.trim() || null, contador_destino: $('d-destino').value.trim() || null, responsavel_id: $('d-resp').value || null,
    data_prevista: $('d-data').value || null, motivo: $('d-motivo').value.trim() || null, observacoes: $('d-obs').value.trim() || null };
  const { error } = await banco.from('transferencia').update(campos).eq('id', aberta.id);
  if (error) return avisa('Não deu para salvar.');
  await recarregaAberta(); avisa('Salvo.');
});

// histórico (trilha de auditoria)
async function carregaHist() {
  const { data } = await banco.from('historico').select('acao,detalhe,pessoa_id,criado_em').eq('empresa_id', aberta.empresa_id).like('acao', 'transferencia%').order('criado_em', { ascending: false }).limit(40);
  const meus = (data || []).filter(h => h.detalhe?.transferencia === aberta.id).slice(0, 12);
  const quem = h => esc((pessoas.get(h.pessoa_id) || 'Sistema').split(' ')[0]);
  $('t-hist').innerHTML = meus.map(h => {
    const d = h.detalhe || {};
    const txt = h.acao === 'transferencia_aberta' ? 'abriu a transferência'
      : h.acao === 'transferencia_etapa' ? `mudou a etapa para ${NOME_ET[d.para] || d.para}`
      : `${CAT.get(d.categoria)?.nome || d.categoria}: ${ST_ITEM[d.para]?.[0] || d.para}${d.motivo && d.para === 'recusado' ? ' (' + esc(d.motivo) + ')' : ''}`;
    return `<li><b>${quem(h)}</b> ${txt} <small>${horaBR(h.criado_em)}</small></li>`;
  }).join('') || '<li>Nada registrado ainda.</li>';
}

// termo de conclusão: responsáveis, checklist com protocolos e pendências
async function mostraTermo(id) {
  document.querySelector('.barra').hidden = true; document.querySelector('main').hidden = true; document.body.classList.add('modo-doc');
  const el = $('termo'); el.hidden = false;
  const { data: t } = await banco.from('v_transferencia').select('*').eq('id', id).maybeSingle();
  if (!t) { el.innerHTML = '<p>Transferência não encontrada.</p>'; return; }
  const { data: its } = await banco.from('transf_item').select('*').eq('transferencia_id', id);
  const ids = (its || []).map(i => i.id);
  const [{ data: rs }, { data: cs }] = await Promise.all([
    banco.from('transf_recebimento').select('*').in('transf_item_id', ids).neq('status', 'substituido').order('recebido_em'),
    banco.from('certificado').select('*').eq('empresa_id', t.empresa_id).is('revogado_em', null)
  ]);
  const itensT = (its || []).sort((a, b) => (CAT.get(a.categoria)?.ordem || 0) - (CAT.get(b.categoria)?.ordem || 0));
  const nome = pid => esc(pessoas.get(pid) || '-');
  const conferentes = [...new Set([...(its || []).map(i => i.conferido_por), ...(rs || []).map(r => r.conferido_por)].filter(Boolean))].map(nome);
  const remetentes = [...new Set((rs || []).filter(r => r.origem === 'contador').map(r => r.remetente_nome).filter(Boolean))].map(esc);
  const pend = itensT.filter(i => i.status !== 'aprovado');
  document.title = 'Termo de conclusão · ' + t.empresa_nome;
  el.innerHTML = `
    <div class="tt-doc__barra"><button type="button" class="btn-a" onclick="print()">Salvar PDF</button></div>
    <header class="tt-doc__topo"><img src="../../../img/logo_contabilidade.svg" alt="Coleve contabilidade"><address>Travessa Dona Paula, 13 · Higienópolis, São Paulo<br>www.coleve.com.br</address></header>
    <h1>Termo de conclusão da transferência de responsabilidade técnica</h1>
    <dl class="tt-doc__info">
      <div><dt>Empresa</dt><dd>${esc(t.empresa_nome)}${t.cnpj ? '<br>CNPJ ' + esc(t.cnpj) : ''}</dd></div>
      <div><dt>Sentido</dt><dd>${t.sentido === 'entrada' ? 'Entrada' : 'Saída'} · ${esc(rota(t))}</dd></div>
      <div><dt>Aberta em</dt><dd>${dataBR(t.criado_em)}</dd></div>
      <div><dt>Concluída em</dt><dd>${t.concluida_em ? dataBR(t.concluida_em) : 'A definir'}</dd></div>
    </dl>
    <h2>Responsáveis</h2>
    <table><tr><th>Papel</th><th>Nome</th></tr>
      <tr><td>Responsável técnico na Coleve</td><td>${esc(t.responsavel_nome || 'A definir')}</td></tr>
      <tr><td>Contador ${t.sentido === 'entrada' ? 'anterior' : 'sucessor'}</td><td>${esc((t.sentido === 'entrada' ? t.contador_origem : t.contador_destino) || 'A definir')}${remetentes.length ? ' (enviado por ' + remetentes.join(', ') + ')' : ''}</td></tr>
      <tr><td>Conferência dos documentos</td><td>${conferentes.join(', ') || 'A definir'}</td></tr></table>
    <h2>Checklist documental</h2>
    <table><tr><th>Categoria</th><th>Status</th><th>Protocolos</th><th>Conferido por</th></tr>
      ${itensT.map(i => { const rr = (rs || []).filter(r => r.transf_item_id === i.id); return `<tr><td>${esc(CAT.get(i.categoria)?.nome || i.categoria)}</td><td>${ST_ITEM[i.status][0]}</td><td>${rr.map(r => esc(r.protocolo) + ' (' + dataBR(r.recebido_em) + ')').join('<br>') || '-'}</td><td>${i.conferido_por ? nome(i.conferido_por) + ' · ' + dataBR(i.conferido_em) : '-'}</td></tr>`; }).join('')}</table>
    <h2>Pendências</h2>
    ${pend.length || t.observacoes ? `<ul>${pend.map(i => `<li>${esc(CAT.get(i.categoria)?.nome)}: ${ST_ITEM[i.status][0]}${i.motivo_recusa ? ' · ' + esc(i.motivo_recusa) : ''}</li>`).join('')}${t.observacoes ? `<li>${esc(t.observacoes)}</li>` : ''}</ul>` : '<p>Nenhuma pendência. Toda a documentação foi conferida e aprovada.</p>'}
    <h2>Certificado digital</h2>
    <p>${(cs || []).map(c => `${esc(c.titular)} · ${c.tipo} · válido até ${dataBR(c.validade)}${c.quem_pode_usar ? ' · uso: ' + esc(c.quem_pode_usar) : ''}`).join('<br>') || 'Nenhum certificado registrado.'}</p>
    <p class="tt-doc__decl">Declaramos concluída a transferência de responsabilidade técnica da empresa acima, com os documentos e as pendências registrados neste termo. A partir de ${t.concluida_em ? dataBR(t.concluida_em) : '____/____/______'} a responsabilidade técnica passa ${t.sentido === 'entrada' ? 'à Coleve Contabilidade' : 'ao contador sucessor'}.</p>
    <div class="tt-doc__ass"><div>${esc(t.responsavel_nome || '')}<small>Coleve Contabilidade</small></div><div>${esc((t.sentido === 'entrada' ? t.contador_origem : t.contador_destino) || '')}<small>Contador ${t.sentido === 'entrada' ? 'anterior' : 'sucessor'}</small></div><div>${esc(t.empresa_nome)}<small>Cliente</small></div></div>`;
}

// tempo real: outra pessoa mexeu no checklist ou na etapa
banco.channel('coleve-transf')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'transf_item' }, ({ new: n }) => { if (aberta && n?.transferencia_id === aberta.id) { carregaItens(); recarregaAberta(); } })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'transferencia' }, () => { if (!aberta) carrega(); })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'transf_recebimento' }, () => { if (aberta) carregaItens(); })
  .subscribe();

await carrega();
const alvo = location.hash.slice(1);
if (alvo && lista.some(t => t.id === alvo)) await abre(alvo);
document.body.classList.remove('carregando');
