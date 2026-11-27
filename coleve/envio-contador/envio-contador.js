// Coleve · envio de documentos pelo contador anterior (transferência técnica), sem login.
// O token do link decide tudo: a função transferencia_envio valida, abre o envio direto pro Drive e grava o protocolo.
const FUNCAO = 'https://hnuxwonsaijfxeqojlie.supabase.co/functions/v1/transferencia_envio';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudXh3b25zYWlqZnhlcW9qbGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDk2NzQsImV4cCI6MjEwODcyNTY3NH0.lZP7V-RwS-x0Pwn6Jmv8AHBqGrI4XNi7_l9B96ZcDeQ';
const token = new URLSearchParams(location.search).get('t') || '';

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dataBR = d => d ? new Date(d).toLocaleDateString('pt-BR') : '';
const horaBR = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const compBR = c => c ? c.slice(0, 7).split('-').reverse().join('/') : '';
const ST = { pendente: 'Falta enviar', recebido: 'Recebido', conferencia: 'Em conferência', aprovado: 'Aprovado', recusado: 'Precisa corrigir', substituido: 'Substituído' };
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 5000); };
const guarda = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const le = k => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };

async function chama(acao, extra = {}) {
  const r = await fetch(FUNCAO, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ acao, token, ...extra }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.erro) throw new Error(d.erro || 'Não deu para concluir agora.');
  return d;
}
const msg = (t, s) => { $('ec').innerHTML = `<div class="ec-msg"><b>${esc(t)}</b>${esc(s || '')}</div>`; $('ec').removeAttribute('aria-busy'); };

let dados = null;
const protocolos = [];

async function carrega() {
  dados = await chama('ver');
  desenha();
}

function desenha() {
  const d = dados;
  if (!$('e-empresa')) { $('ec').innerHTML = ''; $('ec').append($('tpl').content.cloneNode(true)); $('ec').removeAttribute('aria-busy'); ligaEventos(); }
  document.title = `Envio de documentos · ${d.empresa}`;
  $('e-empresa').textContent = d.empresa;
  $('e-sub').textContent = [d.razao_social !== d.empresa ? d.razao_social : '', d.cnpj ? 'CNPJ ' + d.cnpj : ''].filter(Boolean).join(' · ') || 'Transferência de responsabilidade técnica';
  $('e-contador').textContent = d.contador || 'A definir';
  $('e-resp').textContent = d.responsavel || 'Equipe Coleve';
  $('e-validade').textContent = dataBR(d.validade);
  const ok = d.itens.filter(i => i.status === 'aprovado').length, env = d.itens.filter(i => i.status !== 'pendente').length;
  $('e-placar').textContent = `${env} de ${d.itens.length} com arquivo · ${ok} aprovadas`;
  $('e-cats').innerHTML = d.itens.map(i => `
    <li class="ec-cat" data-i="${i.id}">
      <div class="ec-cat__topo"><span class="ec-cat__t"><b>${esc(i.nome)}</b><small>${esc(i.grupo)}</small></span><span class="sx" data-s="${i.status}">${ST[i.status]}</span></div>
      ${i.status === 'recusado' && i.motivo_recusa ? `<p class="ec-cat__motivo">A Coleve pediu correção: ${esc(i.motivo_recusa)}</p>` : ''}
      ${i.arquivos.length ? `<ul class="ec-arqs">${i.arquivos.map(a => `<li><span>${esc(a.nome)}${a.competencia ? ' · ' + compBR(a.competencia) : ''}</span><code>${esc(a.protocolo)} · ${horaBR(a.recebido_em)}</code></li>`).join('')}</ul>` : ''}
      ${i.status === 'aprovado' ? '' : `<div class="ec-cat__env">
        <input type="month" class="ui-in" data-comp aria-label="Competência de ${esc(i.nome)}" title="Competência (opcional)">
        <span class="ui-btn ec-file">Anexar arquivos<input type="file" multiple data-anexa="${i.id}" aria-label="Anexar em ${esc(i.nome)}"></span>
      </div>
      <div class="ec-barra" hidden><i></i></div>`}
    </li>`).join('');
}

function ligaEventos() {
  $('r-nome').value = le('coleve_ec_nome'); $('r-email').value = le('coleve_ec_email');
  $('r-nome').addEventListener('change', () => guarda('coleve_ec_nome', $('r-nome').value.trim()));
  $('r-email').addEventListener('change', () => guarda('coleve_ec_email', $('r-email').value.trim()));
  $('e-imprime').onclick = () => print();
  $('e-cats').addEventListener('change', async e => {
    const inp = e.target.closest('[data-anexa]'); if (!inp || !inp.files.length) return;
    const nome = $('r-nome').value.trim();
    const li = inp.closest('.ec-cat'), fs = [...inp.files]; inp.value = '';
    if (!nome) { avisa('Informe seu nome antes de anexar.'); $('r-nome').focus(); return; }
    const comp = li.querySelector('[data-comp]').value || null;
    const barra = li.querySelector('.ec-barra'), fill = barra.querySelector('i');
    barra.hidden = false;
    try {
      for (const [k, f] of fs.entries()) {
        avisa(`Enviando ${k + 1} de ${fs.length}: ${f.name}`);
        const { envio } = await chama('abrir', { item_id: inp.dataset.anexa, nome: f.name, tipo: f.type || 'application/octet-stream', tamanho: f.size });
        const up = await new Promise((ok, falha) => {
          const x = new XMLHttpRequest();
          x.open('PUT', envio);
          x.upload.onprogress = ev => { fill.style.width = Math.round(((k + ev.loaded / ev.total) / fs.length) * 100) + '%'; };
          x.onload = () => x.status < 300 ? ok(JSON.parse(x.responseText)) : falha(new Error('O envio falhou (' + x.status + ').'));
          x.onerror = () => falha(new Error('Sem conexão. Tente de novo.'));
          x.send(f);
        });
        const r = await chama('registrar', { item_id: inp.dataset.anexa, drive_id: up.id, competencia: comp, remetente_nome: nome, remetente_email: $('r-email').value.trim() });
        protocolos.push({ nome: f.name, cat: dados.itens.find(i => i.id === inp.dataset.anexa)?.nome, ...r });
      }
      avisa(fs.length > 1 ? `${fs.length} arquivos recebidos.` : 'Arquivo recebido.');
    } catch (er) { avisa(er.message); }
    barra.hidden = true; fill.style.width = '0';
    desenhaComprovante();
    await carrega().catch(er => avisa(er.message));
  });
}

function desenhaComprovante() {
  $('e-comp').hidden = !protocolos.length;
  $('e-prot').innerHTML = protocolos.map(p => `<li><span><b>${esc(p.protocolo)}</b> · ${esc(p.cat || '')}<br><small>${esc(p.nome)}</small></span><small>${horaBR(p.recebido_em)}</small></li>`).join('');
}

if (!/^[0-9a-f-]{36}$/i.test(token)) msg('Link incompleto.', ' Peça um novo link para a Coleve.');
else carrega().catch(er => msg('Não foi possível abrir este link.', ' ' + er.message));
