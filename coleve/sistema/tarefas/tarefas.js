// Sistema Coleve · quadro de tarefas (área interna)
import { banco, quemSou } from '../conexao.js?v=2';
import { anexar, baixar, TIPOS, reais } from '../documentos.js?v=3';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;

const AREAS = { fiscal: 'Fiscal', contabil: 'Contábil', dp: 'Dep. pessoal', bpo: 'BPO financeiro', paralegal: 'Paralegal', atendimento: 'Atendimento', tecnologia: 'Tecnologia', marketing: 'Marketing' };
const COLUNAS = [
  ['a_fazer', 'A fazer'], ['fazendo', 'Fazendo'], ['conferencia', 'Conferência'], ['pronto', 'Pronto'], ['enviado', 'Enviado']
];
const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dataBR = d => d ? d.split('-').reverse().join('/') : '';
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 4000); };

// barra de cima
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe · ' + (AREAS[P.area] || '');
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

// gerar mês: só admin e gestor
if (['admin', 'gestor'].includes(P.papel)) {
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  $('gerar-mes').value = d.toISOString().slice(0, 7);
  $('gerar').hidden = false;
  $('gerar-btn').onclick = async () => {
    const comp = $('gerar-mes').value + '-01';
    const [t, p] = await Promise.all([
      banco.rpc('gerar_tarefas_mes', { p_competencia: comp }),
      banco.rpc('gerar_pendencias_mes', { p_competencia: comp })
    ]);
    if (t.error || p.error) return avisa('Não deu para gerar: ' + (t.error || p.error).message);
    avisa(`${t.data} tarefa(s) e ${p.data} pendência(s) novas para ${dataBR(comp).slice(3)}. O que já existia não duplicou.`);
    carrega();
  };
}

// listas dos filtros
let equipe = [], tarefas = [], acompanha = new Map();
const nomeDe = id => equipe.find(p => p.id === id)?.nome || '';
// envolvidos: responsável primeiro, depois quem acompanha o card e quem acompanha tudo
const envolvidos = t => {
  const ids = [t.responsavel_id, ...(acompanha.get(t.id) || []), ...equipe.filter(p => p.acompanha_tudo).map(p => p.id)];
  if (t.demanda) ids.push(t.demanda.pedido_por);
  return [...new Set(ids.filter(Boolean))];
};
Object.entries(AREAS).forEach(([k, v]) => $('f-area').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));
const [{ data: pes }, { data: emps }] = await Promise.all([
  banco.from('pessoa').select('id,nome,acompanha_tudo').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia').eq('ativo', true).order('razao_social')
]);
equipe = pes || [];
equipe.forEach(p => {
  $('f-resp').insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`);
  $('d-resp').insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`);
});
(emps || []).forEach(e => $('f-emp').insertAdjacentHTML('beforeend', `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`));
if (P.area && !['tecnologia', 'marketing'].includes(P.area)) $('f-area').value = P.area;   // cada um abre já na sua área
// "Minhas": abre ligado para quem cuida de marketing e sistema
let minhas = ['tecnologia', 'marketing'].includes(P.area);
// vindo da ficha do cliente (?emp=<id>): todas as tarefas daquela empresa
const empDaFicha = new URLSearchParams(location.search).get('emp');
if (empDaFicha) { $('f-emp').value = empDaFicha; $('f-area').value = ''; minhas = false; }
const desenhaMinhas = () => { document.body.classList.toggle('modo-minhas', minhas); document.querySelectorAll('#vista-q button').forEach(b => b.classList.toggle('is-ativo', (b.dataset.v === 'minhas') === minhas)); };
document.getElementById('vista-q').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; minhas = b.dataset.v === 'minhas'; desenhaMinhas(); desenha(); });
desenhaMinhas();

// pedido de marketing vira card: o status anda sozinho com o fluxo do Marketing
const ST_DEMANDA = { pedido: 'a_fazer', ajuste: 'a_fazer', produzindo: 'fazendo', aprovacao: 'conferencia', aprovado: 'pronto', publicado: 'enviado' };
const FORMATO = { feed: 'Post', carrossel: 'Carrossel', story: 'Story', reels: 'Reels', outro: 'Peça' };
const hojeISO = () => new Date().toISOString().slice(0, 10);
const comoCard = d => ({
  id: 'd:' + d.id, demanda: d, titulo: d.titulo, area: 'marketing', status: ST_DEMANDA[d.status] || 'a_fazer',
  empresa_nome: FORMATO[d.formato] + ' · pedido por ' + (d.pedido_por_nome || '').split(' ')[0],
  prazo: d.data_prevista, responsavel_id: d.responsavel_id, responsavel_nome: d.responsavel_nome,
  ajuste: d.status === 'ajuste', urgente: d.status === 'ajuste',
  atrasada: !!d.data_prevista && d.data_prevista < hojeISO() && !['aprovado', 'publicado'].includes(d.status)
});

async function carrega() {
  const { data, error } = await banco.from('v_tarefa').select('*').neq('status', 'cancelado')
    .order('prazo', { ascending: true, nullsFirst: false }).limit(500);
  if (error) return avisa('Não deu para carregar as tarefas.');
  const { data: ds } = await banco.from('v_demanda').select('id,titulo,formato,status,data_prevista,responsavel_id,responsavel_nome,pedido_por,pedido_por_nome').neq('status', 'cancelado');
  const { data: ac } = await banco.from('tarefa_acompanha').select('tarefa_id,pessoa_id');
  acompanha = new Map(); (ac || []).forEach(a => { if (!acompanha.has(a.tarefa_id)) acompanha.set(a.tarefa_id, new Set()); acompanha.get(a.tarefa_id).add(a.pessoa_id); });
  tarefas = [...data, ...(ds || []).map(comoCard)];
  desenha();
}

function filtradas() {
  const b = $('f-busca').value.trim().toLowerCase(), a = $('f-area').value, r = $('f-resp').value, e = $('f-emp').value, at = $('f-atraso').checked;
  return tarefas.filter(t =>
    (!minhas || t.responsavel_id === P.id) &&
    (!b || (t.titulo + ' ' + t.empresa_nome).toLowerCase().includes(b)) &&
    (!a || t.area === a) &&
    (!r || (r === '-' ? !t.responsavel_id : t.responsavel_id === r)) &&
    (!e || (e === 'interno' ? !t.empresa_id && !t.demanda : t.empresa_id === e)) &&
    (!at || t.atrasada));
}

function prazoTag(t) {
  if (!t.prazo) return '<span class="prazo prazo--sem">prazo a confirmar</span>';
  const hoje = new Date().toISOString().slice(0, 10);
  const cls = t.atrasada ? 'prazo--atraso' : t.prazo === hoje ? 'prazo--hoje' : '';
  const txt = t.atrasada ? 'atrasada · ' + dataBR(t.prazo) : t.prazo === hoje ? 'vence hoje' : 'vence ' + dataBR(t.prazo);
  return `<span class="prazo ${cls}">${txt}</span>`;
}

function desenha() {
  const lista = filtradas();
  $('total').textContent = `· ${lista.length} ${lista.length === 1 ? 'tarefa' : 'tarefas'}`;
  $('quadro').innerHTML = COLUNAS.map(([st, nome]) => {
    const cs = lista.filter(t => t.status === st);
    return `<div class="col" data-status="${st}">
      <header><b>${nome}</b><span>${cs.length}</span></header>
      <div class="col__cards">${cs.map(t => `
        <article class="cartao${t.atrasada ? ' cartao--atraso' : ''}${t.urgente ? ' cartao--urgente' : ''}${t.demanda ? ' cartao--mk' : ''}" draggable="true" data-id="${t.id}" tabindex="0">
          <span class="area area--${t.area}">${AREAS[t.area]}</span>${t.ajuste ? '<span class="tag-aj">ajuste pedido</span>' : ''}${t.demanda && t.status === 'conferencia' ? '<span class="tag-esp">esperando aprovação</span>' : ''}
          <h3>${esc(t.titulo)}</h3>
          <p class="cartao__emp">${esc(t.empresa_nome)}${t.empresa_teste ? ' <em>teste</em>' : ''}</p>
          <footer>${prazoTag(t)}<span class="rostos-c">${envolvidos(t).slice(0, 4).map((id, i) => `<span class="mini${i === 0 && id === t.responsavel_id ? '' : ' mini--seg'}" title="${esc(nomeDe(id))}${i === 0 && id === t.responsavel_id ? ' · responsável' : ' · acompanha'}">${iniciais(nomeDe(id))}</span>`).join('') || '<span class="mini mini--vazio" title="Sem ninguém">+</span>'}</span></footer>
        </article>`).join('') || '<p class="col__vazio">Nada aqui</p>'}
      </div></div>`;
  }).join('');
}

['f-busca', 'f-area', 'f-resp', 'f-emp', 'f-atraso'].forEach(id => $(id).addEventListener('input', desenha));

// arrastar entre colunas
let arrastando = null;
$('quadro').addEventListener('dragstart', e => { const c = e.target.closest('.cartao'); if (c) { arrastando = c.dataset.id; c.classList.add('voando'); } });
$('quadro').addEventListener('dragend', e => { e.target.closest('.cartao')?.classList.remove('voando'); document.querySelectorAll('.col.alvo').forEach(c => c.classList.remove('alvo')); });
$('quadro').addEventListener('dragover', e => { const col = e.target.closest('.col'); if (col) { e.preventDefault(); document.querySelectorAll('.col.alvo').forEach(c => c !== col && c.classList.remove('alvo')); col.classList.add('alvo'); } });
$('quadro').addEventListener('drop', async e => {
  const col = e.target.closest('.col'); if (!col || !arrastando) return;
  e.preventDefault(); col.classList.remove('alvo');
  await mudaStatus(arrastando, col.dataset.status); arrastando = null;
});

async function mudaStatus(id, status) {
  const t = tarefas.find(x => x.id === id); if (!t || t.status === status) return;
  if (t.demanda) {
    if (status === 'fazendo' && t.status === 'a_fazer') {
      t.status = 'fazendo'; desenha();
      await banco.from('demanda').update({ status: 'produzindo' }).eq('id', t.demanda.id);
    } else avisa('Esse é um pedido de marketing: envie a arte e a aprovação pelo Marketing. Ele anda sozinho aqui.');
    return;
  }
  const antes = t.status; t.status = status; desenha();
  const { error } = await banco.from('tarefa').update({ status }).eq('id', id);
  if (error) { t.status = antes; desenha(); avisa('Não deu para mudar o status.'); }
}

// detalhe
let aberta = null;
$('quadro').addEventListener('click', e => { const c = e.target.closest('.cartao'); if (c) abre(c.dataset.id); });
$('quadro').addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.cartao'); if (c) abre(c.dataset.id); } });
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', fecha));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden) fecha(); });
function fecha() { $('gaveta').hidden = true; aberta = null; carrega(); }

async function abre(id) {
  const t = tarefas.find(x => x.id === id); if (!t) return;
  if (t.demanda) { location.href = '../marketing/#' + t.demanda.id; return; }
  aberta = t;
  $('d-empresa').textContent = t.empresa_nome;
  $('d-comp').closest('div').hidden = !t.competencia;
  $('d-visivel').closest('div').hidden = !t.empresa_id;
  $('d-titulo').textContent = t.titulo;
  $('d-area').textContent = AREAS[t.area];
  $('d-comp').textContent = t.competencia ? dataBR(t.competencia).slice(3) : '-';
  $('d-prazo').value = t.prazo || '';
  $('d-resp').value = t.responsavel_id || '';
  $('d-visivel').checked = t.visivel_cliente;
  $('d-status').innerHTML = COLUNAS.map(([st, nome]) => `<button type="button" data-st="${st}" class="${t.status === st ? 'is-ativo' : ''}">${nome}</button>`).join('');
  desenhaEnvolvidos(t);
  $('d-docs').hidden = !t.empresa_id;
  $('d-doc-lista').innerHTML = ''; $('d-entregar').hidden = true;
  $('gaveta').hidden = false;
  carregaDetalhe(id);
  if (t.empresa_id) carregaDocs(id);
}

// ===== documentos da tarefa: anexa (vai pro Drive), envia ao cliente, protocolo =====
Object.entries(TIPOS).forEach(([k, v]) => $('d-doc-tipo').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));
const horaBR = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
let docs = [];
async function carregaDocs(id) {
  const { data } = await banco.from('documento').select('id,nome,tipo,valor,vencimento,criado_em,protocolo(enviado_em,lido_em,destinatario)').eq('tarefa_id', id).order('criado_em');
  if (aberta?.id !== id) return;
  docs = data || [];
  $('d-doc-lista').innerHTML = docs.map(d => {
    const p = d.protocolo?.[0];
    const st = !p ? '<em class="st st--novo">não enviado</em>' : p.lido_em ? `<em class="st st--lido">aberto ${horaBR(p.lido_em)}</em>` : `<em class="st st--env">enviado ${horaBR(p.enviado_em)}</em>`;
    const meta = [TIPOS[d.tipo], d.valor != null ? reais(d.valor) : null, d.vencimento ? 'vence ' + dataBR(d.vencimento) : null, p ? 'para ' + esc(p.destinatario) : null].filter(Boolean).join(' · ');
    return `<li><span class="d-docs__t"><b>${esc(d.nome)}</b><small>${meta}</small></span>${st}<button type="button" class="d-baixar" data-id="${d.id}">Baixar</button></li>`;
  }).join('') || '<li class="vazio">Nenhum documento anexado.</li>';
  const novos = docs.filter(d => !d.protocolo?.length).length;
  $('d-entregar').hidden = !novos;
  $('d-entregar').textContent = novos > 1 ? `Enviar ${novos} documentos ao cliente` : 'Enviar ao cliente';
}
$('d-arq').onchange = () => { $('d-arq-nome').textContent = $('d-arq').files[0]?.name || 'Escolher arquivo'; };
$('d-anexo').onsubmit = async e => {
  e.preventDefault();
  const arq = $('d-arq').files[0]; if (!arq || !aberta) return;
  const t = aberta, btn = $('d-anexar');
  btn.disabled = true; btn.textContent = 'Enviando…';
  try {
    await anexar(t, arq, { tipo: $('d-doc-tipo').value, valor: $('d-doc-valor').value, vencimento: $('d-doc-venc').value },
      p => { btn.textContent = `Enviando ${Math.round(p * 100)}%`; });
    $('d-anexo').reset(); $('d-arq-nome').textContent = 'Escolher arquivo';
    avisa('Anexado. Está na pasta da empresa no Drive.');
    carregaDocs(t.id);
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
  t.status = 'enviado'; t.visivel_cliente = true; $('d-visivel').checked = true;
  $('d-status').querySelectorAll('button').forEach(x => x.classList.toggle('is-ativo', x.dataset.st === 'enviado'));
  carregaDocs(t.id); carregaDetalhe(t.id); desenha();
};

async function carregaDetalhe(id) {
  const [{ data: cs }, { data: hs }] = await Promise.all([
    banco.from('tarefa_comentario').select('texto,criado_em,autor:pessoa(nome)').eq('tarefa_id', id).order('criado_em'),
    banco.from('historico').select('acao,detalhe,criado_em,quem:pessoa(nome)').eq('tarefa_id', id).order('criado_em', { ascending: false }).limit(20)
  ]);
  const hora = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  $('d-coment').innerHTML = (cs || []).map(c => `<li><b>${esc(c.autor?.nome || 'Equipe')}</b><span>${hora(c.criado_em)}</span><p>${esc(c.texto)}</p></li>`).join('') || '<li class="vazio">Sem comentários ainda.</li>';
  const nomeSt = Object.fromEntries(COLUNAS);
  $('d-hist').innerHTML = (hs || []).map(h => `<li><span>${hora(h.criado_em)}</span>${esc(h.quem?.nome || 'Sistema')}: ${h.acao === 'status' ? `${nomeSt[h.detalhe.de] || h.detalhe.de} → ${nomeSt[h.detalhe.para] || h.detalhe.para}` : esc(h.acao)}</li>`).join('') || '<li class="vazio">Nada ainda.</li>';
}

function desenhaEnvolvidos(t) {
  const seg = acompanha.get(t.id) || new Set();
  $('d-envolvidos').innerHTML = equipe.map(p => {
    const resp = p.id === t.responsavel_id, tudo = p.acompanha_tudo, marcado = resp || tudo || seg.has(p.id);
    return `<button type="button" class="env${marcado ? ' is-on' : ''}" data-id="${p.id}" ${resp || tudo ? 'disabled' : ''}>
      <span class="mini">${iniciais(p.nome)}</span>${esc(p.nome.split(' ')[0])}<small>${resp ? 'responsável' : tudo ? 'acompanha tudo' : marcado ? 'acompanha' : 'tocar p/ incluir'}</small></button>`;
  }).join('');
}
$('d-envolvidos').addEventListener('click', async e => {
  const b = e.target.closest('.env'); if (!b || b.disabled || !aberta) return;
  const seg = acompanha.get(aberta.id) || new Set(); acompanha.set(aberta.id, seg);
  const id = b.dataset.id;
  if (seg.has(id)) { seg.delete(id); await banco.from('tarefa_acompanha').delete().eq('tarefa_id', aberta.id).eq('pessoa_id', id); }
  else { seg.add(id); await banco.from('tarefa_acompanha').insert({ tarefa_id: aberta.id, pessoa_id: id }); }
  desenhaEnvolvidos(aberta); desenha();
});
$('d-status').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b || !aberta) return;
  await mudaStatus(aberta.id, b.dataset.st);
  $('d-status').querySelectorAll('button').forEach(x => x.classList.toggle('is-ativo', x === b));
  carregaDetalhe(aberta.id);
});
const salva = async campos => {
  if (!aberta) return;
  const { error } = await banco.from('tarefa').update(campos).eq('id', aberta.id);
  avisa(error ? 'Não deu para salvar.' : 'Salvo.');
};
$('d-prazo').onchange = () => salva({ prazo: $('d-prazo').value || null });
$('d-resp').onchange = async () => { await salva({ responsavel_id: $('d-resp').value || null }); aberta.responsavel_id = $('d-resp').value || null; desenhaEnvolvidos(aberta); };
$('d-visivel').onchange = () => salva({ visivel_cliente: $('d-visivel').checked });
$('d-novo').onsubmit = async e => {
  e.preventDefault();
  const texto = $('d-texto').value.trim(); if (!texto || !aberta) return;
  const { error } = await banco.from('tarefa_comentario').insert({ tarefa_id: aberta.id, autor_id: P.id, texto, interno: true });
  if (error) return avisa('Não deu para comentar.');
  $('d-texto').value = ''; carregaDetalhe(aberta.id);
};

// + Tarefa: coisa sua que não é guia nem post (ajustar o site, conectar o WhatsApp...)
$('f-emp').insertAdjacentHTML('afterbegin', '<option value="interno">Interno · Coleve</option>');
$('f-emp').querySelector('option[value=""]')?.after($('f-emp').querySelector('option[value=interno]'));
Object.entries(AREAS).forEach(([k, v]) => $('n-area').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));
equipe.forEach(p => $('n-resp').insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`));
(emps || []).forEach(e => $('n-emp').insertAdjacentHTML('beforeend', `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`));
$('nova-t').onclick = () => {
  $('f-nova-t').reset(); $('n-area').value = P.area || 'tecnologia'; $('n-resp').value = P.id; $('dlg-t').showModal(); $('n-titulo').focus();
};
$('n-cancela').onclick = () => $('dlg-t').close();
$('f-nova-t').addEventListener('submit', async e => {
  e.preventDefault();
  const titulo = $('n-titulo').value.trim(); if (!titulo) return;
  const empresa = $('n-emp').value || null;
  const { error } = await banco.from('tarefa').insert({
    titulo, origem: 'equipe', area: $('n-area').value, responsavel_id: $('n-resp').value || null,
    prazo: $('n-prazo').value || null, prazo_original: $('n-prazo').value || null,
    empresa_id: empresa, visivel_cliente: !!empresa, criado_por: P.id
  });
  if (error) { avisa('Não deu para criar a tarefa.'); return; }
  $('dlg-t').close(); avisa('Tarefa criada.'); carrega();
});

// tempo real: se alguém mexe numa tarefa, o quadro atualiza sozinho
let espera;
banco.channel('coleve-tarefas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefa' }, () => { clearTimeout(espera); espera = setTimeout(carrega, 400); })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'demanda' }, () => { clearTimeout(espera); espera = setTimeout(carrega, 400); })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tarefa_comentario' }, ({ new: c }) => { if (aberta && c.tarefa_id === aberta.id) carregaDetalhe(aberta.id); })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'protocolo' }, () => { if (aberta?.empresa_id) carregaDocs(aberta.id); })
  .subscribe();

await carrega();
document.body.classList.remove('carregando');
