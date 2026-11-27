// Sistema Coleve · Área do cliente: fazer um pedido e acompanhar o andamento (27/11/2026).
// O pedido passa pela função abrir_pedido (confere a empresa, cria a tarefa na área certa e avisa a equipe).
// Segunda via que já existe volta na hora com o documento. Anexo vai pro Drive da empresa (função documento).
import { banco, quemSou } from '../conexao.js?v=2';
import { baixar } from '../documentos.js?v=3';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo) { location.replace('../../entrar/'); throw 0; }
const p = eu.pessoa;
if (p.tipo === 'equipe') { location.replace('./'); throw 0; }

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dBR = d => d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '';
const mesBR = d => d ? d.slice(5, 7) + '/' + d.slice(0, 4) : '';
const hojeISO = new Date().toISOString().slice(0, 10);
const aviso = t => { $('aviso').textContent = t; clearTimeout(aviso.t); aviso.t = setTimeout(() => { $('aviso').textContent = ''; }, 4000); };
const ST = { 'Recebido': 'a_fazer', 'Em andamento': 'fazendo', 'Em conferência': 'conferencia', 'Pronto': 'pronto', 'Enviado': 'enviado', 'Cancelado': 'cancelado' };
const PASSOS = ['Recebido', 'Em andamento', 'Em conferência', 'Pronto', 'Enviado'];
const GRUPOS = { segunda_via: 'Segunda via de guia', certidao: 'Certidões', declaracao: 'Declarações', paralegal: 'Contrato e empresa', dp: 'Funcionários', fiscal: 'Notas fiscais', reuniao: 'Conversar com a Coleve', outro: 'Outro' };

$('nome').textContent = p.nome;
$('avatar').textContent = p.nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

// ===== abas (o endereço guarda a aba: cliente.html#andamento) =====
const abre = aba => {
  for (const b of document.querySelectorAll('[data-aba]')) b.setAttribute('aria-selected', String(b.dataset.aba === aba));
  $('pedir').hidden = aba !== 'pedir'; $('andamento').hidden = aba !== 'andamento';
  $('titulo').textContent = aba === 'pedir' ? 'Fazer um pedido' : 'Andamento';
  if (location.hash.slice(1) !== aba) history.replaceState(null, '', '#' + aba);
};
document.querySelectorAll('[data-aba]').forEach(b => b.onclick = () => abre(b.dataset.aba));
addEventListener('hashchange', () => abre(location.hash === '#andamento' ? 'andamento' : 'pedir'));

// ===== dados =====
const [{ data: emps }, { data: tipos }] = await Promise.all([
  banco.from('empresa').select('id,nome_fantasia,razao_social').order('razao_social'),
  banco.from('pedido_tipo').select('*').eq('ativo', true).order('ordem')
]);
const E = emps || [], T = tipos || [];
if (E.length > 1) {
  $('campo-emp').hidden = false;
  $('emp').innerHTML = E.map(e => `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`).join('');
} else if (E.length === 1) {
  $('emp').innerHTML = `<option value="${E[0].id}"></option>`;
}

// ===== formulário =====
const porGrupo = {};
T.forEach(t => (porGrupo[t.grupo] ||= []).push(t));
$('tipos').innerHTML = Object.keys(GRUPOS).filter(g => porGrupo[g]).map(g =>
  `<p class="pd-grupo-t">${GRUPOS[g]}</p><div class="pd-tipos">${porGrupo[g].map(t =>
    `<label class="pd-tipo"><input type="radio" name="tipo" value="${t.codigo}"><span><b>${esc(t.nome)}</b>${t.explica ? `<small>${esc(t.explica)}</small>` : ''}</span></label>`).join('')}</div>`).join('');

const mesPassado = (() => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();
$('mes').value = mesPassado;
$('mes').max = hojeISO.slice(0, 7);
const tipoAtual = () => T.find(t => t.codigo === document.querySelector('input[name=tipo]:checked')?.value);
const ajusta = () => {
  const t = tipoAtual();
  $('campo-mes').hidden = !t?.pede_competencia;
  $('arq-obr').textContent = t?.precisa_anexo ? '(obrigatório)' : '(opcional)';
  $('desc-obr').textContent = t?.grupo === 'outro' ? '(obrigatório)' : '(opcional)';
  $('tipo-ajuda').textContent = t?.explica || '';
  $('erro').textContent = '';
};
$('tipos').addEventListener('change', ajusta);
$('arq').onchange = () => { $('arq-nome').textContent = $('arq').files[0]?.name || 'Nenhum arquivo'; };

// manda o arquivo direto do navegador pra pasta da empresa no Drive (Recebidos do cliente)
async function sobeArquivo(empresaId, competencia, arquivo, progresso) {
  const { data, error } = await banco.functions.invoke('documento', { body: { acao: 'enviar_cliente', empresa_id: empresaId, competencia, nome: arquivo.name, tipo: arquivo.type || 'application/octet-stream', tamanho: arquivo.size } });
  if (error || data?.erro || !data?.envio) throw new Error(data?.erro || 'não deu para enviar o arquivo');
  const f = await new Promise((ok, falha) => {
    const x = new XMLHttpRequest();
    x.open('PUT', data.envio);
    x.upload.onprogress = e => progresso?.(e.loaded / e.total);
    x.onload = () => x.status < 300 ? ok(JSON.parse(x.responseText)) : falha(new Error('Drive ' + x.status));
    x.onerror = () => falha(new Error('rede'));
    x.send(arquivo);
  });
  return 'drive:' + f.id;
}

$('form').addEventListener('submit', async ev => {
  ev.preventDefault();
  const t = tipoAtual(), arq = $('arq').files[0], desc = $('desc').value.trim(), empresa = $('emp').value;
  const erro = m => { $('erro').textContent = m; };
  if (!empresa) return erro('Sua empresa ainda está sendo cadastrada pela Coleve.');
  if (!t) return erro('Escolha o que você precisa.');
  if (t.pede_competencia && !$('mes').value) return erro('Diga de qual mês é a guia.');
  if (t.grupo === 'outro' && !desc) return erro('Conte o que você precisa.');
  if (t.precisa_anexo && !arq) return erro('Este pedido precisa de um arquivo anexado.');
  const bt = $('enviar'); bt.disabled = true; erro('');
  const comp = t.pede_competencia ? $('mes').value + '-01' : null;
  try {
    let arquivo = null;
    if (arq) {
      bt.textContent = 'Enviando arquivo';
      arquivo = await sobeArquivo(empresa, comp || hojeISO.slice(0, 8) + '01', arq, x => { bt.textContent = 'Enviando ' + Math.round(x * 100) + '%'; });
    }
    bt.textContent = 'Enviando pedido';
    const { data: r, error } = await banco.rpc('abrir_pedido', {
      p_empresa: empresa, p_tipo: t.codigo, p_descricao: desc || null, p_urgente: $('urgente').checked, p_competencia: comp,
      p_arquivo: arquivo, p_nome_arquivo: arq?.name || null, p_mime: arq?.type || null, p_tamanho: arq?.size || null
    });
    if (error) throw error;
    await mostraResultado(r, t);
    $('form').reset(); $('mes').value = mesPassado; $('arq-nome').textContent = 'Nenhum arquivo'; ajusta();
    await carregaAndamento();
  } catch (e) {
    const m = String(e?.message || 'Não deu para enviar').replace(/\.$/, '');
    erro(m.charAt(0).toUpperCase() + m.slice(1) + '.');
  } finally {
    bt.disabled = false; bt.textContent = 'Enviar pedido';
  }
});

const ICO_OK = '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="m6.5 10.2 2.4 2.4 4.6-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
async function mostraResultado(r, t) {
  const box = $('resultado'); box.hidden = false;
  if (r.resolvido_sozinho) {
    const { data: d } = await banco.from('documento').select('id,nome').eq('id', r.documento_id).maybeSingle();
    box.innerHTML = `<div class="pd-ok">${ICO_OK}<div><b>Essa guia já está pronta</b><p>${esc(d?.nome || t.nome)}. É só baixar.</p>
      <div class="pd-acoes"><button class="ui-btn ui-btn--pri" type="button" id="res-baixar">Baixar</button><button class="ui-btn ui-btn--fan" type="button" id="res-fechar">Fazer outro pedido</button></div></div></div>`;
    $('res-baixar').onclick = async () => { try { await baixar(d); } catch { aviso('Não deu para baixar. Tente de novo.'); } };
  } else {
    const { data: v } = await banco.from('v_pedido').select('prazo,responsavel_nome').eq('id', r.pedido_id).maybeSingle();
    box.innerHTML = `<div class="pd-ok">${ICO_OK}<div><b>Pedido recebido</b><p>${esc(t.nome)}${v?.prazo ? ' · previsão ' + dBR(v.prazo) : ''}${v?.responsavel_nome ? ' · com ' + esc(v.responsavel_nome) : ''}. Você acompanha em Andamento e recebe aviso quando ficar pronto.</p>
      <div class="pd-acoes"><button class="ui-btn" type="button" id="res-ver">Ver andamento</button><button class="ui-btn ui-btn--fan" type="button" id="res-fechar">Fazer outro pedido</button></div></div></div>`;
    $('res-ver').onclick = () => { box.hidden = true; abre('andamento'); };
  }
  $('res-fechar').onclick = () => { box.hidden = true; };
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// atalhos: páginas que outras frentes montam (só links)
const atalho = (t, d, href) => `<a class="mod mod--ativo" href="${href}"><h3>${t}</h3><p>${d}</p><em>Abrir</em></a>`;
$('atalhos').innerHTML =
  atalho('Regularidade fiscal', 'Veja se a empresa está em dia com as certidões.', '../regularidade/cliente.html') +
  atalho('Reuniões', 'Marque e reveja as conversas com o seu contador.', '../reunioes-cliente.html') +
  atalho('Vídeos de boas-vindas', 'Como a Coleve trabalha e como usar a Área do cliente.', '../onboarding/cliente.html');

// ===== andamento =====
let A = [], filtro = 'abertos', aberto = null;
const recente = x => !x.concluido_em || (Date.now() - new Date(x.concluido_em)) < 1000 * 60 * 60 * 24 * 60;
async function carregaAndamento() {
  const { data } = await banco.from('v_andamento').select('*').order('criado_em', { ascending: false }).limit(300);
  A = data || [];
  const n = A.filter(x => !x.encerrado).length;
  $('n-abertos').textContent = n ? ' ' + n : '';
  desenha();
}
function desenha() {
  const L = A.filter(x => filtro === 'abertos' ? !x.encerrado : x.encerrado && recente(x))
    .sort((a, b) => filtro === 'abertos'
      ? (b.urgente - a.urgente) || (b.falta_cliente?.length > 0) - (a.falta_cliente?.length > 0) || (a.prazo || '9').localeCompare(b.prazo || '9')
      : (b.concluido_em || '').localeCompare(a.concluido_em || ''));
  const varias = new Set(L.map(x => x.empresa_id)).size > 1;
  $('lista').innerHTML = L.map(x => {
    const st = ST[x.status_cliente] || 'a_fazer';
    const meta = [x.origem === 'pedido' ? 'Seu pedido' : null, varias ? esc(x.empresa_nome) : null, x.competencia ? 'mês ' + mesBR(x.competencia) : null,
      x.encerrado ? (x.concluido_em ? 'concluído ' + dBR(x.concluido_em.slice(0, 10)) : null)
        : x.prazo ? `<span class="${x.atrasado ? 'pd-atraso' : ''}">previsão ${dBR(x.prazo)}</span>` : null,
      x.responsavel_nome ? 'com ' + esc(x.responsavel_nome) : null].filter(Boolean).join(' · ');
    const falta = x.falta_cliente?.length ? `<small class="pd-falta">Falta você mandar: ${esc(x.falta_cliente.join(', '))}</small>` : '';
    return `<div class="pd-it${aberto === x.id ? ' is-aberto' : ''}" data-id="${x.id}" data-st="${st}">
      <button type="button" class="pd-lin" aria-expanded="${aberto === x.id}"><span class="pd-bol"></span>
        <span class="pd-lin__t"><b>${esc(x.titulo)}</b><small>${meta}</small>${falta}</span>
        <span class="pd-lin__d">${x.urgente && !x.encerrado ? '<span class="pd-urg-s">Urgente</span>' : ''}<span class="pd-st pd-st--cel">${esc(x.status_cliente)}</span></span>
      </button>
      <div class="pd-det" id="det-${x.id}"></div></div>`;
  }).join('') || `<p class="pd-vazio">${filtro === 'abertos' ? 'Nada com a Coleve agora. Quando você fizer um pedido, ele aparece aqui.' : 'Nada concluído nos últimos 60 dias.'}</p>`;
  if (aberto && L.some(x => x.id === aberto)) detalhe(aberto);
}
document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
  filtro = b.dataset.f; aberto = null;
  document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  desenha();
});
$('lista').addEventListener('click', e => {
  const lin = e.target.closest('.pd-lin'); if (!lin) return;
  const id = lin.closest('.pd-it').dataset.id;
  aberto = aberto === id ? null : id;
  desenha();
});

async function detalhe(id) {
  const x = A.find(y => y.id === id), box = $('det-' + id); if (!x || !box) return;
  const i = PASSOS.indexOf(x.status_cliente);
  const passos = x.status_cliente === 'Cancelado' ? '<span>Cancelado</span>'
    : PASSOS.map((s, k) => `<span class="${k <= i ? 'is-feito' : ''}">${s}</span>`).join('<i></i>');
  let conv = '';
  if (x.tarefa_id) {
    const { data: cs } = await banco.from('tarefa_comentario').select('texto,criado_em,autor_id').eq('tarefa_id', x.tarefa_id).eq('interno', false).order('criado_em');
    conv = `<div class="pd-conv">${(cs || []).map(c => `<div class="pd-msg"><b>${c.autor_id === p.id ? 'Você' : 'Coleve'}</b><time>${dBR(c.criado_em.slice(0, 10))}</time><p>${esc(c.texto)}</p></div>`).join('')}
      <form class="pd-resp" data-tarefa="${x.tarefa_id}"><input class="ui-in" name="t" maxlength="2000" placeholder="Escreva para a equipe" aria-label="Mensagem para a equipe"><button class="ui-btn" type="submit">Enviar</button></form></div>`;
  }
  box.innerHTML = `<div class="pd-passos">${passos}</div>
    ${x.descricao ? `<p class="pd-desc">${esc(x.descricao)}</p>` : ''}
    ${x.falta_cliente?.length ? `<p class="pd-desc">Para a Coleve terminar, falta você mandar: <b>${esc(x.falta_cliente.join(', '))}</b>. <a href="../">Enviar pelo Início</a></p>` : ''}
    <div class="pd-acoes">
      ${x.documento_id ? `<button class="ui-btn ui-btn--pri" type="button" data-baixar="${x.documento_id}" data-nome="${esc(x.documento_nome)}">Baixar ${esc(x.documento_nome)}</button>` : ''}
      ${x.pode_cancelar ? `<button class="ui-btn ui-btn--fan" type="button" data-cancelar="${x.id}">Cancelar pedido</button>` : ''}
    </div>${conv}`;
}
$('lista').addEventListener('click', async e => {
  const b = e.target.closest('[data-baixar]');
  if (b) { b.disabled = true; try { await baixar({ id: b.dataset.baixar, nome: b.dataset.nome }); } catch { aviso('Não deu para baixar. Tente de novo.'); } b.disabled = false; return; }
  const c = e.target.closest('[data-cancelar]');
  if (c) {
    if (!confirm('Cancelar este pedido?')) return;
    const { error } = await banco.rpc('cancelar_pedido', { p_pedido: c.dataset.cancelar });
    if (error) aviso(error.message); else { aviso('Pedido cancelado.'); aberto = null; await carregaAndamento(); }
  }
});
$('lista').addEventListener('submit', async e => {
  const f = e.target.closest('.pd-resp'); if (!f) return;
  e.preventDefault();
  const texto = f.t.value.trim(); if (!texto) return;
  f.querySelector('button').disabled = true;
  const { error } = await banco.from('tarefa_comentario').insert({ tarefa_id: f.dataset.tarefa, autor_id: p.id, texto, interno: false });
  if (error) { aviso('Não deu para enviar. Tente de novo.'); f.querySelector('button').disabled = false; return; }
  detalhe(aberto);
});

await carregaAndamento();
abre(location.hash === '#andamento' ? 'andamento' : 'pedir');
document.body.classList.remove('carregando');

// tempo real: a equipe mexe na tarefa, o cliente vê na hora
let tm;
const recarrega = () => { clearTimeout(tm); tm = setTimeout(carregaAndamento, 400); };
banco.channel('coleve-andamento-cliente')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefa' }, recarrega)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pedido' }, recarrega)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pendencia_cliente' }, recarrega)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tarefa_comentario' }, () => aberto && detalhe(aberto))
  .subscribe();
