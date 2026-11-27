// Sistema Coleve · trilha de vídeos do cliente (Backlog #13): etapas na ordem, player e "marcar como assistido".
import { banco, quemSou } from '../conexao.js?v=2';
import { playerHTML } from './video.js?v=1';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo) { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa, equipe = P.tipo === 'equipe';
const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 3500); };
$('nome').textContent = P.nome;
$('avatar').textContent = P.nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
$('papel').textContent = equipe ? 'Equipe · vendo como o cliente' : 'Cliente';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

let videos = [], vistos = new Set(), aberto = null;
async function carrega() {
  let q = banco.from('onboarding_video').select('id,ordem,titulo,descricao,url,duracao_min').order('ordem').order('criado_em');
  if (equipe) q = q.eq('ativo', true);
  const [{ data }, { data: vs }] = await Promise.all([q, banco.from('onboarding_video_visto').select('video_id').eq('pessoa_id', P.id)]);
  videos = data || []; vistos = new Set((vs || []).map(v => v.video_id));
  if (aberto === null) aberto = (videos.find(v => !vistos.has(v.id) && v.url) || videos.find(v => !vistos.has(v.id)) || {}).id || null;
  desenha();
}
function desenha() {
  const n = videos.filter(v => vistos.has(v.id)).length;
  $('prog-t').textContent = videos.length ? `${n} de ${videos.length} assistidos` : 'Trilha em preparação';
  $('prog-b').style.width = videos.length ? `${n / videos.length * 100}%` : '0';
  const atual = videos.find(v => !vistos.has(v.id))?.id;
  $('trilha').innerHTML = videos.map((v, i) => {
    const visto = vistos.has(v.id), abre = aberto === v.id;
    return `<li class="tr-et${visto ? ' is-visto' : ''}${v.id === atual ? ' is-atual' : ''}" data-v="${v.id}">
      <span class="tr-n" aria-hidden="true">${visto ? '✓' : i + 1}</span>
      <div class="tr-card">
        <button type="button" class="tr-card__cab" aria-expanded="${abre}"><b>${esc(v.titulo)}</b><small>${visto ? 'assistido' : v.url ? (v.duracao_min ? v.duracao_min + ' min' : 'assistir') : 'em breve'}</small></button>
        ${abre ? `<div class="tr-card__corpo">
          ${v.descricao ? `<p>${esc(v.descricao)}</p>` : ''}
          ${v.url ? `<div class="tr-player">${playerHTML(v.url, v.titulo)}</div>` : '<div class="tr-player tr-player--breve">Este vídeo está sendo gravado e aparece aqui em breve.</div>'}
          ${v.url ? `<div class="tr-card__pe">${visto ? '<button type="button" class="ui-btn ui-btn--fan" data-desmarca>Desmarcar</button>' : '<button type="button" class="ui-btn ui-btn--pri" data-marca>Marcar como assistido</button>'}</div>` : ''}
        </div>` : ''}
      </div></li>`;
  }).join('') || '<li class="ob-vazio">A trilha de boas-vindas está sendo preparada.</li>';
}
$('trilha').addEventListener('click', async e => {
  const li = e.target.closest('[data-v]'); if (!li) return;
  const id = li.dataset.v;
  if (e.target.closest('.tr-card__cab')) { aberto = aberto === id ? '' : id; return desenha(); }
  if (e.target.closest('[data-marca]')) {
    const { error } = await banco.from('onboarding_video_visto').insert({ video_id: id });
    if (error && error.code !== '23505') return avisa('Não deu para marcar agora.');
    vistos.add(id);
    const prox = videos.find(v => !vistos.has(v.id));
    aberto = prox?.id || '';
    avisa(prox ? 'Assistido. Próximo vídeo aberto.' : 'Trilha concluída. Obrigado!');
    desenha();
    if (prox) document.querySelector(`[data-v="${prox.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (e.target.closest('[data-desmarca]')) {
    await banco.from('onboarding_video_visto').delete().eq('video_id', id).eq('pessoa_id', P.id);
    vistos.delete(id); desenha();
  }
});

await carrega();
document.body.classList.remove('carregando');
