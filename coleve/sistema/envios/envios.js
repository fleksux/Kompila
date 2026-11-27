// Sistema Coleve · Envios por WhatsApp e e-mail (27/11/2026)
// Fila com filtros, reenviar, cancelar, envio em lote, documentos gerados x enviados por competência (RF08) e textos padrão.
// Enquanto envio_config.ativo = false nada sai: a tela mostra a faixa "Envio desligado".
import { banco, quemSou } from '../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo || eu.pessoa.tipo !== 'equipe') { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa;
const GESTOR = ['admin', 'gestor'].includes(P.papel);
if (P.area === 'marketing' && !GESTOR) { location.replace('../'); throw 0; }   // marketing não vê dado de cliente (0020)

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const hora = d => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
const mesBR = d => { const [a, m] = d.split('-'); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][m - 1] + '/' + a; };
let avisoT; const avisa = t => { $('aviso').textContent = t; clearTimeout(avisoT); avisoT = setTimeout(() => { $('aviso').textContent = ''; }, 4000); };

const STATUS = [['pendente', 'Pendente'], ['enviando', 'Enviando'], ['enviado', 'Enviado'], ['entregue', 'Entregue'], ['lido', 'Lido'], ['falhou', 'Falhou'], ['cancelado', 'Cancelado']];
const NOME_ST = Object.fromEntries(STATUS);
const CANAL = { whatsapp: 'WhatsApp', email: 'E-mail' };
const PROV = { meta: 'API oficial', umbler: 'Umbler Talk', resend: 'Resend', smtp: 'SMTP' };
const ORIGEM = { entrega: 'Entrega', cobranca: 'Cobrança', vencimento: 'Vencimento', manual: 'Manual', lote: 'Lote', reuniao: 'Reunião', pedido: 'Pedido', boas_vindas: 'Boas-vindas' };
const AUTO = ['nome', 'empresa', 'link'];   // o banco preenche sozinho
const ROTULO = { competencia: 'Competência (ex.: novembro de 2026)', documentos: 'Documentos', valor: 'Valor', vencimento: 'Vencimento', dia_semana: 'Dia da semana',
  itens: 'O que falta', data: 'Data', resumo: 'Resumo', pedido: 'Pedido' };
const selo = (st, txt) => `<span class="ev-st" data-ev="${st}">${esc(txt ?? NOME_ST[st] ?? st)}</span>`;

// barra de cima
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('papel').textContent = P.papel === 'admin' ? 'Acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };

// ===== canais e faixa de desligado =====
let config = [];
async function carregaConfig() {
  const { data } = await banco.from('envio_config').select('*').order('canal', { ascending: false });
  config = data || [];
  const algum = config.some(c => c.ativo);
  $('desligado').hidden = algum;
  $('canais').innerHTML = config.map(c => `<li><span>${CANAL[c.canal]} <small>${PROV[c.provedor] || c.provedor}</small></span>${selo(c.ativo ? 'ligado' : 'desligado', c.ativo ? 'Ligado' : 'Desligado')}</li>`).join('')
    || '<li><small>Sem configuração</small></li>';
}

// ===== listas de apoio =====
const [{ data: emps }, { data: mods }] = await Promise.all([
  banco.from('empresa').select('id,razao_social,nome_fantasia,teste').eq('ativo', true).order('razao_social'),
  banco.from('envio_modelo').select('*').order('ordem')
]);
const EMPS = emps || []; let MODS = mods || [];
const nomeEmp = e => e.nome_fantasia || e.razao_social;
$('f-emp').insertAdjacentHTML('beforeend', EMPS.map(e => `<option value="${e.id}">${esc(nomeEmp(e))}</option>`).join(''));
$('f-status').insertAdjacentHTML('beforeend', STATUS.map(([k, n]) => `<option value="${k}">${n}</option>`).join(''));

// ===== vistas =====
let vista = 'fila';
const TIT = { fila: ['Fila de envio', '#1A71FF'], competencia: ['Gerados x enviados', '#2F9E66'], modelos: ['Textos padrão', '#7C5CDB'] };
function mostra(v) {
  vista = v;
  document.querySelectorAll('#visoes button').forEach(b => b.classList.toggle('is-on', b.dataset.v === v));
  $('visao-cel').value = v;
  ['fila', 'competencia', 'modelos'].forEach(x => { $('v-' + x).hidden = x !== v; });
  $('t-nome').textContent = TIT[v][0]; $('t-ponto').style.setProperty('--cor', TIT[v][1]);
  $('total').textContent = '';
  ({ fila: carregaFila, competencia: carregaComp, modelos: desenhaModelos })[v]();
}
document.querySelectorAll('#visoes button').forEach(b => { b.onclick = () => mostra(b.dataset.v); });
$('visao-cel').onchange = e => mostra(e.target.value);

// ===== fila =====
let fila = [], sel = new Set();
async function carregaFila() {
  let q = banco.from('v_envio').select('*').order('criado_em', { ascending: false }).limit(500);
  if ($('f-canal').value) q = q.eq('canal', $('f-canal').value);
  if ($('f-status').value) q = q.eq('status', $('f-status').value);
  if ($('f-emp').value) q = q.eq('empresa_id', $('f-emp').value);
  if ($('f-de').value) q = q.gte('criado_em', $('f-de').value + 'T00:00:00-03:00');
  if ($('f-ate').value) q = q.lte('criado_em', $('f-ate').value + 'T23:59:59-03:00');
  const { data, error } = await q;
  if (error) { $('corpo-fila').innerHTML = `<p class="tf-nada">Não deu para carregar: ${esc(error.message)}</p>`; return; }
  fila = data || [];
  desenhaFila();
  const pend = fila.filter(e => e.status === 'pendente').length;
  $('n-fila').textContent = pend || '';
}
function desenhaFila() {
  const b = $('f-busca').value.trim().toLowerCase();
  const lista = !b ? fila : fila.filter(e => [e.contato_nome, e.destino, e.empresa_nome, e.texto, e.modelo_nome].join(' ').toLowerCase().includes(b));
  $('total').textContent = lista.length ? `${lista.length} envio(s)` : '';
  if (!lista.length) {
    $('corpo-fila').innerHTML = `<p class="tf-nada">${fila.length ? 'Nada com esse filtro.' : 'Nenhum envio ainda. A entrega de documentos, a cobrança do mês e o lembrete de vencimento entram aqui sozinhos.'}</p>`;
    sincronizaSel(); return;
  }
  $('corpo-fila').innerHTML = `<table class="tf-tab ev-tab"><thead><tr>
      <th class="c-chk"><input type="checkbox" id="chk-todos" aria-label="Marcar todos"></th><th class="c-data">Criado</th><th class="c-emp">Cliente</th>
      <th class="c-dest">Contato</th><th class="c-canal">Canal</th><th class="c-mod">Texto</th><th class="c-st">Status</th></tr></thead><tbody>
    ${lista.map(e => `<tr class="tf-lin" data-id="${e.id}" tabindex="0">
      <td class="c-chk"><input type="checkbox" data-chk="${e.id}" ${sel.has(e.id) ? 'checked' : ''} aria-label="Marcar"></td>
      <td class="c-data"><span class="tf-prazo">${hora(e.criado_em)}</span></td>
      <td class="c-emp"><span class="tf-emp">${esc(e.empresa_nome || '')}</span>${e.empresa_teste ? ' <span class="tf-tag tf-tag--teste">teste</span>' : ''}</td>
      <td class="c-dest"><span class="ev-dest"><b>${esc(e.contato_nome || e.destino)}</b><small>${e.erro && ['falhou', 'pendente', 'cancelado'].includes(e.status) ? `<span class="ev-erro">${esc(e.erro)}</span>` : esc(e.destino)}</small></span></td>
      <td class="c-canal">${CANAL[e.canal]}</td>
      <td class="c-mod"><span class="tf-emp">${esc(e.modelo_nome || 'Texto livre')}</span></td>
      <td class="c-st">${selo(e.status)}</td></tr>`).join('')}</tbody></table>`;
  $('chk-todos').onchange = ev => { lista.forEach(e => ev.target.checked ? sel.add(e.id) : sel.delete(e.id)); desenhaFila(); };
  $('corpo-fila').querySelectorAll('[data-chk]').forEach(c => {
    c.onclick = ev => ev.stopPropagation();
    c.onchange = () => { c.checked ? sel.add(c.dataset.chk) : sel.delete(c.dataset.chk); sincronizaSel(); };
  });
  $('corpo-fila').querySelectorAll('tr.tf-lin').forEach(tr => {
    tr.onclick = () => abre(tr.dataset.id);
    tr.onkeydown = ev => { if (ev.key === 'Enter') abre(tr.dataset.id); };
  });
  sincronizaSel();
}
function sincronizaSel() {
  sel.forEach(id => { if (!fila.some(e => e.id === id)) sel.delete(id); });
  $('acoes').hidden = !sel.size;
  $('sel-n').textContent = `${sel.size} marcado(s)`;
}
['f-canal', 'f-status', 'f-emp', 'f-de', 'f-ate'].forEach(id => { $(id).onchange = carregaFila; });
$('f-busca').oninput = desenhaFila;
$('limpar').onclick = () => { sel.clear(); desenhaFila(); };

async function reenviar(ids) {
  const { data, error } = await banco.rpc('envio_reenviar', { p_ids: ids });
  if (error) return avisa('Não deu para reenviar: ' + error.message);
  const ligado = config.some(c => c.ativo);
  avisa(`${data} envio(s) de volta na fila.${ligado ? '' : ' O envio está desligado: ficam pendentes até ligar.'}`);
  sel.clear(); carregaFila();
}
async function cancelar(ids) {
  if (!confirm(`Cancelar ${ids.length} envio(s)? Quem já recebeu não é afetado.`)) return;
  const { data, error } = await banco.rpc('envio_cancelar', { p_ids: ids });
  if (error) return avisa('Não deu para cancelar: ' + error.message);
  avisa(`${data} envio(s) cancelado(s).`);
  sel.clear(); carregaFila();
}
$('reenviar').onclick = () => reenviar([...sel]);
$('cancelar').onclick = () => cancelar([...sel]);

// ===== detalhe =====
async function abre(id) {
  const e = fila.find(x => x.id === id); if (!e) return;
  const { data: prots } = await banco.from('protocolo').select('id,canal,status,destinatario,enviado_em,entregue_em,lido_em,documento:documento_id(nome)').eq('envio_id', id);
  $('g-onde').innerHTML = `${esc(e.empresa_nome || '')} · ${CANAL[e.canal]}`;
  const linha = (t, v) => v ? `<div><dt>${t}</dt><dd>${v}</dd></div>` : '';
  $('g-miolo').innerHTML = `
    <h2 class="tf-gav__titulo" id="g-titulo">${esc(e.modelo_nome || 'Texto livre')}</h2>
    <dl class="tf-props">
      ${linha('Status', selo(e.status))}
      ${linha('Contato', esc(e.contato_nome || ''))}
      ${linha('Destino', esc(e.destino))}
      ${linha('Origem', ORIGEM[e.origem] || e.origem)}
      ${linha('Criado', `${hora(e.criado_em)}${e.criado_por_nome ? ' · ' + esc(e.criado_por_nome) : ''}`)}
      ${linha('Agendado', hora(e.agendado_para))}
      ${linha('Válido até', hora(e.valido_ate))}
      ${linha('Enviado', hora(e.enviado_em))}
      ${linha('Entregue', hora(e.entregue_em))}
      ${linha('Lido', hora(e.lido_em))}
      ${linha('Tentativas', e.tentativas ? String(e.tentativas) : '')}
      ${linha('Provedor', e.provedor ? esc(PROV[e.provedor] || e.provedor) : '')}
    </dl>
    ${e.erro ? `<section class="tf-sec"><h3>O que deu errado</h3><p class="ev-erro">${esc(e.erro)}</p></section>` : ''}
    <section class="tf-sec"><h3>Mensagem${e.assunto ? ` <small>${esc(e.assunto)}</small>` : ''}</h3><pre class="ev-texto">${esc(e.texto)}</pre></section>
    ${(prots || []).length ? `<section class="tf-sec"><h3>Protocolo <small>um por documento</small></h3><ul class="tf-docs">
      ${prots.map(p => `<li><span><b>${esc(p.documento?.nome || 'Documento')}</b><small>${esc(p.destinatario)}</small></span>${selo(p.status)}</li>`).join('')}</ul></section>` : ''}
    <section class="tf-sec" style="display:flex;gap:8px">
      ${['falhou', 'cancelado', 'pendente'].includes(e.status) ? '<button class="ui-btn ui-btn--pri" type="button" id="g-reenviar">Reenviar</button>' : ''}
      ${['pendente', 'falhou'].includes(e.status) ? '<button class="ui-btn ui-btn--fan" type="button" id="g-cancelar">Cancelar envio</button>' : ''}
    </section>`;
  $('g-reenviar') && ($('g-reenviar').onclick = () => { fecha(); reenviar([id]); });
  $('g-cancelar') && ($('g-cancelar').onclick = () => { fecha(); cancelar([id]); });
  $('gaveta').hidden = false;
}
const fecha = () => { $('gaveta').hidden = true; };
$('gaveta').querySelectorAll('[data-fecha]').forEach(b => { b.onclick = fecha; });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('gaveta').hidden) fecha(); });

// ===== por competência (RF08) =====
{ const d = new Date(); d.setMonth(d.getMonth() - 1); $('f-comp').value = d.toISOString().slice(0, 7); }
async function carregaComp() {
  const comp = $('f-comp').value + '-01';
  const { data, error } = await banco.from('v_envio_competencia').select('*').eq('competencia', comp).order('empresa_nome');
  if (error) { $('corpo-comp').innerHTML = `<p class="tf-nada">Não deu para carregar: ${esc(error.message)}</p>`; return; }
  let l = data || [];
  if ($('f-falta').checked) l = l.filter(r => r.falta_enviar > 0);
  $('total').textContent = l.length ? `${l.length} cliente(s) · ${mesBR($('f-comp').value)}` : '';
  if (!l.length) { $('corpo-comp').innerHTML = '<p class="tf-nada">Nenhum documento gerado nesta competência.</p>'; return; }
  const n = v => v ? String(v) : '<span class="ev-zero">0</span>';
  const tot = k => l.reduce((s, r) => s + Number(r[k] || 0), 0);
  $('corpo-comp').innerHTML = `<table class="tf-tab ev-comp"><thead><tr><th>Cliente</th><th class="ev-num">Gerados</th><th class="ev-num">No portal</th>
      <th class="ev-num c-opc">WhatsApp</th><th class="ev-num c-opc">E-mail</th><th class="ev-num c-opc">Vistos</th><th class="ev-num">Falta enviar</th></tr></thead><tbody>
    ${l.map(r => `<tr><td>${esc(r.empresa_nome)}${r.empresa_teste ? ' <span class="tf-tag tf-tag--teste">teste</span>' : ''}</td>
      <td class="ev-num">${n(r.gerados)}</td><td class="ev-num">${n(r.no_portal)}</td><td class="ev-num c-opc">${n(r.por_whatsapp)}</td>
      <td class="ev-num c-opc">${n(r.por_email)}</td><td class="ev-num c-opc">${n(r.vistos)}</td>
      <td class="ev-num">${r.falta_enviar ? `<span class="ev-falta">${r.falta_enviar}</span>` : n(0)}</td></tr>`).join('')}
    <tr><td><b>Total</b></td>${['gerados', 'no_portal', 'por_whatsapp', 'por_email', 'vistos', 'falta_enviar'].map(k => `<td class="ev-num${['por_whatsapp', 'por_email', 'vistos'].includes(k) ? ' c-opc' : ''}"><b>${tot(k)}</b></td>`).join('')}</tr>
    </tbody></table>`;
}
$('f-comp').onchange = carregaComp; $('f-falta').onchange = carregaComp;

// ===== textos padrão =====
const GRUPO = { documento: 'Documento', cobranca: 'Cobrança', lembrete: 'Lembrete', relacionamento: 'Relacionamento', pedido: 'Pedido' };
function desenhaModelos() {
  $('total').textContent = `${MODS.length} texto(s)`;
  const ro = GESTOR ? '' : 'readonly';
  $('corpo-mod').innerHTML = MODS.map(m => `<form class="ev-mod" data-mod="${m.codigo}">
      <h3>${esc(m.nome)} <small>${GRUPO[m.grupo] || m.grupo}${m.meta_template ? ' · modelo da Meta: ' + esc(m.meta_template) : ' · sem modelo aprovado na Meta'}</small></h3>
      <div class="ev-mod__g">
        <label>WhatsApp<textarea class="ui-txt" name="texto_whatsapp" ${ro}>${esc(m.texto_whatsapp || '')}</textarea></label>
        <label>E-mail<input class="ui-in" name="assunto" value="${esc(m.assunto || '')}" ${ro} aria-label="Assunto"><textarea class="ui-txt" name="texto_email" ${ro}>${esc(m.texto_email || '')}</textarea></label>
      </div>
      <div class="ev-mod__pe"><span>Variáveis: {{nome}}, {{empresa}} e {{link}} entram sozinhas.</span>${GESTOR ? '<button class="ui-btn" type="submit">Salvar</button>' : ''}</div>
    </form>`).join('');
  $('corpo-mod').querySelectorAll('form').forEach(f => {
    f.onsubmit = async ev => {
      ev.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      const { error } = await banco.from('envio_modelo').update({ ...d, atualizado_em: new Date().toISOString() }).eq('codigo', f.dataset.mod);
      if (error) return avisa('Não salvou: ' + error.message);
      Object.assign(MODS.find(m => m.codigo === f.dataset.mod), d);
      avisa('Texto salvo. Vale para os próximos envios.');
    };
  });
}

// ===== novo envio / lote =====
$('n-modelo').innerHTML = MODS.filter(m => m.ativo).map(m => `<option value="${m.codigo}">${esc(m.nome)}</option>`).join('');
const variaveisDe = m => [...new Set(((m?.texto_whatsapp || '') + (m?.texto_email || '') + (m?.assunto || '')).match(/\{\{([a-z_0-9]+)\}\}/g) || [])]
  .map(v => v.slice(2, -2)).filter(v => !AUTO.includes(v));
function camposVars() {
  const m = MODS.find(x => x.codigo === $('n-modelo').value);
  $('n-vars').innerHTML = variaveisDe(m).map(v => v === 'resumo'
    ? `<label style="grid-column:1/-1"><span>${ROTULO[v] || v}</span><textarea class="ui-txt" data-var="${v}" rows="3"></textarea></label>`
    : `<label><span>${ROTULO[v] || v}</span><input class="ui-in" data-var="${v}"></label>`).join('');
  $('n-vars').querySelectorAll('[data-var]').forEach(i => { i.oninput = previa; });
  previa();
}
function vars() { return Object.fromEntries([...$('n-vars').querySelectorAll('[data-var]')].map(i => [i.dataset.var, i.value.trim()]).filter(([, v]) => v)); }
function previa() {
  const m = MODS.find(x => x.codigo === $('n-modelo').value); if (!m) return;
  const v = { nome: 'Ana', empresa: 'Empresa do cliente', link: 'https://kompila.com.br/coleve/sistema/area/', ...vars() };
  const r = t => (t || '').replace(/\{\{([a-z_0-9]+)\}\}/g, (_, k) => v[k] ?? '');
  const canal = $('n-canais').value;
  $('n-prev').textContent = [canal !== 'email' && m.texto_whatsapp ? 'WhatsApp\n' + r(m.texto_whatsapp) : '',
    canal !== 'whatsapp' && m.texto_email ? 'E-mail: ' + r(m.assunto) + '\n' + r(m.texto_email) : ''].filter(Boolean).join('\n\n');
}
function listaEmps() {
  const b = $('n-busca').value.trim().toLowerCase();
  const marcados = new Set([...$('n-emps').querySelectorAll('input:checked')].map(i => i.value));
  $('n-emps').innerHTML = EMPS.filter(e => !b || nomeEmp(e).toLowerCase().includes(b))
    .map(e => `<li><label><input type="checkbox" value="${e.id}" ${marcados.has(e.id) ? 'checked' : ''}>${esc(nomeEmp(e))}${e.teste ? '<small>teste</small>' : ''}</label></li>`).join('')
    || '<li class="ev-nota" style="padding:8px">Nenhum cliente.</li>';
  $('n-emps').querySelectorAll('input').forEach(i => { i.onchange = contaSel; });
  contaSel();
}
const escolhidos = () => [...$('n-emps').querySelectorAll('input:checked')].map(i => i.value);
const contaSel = () => { $('n-sel-n').textContent = `${escolhidos().length} escolhido(s)`; };
$('n-modelo').onchange = camposVars; $('n-canais').onchange = previa; $('n-busca').oninput = listaEmps;
$('n-todos').onclick = () => { $('n-emps').querySelectorAll('input').forEach(i => { i.checked = true; }); contaSel(); };
$('n-fechar').onclick = () => $('dlg').close();
$('novo').onclick = () => {
  $('n-busca').value = ''; $('n-emps').innerHTML = ''; $('n-quando').value = '';
  if ($('f-emp').value) { listaEmps(); const i = $('n-emps').querySelector(`input[value="${$('f-emp').value}"]`); if (i) i.checked = true; }
  listaEmps(); camposVars(); $('dlg').showModal();
};
$('f-novo').onsubmit = async ev => {
  ev.preventDefault();
  const ids = escolhidos();
  if (!ids.length) return avisa('Escolha pelo menos um cliente.');
  if (ids.length > 1 && !confirm(`Colocar na fila para ${ids.length} clientes?`)) return;
  $('n-ok').disabled = true;
  const { data, error } = await banco.rpc('envio_lote', {
    p_empresas: ids, p_modelo: $('n-modelo').value, p_vars: vars(),
    p_canais: $('n-canais').value ? [$('n-canais').value] : null,
    p_agendado: $('n-quando').value ? new Date($('n-quando').value).toISOString() : new Date().toISOString()
  });
  $('n-ok').disabled = false;
  if (error) return avisa('Não deu: ' + error.message);
  $('dlg').close();
  avisa(data ? `${data} mensagem(ns) na fila.${config.some(c => c.ativo) ? '' : ' Envio desligado: ficam pendentes.'}` : 'Nenhum contato autorizado nesses clientes. Marque a autorização na ficha do contato.');
  if (vista === 'fila') carregaFila(); else mostra('fila');
};

// ===== tempo real =====
let rt;
banco.channel('envios').on('postgres_changes', { event: '*', schema: 'public', table: 'envio' }, () => {
  clearTimeout(rt); rt = setTimeout(() => { if (vista === 'fila') carregaFila(); }, 600);
}).subscribe();

await carregaConfig();
mostra('fila');
document.body.classList.remove('carregando');
