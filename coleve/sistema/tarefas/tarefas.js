// Sistema Coleve · quadro de tarefas (área interna)
import { banco, quemSou } from '../conexao.js';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;

const AREAS = { fiscal: 'Fiscal', contabil: 'Contábil', dp: 'Dep. pessoal', bpo: 'BPO financeiro', paralegal: 'Paralegal', atendimento: 'Atendimento' };
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
let equipe = [], tarefas = [];
Object.entries(AREAS).forEach(([k, v]) => $('f-area').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`));
const [{ data: pes }, { data: emps }] = await Promise.all([
  banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  banco.from('empresa').select('id,razao_social,nome_fantasia').eq('ativo', true).order('razao_social')
]);
equipe = pes || [];
equipe.forEach(p => {
  $('f-resp').insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`);
  $('d-resp').insertAdjacentHTML('beforeend', `<option value="${p.id}">${esc(p.nome)}</option>`);
});
(emps || []).forEach(e => $('f-emp').insertAdjacentHTML('beforeend', `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`));
if (P.area) $('f-area').value = P.area;   // cada um abre já na sua área

async function carrega() {
  const { data, error } = await banco.from('v_tarefa').select('*').neq('status', 'cancelado')
    .order('prazo', { ascending: true, nullsFirst: false }).limit(500);
  if (error) return avisa('Não deu para carregar as tarefas.');
  tarefas = data;
  desenha();
}

function filtradas() {
  const b = $('f-busca').value.trim().toLowerCase(), a = $('f-area').value, r = $('f-resp').value, e = $('f-emp').value, at = $('f-atraso').checked;
  return tarefas.filter(t =>
    (!b || (t.titulo + ' ' + t.empresa_nome).toLowerCase().includes(b)) &&
    (!a || t.area === a) &&
    (!r || (r === '-' ? !t.responsavel_id : t.responsavel_id === r)) &&
    (!e || t.empresa_id === e) &&
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
        <article class="cartao${t.atrasada ? ' cartao--atraso' : ''}${t.urgente ? ' cartao--urgente' : ''}" draggable="true" data-id="${t.id}" tabindex="0">
          <span class="area area--${t.area}">${AREAS[t.area]}</span>
          <h3>${esc(t.titulo)}</h3>
          <p class="cartao__emp">${esc(t.empresa_nome)}${t.empresa_teste ? ' <em>teste</em>' : ''}</p>
          <footer>${prazoTag(t)}<span class="mini" title="${esc(t.responsavel_nome || 'Sem responsável')}">${t.responsavel_nome ? iniciais(t.responsavel_nome) : '+'}</span></footer>
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
  aberta = t;
  $('d-empresa').textContent = t.empresa_nome;
  $('d-titulo').textContent = t.titulo;
  $('d-area').textContent = AREAS[t.area];
  $('d-comp').textContent = t.competencia ? dataBR(t.competencia).slice(3) : '-';
  $('d-prazo').value = t.prazo || '';
  $('d-resp').value = t.responsavel_id || '';
  $('d-visivel').checked = t.visivel_cliente;
  $('d-status').innerHTML = COLUNAS.map(([st, nome]) => `<button type="button" data-st="${st}" class="${t.status === st ? 'is-ativo' : ''}">${nome}</button>`).join('');
  $('gaveta').hidden = false;
  carregaDetalhe(id);
}

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
$('d-resp').onchange = () => salva({ responsavel_id: $('d-resp').value || null });
$('d-visivel').onchange = () => salva({ visivel_cliente: $('d-visivel').checked });
$('d-novo').onsubmit = async e => {
  e.preventDefault();
  const texto = $('d-texto').value.trim(); if (!texto || !aberta) return;
  const { error } = await banco.from('tarefa_comentario').insert({ tarefa_id: aberta.id, autor_id: P.id, texto, interno: true });
  if (error) return avisa('Não deu para comentar.');
  $('d-texto').value = ''; carregaDetalhe(aberta.id);
};

await carrega();
document.body.classList.remove('carregando');
