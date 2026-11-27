// Sistema Coleve · trilha de vídeos: transforma o link colado (YouTube, Google Drive ou arquivo) no player certo.
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function fonteVideo(url) {
  if (!url) return null;
  let u; try { u = new URL(url.trim()); } catch { return null; }
  const h = u.hostname.replace(/^www\.|^m\./, '');
  if (h === 'youtu.be') return { tipo: 'youtube', id: u.pathname.slice(1).split('/')[0] };
  if (h.endsWith('youtube.com') || h.endsWith('youtube-nocookie.com')) {
    const id = u.searchParams.get('v') || (u.pathname.match(/\/(embed|shorts|live)\/([\w-]+)/) || [])[2];
    if (id) return { tipo: 'youtube', id };
  }
  if (h === 'drive.google.com') {
    const id = (u.pathname.match(/\/file\/d\/([\w-]+)/) || [])[1] || u.searchParams.get('id');
    if (id) return { tipo: 'drive', id };
  }
  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) return { tipo: 'arquivo', src: u.href };
  return { tipo: 'link', src: u.href };
}

export function playerHTML(url, titulo = 'Vídeo') {
  const f = fonteVideo(url);
  if (!f) return '';
  if (f.tipo === 'youtube') return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(f.id)}?rel=0" title="${esc(titulo)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
  if (f.tipo === 'drive') return `<iframe src="https://drive.google.com/file/d/${esc(f.id)}/preview" title="${esc(titulo)}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
  if (f.tipo === 'arquivo') return `<video src="${esc(f.src)}" controls preload="metadata" playsinline></video>`;
  return `<a class="ui-btn" href="${esc(f.src)}" target="_blank" rel="noopener">Abrir o vídeo</a>`;
}

export const NOME_FONTE = { youtube: 'YouTube', drive: 'Google Drive', arquivo: 'Arquivo de vídeo', link: 'Link externo' };
