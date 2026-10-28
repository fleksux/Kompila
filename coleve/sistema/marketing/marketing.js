// Sistema Coleve · marketing: demanda → versão → aprovação, com a Interface real do Instagram
import { banco, quemSou } from '../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const dataBR = d => d ? d.split('-').reverse().slice(0, 2).join('/') : '';
const hora = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const limpo = n => n.normalize('NFD').replace(/[^\w.-]+/g, '_');
const FORMATOS = { feed: 'Post', carrossel: 'Carrossel', story: 'Story', reels: 'Reels', outro: 'Outro' };
const STATUS = {
  aprovacao: ['Esperando aprovação', 'st-aprov'], ajuste: ['Ajustar', 'st-ajuste'], pedido: ['Pedidos novos', 'st-pedido'],
  produzindo: ['Produzindo', 'st-prod'], aprovado: ['Aprovados', 'st-ok'], publicado: ['Publicados', 'st-pub']
};
const ORDEM = ['aprovacao', 'ajuste', 'pedido', 'produzindo', 'aprovado', 'publicado'];

$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

const pessoas = new Map();
const { data: pes } = await banco.from('pessoa').select('id,nome,area').eq('tipo', 'equipe').eq('ativo', true);
(pes || []).forEach(p => pessoas.set(p.id, p));
const responsavelPadrao = (pes || []).find(p => ['marketing', 'tecnologia'].includes(p.area))?.id || P.id;

// links assinados em lote
const links = new Map();
async function assina(caminhos) {
  const faltam = [...new Set(caminhos.filter(c => c && !links.has(c)))];
  if (faltam.length) {
    const { data } = await banco.storage.from('marketing').createSignedUrls(faltam, 3600);
    (data || []).forEach(d => links.set(d.path, d.signedUrl));
  }
}
const link = c => links.get(c) || '';
const ehVideo = t => /^video\//.test(t || '');
// link do Google Drive: pega o id do arquivo; mostra pelo player do próprio Drive
const idDrive = u => (String(u || '').match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{20,})/) || String(u || '').match(/[?&]id=([\w-]{20,})/) || [])[1];
const thumbDrive = (id, w = 800) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
const playerDrive = id => `https://drive.google.com/file/d/${id}/preview`;

// ===== Google Drive (o armário dos arquivos) =====
let driveOn = false, driveEmail = '';
async function chamaDrive(acao, extra = {}) {
  const { data, error } = await banco.functions.invoke('drive', { body: { acao, ...extra } });
  if (error || data?.erro) throw new Error(data?.erro || error?.message || 'Drive');
  return data;
}
// manda o arquivo direto do navegador para a pasta da demanda no Drive (sem passar pelo banco)
function mandaProDrive(demandaId, sub, arquivo, progresso) {
  return chamaDrive('enviar', { demanda_id: demandaId, sub, nome: arquivo.name, tipo: arquivo.type || 'application/octet-stream', tamanho: arquivo.size })
    .then(({ envio }) => new Promise((ok, falha) => {
      const x = new XMLHttpRequest();
      x.open('PUT', envio);
      x.upload.onprogress = e => progresso?.(e.loaded / e.total);
      x.onload = () => x.status < 300 ? ok(JSON.parse(x.responseText)) : falha(new Error('Drive ' + x.status));
      x.onerror = () => falha(new Error('rede'));
      x.send(arquivo);
    }))
    .then(f => chamaDrive('pronto', { arquivo_id: f.id }))
    .then(f => ({ drive: f.id, nome: f.name, tipo: f.mimeType }));
}
async function sobe(pasta, arquivo, progresso) {
  if (!driveOn) { try { driveOn = (await chamaDrive('status')).conectado; } catch { /* segue no banco */ } }
  if (driveOn) {
    const [demandaId, ...resto] = pasta.split('/');
    return mandaProDrive(demandaId, resto.join('/') || null, arquivo, progresso);
  }
  const caminho = `${pasta}/${crypto.randomUUID().slice(0, 8)}-${limpo(arquivo.name)}`;
  const { error } = await banco.storage.from('marketing').upload(caminho, arquivo, { contentType: arquivo.type || 'application/octet-stream' });
  if (error) throw error;
  return { arquivo: caminho, nome: arquivo.name, tipo: arquivo.type };
}

// ===== lista e feed =====
let demandas = [], vista = 'lista';
async function carrega() {
  const { data } = await banco.from('v_demanda').select('*').neq('status', 'cancelado').order('data_prevista', { ascending: true, nullsFirst: false });
  demandas = data || [];
  await assina(demandas.map(d => d.arquivos_atuais?.[0]?.arquivo));
  desenha();
}
function capa(d) {
  const a = d.arquivos_atuais?.[0];
  if (!a) return `<span class="capa capa--vazia">${FORMATOS[d.formato]}</span>`;
  if (a.drive) return `<img class="capa" src="${thumbDrive(a.drive, 400)}" alt="" referrerpolicy="no-referrer">`;
  return ehVideo(a.tipo) ? `<video class="capa" src="${link(a.arquivo)}" muted preload="metadata"></video>` : `<img class="capa" src="${link(a.arquivo)}" alt="">`;
}
// filtro por status no topo: cada grupo a um clique, com a contagem à vista
let filtroSt = (() => { try { return sessionStorage.getItem('coleve_mk_st'); } catch { return null; } })();
function desenhaFiltro() {
  const n = st => demandas.filter(d => d.status === st).length;
  if (!filtroSt) filtroSt = ['aprovacao', 'ajuste', 'produzindo'].find(st => n(st)) || 'pedido';
  $('filtro-st').innerHTML = [...ORDEM, 'todos'].map(st => {
    const [nome, cls] = st === 'todos' ? ['Todos', 'st-todos'] : STATUS[st];
    const qt = st === 'todos' ? demandas.length : n(st);
    return `<button type="button" role="tab" class="chip-st${filtroSt === st ? ' is-ativo' : ''}${!qt ? ' chip-st--zero' : ''}" data-st="${st}" aria-selected="${filtroSt === st}"><span class="st ${cls}">${nome}</span><b>${qt}</b></button>`;
  }).join('');
}
$('filtro-st').addEventListener('click', e => {
  const b = e.target.closest('.chip-st'); if (!b) return;
  filtroSt = b.dataset.st; try { sessionStorage.setItem('coleve_mk_st', filtroSt); } catch { /* sem memória, segue */ }
  desenha();
});
function desenha() {
  desenhaFiltro();
  $('lista').innerHTML = ORDEM.filter(st => filtroSt === 'todos' || st === filtroSt).map(st => {
    const ds = demandas.filter(d => d.status === st);
    if (!ds.length && filtroSt === 'todos' && !['aprovacao', 'pedido'].includes(st)) return '';
    const [nome, cls] = STATUS[st];
    return `<section class="grupo-mk"><h2><span class="st ${cls}">${nome}</span><small>${ds.length}</small></h2>
      ${ds.length ? `<div class="linhas">${ds.map(d => `
        <button class="linha" data-id="${d.id}">
          ${capa(d)}
          <span class="linha__txt"><b>${esc(d.titulo)}</b>
            <small>${FORMATOS[d.formato]}${d.data_prevista ? ' · para ' + dataBR(d.data_prevista) : ''}${d.versao_atual ? ' · versão ' + d.versao_atual : ''}${d.referencias ? ' · ' + d.referencias + ' referência' + (d.referencias > 1 ? 's' : '') : ''}</small></span>
          <span class="linha__quem">pedido por ${esc((d.pedido_por_nome || '').split(' ')[0])}</span>
        </button>`).join('')}</div>` : `<p class="vazio-mk">${{ aprovacao: 'Nada esperando aprovação.', ajuste: 'Nenhum ajuste pedido.', pedido: 'Nenhum pedido novo. Clique em "+ Nova demanda".', produzindo: 'Nada em produção agora.', aprovado: 'Nenhum aprovado esperando publicação.', publicado: 'Nada publicado ainda.' }[st]}</p>`}
    </section>`;
  }).join('');
  const noFeed = demandas.filter(d => ['aprovacao', 'aprovado', 'publicado'].includes(d.status) && d.arquivos_atuais?.length)
    .sort((a, b) => (b.data_prevista || '').localeCompare(a.data_prevista || ''));
  $('feed').innerHTML = `<div class="perfil-ig"><span class="ig__av ig__av--g"><img src="../../img/icone.svg" alt=""></span><div><b>coleve.contabilidade</b><small>Como os próximos posts ficam juntos no perfil</small></div></div>
    <div class="grade-ig">${noFeed.map(d => `<button class="quad${d.status === 'aprovacao' ? ' quad--esp' : ''}" data-id="${d.id}">${capa(d)}${d.status === 'aprovacao' ? '<em>esperando</em>' : ''}${d.arquivos_atuais.length > 1 ? '<i>❐</i>' : ''}</button>`).join('') || '<p class="vazio-mk">Quando houver post com versão, ele aparece aqui na grade.</p>'}</div>`;
}
document.querySelector('.vista').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  vista = b.dataset.v;
  document.querySelectorAll('.vista button').forEach(x => { x.classList.toggle('is-ativo', x === b); x.setAttribute('aria-selected', x === b); });
  $('lista').hidden = $('filtro-st').hidden = vista !== 'lista'; $('feed').hidden = vista !== 'feed';
});
['lista', 'feed'].forEach(id => $(id).addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) abre(b.dataset.id); }));

// referência que foi pro Drive guarda o link do arquivo
const refDe = a => a.drive ? { link: `https://drive.google.com/file/d/${a.drive}/view`, nome: a.nome, tipo: a.tipo } : a;

// ===== nova demanda =====
$('nova').onclick = () => { $('f-nova').reset(); $('aviso-nova').textContent = ''; $('dlg-nova').showModal(); };
$('cancela-nova').onclick = () => $('dlg-nova').close();
$('f-nova').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, titulo = f.titulo.value.trim();
  if (!titulo) { $('aviso-nova').textContent = 'Escreva o que você precisa.'; return; }
  $('cria').disabled = true; $('cria').textContent = 'Criando…';
  try {
    const { data: d, error } = await banco.from('demanda').insert({
      titulo, formato: f.formato.value, data_prevista: f.data.value || null, briefing: f.briefing.value.trim() || null, legenda: f.legenda.value.trim() || null,
      pedido_por: P.id, responsavel_id: responsavelPadrao
    }).select().single();
    if (error) throw error;
    const refs = f.links.value.split('\n').map(x => x.trim()).filter(Boolean).map(l => ({ demanda_id: d.id, link: l, criado_por: P.id }));
    for (const a of f.arquivos.files) refs.push({ demanda_id: d.id, ...refDe(await sobe(`${d.id}/referencias`, a)), criado_por: P.id });
    if (refs.length) await banco.from('demanda_referencia').insert(refs);
    $('dlg-nova').close();
    await carrega(); abre(d.id);
  } catch (err) { $('aviso-nova').textContent = 'Não deu para criar. Tente de novo.'; }
  finally { $('cria').disabled = false; $('cria').textContent = 'Criar demanda'; }
});

// ===== demanda aberta =====
let atual = null, versoes = [], vSel = null, quadro = 0, marcando = false, novos = [];
async function abre(id) {
  atual = demandas.find(d => d.id === id); if (!atual) return;
  history.replaceState(null, '', '#' + id);
  $('dm').hidden = false; document.body.style.overflow = 'hidden';
  const [{ data: vs }, { data: rs }] = await Promise.all([
    banco.from('demanda_versao').select('*').eq('demanda_id', id).order('numero'),
    banco.from('demanda_referencia').select('*').eq('demanda_id', id).order('criado_em')
  ]);
  versoes = vs || [];
  await assina([...versoes.flatMap(v => v.arquivos.map(a => a.arquivo)), ...(rs || []).map(r => r.arquivo)]);
  vSel = versoes.at(-1) || null; quadro = 0; marcando = false; novos = [];
  $('v-prev').innerHTML = ''; $('v-leg').value = atual.legenda || ''; $('aviso-v').textContent = '';
  $('f-ajuste').hidden = true;
  desenhaInfo(); desenhaVersoes(); desenhaIg(); desenhaRefs(rs || []); carregaChat();
}
function fecha() { $('dm').hidden = true; document.body.style.overflow = ''; atual = null; history.replaceState(null, '', location.pathname); carrega(); }
document.querySelectorAll('[data-fecha]').forEach(x => x.addEventListener('click', fecha));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('dm').hidden && !document.querySelector('dialog[open]')) fecha(); });

function desenhaInfo() {
  const [nome, cls] = STATUS[atual.status] || [atual.status, ''];
  $('dm-status').innerHTML = `<span class="st ${cls}">${nome.replace(/s$/, '').replace('Pedidos novo', 'Pedido novo')}</span>`;
  $('dm-titulo').textContent = atual.titulo;
  $('dm-meta').textContent = `${FORMATOS[atual.formato]}${atual.data_prevista ? ' · para ' + dataBR(atual.data_prevista) : ''} · pedido por ${atual.pedido_por_nome || ''} · com ${atual.responsavel_nome || ''}`;
  $('dm-brief').textContent = atual.briefing || 'Sem observações.';
  const ultima = versoes.at(-1);
  const esperando = atual.status === 'aprovacao' && ultima && !ultima.decisao;
  // quem fez a arte envia; quem pediu aprova. Ninguém aprova a própria arte.
  const souQuemFaz = esperando ? ultima.enviado_por === P.id : (atual.responsavel_id === P.id || atual.pedido_por !== P.id);
  const quemAprova = (atual.pedido_por_nome || 'quem pediu').split(' ')[0];
  $('decide').hidden = !(esperando && ultima.enviado_por !== P.id);
  $('enviado').hidden = !(esperando && ultima.enviado_por === P.id);
  $('enviado').innerHTML = `✓ Enviado · esperando <b>${esc(quemAprova)}</b> aprovar`;
  $('publicado').hidden = atual.status !== 'aprovado';
  $('caixa-versao').hidden = ['aprovado', 'publicado'].includes(atual.status) || esperando || !souQuemFaz;
  $('caixa-titulo').textContent = atual.status === 'ajuste' ? 'Enviar arte corrigida' : 'Enviar arte';
  $('v-envia').textContent = `Enviar para ${quemAprova === 'quem pediu' ? 'aprovação' : quemAprova + ' aprovar'}`;
  $('dm-ultimo').innerHTML = ultima?.decisao
    ? `<div class="decisao ${ultima.decisao === 'aprovado' ? 'decisao--ok' : 'decisao--aj'}"><b>${ultima.decisao === 'aprovado' ? '✓ Aprovado' : '✏️ Ajuste pedido'}</b> por ${esc(pessoas.get(ultima.decidido_por)?.nome || '')} · ${hora(ultima.decidido_em)}${ultima.comentario ? `<p>${esc(ultima.comentario)}</p>` : ''}</div>` : '';
}
function desenhaVersoes() {
  $('versoes').innerHTML = versoes.length ? versoes.map(v => `<button class="${v === vSel ? 'is-ativo' : ''}" data-n="${v.numero}">v${v.numero}${v.decisao === 'aprovado' ? ' ✓' : v.decisao === 'ajuste' ? ' ✏️' : ''}</button>`).join('') : '';
}
$('versoes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; vSel = versoes.find(v => v.numero == b.dataset.n); quadro = 0; desenhaVersoes(); desenhaIg(); });

async function desenhaIg() {
  const ig = $('ig'); ig.classList.toggle('ig--story', ['story', 'reels'].includes(atual.formato));
  const arqs = vSel?.arquivos || [];
  if (!arqs.length) {
    $('ig-midia').innerHTML = `<div class="ig__vazio"><b>${FORMATOS[atual.formato]}</b><span>Assim que a primeira versão subir, ela aparece aqui do jeito que fica no Instagram.</span></div>`;
    $('ig-pontos').innerHTML = ''; $('ig-leg').innerHTML = atual.briefing ? '' : ''; return;
  }
  const a = arqs[quadro];
  const { data: marcas } = await banco.from('demanda_marca').select('*').eq('versao_id', vSel.id).eq('quadro', quadro);
  $('ig-midia').innerHTML = `
    ${a.drive && /^image\//.test(a.tipo || '') ? `<img src="${thumbDrive(a.drive, 1600)}" alt="${esc(a.nome)}" referrerpolicy="no-referrer">` : a.drive ? `<iframe class="drive" src="${playerDrive(a.drive)}" allow="autoplay" title="${esc(a.nome)}"></iframe>` : ehVideo(a.tipo) ? `<video src="${link(a.arquivo)}" controls playsinline></video>` : `<img src="${link(a.arquivo)}" alt="${esc(a.nome)}">`}
    ${(marcas || []).map((m, i) => `<span class="marca" style="left:${m.x}%;top:${m.y}%" title="${esc(m.texto)}">${i + 1}<em>${esc(m.texto)}</em></span>`).join('')}
    ${arqs.length > 1 ? `<button class="ig__seta ig__seta--e" data-d="-1" ${quadro === 0 ? 'hidden' : ''} aria-label="Anterior">‹</button><button class="ig__seta ig__seta--d" data-d="1" ${quadro === arqs.length - 1 ? 'hidden' : ''} aria-label="Próxima">›</button><span class="ig__n">${quadro + 1}/${arqs.length}</span>` : ''}
    ${['story', 'reels'].includes(atual.formato) ? `<div class="ig__barras">${arqs.map((_, i) => `<i class="${i <= quadro ? 'on' : ''}"></i>`).join('')}</div>` : ''}`;
  $('ig-pontos').innerHTML = arqs.length > 1 ? arqs.map((_, i) => `<i class="${i === quadro ? 'on' : ''}"></i>`).join('') : '';
  const leg = vSel.legenda || '';
  const curta = leg.length > 125 ? esc(leg.slice(0, 125)) + `… <button class="ig__mais" type="button">mais</button>` : esc(leg);
  $('ig-leg').innerHTML = leg ? `<b>coleve.contabilidade</b> ${curta.replace(/\n/g, '<br>')}` : '';
  $('ig-leg').querySelector('.ig__mais')?.addEventListener('click', () => { $('ig-leg').innerHTML = `<b>coleve.contabilidade</b> ${esc(leg).replace(/\n/g, '<br>')}`; });
}
$('ig-midia').addEventListener('click', async e => {
  const s = e.target.closest('.ig__seta');
  if (s) { quadro += +s.dataset.d; desenhaIg(); return; }
  if (!marcando || !vSel || e.target.closest('.marca') || ['VIDEO', 'IFRAME'].includes(e.target.tagName)) return;
  const r = $('ig-midia').getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width * 100).toFixed(2), y = ((e.clientY - r.top) / r.height * 100).toFixed(2);
  pendente = { x, y, quadro };
  $('ig-midia').querySelector('.marca--nova')?.remove();
  $('ig-midia').insertAdjacentHTML('beforeend', `<span class="marca marca--nova" style="left:${x}%;top:${y}%">+</span>`);
  $('marca-linha').hidden = false; $('marca-txt').focus();
});
let pendente = null;
$('marca-ok').onclick = async () => {
  const texto = $('marca-txt').value.trim(); if (!texto || !pendente) return;
  await banco.from('demanda_marca').insert({ versao_id: vSel.id, ...pendente, texto, autor_id: P.id });
  pendente = null; $('marca-txt').value = ''; $('marca-linha').hidden = true; desenhaIg();
};
$('marca-txt').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('marca-ok').click(); } });

// aprovar / ajustar
$('aprovar').onclick = async () => {
  const v = versoes.at(-1);
  const { error } = await banco.from('demanda_versao').update({ decisao: 'aprovado', decidido_por: P.id, decidido_em: new Date().toISOString() }).eq('id', v.id);
  if (!error) { atual.status = 'aprovado'; Object.assign(v, { decisao: 'aprovado', decidido_por: P.id, decidido_em: new Date().toISOString() }); desenhaInfo(); desenhaVersoes(); }
};
$('ajustar').onclick = () => { $('f-ajuste').hidden = false; marcando = true; $('dica-marca').hidden = false; $('ig').classList.add('ig--marcando'); vSel = versoes.at(-1); desenhaVersoes(); desenhaIg(); $('aj-texto').focus(); };
$('aj-cancela').onclick = () => { $('f-ajuste').hidden = true; marcando = false; $('dica-marca').hidden = true; $('ig').classList.remove('ig--marcando'); };
$('f-ajuste').addEventListener('submit', async e => {
  e.preventDefault();
  const v = versoes.at(-1), comentario = $('aj-texto').value.trim() || null;
  const agora = new Date().toISOString();
  const { error } = await banco.from('demanda_versao').update({ decisao: 'ajuste', comentario, decidido_por: P.id, decidido_em: agora }).eq('id', v.id);
  if (error) return;
  Object.assign(v, { decisao: 'ajuste', comentario, decidido_por: P.id, decidido_em: agora }); atual.status = 'ajuste';
  $('aj-cancela').click(); $('aj-texto').value = ''; desenhaInfo(); desenhaVersoes();
});
$('publicado').onclick = async () => { await banco.from('demanda').update({ status: 'publicado' }).eq('id', atual.id); atual.status = 'publicado'; desenhaInfo(); };

// nova versão
const poeNovos = fs => {
  novos.push(...[...fs].filter(f => f.size <= 50 * 1048576));
  if ([...fs].some(f => f.size > 50 * 1048576)) $('aviso-v').textContent = 'Arquivo acima de 50 MB ficou de fora.';
  $('v-prev').innerHTML = novos.map((f, i) => `<span class="chip-arq">${i + 1}. ${esc(f.name)}<button type="button" data-i="${i}" aria-label="Tirar">×</button></span>`).join('');
};
$('v-arquivos').addEventListener('change', e => { poeNovos(e.target.files); e.target.value = ''; });
$('v-prev').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { novos.splice(+b.dataset.i, 1); poeNovos([]); } });
['dragover', 'drop'].forEach(ev => $('soltar-mk').addEventListener(ev, e => { e.preventDefault(); if (ev === 'drop') poeNovos(e.dataTransfer.files); }));
$('v-envia').onclick = async () => {
  const drives = $('v-drive').value.split(/\s+/).map(idDrive).filter(Boolean);
  if ($('v-drive').value.trim() && !drives.length) { $('aviso-v').textContent = 'Esse link não parece ser de um arquivo do Google Drive.'; return; }
  if (!novos.length && !drives.length) { $('aviso-v').textContent = 'Escolha uma imagem ou vídeo, ou cole o link do Drive.'; return; }
  $('v-envia').disabled = true; $('v-envia').textContent = 'Subindo…';
  try {
    const numero = (versoes.at(-1)?.numero || 0) + 1;
    const arquivos = [];
    for (const [i, f] of novos.entries()) arquivos.push(await sobe(`${atual.id}/v${numero}`, f, p => { $('aviso-v').textContent = `Subindo ${i + 1} de ${novos.length}: ${Math.round(p * 100)}%`; }));
    drives.forEach((id, i) => arquivos.push({ drive: id, nome: 'Drive ' + (i + 1), tipo: 'drive' }));
    const { error } = await banco.from('demanda_versao').insert({ demanda_id: atual.id, numero, arquivos, legenda: $('v-leg').value.trim() || null, enviado_por: P.id });
    if (error) throw error;
    $('v-drive').value = '';
    await carrega(); abre(atual.id);
  } catch { $('aviso-v').textContent = 'Não deu para subir. Tente de novo.'; }
  finally { $('v-envia').disabled = false; desenhaInfo(); }
};

// referências
function desenhaRefs(rs) {
  $('refs').innerHTML = rs.length ? rs.map(r => r.link && idDrive(r.link)
    ? `<a class="ref" href="${esc(r.link)}" target="_blank" rel="noopener"><img src="${thumbDrive(idDrive(r.link))}" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'▶'}))"><b>Arquivo do Drive</b></a>`
    : r.link
    ? `<a class="ref ref--link" href="${esc(r.link)}" target="_blank" rel="noopener"><span>🔗</span><b>${esc(r.link.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48))}</b></a>`
    : `<a class="ref" href="${link(r.arquivo)}" target="_blank" rel="noopener">${/^image\//.test(r.tipo) ? `<img src="${link(r.arquivo)}" alt="">` : ehVideo(r.tipo) ? `<video src="${link(r.arquivo)}" muted preload="metadata"></video>` : '<span>📎</span>'}<b>${esc(r.nome)}</b></a>`).join('')
    : '<p class="vazio-mk">Sem referência ainda.</p>';
}
$('ref-mais').onclick = () => { $('f-ref').hidden = !$('f-ref').hidden; };
$('f-ref').addEventListener('submit', async e => {
  e.preventDefault();
  const novos = [];
  if ($('ref-link').value.trim()) novos.push({ demanda_id: atual.id, link: $('ref-link').value.trim(), criado_por: P.id });
  for (const a of $('ref-arq').files) novos.push({ demanda_id: atual.id, ...refDe(await sobe(`${atual.id}/referencias`, a)), criado_por: P.id });
  if (!novos.length) return;
  await banco.from('demanda_referencia').insert(novos);
  $('f-ref').reset(); $('f-ref').hidden = true; abre(atual.id);
});

// conversa da demanda
async function carregaChat() {
  if (!atual.canal_id) { $('mini-chat').innerHTML = ''; return; }
  const { data } = await banco.from('mensagem').select('*').eq('canal_id', atual.canal_id).order('criado_em').limit(100);
  $('mini-chat').innerHTML = (data || []).map(m => `<div class="mc${m.autor_id === P.id ? ' mc--minha' : ''}"><b>${esc((pessoas.get(m.autor_id)?.nome || '').split(' ')[0])}</b> <span>${hora(m.criado_em)}</span><p>${esc(m.texto || '📎 ' + m.arquivo_nome)}</p></div>`).join('') || '<p class="vazio-mk">Tire as dúvidas desta demanda aqui.</p>';
  $('mini-chat').scrollTop = $('mini-chat').scrollHeight;
}
$('f-msg').addEventListener('submit', async e => {
  e.preventDefault();
  const texto = $('msg').value.trim(); if (!texto || !atual?.canal_id) return;
  $('msg').value = '';
  await banco.from('mensagem').insert({ canal_id: atual.canal_id, autor_id: P.id, texto });
  carregaChat();
});
// ===== tempo real: a tela atualiza sozinha =====
const novidades = new Set();
let espera;
const recarrega = () => { clearTimeout(espera); espera = setTimeout(async () => {
  await carrega();
  novidades.forEach(id => document.querySelector(`.linha[data-id="${id}"], .quad[data-id="${id}"]`)?.classList.add('linha--nova'));
  if (atual && !$('dm').hidden) {
    atual = demandas.find(d => d.id === atual.id) || atual;
    const { data: vs } = await banco.from('demanda_versao').select('*').eq('demanda_id', atual.id).order('numero');
    versoes = vs || []; vSel = versoes.find(v => v.numero === vSel?.numero) || versoes.at(-1) || null;
    await assina(versoes.flatMap(v => v.arquivos.map(a => a.arquivo)));
    desenhaInfo(); desenhaVersoes(); desenhaIg();
  }
}, 400); };
const nome1 = id => (pessoas.get(id)?.nome || 'Alguém').split(' ')[0];
const toast = txt => {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = txt;
  document.body.appendChild(t); setTimeout(() => t.classList.add('toast--sai'), 5000); setTimeout(() => t.remove(), 5600);
};
banco.channel('coleve-mk')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagem' }, ({ new: m }) => { if (atual && m.canal_id === atual.canal_id) carregaChat(); })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'demanda' }, ({ eventType, new: d }) => {
    if (eventType === 'INSERT' && d.pedido_por !== P.id) { novidades.add(d.id); toast(`🆕 Novo pedido de ${nome1(d.pedido_por)}: ${d.titulo}`); }
    recarrega();
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'demanda_versao' }, ({ eventType, new: v, old: o }) => {
    const t = demandas.find(d => d.id === v.demanda_id)?.titulo || 'post';
    if (eventType === 'INSERT' && v.enviado_por !== P.id) { novidades.add(v.demanda_id); toast(`👀 ${nome1(v.enviado_por)} mandou a versão ${v.numero} de ${t}`); }
    if (eventType === 'UPDATE' && v.decisao && v.decisao !== o?.decisao && v.decidido_por !== P.id) {
      novidades.add(v.demanda_id); toast(v.decisao === 'aprovado' ? `✅ ${nome1(v.decidido_por)} aprovou ${t}` : `✏️ ${nome1(v.decidido_por)} pediu ajuste em ${t}`);
    }
    recarrega();
  })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'demanda_referencia' }, ({ new: r }) => { if (atual?.id === r.demanda_id) abre(atual.id); })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'demanda_marca' }, () => { if (atual && !$('dm').hidden) desenhaIg(); })
  .subscribe();

async function statusDrive() {
  try { const st = await chamaDrive('status'); driveOn = st.conectado; driveEmail = st.email || ''; } catch { driveOn = false; }
  $('drive-pill').innerHTML = driveOn
    ? `<span class="dp dp--on">Drive ligado · ${esc(driveEmail)}</span>`
    : P.papel === 'admin' ? `<button class="dp dp--btn" id="drive-ligar" type="button">Conectar meu Google Drive</button>` : `<span class="dp">Drive não conectado</span>`;
  $('drive-ligar')?.addEventListener('click', async () => {
    try { const { url } = await chamaDrive('url', { volta: location.href.split('#')[0].split('?')[0] }); location.href = url; }
    catch (e) { alert('Não deu para abrir o Google: ' + e.message); }
  });
  $('abrir-pasta').hidden = !driveOn;
}
const q = new URLSearchParams(location.search);
if (q.get('drive')) {
  $('aviso-drive').textContent = q.get('drive') === 'ok' ? 'Drive conectado. A partir de agora os arquivos vão direto para Coleve / Marketing no seu Drive.' : 'O Drive não conectou: ' + (q.get('motivo') || 'tente de novo');
  $('aviso-drive').className = 'aviso-drive ' + (q.get('drive') === 'ok' ? 'aviso-drive--ok' : '');
  history.replaceState(null, '', location.pathname);
}
await statusDrive();
$('abrir-pasta').onclick = async () => {
  const w = window.open('about:blank', '_blank');
  try { const { link } = await chamaDrive('pasta_demanda', { demanda_id: atual.id }); w.location = link; } catch (e) { w.close(); alert('Não deu para abrir a pasta: ' + e.message); }
};

await carrega();
const alvo = location.hash.slice(1);
if (alvo && demandas.some(d => d.id === alvo)) abre(alvo);
document.body.classList.remove('carregando');
