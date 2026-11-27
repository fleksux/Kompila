// Sistema Coleve · gestão do onboarding (0040): passos por empresa (com os itens do societário e anexo por item)
// e a trilha de vídeos do cliente (a equipe cola a url e ordena).
import { banco, quemSou } from '../conexao.js?v=2';
import { anexar, baixar } from '../documentos.js?v=3';
import { fonteVideo, NOME_FONTE } from './video.js?v=1';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;
const chefe = ['admin', 'gestor'].includes(P.papel);
const veCliente = chefe || P.area !== 'marketing';
if (!veCliente) document.querySelectorAll('.barra__nav a[href$="clientes/"], .barra__nav a[href$="propostas/"]').forEach(a => a.remove());

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? d.slice(0, 10).split('-').reverse().join('/') : '';
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 4000); };
const FEITO = ['pronto', 'enviado'];

$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

// abas (marketing só cuida dos vídeos)
function trocaAba(a) {
  document.querySelectorAll('.ob-abas button').forEach(b => b.classList.toggle('is-on', b.dataset.aba === a));
  $('v-emp').hidden = a !== 'emp'; $('v-vid').hidden = a !== 'vid';
  if (a === 'vid') carregaVideos(); else carregaEmpresas();
}
document.querySelector('.ob-abas').addEventListener('click', e => { const b = e.target.closest('[data-aba]'); if (b) trocaAba(b.dataset.aba); });
if (!veCliente) $('aba-emp').remove();

// ===================== vídeos =====================
let videos = [], vistos = new Map();
async function carregaVideos() {
  const [{ data }, { data: vs }] = await Promise.all([
    banco.from('onboarding_video').select('*').order('ordem').order('criado_em'),
    veCliente ? banco.from('onboarding_video_visto').select('video_id') : Promise.resolve({ data: [] })
  ]);
  videos = data || [];
  vistos = new Map(); (vs || []).forEach(v => vistos.set(v.video_id, (vistos.get(v.video_id) || 0) + 1));
  desenhaVideos();
}
function desenhaVideos() {
  $('vid').innerHTML = videos.map((v, i) => {
    const f = fonteVideo(v.url);
    return `<li data-v="${v.id}" class="${v.ativo ? '' : 'is-off'}">
      <span class="ob-vid__ordem"><button type="button" data-mov="-1" aria-label="Subir"${i ? '' : ' disabled'}>▲</button>${i + 1}<button type="button" data-mov="1" aria-label="Descer"${i < videos.length - 1 ? '' : ' disabled'}>▼</button></span>
      <span class="ob-vid__t"><input class="ui-in" data-k="titulo" value="${esc(v.titulo)}" aria-label="Título"><input class="ui-in" data-k="descricao" value="${esc(v.descricao || '')}" placeholder="Descrição curta" aria-label="Descrição"></span>
      <span class="ob-vid__url"><input class="ui-in" data-k="url" value="${esc(v.url || '')}" placeholder="Cole o link do vídeo" aria-label="Link do vídeo">
        <small>${v.url ? (f ? NOME_FONTE[f.tipo] : 'Link inválido') + ` · <a href="${esc(v.url)}" target="_blank" rel="noopener">abrir</a>` : '<span class="sx sx--novo">em gravação</span>'}${veCliente && vistos.get(v.id) ? ` · assistido por ${vistos.get(v.id)}` : ''}</small></span>
      <input class="ui-in ob-vid__dur" data-k="duracao_min" type="number" min="1" value="${v.duracao_min || ''}" placeholder="min" aria-label="Duração em minutos">
      <span class="ob-vid__ac"><label><input type="checkbox" data-k="ativo"${v.ativo ? ' checked' : ''}>No ar</label><button type="button" class="ui-btn ui-btn--fan" data-tira aria-label="Tirar vídeo">Tirar</button></span>
    </li>`;
  }).join('') || '<li class="ob-vazio">Nenhum vídeo na trilha.</li>';
}
$('vid').addEventListener('change', async e => {
  const li = e.target.closest('[data-v]'), k = e.target.dataset.k; if (!li || !k) return;
  let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value.trim();
  if (k === 'titulo' && !v) { avisa('O título não pode ficar vazio.'); return carregaVideos(); }
  if (k === 'duracao_min') v = +v || null;
  if (k === 'url' && v && !fonteVideo(v)) { avisa('Link inválido. Cole o endereço completo, começando com https://'); return; }
  const { error } = await banco.from('onboarding_video').update({ [k]: v || (k === 'ativo' ? false : null), atualizado_em: new Date().toISOString() }).eq('id', li.dataset.v);
  if (error) return avisa('Não deu para salvar.');
  avisa('Salvo.'); carregaVideos();
});
$('vid').addEventListener('click', async e => {
  const li = e.target.closest('[data-v]'); if (!li) return;
  const mov = e.target.closest('[data-mov]');
  if (mov) {
    const i = videos.findIndex(v => v.id === li.dataset.v), j = i + +mov.dataset.mov;
    if (j < 0 || j >= videos.length) return;
    [videos[i], videos[j]] = [videos[j], videos[i]];
    await Promise.all(videos.map((v, k) => v.ordem === k + 1 ? null : banco.from('onboarding_video').update({ ordem: k + 1 }).eq('id', v.id)));
    return carregaVideos();
  }
  if (e.target.closest('[data-tira]') && confirm('Tirar este vídeo da trilha? Quem já assistiu perde a marcação.')) {
    await banco.from('onboarding_video').delete().eq('id', li.dataset.v); carregaVideos();
  }
});
$('vid-novo').onclick = async () => {
  const { error } = await banco.from('onboarding_video').insert({ titulo: 'Vídeo novo', ordem: videos.length + 1 });
  if (error) return avisa('Não deu para criar.');
  await carregaVideos(); $('vid').querySelector('li:last-child [data-k="titulo"]')?.select();
};

// ===================== empresas em onboarding =====================
let tarefas = [], passos = new Map(), empresas = new Map(), pessoas = new Map(), docs = [], progVid = [], abertas = new Set();
async function carregaEmpresas() {
  const [{ data: ts }, { data: ps }, { data: es }, { data: eq }, { data: pv }] = await Promise.all([
    banco.from('tarefa').select('id,empresa_id,titulo,passo,status,prazo,responsavel_id,pai_id,competencia').eq('origem', 'onboarding').not('passo', 'is', null),
    banco.from('onboarding_passo').select('*'),
    banco.from('empresa').select('id,razao_social,nome_fantasia,inicio_atendimento,teste'),
    banco.from('pessoa').select('id,nome').eq('tipo', 'equipe'),
    banco.from('v_onboarding_video_empresa').select('*')
  ]);
  tarefas = ts || []; passos = new Map((ps || []).map(p => [p.codigo, p])); empresas = new Map((es || []).map(e => [e.id, e]));
  pessoas = new Map((eq || []).map(p => [p.id, p.nome])); progVid = pv || [];
  const { data: ds } = tarefas.length ? await banco.from('documento').select('id,nome,tarefa_id,criado_em').in('tarefa_id', tarefas.map(t => t.id)) : { data: [] };
  docs = ds || [];
  desenhaEmpresas();
}
const ordem = t => passos.get(t.passo)?.ordem || 0;
function desenhaEmpresas() {
  const porEmp = new Map();
  tarefas.forEach(t => { const x = porEmp.get(t.empresa_id) || []; x.push(t); porEmp.set(t.empresa_id, x); });
  const linhas = [...porEmp].map(([id, ts]) => {
    const onb = ts.filter(t => passos.get(t.passo)?.fase === 'onboarding' && t.status !== 'cancelado');
    return { id, ts, e: empresas.get(id) || {}, feitos: onb.filter(t => FEITO.includes(t.status)).length, total: onb.length };
  }).sort((a, b) => (a.feitos === a.total) - (b.feitos === b.total) || (a.e.razao_social || '').localeCompare(b.e.razao_social || ''));
  $('emp').innerHTML = linhas.map(l => {
    const fim = l.total && l.feitos === l.total;
    const vs = progVid.filter(v => v.empresa_id === l.id);
    return `<li data-e="${l.id}" class="${abertas.has(l.id) ? 'is-aberta' : ''}">
      <button type="button" class="ob-emp__cab" aria-expanded="${abertas.has(l.id)}">
        <span><b>${esc(l.e.nome_fantasia || l.e.razao_social || 'Empresa')}</b><small>${l.e.teste ? 'empresa de teste · ' : ''}${fim ? 'onboarding concluído' : `${l.total - l.feitos} passo${l.total - l.feitos === 1 ? '' : 's'} faltando`}</small></span>
        <span class="ob-prog">${l.feitos} de ${l.total} passos<span><i style="width:${l.total ? l.feitos / l.total * 100 : 0}%"></i></span></span>
        <span class="ob-emp__ini">${fim && l.e.inicio_atendimento ? `<span class="sx sx--ok">atende desde ${dataBR(l.e.inicio_atendimento)}</span>` : '<span class="sx sx--novo">em onboarding</span>'}</span>
        <span class="ob-dica">${vs.length ? `vídeos: ${vs.map(v => `${v.vistos}/${v.total}`).join(', ')}` : 'sem acesso do cliente'}</span>
        <svg viewBox="0 0 12 12"><path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
      </button>
      ${abertas.has(l.id) ? detalhe(l) : ''}
    </li>`;
  }).join('') || '<li class="ob-vazio">Nenhuma empresa em onboarding.</li>';
}
function linhaPasso(t, sub = false) {
  const p = passos.get(t.passo) || {}, feito = FEITO.includes(t.status), atraso = !feito && t.prazo && t.prazo < hoje();
  const ds = docs.filter(d => d.tarefa_id === t.id);
  return `<li class="ob-passo${feito ? ' is-feito' : ''}${sub ? ' is-sub' : ''}" data-t="${t.id}">
    <input type="checkbox" data-feito${feito ? ' checked' : ''}${t.status === 'cancelado' ? ' disabled' : ''} aria-label="Feito">
    <span class="ob-passo__t"><span>${esc(t.titulo)}</span><small>${esc((pessoas.get(t.responsavel_id) || 'Sem responsável').split(' ')[0])}${t.status === 'cancelado' ? ' · cancelado' : ''}</small></span>
    ${p.externo ? '<span class="sx sx--ext">com o cliente</span>' : '<span></span>'}
    <span class="ob-prazo${atraso ? ' ob-prazo--atraso' : ''}">${t.prazo ? dataBR(t.prazo).slice(0, 5) : ''}</span>
    ${sub || t.passo === 'certificado' ? `<span class="ui-btn ui-btn--fan ob-anexa">Anexar<input type="file" multiple data-anexa="${t.id}" aria-label="Anexar em ${esc(t.titulo)}"></span>` : '<span></span>'}
    ${ds.length ? `<span class="ob-passo__docs">${ds.map(d => `<button type="button" data-baixa="${d.id}">${esc(d.nome)}</button>`).join('')}</span>` : ''}
  </li>`;
}
function detalhe(l) {
  const ts = [...l.ts].sort((a, b) => ordem(a) - ordem(b));
  const topo = ts.filter(t => !t.pai_id && passos.get(t.passo)?.fase === 'onboarding'), pos = ts.filter(t => passos.get(t.passo)?.fase === 'pos');
  const vs = progVid.filter(v => v.empresa_id === l.id);
  return `<div class="ob-det">
    <h3>Onboarding</h3>
    <ul class="ob-passos">${topo.map(t => linhaPasso(t) + ts.filter(s => s.pai_id === t.id).map(s => linhaPasso(s, true)).join('')).join('')}</ul>
    <h3>Pós-onboarding</h3>
    ${pos.length ? `<ul class="ob-passos">${pos.map(t => linhaPasso(t)).join('')}</ul>` : '<p class="ob-dica">Nasce quando o último passo do onboarding for concluído: 1º fechamento e acompanhamento de 3 meses.</p>'}
    <h3>Trilha de vídeos do cliente</h3>
    <div class="ob-videos">${vs.map(v => `<span>${esc(v.nome)}: ${v.vistos} de ${v.total}${v.ultimo_em ? ' · último em ' + dataBR(v.ultimo_em) : ''}</span>`).join('') || '<span>Nenhum contato do cliente com acesso ao sistema ainda.</span>'}</div>
  </div>`;
}
$('emp').addEventListener('click', async e => {
  const cab = e.target.closest('.ob-emp__cab');
  if (cab) { const id = cab.closest('[data-e]').dataset.e; abertas.has(id) ? abertas.delete(id) : abertas.add(id); return desenhaEmpresas(); }
  const b = e.target.closest('[data-baixa]');
  if (b) { try { await baixar(docs.find(d => d.id === b.dataset.baixa)); } catch (er) { avisa(er.message); } }
});
$('emp').addEventListener('change', async e => {
  const li = e.target.closest('[data-t]'); if (!li) return;
  const t = tarefas.find(x => x.id === li.dataset.t);
  if (e.target.matches('[data-feito]')) {
    const { error } = await banco.from('tarefa').update({ status: e.target.checked ? 'pronto' : 'a_fazer' }).eq('id', t.id);
    if (error) { avisa('Não deu para salvar.'); return carregaEmpresas(); }
    const antes = empresas.get(t.empresa_id)?.inicio_atendimento;
    await carregaEmpresas();
    const depois = empresas.get(t.empresa_id)?.inicio_atendimento;
    avisa(depois && depois !== antes ? `Onboarding concluído. Atendimento começa em ${dataBR(depois)}.` : 'Salvo.');
    return;
  }
  const inp = e.target.closest('[data-anexa]');
  if (inp?.files.length) {
    const fs = [...inp.files]; inp.value = '';
    try {
      for (const [k, f] of fs.entries()) { avisa(`Enviando ${k + 1} de ${fs.length}: ${f.name}`); await anexar(t, f, { tipo: t.passo === 'soc_contrato' ? 'contrato' : 'outro' }); }
      avisa(fs.length > 1 ? `${fs.length} arquivos anexados.` : 'Arquivo anexado.');
    } catch (er) { avisa('Não deu para anexar: ' + er.message); }
    carregaEmpresas();
  }
});

trocaAba(veCliente ? 'emp' : 'vid');
document.body.classList.remove('carregando');
