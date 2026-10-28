// Sistema Coleve · "Ativar avisos no celular" (web push). Carregado em todas as telas da equipe.
import { banco, quemSou } from './conexao.js?v=2';

const PUBLICA = 'BI5CUMR5117jiebqRpeMvIWxJuWlIVo9FTOM4Yju9tbkVklfmMz08J88yqaymEa3z9rvfldWOKm_zxYLXac-QLs';
const eu = await quemSou().catch(() => null);
const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const suporta = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const fechou = () => { try { return localStorage.getItem('coleve_avisos_fechou') === '1'; } catch { return false; } };

const base64 = s => { const p = '='.repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(r, c => c.charCodeAt(0)); };

async function inscreve(reg) {
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64(PUBLICA) });
  const j = sub.toJSON();
  await banco.from('push_inscricao').upsert({ endpoint: j.endpoint, pessoa_id: eu.pessoa.id, p256dh: j.keys.p256dh, auth: j.keys.auth, aparelho: navigator.userAgent.slice(0, 160) });
}

function faixa(html, acao) {
  if (document.getElementById('av-faixa')) return;
  document.head.insertAdjacentHTML('beforeend', `<style>
    .av{position:fixed;left:16px;right:16px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:70;max-width:440px;margin:0 auto;background:#071A44;color:#fff;border-radius:18px;padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 18px 40px rgb(7 26 68 / .35);font:600 14px/1.35 Gabarito,sans-serif}
    @media (min-width:861px){.av{left:auto;right:96px;bottom:24px}}
    .av b{display:block;font-size:15px}
    .av button{flex:none;height:38px;padding:0 14px;border:0;border-radius:999px;background:#B9FC01;color:#282828;font:800 14px Gabarito,sans-serif;cursor:pointer}
    .av .av-x{background:rgb(255 255 255 / .14);color:#fff;width:32px;padding:0}
  </style>`);
  document.body.insertAdjacentHTML('beforeend', `<div class="av" id="av-faixa" role="status">${html}<button class="av-x" type="button" aria-label="Fechar">×</button></div>`);
  const f = document.getElementById('av-faixa');
  f.querySelector('.av-x').onclick = () => { f.remove(); try { localStorage.setItem('coleve_avisos_fechou', '1'); } catch {} };
  if (acao) f.querySelector('[data-acao]').onclick = acao;
}

if (eu?.pessoa?.tipo === 'equipe' && suporta) {
  const reg = await navigator.serviceWorker.register(new URL('sw.js', import.meta.url), { scope: new URL('./', import.meta.url).pathname });
  const atual = await reg.pushManager.getSubscription();
  if (atual && Notification.permission === 'granted') {
    inscreve(reg).catch(() => {});                 // mantém o aparelho ligado à pessoa certa
  } else if (Notification.permission === 'default' && !fechou()) {
    if (ios && !instalado) {
      faixa('<div><b>Receba avisos no celular</b>Toque em Compartilhar e depois em "Adicionar à Tela de Início". Depois abra pelo ícone da Coleve.</div>');
    } else {
      faixa('<div style="flex:1"><b>Avisos no celular</b>Saiba na hora quando chegar pedido, arte ou aprovação.</div><button type="button" data-acao>Ativar</button>', async () => {
        const p = await Notification.requestPermission();
        document.getElementById('av-faixa')?.remove();
        if (p === 'granted') await inscreve(reg).catch(() => alert('Não deu para ativar os avisos agora.'));
      });
    }
  }
}
