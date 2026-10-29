// Sistema Coleve · Time Box (doc do Manu, 28/10/2026): o dia em blocos, cronômetro, Pomodoro 25/5 e previsto x real
import { banco, quemSou } from '../../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../../entrar/'); throw 0; }
const P = eu.pessoa;
const chefe = ['admin', 'gestor'].includes(P.papel);
const veCliente = chefe || P.area !== 'marketing';
if (!veCliente) document.querySelectorAll('.barra__nav a[href$="clientes/"]').forEach(a => a.remove());

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const avisa = t => { $('aviso').textContent = t; if (t) setTimeout(() => { if ($('aviso').textContent === t) $('aviso').textContent = ''; }, 4000); };
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const relogio = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + 'h' + String(m).padStart(2, '0') : m + ':' + String(x).padStart(2, '0')); };
const horas = min => min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, '0') : ''}` : `${min} min`;

$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../../entrar/'); };

const [{ data: equipe }, { data: empresas }] = await Promise.all([
  banco.from('pessoa').select('id,nome').eq('tipo', 'equipe').eq('ativo', true).order('nome'),
  veCliente ? banco.from('empresa').select('id,razao_social,nome_fantasia').eq('ativo', true).order('razao_social') : Promise.resolve({ data: [] })
]);
const pessoas = new Map((equipe || []).map(p => [p.id, p.nome]));
const nomeEmp = new Map((empresas || []).map(e => [e.id, e.nome_fantasia || e.razao_social]));
(empresas || []).forEach(e => $('b-empresa').insertAdjacentHTML('beforeend', `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`));
if (!veCliente) $('b-emp-l').hidden = true;

// gestor escolhe de quem ver o dia, ou o time todo
if (chefe) {
  $('quem').hidden = false;
  $('quem').innerHTML = `<option value="${P.id}">Meu dia</option><option value="time">Time todo</option>` + (equipe || []).filter(p => p.id !== P.id).map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
}
$('dia').value = hoje();
let quem = P.id, blocos = [];

const realDe = b => b.real_seg + (b.rodando_desde ? (Date.now() - new Date(b.rodando_desde)) / 1000 : 0);

async function carrega() {
  quem = chefe ? $('quem').value : P.id;
  const dono = quem === 'time' ? null : quem;
  $('md-titulo').textContent = quem === 'time' ? 'Time todo' : quem === P.id ? 'Meu dia' : 'Dia de ' + (pessoas.get(quem) || '').split(' ')[0];
  $('novo').hidden = quem === 'time';
  let q = banco.from('timebox').select('*,tarefa:tarefa(titulo,status)').eq('dia', $('dia').value).order('inicio', { nullsFirst: false }).order('criado_em');
  if (dono) q = q.eq('pessoa_id', dono);
  const { data, error } = await q;
  if (error) return avisa('Não deu para carregar os blocos.');
  blocos = data || [];
  desenha();
}

function desenhaNumeros(bs) {
  const prev = bs.reduce((s, b) => s + b.previsto_min, 0), real = bs.reduce((s, b) => s + realDe(b), 0) / 60;
  const feitos = bs.filter(b => b.realizado), noTempo = feitos.filter(b => realDe(b) / 60 <= b.previsto_min).length;
  $('numeros').innerHTML =
    `<div class="num"><strong>${feitos.length}/${bs.length}</strong><span>blocos realizados</span></div>` +
    `<div class="num"><strong>${horas(prev)}</strong><span>previsto</span></div>` +
    `<div class="num"><strong>${horas(Math.round(real))}</strong><span>trabalhado</span></div>` +
    `<div class="num"><strong>${feitos.length ? Math.round(noTempo / feitos.length * 100) + '%' : '-'}</strong><span>dentro do tempo</span></div>`;
}

function desenha() {
  desenhaNumeros(blocos);
  const time = quem === 'time';
  $('time').hidden = !time; $('lista').hidden = time;
  if (time) {
    const por = new Map();
    blocos.forEach(b => { const x = por.get(b.pessoa_id) || []; x.push(b); por.set(b.pessoa_id, x); });
    $('time').innerHTML = por.size ? `<table class="md-tab"><tr><th>Pessoa</th><th>Blocos</th><th>Previsto</th><th>Trabalhado</th><th>Realizados</th><th>Enviados</th><th>Verificados</th></tr>${[...por].map(([id, bs]) => {
      const prev = bs.reduce((s, b) => s + b.previsto_min, 0), real = Math.round(bs.reduce((s, b) => s + realDe(b), 0) / 60);
      return `<tr><td><button type="button" class="link-b" data-ver="${id}">${esc(pessoas.get(id) || '')}</button></td><td>${bs.length}</td><td>${horas(prev)}</td><td class="${real > prev ? 'acima' : ''}">${horas(real)}</td><td>${bs.filter(b => b.realizado).length}</td><td>${bs.filter(b => b.enviado).length}</td><td>${bs.filter(b => b.verificado).length}</td></tr>`;
    }).join('')}</table>` : '<p class="fv">Ninguém planejou blocos neste dia.</p>';
    $('pomo').hidden = true;
    return;
  }
  const meu = quem === P.id;
  $('lista').innerHTML = blocos.map(b => {
    const real = realDe(b), pct = Math.min(100, real / 60 / b.previsto_min * 100), acima = real / 60 > b.previsto_min;
    return `<article class="bl${b.rodando_desde ? ' bl--on' : ''}${b.realizado ? ' bl--ok' : ''}" data-b="${b.id}">
      <div class="bl__hora">${b.inicio ? b.inicio.slice(0, 5) : '--:--'}<small>${b.fim ? b.fim.slice(0, 5) : ''}</small></div>
      <div class="bl__corpo">
        <div class="bl__topo"><span class="bl__t"><b>${esc(b.servico)}</b><small>${b.empresa_id ? esc(nomeEmp.get(b.empresa_id) || 'Cliente') : 'Coleve (interno)'}${b.tarefa ? ' · tarefa: ' + esc(b.tarefa.titulo) : ''}</small></span>
          ${meu ? `<button type="button" class="play" data-play="${b.id}" aria-label="${b.rodando_desde ? 'Pausar' : 'Começar'}">${b.rodando_desde ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8Z"/></svg>'}</button>` : ''}</div>
        <div class="bl__tempo"><span class="bl__real${acima ? ' acima' : ''}" data-relogio="${b.id}">${relogio(real)}</span><span class="bl__prev">de ${horas(b.previsto_min)} previstos</span></div>
        <span class="bl__barra${acima ? ' acima' : ''}"><i style="width:${pct}%"></i></span>
        <div class="bl__st">
          <label class="ck"><input type="checkbox" data-st="realizado"${b.realizado ? ' checked' : ''}${meu || chefe ? '' : ' disabled'}>Realizado</label>
          <label class="ck"><input type="checkbox" data-st="enviado"${b.enviado ? ' checked' : ''}${meu || chefe ? '' : ' disabled'}>Enviado ao sistema</label>
          <label class="ck${chefe ? '' : ' ck--off'}" title="${chefe ? '' : 'Quem marca é o gestor'}"><input type="checkbox" data-st="verificado"${b.verificado ? ' checked' : ''}${chefe ? '' : ' disabled'}>Verificado${b.verificado_por ? ' por ' + esc((pessoas.get(b.verificado_por) || '').split(' ')[0]) : ''}</label>
          ${meu ? `<button type="button" class="link-b bl__tira" data-tira="${b.id}">Tirar</button>` : ''}
        </div>
        ${b.realizado ? `<div class="refl">
          <p>Concluiu dentro do tempo previsto?</p>
          <div class="refl__sn"><label><input type="radio" name="nt-${b.id}" value="sim"${b.no_tempo === true ? ' checked' : ''}${meu ? '' : ' disabled'}>Sim</label><label><input type="radio" name="nt-${b.id}" value="nao"${b.no_tempo === false ? ' checked' : ''}${meu ? '' : ' disabled'}>Não</label></div>
          <label class="cp-t">O que dificultou?<input data-refl="dificultou" value="${esc(b.dificultou || '')}"${meu ? '' : ' readonly'}></label>
          <label class="cp-t">O que melhora o próximo bloco?<input data-refl="ajuste" value="${esc(b.ajuste || '')}"${meu ? '' : ' readonly'}></label>
        </div>` : ''}
      </div></article>`;
  }).join('') || `<p class="fv">${meu ? 'Nenhum bloco neste dia. Use "+ Bloco" para planejar: uma atividade, o horário e o tempo previsto.' : 'Nenhum bloco neste dia.'}</p>`;
  desenhaPomo();
}

// Pomodoro: o bloco rodando conta ciclos de 25 min de foco + 5 de pausa
function desenhaPomo() {
  const b = blocos.find(x => x.rodando_desde && x.pessoa_id === P.id);
  $('pomo').hidden = !b; if (!b) return;
  const s = (Date.now() - new Date(b.rodando_desde)) / 1000, ciclo = s % 1800, foco = ciclo < 1500;
  const resta = foco ? 1500 - ciclo : 1800 - ciclo;
  $('pomo').className = 'pomo' + (foco ? '' : ' pomo--pausa');
  $('pomo').innerHTML = `<span class="pomo__ico">${foco ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 10h13v4a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6Zm13 1h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/></svg>'}</span>
    <span class="pomo__t"><b>${foco ? 'Foco' : 'Pausa de 5 minutos'}</b><small>${esc(b.servico)} · ciclo ${Math.floor(s / 1800) + 1}</small></span><strong>${relogio(resta)}</strong>`;
  if (!foco && !pausaAvisada.has(b.id + Math.floor(s / 1800))) { pausaAvisada.add(b.id + Math.floor(s / 1800)); avisoNav('Hora da pausa: 5 minutos', b.servico); }
}
const pausaAvisada = new Set();
function avisoNav(t, corpo) { if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') new Notification(t, { body: corpo, icon: '../../../img/icone.svg' }); }

// relógio ao vivo
setInterval(() => {
  blocos.filter(b => b.rodando_desde).forEach(b => { const el = document.querySelector(`[data-relogio="${b.id}"]`); if (el) el.textContent = relogio(realDe(b)); });
  if (quem !== 'time') desenhaPomo();
}, 1000);

// ações nos blocos
$('lista').addEventListener('click', async e => {
  const play = e.target.closest('[data-play]');
  if (play) {
    const b = blocos.find(x => x.id === play.dataset.play);
    const agora = new Date().toISOString();
    if (b.rodando_desde) await banco.from('timebox').update({ real_seg: Math.round(realDe(b)), rodando_desde: null }).eq('id', b.id);
    else {
      // só um bloco rodando por vez: pausa o outro
      for (const o of blocos.filter(x => x.rodando_desde && x.pessoa_id === P.id)) await banco.from('timebox').update({ real_seg: Math.round(realDe(o)), rodando_desde: null }).eq('id', o.id);
      await banco.from('timebox').update({ rodando_desde: agora }).eq('id', b.id);
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    }
    return carrega();
  }
  const tira = e.target.closest('[data-tira]');
  if (tira && confirm('Tirar este bloco do dia?')) { await banco.from('timebox').delete().eq('id', tira.dataset.tira); carrega(); }
});
$('lista').addEventListener('change', async e => {
  const art = e.target.closest('[data-b]'); if (!art) return;
  const b = blocos.find(x => x.id === art.dataset.b);
  let campos = null;
  if (e.target.dataset.st) {
    campos = { [e.target.dataset.st]: e.target.checked };
    if (e.target.dataset.st === 'realizado' && e.target.checked && b.rodando_desde) Object.assign(campos, { real_seg: Math.round(realDe(b)), rodando_desde: null });
  } else if (e.target.name?.startsWith('nt-')) campos = { no_tempo: e.target.value === 'sim' };
  else if (e.target.dataset.refl) campos = { [e.target.dataset.refl]: e.target.value.trim() || null };
  if (!campos) return;
  const { error } = await banco.from('timebox').update(campos).eq('id', b.id);
  if (error) { avisa('Não deu para salvar.'); return carrega(); }
  if ('realizado' in campos || 'verificado' in campos || 'enviado' in campos || 'rodando_desde' in campos) carrega(); else Object.assign(b, campos);
});
$('time').addEventListener('click', e => { const v = e.target.closest('[data-ver]'); if (v) { $('quem').value = v.dataset.ver; carrega(); } });
['dia', 'quem'].forEach(id => $(id).addEventListener('change', carrega));

// novo bloco: puxa das tarefas abertas de quem é o dia
$('novo').onclick = async () => {
  $('f-b').reset(); $('b-prev').value = 25;
  const { data: ts } = await banco.from('tarefa').select('id,titulo,empresa_id').eq('responsavel_id', quem).not('status', 'in', '(enviado,cancelado,pronto)').order('prazo', { nullsFirst: false }).limit(60);
  $('b-tarefa').innerHTML = '<option value="">Atividade avulsa</option>' + (ts || []).map(t => `<option value="${t.id}" data-emp="${t.empresa_id || ''}">${esc(t.titulo)}</option>`).join('');
  const agora = new Date(); agora.setMinutes(Math.ceil(agora.getMinutes() / 5) * 5, 0, 0);
  $('b-inicio').value = agora.toTimeString().slice(0, 5);
  $('dlg-b').showModal();
};
$('b-cancela').onclick = () => $('dlg-b').close();
$('b-tarefa').addEventListener('change', () => { const o = $('b-tarefa').selectedOptions[0]; if (o.value) { $('b-servico').value = o.textContent; if (veCliente) $('b-empresa').value = o.dataset.emp || ''; } });
const minEntre = (a, b) => { const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); return (h2 * 60 + m2) - (h1 * 60 + m1); };
['b-inicio', 'b-fim'].forEach(id => $(id).addEventListener('change', () => { if ($('b-inicio').value && $('b-fim').value && minEntre($('b-inicio').value, $('b-fim').value) > 0) $('b-prev').value = minEntre($('b-inicio').value, $('b-fim').value); }));
$('b-prev').addEventListener('change', () => { if ($('b-inicio').value) { const [h, m] = $('b-inicio').value.split(':').map(Number), t = h * 60 + m + (+$('b-prev').value || 0); $('b-fim').value = `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; } });
$('f-b').addEventListener('submit', async e => {
  e.preventDefault();
  const { error } = await banco.from('timebox').insert({ pessoa_id: quem, dia: $('dia').value, servico: $('b-servico').value.trim(), tarefa_id: $('b-tarefa').value || null,
    empresa_id: (veCliente && $('b-empresa').value) || null, inicio: $('b-inicio').value || null, fim: $('b-fim').value || null, previsto_min: +$('b-prev').value || 25 });
  if (error) return avisa('Não deu para criar o bloco.');
  $('dlg-b').close(); carrega();
});

banco.channel('coleve-timebox').on('postgres_changes', { event: '*', schema: 'public', table: 'timebox' }, () => carrega()).subscribe();

await carrega();
document.body.classList.remove('carregando');
