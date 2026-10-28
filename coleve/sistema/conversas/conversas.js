// Sistema Coleve · conversas internas da equipe (tempo real, arquivos no bucket privado "conversas")
import { banco, quemSou } from '../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
// sem login: o login abre na página inteira, nunca dentro da janelinha do chat
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { (window.top !== window ? window.top : window).location.replace(new URL('../../entrar/', location.href).href); throw 0; }
const P = eu.pessoa;
const MINI = new URLSearchParams(location.search).has('mini');
if (MINI) document.body.classList.add('modo-mini');
const largo = () => !MINI && matchMedia('(min-width:861px)').matches;

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const tamanho = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const hora = d => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dia = d => {
  const x = new Date(d), h = new Date(), o = new Date(); o.setDate(h.getDate() - 1);
  if (x.toDateString() === h.toDateString()) return 'Hoje';
  if (x.toDateString() === o.toDateString()) return 'Ontem';
  return x.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
};
// links clicáveis e @menção em destaque
const formata = t => esc(t)
  .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
  .replace(/(^|\s)@([A-Za-zÀ-ú]+)/g, '$1<mark>@$2</mark>')
  .replace(/\n/g, '<br>');

const AREAS = { fiscal: 'Fiscal', contabil: 'Contábil', dp: 'Dep. pessoal', bpo: 'BPO financeiro', paralegal: 'Paralegal', atendimento: 'Atendimento', tecnologia: 'Tecnologia', marketing: 'Marketing' };
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe · ' + (AREAS[P.area] || '');
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

let canais = [], atual = null, aba = 'conversa';
const pessoas = new Map();
const urls = new Map();   // cache de links assinados

const { data: pes } = await banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome');
(pes || []).forEach(p => pessoas.set(p.id, p.nome));

async function linkArquivo(caminho) {
  if (urls.has(caminho)) return urls.get(caminho);
  const { data } = await banco.storage.from('conversas').createSignedUrl(caminho, 3600);
  const u = data?.signedUrl || '#';
  urls.set(caminho, u);
  return u;
}

// lista de canais
async function carregaCanais() {
  const { data } = await banco.rpc('meus_canais');
  canais = data || [];
  desenhaCanais();
}
function desenhaCanais() {
  const b = $('busca').value.trim().toLowerCase();
  const total = canais.reduce((s, c) => s + (c.id === atual?.id ? 0 : c.nao_lidas), 0);
  $('badge-nav').hidden = !total; $('badge-nav').textContent = total;
  document.title = (total ? `(${total}) ` : '') + 'Conversas · Sistema Coleve';
  if (MINI) parent.postMessage({ coleveNaoLidas: total }, location.origin);
  const lista = canais.filter(c => !b || c.nome.toLowerCase().includes(b));
  const grupo = (titulo, itens) => itens.length ? `<li class="canais__rot">${titulo}</li>` + itens.map(c => `
    <li><button class="canal${c.id === atual?.id ? ' is-ativo' : ''}${c.nao_lidas && c.id !== atual?.id ? ' tem-novo' : ''}" data-id="${c.id}">
      <span class="canal__ico${c.tipo === 'direto' ? ' canal__ico--pessoa' : ''}">${c.tipo === 'direto' ? iniciais(c.nome) : '#'}</span>
      <span class="canal__txt"><b>${esc(c.nome)}</b><small>${esc(c.ultima_txt || c.descricao || '')}</small></span>
      ${c.nao_lidas && c.id !== atual?.id ? `<span class="canal__n">${c.nao_lidas}</span>` : c.ultima_em ? `<span class="canal__h">${hora(c.ultima_em)}</span>` : ''}
    </button></li>`).join('') : '';
  $('canais').innerHTML = grupo('Canais', lista.filter(c => c.tipo !== 'direto')) + grupo('Diretas', lista.filter(c => c.tipo === 'direto'));
}
$('busca').addEventListener('input', desenhaCanais);
$('canais').addEventListener('click', e => { const b = e.target.closest('.canal'); if (b) abre(b.dataset.id); });

// abrir canal
async function abre(id) {
  atual = canais.find(c => c.id === id); if (!atual) return;
  history.replaceState(null, '', '#' + (atual.slug || atual.id));
  $('chat').classList.add('tem-fio');
  $('vazio').hidden = true;
  ['topo', 'escrever'].forEach(x => $(x).hidden = false);
  $('f-nome').textContent = atual.tipo === 'direto' ? atual.nome : '# ' + atual.nome;
  $('f-desc').textContent = atual.tipo === 'direto' ? 'Conversa direta' : (atual.descricao || '');
  $('f-ico').textContent = atual.tipo === 'direto' ? iniciais(atual.nome) : '#';
  $('f-ico').classList.toggle('fio__ico--pessoa', atual.tipo === 'direto');
  $('texto').placeholder = `Mensagem para ${atual.tipo === 'direto' ? atual.nome : '#' + atual.nome}`;
  mostraAba('conversa');
  await carregaMensagens();
  banco.rpc('marcar_lido', { c: id }).then(() => { atual.nao_lidas = 0; desenhaCanais(); });
  if (largo()) $('texto').focus();
}
$('voltar').onclick = () => { $('chat').classList.remove('tem-fio'); atual = null; history.replaceState(null, '', location.pathname); desenhaCanais(); };

function mostraAba(a) {
  aba = a;
  document.querySelectorAll('.abas button').forEach(b => { b.classList.toggle('is-ativo', b.dataset.aba === a); b.setAttribute('aria-selected', b.dataset.aba === a); });
  $('msgs').hidden = a !== 'conversa';
  $('escrever').hidden = a !== 'conversa';
  $('arqs').hidden = a !== 'arquivos';
  if (a === 'arquivos') carregaArquivos();
}
document.querySelector('.abas').addEventListener('click', e => { const b = e.target.closest('button'); if (b) mostraAba(b.dataset.aba); });

// mensagens
let ultimoDia = '', ultimoAutor = '', ultimaHora = 0;
async function carregaMensagens() {
  $('msgs').innerHTML = '<p class="carrega">Carregando…</p>';
  const { data } = await banco.from('mensagem').select('*').eq('canal_id', atual.id).order('criado_em', { ascending: false }).limit(150);
  ultimoDia = ''; ultimoAutor = ''; ultimaHora = 0;
  $('msgs').innerHTML = (data || []).length ? '' : `<div class="fio__comeco"><span class="fio__ico">${atual.tipo === 'direto' ? iniciais(atual.nome) : '#'}</span><b>${esc(atual.tipo === 'direto' ? atual.nome : '# ' + atual.nome)}</b><p>Começo da conversa. ${atual.tipo === 'direto' ? 'Só vocês dois veem.' : 'Todo o time Coleve vê este canal. O cliente nunca vê.'}</p></div>`;
  for (const m of (data || []).reverse()) await poe(m, false);
  rolaFim();
}
async function poe(m, anima = true) {
  const d = dia(m.criado_em);
  if (d !== ultimoDia) { $('msgs').insertAdjacentHTML('beforeend', `<div class="dia"><span>${d}</span></div>`); ultimoDia = d; ultimoAutor = ''; }
  const t = new Date(m.criado_em).getTime();
  const junto = m.autor_id === ultimoAutor && t - ultimaHora < 5 * 60e3;
  ultimoAutor = m.autor_id; ultimaHora = t;
  const meu = m.autor_id === P.id;
  let anexo = '';
  if (m.arquivo) {
    const u = await linkArquivo(m.arquivo);
    anexo = /^image\//.test(m.arquivo_tipo || '')
      ? `<a class="img" href="${u}" target="_blank" rel="noopener"><img src="${u}" alt="${esc(m.arquivo_nome)}" loading="lazy" onerror="if(!this.dataset.r){this.dataset.r=1;this.src+='&r='+Date.now()}"></a>`
      : `<a class="arq" href="${u}" target="_blank" rel="noopener" download="${esc(m.arquivo_nome)}"><span class="arq__ico">${esc((m.arquivo_nome.split('.').pop() || 'arq').slice(0, 4).toUpperCase())}</span><span><b>${esc(m.arquivo_nome)}</b><small>${tamanho(m.arquivo_tamanho || 0)} · baixar</small></span></a>`;
  }
  $('msgs').insertAdjacentHTML('beforeend', `
    <div class="msg${meu ? ' msg--minha' : ''}${junto ? ' msg--junto' : ''}${anima ? ' msg--nova' : ''}" data-id="${m.id}">
      ${junto || meu ? '' : `<span class="msg__av">${iniciais(pessoas.get(m.autor_id))}</span>`}
      <div class="msg__balao">
        ${junto || meu ? '' : `<b class="msg__autor">${esc(pessoas.get(m.autor_id) || 'Equipe')}</b>`}
        ${anexo}${m.texto ? `<p>${formata(m.texto)}</p>` : ''}
        <span class="msg__h">${hora(m.criado_em)}</span>
      </div>
    </div>`);
}
const perto = () => $('msgs').scrollHeight - $('msgs').scrollTop - $('msgs').clientHeight < 160;
const rolaFim = () => { $('msgs').scrollTop = $('msgs').scrollHeight; };

// arquivos do canal
async function carregaArquivos() {
  $('arqs').innerHTML = '<p class="carrega">Carregando…</p>';
  const { data } = await banco.from('mensagem').select('arquivo,arquivo_nome,arquivo_tipo,arquivo_tamanho,autor_id,criado_em')
    .eq('canal_id', atual.id).not('arquivo', 'is', null).order('criado_em', { ascending: false }).limit(200);
  if (!data?.length) { $('arqs').innerHTML = '<p class="carrega">Nenhum arquivo trocado neste canal ainda. Arraste um arquivo para a conversa.</p>'; return; }
  const itens = await Promise.all(data.map(async a => {
    const u = await linkArquivo(a.arquivo);
    const img = /^image\//.test(a.arquivo_tipo || '');
    return `<a class="arq-card" href="${u}" target="_blank" rel="noopener" download="${esc(a.arquivo_nome)}">
      ${img ? `<img src="${u}" alt="" loading="lazy" onerror="if(!this.dataset.r){this.dataset.r=1;this.src+='&r='+Date.now()}">` : `<span class="arq__ico arq__ico--g">${esc((a.arquivo_nome.split('.').pop() || 'arq').slice(0, 4).toUpperCase())}</span>`}
      <b>${esc(a.arquivo_nome)}</b><small>${esc(pessoas.get(a.autor_id) || '')} · ${new Date(a.criado_em).toLocaleDateString('pt-BR')} · ${tamanho(a.arquivo_tamanho || 0)}</small></a>`;
  }));
  $('arqs').innerHTML = `<div class="arq-grade">${itens.join('')}</div>`;
}

// escrever e enviar
let anexos = [];
const txt = $('texto');
const cresce = () => { txt.style.height = 'auto'; txt.style.height = Math.min(txt.scrollHeight, 160) + 'px'; };
txt.addEventListener('input', cresce);
txt.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('escrever').requestSubmit(); } });
$('arquivo').addEventListener('change', e => { poeAnexos([...e.target.files]); e.target.value = ''; });
txt.addEventListener('paste', e => { const f = [...(e.clipboardData?.files || [])]; if (f.length) { e.preventDefault(); poeAnexos(f); } });

function poeAnexos(fs) {
  const grandes = fs.filter(f => f.size > 50 * 1048576);
  if (grandes.length) alert('Arquivo acima de 50 MB não vai pela conversa: ' + grandes.map(f => f.name).join(', '));
  anexos.push(...fs.filter(f => f.size <= 50 * 1048576));
  desenhaAnexos();
}
function desenhaAnexos() {
  $('anexo-prev').hidden = !anexos.length;
  $('anexo-prev').innerHTML = anexos.map((f, i) => `<span class="chip-arq">${esc(f.name)} <small>${tamanho(f.size)}</small><button type="button" data-i="${i}" aria-label="Tirar">×</button></span>`).join('');
}
$('anexo-prev').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { anexos.splice(+b.dataset.i, 1); desenhaAnexos(); } });

// arrastar arquivo para a conversa
let profundidade = 0;
$('fio').addEventListener('dragenter', e => { if (!atual || ![...e.dataTransfer.types].includes('Files')) return; profundidade++; $('soltar').hidden = false; });
$('fio').addEventListener('dragleave', () => { if (--profundidade <= 0) { profundidade = 0; $('soltar').hidden = true; } });
$('fio').addEventListener('dragover', e => { if (atual) e.preventDefault(); });
$('fio').addEventListener('drop', e => { e.preventDefault(); profundidade = 0; $('soltar').hidden = true; if (atual) { mostraAba('conversa'); poeAnexos([...e.dataTransfer.files]); txt.focus(); } });

let enviando = false;
$('escrever').addEventListener('submit', async e => {
  e.preventDefault();
  const texto = txt.value.trim();
  if (enviando || !atual || (!texto && !anexos.length)) return;
  enviando = true; $('escrever').classList.add('enviando');
  try {
    const canal = atual.id;
    // arquivos: cada um vira uma mensagem; o texto vai junto do primeiro
    for (const [i, f] of anexos.entries()) {
      const nome = f.name.normalize('NFD').replace(/[^\w.-]+/g, '_');
      const caminho = `${canal}/${crypto.randomUUID()}-${nome}`;
      const { error: up } = await banco.storage.from('conversas').upload(caminho, f, { contentType: f.type || 'application/octet-stream' });
      if (up) throw up;
      await banco.from('mensagem').insert({ canal_id: canal, autor_id: P.id, texto: i === 0 && texto ? texto : null,
        arquivo: caminho, arquivo_nome: f.name, arquivo_tipo: f.type, arquivo_tamanho: f.size });
    }
    if (!anexos.length) await banco.from('mensagem').insert({ canal_id: canal, autor_id: P.id, texto });
    txt.value = ''; cresce(); anexos = []; desenhaAnexos();
  } catch (err) {
    alert('Não deu para enviar. Tente de novo.');
  } finally { enviando = false; $('escrever').classList.remove('enviando'); }
});

// tempo real: toda mensagem que eu posso ver chega aqui (a regra do banco filtra)
banco.channel('coleve-conversas')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagem' }, async ({ new: m }) => {
    const c = canais.find(x => x.id === m.canal_id);
    if (!c) { await carregaCanais(); return; }
    c.ultima_em = m.criado_em; c.ultima_txt = m.texto || '📎 ' + m.arquivo_nome;
    if (atual?.id === m.canal_id && (!MINI || document.visibilityState === 'visible')) {
      const embaixo = perto() || m.autor_id === P.id;
      $('msgs').querySelector('.fio__comeco')?.remove();
      await poe(m);
      if (embaixo) rolaFim();
      if (aba === 'arquivos' && m.arquivo) carregaArquivos();
      if (document.visibilityState === 'visible') banco.rpc('marcar_lido', { c: m.canal_id });
    } else if (m.autor_id !== P.id) {
      c.nao_lidas = (c.nao_lidas || 0) + 1;
      avisoNavegador(m, c);
    }
    canais.sort((a, b) => (a.tipo === 'direto') - (b.tipo === 'direto') || (a.slug === 'geral' ? -1 : b.slug === 'geral' ? 1 : 0) || new Date(b.ultima_em || 0) - new Date(a.ultima_em || 0));
    desenhaCanais();
  })
  .subscribe();

// aviso do navegador quando a aba está escondida
function avisoNavegador(m, c) {
  if (document.visibilityState === 'visible' || !('Notification' in window) || Notification.permission !== 'granted') return;
  const n = new Notification((pessoas.get(m.autor_id) || 'Equipe') + (c.tipo === 'direto' ? '' : ' em #' + c.nome), { body: m.texto || '📎 ' + m.arquivo_nome, icon: '../../img/icone.svg', tag: c.id });
  n.onclick = () => { window.focus(); abre(c.id); };
}
document.addEventListener('click', () => { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); }, { once: true });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && atual) banco.rpc('marcar_lido', { c: atual.id }); });

// nova conversa direta
$('nova').onclick = () => {
  const outros = [...pessoas].filter(([id]) => id !== P.id);
  $('pessoas').innerHTML = outros.length
    ? outros.map(([id, nome]) => `<li><button type="button" data-id="${id}"><span class="canal__ico canal__ico--pessoa">${iniciais(nome)}</span>${esc(nome)}</button></li>`).join('')
    : '<li class="carrega">Ainda não tem mais ninguém da equipe no sistema. Quando o Emmanuel e o time forem convidados, eles aparecem aqui.</li>';
  $('dlg-nova').showModal();
};
$('pessoas').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  const { data: id, error } = await banco.rpc('abrir_direto', { outro: b.dataset.id });
  $('dlg-nova').close();
  if (error) return alert('Não deu para abrir a conversa.');
  await carregaCanais(); abre(id);
});

await carregaCanais();
// abre o canal do endereço (#fiscal) ou, no computador, o #geral
const alvo = location.hash.slice(1);
const inicial = canais.find(c => c.slug === alvo || c.id === alvo) || (largo() ? canais.find(c => c.slug === 'geral') : null);
if (inicial) await abre(inicial.id);
document.body.classList.remove('carregando');
