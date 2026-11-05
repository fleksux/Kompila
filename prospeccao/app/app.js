// kompila prospecção · app (31/10/2026)
// Login Google → Liz pergunta (cidade + nicho, ou lista) → canvas ao vivo → Raio-X de cada empresa.
const sb = supabase.createClient(KP_CONFIG.url, KP_CONFIG.anon)
const $ = id => document.getElementById(id)
const esc = t => String(t ?? '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m])
const mob = () => innerWidth <= 700
const espera = ms => new Promise(r => setTimeout(r, ms))

const IC = {
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12l5 5L20 7"/></svg>',
  bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/></svg>',
  at: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 11l14-6v14L3 13z"/><path d="M7 13v5a2 2 0 004 0v-3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  nicho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h6"/></svg>',
  arr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  gmn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9"/><path d="M4 9v11h16V9"/><path d="M4 9a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0 2.7 2.7 0 005.3 0"/><path d="M10 20v-5h4v5"/></svg>',
  site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>',
  ads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 10v4a1 1 0 001 1h2l5 4V5L6 9H4a1 1 0 00-1 1z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  ct: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>',
  emp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h3M8 11h3M8 15h3M13 7h3M13 11h3M13 15h3"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 14l3-3 3 3M12 11v6"/></svg>',
}
const star = on => `<svg viewBox="0 0 24 24" fill="${on ? '#F5B83D' : '#E1E1DC'}"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z"/></svg>`
// custo em reais: a IA cobra em dólar, a tela mostra real com o câmbio do dia
const CAPIVARA_USD = 0.016 // Sonnet 5.5, média medida no teste de 31/10 (Opus era 0.036)
let DOLAR = 5.44 // câmbio de 30/10; troca pelo do dia assim que a AwesomeAPI responde
fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL').then(r => r.json()).then(j => { const v = +j?.USDBRL?.bid; if (v > 1) DOLAR = v }).catch(() => {})
const reais = usd => 'R$ ' + (usd * DOLAR).toFixed(2).replace('.', ',')
// saldo do cliente em reais (preços decididos pelo Alex em 01/11: busca R$ 0,50, Raio-X R$ 0,50, conta nova R$ 20; contas de 01/11 isentas)
let SALDO = { isento: false, saldo: 0, busca: 50, raiox: 50 }
const brlC = c => 'R$ ' + (c / 100).toFixed(2).replace('.', ',')
const custoRaiox = () => ''   // 01/11 (Alex): a tela mostra o que dá pra fazer, não o preço; o preço fica no "?"
// quanto o saldo rende: listas simples ou Raio-X (na busca nova, 1 lista + o resto em Raio-X)
const rende = (c = SALDO.saldo) => ({ listas: Math.floor(c / SALDO.busca), raiox: Math.max(0, Math.floor((c - SALDO.busca) / SALDO.raiox)), avulsos: Math.floor(c / SALDO.raiox) })
const emp = n => (n * 60).toLocaleString('pt-BR')   // cada lista simples traz até 60 empresas
const BTN_COMO = '<button class="como" data-como title="Como funciona" aria-label="Como funciona">?</button>'
function comoFunciona() {
  const ini = 500, r0 = rende(ini)
  $('indB').innerHTML = `<div class="ind-k">[ COMO FUNCIONA ]</div><h2>Você paga só pelo que usa.</h2>
    <div class="cf"><div><b>Lista simples</b><span>Até 60 empresas da cidade e do nicho, cada uma com potencial, motivo e os contatos que estão no site.</span><em>${brlC(SALDO.busca)} por busca</em></div>
    <div><b>Raio-X</b><span>Uma empresa completa: Google, site com prints e velocidade, anúncios e avaliações.</span><em>${brlC(SALDO.raiox)} por empresa</em></div></div>
    <p>Conta nova ganha <b>${brlC(ini)}</b> pra testar: dá pra ${r0.listas} listas simples (até ${emp(r0.listas)} empresas) ou ${r0.raiox} empresas com Raio-X completo. Cada lista traz até 60 empresas; cidade pequena ou nicho raro pode trazer menos. Pesquisar de novo o que você já pesquisou não desconta nada. Quando o saldo acabar, a Kompila recarrega pra você.</p>
    ${SALDO.isento ? '<p><b>Sua conta é isenta:</b> usa à vontade, nada é descontado.</p>' : `<p>Seu saldo agora: <b>${brlC(SALDO.saldo)}</b>.</p>`}`
  $('indO').hidden = false; requestAnimationFrame(() => $('indO').classList.add('on'))
}
document.addEventListener('click', e => { if (e.target.closest('[data-como]')) { e.preventDefault(); e.stopPropagation(); comoFunciona() } }, true)
async function boasVindas() {
  if (SALDO.isento) return
  const { count } = await sb.from('buscas').select('id', { count: 'exact', head: true })
  if (count) return
  const r0 = rende()
  setTimeout(() => liz(`Bem-vindo! Faça suas primeiras <b>${r0.listas} listas simples (até ${emp(r0.listas)} empresas)</b> ou <b>${r0.raiox} empresas com Raio-X completo</b> por nossa conta. ${BTN_COMO}`, 12000), 1500)
}
async function carregarSaldo() { const { data } = await sb.rpc('meu_saldo'); if (data) SALDO = data; return SALDO }
const ANG = { dor: 'Atendimento', canal: 'Presença digital', crescimento: 'Crescimento', nenhum: 'Fora do perfil' }

/* ======================= estado ======================= */
let usuario = null, busca = null, diags = [], poll = null, cache = {}

/* ======================= Liz falando ======================= */
let rt
function liz(texto, ms = 5200) { $('replyTx').innerHTML = texto; $('reply').classList.add('on'); clearTimeout(rt); rt = setTimeout(() => $('reply').classList.remove('on'), ms) }
function vivo(on, tx) { $('dot').classList.toggle('off', !on); $('liveTx').textContent = tx }

/* ======================= login ======================= */
$('bGoogle').onclick = async () => {
  const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })
  if (error) $('loginErr').textContent = 'Não consegui abrir o login do Google. Tenta de novo.'
}
$('bSair').onclick = async () => { await sb.auth.signOut(); location.reload() }

async function iniciar() {
  const { data: { session } } = await sb.auth.getSession()
  const erroUrl = new URLSearchParams(location.hash.slice(1)).get('error_description') || new URLSearchParams(location.search).get('error_description')
  if (!session) {
    $('login').hidden = false
    if (erroUrl) $('loginErr').textContent = /n[aã]o liberado|Database error/i.test(erroUrl) ? 'Esse e-mail ainda não está liberado. Fala com o Alex.' : 'O login não completou. Tenta de novo.'
    return
  }
  usuario = session.user
  try { const s = localStorage.getItem('liz_sessao_kmp_kompila'); if (s && !localStorage.getItem('kp_intake_ligado')) sb.rpc('ligar_intake', { p_sessao: s }).then(() => { try { localStorage.setItem('kp_intake_ligado', '1') } catch (_) {} }, () => {}) } catch (_) {}
  history.replaceState(null, '', location.pathname)
  $('login').hidden = true
  $('pUser').hidden = $('pHist').hidden = $('pSec').hidden = $('pZoom').hidden = $('fab').hidden = false; carregarSaudacao()
  badgeConv(); setInterval(badgeConv, 15000)
  const inicial = () => { $('av').hidden = true; $('avL').hidden = false; $('avL').textContent = (usuario.user_metadata?.full_name || usuario.email || '?').trim().charAt(0).toUpperCase() }
  $('av').onerror = inicial
  if (usuario.user_metadata?.avatar_url) $('av').src = usuario.user_metadata.avatar_url; else inicial()
  $('av').title = $('avL').title = usuario.email
  vivo(false, 'Liz parada')
  carregarSaldo().then(boasVindas)
  carregarHist(); contarCaptacao()
  pergunta(1)
}

/* ======================= pergunta ======================= */
const PIN = IC.ok
let esc_ = { cidade: '', nicho: '', todas: false }
function pergunta(passo) {
  $('lv').hidden = true
  document.body.classList.add('fora')
  $('ask').hidden = false; $('ask').classList.remove('bye')
  const nome = (usuario?.user_metadata?.full_name || '').split(' ')[0]
  const cid = ['Campinas, SP', 'Santos, SP', 'São Paulo, SP', 'Ribeirão Preto, SP']
  const nic = ['Clínica odontológica', 'Padaria', 'Pet shop', 'Academia', 'Imobiliária', 'Pizzaria']
  const q = passo === 1
    ? { stp: '1 de 2', h: `${hora()}${nome ? ', ' + esc(nome) : ''}.<br>Em que <em>cidade</em> a gente prospecta hoje?`, ph: 'Digite a cidade', sg: cid, bt: 'Continuar' }
    : { stp: '2 de 2', h: `E qual <em>nicho</em> eu procuro em ${esc(esc_.cidade.split(',')[0])}?`, ph: 'Ex: clínica de estética', sg: nic, bt: 'Começar a busca' }
  $('askc').innerHTML = `${passo === 2 ? `<div class="pick">${PIN}${esc(esc_.cidade)}</div>` : ''}<div class="stp">${q.stp}</div><h2>${q.h}</h2>
    ${passo === 2 ? modosHtml() : ''}
    <div class="fld"><input type="text" id="aq" placeholder="${q.ph}" autocomplete="off"><button class="btn go lg" id="ab">${q.bt}</button></div>
    <div class="err" id="ae"></div><div class="sg">${q.sg.map(x => `<button>${x}</button>`).join('')}</div>
    ${passo === 2 ? `<div class="mds-s" id="mdS">${saldoDepois()}</div>` : ''}
    ${passo === 1 ? `<div class="ou">ou</div><div class="drop" id="drop"><div class="di">${IC.arq}</div><div><b>Sobe uma lista</b><small>Excel ou CSV com empresa, site ou cidade. Conta pessoal eu descarto.</small></div></div>` : ''}`
  const aq = $('aq'); if (!mob()) aq.focus()
  const vai = v => {
    v = (v || '').trim()
    if (!v) { $('ae').textContent = passo === 1 ? 'Me fala uma cidade pra eu começar.' : 'Me fala um nicho pra eu começar.'; aq.focus(); return }
    if (passo === 1) { esc_.cidade = cid.find(c => c.toLowerCase().startsWith(v.toLowerCase())) || v; pergunta(2) }
    else { esc_.nicho = v.charAt(0).toUpperCase() + v.slice(1); fecharPergunta(); rodarBusca(esc_.cidade, esc_.nicho, esc_.modo || 'lista') }
  }
  $('ab').onclick = () => vai(aq.value)
  aq.onkeydown = e => { if (e.key === 'Enter') vai(aq.value) }
  $('askc').querySelectorAll('.sg button').forEach(b => b.onclick = () => vai(b.textContent))
  $('askc').querySelectorAll('.md').forEach(b => b.onclick = () => { esc_.modo = b.dataset.m; $('askc').querySelectorAll('.md').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b) }); $('mdS').innerHTML = saldoDepois() })
  const dr = $('drop')
  if (dr) {
    dr.onclick = () => $('arq').click()
    dr.ondragover = e => { e.preventDefault(); dr.classList.add('on') }
    dr.ondragleave = () => dr.classList.remove('on')
    dr.ondrop = e => { e.preventDefault(); dr.classList.remove('on'); if (e.dataTransfer.files[0]) lerArquivo(e.dataTransfer.files[0]) }
  }
}
// o padrão é só a lista: Raio-X é escolha de quem quer a análise detalhada
const MODOS = [['lista', 'Lista', 'Até 60 empresas do Google Maps, com nota, telefone e site. Depois você enriquece ou faz Raio-X de quem quiser.', 0], ['completa', 'Lista + 5 Raio-X', 'A lista completa e a análise detalhada das 5 com mais potencial: site, anúncios e avaliações.', 5], ['todas', 'Lista + Raio-X de todas', 'Análise detalhada de todas as empresas da lista, até 60. Gasta mais saldo.', 60]]
const custoModo = m => SALDO.busca + MODOS.find(x => x[0] === m)[3] * SALDO.raiox
function saldoDepois() {
  if (SALDO.isento) return `Sua conta é isenta: usa à vontade. ${BTN_COMO}`
  const m = esc_.modo || 'lista', c = custoModo(m), r0 = rende()
  const base = `Seu saldo dá pra <b>${r0.listas} lista${r0.listas === 1 ? '' : 's'} simples (até ${emp(r0.listas)} empresas)</b> ou <b>${r0.raiox} empresa${r0.raiox === 1 ? '' : 's'} com Raio-X</b>. ${BTN_COMO}`
  return SALDO.saldo >= c || m === 'todas' ? base : `<span class="neg">Seu saldo não cobre essa opção.</span> ${base}`
}
function modosHtml() {
  esc_.modo = esc_.modo || 'lista'
  return `<div class="mds" role="group" aria-label="O que você quer receber">${MODOS.map(([k, t, s]) => `<button class="md${esc_.modo === k ? ' on' : ''}" data-m="${k}" aria-pressed="${esc_.modo === k}"><i></i><span><b>${t}</b><small>${s}</small></span></button>`).join('')}</div>`
}
function fecharPergunta() { $('ask').classList.add('bye'); setTimeout(() => $('ask').hidden = true, 700); document.body.classList.remove('fora') }
const hora = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' }

/* ======================= lista (Excel/CSV) ======================= */
$('arq').onchange = e => { if (e.target.files[0]) lerArquivo(e.target.files[0]); e.target.value = '' }
const PROVEDOR = /^(gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|icloud|me|mac|bol|uol|terra|ig|globo|globomail|r7|zipmail|protonmail|aol)\./i
const MEI = /^\s*\d{2}\.?\d{3}\.?\d{3}(\/?\d{4}-?\d{2})?\s+\S/
const ehDominio = s => /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\.[a-z]{2})?\/?$/i.test(s)

async function lerArquivo(arq) {
  try {
    const wb = XLSX.read(await arq.arrayBuffer(), { type: 'array' })
    const linhas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
    if (!linhas.length) return liz('A planilha veio vazia.')
    const cols = Object.keys(linhas[0])
    const acha = re => cols.find(c => re.test(c))
    // só pega coluna de empresa, site e cidade. Nome de pessoa, telefone e WhatsApp ficam de fora.
    const cEmp = acha(/empresa|raz[aã]o|fantasia|companhia|cliente/i), cSite = acha(/site|dom[ií]nio|url|web/i), cCid = acha(/cidade|munic[ií]pio/i), cMail = acha(/e-?mail/i)
    const itens = [], fora = []
    for (const l of linhas) {
      let emp = String(cEmp ? l[cEmp] : '').trim(), site = String(cSite ? l[cSite] : '').trim()
      const mail = String(cMail ? l[cMail] : '').trim(), cidade = String(cCid ? l[cCid] : '').trim()
      if (!site && mail.includes('@')) site = mail.split('@')[1]
      if (!site && ehDominio(emp)) { site = emp; emp = '' }
      if (!emp && !site) continue
      const dom = site.replace(/^https?:\/\//, '').replace(/^www\./, '')
      if (dom && PROVEDOR.test(dom)) { fora.push({ t: emp || dom, m: 'e-mail pessoal' }); continue }
      if (MEI.test(emp)) { fora.push({ t: emp.replace(/\s.*$/, '…'), m: 'MEI ou CPF' }); continue }
      itens.push({ nome: emp || undefined, site: site || undefined, cidade: cidade || undefined })
    }
    const unicos = [...new Map(itens.map(i => [(i.site || i.nome || '').toLowerCase(), i])).values()]
    mostrarLista(arq.name.replace(/\.[^.]+$/, ''), unicos, fora)
  } catch { liz('Não consegui ler esse arquivo. Manda em Excel (.xlsx) ou CSV.') }
}
function mostrarLista(nome, itens, fora) {
  const MAX = 50
  $('askc').innerHTML = `<div class="stp">Lista</div><h2>Achei <em>${itens.length} empresas</em> em "${esc(nome)}".</h2>
    <p class="sub">Descartei ${fora.length} conta${fora.length === 1 ? '' : 's'} pessoa${fora.length === 1 ? 'l' : 'is'}. ${itens.length > MAX ? `Vou analisar as primeiras ${MAX} agora, o resto fica pra próxima rodada.` : 'Vou achar cada uma no Google e montar o Raio-X.'}</p>
    <div class="prev">${itens.slice(0, MAX).map(i => `<div class="pr"><b>${esc(i.nome || i.site)}</b><span>${esc(i.nome && i.site ? i.site : i.cidade || '')}</span></div>`).join('')}${fora.slice(0, 20).map(f => `<div class="pr fora">${esc(f.t)} <span>${f.m}</span></div>`).join('')}</div>
    <div class="fld"><button class="btn ghost lg" id="lv">Voltar</button><button class="btn go lg" id="lg" style="flex:1">Analisar ${Math.min(itens.length, MAX)} empresas</button></div>`
  $('lv').onclick = () => pergunta(1)
  $('lg').onclick = () => { fecharPergunta(); rodarLista(nome, itens.slice(0, MAX)) }
}

/* ======================= chamadas ======================= */
async function chamar(fn, corpo) {
  const { data, error } = await sb.functions.invoke(fn, { body: corpo })
  if (error) {
    let msg = 'Algo deu errado.'
    try { msg = (await error.context.json()).erro || msg } catch { /* sem corpo */ }
    throw new Error(msg)
  }
  return data
}

// "Veterinário", "veterinario", "Vetirinario" e "Veterinários" viram a mesma chave
const chave = t => String(t || '').split(',')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean).map(w => w.length > 3 ? w.replace(/(oes|aes|es|s)$/, '') : w).join(' ')
function distancia(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 1; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[m][n]
}
const parecida = (a, b) => { a = chave(a); b = chave(b); return a === b || (Math.min(a.length, b.length) >= 5 && distancia(a, b) <= 2) }

async function rodarBusca(cidade, nicho, modo = 'lista', quero = 60, novaMesmo = false) {
  if (modo === true) modo = 'todas'; if (!modo) modo = 'lista'
  // já pesquisou essa cidade e esse nicho (mesmo escrito diferente)? abre o que já tem e não gasta nada
  if (!novaMesmo) {
    const { data: antigas } = await sb.from('buscas').select('*').neq('cidade', 'Lista').neq('status', 'erro').order('criada_em', { ascending: false }).limit(200)
    const ja = (antigas || []).find(b => chave(b.cidade) === chave(cidade) && parecida(b.nicho, nicho))
    if (ja) {
      await abrirBusca(ja, modo === 'lista')
      liz(`Você já pesquisou <b>${esc(ja.nicho)} em ${esc(ja.cidade.split(',')[0])}</b> em ${new Date(ja.criada_em).toLocaleDateString('pt-BR')}. Abri o resultado, sem gastar nada. Quer empresas novas? Usa o <b>Buscar mais</b>.`, 9000)
      return
    }
  }
  montarCanvas({ cidade, nicho, status: 'buscando', olhadas: 0, novas: 0, com_dor: 0 }, true)
  vivo(true, 'Liz procurando')
  try {
    const b = await chamar('buscar', { cidade, nicho, quero })
    busca = { id: b.busca_id, cidade, nicho, status: 'peneirando', olhadas: b.olhadas, novas: b.novas, com_dor: 0 }
    atualizarFunil(); dizer(`Olhei ${b.olhadas} empresas. ${b.ja_tinha ? b.ja_tinha + ' você já tinha, então ' : ''}${b.novas} são novas${b.novas < quero ? ` (pedi ${quero}, mas a cidade não tem mais que isso nesse nicho)` : ''}. Lendo as avaliações agora.`)
    if (!b.novas) return fim('Nenhuma empresa nova nessa busca. Tenta outro nicho ou outra cidade.')
    carregarSaldo()
    await peneirar(modo)
  } catch (e) { erro(e) }
}
async function rodarLista(nome, itens) {
  montarCanvas({ cidade: 'Lista', nicho: nome, status: 'buscando', olhadas: itens.length, novas: 0, com_dor: 0 }, true)
  vivo(true, 'Liz procurando')
  try {
    const r = await chamar('importar', { nome_lista: nome, itens })
    busca = { id: r.busca_id, cidade: 'Lista', nicho: nome, status: 'peneirando', olhadas: r.na_lista, novas: r.achadas_no_google + r.so_pelo_site, com_dor: 0 }
    atualizarFunil(); dizer(`Achei ${r.achadas_no_google} no Google${r.so_pelo_site ? ` e ${r.so_pelo_site} só pelo site` : ''}.${r.nao_e_empresa ? ` ${r.nao_e_empresa} não parecem empresa.` : ''} Montando os Raio-X.`)
    carregarSaldo()
    await peneirar('todas')
  } catch (e) { erro(e) }
}
async function peneirar(modo) {
  const a = await chamar('analisar', { busca_id: busca.id, modo })
  busca.com_dor = a.com_dor; atualizarFunil()
  // a lista traz só o que vem do Google Maps. Contato do site é no Enriquecer, quando a pessoa quiser.
  if (modo === 'lista') { fim(`Lista pronta: ${a.olhadas} empresas.`); await abrirListaHome(); return }
  if (!a.finalistas) return fim('Nenhuma empresa com potencial forte aqui. Bora outro nicho?')
  dizer(`${a.finalistas} empresas merecem Raio-X. Já estou montando, uma por uma.`)
  acompanhar()
}
function erro(e) { vivo(false, 'Liz parada'); liz(/saldo/i.test(e.message) ? esc(e.message) : `Travei aqui: ${esc(e.message)}`, 8000); if (busca) { busca.status = 'erro'; atualizarFunil() } }
function fim(t) { vivo(false, 'Liz parada'); dizer(t); carregarHist(); if (!$('lv').hidden) abrirListaHome() }

function acompanhar() {
  clearInterval(poll)
  const passo = async () => {
    const [{ data: b }, { data: d }] = await Promise.all([
      sb.from('buscas').select('*').eq('id', busca.id).single(),
      sb.from('diagnosticos').select('id, status, angulo, nota_dor, decisao, abordagem, capivara, erro, empresa:empresas(nome, bairro, cidade)').eq('busca_id', busca.id).in('status', ['na_fila', 'lendo', 'pronto', 'erro']).order('nota_dor', { ascending: false }),
    ])
    if (b) busca = b
    diags = (d ?? []).filter(x => x.status !== 'pronto' || Object.keys(x.capivara || {}).length || x.status === 'erro')
    atualizarFunil(); desenharCards()
    if (busca.status === 'pronta' || busca.status === 'erro') {
      clearInterval(poll)
      const n = diags.filter(x => x.status === 'pronto').length
      fim(`Pronto. ${n} Raio-X pra você olhar. ${mob() ? 'Toca' : 'Clica'} numa empresa pra abrir.`)
    }
  }
  passo(); poll = setInterval(passo, 4000)
}

/* ======================= canvas ======================= */
const world = $('world'), wires = $('wires'), vp = $('vp')
let cam = { x: 0, y: 0, s: 1 }, anim = null
let L = {}
function layout() {
  return mob()
    ? { A: { x: 0, y: 0, w: 358 }, B: { x: 0, y: 340, w: 358 }, C: { x: 0, y: 840, w: 358 } }
    : { A: { x: 0, y: 0, w: 420 }, B: { x: 500, y: 0, w: 1040 }, C: { x: 0, y: 360, w: 1540 } }
}
function montarCanvas(b, animar) {
  $('lv').hidden = true
  busca = { ...b }; diags = []; L = layout(); assinatura = ''
  $('fname').textContent = b.cidade === 'Lista' ? `/ Lista · ${b.nicho}` : `/ ${b.nicho} · ${b.cidade.split(',')[0]}`
  if (mob()) return montarCelular(b)
  vp.hidden = false; $('mobv').hidden = true
  world.querySelectorAll('.frame,#liz,.cred').forEach(n => n.remove()); wires.innerHTML = ''
  const fr = (id, r, label, html, ghost) => { const d = document.createElement('div'); d.className = 'frame' + (ghost ? ' ghost' : ''); d.id = id; Object.assign(d.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px' }); d.innerHTML = `<div class="fl"><b>${label}</b></div><div class="fb"></div><div class="fc">${html}</div>`; world.appendChild(d); return d }
  const lista = b.cidade === 'Lista'
  fr('fA', L.A, 'Briefing', `<div class="br"><div style="flex:1;min-width:0"><div class="per">${new Date().toLocaleDateString('pt-BR')} · agora</div><div class="say" id="say">${lista ? 'Lendo a sua lista.' : 'Procurando no Google Maps.'}</div>
    <div class="chips">${lista ? `<span class="chip">${IC.arq}${esc(b.nicho)}</span>` : `<span class="chip">${IC.nicho}${esc(b.nicho)}</span><span class="chip">${IC.pin}${esc(b.cidade)}</span>`}</div></div><img src="img/liz_fala_3d.png" alt="Liz"></div>`)
  const nodes = [['olhadas', lista ? 'na lista' : 'empresas olhadas', lista ? 'da sua planilha' : 'Google Maps'], ['novas', lista ? 'achadas' : 'novas', lista ? 'no Google ou pelo site' : 'sem repetir'], ['com_dor', 'com potencial', 'atendimento, presença ou crescimento', 1], ['capivaras', 'Raio-X', 'prontos pra você'], ['aprovadas', 'no pipeline', 'as que você escolheu']]
  const fl = nodes.map(([k, t, s, hl]) => `<div class="node${hl ? ' hl' : ''}" id="n_${k}"><div class="v">0</div><div class="k">${t}</div><div class="s">${s}</div></div>`)
  fr('fB', L.B, 'Triagem', mob() ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${fl.join('')}</div>` : `<div class="flow">${fl.join(`<div class="arr">${IC.arr}</div>`)}</div>`)
  fr('fC', L.C, 'Raio-X · clica numa empresa pra abrir', '<div class="cards" id="cards"></div>', true)
  const lz = document.createElement('div'); lz.id = 'liz'
  lz.innerHTML = `<div class="cs"><svg viewBox="0 0 24 24"><path d="M3 2l17 9.5-7.5 1.8L8.5 21z" fill="#2FD67B" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="tag"><img src="img/liz_rosto_3d.png" alt="">Liz</div><div class="chat" id="chat"></div></div>`
  world.appendChild(lz)
  if (animar) {
    lz.style.transition = 'none'; lz.style.left = (L.A.x + L.A.w + 200) + 'px'; lz.style.top = '420px'; void lz.offsetWidth; lz.style.transition = ''
    cam = camPara({ x: -200, y: -200, w: L.A.w + 900, h: 900 }); cam.s *= .8; aplicar()
    setTimeout(() => { voar(camPara({ ...L.A, h: 260 }, 40)); lizEm(L.A.x + 24, L.A.y + 24) }, 150)
    setTimeout(() => $('fA').classList.add('on'), 900)
    setTimeout(() => { voar(trabalho()); lizEm(L.B.x + (mob() ? 160 : L.B.w * .45), L.B.y + 30) }, 2000)
    setTimeout(() => $('fB').classList.add('on'), 2700)
    setTimeout(() => $('fC').classList.add('on'), 3300)
  } else { ['fA', 'fB', 'fC'].forEach(i => $(i).classList.add('on')); voar(trabalho(), 0); lizEm(L.B.x + 200, L.B.y + 40) }
}
// celular: página normal que rola com o dedo (o canvas solto trava no toque)
function montarCelular(b) {
  vp.hidden = true; const m = $('mobv'); m.hidden = false
  const lista = b.cidade === 'Lista'
  const nodes = [['olhadas', lista ? 'na lista' : 'olhadas'], ['novas', lista ? 'achadas' : 'novas'], ['com_dor', 'com potencial', 1], ['capivaras', 'Raio-X'], ['aprovadas', 'no pipeline']]
  m.innerHTML = `<section class="m-br"><img src="img/liz_fala_3d.png" alt="Liz"><div style="min-width:0"><div class="say" id="say">${lista ? 'Lendo a sua lista.' : 'Procurando no Google Maps.'}</div>
      <div class="chips">${lista ? `<span class="chip">${IC.arq}${esc(b.nicho)}</span>` : `<span class="chip">${IC.nicho}${esc(b.nicho)}</span><span class="chip">${IC.pin}${esc(b.cidade.split(',')[0])}</span>`}</div></div></section>
    <div class="m-fun">${nodes.map(([k, t, hl]) => `<div class="node${hl ? ' hl' : ''}" id="n_${k}"><div class="v">0</div><div class="k">${t}</div></div>`).join('')}</div>
    <div class="m-acoes" id="mAcoes"></div>
    <div class="m-tit"><span>Raio-X</span><button data-lista>Ver todas em lista</button></div>
    <div class="cards" id="cards"></div>
    <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div>`
  m.scrollTop = 0
}
document.addEventListener('click', e => { if (e.target.closest('[data-lista]')) abrirLista() })

function atualizarFunil() {
  if (!busca || !$('n_olhadas')) return
  const cap = diags.filter(d => d.status === 'pronto').length, apr = diags.filter(d => d.decisao === 'aprovada').length
  const vals = { olhadas: busca.olhadas, novas: busca.novas, com_dor: busca.com_dor, capivaras: cap, aprovadas: apr }
  for (const [k, v] of Object.entries(vals)) { const el = $('n_' + k); if (!el) continue; const alvo = v ?? 0; if (el.dataset.v != alvo) { conta(el.querySelector('.v'), +(el.dataset.v || 0), alvo); el.dataset.v = alvo } }
  const etapa = { buscando: 'olhadas', peneirando: 'com_dor', diagnosticando: 'capivaras' }[busca.status]
  document.querySelectorAll('.node').forEach(n => n.classList.toggle('vivo', n.id === 'n_' + etapa))
  const say = $('say')
  const resto = Math.max(0, (busca.novas || 0) - diags.length)
  if (mob()) {
    if (say) say.innerHTML = busca.status === 'pronta' ? `Achei <em>${cap} empresa${cap === 1 ? '' : 's'}</em> que valem a abordagem.` : busca.status === 'erro' ? 'Travei nessa busca.' : busca.status === 'diagnosticando' ? `Montando os Raio-X: <em>${cap}</em> prontas.` : say.innerHTML
    const ac = $('mAcoes')
    if (ac) ac.innerHTML = busca.status === 'erro' ? '<button class="btn go" id="bDeNovo">Tentar de novo</button>'
      : busca.status === 'pronta' ? `${resto ? `<button class="btn line" id="bResto">Raio-X das outras ${resto}${custoRaiox(resto)}</button>` : ''}${busca.cidade !== 'Lista' ? `<div class="m-mais"><span>Encontrar mais empresas:</span>${[12, 30, 60].map(n => `<button class="btn line" data-mais="${n}">${n}</button>`).join('')}</div>` : ''}` : ''
    return
  }
  if (say) say.innerHTML = busca.status === 'pronta' ? `Achei <em>${cap} empresa${cap === 1 ? '' : 's'}</em> que valem a abordagem.${resto ? `<br><button class="btn line sm" id="bResto" style="margin-top:12px">Fazer Raio-X das outras ${resto}${custoRaiox(resto)}</button>` : ''}${busca.cidade !== 'Lista' ? `<div style="display:flex;gap:8px;align-items:center;margin-top:12px;flex-wrap:wrap"><span style="font-size:13px;color:var(--mu);font-weight:400">Encontrar mais empresas:</span>${[12, 30, 60].map(n => `<button class="btn line sm" data-mais="${n}">${n}</button>`).join('')}</div>` : ''}` : busca.status === 'erro' ? 'Travei nessa busca. <button class="btn go sm" id="bDeNovo" style="margin-top:12px">Tentar de novo</button>' : busca.status === 'diagnosticando' ? `Montando os Raio-X: <em>${cap}</em> prontas.` : say.innerHTML
}
document.addEventListener('click', e => {
  const n = e.target.dataset?.mais; if (!n || !busca) return
  const { cidade, nicho } = busca; clearInterval(poll); fecharCapivara(); vistos.clear()
  liz(`Bora: mais ${n} ${esc(nicho)} em ${esc(cidade.split(',')[0])}, só as que você ainda não tem.`)
  rodarBusca(cidade, nicho, false, +n, true)
})
document.addEventListener('click', async e => {
  if (e.target.id !== 'bResto' || !busca?.id) return
  e.target.disabled = true; e.target.textContent = 'Mandando pra Liz…'
  try { await fazerResto() } catch (er) { erro(er) }
})
// empresas que ficaram sem capivara nesta busca: entram na fila uma a uma
async function fazerResto() {
  const { data: sem } = await sb.from('diagnosticos').select('id').eq('busca_id', busca.id).eq('status', 'pronto').eq('capivara', '{}')
  if (!sem?.length) return liz('Todas já têm Raio-X.')
  await sb.from('diagnosticos').update({ status: 'na_fila' }).in('id', sem.map(x => x.id))
  await sb.from('buscas').update({ status: 'diagnosticando', terminada_em: null }).eq('id', busca.id)
  busca.status = 'diagnosticando'; vivo(true, 'Liz trabalhando'); dizer(`Bora: mais ${sem.length} Raio-X.`)
  for (const x of sem) { sb.functions.invoke('diagnosticar', { body: { diagnostico_id: x.id } }); await espera(400) }
  acompanhar()
}
document.addEventListener('click', async e => {
  if (e.target.id !== 'bDeNovo' || !busca?.id) return
  e.target.disabled = true; e.target.textContent = 'Tentando…'
  busca.status = 'peneirando'; atualizarFunil(); vivo(true, 'Liz trabalhando')
  try { await sb.from('buscas').update({ status: 'peneirando', erro: null }).eq('id', busca.id); await peneirar(busca.cidade === 'Lista') } catch (er) { erro(er) }
})
function conta(el, de, ate) { const t = performance.now(); (function s(n) { const k = Math.max(0, Math.min(1, (n - t) / 900)); el.textContent = Math.round(de + (ate - de) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(s) })(t) }

const vistos = new Set()
let assinatura = ''
function desenharCards() {
  const box = $('cards'); if (!box) return
  const sig = diags.map(d => d.id + d.status + d.decisao).join('|')
  if (sig === assinatura) return
  assinatura = sig
  box.innerHTML = diags.map((d, i) => {
    const c = d.capivara || {}, e = d.empresa || {}
    if (d.status !== 'pronto') return `<div class="co lendo" data-i="${i}"><div class="co-h"><div style="flex:1"><div class="nm">${esc(e.nome)}</div><div class="lo">${esc(e.bairro || e.cidade || '')}</div></div><span class="ang a-${d.angulo || 'nenhum'}">${ANG[d.angulo] || ''}</span></div>
      ${d.status === 'erro' ? `<div class="lendo-tag" style="color:var(--r)">Não consegui montar essa. ${esc((d.erro || '').slice(0, 80))}</div>` : `<div class="esq"></div><div class="esq" style="width:70%"></div><div class="lendo-tag"><i></i>Liz lendo site, Google e fotos…</div>`}</div>`
    const b = c.blocos || {}
    const mini = [['site', 'Site'], ['gmn', 'Google'], ['anuncios', 'Anúncios']].map(([k, t]) => b[k] ? `<span class="${b[k].status}">${t}: ${esc(b[k].status_txt)}</span>` : '').join('')
    const o = Math.round(138 - 138 * (c.nota || d.nota_dor || 0) / 100)
    return `<div class="co${d.decisao === 'pulada' ? ' pulada' : ''}" data-i="${i}"><div class="co-h"><div style="flex:1;min-width:0"><div class="nm">${esc(c.nome || e.nome)}</div><div class="lo">${esc([c.bairro, (c.cidade || '').split(',')[0]].filter(Boolean).join(' · '))}</div></div>
      <div class="ring"><svg viewBox="0 0 52 52"><circle class="b" cx="26" cy="26" r="22"/><circle class="f" cx="26" cy="26" r="22" style="stroke-dashoffset:${o}"/></svg><div class="n">${c.nota ?? d.nota_dor}</div></div></div>
      <div class="res">${esc(c.resumo)}</div><div class="mini3">${mini}</div>
      <div class="rod"><span class="ang a-${c.angulo || d.angulo}">${ANG[c.angulo || d.angulo] || ''}</span>${d.decisao !== 'pendente' ? `<span class="dec ${d.decisao}">${{ aprovada: '★ No pipeline', pulada: 'Pulada', ajustar: 'Ajustada' }[d.decisao] || ''}</span>` : ''}</div></div>`
  }).join('')
  box.querySelectorAll('.co:not(.lendo)').forEach(el => el.onclick = () => abrirSeq(diags[+el.dataset.i].id))
  // cursor da liz visita a capivara que acabou de ficar pronta
  const nova = diags.findIndex(d => d.status === 'pronto' && !vistos.has(d.id))
  if (nova >= 0) {
    diags.filter(d => d.status === 'pronto').forEach(d => vistos.add(d.id))
    const el = mob() ? null : box.querySelector(`.co[data-i="${nova}"]`)
    if (mob()) dizer(frase(diags[nova]))
    if (el) { const fC = $('fC'); lizEm(fC.offsetLeft + el.offsetLeft + el.offsetWidth - 60, fC.offsetTop + el.offsetTop + 40); setTimeout(() => dizer(frase(diags[nova])), 900) }
  }
  desenharFios()
}
const frase = d => { const c = d.capivara || {}, n = (c.nome || '').split(' - ')[0]; return c.angulo === 'crescimento' ? `${n} é forte. Abordagem de crescimento.` : c.angulo === 'dor' ? `${n} perde cliente por falta de resposta.` : `${n} precisa de canal próprio.` }
function desenharFios() {
  if (mob()) return
  const n = $('n_com_dor'), fB = $('fB'), fC = $('fC'), cards = [...document.querySelectorAll('#cards .co')].slice(0, mob() ? 1 : 3)
  if (!n || !cards.length || wires.childElementCount === cards.length) return
  wires.innerHTML = ''
  const x1 = fB.offsetLeft + n.offsetLeft + n.offsetWidth / 2 + 24, y1 = fB.offsetTop + n.offsetTop + n.offsetHeight + 24
  cards.forEach(c => {
    const x2 = fC.offsetLeft + c.offsetLeft + c.offsetWidth / 2 + 16, y2 = fC.offsetTop + c.offsetTop + 16, my = (y1 + y2) / 2
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`); wires.appendChild(p)
    p.style.setProperty('--len', p.getTotalLength()); requestAnimationFrame(() => p.classList.add('on'))
  })
}

/* câmera */
function aplicar() {
  world.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.s})`
  vp.style.backgroundSize = `${24 * cam.s}px ${24 * cam.s}px`; vp.style.backgroundPosition = `${cam.x}px ${cam.y}px`
  const lz = $('liz'); if (lz) lz.style.setProperty('--inv', 1 / cam.s)
}
function camPara(r, pad = 24) {
  const top = mob() ? 64 : 84, bot = mob() ? 84 : 104, side = mob() ? 16 : 48, vw = innerWidth - side * 2, vh = innerHeight - top - bot
  let s = Math.min(vw / (r.w + pad * 2), vh / ((r.h || 400) + pad * 2), mob() ? 1 : 1.1)
  if (mob()) s = Math.min(vw / (r.w + pad * 2), 1)
  return { s, x: side + (vw - r.w * s) / 2 - r.x * s, y: mob() ? top + 16 - r.y * s : top + (vh - (r.h || 400) * s) / 2 - r.y * s }
}
function trabalho() {
  if (mob()) return camPara({ ...L.A, h: 300 }, 0)
  const side = 48, vw = innerWidth - side * 2, s = Math.min(1, vw / L.C.w)
  return { s, x: side + (vw - L.C.w * s) / 2 - L.C.x * s, y: 100 }
}
function voar(to, ms = 1100) {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches || !ms) { cam = to; aplicar(); return }
  const de = { ...cam }, t0 = performance.now(); cancelAnimationFrame(anim)
  ;(function st(n) { let k = Math.min(1, (n - t0) / ms); k = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; cam = { x: de.x + (to.x - de.x) * k, y: de.y + (to.y - de.y) * k, s: de.s + (to.s - de.s) * k }; aplicar(); if (k < 1) anim = requestAnimationFrame(st) })(t0)
}
$('zf').onclick = () => voar(trabalho(), 700)
let arrasto = null
vp.addEventListener('pointerdown', e => { if (e.target.closest('.co,a,button')) return; arrasto = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; vp.classList.add('pan'); vp.setPointerCapture(e.pointerId) })
vp.addEventListener('pointermove', e => { if (!arrasto) return; cancelAnimationFrame(anim); cam.x = arrasto.cx + (e.clientX - arrasto.x); cam.y = arrasto.cy + (e.clientY - arrasto.y); aplicar() })
vp.addEventListener('pointerup', () => { arrasto = null; vp.classList.remove('pan') })
vp.addEventListener('wheel', e => {
  e.preventDefault(); cancelAnimationFrame(anim)
  if (e.ctrlKey || e.metaKey) { const f = Math.exp(-e.deltaY * .01), s = Math.max(.25, Math.min(2.5, cam.s * f)), k = s / cam.s; cam.x = e.clientX - (e.clientX - cam.x) * k; cam.y = e.clientY - (e.clientY - cam.y) * k; cam.s = s }
  else { cam.x -= e.deltaX; cam.y -= e.deltaY }
  aplicar()
}, { passive: false })

/* cursor */
let ct
function lizEm(x, y) { const l = $('liz'); if (l) { l.style.left = x + 'px'; l.style.top = y + 'px' } }
function dizer(t) { const l = $('liz'); if (!l) return liz(esc(t)); $('chat').textContent = t; l.classList.add('talk'); clearTimeout(ct); ct = setTimeout(() => l.classList.remove('talk'), 5000) }

/* ======================= capivara ======================= */
async function urls(paths) {
  const falta = paths.filter(p => p && !cache[p])
  if (falta.length) { const { data } = await sb.storage.from('capivara').createSignedUrls(falta, 3600); (data || []).forEach(x => { if (x.signedUrl) cache[x.path] = x.signedUrl }) }
  return p => cache[p] || null
}
const BL = [['gmn', 'gmn', 'Google Meu Negócio'], ['site', 'site', 'Site'], ['anuncios', 'ads', 'Anúncios'], ['instagram', 'ig', 'Instagram'], ['contato', 'ct', 'Contato'], ['empresa', 'emp', 'Empresa']]
// botão voltar do celular fecha o que estiver por cima e devolve pro mesmo ponto
function empilha(camada) { if (history.state?.camada !== camada) history.pushState({ camada }, '') }
addEventListener('popstate', () => {
  const c = history.state?.camada
  $('hist').classList.remove('on')
  if (c === 'lista') abrirLista(false)
  else if (c === 'capt') abrirCaptacao(false)
  else if (c === 'fila') abrirFila(false)
  else if (c === 'perfil') abrirPerfil(false)
  if (c !== 'ind' && !$('indO').hidden) fecharIndicar()
  else if (!c) { $('capO').classList.remove('on'); $('cap').classList.remove('on'); if (!$('lv').hidden) abrirListaHome() }
})
async function abrirCapivara(d, empilhar = true) {
  const c = d.capivara, id = c.identidade || {}
  const u = await urls([id.print_celular, id.print_computador, ...(id.fotos || []), id.post_topo])
  const o = Math.round(314 - 314 * (c.nota || 0) / 100), site = c.blocos?.site, url = site?.link || ''
  const palco = id.print_computador || id.print_celular
    ? `<div class="palco"><div class="tit">${IC.site}<b>Print do site</b> · computador e celular</div>
      ${id.print_computador && u(id.print_computador) ? `<div class="shot"><div class="sb"><i></i><i></i><i></i><span>${esc(url.replace(/^https?:\/\//, ''))}</span></div><img src="${u(id.print_computador)}" alt="" onerror="this.closest('.shot').remove()"></div>` : ''}
      ${id.print_celular && u(id.print_celular) ? `<div class="cel"><img src="${u(id.print_celular)}" alt="" onerror="this.closest('.cel').remove()"></div>` : ''}</div>`
    : `<div class="palco"><div class="semprint"><div><b>${site?.status_txt === 'Só rede social' ? 'Sem site próprio' : 'Sem print do site'}</b>${site?.status_txt === 'Só rede social' ? 'No lugar do site ela usa ' + esc(site.linhas?.[1]?.valor || 'rede social') + '.' : 'O site não abriu, bloqueou a leitura ou não existe.'}</div></div></div>`
  const vel = id.velocidade, velCor = vel >= 90 ? '#14A35A' : vel >= 50 ? '#B7790A' : '#D93D42'
  const bloco = ([k, ic, tit]) => { const b = c.blocos?.[k]; if (!b) return ''; return `<article class="bl"><div class="bl-h"><div class="ico ${ic}">${IC[ic]}</div><div><b>${tit}</b><small>${esc(b.sub || '')}</small></div><span class="st ${b.status}">${esc(b.status_txt)}</span></div>
    <div class="rows">${b.linhas.map(r => `<div class="r"><span class="d ${r.t}">${r.t === 'ok' ? '✓' : r.t === 'bad' ? '!' : '–'}</span><span class="l">${esc(r.label)}</span><span class="v">${esc(r.valor)}</span></div>`).join('')}</div>
    <div class="bl-f"><span>Fonte: ${esc(b.fonte)}</span>${b.link ? `<a class="lnk" href="${esc(b.link)}" target="_blank" rel="noopener">${esc(b.link_txt || 'Abrir')}${IC.ext}</a>` : ''}</div></article>` }
  const fotos = (id.fotos || []).map(f => u(f)).filter(Boolean)
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Raio-X · ${esc(c.nome)}</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
  <header class="hd"><div><div class="k">${esc(c.categoria || '')}${c.categoria ? ' · ' : ''}${esc((c.cidade || '').split(',')[0])}</div><h1>${esc(c.nome)}</h1>
    <div class="lo">${IC.pin}${esc([c.bairro, c.cidade].filter(Boolean).join(' · '))}</div>
    <div class="sel">${(c.selos || []).map(s => `<span class="sp ${s.t}">${s.t === 'ok' ? IC.ok : s.t === 'at' ? IC.at : IC.bad}${esc(s.txt)}</span>`).join('')}</div></div>
    <div class="dor" style="--o:${o}"><svg viewBox="0 0 112 112"><defs><linearGradient id="gdor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7BF0B0"/><stop offset="1" stop-color="#14A35A"/></linearGradient></defs><circle class="b" cx="56" cy="56" r="50"/><circle class="f" cx="56" cy="56" r="50"/></svg><div class="n"><div><b>${c.nota ?? d.nota_dor}</b><span>potencial</span></div></div></div></header>
  <section class="liz"><img src="img/liz_rosto_3d.png" alt="Liz"><div><div class="t">${esc(c.resumo)}</div>${c.prova ? `<div class="prova"><div class="m">Avaliação no Google</div>${esc(c.prova)}</div>` : c.motivo ? `<div class="prova"><div class="m">Por que entrou</div>${esc(c.motivo)}</div>` : ''}</div></section>
  <div class="sec"><h2>Identidade</h2></div>
  <section class="idt">${palco}<div class="lado">
    <div class="mini"><h4>Marca <span>do site</span></h4><div class="marca"><div class="logo-t">${id.logo ? `<img src="${esc(id.logo)}" alt="" onerror="this.remove()">` : ''}</div><div class="fn"><b>${esc((c.nome || '').split(' - ')[0])}</b><br>${id.fonte ? 'Fonte: ' + esc(id.fonte) : 'Fonte não medida'}</div></div>
      ${(id.paleta || []).length ? `<div class="pal">${id.paleta.map(h => `<div class="cor"><i style="background:${esc(h)}"></i>${esc(h)}</div>`).join('')}</div>` : '<div class="fn" style="margin-top:12px;color:var(--mu2)">Sem site pra medir cores.</div>'}</div>
    <div class="mini"><h4>Velocidade no celular <span>PageSpeed</span></h4>${vel != null ? `<div class="vel"><div class="gauge"><svg viewBox="0 0 72 72"><circle class="b" cx="36" cy="36" r="32"/><circle class="f" cx="36" cy="36" r="32" style="stroke:${velCor};stroke-dashoffset:${Math.round(201 - 201 * vel / 100)}"/></svg><b style="color:${velCor}">${vel}</b></div><div class="tx"><b>${vel >= 90 ? 'Rápido' : vel >= 50 ? 'Médio' : 'Lento'}</b>O conteúdo principal aparece em ${esc(id.carregamento || '?')} no celular.</div></div>` : '<div class="fn" style="color:var(--mu2)">Sem site pra medir.</div>'}</div>
    <div class="olho"><div class="ai">${IC.eye}</div><div><small>O que a IA viu nas imagens</small>${esc(id.leitura_visual)}</div></div></div></section>
  ${(() => { const post = id.post_topo && u(id.post_topo), itens = [...fotos.map((f, i) => `<div class="foto"><img src="${f}" alt="" onerror="this.closest('.foto').remove()"><span>Foto ${i + 1} · Google</span></div>`), ...(post ? [`<a class="foto post" href="${esc(id.post_topo_link || '#')}" target="_blank" rel="noopener"><img src="${post}" alt="" onerror="this.closest('.foto').remove()"><span>${IC.ig}Top do Insta · ${id.post_topo_curtidas ?? 0} curtidas</span></a>`] : [])]
    return itens.length ? `<div class="fotos" style="grid-template-columns:repeat(${itens.length},1fr)">${itens.join('')}</div>` : '' })()}
  <div class="sec"><h2>O Raio-X</h2></div><section class="grid">${BL.map(bloco).join('')}</section>
  ${(c.avaliacoes || []).length ? `<div class="sec"><h2>O que dizem no Google</h2></div><section class="revs">${c.avaliacoes.map(a => `<div class="rv${a.etiqueta ? ' bad' : ''}"><div class="m"><span class="stars">${[1, 2, 3, 4, 5].map(i => star(i <= a.estrelas)).join('')}</span>${esc((a.data || '').slice(0, 10).split('-').reverse().join('/'))}</div>${esc((a.texto || '').slice(0, 260))}${(a.texto || '').length > 260 ? '…' : ''}${a.etiqueta ? `<span class="tg">${esc(a.etiqueta)}</span>` : ''}</div>`).join('')}</section>` : ''}
  <div class="sec"><h2>Primeira mensagem</h2></div>
  <section class="ab"><div class="msg"><div class="h">Saudação simples</div><div id="msgBox"><p>${esc(saudacaoTxt())}</p><small class="msg-n">Quando a pessoa responder, a Liz continua a conversa. Você muda essa frase em Perfil, Robô de atendimento.</small></div></div><div class="decd" id="decd"></div></section>
  <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  desenharDecisao(d)
  if (empilhar) empilha('cap')
  $('capX').onclick = fecharCapivara
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
}
function desenharDecisao(d) {
  const box = $('decd')
  if (d.decisao === 'aprovada') { box.innerHTML = `<div class="q">Decidido.</div><div class="feito">${IC.ok}Está no seu pipeline.</div><button class="btn line" id="dVer">Ver o pipeline</button><button class="btn ghost" id="dDes">Tirar do pipeline</button>`; $('dDes').onclick = () => decidir(d, 'pendente'); $('dVer').onclick = () => abrirCaptacao(); return }
  if (d.decisao === 'pulada') { box.innerHTML = `<div class="q">Decidido.</div><div class="feito" style="background:#F1F2EF;color:var(--mu)">Pulada. Não volta a aparecer.</div><button class="btn ghost" id="dDes">Desfazer</button>`; $('dDes').onclick = () => decidir(d, 'pendente'); return }
  if (!temCap(d)) {
    const fila = d.status === 'na_fila' || d.status === 'lendo'
    box.innerHTML = `<div class="q">${fila ? 'Liz montando o Raio-X…' : 'Quer o Raio-X completo?'}</div>${fila ? '<span class="lendo-tag"><i></i>Lendo site, Google e fotos. Leva uns 40 segundos.</span>' : `<button class="btn go" id="dCap">Fazer Raio-X${custoRaiox(1)}</button>`}<button class="btn ok" id="dOk">${IC.ok}Adicionar ao pipeline</button><button class="btn ghost" id="dPu">Pular empresa</button><div class="err" id="dErr"></div>`
    $('dOk').onclick = () => decidir(d, 'aprovada'); $('dPu').onclick = () => decidir(d, 'pulada')
    if ($('dCap')) $('dCap').onclick = async () => { $('dCap').disabled = true; $('dCap').textContent = 'Mandando pra Liz…'; await fazerUma(d); desenharDecisao(d); esperarCapivara(d.id) }
    return
  }
  box.innerHTML = `<div class="q">Nada sai sem o seu ok.</div><button class="btn ok" id="dOk">${IC.ok}Adicionar ao pipeline</button><button class="btn ghost" id="dPu">Pular empresa</button><div class="err" id="dErr"></div>`
  $('dOk').onclick = () => decidir(d, 'aprovada')
  $('dPu').onclick = () => decidir(d, 'pulada')
}
async function decidir(d, decisao) {
  const btn = document.activeElement; if (btn?.tagName === 'BUTTON') btn.disabled = true
  const { error } = await sb.from('diagnosticos').update({ decisao, decidida_em: decisao === 'pendente' ? null : new Date().toISOString() }).eq('id', d.id)
  if (error) { const e = $('dErr'); if (e) e.textContent = 'Não salvou. Tenta de novo.'; if (btn) btn.disabled = false; return }
  d.decisao = decisao; const igual = diags.find(x => x.id === d.id); if (igual) igual.decisao = decisao
  desenharDecisao(d); desenharCards(); atualizarFunil()
  if (decisao === 'aprovada') liz(`<b>${esc(d.capivara?.nome || d.empresa?.nome)}</b> entrou no pipeline.${d.capivara?.canal ? ` Abordagem por ${esc(d.capivara.canal)}.` : ''}`)
  contarCaptacao()
  // vendo uma por uma: decidiu, já passa pra próxima
  if (decisao !== 'pendente' && $('cap').dataset.seq && seq[pos]?.id === d.id && seq[pos + 1]) setTimeout(() => { if (seq[pos]?.id === d.id) irSeq(1) }, 650)
}
function fecharCapivara() {
  if (history.state?.camada) return history.back() // o popstate fecha (ou volta pra lista)
  $('capO').classList.remove('on'); $('cap').classList.remove('on')
}
$('capO').onclick = fecharCapivara
addEventListener('keydown', e => { if (e.key === 'Escape') { fecharCapivara(); $('hist').classList.remove('on') } })

/* ======================= enriquecer: dentro do card de cada empresa ======================= */
const ENR = { aberto: new Set(), msg: {} }
const enrBotao = (e) => e?.id ? `<button class="btn line sm" data-enr="${e.id}" aria-expanded="${ENR.aberto.has(e.id)}">Enriquecer</button>` : ''
function enrPainel(e) {
  if (!e?.id || !ENR.aberto.has(e.id)) return ''
  const m = ENR.msg[e.id]
  const campo = (k, t, ph, modo = 'text') => `<label><span>${t}</span><input data-c="${k}" type="${modo}" placeholder="${ph}" value="${esc(e[k] || '')}" autocomplete="off"></label>`
  return `<div class="enr" data-enr-p="${e.id}"><button class="btn go sm enr-b" data-enr-buscar>Buscar no site da empresa</button>
    ${m ? `<div class="enr-m ${m.t}">${m.h}</div>` : ''}
    ${campo('whatsapp', 'WhatsApp', '(11) 90000-0000', 'tel')}${campo('instagram', 'Instagram', '@perfil')}${campo('email', 'E-mail', 'contato@empresa.com', 'email')}${campo('site', 'Site', 'https://')}
    <div class="enr-ac"><button class="btn ok sm" data-enr-salvar>Salvar</button><button class="btn ghost sm" data-enr-fechar>Fechar</button></div></div>`
}
// liga botões do card. depois() redesenha a tela onde o card está.
function ligarEnr(root, e, depois) {
  if (!e?.id) return
  root.querySelector(`[data-enr="${e.id}"]`)?.addEventListener('click', ev => { ev.stopPropagation(); if (ENR.aberto.has(e.id)) ENR.aberto.delete(e.id); else ENR.aberto.add(e.id); depois() })
  const p = root.querySelector(`[data-enr-p="${e.id}"]`); if (!p) return
  const val = k => p.querySelector(`[data-c="${k}"]`).value.trim()
  p.querySelector('[data-enr-fechar]').onclick = () => { ENR.aberto.delete(e.id); depois() }
  p.querySelector('[data-enr-salvar]').onclick = async ev => {
    const wa = val('whatsapp').replace(/\D/g, ''), ig = val('instagram').replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?].*$/, '').toLowerCase(), em = val('email').toLowerCase(), si = val('site')
    if (wa && wa.length < 10) { ENR.msg[e.id] = { t: 'ruim', h: 'Confere o WhatsApp com DDD.' }; return depois() }
    const dados = { whatsapp: wa || null, instagram: ig || null, email: em || null, site: si ? (/^https?:\/\//i.test(si) ? si : 'https://' + si) : null }
    ev.currentTarget.disabled = true
    const { error } = await sb.from('empresas').update(dados).eq('id', e.id)
    if (error) { ENR.msg[e.id] = { t: 'ruim', h: 'Não salvou. Tenta de novo.' }; return depois() }
    Object.assign(e, dados); ENR.msg[e.id] = { t: 'ok', h: 'Salvo.' }; depois()
  }
  p.querySelector('[data-enr-buscar]').onclick = async ev => {
    const b = ev.currentTarget; b.disabled = true; b.textContent = 'Procurando…'
    const { data, error } = await sb.functions.invoke('enriquecer', { body: { empresa_id: e.id } })
    if (error || data?.erro) { ENR.msg[e.id] = { t: 'ruim', h: esc(data?.erro || 'Não consegui buscar agora. Tenta de novo.') }; return depois() }
    Object.assign(e, data.novo)
    const NOME = { whatsapp: 'WhatsApp', instagram: 'Instagram', email: 'E-mail', site: 'Site' }, ach = Object.entries(data.novo).map(([k, v]) => `<b>${NOME[k]}</b> ${esc(k === 'whatsapp' ? tfmt(v) : v)}`)
    const h = ach.length ? `Achei ${ach.join(', ')}.` : data.sem_site ? 'Essa empresa não tem site pra eu ler. Preencha o que você achar e salve.' : data.nao_abriu ? 'Não consegui abrir o site dela. Preencha o que você achar e salve.' : 'Não achei nada novo no site. Preencha o que você achar e salve.'
    ENR.msg[e.id] = { t: ach.length ? 'ok' : 'ruim', h }; depois()
  }
}

/* ======================= lista na home: cards e filtros ======================= */
const LV = { f: new Set(), q: '', ord: 'potencial', todos: [], lendo: false, buscaId: null, armado: false }
const ehCelular = e => /^\(?\d{2}\)?\s?9/.test(e.telefone || '')
const LV_FILTROS = [['wa', 'WhatsApp', e => !!e.whatsapp], ['cel', 'Celular', ehCelular], ['insta', 'Instagram', e => !!e.instagram], ['email', 'E-mail', e => !!e.email], ['site', 'Com site', e => !!e.site], ['semsite', 'Sem site', e => !e.site], ['nota', 'Nota 4 ou mais', e => +e.nota >= 4]]
const LV_ORD = { potencial: (a, b) => (b.nota_dor ?? -1) - (a.nota_dor ?? -1), nota: (a, b) => (+b.empresa?.nota || 0) - (+a.empresa?.nota || 0), avaliacoes: (a, b) => (+b.empresa?.total_avaliacoes || 0) - (+a.empresa?.total_avaliacoes || 0), nome: (a, b) => String(a.empresa?.nome || '').localeCompare(String(b.empresa?.nome || ''), 'pt-BR') }
const lvPassa = (d, filtros = LV.f) => { const e = d.empresa || {}; if (![...filtros].every(k => LV_FILTROS.find(x => x[0] === k)[2](e))) return false; const q = semAcento(LV.q.trim()).replace(/^@/, ''); if (!q) return true; const dg = q.replace(/\D/g, ''); return semAcento([e.nome, e.bairro, e.instagram, e.email, e.site].join(' ')).includes(q) || (/^[\d\s()+-]+$/.test(q) && dg.length >= 3 && String((e.telefone || '') + ' ' + (e.whatsapp || '')).replace(/\D/g, '').includes(dg)) }
async function abrirListaHome() {
  if (!busca?.id) return
  if (LV.buscaId !== busca.id) { LV.f = new Set(); LV.q = ''; LV.ord = 'potencial'; LV.buscaId = busca.id }
  const { data, error } = await sb.from('diagnosticos').select('id, status, angulo, nota_dor, motivo, decisao, capivara, empresa:empresas(id, nome, bairro, cidade, telefone, site, google_maps_url, nota, total_avaliacoes, instagram, email, whatsapp, contatos_lidos_em)').eq('busca_id', busca.id).order('nota_dor', { ascending: false })
  if (error) return liz('Não consegui carregar a lista. Tenta de novo.')
  LV.todos = data || []; LV.armado = false
  $('ask').hidden = true; document.body.classList.remove('fora')
  const faltam = LV.todos.filter(d => !d.empresa?.contatos_lidos_em).length
  const titulo = busca.cidade === 'Lista' ? busca.nicho : `${busca.nicho} em ${(busca.cidade || '').split(',')[0]}`
  $('lv').innerHTML = `<div class="lv-in">
    <div class="lv-top"><div><h1>${esc(titulo)}</h1><p>${LV.todos.length} empresa${LV.todos.length === 1 ? '' : 's'} nesta lista</p></div><div class="lv-ac"><button class="btn line sm" id="lvCsv">Baixar planilha</button><button class="btn line sm" id="lvMais">Encontrar mais</button></div></div>
    ${LV.lendo ? '<div class="lv-en"><span><b>Lendo os sites</b> pra achar Instagram, e-mail e WhatsApp. A lista atualiza sozinha.</span></div>' : ''}
    <div class="lv-fil"><div class="lv-lin"><label class="pf-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="lvQ" type="search" placeholder="Buscar nome, bairro, telefone ou @" aria-label="Buscar na lista" autocomplete="off" value="${esc(LV.q)}"></label>
      <label class="lv-ord">Ordenar<select id="lvOrd" aria-label="Ordenar">${[['potencial', 'Potencial'], ['nota', 'Nota no Google'], ['avaliacoes', 'Mais avaliações'], ['nome', 'Nome']].map(([k, t]) => `<option value="${k}"${LV.ord === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label></div>
      <div class="lv-chips" id="lvChips"></div></div>
    <div class="lv-res"><span id="lvN"></span><button class="btn ok sm" id="lvAddT" hidden></button></div>
    <div class="lv-g" id="lvG"></div>
    <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  $('lv').hidden = false
  lvPintar()
  $('lvCsv').onclick = () => baixarCsv(LV.todos)
  $('lvMais').onclick = () => abrirLista()
  let tq; $('lvQ').oninput = e => { clearTimeout(tq); tq = setTimeout(() => { LV.q = e.target.value; lvPintar() }, 150) }
  $('lvOrd').onchange = e => { LV.ord = e.target.value; lvPintar() }
}
function lvPintar() {
  const lst = LV.todos.filter(d => lvPassa(d)).sort(LV_ORD[LV.ord])
  $('lvChips').innerHTML = LV_FILTROS.map(([k, t]) => { const n = LV.todos.filter(d => lvPassa(d, new Set([...LV.f, k]))).length; return `<button data-f="${k}" aria-pressed="${LV.f.has(k)}">${t}<span>${n}</span></button>` }).join('')
  $('lvN').textContent = lst.length === LV.todos.length ? 'Mostrando todas' : `Mostrando ${lst.length} de ${LV.todos.length}`
  const novas = lst.filter(d => d.decisao !== 'aprovada')
  const bt = $('lvAddT'); bt.hidden = !novas.length; bt.textContent = `Adicionar ${novas.length} ao pipeline`; LV.armado = false
  $('lvG').innerHTML = lst.map(d => { const e = d.empresa || {}, tem = Object.keys(d.capivara || {}).length, fila = d.status === 'na_fila' || d.status === 'lendo', w = zap(e.whatsapp) || (ehCelular(e) ? zap(e.telefone) : null), tel = String(e.telefone || '').replace(/[^\d+]/g, '')
    return `<article class="lc" data-id="${d.id}"><div class="lc-h"><div><h3>${esc(e.nome || 'Empresa')}</h3><small>${esc([e.bairro, (e.cidade || '').split(',')[0]].filter(Boolean).join(' · '))}</small></div>${d.nota_dor != null ? `<span class="lc-p" title="Potencial"><b>${d.nota_dor}</b>potencial</span>` : ''}</div>
      ${e.nota ? `<div class="lc-n">★ ${String(e.nota).replace('.', ',')} <span>(${e.total_avaliacoes || 0} avaliações)</span></div>` : ''}
      <div class="lc-ct">${e.whatsapp ? `<button class="lc-wa" data-zap="${w}">WhatsApp</button>` : ehCelular(e) ? `<button class="lc-cel" data-zap="${w}">Celular</button>` : ''}${tel ? `<a href="tel:${esc(tel)}">${esc(e.telefone)}</a>` : ''}${e.instagram ? `<a class="lc-ig" href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener">@${esc(e.instagram)}</a>` : ''}${e.email ? `<a href="mailto:${esc(e.email)}">E-mail</a>` : ''}${e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener">Site</a>` : '<span class="lc-sem">Sem site</span>'}</div>
      <div class="lc-ac">${d.decisao === 'aprovada' ? '<span class="lc-ok">No pipeline</span>' : '<button class="btn ok sm" data-add>Adicionar ao pipeline</button>'}${tem ? '<button class="btn line sm" data-abre>Abrir Raio-X</button>' : fila ? '<span class="lendo-tag"><i></i>Liz montando…</span>' : '<button class="btn line sm" data-faz>Fazer Raio-X</button>'}${enrBotao(e)}</div>${enrPainel(e)}</article>` }).join('') || `<div class="lv-vz">Nenhuma empresa com esses filtros.<br><button class="btn line sm" id="lvLimpa">Limpar filtros</button></div>`
  if ($('lvLimpa')) $('lvLimpa').onclick = () => { LV.f = new Set(); LV.q = ''; $('lvQ').value = ''; lvPintar() }
  $('lvChips').querySelectorAll('button').forEach(b => b.onclick = () => { const k = b.dataset.f; if (LV.f.has(k)) LV.f.delete(k); else { LV.f.add(k); if (k === 'site') LV.f.delete('semsite'); if (k === 'semsite') LV.f.delete('site') } lvPintar() })
  bt.onclick = async () => {
    if (!LV.armado) { LV.armado = true; bt.textContent = `Toque de novo para adicionar ${novas.length}`; return }
    bt.disabled = true; bt.textContent = 'Adicionando…'
    const ids = novas.map(d => d.id); let falhou = false
    for (let i = 0; i < ids.length; i += 200) { const { error } = await sb.from('diagnosticos').update({ decisao: 'aprovada', decidida_em: new Date().toISOString() }).in('id', ids.slice(i, i + 200)); if (error) { falhou = true; break } }
    bt.disabled = false; if (falhou) liz('Parte não entrou no pipeline. Tenta de novo.'); else liz(`${ids.length} empresa${ids.length === 1 ? '' : 's'} no pipeline.`)
    contarCaptacao(); abrirListaHome()
  }
  $('lvG').querySelectorAll('.lc').forEach(c => {
    const d = LV.todos.find(x => x.id === c.dataset.id)
    ligarEnr(c, d.empresa, lvPintar)
    c.querySelector('[data-zap]')?.addEventListener('click', ev => abrirConversas(true, ev.currentTarget.dataset.zap))
    c.querySelector('[data-abre]')?.addEventListener('click', () => abrirSeq(d.id))
    c.querySelector('[data-add]')?.addEventListener('click', async ev => { const b = ev.currentTarget; b.disabled = true; const { error } = await sb.from('diagnosticos').update({ decisao: 'aprovada', decidida_em: new Date().toISOString() }).eq('id', d.id); if (error) { b.disabled = false; return liz('Não entrou no pipeline. Tenta de novo.') } d.decisao = 'aprovada'; contarCaptacao(); lvPintar() })
    c.querySelector('[data-faz]')?.addEventListener('click', async ev => { const b = ev.currentTarget; b.disabled = true; b.textContent = 'Mandando…'; d.status = 'na_fila'; await sb.from('diagnosticos').update({ status: 'na_fila' }).eq('id', d.id); await sb.from('buscas').update({ status: 'diagnosticando', terminada_em: null }).eq('id', busca.id); sb.functions.invoke('diagnosticar', { body: { diagnostico_id: d.id } }); busca.status = 'diagnosticando'; vivo(true, 'Liz trabalhando'); acompanhar(); lvPintar() })
  })
}

/* ======================= lista simples ======================= */
let filtroLista = 'todas', rolagemLista = 0
async function abrirLista(empilhar = true) {
  if (!busca?.id) return liz('Faz uma busca primeiro que eu monto a lista.')
  const { data } = await sb.from('diagnosticos').select('id, status, angulo, nota_dor, motivo, decisao, capivara, empresa:empresas(nome, bairro, cidade, telefone, site, google_maps_url, nota, total_avaliacoes, instagram, email, whatsapp, contatos_lidos_em)').eq('busca_id', busca.id).order('nota_dor', { ascending: false })
  const todos = data || []
  const grupos = { todas: todos, capivara: todos.filter(d => Object.keys(d.capivara || {}).length), sem: todos.filter(d => !Object.keys(d.capivara || {}).length && d.status !== 'na_fila' && d.status !== 'lendo'), fora: todos.filter(d => d.angulo === 'nenhum'), insta: todos.filter(d => d.empresa?.instagram) }
  const faltaLer = todos.some(d => !d.empresa?.contatos_lidos_em)
  const lst = grupos[filtroLista] || todos
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Lista · ${esc(busca.cidade === 'Lista' ? busca.nicho : busca.nicho + ' · ' + busca.cidade)}</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
    <div class="lst-top"><h2>${todos.length} empresas</h2>${faltaLer ? '<button class="btn go sm" id="lLer">Buscar Instagrams</button>' : ''}${grupos.insta.length ? `<button class="btn line sm" id="lCopia">Copiar os ${grupos.insta.length} @</button>` : ''}<button class="btn line sm" id="lCsv">Baixar planilha</button>
      <div class="filt">${[['todas', 'Todas'], ['insta', 'Com Instagram'], ['capivara', 'Com Raio-X'], ['sem', 'Sem Raio-X'], ['fora', 'Fora do perfil']].map(([k, t]) => `<button data-f="${k}" class="${filtroLista === k ? 'on' : ''}">${t}<span>${grupos[k].length}</span></button>`).join('')}</div></div>
    ${lst.map(d => { const e = d.empresa || {}, tem = Object.keys(d.capivara || {}).length, fila = d.status === 'na_fila' || d.status === 'lendo'
      return `<div class="li${d.angulo === 'nenhum' ? ' vazio' : ''}"><div class="nt">${d.nota_dor ?? '–'}<small>potencial</small></div>
      <div class="nm"><b>${esc(e.nome)}</b><small>${esc([e.bairro, (e.cidade || '').split(',')[0]].filter(Boolean).join(' · '))}${e.nota ? ` · ${String(e.nota).replace('.', ',')} ★ (${e.total_avaliacoes})` : ''}</small></div>
      <div class="ct">${e.instagram ? `<a href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener" style="color:#C93676;font-weight:500">@${esc(e.instagram)}</a>` : e.contatos_lidos_em ? '<span>sem Instagram no site</span><br>' : ''}${e.telefone ? esc(e.telefone) : 'sem telefone'}${e.email ? `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>` : ''}${e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener">${esc(e.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : '<span>sem site</span>'}</div>
      <div class="mo"><span class="ang a-${d.angulo || 'nenhum'}">${ANG[d.angulo] || ''}</span><div>${esc(d.motivo || '')}</div></div>
      <div class="ac">${tem ? `<button class="btn go sm" data-abre="${d.id}">Abrir Raio-X</button>` : fila ? '<span class="lendo-tag"><i></i>Liz montando…</span>' : `<button class="btn line sm" data-faz="${d.id}">Fazer Raio-X</button>`}</div></div>` }).join('') || '<div class="vazio" style="color:var(--mu)">Nada nesse filtro.</div>'}</div>`
  $('capX').onclick = fecharCapivara
  $('cap').querySelectorAll('.filt button').forEach(b => b.onclick = () => { filtroLista = b.dataset.f; rolagemLista = 0; abrirLista(false) })
  $('cap').querySelectorAll('[data-abre]').forEach(b => b.onclick = () => abrirSeq(b.dataset.abre))
  $('cap').scrollTop = rolagemLista; $('cap').onscroll = () => { rolagemLista = $('cap').scrollTop }
  $('cap').querySelectorAll('[data-faz]').forEach(b => b.onclick = async () => {
    b.disabled = true; b.textContent = 'Mandando…'
    await sb.from('diagnosticos').update({ status: 'na_fila' }).eq('id', b.dataset.faz)
    await sb.from('buscas').update({ status: 'diagnosticando', terminada_em: null }).eq('id', busca.id)
    sb.functions.invoke('diagnosticar', { body: { diagnostico_id: b.dataset.faz } })
    busca.status = 'diagnosticando'; vivo(true, 'Liz trabalhando'); acompanhar()
    b.outerHTML = '<span class="lendo-tag"><i></i>Liz montando…</span>'
  })
  if (empilhar) empilha('lista')
  $('lCsv').onclick = () => baixarCsv(todos)
  if ($('lCopia')) $('lCopia').onclick = async () => { const t = grupos.insta.map(d => '@' + d.empresa.instagram).join('\n'); try { await navigator.clipboard.writeText(t); $('lCopia').textContent = `✓ ${grupos.insta.length} @ copiados` } catch { liz('Não consegui copiar. Usa o Baixar planilha.') } }
  if ($('lLer')) $('lLer').onclick = async () => { $('lLer').disabled = true; $('lLer').textContent = 'Lendo os sites…'; try { const c = await chamar('contatos', { busca_id: busca.id }); liz(`Li ${c.lidas} sites: ${c.instagram} com Instagram, ${c.email} com e-mail.`); filtroLista = 'insta'; abrirLista() } catch (er) { liz('Não consegui ler agora: ' + esc(er.message)); $('lLer').disabled = false; $('lLer').textContent = 'Buscar Instagrams' } }
  $('capO').classList.add('on'); $('cap').classList.add('on')
}
function baixarCsv(todos) {
  const cel = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const linhas = [['Empresa', 'Bairro', 'Cidade', 'Telefone', 'Instagram', 'E-mail', 'WhatsApp', 'Site', 'Nota Google', 'Avaliações', 'Assunto', 'Potencial', 'Motivo', 'Tem Raio-X', 'Decisão'].map(cel).join(';')]
  todos.forEach(d => { const e = d.empresa || {}; linhas.push([e.nome, e.bairro, e.cidade, e.telefone, e.instagram ? '@' + e.instagram : '', e.email, e.whatsapp, e.site, e.nota, e.total_avaliacoes, ANG[d.angulo] || '', d.nota_dor, d.motivo, Object.keys(d.capivara || {}).length ? 'sim' : 'não', d.decisao].map(cel).join(';')) })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' }))
  a.download = `prospeccao_${(busca.nicho + '_' + busca.cidade).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(a.href)
}
$('bLista').onclick = () => { if (!busca?.id) return liz('Faz uma busca primeiro que eu monto a lista.'); fecharCapivara(); abrirListaHome() }
$('bConv').onclick = () => abrirConversas()
$('fabConv').onclick = () => abrirConversas()
$('fabAg').onclick = () => { fecharCapivara(); setTimeout(() => abrirCaptacao(), history.state?.camada ? 60 : 0) }
// contador de quem respondeu desde a última vez que você abriu as conversas
const convVisto = () => { try { return localStorage.getItem('kp_conv_visto') || '' } catch { return '' } }
async function badgeConv() {
  try {
    const { data } = await sb.from('conversa').select('telefone, criado_em').eq('direcao', 'in').order('criado_em', { ascending: false }).limit(300)
    const visto = convVisto(), novos = new Set()
    for (const m of (data || [])) { if (!visto || m.criado_em > visto) novos.add(m.telefone) }
    const el = $('nConv'); if (!el) return
    el.hidden = !novos.size; el.textContent = novos.size > 9 ? '9+' : (novos.size || '')
  } catch (_) {}
}

/* ======================= pipeline (minha captação) ======================= */
const ETAPAS = [['a_contatar', 'A contatar'], ['contatado', 'Contatado'], ['respondeu', 'Respondeu'], ['reuniao', 'Reunião'], ['cliente', 'Cliente'], ['perdido', 'Perdido']]
// temperatura do lead pela etapa: frio ainda não ouviu falar da gente, quente já respondeu
const TEMP = { a_contatar: ['frio', 'Frio'], contatado: ['morno', 'Morno'], respondeu: ['quente', 'Quente'], reuniao: ['quente', 'Quente'], cliente: ['ganho', 'Cliente'], perdido: ['perdido', 'Perdido'] }
const ESFRIA = 3 // dias contatado sem resposta
const dias = t => t ? Math.floor((Date.now() - new Date(t)) / 864e5) : 0
const haDias = n => n <= 0 ? 'hoje' : n === 1 ? 'ontem' : `há ${n} dias`
const zap = n => { const d = String(n || '').replace(/\D/g, ''); return d.length >= 10 ? (d.startsWith('55') ? d : '55' + d) : null }
// primeira mensagem: a mesma saudação simples do disparo. A conversa de verdade é com a Liz, quando a pessoa responde.
let saudacaoDono = ''
async function carregarSaudacao() { try { const { data } = await sb.from('canal_whatsapp').select('saudacao').maybeSingle(); saudacaoDono = String(data?.saudacao || '').trim() } catch (_) {} }
const saudacaoTxt = () => { const h = Number(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false })); const parte = h < 12 ? 'bom dia' : h < 18 ? 'boa tarde' : 'boa noite'; return (saudacaoDono || 'Olá, {saudacao}, tudo bem?').replace(/\{saudacao\}/gi, parte) }
// temperatura: a escolha manual vale; sem ela, conta a última vez que a pessoa falou
const TEMP_MAN = [['quente', 'Quente'], ['morno', 'Morno'], ['frio', 'Frio']]
function calcTemp(etapa, manual, ultimaIn, etapaEm) {
  if (etapa === 'cliente' || etapa === 'perdido') return TEMP[etapa]
  const m = TEMP_MAN.find(x => x[0] === manual); if (m) return m
  if (etapa === 'reuniao') return TEMP_MAN[0]
  const base = ultimaIn || (etapa === 'respondeu' ? etapaEm : null)
  if (!base) return TEMP_MAN[2]
  const n = dias(base)
  return n <= 3 ? TEMP_MAN[0] : n <= 14 ? TEMP_MAN[1] : TEMP_MAN[2]
}
async function contarCaptacao() {
  const { count } = await sb.from('diagnosticos').select('id', { count: 'exact', head: true }).eq('decisao', 'aprovada').eq('arquivado', false).not('etapa', 'in', '(cliente,perdido)')
  $('nCapt').hidden = !count; $('nCapt').textContent = count || ''
}
let colunaPipe = 0
// filtro do pipeline: sobrevive ao redesenho (mover etapa, voltar da conversa)
const pipeF = { q: '', resp: false, temp: '', seg: '', lim: {} }
const segDe = d => String(d.segmento || d.busca?.nicho || '').trim()
// posição do pipeline: mover etapa ou voltar da conversa não pode jogar pro início
let pipeX = 0, pipeY = 0
const POR_COLUNA = 50
const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// mesma pessoa, formatos diferentes: sem 55 e sem o 9 extra (DDD + 8 últimos). LID não vira chave.
const chaveTel = t => { let d = String(t || '').replace(/\D/g, ''); if (d.length >= 12 && d.startsWith('55')) d = d.slice(2); return d.length === 10 || d.length === 11 ? d.slice(0, 2) + d.slice(-8) : null }
const esperandoTxt = t => { const m = Math.max(0, Math.floor((Date.now() - new Date(t)) / 6e4)); if (m < 1) return 'Escreveu agora'; if (m < 60) return `Esperando há ${m} min`; if (m < 1440) return `Esperando há ${Math.floor(m / 60)}h`; const n = Math.floor(m / 1440); return `Esperando há ${n} dia${n === 1 ? '' : 's'}` }
// o banco devolve no máximo 1000 linhas por vez: busca em páginas pra ninguém ficar de fora
async function leadsDoPipe() {
  const out = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await sb.from('diagnosticos').select('id, nota_dor, angulo, decisao, capivara, temperatura, etapa, etapa_em, anotacao, decidida_em, telefone, segmento, busca:buscas(nicho, cidade), empresa:empresas(id, nome, bairro, cidade, telefone, site, instagram, email, whatsapp)').eq('decisao', 'aprovada').eq('arquivado', false).order('decidida_em', { ascending: false }).order('id').range(i, i + 999)
    if (error) { liz('Não consegui carregar todo o pipeline. Tenta de novo.'); break }
    out.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return out
}
async function abrirCaptacao(empilhar = true) {
  if (empilhar) { pipeF.q = ''; pipeF.resp = false; pipeF.temp = ''; pipeF.seg = ''; pipeF.lim = {}; pipeX = 0; pipeY = 0 }
  const [todos, resAg, resAt] = await Promise.all([leadsDoPipe(), sb.rpc('aguardando_resposta'), sb.rpc('atividade_leads')])
  const atvId = new Map(), atvTel = new Map()
  ;(resAt.data || []).forEach(a => { const mais = (m, k) => { if (k && (!m.get(k) || m.get(k) < a.ultima_in)) m.set(k, a.ultima_in) }; mais(atvId, a.diagnostico_id); [a.telefone, a.fone].forEach(t => mais(atvTel, chaveTel(t))) })
  const ultimaInDe = d => [atvId.get(d.id), ...[d.empresa?.whatsapp, d.empresa?.telefone, d.telefone].map(chaveTel).map(k => k && atvTel.get(k))].filter(Boolean).sort().pop() || null
  const tempDe = d => calcTemp(d.etapa, d.temperatura, ultimaInDe(d), d.etapa_em)
  // quem está esperando resposta, ligado ao cartão pelo envio ou pelo telefone
  const porId = new Map(), porTel = new Map()
  const aguardando = resAg.data || []
  aguardando.forEach(a => { if (a.diagnostico_id) porId.set(a.diagnostico_id, a); [a.telefone, a.fone].forEach(t => { const k = chaveTel(t); if (k) porTel.set(k, a) }) })
  const esperaDe = d => porId.get(d.id) || [d.empresa?.whatsapp, d.empresa?.telefone, d.telefone].map(chaveTel).filter(Boolean).map(k => porTel.get(k)).find(Boolean) || null
  const noPipe = new Set(); todos.forEach(d => { const a = esperaDe(d); if (a) noPipe.add(a.telefone) })
  const foraDoPipe = aguardando.filter(a => !noPipe.has(a.telefone)).length
  const de = k => todos.filter(d => d.etapa === k)
  const quando = d => d.etapa_em || d.decidida_em
  const nTemp = k => todos.filter(d => tempDe(d)[0] === k).length
  const kpi = [['frio', 'Frios', nTemp('frio'), 'sem resposta recente'], ['morno', 'Mornos', nTemp('morno'), 'quietos de 4 a 14 dias'], ['quente', 'Quentes', nTemp('quente'), 'falaram há até 3 dias'], ['ganho', 'Clientes', nTemp('ganho'), 'fechados']]
  const cartao = d => {
    const e = d.empresa || {}, c = d.capivara || {}, msg = saudacaoTxt(), tt = tempDe(d)
    const w = zap(e.whatsapp) || (/^\(?\d{2}\)?\s?9/.test(e.telefone || '') ? zap(e.telefone) : null) || zap(d.telefone)
    // número do card: empresa do Google ou, se o lead entrou por conversa, o telefone do próprio diagnóstico
    const tel = e.telefone || d.telefone || ''
    const telDig = String(tel).replace(/\D/g, ''), telHref = telDig.length >= 12 && telDig.startsWith('55') ? '+' + telDig : telDig
    // nunca fica sem nome: contato > empresa > número formatado > "Contato"
    const titulo = c.nome || e.nome || (tel ? tfmt(tel) : 'Contato')
    const sub = d.busca?.cidade === 'Lista' ? 'Lista · ' + (d.busca.nicho || '')
      : (e.nome || d.busca) ? (d.busca?.nicho || '') + ' · ' + (e.cidade || '').split(',')[0]
      : [d.segmento, tel ? tfmt(tel) : ''].filter(Boolean).join(' · ')
    const es = esperaDe(d)
    const n = dias(quando(d)), frio = !es && d.etapa === 'contatado' && n >= ESFRIA, prox = ETAPAS[ETAPAS.findIndex(x => x[0] === d.etapa) + 1]
    return `<div class="pc t-${tt[0]}" draggable="true" data-id="${d.id}">
      <div class="pc-h"><div><b>${esc(titulo)}</b><small>${esc(sub)}</small></div><span class="nt">${d.nota_dor ?? ''}</span></div>
      ${es ? `<button class="pc-esp" data-abrir="${esc(es.telefone)}"><span>${esperandoTxt(es.desde)}</span><b>Responder</b></button>` : ''}
      <div class="pc-m"><span class="tp t-${tt[0]}"${d.temperatura ? ' title="Marcado por você"' : ''}>${tt[1]}</span><span class="${frio ? 'esf' : ''}">${frio ? `sem resposta ${haDias(n)}` : (d.etapa === 'a_contatar' ? 'entrou ' : '') + haDias(n)}</span></div>
      ${d.anotacao ? `<div class="pc-n">${esc(d.anotacao)}</div>` : ''}
      <div class="pc-ac">${w ? `<a data-contato data-abrir="${w}" href="#" class="wpp">WhatsApp</a>` : ''}${telHref ? `<a data-contato href="tel:${esc(telHref)}">Ligar</a>` : ''}${e.instagram ? `<a data-contato class="ig" href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener">Insta</a>` : ''}${e.email && !w ? `<a data-contato href="mailto:${esc(e.email)}?body=${encodeURIComponent(msg)}">E-mail</a>` : ''}
        ${prox && d.etapa !== 'cliente' && d.etapa !== 'perdido' ? `<button class="vai" data-vai="${prox[0]}" title="Passar pra ${prox[1]}">${prox[1]}${IC.arr}</button>` : ''}</div>
      <div class="pc-mais">
        <div class="cp-et">${ETAPAS.map(([k, t]) => `<button data-et="${k}" class="${d.etapa === k ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${d.etapa === 'cliente' || d.etapa === 'perdido' ? '' : `<div class="cp-et cp-tmp"><span>Temperatura</span><button data-tmp="" class="${d.temperatura ? '' : 'on'}">Automática</button>${TEMP_MAN.map(([k, t]) => `<button data-tmp="${k}" class="${d.temperatura === k ? 'on' : ''}">${t}</button>`).join('')}</div>`}
        <div class="cp-ac"><button data-abre>${IC.eye}Raio-X</button><button data-copia>Copiar mensagem</button>${enrBotao(d.empresa)}</div>${enrPainel(d.empresa)}
        <textarea data-nota placeholder="Anotação (ex: falei com a Ana, retornar segunda)">${esc(d.anotacao || '')}</textarea></div></div>`
  }
  $('cap').dataset.seq = ''
  $('cap').classList.add('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Pipeline</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
    <div class="lst-top"><h2>${todos.length ? `${todos.length} empresa${todos.length === 1 ? '' : 's'} no pipeline` : 'Pipeline'}</h2>${de('a_contatar').length ? `<button class="btn go sm" id="cFila">Abordagens do dia · ${de('a_contatar').length}</button>` : ''}${de('a_contatar').length ? `<button class="btn line sm" id="cDisp">Disparo automático</button>` : ''}${todos.length ? '<button class="btn line sm" id="cCsv">Baixar planilha</button>' : ''}</div>
    ${todos.length ? `<div class="pk">${kpi.map(([t, k, v, s]) => `<div class="pk-i t-${t}"><i></i><div><b>${v}</b><span>${k}</span><small>${s}</small></div></div>`).join('')}</div>
    <div class="pf"><label class="pf-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="pQ" type="search" placeholder="Buscar nome, empresa, telefone ou @" aria-label="Buscar no pipeline" autocomplete="off" value="${esc(pipeF.q)}"></label>${(() => { const segs = {}; todos.forEach(d => { const s = segDe(d); if (s) segs[s] = (segs[s] || 0) + 1 }); return `<label class="lv-ord pf-seg"><span>Segmento</span><select id="pSeg" aria-label="Filtrar por segmento"><option value="">Todos (${todos.length})</option>${Object.entries(segs).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')).map(([s, n]) => `<option value="${esc(s)}"${pipeF.seg === s ? ' selected' : ''}>${esc(s)} (${n})</option>`).join('')}</select></label>` })()}<div class="pf-tmp" id="pTemp">${TEMP_MAN.map(([k, t]) => `<button class="t-${k}" data-f="${k}" aria-pressed="${pipeF.temp === k}"><i></i>${t}<span>${nTemp(k)}</span></button>`).join('')}</div><button class="pf-resp" id="pResp" aria-pressed="${pipeF.resp}" ${noPipe.size || pipeF.resp ? '' : 'disabled'}>Responder<span>${todos.filter(esperaDe).length}</span></button></div>
    <div class="pf-i" id="pInfo" hidden></div>
    <div class="pt" id="pTabs">${ETAPAS.map(([k, t], i) => `<button data-col="${i}">${t}<span>${de(k).length}</span></button>`).join('')}</div>
    <div class="pb" id="pBoard"></div>`
    : '<div class="cp-vazio">Seu pipeline está vazio.<br>Abre um Raio-X e toca em <b>Adicionar ao pipeline</b>.</div>'}</div>`
  $('capX').onclick = fecharCapivara
  if (empilhar) empilha('capt')
  const board = $('pBoard')
  const mover = async (d, etapa) => {
    if (!d || d.etapa === etapa) return
    const { error } = await sb.from('diagnosticos').update({ etapa, etapa_em: new Date().toISOString() }).eq('id', d.id)
    if (error) return liz('Não salvou a etapa. Tenta de novo.')
    d.etapa = etapa; contarCaptacao()
    colunaPipe = ETAPAS.findIndex(x => x[0] === etapa); const y = $('cap').scrollTop
    await abrirCaptacao(false); $('cap').scrollTop = y
  }
  if (board) {
    // no celular cada etapa ocupa a tela: arrasta pro lado pra trocar de coluna
    const abas = [...$('pTabs').children]
    const marca = i => abas.forEach((b, j) => b.classList.toggle('on', j === i))
    abas.forEach((b, i) => b.onclick = () => { board.scrollTo({ left: board.children[i].offsetLeft - board.offsetLeft, behavior: 'smooth' }); marca(i) })
    board.onscroll = () => { const w = board.children[0].offsetWidth + 12; pipeX = board.scrollLeft; colunaPipe = Math.round(board.scrollLeft / w); marca(colunaPipe) }
    board.addEventListener('click', () => { pipeY = $('cap').scrollTop }, true)
    const ligar = () => {
    board.querySelectorAll('.pc').forEach(el => {
      const d = todos.find(x => x.id === el.dataset.id)
      el.onclick = e => { if (!e.target.closest('a,button,textarea')) el.classList.toggle('aberto') }
      ligarEnr(el, d.empresa, async () => { const y = $('cap').scrollTop; pintar(); $('cap').scrollTop = y; $('pBoard').querySelector(`.pc[data-id="${d.id}"]`)?.classList.add('aberto') })
      el.ondragstart = e => { e.dataTransfer.setData('text/plain', d.id); el.classList.add('voando') }
      el.ondragend = () => el.classList.remove('voando')
      el.querySelector('[data-vai]')?.addEventListener('click', () => mover(d, el.querySelector('[data-vai]').dataset.vai))
      // abriu o WhatsApp, ligou ou chamou no Insta: já conta como contatado
      el.querySelectorAll('[data-contato]').forEach(a => a.addEventListener('click', () => { if (d.etapa === 'a_contatar') setTimeout(() => mover(d, 'contatado'), 400) }))
      el.querySelectorAll('[data-abrir]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); abrirConversas(true, a.dataset.abrir) }))
      el.querySelectorAll('[data-et]').forEach(b => b.onclick = () => mover(d, b.dataset.et))
      el.querySelectorAll('[data-tmp]').forEach(b => b.onclick = async () => {
        const { error } = await sb.from('diagnosticos').update({ temperatura: b.dataset.tmp || null }).eq('id', d.id)
        if (error) return liz('Não salvou a temperatura. Tenta de novo.')
        await abrirCaptacao(false); $('pBoard')?.querySelector(`.pc[data-id="${d.id}"]`)?.classList.add('aberto')
      })
      el.querySelector('[data-abre]').onclick = () => { seq = []; abrirCapivara(d) }
      el.querySelector('[data-copia]').onclick = async e => { try { await navigator.clipboard.writeText(saudacaoTxt()); e.target.textContent = '✓ Copiada' } catch { liz('Não consegui copiar.') } }
      let tm; el.querySelector('[data-nota]').oninput = ev => { clearTimeout(tm); tm = setTimeout(async () => { d.anotacao = ev.target.value; await sb.from('diagnosticos').update({ anotacao: ev.target.value }).eq('id', d.id) }, 700) }
    })
    board.querySelectorAll('.pcol').forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add('alvo') }
      col.ondragleave = () => col.classList.remove('alvo')
      col.ondrop = e => { e.preventDefault(); col.classList.remove('alvo'); mover(todos.find(x => x.id === e.dataTransfer.getData('text/plain')), col.dataset.et) }
    })
    board.querySelectorAll('[data-mais]').forEach(b => b.onclick = () => { const k = b.dataset.mais; pipeF.lim[k] = (pipeF.lim[k] || POR_COLUNA) + POR_COLUNA; const y = board.scrollLeft; pintar(); board.scrollLeft = y })
    }
    // busca: tudo o que identifica o lead, sem acento e sem maiúscula
    const textoBusca = new Map(todos.map(d => { const e = d.empresa || {}, a = esperaDe(d); return [d.id, semAcento([d.capivara?.nome, e.nome, e.instagram, e.email, e.cidade, e.bairro, d.busca?.nicho, d.segmento, d.anotacao, a?.nome].filter(Boolean).join(' '))] }))
    const fonesBusca = new Map(todos.map(d => { const e = d.empresa || {}, a = esperaDe(d); return [d.id, [e.whatsapp, e.telefone, d.telefone, a?.telefone, a?.fone].map(t => String(t || '').replace(/\D/g, '').replace(/^55(?=\d{10})/, '')).join(' ')] }))
    const pintar = (rolar = false) => {
      const q = semAcento(pipeF.q.trim()).replace(/^@/, ''), soNumero = /^[\d\s()+-]+$/.test(q), qd = soNumero ? q.replace(/\D/g, '').replace(/^55(?=\d{10})/, '') : ''
      const bate = d => (!pipeF.resp || esperaDe(d)) && (!pipeF.temp || tempDe(d)[0] === pipeF.temp) && (!pipeF.seg || segDe(d) === pipeF.seg) && (!q || (soNumero ? qd.length >= 3 && fonesBusca.get(d.id).includes(qd) : textoBusca.get(d.id).includes(q)))
      const filtrando = !!q || pipeF.resp || !!pipeF.temp || !!pipeF.seg
      let total = 0, primeira = -1
      board.innerHTML = ETAPAS.map(([k, t], i) => {
        // quem espera há mais tempo vem primeiro, pra não ficar escondido depois do limite da coluna
        const lista = de(k).filter(bate).sort((a, b) => (esperaDe(a)?.desde || '~').localeCompare(esperaDe(b)?.desde || '~'))
        total += lista.length; if (lista.length && primeira < 0) primeira = i
        abas[i].querySelector('span').textContent = lista.length
        const lim = pipeF.lim[k] || POR_COLUNA, resto = lista.length - lim
        const vazio = filtrando ? 'Ninguém aqui.' : k === 'a_contatar' ? 'Abre um Raio-X e toca em Adicionar ao pipeline.' : 'Arrasta uma empresa pra cá.'
        return `<section class="pcol c-${TEMP[k][0]}" data-et="${k}"><header><i></i>${t}<span>${lista.length}</span></header><div class="pcol-b">${lista.slice(0, lim).map(cartao).join('') || `<div class="pv">${vazio}</div>`}${resto > 0 ? `<button class="pv-mais" data-mais="${k}">Ver mais ${Math.min(resto, POR_COLUNA)} de ${resto}</button>` : ''}</div></section>`
      }).join('')
      ligar()
      const info = $('pInfo'), fora = pipeF.resp && foraDoPipe
      info.hidden = !filtrando && !foraDoPipe
      info.innerHTML = `${filtrando ? (total ? `${total} de ${todos.length} no pipeline` : 'Ninguém encontrado no pipeline') : ''}${foraDoPipe && (fora || !filtrando) ? `<button id="pFora">${foraDoPipe} esperando em Conversas, fora do pipeline</button>` : ''}`
      if ($('pFora')) $('pFora').onclick = () => abrirConversas()
      if (rolar && primeira >= 0) { colunaPipe = primeira; board.scrollLeft = board.children[primeira].offsetLeft - board.offsetLeft; marca(mob() ? primeira : -1) }
    }
    pintar()
    board.scrollLeft = mob() ? colunaPipe * (board.children[0].offsetWidth + 12) : pipeX; marca(mob() ? colunaPipe : -1)
    if (!empilhar) $('cap').scrollTop = pipeY
    let tq; $('pQ').oninput = e => { clearTimeout(tq); tq = setTimeout(() => { pipeF.q = e.target.value; pipeF.lim = {}; pintar(true) }, 150) }
    $('pSeg').onchange = e => { pipeF.seg = e.target.value; pipeF.lim = {}; pintar(true) }
    $('pTemp').querySelectorAll('button').forEach(b => b.onclick = () => { pipeF.temp = pipeF.temp === b.dataset.f ? '' : b.dataset.f; pipeF.lim = {}; $('pTemp').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.f === pipeF.temp)); pintar(true) })
    $('pResp').onclick = e => { pipeF.resp = !pipeF.resp; pipeF.lim = {}; e.currentTarget.setAttribute('aria-pressed', pipeF.resp); pintar(true) }
  }
  if ($('cFila')) $('cFila').onclick = () => abrirFila()
  if ($('cDisp')) $('cDisp').onclick = () => abrirDisparo()
  if ($('cCsv')) $('cCsv').onclick = () => {
    const cel = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const linhas = [['Empresa', 'Busca', 'Bairro', 'Cidade', 'Etapa', 'Temperatura', 'Desde', 'Telefone', 'WhatsApp', 'Instagram', 'E-mail', 'Site', 'Potencial', 'Assunto', 'Anotação'].map(cel).join(';')]
    todos.forEach(d => { const e = d.empresa || {}; linhas.push([e.nome, d.busca?.nicho, e.bairro, e.cidade, (ETAPAS.find(x => x[0] === d.etapa) || [])[1], tempDe(d)[1], new Date(quando(d)).toLocaleDateString('pt-BR'), e.telefone, e.whatsapp, e.instagram ? '@' + e.instagram : '', e.email, e.site, d.nota_dor, ANG[d.angulo] || '', d.anotacao].map(cel).join(';')) })
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' })); a.download = `pipeline_kompila_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }
  $('capO').classList.add('on'); $('cap').classList.add('on')
}
$('bCapt').onclick = () => { fecharCapivara(); setTimeout(() => abrirCaptacao(), history.state?.camada ? 60 : 0) }

/* ======================= disparo automático em cadência ======================= */
const DISP_ST = { pausada: ['Pausada', 'pausada'], rodando: ['Rodando', 'rodando'], concluida: ['Concluída', 'ok'], cancelada: ['Encerrada', 'off'] }
const CHIP_DP = { na_fila: ['na fila', 'f'], enviando: ['enviando…', 'g'], enviado: ['enviado ✓', 'e'], entregue: ['entregue ✓✓', 'e'], lido: ['lido ✓✓', 'e'], respondeu: ['respondeu', 'r'], falhou: ['falhou', 'x'], parou: ['parou', 'x'] }
const tfmt = t => { t = String(t || '').replace(/^55/, ''); return t.length === 11 ? t.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : t.length === 10 ? t.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3') : t }
let dispTimer = null, convTimer = null
async function abrirDisparo(empilhar = true) {
  const { data: cs } = await sb.from('campanha').select('*').in('status', ['rodando', 'pausada']).order('criada_em', { ascending: false }).limit(1)
  const camp = cs && cs[0]
  let body = ''
  if (camp) {
    const { data: evs } = await sb.from('envio').select('id, empresa_nome, telefone, status, mensagem, resposta').eq('campanha_id', camp.id).order('ordem', { ascending: true })
    const es = evs || [], ct = s => es.filter(e => e.status === s).length
    const total = es.length, fila = ct('na_fila'), falhou = ct('falhou')
    const enviados = ct('enviado') + ct('entregue') + ct('lido') + ct('respondeu'), resp = ct('respondeu')
    const pct = total ? Math.round(enviados / total * 100) : 0, rod = camp.status === 'rodando'
    const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
    body = `
      <div class="dp-top"><span class="dp-badge s-${DISP_ST[camp.status][1]}">${rod ? '<i class="dp-pulse"></i>' : '❚❚ '}${DISP_ST[camp.status][0]}</span><h3>${esc(camp.nome)}</h3></div>
      <div class="dp-bar"><i id="dpBar" style="width:${pct}%"></i></div>
      <div class="dp-k"><div><b id="dpEnv">${enviados}</b><span>enviados</span></div><div><b id="dpFila">${fila}</b><span>na fila</span></div><div><b id="dpResp">${resp}</b><span>responderam</span></div></div>
      ${rod ? `<div class="dp-live" id="dpLive"><i class="dp-pulse"></i> disparando… a tela atualiza sozinha</div>` : ''}
      <div class="dp-list" id="dpList">${es.map(e => `<div class="dp-it" data-ev="${e.id}"><div class="dp-it-top"><div><b>${esc(e.empresa_nome || 'Contato')}</b><small>${esc(tfmt(e.telefone))}</small></div><span class="dp-chip c-${(CHIP_DP[e.status] || ['', ''])[1]}">${(CHIP_DP[e.status] || [e.status])[0]}</span></div><div class="dp-conv"><div class="dp-msg out">${esc(e.mensagem || '')}</div><div class="dp-msg in" data-in>${e.resposta ? esc(e.resposta) : ''}</div></div></div>`).join('')}</div>
      <div class="dp-cfg">Manda 1 a cada <b>${camp.intervalo_min} min</b> (com variação), das <b>${camp.hora_ini}h às ${camp.hora_fim}h</b>, ${(camp.dias || []).length === 7 ? 'todos os dias' : (camp.dias || []).map(x => DIAS[x]).join(', ')}, até <b>${camp.limite_dia}/dia</b>.${falhou ? ` <span class="dp-ferr">${falhou} falhou</span>` : ''}</div>
      ${rod ? `<button class="btn line" id="dPausa" style="width:100%">Pausar</button>`
            : `<label class="dp-ok"><input type="checkbox" id="dCiente"> Entendi: vai disparar sozinho pelo meu WhatsApp conectado.</label><button class="btn ok lg" id="dLiga" style="width:100%" disabled>Ligar o disparo</button>`}
      <button class="btn ghost sm" id="dFim" style="width:100%;margin-top:8px">Encerrar disparos</button>`
  } else {
    const { data: ds } = await sb.from('diagnosticos').select('etapa, decisao, empresa:empresas(whatsapp, telefone)').eq('decisao', 'aprovada')
    const prontos = (ds || []).filter(d => (d.etapa || 'a_contatar') === 'a_contatar' && (d.empresa?.whatsapp || /^\(?\d{2}\)?\s?9/.test(d.empresa?.telefone || ''))).length
    const cad = `<div class="dp-form">
        <label>Intervalo entre envios<select id="dInt"><option value="3">a cada 3 min</option><option value="5" selected>a cada 5 min</option><option value="8">a cada 8 min</option><option value="12">a cada 12 min</option></select></label>
        <label>Máximo por dia<select id="dLim"><option value="30">30 por dia</option><option value="60" selected>60 por dia</option><option value="100">100 por dia</option><option value="150">150 por dia</option></select></label>
        <div class="dp-row"><label>Das <select id="dHi">${Array.from({ length: 24 }, (_, h) => `<option ${h === 9 ? 'selected' : ''}>${h}</option>`).join('')}</select> h</label><label>às <select id="dHf">${Array.from({ length: 24 }, (_, h) => `<option value="${h + 1}" ${h + 1 === 18 ? 'selected' : ''}>${h + 1}</option>`).join('')}</select> h</label></div>
        <label>Dias<select id="dDias"><option value="semana" selected>segunda a sexta</option><option value="todos">todos os dias</option></select></label>
      </div>`
    body = `<p class="dp-lead">Cola os números que você quer prospectar, um por linha. Cada um recebe a sua mensagem, no ritmo que você escolher.</p>
      <label class="dp-lbl">Números (um por linha)</label>
      <textarea id="dNums" class="dp-ta" placeholder="11 99999-0000&#10;11 98888-7777"></textarea>
      <label class="dp-lbl">Mensagem</label>
      <textarea id="dMsg" class="dp-ta" rows="3">Oi, tudo bem?</textarea>
      ${cad}
      <div class="dp-aviso">Começa devagar pra não queimar o número. Intervalo curto demais toma bloqueio.</div>
      <button class="btn ok lg" id="dCriarL" style="width:100%">Montar disparos</button>
      ${prontos ? `<button class="btn line sm" id="dUsarRaiox" style="width:100%;margin-top:8px">ou usar meus ${prontos} Raio-X aprovados</button>` : ''}`
  }
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Disparo automático</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b dp">${body}</div>`
  $('capX').onclick = fecharCapivara
  if (empilhar) empilha('disparo')
  const recarrega = () => abrirDisparo(false)
  if ($('dpList')) $('dpList').querySelectorAll('.dp-it').forEach(el => { const top = el.querySelector('.dp-it-top'); if (top) top.onclick = () => el.classList.toggle('aberto') })
  if ($('dCriarL')) $('dCriarL').onclick = async () => {
    const nums = [...new Set(($('dNums').value || '').split(/[\s,;]+/).map(x => x.replace(/\D/g, '')).filter(Boolean).map(x => { x = x.replace(/^0+/, ''); if (x.length === 10 || x.length === 11) x = '55' + x; return x }).filter(x => x.length >= 12 && x.length <= 13))]
    if (!nums.length) return liz('Põe pelo menos um número com DDD.')
    const msg = ($('dMsg').value || '').trim() || 'Oi, tudo bem?'
    $('dCriarL').disabled = true; $('dCriarL').textContent = 'Montando…'
    const dias = $('dDias').value === 'todos' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
    const { data: c, error } = await sb.from('campanha').insert({ nome: 'Minha lista ' + new Date().toLocaleDateString('pt-BR'), status: 'pausada', intervalo_min: +$('dInt').value, limite_dia: +$('dLim').value, hora_ini: +$('dHi').value, hora_fim: +$('dHf').value, dias }).select('id').single()
    if (error) { $('dCriarL').disabled = false; $('dCriarL').textContent = 'Montar disparos'; return liz(esc(error.message)) }
    const { error: e2 } = await sb.from('envio').insert(nums.map((tel, i) => ({ campanha_id: c.id, empresa_nome: 'Contato', telefone: tel, mensagem: msg, ordem: i + 1, status: 'na_fila' })))
    if (e2) return liz(esc(e2.message))
    recarrega()
  }
  if ($('dUsarRaiox')) $('dUsarRaiox').onclick = async () => {
    $('dUsarRaiox').disabled = true; $('dUsarRaiox').textContent = 'Montando…'
    const dias = $('dDias').value === 'todos' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
    const { error } = await sb.rpc('criar_campanha', { p_nome: 'Prospecção ' + new Date().toLocaleDateString('pt-BR'), p_intervalo: +$('dInt').value, p_limite: +$('dLim').value, p_hora_ini: +$('dHi').value, p_hora_fim: +$('dHf').value, p_dias: dias })
    if (error) { $('dUsarRaiox').disabled = false; return liz(esc(error.message)) }
    recarrega()
  }
  if ($('dCiente')) $('dCiente').onchange = e => { $('dLiga').disabled = !e.target.checked }
  if ($('dLiga')) $('dLiga').onclick = async () => { await sb.from('campanha').update({ status: 'rodando' }).eq('id', camp.id); liz('Disparo ligado. Vou mandando no ritmo combinado.'); recarrega() }
  if ($('dPausa')) $('dPausa').onclick = async () => { await sb.from('campanha').update({ status: 'pausada' }).eq('id', camp.id); recarrega() }
  if ($('dFim')) $('dFim').onclick = async () => { clearInterval(dispTimer); await sb.from('campanha').update({ status: 'cancelada' }).eq('id', camp.id); liz('Campanha encerrada.'); recarrega() }
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
  clearInterval(dispTimer)
  if (camp && camp.status === 'rodando') dispTimer = setInterval(async () => {
    if (!document.getElementById('dpList')) { clearInterval(dispTimer); return }
    const { data: evs } = await sb.from('envio').select('id, status, resposta').eq('campanha_id', camp.id)
    const es = evs || [], ct = s => es.filter(e => e.status === s).length
    const total = es.length, fila = ct('na_fila'), env = ct('enviado') + ct('entregue') + ct('lido') + ct('respondeu'), resp = ct('respondeu')
    if ($('dpEnv')) { $('dpEnv').textContent = env; $('dpFila').textContent = fila; $('dpResp').textContent = resp; $('dpBar').style.width = (total ? Math.round(env / total * 100) : 0) + '%' }
    es.forEach(e => { const row = document.querySelector('.dp-it[data-ev="' + e.id + '"]'); if (!row) return; const el = row.querySelector('.dp-chip'); if (el) { const c = CHIP_DP[e.status] || [e.status, '']; el.textContent = c[0]; el.className = 'dp-chip c-' + c[1] } const inb = row.querySelector('[data-in]'); if (inb && e.resposta && inb.textContent !== e.resposta) inb.textContent = e.resposta })
    if (!fila) { clearInterval(dispTimer); if ($('dpLive')) $('dpLive').innerHTML = '✓ todos enviados' }
  }, 3000)
}

/* ======================= conversas (inbox) ======================= */
const AVCORES = ['#1FA463', '#2D6CDF', '#E0803B', '#9B51E0', '#D94F6B', '#17A2B8', '#C99A2E', '#5A6472']
const CVIC = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8.3" r="4"/><path d="M4.2 20c.6-4 3.9-6 7.8-6s7.2 2 7.8 6z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>'
}
async function abrirConversas(empilhar = true, abrirTel = null) {
  try { localStorage.setItem('kp_conv_visto', new Date().toISOString()) } catch (_) {}
  { const nc = $('nConv'); if (nc) { nc.hidden = true; nc.textContent = '' } }
  const { data: msgs } = await sb.from('conversa').select('telefone, nome, direcao, texto, criado_em, pessoal, fone').order('criado_em', { ascending: true })
  const all = msgs || [], byTel = {}
  all.forEach(m => { (byTel[m.telefone] = byTel[m.telefone] || []).push(m) })
  if (abrirTel && !byTel[abrirTel]) byTel[abrirTel] = []  // abrir uma conversa nova (ainda sem histórico)
  const respSet = new Set(all.filter(m => m.direcao === 'in').map(m => m.telefone))
  // É o número de prospecção: todo contato é LEAD por padrão. Vira PESSOAL só quando você marca.
  const pessoalSet = new Set(all.filter(m => m.pessoal).map(m => m.telefone))
  const ehPessoal = t => pessoalSet.has(t)
  const ehLead = t => !ehPessoal(t)
  const ult0 = t => byTel[t][byTel[t].length - 1] || {}
  const ordenar = () => Object.keys(byTel).sort((a, b) => new Date(ult0(b).criado_em || 0) - new Date(ult0(a).criado_em || 0))
  let tels = ordenar()
  let aba = 'leads'
  const visiveis = () => tels.filter(t => aba === 'leads' ? ehLead(t) : !ehLead(t))
  let sel = null, ultimo = all.length ? all[all.length - 1].criado_em : ''

  const ehFone = t => /^55\d{10,11}$/.test(t)
  const nomeDe = t => (byTel[t].find(m => m.nome) || {}).nome || ''
  const foneDe = t => { const f = (byTel[t].find(m => m.fone) || {}).fone || t; return ehFone(f) ? f : '' }
  const label = t => { const n = nomeDe(t); return n ? esc(n) : (foneDe(t) ? esc(tfmt(foneDe(t))) : 'Contato') }
  const subDe = t => { const f = foneDe(t); return f ? esc(tfmt(f)) : '' }
  const inic = t => { const n = nomeDe(t); if (!n) return ''; const p = n.trim().split(/\s+/); return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase() }
  const cor = t => AVCORES[[...t].reduce((a, c) => a + c.charCodeAt(0), 0) % AVCORES.length]
  const hora = iso => {
    const d = new Date(iso), hoje = new Date()
    const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    if (d.toDateString() === hoje.toDateString()) return hm
    const o = new Date(hoje); o.setDate(o.getDate() - 1)
    if (d.toDateString() === o.toDateString()) return 'ontem'
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  const avatar = t => `<span class="cv-av" style="background:${cor(t)}">${inic(t) || CVIC.user}</span>`
  const mob = () => matchMedia('(max-width:720px)').matches

  // fase do lead no pipeline: telefone -> envio -> diagnostico (contato pessoal não tem fase)
  async function carregarFase(tel) {
    const box = $('cap').querySelector('.cv2-fase'); if (!box) return
    // 1) lead que veio do disparo (ligado por um envio)
    const { data: ev } = await sb.from('envio').select('diagnostico_id').eq('telefone', tel).not('diagnostico_id', 'is', null).order('enviado_em', { ascending: false, nullsFirst: false }).limit(1)
    let dg = null
    if (ev?.[0]?.diagnostico_id) { const r = await sb.from('diagnosticos').select('id, temperatura, etapa, etapa_em, decidida_em, nota_dor, angulo, motivo, anotacao, empresa:empresas(nome)').eq('id', ev[0].diagnostico_id).maybeSingle(); dg = r.data }
    // 2) lead que entrou pela conversa (ligado direto pelo telefone)
    if (!dg) { const r = await sb.from('diagnosticos').select('id, temperatura, etapa, etapa_em, decidida_em, nota_dor, angulo, motivo, anotacao').eq('telefone', tel).eq('origem', 'conversa').eq('arquivado', false).order('criado_em', { ascending: false }).limit(1).maybeSingle(); dg = r.data }
    // 3) ainda não está no pipe: oferece virar lead (só se não for pessoal)
    if (!dg) {
      box.innerHTML = ehPessoal(tel) ? '' : `<button class="cv2-virar" id="cvVirar">+ Virar lead (pro pipe)</button>`
      const bv = $('cvVirar')
      if (bv) bv.onclick = async () => { bv.disabled = true; const nm = nomeDe(tel) || (foneDe(tel) ? tfmt(foneDe(tel)) : 'Contato'); const { error } = await sb.from('diagnosticos').insert({ telefone: tel, etapa: 'respondeu', origem: 'conversa', decisao: 'aprovada', decidida_em: new Date().toISOString(), capivara: { nome: nm } }); if (error) { bv.disabled = false; return liz('Não consegui virar lead.') } liz('Virou lead. Agora ele está no pipe.'); carregarFase(tel) }
      return
    }
    const render = () => {
      const t = calcTemp(dg.etapa, dg.temperatura, [...(byTel[tel] || [])].reverse().find(m => m.direcao === 'in')?.criado_em, dg.etapa_em)
      const quando = dg.etapa_em || dg.decidida_em, n = dias(quando)
      const momento = quando ? (n === 0 ? 'nesta fase hoje' : `nesta fase há ${n} dia${n > 1 ? 's' : ''}`) : ''
      const dor = dg.nota_dor != null ? `<span class="cv2-dor"${dg.motivo ? ` title="${esc(dg.motivo)}"` : ''}><b>${dg.nota_dor}</b> ${ANG[dg.angulo] || 'potencial'}</span>` : ''
      box.innerHTML = `<div class="cv2-fr"><span class="tp t-${t[0]}">${t[1] || 'Lead'}</span>${dg.empresa?.nome ? `<span class="cv2-emp">${esc(dg.empresa.nome)}</span>` : ''}${momento ? `<span class="cv2-tempo">${momento}</span>` : ''}<span class="cv2-et">${ETAPAS.map(([k, tx]) => `<button data-et="${k}" class="${dg.etapa === k ? 'on' : ''}">${tx}</button>`).join('')}</span></div>
        <div class="cv2-dados">${dor}<input class="cv2-anot" placeholder="Anotação (ex: falei com a Ana, retornar segunda)" autocomplete="off"></div>`
      box.querySelectorAll('[data-et]').forEach(b => b.onclick = async () => {
        const nv = b.dataset.et
        const { error } = await sb.from('diagnosticos').update({ etapa: nv, etapa_em: new Date().toISOString() }).eq('id', dg.id)
        if (error) return liz('Não consegui mover a fase.')
        dg.etapa = nv; dg.etapa_em = new Date().toISOString(); render()
      })
      const anot = box.querySelector('.cv2-anot')
      if (anot) { anot.value = dg.anotacao || ''; let tm; anot.oninput = e => { dg.anotacao = e.target.value; clearTimeout(tm); tm = setTimeout(() => sb.from('diagnosticos').update({ anotacao: e.target.value }).eq('id', dg.id), 700) } }
    }
    render()
  }

  const selecionar = tel => {
    sel = tel
    $('cap').querySelectorAll('.cv2-row').forEach(r => r.classList.toggle('on', r.dataset.tel === tel))
    const th = byTel[tel]
    const bolhas = th.map(m => `<div class="cv-b ${m.direcao === 'out' ? 'out' : 'in'}">${esc(m.texto)}<span class="cv-t">${hora(m.criado_em)}</span></div>`).join('')
    $('cap').querySelector('.cv2-chat').innerHTML = `<div class="cv-thread">
        <div class="cv-thead"><button class="ibtn cv-back" aria-label="Voltar">${CVIC.back}</button>${avatar(tel)}<div class="cv-who"><b class="cv-nome-ed" title="Clique pra editar o nome">${label(tel)}<svg class="cv-pen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></b>${subDe(tel) ? `<small>${subDe(tel)}</small>` : ''}</div><button class="cv-tag" title="Classificar este contato">${ehPessoal(tel) ? 'Mover pra Leads' : 'Marcar como pessoal'}</button><button class="cv-del" title="Apagar esta conversa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div>
        <div class="cv2-fase"></div>
        <div class="cv-scroll">${bolhas}</div>
        <div class="cv-comp"><input class="cv-in" placeholder="Mensagem" autocomplete="off"><button class="cv-send" aria-label="Enviar">${CVIC.send}</button></div>
      </div>`
    $('cap').querySelector('.cv2').classList.add('aberta')
    const sc = $('cap').querySelector('.cv-scroll'); sc.scrollTop = sc.scrollHeight
    $('cap').querySelector('.cv-back').onclick = () => $('cap').querySelector('.cv2').classList.remove('aberta')
    const inp = $('cap').querySelector('.cv-in'), btn = $('cap').querySelector('.cv-send')
    const enviar = async () => {
      const val = (inp.value || '').trim(); if (!val) return
      btn.disabled = true
      const { data, error } = await sb.functions.invoke('responder', { body: { telefone: tel, texto: val } })
      btn.disabled = false
      if (error || data?.erro) return liz(esc(data?.erro || 'Não consegui enviar.'))
      const b = document.createElement('div'); b.className = 'cv-b out'
      b.innerHTML = `${esc(val)}<span class="cv-t">${hora(new Date().toISOString())}</span>`
      sc.appendChild(b); sc.scrollTop = sc.scrollHeight; inp.value = ''; inp.focus()
      carregarFase(tel)  // refresca a fase: 'a contatar' já virou 'contatado' no servidor
    }
    btn.onclick = enviar
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); enviar() } }
    // marcar como Pessoal (ou voltar pra Lead). Clica na tag no topo.
    const tag = $('cap').querySelector('.cv-thead .cv-tag')
    if (tag) tag.onclick = async () => {
      const novo = !ehPessoal(tel)
      try { await sb.from('conversa').update({ pessoal: novo }).eq('telefone', tel) } catch (_) {}
      // pessoal sai do pipe: arquiva o lead que entrou pela conversa (desarquiva ao voltar pra lead)
      try { await sb.from('diagnosticos').update({ arquivado: novo }).eq('telefone', tel).eq('origem', 'conversa') } catch (_) {}
      if (novo) pessoalSet.add(tel); else pessoalSet.delete(tel)
      byTel[tel].forEach(m => (m.pessoal = novo))
      if ((aba === 'leads' && novo) || (aba === 'pessoal' && !novo)) { renderLista(); $('cap').querySelector('.cv2').classList.remove('aberta') }
      else { renderLista(); selecionar(tel) }
    }
    // apagar a conversa (pra testar de novo do zero). Dois toques pra não apagar sem querer.
    const del = $('cap').querySelector('.cv-thead .cv-del')
    if (del) { const ico = del.innerHTML; let armado = false
      del.onclick = async () => {
        if (!armado) { armado = true; del.classList.add('on'); del.textContent = 'Apagar?'; setTimeout(() => { if (del && armado) { armado = false; del.classList.remove('on'); del.innerHTML = ico } }, 3000); return }
        del.disabled = true
        try { await sb.from('conversa').delete().eq('telefone', tel) } catch (_) {}
        delete byTel[tel]; tels = tels.filter(t => t !== tel); sel = null
        renderLista(); $('cap').querySelector('.cv2').classList.remove('aberta')
        liz('Conversa apagada. Pode testar de novo.')
      }
    }
    // editar o nome do contato (clica no nome, igual WhatsApp)
    const whoB = $('cap').querySelector('.cv-who .cv-nome-ed')
    if (whoB) whoB.onclick = () => {
      const ed = document.createElement('input'); ed.className = 'cv-nome-inp'; ed.value = nomeDe(tel) || ''; ed.placeholder = 'Nome do contato'; ed.autocomplete = 'off'
      whoB.replaceWith(ed); ed.focus(); ed.select()
      let feito = false
      const salvar = async () => {
        if (feito) return; feito = true
        const nv = ed.value.trim()
        try { await sb.from('conversa').update({ nome: nv || null, nome_manual: !!nv }).eq('telefone', tel) } catch (_) {}
        byTel[tel].forEach(m => { m.nome = nv || null; m.nome_manual = !!nv })
        selecionar(tel); renderLista()
      }
      ed.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); salvar() } else if (e.key === 'Escape') { feito = true; selecionar(tel) } }
      ed.onblur = salvar
    }
    if (!mob()) inp.focus()
    carregarFase(tel)
  }

  const row = tel => {
    const th = byTel[tel], ult = th[th.length - 1] || { texto: '', criado_em: new Date().toISOString(), direcao: 'out' }, resp = respSet.has(tel)
    const snip = esc(String(ult.texto || '').replace(/\s+/g, ' ').slice(0, 42))
    const pre = ult.direcao === 'in' ? '' : '<span class="cv-vc">você:</span> '
    return `<button class="cv-row cv2-row" data-tel="${esc(tel)}">${avatar(tel)}<span class="cv-main"><span class="cv-nome">${label(tel)}</span><span class="cv-prev">${pre}${snip}</span></span><span class="cv-meta"><span class="cv-time">${hora(ult.criado_em)}</span>${resp ? '<span class="cv-dot"></span>' : ''}</span></button>`
  }
  const listaHTML = () => {
    const vis = visiveis(), nLead = tels.filter(ehLead).length, nPess = tels.length - nLead
    const abas = `<div class="cv-abas"><button data-aba="leads" class="${aba === 'leads' ? 'on' : ''}">Leads <span>${nLead}</span></button><button data-aba="pessoal" class="${aba === 'pessoal' ? 'on' : ''}">Pessoal <span>${nPess}</span></button></div>`
    const vazio = `<div class="cv-abavazia">${aba === 'leads' ? 'Nenhum lead aqui. Os leads do pipe aparecem aqui quando você fala com eles.' : 'Nenhuma conversa pessoal.'}</div>`
    return abas + (vis.length ? vis.map(row).join('') : vazio)
  }
  const bindLista = () => {
    const cap = $('cap')
    cap.querySelectorAll('.cv2-row').forEach(el => { el.onclick = () => selecionar(el.dataset.tel); el.classList.toggle('on', el.dataset.tel === sel) })
    cap.querySelectorAll('.cv-abas [data-aba]').forEach(b => b.onclick = () => { if (aba === b.dataset.aba) return; aba = b.dataset.aba; renderLista() })
  }
  const renderLista = () => { tels = ordenar(); const l = $('cap').querySelector('.cv2-list'); if (!l) return; l.innerHTML = listaHTML(); bindLista() }

  // atualiza sozinho: a cada 2s puxa só o que chegou depois da última mensagem
  async function atualizar() {
    const cap = $('cap')
    if (!cap.classList.contains('on') || !cap.querySelector('.cv2')) { clearInterval(convTimer); convTimer = null; return }
    const { data: novos } = await sb.from('conversa').select('telefone, nome, direcao, texto, criado_em, fone').gt('criado_em', ultimo).order('criado_em', { ascending: true })
    if (!novos || !novos.length) return
    ultimo = novos[novos.length - 1].criado_em
    for (const m of novos) {
      (byTel[m.telefone] = byTel[m.telefone] || []).push(m)
      if (m.direcao === 'in') respSet.add(m.telefone)
      if (m.telefone === sel && m.direcao === 'in') {
        const sc = cap.querySelector('.cv-scroll')
        if (sc) { const b = document.createElement('div'); b.className = 'cv-b in'; b.innerHTML = `${esc(m.texto)}<span class="cv-t">${hora(m.criado_em)}</span>`; const perto = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 80; sc.appendChild(b); if (perto) sc.scrollTop = sc.scrollHeight }
      }
    }
    renderLista()
  }

  const body = tels.length
    ? `<div class="cv2"><div class="cv2-list">${listaHTML()}</div><div class="cv2-chat"><div class="cv2-nada">Escolhe uma conversa à esquerda.</div></div></div>`
    : `<div class="cp-vazio">Nenhuma conversa ainda.<br>Dispara uma campanha e as respostas aparecem aqui.</div>`
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Conversas</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b cv2wrap">${body}</div>`
  $('capX').onclick = fecharCapivara
  if (empilhar) empilha('conversas')
  bindLista()
  if (abrirTel && byTel[abrirTel]) aba = ehLead(abrirTel) ? 'leads' : 'pessoal'
  const vis0 = visiveis()
  const first = abrirTel && byTel[abrirTel] ? abrirTel : (!mob() && vis0.length ? vis0[0] : null)
  if (first) selecionar(first)
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
  clearInterval(convTimer); convTimer = setInterval(atualizar, 2000)
}

/* ======================= fila de envio: um toque por empresa ======================= */
// nada sai sozinho: a fila abre o WhatsApp com a saudação e quem aperta enviar é você
const LIMITES = [10, 20, 30, 50]
const lerLimite = () => { try { return +localStorage.getItem('kp_limite') || 30 } catch { return 30 } }
let fila = [], fpos = 0, passouLimite = false
async function abrirFila(empilhar = true) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const [{ data }, { count }] = await Promise.all([
    sb.from('diagnosticos').select('id, nota_dor, abordagem, capivara, etapa, busca:buscas(nicho, cidade), empresa:empresas(nome, bairro, cidade, telefone, instagram, email, whatsapp)').eq('decisao', 'aprovada').eq('etapa', 'a_contatar').order('nota_dor', { ascending: false }),
    sb.from('diagnosticos').select('id', { count: 'exact', head: true }).eq('decisao', 'aprovada').eq('etapa', 'contatado').gte('etapa_em', hoje.toISOString()),
  ])
  fila = data || []; fpos = 0
  desenharFila(count || 0)
  if (empilhar) empilha('fila')
  $('capO').classList.add('on'); $('cap').classList.add('on')
}
function desenharFila(feitos) {
  const lim = lerLimite(), d = fila[fpos], cheio = feitos >= lim && !passouLimite
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  const topo = `<div class="fl-top"><div><b>${feitos}</b> de ${lim} hoje</div><div class="fl-bar"><i style="width:${Math.min(100, feitos / lim * 100)}%"></i></div>
    <label>Limite por dia <select id="fLim">${LIMITES.map(n => `<option${n === lim ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>`
  let corpo
  if (!fila.length) corpo = '<div class="cp-vazio">Ninguém esperando contato.<br>Passa nos Raio-X e toca em <b>Adicionar ao pipeline</b>.</div>'
  else if (fpos >= fila.length) corpo = `<div class="cp-vazio">Acabou a fila de hoje. ${feitos} contatada${feitos === 1 ? '' : 's'}.<br>Quem responder, você move pra <b>Respondeu</b> no pipeline.</div><button class="btn line" id="fPipe" style="width:100%">Ver o pipeline</button>`
  else if (cheio) corpo = `<div class="cp-vazio">Bateu o limite de hoje: <b>${lim} contatos</b>.<br>Mandar muita mensagem fria no mesmo dia é o que faz o WhatsApp bloquear o número.</div><button class="btn ghost" id="fMais" style="width:100%">Continuar mesmo assim</button>`
  else {
    const e = d.empresa || {}, c = d.capivara || {}, msg = saudacaoTxt()
    const w = zap(e.whatsapp) || (/^\(?\d{2}\)?\s?9/.test(e.telefone || '') ? zap(e.telefone) : null), prox = fila[fpos + 1]
    corpo = `<div class="fl-c">
      <div class="fl-h"><div><small>${fpos + 1} de ${fila.length} na fila</small><b>${esc(c.nome || e.nome)}</b><span>${esc(d.busca?.cidade === 'Lista' ? 'Lista · ' + d.busca.nicho : (d.busca?.nicho || '') + ' · ' + (e.cidade || '').split(',')[0])}${e.bairro ? ' · ' + esc(e.bairro) : ''}</span></div><span class="nt">${d.nota_dor ?? ''}</span></div>
      <label class="fl-l">Primeira mensagem · dá pra mexer</label>
      <textarea id="fMsg">${esc(msg)}</textarea>
      <div class="fl-ct">${e.instagram ? `<a href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener" class="ig">${IC.ig}@${esc(e.instagram)}</a>` : ''}${e.telefone ? `<span>${esc(e.telefone)}</span>` : ''}${e.email ? `<span>${esc(e.email)}</span>` : ''}</div>
      ${w ? '' : `<div class="fl-add"><label>Não achei WhatsApp. Abre o Insta, pega o número e cola aqui:</label><div class="fl-addr"><input id="fAdd" inputmode="tel" placeholder="(11) 90000-0000" value="${esc(e.whatsapp || '')}"><button class="btn line sm" id="fAddB">Salvar</button></div></div>`}
      <div class="fl-ac">${w ? `<a class="btn ok" id="fZap" href="https://wa.me/${w}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Enviar no WhatsApp</a>` : ''}
        <div class="fl-alt">${e.telefone ? `<a class="btn line" data-feito href="tel:${esc(e.telefone.replace(/[^\d+]/g, ''))}">Ligar</a>` : ''}${e.email ? `<a class="btn line" data-feito href="mailto:${esc(e.email)}?body=${encodeURIComponent(msg)}">E-mail</a>` : ''}</div>
        <button class="btn ghost" id="fPula">Pular por agora</button></div>
      <div class="fl-ok" id="fOk" hidden>${IC.ok}Marcada como contatada. Indo pra próxima…</div>
      ${prox ? `<div class="fl-prox">Próxima: <b>${esc(prox.capivara?.nome || prox.empresa?.nome)}</b></div>` : ''}</div>`
  }
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Abordagens do dia</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b fl">${topo}${corpo}
    <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  $('capX').onclick = fecharCapivara
  $('fLim').onchange = ev => { try { localStorage.setItem('kp_limite', ev.target.value) } catch {} desenharFila(feitos) }
  if ($('fPipe')) $('fPipe').onclick = () => abrirCaptacao()
  if ($('fMais')) $('fMais').onclick = () => { passouLimite = true; desenharFila(feitos) }
  if (!d || cheio) return
  if ($('fAddB')) $('fAddB').onclick = async () => {
    const num = ($('fAdd').value || '').replace(/\D/g, '')
    if (num.length < 10) return liz('Confere o número com DDD.')
    $('fAddB').disabled = true; $('fAddB').textContent = 'Salvando…'
    const { error } = await sb.from('empresas').update({ whatsapp: num }).eq('id', d.empresa.id)
    if (error) { $('fAddB').disabled = false; $('fAddB').textContent = 'Salvar'; return liz('Não salvou o número. Tenta de novo.') }
    d.empresa.whatsapp = num; desenharFila(feitos)
  }
  const msgAtual = () => $('fMsg').value.trim()
  $('fMsg').oninput = () => { const z = $('fZap'); if (z) z.href = z.href.split('?')[0] + '?text=' + encodeURIComponent(msgAtual()) }
  const contatou = async () => {
        $('fOk').hidden = false
    const { error } = await sb.from('diagnosticos').update({ etapa: 'contatado', etapa_em: new Date().toISOString() }).eq('id', d.id)
    if (error) { $('fOk').hidden = true; return liz('Não marquei como contatada. Tenta de novo.') }
    contarCaptacao()
    setTimeout(() => { fila.splice(fpos, 1); desenharFila(feitos + 1); $('cap').scrollTop = 0 }, 1200)
  }
  if ($('fZap')) $('fZap').addEventListener('click', contatou)
  $('cap').querySelectorAll('[data-feito]').forEach(a => a.addEventListener('click', async () => {
    if (a.hasAttribute('data-copia')) { try { await navigator.clipboard.writeText(msgAtual()) } catch {} }
    contatou()
  }))
  $('fPula').onclick = () => { fila.push(fila.splice(fpos, 1)[0]); if (fila.length === 1) fpos = 1; desenharFila(feitos) }
}

/* ======================= uma empresa por vez: arrasta pro lado ======================= */
let seq = [], pos = 0
const temCap = d => Object.keys(d?.capivara || {}).length > 0
const SEL_SEQ = 'id, status, angulo, nota_dor, motivo, decisao, abordagem, capivara, erro, empresa:empresas(nome, bairro, cidade, telefone, site, google_maps_url, nota, total_avaliacoes, instagram, email, whatsapp)'
async function abrirSeq(id) {
  if (!busca?.id) return
  const { data } = await sb.from('diagnosticos').select(SEL_SEQ).eq('busca_id', busca.id).order('nota_dor', { ascending: false })
  const todos = (data || []).filter(d => d.decisao !== 'pulada' || d.id === id)
  // primeiro as que já têm capivara, depois as outras pela nota
  seq = [...todos.filter(temCap), ...todos.filter(d => !temCap(d))]
  pos = Math.max(0, seq.findIndex(d => d.id === id))
  await mostrarSeq(0, true)
  if (mob()) { try { if (!localStorage.getItem('kp_dica_arrasta')) { liz('Arrasta pro lado pra ver a próxima empresa.'); localStorage.setItem('kp_dica_arrasta', '1') } } catch {} }
}
async function mostrarSeq(dir = 0, empilhar = false) {
  const d = seq[pos]; if (!d) return
  if (temCap(d)) await abrirCapivara(d, empilhar); else abrirFicha(d, empilhar)
  const cap = $('cap'), prox = seq[pos + 1]
  cap.dataset.seq = '1'
  cap.querySelector('.cap-x .t').insertAdjacentHTML('afterend', `<div class="sq"><button class="ibtn" data-sq="-1" ${pos ? '' : 'disabled'} aria-label="Anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button><span>${pos + 1} de ${seq.length}</span><button class="ibtn" data-sq="1" ${prox ? '' : 'disabled'} aria-label="Próxima"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button></div>`)
  cap.querySelector('.cap-b > .cred')?.insertAdjacentHTML('beforebegin', prox
    ? `<button class="sq-prox" data-sq="1"><span><small>Próxima empresa · ${pos + 2} de ${seq.length}</small><b>${esc(prox.capivara?.nome || prox.empresa?.nome)}</b></span>${IC.arr}</button>`
    : '<div class="sq-fim">Essa foi a última empresa da busca.</div>')
  cap.querySelectorAll('[data-sq]').forEach(b => b.onclick = () => irSeq(+b.dataset.sq))
  if (dir) { const b = cap.querySelector('.cap-b'); b.classList.add(dir > 0 ? 'vem-d' : 'vem-e') }
  if (d.status === 'na_fila' || d.status === 'lendo') esperarCapivara(d.id)
}
function irSeq(dir) {
  const n = pos + dir
  if (n < 0 || n >= seq.length) return
  pos = n; mostrarSeq(dir)
}
let toque = null
$('cap').addEventListener('touchstart', e => {
  toque = $('cap').dataset.seq && e.touches.length === 1 && !e.target.closest('textarea,input,.shot') ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null
}, { passive: true })
$('cap').addEventListener('touchend', e => {
  if (!toque) return
  const dx = e.changedTouches[0].clientX - toque.x, dy = e.changedTouches[0].clientY - toque.y, rapido = Date.now() - toque.t < 800
  toque = null
  if (rapido && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) irSeq(dx < 0 ? 1 : -1)
})
addEventListener('keydown', e => { if ($('cap').dataset.seq && $('cap').classList.contains('on') && !e.target.closest('textarea,input')) { if (e.key === 'ArrowRight') irSeq(1); if (e.key === 'ArrowLeft') irSeq(-1) } })
// empresa que ainda não tem capivara: ficha curta com o que a peneira já sabe
function abrirFicha(d, empilhar = true) {
  const e = d.empresa || {}, o = Math.round(314 - 314 * (d.nota_dor || 0) / 100)
  const linha = (ok, l, v) => `<div class="r"><span class="d ${ok ? 'ok' : 'neu'}">${ok ? '✓' : '–'}</span><span class="l">${l}</span><span class="v">${v}</span></div>`
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">${esc(e.nome)}</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
  <header class="hd"><div><div class="k">Sem Raio-X ainda</div><h1>${esc(e.nome)}</h1><div class="lo">${IC.pin}${esc([e.bairro, e.cidade].filter(Boolean).join(' · '))}</div>
    <div class="sel"><span class="ang a-${d.angulo || 'nenhum'}">${ANG[d.angulo] || ''}</span></div></div>
    <div class="dor" style="--o:${o}"><svg viewBox="0 0 112 112"><defs><linearGradient id="gdor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7BF0B0"/><stop offset="1" stop-color="#14A35A"/></linearGradient></defs><circle class="b" cx="56" cy="56" r="50"/><circle class="f" cx="56" cy="56" r="50"/></svg><div class="n"><div><b>${d.nota_dor ?? '–'}</b><span>potencial</span></div></div></div></header>
  <section class="liz"><img src="img/liz_rosto_3d.png" alt="Liz"><div><div class="t">${esc(d.motivo || 'A triagem não deixou motivo pra essa.')}</div><div class="prova"><div class="m">O que eu já sei</div>Li só a ficha do Google. O Raio-X lê o site, as fotos e as avaliações e escreve a abordagem.</div></div></section>
  <section class="grid"><article class="bl"><div class="bl-h"><div class="ico ct">${IC.ct}</div><div><b>Contato</b><small>do Google e do site</small></div></div><div class="rows">
    ${linha(e.nota, 'Google', e.nota ? `${String(e.nota).replace('.', ',')} ★ · ${e.total_avaliacoes} avaliações` : 'sem nota')}
    ${linha(e.telefone, 'Telefone', e.telefone ? `<a href="tel:${esc(e.telefone.replace(/[^\d+]/g, ''))}">${esc(e.telefone)}</a>` : 'não tem')}
    ${linha(e.site, 'Site', e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener">${esc(e.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : 'não tem')}
    ${linha(e.instagram, 'Instagram', e.instagram ? `<a href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener">@${esc(e.instagram)}</a>` : 'não achei')}
    ${e.email ? linha(1, 'E-mail', `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>`) : ''}</div>
    ${e.google_maps_url ? `<div class="bl-f"><span>Fonte: Google Maps</span><a class="lnk" href="${esc(e.google_maps_url)}" target="_blank" rel="noopener">Abrir no Maps${IC.ext}</a></div>` : ''}</article></section>
  <section class="ab"><div class="msg"><div class="h">Primeira mensagem</div><p>${esc(saudacaoTxt())}</p></div><div class="decd" id="decd"></div></section>
  <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  desenharDecisao(d)
  if (empilhar) empilha('cap')
  $('capX').onclick = fecharCapivara
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
}
async function fazerUma(d) {
  await sb.from('diagnosticos').update({ status: 'na_fila' }).eq('id', d.id)
  await sb.from('buscas').update({ status: 'diagnosticando', terminada_em: null }).eq('id', busca.id)
  sb.functions.invoke('diagnosticar', { body: { diagnostico_id: d.id } })
  d.status = 'na_fila'; busca.status = 'diagnosticando'; vivo(true, 'Liz trabalhando'); acompanhar()
}
const esperando = new Set()
async function esperarCapivara(id) {
  if (esperando.has(id)) return
  esperando.add(id)
  for (let i = 0; i < 45; i++) {
    await espera(4000)
    const { data } = await sb.from('diagnosticos').select(SEL_SEQ).eq('id', id).single()
    if (!data || (data.status !== 'pronto' && data.status !== 'erro')) continue
    const k = seq.findIndex(x => x.id === id); if (k >= 0) seq[k] = data
    if ($('cap').dataset.seq && seq[pos]?.id === id) { const y = 0; await mostrarSeq(); $('cap').scrollTop = y }
    break
  }
  esperando.delete(id)
}

/* ======================= histórico ======================= */
async function carregarHist() {
  const { data } = await sb.from('buscas').select('id, cidade, nicho, status, olhadas, com_dor, criada_em').order('criada_em', { ascending: false }).limit(30)
  $('hist').innerHTML = (data || []).length ? data.map(b => `<div class="hi" data-id="${b.id}"><b>${esc(b.cidade === 'Lista' ? 'Lista · ' + b.nicho : b.nicho + ' · ' + b.cidade.split(',')[0])}</b><small>${new Date(b.criada_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${b.olhadas} olhadas · ${{ pronta: 'pronta', erro: 'deu erro' }[b.status] || 'em andamento'}</small></div>`).join('') : '<div class="vazio">Nenhuma busca ainda.</div>'
  $('hist').insertAdjacentHTML('beforeend', `<button class="sair so-cel" id="bSair2">Sair da conta (${esc(usuario?.email || '')})</button>`)
  $('bSair2').onclick = async () => { await sb.auth.signOut(); location.reload() }
  $('hist').querySelectorAll('.hi').forEach(el => el.onclick = () => abrirBusca(data.find(b => b.id === el.dataset.id)))
}
$('histX').hidden = false
$('histX').onclick = () => { if (history.state?.camada === 'hist') history.back(); else $('hist').classList.remove('on') }
$('bHist').onclick = e => { e.stopPropagation(); const on = !$('hist').classList.contains('on'); $('hist').classList.toggle('on', on); if (on && mob()) empilha('hist') }
document.addEventListener('click', e => { if (!e.target.closest('#hist,#bHist')) $('hist').classList.remove('on') })
// Início: de qualquer tela, fecha tudo o que estiver aberto e volta pra home. A busca segue salva no Histórico.
$('bNova').onclick = () => {
  clearInterval(poll); clearInterval(convTimer); clearInterval(dispTimer); clearInterval(window.__cnTimer)
  $('hist').classList.remove('on'); $('capO').classList.remove('on'); $('cap').classList.remove('on')
  if (!$('indO').hidden) fecharIndicar()
  if (history.state?.camada) history.replaceState(null, '')
  $('fname').textContent = ''; vivo(false, 'Liz parada')
  pergunta(1)
}
$('bMais').onclick = () => $('bNova').click()
// Início é Início: painel que ainda estava carregando não abre por cima da home depois do clique
let inicioEm = 0, ultimoClique = 0
document.addEventListener('click', e => { if (e.target.closest('#bNova,#bMais')) inicioEm = Date.now(); else ultimoClique = Date.now() }, true)
new MutationObserver(() => { if ($('cap').classList.contains('on') && !$('ask').hidden && inicioEm && ultimoClique < inicioEm) { $('cap').classList.remove('on'); $('capO').classList.remove('on') } }).observe($('cap'), { attributes: true, attributeFilter: ['class'] })
// marca no menu onde a pessoa está
const marcarNav = () => {
  const aberto = $('cap').classList.contains('on'), t = aberto ? $('cap').querySelector('.cap-x .t')?.textContent : ''
  $('bCapt').classList.toggle('on', t === 'Pipeline'); $('bConv').classList.toggle('on', t === 'Conversas'); $('bHist').classList.toggle('on', $('hist').classList.contains('on'))
}
new MutationObserver(marcarNav).observe($('cap'), { childList: true, attributes: true, attributeFilter: ['class'] })
new MutationObserver(marcarNav).observe($('hist'), { attributes: true, attributeFilter: ['class'] })
async function abrirBusca(b, soLista = false) {
  if (history.state?.camada === 'hist') history.replaceState(null, '')
  $('hist').classList.remove('on'); $('ask').hidden = true; document.body.classList.remove('fora'); fecharCapivara()
  vistos.clear(); montarCanvas({ ...b }, false); busca = { ...b }
  ;(await sb.from('diagnosticos').select('id').eq('busca_id', b.id).eq('status', 'pronto')).data?.forEach(x => vistos.add(x.id))
  vivo(b.status !== 'pronta' && b.status !== 'erro', b.status === 'pronta' ? 'Liz parada' : 'Liz trabalhando')
  acompanhar()
  // busca sem nenhum Raio-X abre direto como lista
  const { data: comRx } = soLista ? { data: [] } : await sb.from('diagnosticos').select('id').eq('busca_id', b.id).neq('capivara', '{}').limit(1)
  if (!(comRx || []).length) abrirListaHome()
}

/* ======================= barra de comando ======================= */
function comando(t) {
  const s = t.trim(); if (!s) return
  const m = s.match(/^(?:quero\s+|procura\s+|busca\s+)?(?:mais\s+(\d+)\s+)?(.+?)\s+(?:em|no|na)\s+(.+)$/i)
  if (m) { clearInterval(poll); fecharCapivara(); vistos.clear(); const q = m[1] ? Math.min(120, +m[1]) : 60; esc_ = { cidade: m[3].replace(/[?.!]$/, ''), nicho: m[2].charAt(0).toUpperCase() + m[2].slice(1) }; liz(`Bora: ${m[1] ? 'mais ' + q + ' ' : ''}${esc(esc_.nicho)} em ${esc(esc_.cidade)}.`); rodarBusca(esc_.cidade, esc_.nicho, false, q, !!m[1]); return }
  if (/lista|planilha|excel|csv/i.test(s)) { pergunta(1); setTimeout(() => $('arq').click(), 300); return }
  liz('Por enquanto eu entendo pedido assim: <b>padaria em Santos</b>, <b>mais 12 padaria em Santos</b>, ou "sobe uma lista". O resto eu aprendo em breve.')
}
$('inp').onkeydown = e => { if (e.key === 'Enter') { comando($('inp').value); $('inp').value = '' } }
$('bEnv').onclick = () => { comando($('inp').value); $('inp').value = '' }

let eraCelular = mob()
addEventListener('resize', () => { if (mob() === eraCelular) return; eraCelular = mob(); if (busca && $('n_olhadas')) { const st = { ...busca }; const d = diags; montarCanvas(st, false); busca = st; diags = d; atualizarFunil(); desenharCards() } })
sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') location.reload() })
/* ======================= perfil: meu uso e, pro gestor, a prospecção inteira ======================= */
const PLANO_TXT = { free: ['Free', 'testando'], mes_gratis: ['Mês grátis', 'ganho por indicação'], pagante: ['Pagante', 'cliente'], cancelou: ['Cancelado', ''] }
async function abrirPerfil(empilhar = true) {
  const ini = new Date(); ini.setDate(1); ini.setHours(0, 0, 0, 0); const desde = ini.toISOString()
  const [uso, bus, pl, gest] = await Promise.all([
    sb.from('uso_ia').select('etapa, custo_usd').gte('criado_em', desde),
    sb.from('buscas').select('id', { count: 'exact', head: true }).gte('criada_em', desde),
    sb.from('assinatura').select('plano, plano_id, meses_gratis').maybeSingle(),
    sb.rpc('sou_gestor'),
  ])
  const u = uso.data || [], gasto = u.reduce((t, x) => t + Number(x.custo_usd || 0), 0)
  const plano = pl.data?.plano || 'free', mg = pl.data?.meses_gratis || 0
  const g = gest.data ? (await sb.rpc('resumo_gestor')).data : null
  const avisos = gest.data ? ((await sb.rpc('avisos_gestor')).data || []) : []
  await carregarSaldo()
  const movs = SALDO.isento ? [] : ((await sb.from('movimento_saldo').select('centavos, tipo, descricao, criado_em').order('criado_em', { ascending: false }).limit(6)).data || [])
  const nome = usuario?.user_metadata?.full_name || usuario?.email || ''
  const mes = new Date().toLocaleDateString('pt-BR', { month: 'long' })
  const card = (v, k, s = '') => `<div class="pf-c"><b>${v}</b><span>${k}</span>${s ? `<small>${s}</small>` : ''}</div>`
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Meu perfil</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b pf">
    <header class="pf-h">${$('av').hidden ? `<span class="pf-av">${esc(nome.charAt(0).toUpperCase())}</span>` : `<img class="pf-av" src="${esc($('av').src)}" alt="" referrerpolicy="no-referrer">`}
      <div><h2>${esc(nome)}</h2><small>${esc(usuario?.email || '')}</small></div><span class="pf-pl p-${plano}">${PLANO_TXT[plano][0]}${mg ? ` · ${mg} mês${mg === 1 ? '' : 'es'} grátis` : ''}</span></header>
    ${(!SALDO.isento && pl.data?.plano !== 'pagante') ? `<div class="pf-t">Virar cliente</div>
    <div class="pf-pl2"><button class="btn ok" data-assinar="comeco">Assinar Começo · R$ 147/mês</button><button class="btn line" data-assinar="escala">Assinar Escala · R$ 340/mês</button></div>
    <p class="pf-pl2n">Pagamento seguro no Mercado Pago. Cobra todo mês, cancela quando quiser. ${BTN_COMO}</p>` : ''}
    <div class="pf-sd"><div><small>Seu saldo dá pra</small><b>${SALDO.isento ? 'usar à vontade' : `${rende().listas} listas simples`}</b><span>${SALDO.isento ? 'Conta isenta: nada é descontado.' : `até ${emp(rende().listas)} empresas, ou ${rende().avulsos} empresas com Raio-X · saldo ${brlC(SALDO.saldo)}`}</span></div>${BTN_COMO}</div>
    ${movs.length ? `<div class="pf-mv">${movs.map(m => `<div><span>${esc(m.descricao || m.tipo)}</span><small>${new Date(m.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</small><b class="${m.centavos < 0 ? 'neg' : 'pos'}">${m.centavos < 0 ? '−' : '+'} ${brlC(Math.abs(m.centavos))}</b></div>`).join('')}</div>` : ''}
    <div class="pf-t">Meu uso em ${mes}</div>
    <div class="pf-g">${card(bus.count || 0, 'buscas')}${card(u.filter(x => x.etapa === 'diagnostico').length, 'Raio-X')}${card(reais(gasto), 'gasto de IA', 'câmbio do dia')}</div>
    <div class="pf-ac">
      <button class="pfx wapp" id="pfWapp"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.3-.2.6-.1l1.9.9c.3.1.5.2.5.4.1.2.1.9-.1 1.5Z"/></svg></span>Conectar WhatsApp</button>
      <button class="pfx robo" id="pfRobo"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="7" width="16" height="12" rx="3"/><circle cx="9" cy="13" r="1.5" fill="#fff"/><circle cx="15" cy="13" r="1.5" fill="#fff"/><path d="M12 3v4M8 19v2M16 19v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>Robô de atendimento</button>
      <button class="pfx disp" id="pfDisp"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg></span>Disparo automático</button>
      <button class="pfx conv" id="pfConv"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4V5a1 1 0 0 1 1-1z"/></svg></span>Conversas</button>
      <button class="pfx indi" id="pfInd"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-2.2a3 3 0 1 0-5.8-1 3 3 0 1 0-5.8 1H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1ZM4 12v7a1 1 0 0 0 1 1h6v-8H4Zm9 8h6a1 1 0 0 0 1-1v-7h-7v8Z"/></svg></span>Indicar e ganhar 1 mês</button>
      <button class="pfx pipe" id="pfPipe"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="5" height="16" rx="1.2"/><rect x="9.5" y="4" width="5" height="11" rx="1.2"/><rect x="16" y="4" width="5" height="14" rx="1.2"/></svg></span>Ver meu pipeline</button>
    </div>
    ${g ? `<div class="pf-t">Gestão da prospecção · ${mes}</div>
    <div class="pf-g">${card(g.contas, 'contas', `${g.novas_mes} nova${g.novas_mes === 1 ? '' : 's'} no mês`)}${card(g.ativas_mes, 'ativas no mês', 'fizeram busca')}${card(g.pagantes, 'pagantes', `${g.mes_gratis} em mês grátis`)}${card(reais(Number(g.custo_usd_mes)), 'gasto total de IA', `${g.buscas_mes} busca${g.buscas_mes === 1 ? '' : 's'} · ${g.raiox_mes} Raio-X`)}</div>
    ${g.pedidos ? `<div class="pf-al">${g.pedidos} pessoa${g.pedidos === 1 ? '' : 's'} pediu acesso por indicação e está esperando.</div>` : ''}
    ${avisos.length ? avisos.map(av => `<div class="pf-aviso" data-av="${av.id}"><div>${IC.at}<span>${esc(av.texto)}</span></div><div class="pf-aviso-ac"><button class="btn line sm" data-teto>Soltar +R$ 100 de teto</button><button class="btn ghost sm" data-tirafree>Tirar Free do site</button><button class="btn ghost sm" data-visto>Ok, vi</button></div></div>`).join('') : ''}
    <div class="pf-free"><div class="pf-free-h"><span>Gasto com contas Free no mês</span><b>${brlC(g.custo_free_centavos || 0)} <i>de ${brlC(g.teto_free_centavos || 0)}</i></b></div><div class="pf-free-b"><em style="width:${Math.min(100, (g.custo_free_centavos || 0) / (g.teto_free_centavos || 1) * 100)}%"></em></div>${(g.custo_free_centavos || 0) >= (g.teto_free_centavos || 0) ? '<small class="neg">Teto atingido: contas Free pausadas até virar o mês.</small>' : ''}</div>
    <a class="btn go pf-crm" href="https://crm.kompila.com.br/kompila/prospeccao" target="_blank" rel="noopener">Abrir o controle completo no CRM</a>` : ''}
    <button class="pf-sair" id="pfSair">Sair da conta</button>
    <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  $('capX').onclick = fecharCapivara
  $('pfWapp').onclick = () => abrirConectar()
  $('pfRobo').onclick = () => abrirAtendimento()
  $('pfDisp').onclick = () => abrirDisparo()
  $('pfConv').onclick = () => abrirConversas()
  $('pfInd').onclick = () => abrirIndicar().catch(e => liz(esc(e.message)))
  $('pfPipe').onclick = () => abrirCaptacao()
  $('pfSair').onclick = async () => { await sb.auth.signOut(); location.reload() }
  $('cap').querySelectorAll('[data-assinar]').forEach(b => b.onclick = () => abrirPagamento(b.dataset.assinar))
  $('cap').querySelectorAll('.pf-aviso').forEach(el => {
    const id = el.dataset.av
    el.querySelector('[data-teto]').onclick = async () => { await sb.rpc('gestor_config', { p_chave: 'teto_free', p_centavos: (g.teto_free_centavos || 0) + 10000 }); await sb.rpc('aviso_visto', { p_id: id }); liz('Teto solto. Free volta a aceitar novos.'); abrirPerfil(false) }
    el.querySelector('[data-tirafree]').onclick = async () => { await sb.rpc('gestor_config', { p_chave: 'free_no_site', p_centavos: 0 }); await sb.rpc('aviso_visto', { p_id: id }); liz('Tirei o Free do site. Só planos pagos aparecem.'); abrirPerfil(false) }
    el.querySelector('[data-visto]').onclick = async () => { await sb.rpc('aviso_visto', { p_id: id }); abrirPerfil(false) }
  })
  if (empilhar) empilha('perfil')
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
}

/* ======================= conectar WhatsApp (QR pelo app) ======================= */
async function abrirConectar() {
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Conectar WhatsApp</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b cn">
    <p class="cn-int">Conecte o número que vai <b>disparar e conversar</b>. Use um chip dedicado, nunca seu WhatsApp pessoal.</p>
    <div class="cn-box" id="cnBox"><button class="btn go" id="cnGerar">Gerar QR Code</button></div>
    <ol class="cn-passos"><li>No celular do chip, abra o WhatsApp</li><li>Toque em <b>Aparelhos conectados</b></li><li><b>Conectar um aparelho</b></li><li>Aponte a câmera pro QR aqui</li></ol>
    <p class="cn-alerta">Conectar um número novo <b>desconecta</b> o que estiver ligado agora.</p>
  </div>`
  $('capX').onclick = () => { if (window.__cnTimer) { clearInterval(window.__cnTimer); window.__cnTimer = null } abrirPerfil(false) }
  const box = () => $('cap').querySelector('#cnBox')
  const parar = () => { if (window.__cnTimer) { clearInterval(window.__cnTimer); window.__cnTimer = null } }
  const poll = async () => {
    const cap = $('cap'); if (!cap.classList.contains('on') || !cap.querySelector('.cn')) { parar(); return }
    const { data, error } = await sb.functions.invoke('conectar', { body: { acao: 'estado' } })
    if (!box()) return
    if (error || !data) { parar(); botaoGerar(); return liz('Não consegui confirmar a conexão. Tente de novo.') }
    if (data.status === 'WORKING') {
      parar()
      mostrarConectado(data.numero)
      liz('WhatsApp conectado. Pode disparar e conversar por esse número.')
      return
    }
    if (data.qr) box().innerHTML = `<img class="cn-qr" src="${data.qr}" alt="QR Code"><span class="cn-esc">Deixe aberto e escaneie no celular</span>`
    else box().innerHTML = `<div class="cn-wait">Preparando o QR...</div>`
  }
  const botaoGerar = () => { box().innerHTML = `<button class="btn go" id="cnGerar">Gerar QR Code</button>`; $('cnGerar').onclick = () => gerar() }
  // já conectado: mostra o número. Trocar exige 2 toques porque derruba o número atual.
  const mostrarConectado = (numero) => {
    box().innerHTML = `<div class="cn-ok"><div class="cn-check">✓</div><b>Conectado</b><span>${numero ? esc(tfmt(numero)) : ''}</span></div><button class="btn" id="cnTrocar">Trocar número</button>`
    const b = $('cnTrocar'); let armado = false
    b.onclick = () => { if (armado) return gerar(true); armado = true; b.textContent = 'Toque de novo para desconectar este número' }
  }
  const gerar = async (trocar = false) => {
    box().innerHTML = `<div class="cn-wait">Preparando o QR...</div>`
    const { data, error } = await sb.functions.invoke('conectar', { body: { acao: 'iniciar', trocar } })
    if (error || data?.erro) { botaoGerar(); return liz(esc(data?.erro || 'Não consegui iniciar a conexão.')) }
    parar(); window.__cnTimer = setInterval(poll, 2500); poll()
  }
  $('cnGerar').onclick = () => gerar()
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
  // ao abrir, confere antes: quem já está conectado não vê "Gerar QR" (que derrubaria o número)
  const { data: atual } = await sb.functions.invoke('conectar', { body: { acao: 'estado' } })
  if (box() && atual?.status === 'WORKING') mostrarConectado(atual.numero)
}

/* ======================= robô de atendimento (config do dono) ======================= */
async function abrirAtendimento() {
  const { data: canal } = await sb.from('canal_whatsapp').select('sessao, saudacao, instrucoes, atende, portes, segmentos').maybeSingle()
  const pt = (canal && canal.portes) || {}, sg = (canal && canal.segmentos) || {}
  const segTxt = Object.entries(sg).map(([k, v]) => `${k}: ${v}`).join('\n')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Robô de atendimento</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b at">
    ${!canal ? `<p class="at-vazio">Conecte um WhatsApp primeiro (botão Conectar WhatsApp), aí você configura o robô aqui.</p>` : `
    <label class="at-l">Saudação <span>a primeira mensagem do disparo</span></label>
    <input class="at-in" id="atSaud" placeholder="Olá, {saudacao}, tudo bem?" value="${esc(canal.saudacao || '')}" autocomplete="off">
    <small class="at-hint">Escreva <b>{saudacao}</b> onde quiser que vire bom dia / boa tarde / boa noite pela hora.</small>
    <label class="at-l">Como o robô vende <span>o negócio, o que vende, o tom, quando passar pra equipe</span></label>
    <textarea class="at-tx" id="atInstr" placeholder="Ex: Somos a Ótica Brasil...">${esc(canal.instrucoes || '')}</textarea>
    <label class="at-l">Abordagem por porte <span>o tom pra cada tamanho de empresa</span></label>
    <textarea class="at-pt" id="atPp" placeholder="Pequeno: leve e rápido, qualifica em uma pergunta">${esc(pt.pequeno || '')}</textarea>
    <textarea class="at-pt" id="atPm" placeholder="Médio: confiante, mostra como escala a operação">${esc(pt.medio || '')}</textarea>
    <textarea class="at-pt" id="atPg" placeholder="Grande: formal e consultivo, trata como decisão estratégica">${esc(pt.grande || '')}</textarea>
    <label class="at-l">Ganchos por segmento <span>um por linha: setor: gancho</span></label>
    <textarea class="at-tx" id="atSeg" placeholder="padaria: fala da fila e do pedido pelo WhatsApp&#10;contabilidade: fala do tempo gasto com documento e cobrança">${esc(segTxt)}</textarea>
    <label class="at-toggle"><input type="checkbox" id="atLiga" ${canal.atende ? 'checked' : ''}><span>Robô responde sozinho quando o lead responder</span></label>
    <button class="btn go" id="atSalvar">Salvar</button>
    <p class="at-aviso">Com o robô ligado, ele responde os leads no seu número sem você. Deixe desligado até testar.</p>`}
  </div>`
  $('capX').onclick = () => abrirPerfil(false)
  if (canal) $('atSalvar').onclick = async () => {
    const saudacao = $('atSaud').value.trim(), instrucoes = $('atInstr').value.trim(), atende = $('atLiga').checked
    const portes = { pequeno: $('atPp').value.trim(), medio: $('atPm').value.trim(), grande: $('atPg').value.trim() }
    const segmentos = {}
    $('atSeg').value.split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) { const k = l.slice(0, i).trim().toLowerCase(), v = l.slice(i + 1).trim(); if (k && v) segmentos[k] = v } })
    const b = $('atSalvar'); b.disabled = true
    saudacaoDono = saudacao || ''
    const { error } = await sb.from('canal_whatsapp').update({ saudacao: saudacao || null, instrucoes: instrucoes || null, atende, portes, segmentos }).eq('sessao', canal.sessao)
    b.disabled = false
    if (error) return liz('Não consegui salvar.')
    liz(atende ? 'Salvo. Robô ligado: ele responde os leads.' : 'Salvo. Robô desligado por enquanto.')
  }
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
}
;['av', 'avL'].forEach(id => { $(id).style.cursor = 'pointer'; $(id).onclick = () => abrirPerfil() })
;$('bAjustes').onclick = () => abrirPerfil()

/* ======================= checkout transparente (cartão na tela, Mercado Pago) ======================= */
const VALORP = { comeco: 147, escala: 340 }
let mpInstance = null, payBrick = null, payPlano = null
async function abrirPagamento(plano) {
  if (!VALORP[plano]) return
  payPlano = plano
  $('payPlano').textContent = plano === 'comeco' ? 'Plano Começo' : 'Plano Escala'
  $('payTit').textContent = `R$ ${VALORP[plano]}/mês`
  $('payErr').textContent = ''
  $('payBrick').innerHTML = '<div class="pay-load">Abrindo o pagamento seguro…</div>'
  $('pagar').hidden = false
  let pub = null
  try { const { data } = await sb.functions.invoke('mp_assinar', { body: { pubkey: true } }); pub = data?.public_key } catch (_) {}
  if (!pub || typeof MercadoPago === 'undefined') { $('payBrick').innerHTML = ''; $('payErr').textContent = 'Formulário indisponível agora. Use o botão abaixo pra pagar no Mercado Pago.'; return }
  try {
    if (!mpInstance) mpInstance = new MercadoPago(pub, { locale: 'pt-BR' })
    if (payBrick) { try { payBrick.unmount() } catch (_) {} payBrick = null }
    $('payBrick').innerHTML = ''
    payBrick = await mpInstance.bricks().create('cardPayment', 'payBrick', {
      initialization: { amount: VALORP[plano], payer: { email: usuario?.email || '' } },
      customization: { paymentMethods: { maxInstallments: 1 }, visual: { hideFormTitle: true, style: { customVariables: { baseColor: '#12803F', formBackgroundColor: '#ffffff', borderRadiusMedium: '10px', borderRadiusLarge: '12px' } } } },
      callbacks: {
        onReady: () => {},
        onError: () => { $('payErr').textContent = 'Deu um problema no formulário do cartão. Tenta de novo.' },
        onSubmit: async (formData) => {
          $('payErr').textContent = 'Processando o pagamento…'
          try {
            const { data, error } = await sb.functions.invoke('mp_assinar', { body: { plano, card_token: formData.token, payer_email: formData.payer?.email } })
            if (error || !data?.ok) throw new Error(data?.erro || 'Não consegui cobrar o cartão. Confere os dados.')
            $('pagar').hidden = true
            liz(data.status === 'authorized' ? 'Assinatura ativa! Já pode usar à vontade.' : 'Pagamento em análise. Assim que aprovar, seu plano libera.')
            abrirPerfil(false)
          } catch (e) { $('payErr').textContent = e.message }
        },
      },
    })
  } catch (_) { $('payBrick').innerHTML = ''; $('payErr').textContent = 'Formulário indisponível agora. Use o botão abaixo pra pagar no Mercado Pago.' }
}
async function redirecionarPagamento() {
  if (!payPlano) return
  $('payErr').textContent = 'Abrindo o Mercado Pago…'
  try { const { data, error } = await sb.functions.invoke('mp_assinar', { body: { plano: payPlano } }); if (error || !data?.init_point) throw new Error(data?.erro || 'Não consegui abrir agora.'); location.href = data.init_point }
  catch (e) { $('payErr').textContent = e.message }
}
$('payX').onclick = () => { $('pagar').hidden = true; if (payBrick) { try { payBrick.unmount() } catch (_) {} payBrick = null } }
$('payRedir').onclick = redirecionarPagamento

/* ======================= indicar: 1 mês grátis quando o indicado vira cliente ======================= */
const SITE = 'https://kompila.com.br/prospeccao/'
const ST_IND = { pediu_acesso: ['Pediu acesso', ''], entrou: ['Entrou', 'en'], pagou: ['Virou cliente · 1 mês grátis pra você', 'ok'] }
async function meuCodigo() {
  const { data } = await sb.from('indicador').select('codigo').maybeSingle()
  if (data) return data.codigo
  const nome = (usuario?.user_metadata?.full_name || usuario?.email || '').trim()
  const base = nome.split(/[\s@.]/)[0].normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10) || 'kp'
  for (let i = 0; i < 4; i++) {
    const codigo = base + Math.random().toString(36).slice(2, 6)
    const { error } = await sb.from('indicador').insert({ codigo, nome })
    if (!error) return codigo
  }
  throw new Error('Não consegui criar o seu link agora.')
}
async function abrirIndicar(empilhar = true) {
  const codigo = await meuCodigo(), link = SITE + '?ind=' + codigo
  const { data } = await sb.from('indicacao').select('nome, empresa, status, criado_em').order('criado_em', { ascending: false })
  const lst = data || [], ganhos = lst.filter(x => x.status === 'pagou').length
  const texto = `Tô usando a prospecção da Kompila: ela acha empresas da cidade, lê Google e site de cada uma e já entrega quem vale abordar. Pede acesso por aqui: ${link}`
  $('indB').innerHTML = `<div class="ind-k">[ LIZ ]</div>
    <h2>Conhece alguém que vive atrás de cliente? Me apresenta.</h2>
    <p>Quando a pessoa que você indicar virar cliente, você ganha <b>1 mês grátis</b> da prospecção.</p>
    <div class="ind-l"><span>${esc(link.replace('https://', ''))}</span><button class="btn go sm" id="indCp">Copiar</button></div>
    <a class="btn ok ind-w" href="https://wa.me/?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">Mandar no WhatsApp</a>
    <div class="ind-h"><b>Suas indicações</b><span>${lst.length}${ganhos ? ` · ${ganhos} mês${ganhos === 1 ? '' : 'es'} grátis` : ''}</span></div>
    ${lst.length ? `<div class="ind-lst">${lst.map(x => `<div><span><b>${esc(x.nome)}</b>${x.empresa ? ' · ' + esc(x.empresa) : ''}</span><i class="${ST_IND[x.status]?.[1] || ''}">${ST_IND[x.status]?.[0] || ''}</i></div>`).join('')}</div>` : '<div class="ind-v">Ninguém ainda. Quem pedir acesso pelo seu link aparece aqui.</div>'}`
  $('indCp').onclick = async () => { try { await navigator.clipboard.writeText(link); $('indCp').textContent = '✓ Copiado' } catch { liz('Não consegui copiar. Segura o dedo no link.') } }
  $('indO').hidden = false; requestAnimationFrame(() => $('indO').classList.add('on'))
  if (empilhar) empilha('ind')
}
function fecharIndicar() { $('indO').classList.remove('on'); setTimeout(() => $('indO').hidden = true, 300) }
$('bInd').onclick = () => abrirIndicar().catch(e => liz(esc(e.message)))
$('indX').onclick = () => history.state?.camada === 'ind' ? history.back() : fecharIndicar()
$('indO').onclick = e => { if (e.target === $('indO')) $('indX').onclick() }

/* ======================= carregando: a Liz avisa enquanto busca ======================= */
let cargas = 0, cargaT
function carregando(on, tx) {
  cargas = Math.max(0, cargas + (on ? 1 : -1)); clearTimeout(cargaT)
  if (!cargas) return $('carga').hidden = true
  if (tx) $('cargaTx').textContent = tx
  cargaT = setTimeout(() => { if (cargas) $('carga').hidden = false }, 180) // carga rápida não pisca
}
const comCarga = (f, tx) => async (...a) => { carregando(true, tx); try { return await f(...a) } finally { carregando(false) } }
abrirSeq = comCarga(abrirSeq, 'Aguarde, estou abrindo a empresa.')
abrirCaptacao = comCarga(abrirCaptacao, 'Aguarde, estou carregando o seu pipeline.')
abrirLista = comCarga(abrirLista, 'Aguarde, estou carregando os resultados.')
abrirFila = comCarga(abrirFila, 'Aguarde, estou montando a fila de envio.')
abrirIndicar = comCarga(abrirIndicar, 'Aguarde, estou buscando o seu link.')
abrirPerfil = comCarga(abrirPerfil, 'Aguarde, estou somando os números.')
abrirBusca = comCarga(abrirBusca, 'Aguarde, estou carregando os resultados.')
iniciar = comCarga(iniciar, 'Aguarde, estou abrindo a prospecção.')
iniciar()
