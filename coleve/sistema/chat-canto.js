// Sistema Coleve · o "WhatsApp interno" no canto de toda tela da equipe.
// Abre as conversas por cima (iframe em modo mini), sem sair do que está fazendo.
import { banco, quemSou } from './conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (eu?.pessoa?.tipo === 'equipe') {
  const base = new URL('conversas/?mini=1', import.meta.url).href;
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cc-bot{position:fixed;right:20px;bottom:20px;z-index:60;width:60px;height:60px;border:0;border-radius:50%;background:#1A71FF;box-shadow:0 12px 30px rgb(26 113 255 / .4);cursor:pointer;display:grid;place-items:center;transition:transform .2s}
    .cc-bot:hover{transform:scale(1.06)}
    .cc-bot svg{width:28px;height:28px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .cc-bot b{position:absolute;top:-2px;right:-2px;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#B9FC01;color:#282828;font:800 12px Gabarito,sans-serif;display:grid;place-items:center;box-shadow:0 0 0 3px #fff}
    .cc-bot b:empty{display:none}
    .cc-painel{position:fixed;right:20px;bottom:92px;z-index:60;width:min(400px,calc(100vw - 24px));height:min(620px,calc(100vh - 120px));border-radius:22px;overflow:hidden;background:#fff;display:flex!important;flex-direction:column;box-shadow:0 30px 80px rgb(7 26 68 / .3);outline:1.5px solid #DCE4F2;transform-origin:bottom right;transition:transform .2s,opacity .2s}
    .cc-painel[hidden]{transform:scale(.9);opacity:0;pointer-events:none}
    .cc-painel iframe{flex:1;width:100%;border:0;display:block}
    .cc-topo{display:flex;align-items:center;gap:8px;padding:10px 10px 10px 16px;background:#071A44;color:#fff}
    .cc-topo b{flex:1;font:800 14px Gabarito,sans-serif}
    .cc-abrir{height:28px;padding:0 12px;border-radius:999px;background:rgb(255 255 255 / .14);color:#fff;font:700 12px Gabarito,sans-serif;text-decoration:none;display:grid;place-items:center;z-index:2}
    .cc-fechar{width:28px;height:28px;border:0;border-radius:50%;background:rgb(255 255 255 / .14);color:#fff;font-size:18px;cursor:pointer}
    @media (max-width:600px){.cc-painel{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0}.cc-bot{right:16px;bottom:16px}}
  </style>`);
  document.body.insertAdjacentHTML('beforeend', `
    <button class="cc-bot" id="cc-bot" type="button" aria-label="Conversas do time" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/></svg><b id="cc-n"></b></button>
    <div class="cc-painel" id="cc-painel" hidden role="dialog" aria-label="Conversas">
      <div class="cc-topo"><b>Conversas do time</b><a class="cc-abrir" href="${base.replace('?mini=1', '')}" title="Abrir em tela cheia">Tela cheia</a>
      <button class="cc-fechar" id="cc-fechar" type="button" aria-label="Fechar">×</button></div>
    </div>`);
  const bot = document.getElementById('cc-bot'), painel = document.getElementById('cc-painel'), n = document.getElementById('cc-n');
  let carregado = false;
  const abre = aberto => {
    painel.hidden = !aberto; bot.setAttribute('aria-expanded', aberto);
    if (aberto && !carregado) { painel.insertAdjacentHTML('beforeend', `<iframe src="${base}" title="Conversas do time"></iframe>`); carregado = true; }
  };
  bot.onclick = () => abre(painel.hidden);
  document.getElementById('cc-fechar').onclick = () => abre(false);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !painel.hidden) abre(false); });

  // não lidas: conta no banco e escuta mensagem nova
  const conta = async () => {
    const { data } = await banco.rpc('meus_canais');
    const t = (data || []).reduce((s, c) => s + c.nao_lidas, 0);
    n.textContent = t || '';
  };
  window.addEventListener('message', e => { if (e.origin === location.origin && 'coleveNaoLidas' in (e.data || {})) n.textContent = e.data.coleveNaoLidas || ''; });
  banco.channel('coleve-canto').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagem' },
    ({ new: m }) => { if (m.autor_id !== eu.pessoa.id && painel.hidden) n.textContent = (+n.textContent || 0) + 1; }).subscribe();
  conta();
}
