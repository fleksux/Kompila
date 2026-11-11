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
// saldo do cliente em reais (preços na tabela preco; busca R$ 2,50 desde 05/11/2026)
let SALDO = { isento: false, saldo: 0, busca: 50, raiox: 50 }
const brlC = c => 'R$ ' + (c / 100).toFixed(2).replace('.', ',')
const custoRaiox = () => ''   // 01/11 (Alex): a tela mostra o que dá pra fazer, não o preço; o preço fica no "?"
// quanto o saldo rende: listas simples ou Raio-X (na busca nova, 1 lista + o resto em Raio-X)
const rende = (c = SALDO.saldo) => ({ listas: Math.floor(c / SALDO.busca), raiox: Math.max(0, Math.floor((c - SALDO.busca) / SALDO.raiox)), avulsos: Math.floor(c / SALDO.raiox) })
const emp = n => (n * 60).toLocaleString('pt-BR')   // cada lista simples traz até 60 empresas
const BTN_COMO = '<button class="como" data-como title="Como funciona" aria-label="Como funciona">?</button>'
// IA de prospecção ativa: só no plano Escala. Quem não tem vê o convite em vez da tela.
async function comIA(abrir) {
  const { data: tem, error } = await sb.rpc('tenho_ia')
  if (error) return liz('Não consegui conferir seu plano. Tenta de novo.')
  if (tem) return abrir()
  const { data: ass } = await sb.from('assinatura').select('plano').maybeSingle()
  const jaPaga = ass?.plano === 'pagante'
  $('indB').innerHTML = `<div class="ind-k">[ IA DE PROSPECÇÃO ATIVA ]</div><h2>Isso faz parte do plano Escala.</h2>
    <p>A Liz manda a primeira mensagem pelo seu WhatsApp, responde quem chamar e tenta marcar a reunião. Plano Escala: <b>R$ 578/mês</b>.</p>
    ${jaPaga ? '<p>Pra mudar do Começo pro Escala, fale com a Kompila. Assim você não paga dois planos ao mesmo tempo.</p>' : '<button class="btn ok" id="iaAssinar" style="width:100%">Assinar Escala · R$ 578/mês</button>'}`
  $('indO').hidden = false; requestAnimationFrame(() => $('indO').classList.add('on'))
  if ($('iaAssinar')) $('iaAssinar').onclick = () => { fecharIndicar(); abrirPagamento('escala') }
}
function comoFunciona() {
  const ini = 500, r0 = rende(ini)
  $('indB').innerHTML = `<div class="ind-k">[ COMO FUNCIONA ]</div><h2>Você paga só pelo que usa.</h2>
    <div class="cf"><div><b>Lista simples</b><span>Até 60 empresas da cidade e do nicho, com tudo que o Google mostra: categoria, nota, telefone, site, endereço e horários.</span><em>${brlC(SALDO.busca)} por busca</em></div>
</div>
    <p>Conta nova ganha <b>${brlC(ini)}</b> pra testar: dá pra ${r0.listas} listas simples (até ${emp(r0.listas)} empresas). Cada lista traz até 60 empresas; cidade pequena ou nicho raro pode trazer menos. Pesquisar de novo o que você já pesquisou não desconta nada. Quando o saldo acabar, a Kompila recarrega pra você.</p>
    ${SALDO.isento ? '<p><b>Sua conta é isenta:</b> usa à vontade, nada é descontado.</p>' : `<p>Seu saldo agora: <b>${brlC(SALDO.saldo)}</b>.</p>`}`
  $('indO').hidden = false; requestAnimationFrame(() => $('indO').classList.add('on'))
}
document.addEventListener('click', e => { if (e.target.closest('[data-como]')) { e.preventDefault(); e.stopPropagation(); comoFunciona() } }, true)
async function boasVindas() {
  if (SALDO.isento) return
  const { count } = await sb.from('buscas').select('id', { count: 'exact', head: true })
  if (count) return
  const r0 = rende()
  setTimeout(() => liz(`Bem-vindo! Faça suas primeiras <b>${r0.listas} listas simples (até ${emp(r0.listas)} empresas)</b> por nossa conta. ${BTN_COMO}`, 12000), 1500)
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
    <div class="fld"><input type="text" id="aq" placeholder="${q.ph}" autocomplete="off"><button class="btn go lg" id="ab">${q.bt}</button></div>
    <div class="err" id="ae"></div><div class="sg">${q.sg.map(x => `<button>${x}</button>`).join('')}</div>
    ${passo === 2 ? `<div class="mds-s" id="mdS">${saldoDepois()}</div>` : ''}
    ${passo === 1 ? `<div class="ou">ou</div><div class="drop" id="drop"><div class="di">${IC.arq}</div><div><b>Sobe uma lista</b><small>Excel ou CSV com empresa, site ou cidade. Conta pessoal eu descarto.</small></div></div>` : ''}`
  const aq = $('aq'); if (!mob()) aq.focus()
  const vai = v => {
    v = (v || '').trim()
    if (!v) { $('ae').textContent = passo === 1 ? 'Me fala uma cidade pra eu começar.' : 'Me fala um nicho pra eu começar.'; aq.focus(); return }
    if (passo === 1) { esc_.cidade = cid.find(c => c.toLowerCase().startsWith(v.toLowerCase())) || v; pergunta(2) }
    else { esc_.nicho = v.charAt(0).toUpperCase() + v.slice(1); fecharPergunta(); rodarBusca(esc_.cidade, esc_.nicho, 'lista') }
  }
  $('ab').onclick = () => vai(aq.value)
  aq.onkeydown = e => { if (e.key === 'Enter') vai(aq.value) }
  $('askc').querySelectorAll('.sg button').forEach(b => b.onclick = () => vai(b.textContent))
  if (false) $('askc').querySelectorAll('.md').forEach(b => b.onclick = () => { esc_.modo = b.dataset.m; $('askc').querySelectorAll('.md').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b) }); $('mdS').innerHTML = saldoDepois() })
  const dr = $('drop')
  if (dr) {
    dr.onclick = () => $('arq').click()
    dr.ondragover = e => { e.preventDefault(); dr.classList.add('on') }
    dr.ondragleave = () => dr.classList.remove('on')
    dr.ondrop = e => { e.preventDefault(); dr.classList.remove('on'); if (e.dataTransfer.files[0]) lerArquivo(e.dataTransfer.files[0]) }
  }
}
function saldoDepois() {
  if (SALDO.isento) return `Sua conta é isenta: usa à vontade. ${BTN_COMO}`
  const r0 = rende(), c = SALDO.busca
  const base = `Seu saldo dá pra <b>${r0.listas} lista${r0.listas === 1 ? '' : 's'} (até ${emp(r0.listas)} empresas)</b>. ${BTN_COMO}`
  return SALDO.saldo >= c ? base : `<span class="neg">Seu saldo não cobre essa opção.</span> ${base}`
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
      await abrirBusca(ja)
      liz(`Você já pesquisou <b>${esc(ja.nicho)} em ${esc(ja.cidade.split(',')[0])}</b> em ${new Date(ja.criada_em).toLocaleDateString('pt-BR')}. Abri o resultado, sem gastar nada. Quer empresas novas? Usa o <b>Encontrar mais</b>.`, 9000)
      return
    }
  }
  consultaAbre({ tipo: 'busca', t: `Procurando ${nicho} em ${cidade.split(',')[0]}`, s: 'Olhando o Google Maps. Leva menos de um minuto.' })
  montarCanvas({ cidade, nicho, status: 'buscando', olhadas: 0, novas: 0, com_dor: 0 }, true)
  vivo(true, 'Liz procurando')
  try {
    const b = await chamar('buscar', { cidade, nicho, quero })
    busca = { id: b.busca_id, cidade, nicho, status: 'peneirando', olhadas: b.olhadas, novas: b.novas, com_dor: 0 }
    atualizarFunil(); dizer(`Olhei ${b.olhadas} empresas. ${b.ja_tinha ? b.ja_tinha + ' você já tinha, então ' : ''}${b.novas} são novas${b.novas < quero ? (b.teto ? ` (você pediu ${quero}; parei aqui pra não gastar à toa, é só buscar de novo pra trazer mais)` : ` (você pediu ${quero}, mas a cidade não tem mais que isso nesse nicho)`) : ''}. Lendo as avaliações agora.`)
    if (!b.novas) return fim('Nenhuma empresa nova nessa busca. Tenta outro nicho ou outra cidade.')
    carregarSaldo()
    await peneirar(modo)
  } catch (e) { erro(e) }
}
async function rodarLista(nome, itens) {
  consultaAbre({ tipo: 'busca', t: `Lendo a lista ${nome}`, s: 'Procurando cada empresa no Google.' })
  montarCanvas({ cidade: 'Lista', nicho: nome, status: 'buscando', olhadas: itens.length, novas: 0, com_dor: 0 }, true)
  vivo(true, 'Liz procurando')
  try {
    const r = await chamar('importar', { nome_lista: nome, itens })
    busca = { id: r.busca_id, cidade: 'Lista', nicho: nome, status: 'peneirando', olhadas: r.na_lista, novas: r.achadas_no_google + r.so_pelo_site, com_dor: 0 }
    atualizarFunil(); dizer(`Achei ${r.achadas_no_google} no Google${r.so_pelo_site ? ` e ${r.so_pelo_site} só pelo site` : ''}.${r.nao_e_empresa ? ` ${r.nao_e_empresa} não parecem empresa.` : ''} Montando os Raio-X.`)
    carregarSaldo()
    await peneirar('lista')
  } catch (e) { erro(e) }
}
async function peneirar(modo) {
  if (LOAD.tipo === 'busca') consultaAbre({ tipo: 'busca', t: 'Organizando as empresas', s: `${busca.novas || busca.olhadas || 0} encontradas. Falta pouco.` })
  const a = await chamar('analisar', { busca_id: busca.id, modo })
  busca.com_dor = a.com_dor; atualizarFunil()
  // a lista traz só o que vem do Google Maps. Contato do site é no Enriquecer, quando a pessoa quiser.
  if (modo === 'lista') { fim(`Lista pronta: ${a.olhadas} empresas.`); await abrirListaHome(); return }
  if (!a.finalistas) return fim('Nenhuma empresa com potencial forte aqui. Bora outro nicho?')
  dizer(`${a.finalistas} empresas merecem Raio-X. Já estou montando, uma por uma.`)
  consultaAbre({ tipo: 'raiox', t: 'Montando os Raio-X', s: 'Leva 1 a 2 minutos. Pode continuar usando que eu aviso.', de: 0, ate: a.finalistas, sair: true })
  acompanhar()
}
function erro(e) { fimCarregando(); vivo(false, 'Liz parada'); liz(/saldo/i.test(e.message) ? esc(e.message) : `Travei aqui: ${esc(e.message)}`, 8000); if (busca) { busca.status = 'erro'; atualizarFunil() } }
function fim(t) { fimCarregando(); vivo(false, 'Liz parada'); dizer(t); carregarHist(); if (!$('lv').hidden) abrirListaHome() }

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
    if (LOAD.tipo === 'raiox') { const prontos = diags.filter(x => x.status === 'pronto').length; consultaAbre({ tipo: 'raiox', t: 'Montando os Raio-X', s: 'Leva 1 a 2 minutos. Pode continuar usando que eu aviso.', de: prontos, ate: Math.max(diags.length, prontos), sair: true }) }
    if (busca.status === 'pronta' || busca.status === 'erro') {
      clearInterval(poll)
      const n = diags.filter(x => x.status === 'pronto').length
      if (n) fim(`Pronto. ${n} Raio-X pra você olhar. ${mob() ? 'Toca' : 'Clica'} numa empresa pra abrir.`)
      else { fimCarregando(); vivo(false, 'Liz parada') }
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
  const n = e.target.dataset?.mais; if (!/^\d+$/.test(n || '') || !busca) return
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
  consultaAbre({ tipo: 'raiox', t: `Montando ${sem.length} Raio-X`, s: 'Eles rodam aos poucos, uns 6 por minuto. Pode continuar usando que eu aviso.', de: 0, ate: sem.length, sair: true })
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
  else if (c === 'ficha' && fichaAberta) abrirFichaMaps(fichaAberta, false)
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

/* ======================= popup de consulta ======================= */
const LOAD = { tipo: '', timer: null }
// tipo identifica quem abriu; aviso rápido (rapido=true) só aparece se demorar, pra não piscar na tela
function consultaAbre({ tipo = 'geral', t, s = '', de = null, ate = null, sair = false, rapido = false }) {
  clearTimeout(LOAD.timer); LOAD.tipo = tipo
  const mostra = () => {
    const o = $('loadO'), pct = ate ? Math.min(100, Math.round((de || 0) / ate * 100)) : null
    o.querySelector('.ld-t').textContent = t; o.querySelector('.ld-s').textContent = s
    o.querySelector('.ld-b').classList.toggle('sem', pct === null); o.querySelector('.ld-b i').style.width = pct === null ? '' : pct + '%'
    o.querySelector('.ld-n').textContent = ate ? `${de || 0} de ${ate}` : ''
    o.querySelector('.ld-x').hidden = !sair
    o.hidden = false
  }
  if (rapido) LOAD.timer = setTimeout(mostra, 250); else mostra()
}
function fimCarregando(tipo) { if (tipo && LOAD.tipo !== tipo) return; clearTimeout(LOAD.timer); LOAD.tipo = ''; $('loadO').hidden = true }
$('loadO').querySelector('.ld-x').onclick = () => fimCarregando()

/* ======================= enriquecer: dentro do card de cada empresa ======================= */
const enrBotao = (e) => e?.id ? `<button class="btn line sm" data-enr="${e.id}" aria-haspopup="dialog">Enriquecer</button>` : ''
// no Google muita empresa põe o Instagram no lugar do site: vira Instagram, não conta como site
const empNorm = e => {
  if (!e) return e
  const m = String(e.site || '').trim().match(/^(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/([A-Za-z0-9_.]+)/i)
  if (m && !['p', 'reel', 'reels', 'explore', 'stories'].includes(m[1].toLowerCase())) { if (!e.instagram) e.instagram = m[1].toLowerCase(); e.site = null }
  return e
}
const anoDe = d => String(d || '').slice(0, 4)
// no card: só porte, atividade, abertura e situação. CNPJ e nome da Receita não aparecem.
function enrDados(e) {
  if (!['confirmado', 'escolhido', 'provavel'].includes(e?.cnpj_status)) return ''
  const r = e.receita || {}, prov = e.cnpj_status === 'provavel', ruim = r.situacao && !/ativa/i.test(r.situacao)
  const linha = [r.porte, r.abertura ? 'desde ' + anoDe(r.abertura) : ''].filter(Boolean).map(esc).join(' · ')
  if (!linha && !r.atividade) return ''
  return `<div class="rc"><div class="rc-t"><b>Dados da empresa</b><span class="${prov ? 'rc-pv' : 'rc-ok'}">${prov ? 'Provável' : 'Confirmado'}</span></div>
    ${linha ? `<small>${linha}</small>` : ''}${r.atividade ? `<small>${esc(r.atividade)}</small>` : ''}${ruim ? `<small class="rc-ruim">Situação: ${esc(r.situacao)}</small>` : ''}</div>`
}
// janela de enriquecer: o que achou, o que falta e campo para preencher à mão
const ENR_IC = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
}
const ENR_FOTOS_MAX = 12
const ENR_IC_INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>'
const ENR_IC_FOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/></svg>'
const enrFotosUrl = async paths => {
  if (!paths.length) return []
  const { data } = await sb.storage.from('capivara').createSignedUrls(paths, 3600)
  return paths.map((path, i) => ({ path, url: data?.[i]?.signedUrl || '' }))
}
// foto do celular é pesada: sobe com no máximo 1600 px
const enrReduz = file => new Promise((ok, erro) => {
  const u = URL.createObjectURL(file), im = new Image()
  im.onload = () => { const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(b => b ? ok(b) : erro(new Error('foto')), 'image/jpeg', .85) }
  im.onerror = () => { URL.revokeObjectURL(u); erro(new Error('foto')) }
  im.src = u
})
const enrPintarFotos = () => {
  const j = ENR_J, el = $('enrJFotos'); if (!j || !el) return
  const n = j.fotos.length
  $('enrJFn').textContent = `${n} de ${ENR_FOTOS_MAX}`
  el.innerHTML = `<div class="enr-j-gr">${j.fotos.map(f => `<div class="enr-j-th"><a href="${esc(f.url)}" target="_blank" rel="noopener" aria-label="Abrir foto"><img src="${esc(f.url)}" alt="Foto da empresa" referrerpolicy="no-referrer"></a><button type="button" class="enr-j-del" data-del="${esc(f.path)}" aria-label="Apagar foto">${IC.x}</button></div>`).join('')}${n < ENR_FOTOS_MAX ? `<button type="button" class="enr-j-add" id="enrFAdd"${j.carregado && !j.subindo ? '' : ' disabled'}>${ENR_IC_FOTO}<span>${j.subindo || 'Subir fotos'}</span></button>` : ''}</div><input id="enrFile" type="file" accept="image/*" multiple hidden>${j.fotoErro ? `<small class="enr-j-fe" role="alert">${esc(j.fotoErro)}</small>` : ''}`
  if ($('enrFAdd')) $('enrFAdd').onclick = () => $('enrFile').click()
  $('enrFile').onchange = ev => { const l = [...ev.target.files]; ev.target.value = ''; if (l.length) enrSubirFotos(l) }
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => enrApagarFoto(b))
}
const enrSubirFotos = async lista => {
  const j = ENR_J; if (!j || j.subindo) return
  const vaga = ENR_FOTOS_MAX - j.fotos.length, vao = lista.slice(0, vaga)
  j.fotoErro = lista.length > vaga ? `Cabem só mais ${vaga}. O limite é ${ENR_FOTOS_MAX} fotos por empresa.` : ''
  let falhou = 0
  for (let i = 0; i < vao.length; i++) {
    j.subindo = vao.length > 1 ? `Enviando ${i + 1} de ${vao.length}…` : 'Enviando…'; enrPintarFotos()
    try {
      const blob = await enrReduz(vao[i]), path = `${usuario.id}/empresa/${j.e.id}/${crypto.randomUUID()}.jpg`
      const { error } = await sb.storage.from('capivara').upload(path, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      const paths = [...j.fotos.map(f => f.path), path]
      const { error: e2 } = await sb.from('empresas').update({ fotos: paths }).eq('id', j.e.id)
      if (e2) { await sb.storage.from('capivara').remove([path]); throw e2 }
      j.fotos = [...j.fotos, ...(await enrFotosUrl([path]))]; j.e.fotos = paths; j.mudou = true
    } catch (_) { falhou++ }
  }
  j.subindo = ''
  if (falhou) j.fotoErro = `${falhou === 1 ? 'Uma foto não subiu' : falhou + ' fotos não subiram'}. Use JPG ou PNG e tente de novo.`
  if (ENR_J === j) enrPintarFotos(); else j.depois?.()
}
const enrApagarFoto = async b => {
  const j = ENR_J; if (!j) return
  if (!b.dataset.conf) { b.dataset.conf = '1'; b.classList.add('conf'); b.setAttribute('aria-label', 'Toque de novo para apagar'); return }
  const path = b.dataset.del, resto = j.fotos.filter(f => f.path !== path), paths = resto.map(f => f.path)
  b.disabled = true
  const { error } = await sb.from('empresas').update({ fotos: paths }).eq('id', j.e.id)
  if (error) { j.fotoErro = 'Não consegui apagar a foto. Tenta de novo.'; return enrPintarFotos() }
  await sb.storage.from('capivara').remove([path])
  j.fotos = resto; j.e.fotos = paths; j.fotoErro = ''; j.mudou = true; enrPintarFotos()
}
const enrCarregarExtra = async j => {
  const { data, error } = await sb.from('empresas').select('info, fotos').eq('id', j.e.id).maybeSingle()
  if (ENR_J !== j) return
  if (error || !data) { j.fotoErro = 'Não consegui abrir as informações e fotos. Feche e abra de novo.'; return enrPintarFotos() }
  j.info = data.info || ''; j.fotos = await enrFotosUrl(Array.isArray(data.fotos) ? data.fotos : [])
  if (ENR_J !== j) return
  j.carregado = true
  const t = $('enrInfo'); if (t) { t.value = j.info; t.disabled = false }
  enrPintarFotos()
}
const ENR_CAMPOS = [['whatsapp', 'WhatsApp', '(11) 90000-0000', 'tel'], ['instagram', 'Instagram', '@perfil', 'text'], ['email', 'E-mail', 'contato@empresa.com', 'email'], ['site', 'Site', 'empresa.com.br', 'url']]
let ENR_J = null
const enrEsc = ev => { if (ev.key === 'Escape') enrFechar() }
const enrFechar = () => {
  if (!ENR_J) return
  const j = ENR_J; ENR_J = null
  $('enrJ')?.remove(); document.removeEventListener('keydown', enrEsc)
  if (j.mudou) j.depois?.()
}
const enrPintar = () => {
  const j = ENR_J; if (!j) return
  const e = j.e
  const linha = ([k, t, ph, modo]) => {
    const v = j.val[k] || ''
    const tag = j.achou.has(k) ? ['ok', 'Encontrado'] : v && v.replace(/^@/, '') === (e[k] || '') ? ['sv', 'Salvo'] : !v && j.buscou ? ['nd', 'Não encontrado'] : null
    const cel = k === 'whatsapp' && !v && ehCelular(e) ? `<button type="button" class="enr-j-usa" data-usa-cel>Usar o celular do Google: ${esc(e.telefone)}</button>` : ''
    return `<div class="enr-j-c"><label for="enrC_${k}"><i class="enr-j-ic ic-${k}">${ENR_IC[k]}</i><b>${t}</b>${tag ? `<span class="enr-j-tag t-${tag[0]}">${tag[1]}</span>` : ''}</label><input id="enrC_${k}" data-c="${k}" type="${modo === 'url' ? 'text' : modo}" placeholder="${ph}" value="${esc(v)}" autocomplete="off">${cel}</div>`
  }
  $('enrJ').innerHTML = `<div class="enr-j" role="dialog" aria-modal="true" aria-labelledby="enrJT">
    <header class="enr-j-h"><div><small>Dados de contato</small><h3 id="enrJT">${esc(e.nome || 'Empresa')}</h3></div><button type="button" class="jan-x" id="enrJX" aria-label="Fechar">${IC.x}</button></header>
    <div class="enr-j-b">
      <button type="button" class="btn go enr-j-busca" id="enrJB"${j.buscando ? ' disabled' : ''}>${j.buscando ? 'Procurando…' : j.buscou ? 'Buscar de novo' : 'Buscar dados'}</button>
      ${j.msg ? `<div class="enr-m ${j.msg.t}" role="status">${j.msg.h}</div>` : ''}
      ${ENR_CAMPOS.map(linha).join('')}
      <div class="enr-j-c"><label for="enrInfo"><i class="enr-j-ic">${ENR_IC_INFO}</i><b>Informações relevantes</b></label><textarea id="enrInfo" rows="3" maxlength="2000" placeholder="Quem decide, melhor horário, o que a empresa precisa"${j.carregado ? '' : ' disabled'}>${esc(j.info)}</textarea></div>
      <div class="enr-j-c"><div class="enr-j-ft"><i class="enr-j-ic">${ENR_IC_FOTO}</i><b>Fotos</b><small id="enrJFn"></small></div><div id="enrJFotos"></div></div>
      ${enrDados(e)}
    </div>
    <footer class="enr-j-f"><button type="button" class="btn ok" id="enrJS">Salvar</button></footer></div>`
  const raiz = $('enrJ')
  raiz.querySelectorAll('[data-c]').forEach(i => i.oninput = () => { j.val[i.dataset.c] = i.value; j.achou.delete(i.dataset.c); i.parentElement.querySelector('.enr-j-tag')?.remove() })
  raiz.querySelector('[data-usa-cel]')?.addEventListener('click', () => { j.val.whatsapp = String(e.telefone || ''); enrPintar() })
  $('enrInfo').oninput = ev => { j.info = ev.target.value }
  enrPintarFotos()
  $('enrJX').onclick = enrFechar
  $('enrJB').onclick = enrBuscar
  $('enrJS').onclick = enrSalvar
}
const enrSalvar = async () => {
  const j = ENR_J; if (!j) return
  const v = k => String(j.val[k] || '').trim()
  const wa = v('whatsapp').replace(/\D/g, ''), ig = v('instagram').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[/?].*$/, '').toLowerCase(), si = v('site')
  if (wa && wa.length < 10) { j.msg = { t: 'ruim', h: 'Confere o WhatsApp com DDD.' }; enrPintar(); return $('enrC_whatsapp').focus() }
  const dados = empNorm({ whatsapp: wa || null, instagram: ig || null, email: v('email').toLowerCase() || null, site: si ? (/^https?:\/\//i.test(si) ? si : 'https://' + si) : null })
  if (j.carregado) dados.info = String(j.info || '').trim() || null
  const b = $('enrJS'); b.disabled = true; b.textContent = 'Salvando…'
  const { error } = await sb.from('empresas').update(dados).eq('id', j.e.id)
  if (!ENR_J) return
  if (error) { j.msg = { t: 'ruim', h: 'Não salvou. Tenta de novo.' }; return enrPintar() }
  Object.assign(j.e, dados); j.mudou = true; enrFechar(); liz('Dados salvos.')
}
const enrBuscar = async () => {
  const j = ENR_J; if (!j || j.buscando) return
  const e = j.e; j.buscando = true; j.msg = null; enrPintar()
  const { data, error } = await sb.functions.invoke('enriquecer', { body: { empresa_id: e.id } })
  if (ENR_J !== j) { if (!error && !data?.erro) { Object.assign(e, data.novo); empNorm(e); j.depois?.() } return }
  j.buscando = false
  if (error || data?.erro) { j.msg = { t: 'ruim', h: esc(data?.erro || 'Não consegui buscar agora. Tenta de novo.') }; return enrPintar() }
  Object.assign(e, data.novo); empNorm(e); j.mudou = true; j.buscou = true; j.achou = new Set()
  ENR_CAMPOS.forEach(([k]) => { if (data.novo[k] && e[k] && !String(j.val[k] || '').trim()) { j.val[k] = k === 'instagram' ? '@' + e[k] : e[k]; j.achou.add(k) } })
  const CN = { confirmado: 'Dados da empresa confirmados.', provavel: 'Dados da empresa prováveis.', ambiguo: 'Achei mais de um cadastro com esse nome, então não preenchi os dados da empresa.', nao_achei: 'Não achei os dados da empresa.', sem_base: 'A base da Receita não respondeu agora.' }
  const cn = data.cnpj?.status, bom = j.achou.size || ['confirmado', 'provavel'].includes(cn)
  const h = [j.achou.size ? '' : !e.site ? 'Sem site para ler. Se você souber os dados, preencha aqui.' : data.nao_abriu ? 'Não consegui abrir o site.' : 'Nada novo no site.', cn ? CN[cn] : ''].filter(Boolean).join(' ')
  j.msg = h ? { t: bom ? 'ok' : 'ruim', h } : null
  enrPintar()
}
const enrAbrir = (e, depois) => {
  if (!e?.id) return
  enrFechar(); empNorm(e)
  ENR_J = { e, depois, achou: new Set(), buscou: false, buscando: false, mudou: false, msg: null, info: '', fotos: [], carregado: false, subindo: '', fotoErro: '', val: Object.fromEntries(ENR_CAMPOS.map(([k]) => [k, k === 'instagram' && e[k] ? '@' + e[k] : e[k] || ''])) }
  const o = document.createElement('div'); o.id = 'enrJ'; o.className = 'enr-j-o'
  o.addEventListener('mousedown', ev => { if (ev.target === o) enrFechar() })
  document.body.appendChild(o); document.addEventListener('keydown', enrEsc)
  enrPintar(); $('enrJB').focus(); enrCarregarExtra(ENR_J)
}
// liga o botão do card. depois() redesenha a tela onde o card está.
function ligarEnr(root, e, depois) {
  if (!e?.id) return
  root.querySelector(`[data-enr="${e.id}"]`)?.addEventListener('click', ev => { ev.stopPropagation(); enrAbrir(e, depois) })
}

/* ======================= lista na home: cards e filtros ======================= */
const LV = { f: new Set(), q: '', ord: 'potencial', todos: [], buscaId: null, sel: new Set(), timer: null }
const ehCelular = e => /^\(?\d{2}\)?\s?9/.test(e.telefone || '')
const LV_FILTROS = [['wa', 'WhatsApp', e => !!e.whatsapp], ['cel', 'Celular', ehCelular], ['insta', 'Instagram', e => !!e.instagram], ['email', 'E-mail', e => !!e.email], ['site', 'Com site', e => !!e.site], ['semsite', 'Sem site', e => !e.site], ['nota', 'Nota 4 ou mais', e => +e.nota >= 4]]
const PRECO_G = { PRICE_LEVEL_INEXPENSIVE: '$', PRICE_LEVEL_MODERATE: '$$', PRICE_LEVEL_EXPENSIVE: '$$$', PRICE_LEVEL_VERY_EXPENSIVE: '$$$$' }
const horarioHoje = e => { const h = e.horarios; if (!Array.isArray(h) || h.length !== 7) return ''; return String(h[(new Date().getDay() + 6) % 7] || '').replace(/^[^:]+:\s*/, '') }
// a cidade do endereço do Google: às vezes ele devolve empresa de outra cidade na busca
const cidadeReal = e => String(e.endereco || '').match(/,\s*([^,]+?)\s*-\s*[A-Z]{2}\b/)?.[1] || (e.cidade || '').split(',')[0]
const LV_ORD = { potencial: (a, b) => (b.nota_dor ?? -1) - (a.nota_dor ?? -1), nota: (a, b) => (+b.empresa?.nota || 0) - (+a.empresa?.nota || 0), avaliacoes: (a, b) => (+b.empresa?.total_avaliacoes || 0) - (+a.empresa?.total_avaliacoes || 0), nome: (a, b) => String(a.empresa?.nome || '').localeCompare(String(b.empresa?.nome || ''), 'pt-BR') }
const lvPassa = (d, filtros = LV.f) => { const e = d.empresa || {}; if (![...filtros].every(k => LV_FILTROS.find(x => x[0] === k)[2](e))) return false; const q = semAcento(LV.q.trim()).replace(/^@/, ''); if (!q) return true; const dg = q.replace(/\D/g, ''); return semAcento([e.nome, e.bairro, e.instagram, e.email, e.site].join(' ')).includes(q) || (/^[\d\s()+-]+$/.test(q) && dg.length >= 3 && String((e.telefone || '') + ' ' + (e.whatsapp || '')).replace(/\D/g, '').includes(dg)) }
// "Encontrar mais" grava outra pesquisa, mas pra pessoa é a mesma lista: junta tudo da mesma cidade e segmento
const mesmaLista = (a, b) => a.cidade !== 'Lista' && b.cidade !== 'Lista' && chave(a.cidade) === chave(b.cidade) && parecida(a.nicho, b.nicho)
async function buscasDaLista(b) {
  if (b.cidade === 'Lista') return [b.id]
  const { data } = await sb.from('buscas').select('id, cidade, nicho').neq('cidade', 'Lista').neq('status', 'erro').limit(500)
  return [...new Set([b.id, ...(data || []).filter(x => mesmaLista(x, b)).map(x => x.id)])]
}
async function abrirListaHome() {
  if (!busca?.id) return
  // somar mais 60 não apaga filtro, busca nem seleção: só zera quando muda de lista
  const qualLista = busca.cidade === 'Lista' ? busca.id : `${chave(busca.cidade)}|${chave(busca.nicho)}`
  if (LV.buscaId !== qualLista) { LV.f = new Set(); LV.q = ''; LV.ord = 'potencial'; LV.sel = new Set(); LV.buscaId = qualLista }
  const idsLista = await buscasDaLista(busca)
  const { data, error } = await sb.from('diagnosticos').select('id, status, angulo, nota_dor, motivo, decisao, capivara, empresa:empresas(id, nome, endereco, bairro, cidade, telefone, site, google_maps_url, nota, total_avaliacoes, instagram, email, whatsapp, cnpj, cnpj_status, receita, cnpj_opcoes, categoria, status_google, horarios, faixa_preco, google_extra, place_id, contatos_lidos_em)').in('busca_id', idsLista).order('nota_dor', { ascending: false })
  if (error) return liz('Não consegui carregar a lista. Tenta de novo.')
  LV.todos = data || []; LV.todos.forEach(d => empNorm(d.empresa))
  $('ask').hidden = true; document.body.classList.remove('fora')
  const faltam = LV.todos.filter(d => !d.empresa?.contatos_lidos_em).length
  const titulo = busca.cidade === 'Lista' ? busca.nicho : `${busca.nicho} em ${(busca.cidade || '').split(',')[0]}`
  $('lv').innerHTML = `<div class="lv-in">
    <div class="lv-top"><div><h1>${esc(titulo)}</h1><p>${LV.todos.length} empresa${LV.todos.length === 1 ? '' : 's'} nesta lista</p></div><div class="lv-ac"><button class="btn line sm" id="lvCsv">Baixar planilha</button>${busca.cidade === 'Lista' ? '' : '<button class="btn line sm" data-mais="60">Encontrar mais 60</button>'}</div></div>
    <div class="lv-en" id="lvProg" hidden></div>
    <div class="lv-fil"><div class="lv-lin"><label class="pf-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="lvQ" type="search" placeholder="Buscar nome, bairro, telefone ou @" aria-label="Buscar na lista" autocomplete="off" value="${esc(LV.q)}"></label>
      <label class="lv-ord">Ordenar<select id="lvOrd" aria-label="Ordenar">${[['potencial', 'Potencial'], ['nota', 'Nota no Google'], ['avaliacoes', 'Mais avaliações'], ['nome', 'Nome']].map(([k, t]) => `<option value="${k}"${LV.ord === k ? ' selected' : ''}>${t}</option>`).join('')}</select></label></div>
      <div class="lv-chips" id="lvChips"></div></div>
    <div class="lv-res"><label class="lv-selt"><input type="checkbox" id="lvSelT"><span id="lvN"></span></label><div class="lv-resb"><button class="btn line sm" id="lvEnrT" hidden></button><button class="btn ok sm" id="lvAddT" hidden></button></div></div>
    <div class="lv-g" id="lvG"></div>
    <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  $('lv').hidden = false
  lvPintar(); lvAcompanhar()
  $('lvCsv').onclick = () => baixarCsv(LV.todos)
  let tq; $('lvQ').oninput = e => { clearTimeout(tq); tq = setTimeout(() => { LV.q = e.target.value; lvPintar() }, 150) }
  $('lvOrd').onchange = e => { LV.ord = e.target.value; lvPintar() }
}
// progresso da fila: atualiza a contagem e redesenha quando termina
async function lvAcompanhar(novas = 0) {
  clearInterval(LV.timer)
  let total = novas
  const popup = falta => { if (!novas) return; if (LOAD.tipo && LOAD.tipo !== 'lote') return; if (LOAD.tipo === '' && total !== novas) return; consultaAbre({ tipo: 'lote', t: 'Enriquecendo as empresas', s: 'Procurando site e dados de cada uma. Pode continuar usando que eu aviso.', de: Math.max(0, total - falta), ate: total, sair: true }) }
  if (novas) consultaAbre({ tipo: 'lote', t: 'Enriquecendo as empresas', s: 'Procurando site e dados de cada uma. Pode continuar usando que eu aviso.', de: 0, ate: novas, sair: true })
  const ids = LV.todos.map(d => d.empresa?.id).filter(Boolean)
  const olhar = async () => {
    const p = $('lvProg'); if ($('lv').hidden || !p) return clearInterval(LV.timer)
    const pendentes = []; for (let i = 0; i < ids.length; i += 150) { const { data } = await sb.from('enriq_fila').select('empresa_id').in('status', ['fila', 'lendo']).in('empresa_id', ids.slice(i, i + 150)); pendentes.push(...(data || [])) }
    const estava = !p.hidden
    total = Math.max(total, pendentes.length)
    if (LOAD.tipo === 'lote') popup(pendentes.length)
    p.hidden = !pendentes.length
    if (pendentes.length) p.innerHTML = `<span><b>Enriquecendo:</b> faltam ${pendentes.length}. Pode continuar usando.</span>`
    else { clearInterval(LV.timer); fimCarregando('lote'); if (estava) { liz('Enriquecimento pronto.'); abrirListaHome() } }
  }
  await olhar(); if ($('lvProg') && !$('lvProg').hidden) LV.timer = setInterval(olhar, 8000)
}
function lvPintar() {
  const lst = LV.todos.filter(d => lvPassa(d)).sort(LV_ORD[LV.ord])
  $('lvChips').innerHTML = LV_FILTROS.map(([k, t]) => { const n = LV.todos.filter(d => lvPassa(d, new Set([...LV.f, k]))).length; return `<button data-f="${k}" aria-pressed="${LV.f.has(k)}">${t}<span>${n}</span></button>` }).join('')
  const idsLst = lst.map(d => d.empresa?.id).filter(Boolean), marcadas = idsLst.filter(i => LV.sel.has(i))
  $('lvN').textContent = marcadas.length ? `${marcadas.length} selecionada${marcadas.length === 1 ? '' : 's'} de ${lst.length}` : `Selecionar todas (${lst.length})`
  const st = $('lvSelT'); st.checked = !!idsLst.length && marcadas.length === idsLst.length; st.indeterminate = !!marcadas.length && !st.checked
  st.onchange = () => { idsLst.forEach(i => st.checked ? LV.sel.add(i) : LV.sel.delete(i)); lvPintar() }
  const be = $('lvEnrT'); be.hidden = !marcadas.length; be.textContent = `Enriquecer ${marcadas.length} selecionada${marcadas.length === 1 ? '' : 's'}`
  be.onclick = async () => { be.disabled = true; const { data: n, error } = await sb.rpc('enfileirar_enriq', { p_empresas: marcadas }); be.disabled = false; if (error) return liz(esc(error.message)); LV.sel = new Set(); if (!n) liz('Essas empresas já estão na fila.'); lvPintar(); lvAcompanhar(n || 0) }
  const novas = lst.filter(d => d.decisao !== 'aprovada' && LV.sel.has(d.empresa?.id)) // só as marcadas, igual ao Enriquecer
  const bt = $('lvAddT'); bt.hidden = !novas.length; bt.textContent = `Adicionar ${novas.length} ao pipeline`
  $('lvG').innerHTML = lst.map(d => { const e = d.empresa || {}, tem = Object.keys(d.capivara || {}).length, fila = d.status === 'na_fila' || d.status === 'lendo', w = zap(e.whatsapp) || (ehCelular(e) ? zap(e.telefone) : null), tel = String(e.telefone || '').replace(/[^\d+]/g, '')
    return `<article class="lc" data-id="${d.id}"><div class="lc-h"><label class="lc-sel"><input type="checkbox" data-sel${LV.sel.has(e.id) ? ' checked' : ''} aria-label="Selecionar ${esc(e.nome || 'empresa')}"></label><div><h3>${esc(e.nome || 'Empresa')}</h3><small>${esc([e.categoria, e.bairro, cidadeReal(e)].filter(Boolean).join(' · '))}</small></div>${d.nota_dor != null ? `<span class="lc-p" title="Potencial"><b>${d.nota_dor}</b>potencial</span>` : ''}</div>
      ${e.nota ? `<div class="lc-n">★ ${String(e.nota).replace('.', ',')} <span>(${e.total_avaliacoes || 0} avaliações)</span></div>` : ''}
      ${e.status_google === 'CLOSED_PERMANENTLY' ? '<div class="lc-fec">Fechada definitivamente no Google</div>' : e.status_google === 'CLOSED_TEMPORARILY' ? '<div class="lc-fec">Fechada temporariamente no Google</div>' : ''}${horarioHoje(e) ? `<div class="lc-g">Hoje: ${esc(horarioHoje(e))}</div>` : ''}
      <div class="lc-ct">${e.whatsapp ? `<button class="lc-wa" data-zap="${w}">WhatsApp</button>` : ehCelular(e) ? `<button class="lc-cel" data-zap="${w}">Celular</button>` : ''}${tel ? `<a href="tel:${esc(tel)}">${esc(e.telefone)}</a>` : ''}${e.instagram ? `<a class="lc-ig" href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener">@${esc(e.instagram)}</a>` : ''}${e.email ? `<a href="mailto:${esc(e.email)}">E-mail</a>` : ''}${e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener">Site</a>` : '<span class="lc-sem">Sem site</span>'}</div>
      <div class="lc-ac">${d.decisao === 'aprovada' ? '<span class="lc-ok">No pipeline</span>' : '<button class="btn ok sm" data-add>Adicionar ao pipeline</button>'}<button class="btn line sm" data-fi>Ver ficha</button>${enrBotao(e)}</div></article>` }).join('') || `<div class="lv-vz">Nenhuma empresa com esses filtros.<br><button class="btn line sm" id="lvLimpa">Limpar filtros</button></div>`
  if ($('lvLimpa')) $('lvLimpa').onclick = () => { LV.f = new Set(); LV.q = ''; $('lvQ').value = ''; lvPintar() }
  $('lvChips').querySelectorAll('button').forEach(b => b.onclick = () => { const k = b.dataset.f; if (LV.f.has(k)) LV.f.delete(k); else { LV.f.add(k); if (k === 'site') LV.f.delete('semsite'); if (k === 'semsite') LV.f.delete('site') } lvPintar() })
  bt.onclick = async () => {
    bt.disabled = true; bt.textContent = 'Adicionando…'
    const ids = novas.map(d => d.id); let falhou = false
    for (let i = 0; i < ids.length; i += 200) { const { error } = await sb.from('diagnosticos').update({ decisao: 'aprovada', decidida_em: new Date().toISOString() }).in('id', ids.slice(i, i + 200)); if (error) { falhou = true; break } }
    bt.disabled = false; if (falhou) liz('Parte não entrou no pipeline. Tenta de novo.'); else liz(`${ids.length} empresa${ids.length === 1 ? '' : 's'} no pipeline.`)
    if (!falhou) LV.sel = new Set()
    contarCaptacao(); abrirListaHome()
  }
  $('lvG').querySelectorAll('.lc').forEach(c => {
    const d = LV.todos.find(x => x.id === c.dataset.id)
    ligarEnr(c, d.empresa, lvPintar)
    c.querySelector('[data-fi]').onclick = () => abrirFichaMaps(d)
    c.querySelector('[data-sel]').onchange = ev => { if (ev.target.checked) LV.sel.add(d.empresa.id); else LV.sel.delete(d.empresa.id); lvPintar() }
    c.querySelector('[data-zap]')?.addEventListener('click', ev => abrirConversas(true, ev.currentTarget.dataset.zap))
    c.querySelector('[data-abre]')?.addEventListener('click', () => abrirSeq(d.id))
    c.querySelector('[data-add]')?.addEventListener('click', async ev => { const b = ev.currentTarget; b.disabled = true; const { error } = await sb.from('diagnosticos').update({ decisao: 'aprovada', decidida_em: new Date().toISOString() }).eq('id', d.id); if (error) { b.disabled = false; return liz('Não entrou no pipeline. Tenta de novo.') } d.decisao = 'aprovada'; contarCaptacao(); lvPintar() })
    c.querySelector('[data-faz]')?.addEventListener('click', async ev => { const b = ev.currentTarget; b.disabled = true; b.textContent = 'Mandando…'; d.status = 'na_fila'; consultaAbre({ tipo: 'raiox', t: `Montando o Raio-X de ${d.empresa?.nome || 'a empresa'}`, s: 'Leva 1 a 2 minutos. Pode continuar usando que eu aviso.', sair: true }); await sb.from('diagnosticos').update({ status: 'na_fila' }).eq('id', d.id); await sb.from('buscas').update({ status: 'diagnosticando', terminada_em: null }).eq('id', busca.id); busca.status = 'diagnosticando'; vivo(true, 'Liz trabalhando'); acompanhar(); lvPintar() })
  })
}

/* ======================= LinkedIn e quem decide (11/11) ======================= */
// a IA pesquisa na web: página da empresa, perfil de quem decide, telefone e e-mail públicos e o contexto
function lkSecao(e) {
  const l = e.linkedin
  if (!l) return `<p class="fi-v">Procura a página da empresa no LinkedIn, o perfil de quem decide, telefone e e-mail públicos e um resumo pra puxar conversa. Leva até 1 minuto.</p><button class="btn go sm" data-lk>Pesquisar LinkedIn</button>`
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return 'fonte' } }
  const fonte = u => `<a class="lk-f" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`
  const pessoas = (l.pessoas || []).map(p => `<div class="lk-p"><b>${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">${esc(p.nome)}</a>` : esc(p.nome)}</b>${p.cargo ? `<small>${esc(p.cargo)}</small>` : ''}${fonte(p.fonte)}</div>`).join('')
  const cont = (l.telefones || []).concat(l.emails || []).map(c => `<div class="lk-p"><b>${esc(c.valor)}</b>${c.de_quem ? `<small>${esc(c.de_quem)}</small>` : ''}${fonte(c.fonte)}</div>`).join('')
  return `${l.contexto ? `<p class="fi-info">${esc(l.contexto)}</p>` : ''}
    ${l.empresa_linkedin ? `<a class="fi-c lk-emp" href="${esc(l.empresa_linkedin)}" target="_blank" rel="noopener"><b>Página no LinkedIn</b><span>${esc([l.funcionarios, l.empresa_resumo].filter(Boolean).join(' · ') || 'Abrir')}</span></a>` : '<p class="fi-v">Não achei a página da empresa no LinkedIn.</p>'}
    ${pessoas ? `<div class="lk-l"><small class="lk-h">Quem decide</small>${pessoas}</div>` : ''}
    ${cont ? `<div class="lk-l"><small class="lk-h">Contatos achados</small>${cont}</div>` : ''}
    ${lkRobo(l.robo)}
    ${!pessoas && (l.socios_receita || []).length ? `<p class="fi-v">Sócios na Receita: ${esc(l.socios_receita.join('; '))}. Não achei o perfil deles.</p>` : ''}
    <div class="lk-r"><small>Pesquisado em ${new Date(l.pesquisado_em).toLocaleDateString('pt-BR')}</small><button class="btn line sm" data-lk>Pesquisar de novo</button></div>`
}
// o que o robô logado leu por dentro do LinkedIn (conta separada no VPS)
function lkRobo(r) {
  if (!r || (!r.empresa && !r.pessoa && !(r.contatos || []).length)) return ''
  const em = r.empresa || {}, pe = r.pessoa || {}
  const lin = (t, v) => v ? `<div class="lk-p"><small>${esc(t)}</small><b>${esc(v)}</b></div>` : ''
  return `<div class="lk-l"><small class="lk-h">Lido por dentro do LinkedIn</small>
    ${lin('Setor', em.setor)}${lin('Tamanho', em.tamanho)}${lin('Sede', em.sede)}${lin('Fundada', em.fundada)}
    ${pe.nome ? lin('Quem decide', [pe.nome, pe.cargo].filter(Boolean).join(', ')) : ''}${lin('Onde está', pe.local)}${(r.contatos || []).map(c => lin(c.de_quem || 'Contato', c.valor)).join('')}
    ${pe.sobre ? `<p class="fi-info">${esc(String(pe.sobre).slice(0, 600))}</p>` : ''}</div>`
}
function lkLigar(root, e, depois) {
  root.querySelectorAll('[data-lk]').forEach(b => b.onclick = async () => {
    b.disabled = true
    consultaAbre({ tipo: 'lk', t: 'Pesquisando no LinkedIn', s: e.nome || '' })
    try { const r = await chamar('linkedin', { empresa_id: e.id }); e.linkedin = r.linkedin; fimCarregando('lk'); depois() }
    catch (er) { fimCarregando('lk'); b.disabled = false; liz(esc(er.message)) }
  })
}

/* ======================= ficha da empresa: tudo que o Maps entrega ======================= */
let fichaAberta = null
async function abrirFichaMaps(d, empilhar = true) {
  fichaAberta = d
  const e = empNorm(d.empresa) || {}, x = e.google_extra || {}
  const { data: extra } = await sb.from('empresas').select('info, fotos, linkedin').eq('id', e.id).maybeSingle()
  if (extra) Object.assign(e, extra)
  const fotosE = await enrFotosUrl(Array.isArray(e.fotos) ? e.fotos : [])
  const { data: avs } = await sb.from('avaliacoes').select('estrelas, texto, publicada_em, autor, autor_link, tempo').eq('empresa_id', e.id).order('publicada_em', { ascending: false, nullsFirst: false }).limit(20)
  const w = zap(e.whatsapp) || (ehCelular(e) ? zap(e.telefone) : null), tel = String(e.telefone || '').replace(/[^\d+]/g, '')
  const estrelas = n => { const v = Math.round(+n || 0); return `<span class="fi-est" aria-label="${v} de 5 estrelas">${'★'.repeat(v)}<i>${'★'.repeat(5 - v)}</i></span>` }
  const hoje = (new Date().getDay() + 6) % 7
  const sec = (t, c) => c ? `<section class="fi-s"><h3>${t}</h3>${c}</section>` : ''
  const etiquetas = l => (l || []).length ? `<div class="fi-tags">${l.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''
  const falta = t => `<button type="button" class="fi-c fi-falta" data-enr-add><b>${t}</b><span>Adicionar</span></button>`
  const contato = [
    e.whatsapp ? `<button class="fi-c wa" data-zap="${w}"><b>WhatsApp</b><span>${esc(tfmt(e.whatsapp))}</span></button>` : ehCelular(e) ? `<button class="fi-c wa" data-zap="${w}"><b>Celular</b><span>${esc(e.telefone)}</span></button>` : '',
    tel && !ehCelular(e) ? `<a class="fi-c" href="tel:${esc(tel)}"><b>Telefone</b><span>${esc(e.telefone)}</span></a>` : '',
    !e.whatsapp && !ehCelular(e) ? falta('WhatsApp') : '',
    e.instagram ? `<a class="fi-c" href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener"><b>Instagram</b><span>@${esc(e.instagram)}</span></a>` : falta('Instagram'),
    e.email ? `<a class="fi-c" href="mailto:${esc(e.email)}"><b>E-mail</b><span>${esc(e.email)}</span></a>` : falta('E-mail'),
    e.site ? `<a class="fi-c" href="${esc(e.site)}" target="_blank" rel="noopener"><b>Site</b><span>${esc(e.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</span></a>` : falta('Site'),
  ].join('')
  const horas = Array.isArray(e.horarios) && e.horarios.length ? `<ul class="fi-h">${e.horarios.map((h, i) => { const [dia, ...r] = String(h).split(':'); return `<li class="${i === hoje ? 'on' : ''}"><span>${esc(dia)}</span><span>${esc(r.join(':').trim())}</span></li>` }).join('')}</ul>` : ''
  const lista = (avs || []).map(a => `<article class="fi-a"><div class="fi-a-t">${a.autor_link ? `<a href="${esc(a.autor_link)}" target="_blank" rel="noopener">${esc(a.autor || 'Avaliador do Google')}</a>` : `<b>${esc(a.autor || 'Avaliador do Google')}</b>`}<small>${esc(a.tempo || (a.publicada_em ? new Date(a.publicada_em).toLocaleDateString('pt-BR') : ''))}</small></div>${estrelas(a.estrelas)}${a.texto ? `<p>${esc(a.texto)}</p>` : ''}</article>`).join('')
  const semFicha = !e.google_extra
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Ficha</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b fi">
    <header class="fi-t"><div><h2>${esc(e.nome || 'Empresa')}</h2><p>${esc([e.categoria, PRECO_G[e.faixa_preco]].filter(Boolean).join(' · ') || 'Empresa')}</p></div>${e.nota ? `<div class="fi-n"><b>${String(e.nota).replace('.', ',')}</b>${estrelas(e.nota)}<small>${e.total_avaliacoes || 0} avaliações</small></div>` : ''}</header>
    ${e.status_google && e.status_google !== 'OPERATIONAL' ? `<div class="lc-fec">${e.status_google === 'CLOSED_PERMANENTLY' ? 'Fechada definitivamente no Google' : 'Fechada temporariamente no Google'}</div>` : ''}
    <div class="fi-ac">${d.decisao === 'aprovada' ? '<span class="lc-ok">No pipeline</span>' : '<button class="btn ok" id="fiAdd">Adicionar ao pipeline</button>'}${e.google_maps_url ? `<a class="btn line" href="${esc(e.google_maps_url)}" target="_blank" rel="noopener">Abrir no Google Maps</a>` : ''}${enrBotao(e)}</div>
    ${semFicha ? `<div class="fi-av"><span>Essa empresa veio de uma busca antiga, sem a ficha completa do Google.</span><button class="btn go sm" id="fiBaixar">Trazer do Google</button></div>` : ''}
    ${sec('Contato', `<div class="fi-cs">${contato}</div>`)}
    ${sec('Informações e fotos', `${e.info ? `<p class="fi-info">${esc(e.info)}</p>` : ''}${fotosE.length ? `<div class="enr-j-gr fi-fotos">${fotosE.map(f => `<a class="enr-j-th" href="${esc(f.url)}" target="_blank" rel="noopener" aria-label="Abrir foto"><img src="${esc(f.url)}" alt="Foto da empresa" referrerpolicy="no-referrer"></a>`).join('')}</div>` : ''}${e.info || fotosE.length ? '' : `<button type="button" class="fi-c fi-falta fi-falta-l" data-enr-add><b>Quem decide, melhor horário, fotos da empresa</b><span>Adicionar</span></button>`}`)}
    ${sec('Endereço', e.endereco ? `<p>${esc(e.endereco)}</p>` : '')}
    ${sec('Sobre', [x.resumo, x.resumo_avaliacoes].filter(Boolean).map(t => `<p>${esc(t)}</p>`).join(''))}
    ${sec('Horários', horas)}
    ${sec('O que oferece', etiquetas(x.oferece))}${sec('Pagamento', etiquetas(x.pagamento))}${sec('Estacionamento', etiquetas(x.estacionamento))}${sec('Acessibilidade', etiquetas(x.acessibilidade))}
    ${sec('Dados da empresa', enrDados(e))}
    ${sec('LinkedIn e quem decide', lkSecao(e))}
    ${sec(`Avaliações${lista ? ` <small>O Google mostra até 5 por empresa</small>` : ''}`, lista || '<p class="fi-v">Nenhuma avaliação trazida ainda.</p>')}
    <div class="fi-g">Dados do Google Maps</div></div>`
  $('capX').onclick = fecharCapivara
  $('cap').querySelectorAll('[data-zap]').forEach(b => b.onclick = () => abrirConversas(true, b.dataset.zap))
  const fiDepois = () => { abrirFichaMaps(d, false); if (LV.todos?.length && $('lvG')) lvPintar() }
  ligarEnr($('cap'), e, fiDepois)
  lkLigar($('cap'), e, fiDepois)
  $('cap').querySelectorAll('[data-enr-add]').forEach(b => b.onclick = () => enrAbrir(e, fiDepois))
  if ($('fiAdd')) $('fiAdd').onclick = async ev => { ev.currentTarget.disabled = true; const { error } = await sb.from('diagnosticos').update({ decisao: 'aprovada', decidida_em: new Date().toISOString() }).eq('id', d.id); if (error) { ev.currentTarget.disabled = false; return liz('Não entrou no pipeline. Tenta de novo.') } d.decisao = 'aprovada'; contarCaptacao(); abrirFichaMaps(d, false) }
  if ($('fiBaixar')) $('fiBaixar').onclick = async () => {
    consultaAbre({ tipo: 'enr', t: 'Trazendo a ficha do Google', s: e.nome || '' })
    const { data, error } = await sb.functions.invoke('enriquecer', { body: { empresa_id: e.id } })
    fimCarregando('enr')
    if (error || data?.erro) return liz(esc(data?.erro || 'Não consegui trazer agora. Tenta de novo.'))
    Object.assign(e, data.novo); abrirFichaMaps(d, false)
  }
  if (empilhar) empilha('ficha')
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
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
const pipeF = { q: '', resp: false, temp: '', seg: '', etq: '', lim: {} }
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
    const { data, error } = await sb.from('diagnosticos').select('id, nota_dor, angulo, decisao, capivara, temperatura, etapa, etapa_em, anotacao, decidida_em, telefone, segmento, etiquetas, busca:buscas(nicho, cidade), empresa:empresas(id, nome, bairro, cidade, telefone, site, instagram, email, whatsapp, cnpj, cnpj_status, receita, cnpj_opcoes)').eq('decisao', 'aprovada').eq('arquivado', false).order('decidida_em', { ascending: false }).order('id').range(i, i + 999)
    if (error) { liz('Não consegui carregar todo o pipeline. Tenta de novo.'); break }
    out.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return out
}
async function abrirCaptacao(empilhar = true) {
  if (empilhar) { pipeF.q = ''; pipeF.resp = false; pipeF.temp = ''; pipeF.seg = ''; pipeF.etq = ''; pipeF.lim = {}; pipeX = 0; pipeY = 0 }
  const [todos, resAg, resAt] = await Promise.all([leadsDoPipe(), sb.rpc('aguardando_resposta'), sb.rpc('atividade_leads')])
  todos.forEach(d => empNorm(d.empresa))
  // etiquetas criadas por você: mesma etiqueta com outra grafia vira a que já existe
  const pEtqTodas = () => [...new Set(todos.flatMap(d => d.etiquetas || []))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const pEtqCanon = v => { const t = String(v || '').trim().replace(/\s+/g, ' ').slice(0, 30); return t ? pEtqTodas().find(x => semAc(x) === semAc(t)) || t : '' }
  const pEtqPinta = () => {
    const sel = $('pEtq'); if (!sel) return
    const lista = pEtqTodas(); if (pipeF.etq && !lista.includes(pipeF.etq)) pipeF.etq = ''
    sel.innerHTML = `<option value="">Todas</option>${lista.map(t => `<option value="${esc(t)}"${pipeF.etq === t ? ' selected' : ''}>${esc(t)} (${todos.filter(d => (d.etiquetas || []).includes(t)).length})</option>`).join('')}`
    $('pEtqSug').innerHTML = lista.map(t => `<option value="${esc(t)}"></option>`).join('')
  }
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
      ${(d.etiquetas || []).length ? `<div class="pc-tags">${d.etiquetas.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
      ${d.anotacao ? `<div class="pc-n">${esc(d.anotacao)}</div>` : ''}
      <div class="pc-ac">${w ? `<a data-contato data-abrir="${w}" href="#" class="wpp">WhatsApp</a>` : ''}${telHref ? `<a data-contato href="tel:${esc(telHref)}">Ligar</a>` : ''}${e.instagram ? `<a data-contato class="ig" href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener">Insta</a>` : ''}${e.email && !w ? `<a data-contato href="mailto:${esc(e.email)}?body=${encodeURIComponent(msg)}">E-mail</a>` : ''}
        ${prox && d.etapa !== 'cliente' && d.etapa !== 'perdido' ? `<button class="vai" data-vai="${prox[0]}" title="Passar pra ${prox[1]}">${prox[1]}${IC.arr}</button>` : ''}</div>
      <div class="pc-mais">
        <div class="cp-et">${ETAPAS.map(([k, t]) => `<button data-et="${k}" class="${d.etapa === k ? 'on' : ''}">${t}</button>`).join('')}</div>
        ${d.etapa === 'cliente' || d.etapa === 'perdido' ? '' : `<div class="cp-et cp-tmp"><span>Temperatura</span><button data-tmp="" class="${d.temperatura ? '' : 'on'}">Automática</button>${TEMP_MAN.map(([k, t]) => `<button data-tmp="${k}" class="${d.temperatura === k ? 'on' : ''}">${t}</button>`).join('')}</div>`}
        <div class="pc-etq"><span class="pc-etq-t">Etiquetas</span>${(d.etiquetas || []).length ? `<div class="pc-etq-l">${d.etiquetas.map(t => `<span>${esc(t)}<button type="button" data-etq-x="${esc(t)}" aria-label="Tirar a etiqueta ${esc(t)}">${IC.x}</button></span>`).join('')}</div>` : ''}<div class="pc-etq-add"><input data-etq-in list="pEtqSug" maxlength="30" placeholder="Nova etiqueta" aria-label="Nova etiqueta para ${esc(titulo)}" autocomplete="off"><button type="button" data-etq-add>Adicionar</button></div></div>
        <div class="cp-ac"><button data-copia>Copiar mensagem</button>${enrBotao(d.empresa)}</div>${enrDados(d.empresa)}
        <textarea data-nota placeholder="Anotação (ex: falei com a Ana, retornar segunda)">${esc(d.anotacao || '')}</textarea></div></div>`
  }
  $('cap').dataset.seq = ''
  $('cap').classList.add('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Pipeline</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
    <div class="lst-top"><h2>${todos.length ? `${todos.length} empresa${todos.length === 1 ? '' : 's'} no pipeline` : 'Pipeline'}</h2>${de('a_contatar').length ? `<button class="btn go sm" id="cFila">Abordagens do dia · ${de('a_contatar').length}</button>` : ''}${de('a_contatar').length ? `<button class="btn line sm" id="cDisp">Disparo automático</button>` : ''}${todos.length ? '<button class="btn line sm" id="cCsv">Baixar planilha</button>' : ''}</div>
    ${todos.length ? `<div class="pk">${kpi.map(([t, k, v, s]) => `<div class="pk-i t-${t}"><i></i><div><b>${v}</b><span>${k}</span><small>${s}</small></div></div>`).join('')}</div>
    <div class="pf"><label class="pf-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="pQ" type="search" placeholder="Buscar nome, empresa, telefone ou @" aria-label="Buscar no pipeline" autocomplete="off" value="${esc(pipeF.q)}"></label>${(() => { const segs = {}; todos.forEach(d => { const s = segDe(d); if (s) segs[s] = (segs[s] || 0) + 1 }); return `<label class="lv-ord pf-seg"><span>Segmento</span><select id="pSeg" aria-label="Filtrar por segmento"><option value="">Todos (${todos.length})</option>${Object.entries(segs).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR')).map(([s, n]) => `<option value="${esc(s)}"${pipeF.seg === s ? ' selected' : ''}>${esc(s)} (${n})</option>`).join('')}</select></label>` })()}<label class="lv-ord pf-seg"><span>Etiqueta</span><select id="pEtq" aria-label="Filtrar por etiqueta"></select></label><datalist id="pEtqSug"></datalist><div class="pf-tmp" id="pTemp">${TEMP_MAN.map(([k, t]) => `<button class="t-${k}" data-f="${k}" aria-pressed="${pipeF.temp === k}"><i></i>${t}<span>${nTemp(k)}</span></button>`).join('')}</div><button class="pf-resp" id="pResp" aria-pressed="${pipeF.resp}" ${noPipe.size || pipeF.resp ? '' : 'disabled'}>Responder<span>${todos.filter(esperaDe).length}</span></button></div>
    <div class="pf-i" id="pInfo" hidden></div>
    <div class="pt" id="pTabs">${ETAPAS.map(([k, t], i) => `<button data-col="${i}">${t}<span>${de(k).length}</span></button>`).join('')}</div>
    <div class="pb" id="pBoard"></div>`
    : '<div class="cp-vazio">Seu pipeline está vazio.<br>Faça uma busca e toque em <b>Adicionar ao pipeline</b>.</div>'}</div>`
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
      el.onclick = e => { if (!e.target.closest('a,button,textarea,input')) el.classList.toggle('aberto') }
      const etqSalva = async lista => {
        const { error } = await sb.from('diagnosticos').update({ etiquetas: lista }).eq('id', d.id)
        if (error) return liz('Não consegui salvar a etiqueta. Tenta de novo.')
        d.etiquetas = lista; pEtqPinta()
        const y = $('cap').scrollTop; pintar(); $('cap').scrollTop = y
        const novo = $('pBoard').querySelector(`.pc[data-id="${d.id}"]`); novo?.classList.add('aberto'); novo?.querySelector('[data-etq-in]')?.focus()
      }
      const etqAdd = () => {
        const t = pEtqCanon(el.querySelector('[data-etq-in]').value); if (!t) return
        const atual = d.etiquetas || []
        if (atual.includes(t)) { el.querySelector('[data-etq-in]').value = ''; return }
        etqSalva([...atual, t])
      }
      el.querySelector('[data-etq-add]').onclick = etqAdd
      el.querySelector('[data-etq-in]').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); etqAdd() } }
      el.querySelectorAll('[data-etq-x]').forEach(b => b.onclick = () => etqSalva((d.etiquetas || []).filter(t => t !== b.dataset.etqX)))
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
      el.querySelector('[data-copia]').onclick = async e => { try { await navigator.clipboard.writeText(saudacaoTxt()); e.target.textContent = '✓ Copiada' } catch { liz('Não consegui copiar.') } }
      let tm; el.querySelector('[data-nota]').oninput = ev => { clearTimeout(tm); tm = setTimeout(async () => { d.anotacao = ev.target.value; await sb.from('diagnosticos').update({ anotacao: ev.target.value }).eq('id', d.id) }, 700) }
    })
    board.querySelectorAll('.pcol').forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add('alvo') }
      col.ondragleave = () => col.classList.remove('alvo')
      col.ondrop = e => { e.preventDefault(); col.classList.remove('alvo'); mover(todos.find(x => x.id === e.dataTransfer.getData('text/plain')), col.dataset.et) }
    })
    board.querySelectorAll('[data-vermais]').forEach(b => b.onclick = () => { const k = b.dataset.vermais; pipeF.lim[k] = (pipeF.lim[k] || POR_COLUNA) + POR_COLUNA; const y = board.scrollLeft; pintar(); board.scrollLeft = y })
    }
    // busca: tudo o que identifica o lead, sem acento e sem maiúscula
    const textoBusca = new Map(todos.map(d => { const e = d.empresa || {}, a = esperaDe(d); return [d.id, semAcento([d.capivara?.nome, e.nome, e.instagram, e.email, e.cidade, e.bairro, d.busca?.nicho, d.segmento, d.anotacao, a?.nome].filter(Boolean).join(' '))] }))
    const fonesBusca = new Map(todos.map(d => { const e = d.empresa || {}, a = esperaDe(d); return [d.id, [e.whatsapp, e.telefone, d.telefone, a?.telefone, a?.fone].map(t => String(t || '').replace(/\D/g, '').replace(/^55(?=\d{10})/, '')).join(' ')] }))
    const pintar = (rolar = false) => {
      const q = semAcento(pipeF.q.trim()).replace(/^@/, ''), soNumero = /^[\d\s()+-]+$/.test(q), qd = soNumero ? q.replace(/\D/g, '').replace(/^55(?=\d{10})/, '') : ''
      const bate = d => (!pipeF.resp || esperaDe(d)) && (!pipeF.temp || tempDe(d)[0] === pipeF.temp) && (!pipeF.seg || segDe(d) === pipeF.seg) && (!pipeF.etq || (d.etiquetas || []).includes(pipeF.etq)) && (!q || (soNumero ? qd.length >= 3 && fonesBusca.get(d.id).includes(qd) : textoBusca.get(d.id).includes(q)))
      const filtrando = !!q || pipeF.resp || !!pipeF.temp || !!pipeF.seg || !!pipeF.etq
      let total = 0, primeira = -1
      board.innerHTML = ETAPAS.map(([k, t], i) => {
        // quem espera há mais tempo vem primeiro, pra não ficar escondido depois do limite da coluna
        const lista = de(k).filter(bate).sort((a, b) => (esperaDe(a)?.desde || '~').localeCompare(esperaDe(b)?.desde || '~'))
        total += lista.length; if (lista.length && primeira < 0) primeira = i
        abas[i].querySelector('span').textContent = lista.length
        const lim = pipeF.lim[k] || POR_COLUNA, resto = lista.length - lim
        const vazio = filtrando ? 'Ninguém aqui.' : k === 'a_contatar' ? 'Faça uma busca e toque em Adicionar ao pipeline.' : 'Arrasta uma empresa pra cá.'
        return `<section class="pcol c-${TEMP[k][0]}" data-et="${k}"><header><i></i>${t}<span>${lista.length}</span></header><div class="pcol-b">${lista.slice(0, lim).map(cartao).join('') || `<div class="pv">${vazio}</div>`}${resto > 0 ? `<button class="pv-mais" data-vermais="${k}">Ver mais ${Math.min(resto, POR_COLUNA)} de ${resto}</button>` : ''}</div></section>`
      }).join('')
      ligar()
      const info = $('pInfo'), fora = pipeF.resp && foraDoPipe
      info.hidden = !filtrando && !foraDoPipe
      info.innerHTML = `${filtrando ? (total ? `${total} de ${todos.length} no pipeline` : 'Ninguém encontrado no pipeline') : ''}${foraDoPipe && (fora || !filtrando) ? `<button id="pFora">${foraDoPipe} esperando em Conversas, fora do pipeline</button>` : ''}${filtrando && total ? `<span class="pf-lote"><input id="pLoteT" list="pEtqSug" maxlength="30" placeholder="Etiqueta" aria-label="Etiqueta para as empresas filtradas" autocomplete="off"><button type="button" id="pLoteB">Etiquetar ${total === 1 ? 'esta' : `estas ${total}`}</button></span>` : ''}`
      if ($('pLoteB')) { const fazLote = async () => {
        const t = pEtqCanon($('pLoteT').value); if (!t) { $('pLoteT').focus(); return liz('Escreve o nome da etiqueta.') }
        const alvos = todos.filter(bate), ids = alvos.map(x => x.id), b = $('pLoteB'); b.disabled = true; b.textContent = 'Salvando…'
        const { error } = await sb.rpc('etiquetar', { p_ids: ids, p_etiqueta: t })
        if (error) { b.disabled = false; pintar(); return liz('Não consegui etiquetar. Tenta de novo.') }
        alvos.forEach(x => { if (!(x.etiquetas || []).includes(t)) x.etiquetas = [...(x.etiquetas || []), t] })
        pEtqPinta(); pintar(); liz(`Etiqueta ${esc(t)} em ${ids.length} ${ids.length === 1 ? 'empresa' : 'empresas'}.`)
      }; $('pLoteB').onclick = fazLote; $('pLoteT').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fazLote() } } }
      if ($('pFora')) $('pFora').onclick = () => abrirConversas()
      if (rolar && primeira >= 0) { colunaPipe = primeira; board.scrollLeft = board.children[primeira].offsetLeft - board.offsetLeft; marca(mob() ? primeira : -1) }
    }
    pintar()
    board.scrollLeft = mob() ? colunaPipe * (board.children[0].offsetWidth + 12) : pipeX; marca(mob() ? colunaPipe : -1)
    if (!empilhar) $('cap').scrollTop = pipeY
    let tq; $('pQ').oninput = e => { clearTimeout(tq); tq = setTimeout(() => { pipeF.q = e.target.value; pipeF.lim = {}; pintar(true) }, 150) }
    $('pSeg').onchange = e => { pipeF.seg = e.target.value; pipeF.lim = {}; pintar(true) }
    pEtqPinta()
    $('pEtq').onchange = e => { pipeF.etq = e.target.value; pipeF.lim = {}; pintar(true) }
    $('pTemp').querySelectorAll('button').forEach(b => b.onclick = () => { pipeF.temp = pipeF.temp === b.dataset.f ? '' : b.dataset.f; pipeF.lim = {}; $('pTemp').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.f === pipeF.temp)); pintar(true) })
    $('pResp').onclick = e => { pipeF.resp = !pipeF.resp; pipeF.lim = {}; e.currentTarget.setAttribute('aria-pressed', pipeF.resp); pintar(true) }
  }
  if ($('cFila')) $('cFila').onclick = () => abrirFila()
  if ($('cDisp')) $('cDisp').onclick = () => comIA(() => abrirDisparo(true, true))
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
const CHIP_DP = { na_fila: ['na fila', 'f'], enviando: ['enviando…', 'g'], enviado: ['enviado ✓', 'e'], entregue: ['entregue ✓✓', 'e'], lido: ['lido ✓✓', 'e'], respondeu: ['respondeu', 'r'], falhou: ['falhou', 'x'], parou: ['parou', 'x'], sem_whatsapp: ['sem WhatsApp', 'x'] }
const tfmt = t => { t = String(t || '').replace(/^55/, ''); return t.length === 11 ? t.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : t.length === 10 ? t.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3') : t }
let dispTimer = null, convTimer = null
// a mensagem como vai chegar no WhatsApp: {saudacao} vira bom dia, boa tarde ou boa noite pela hora
const comSaudacao = t => { const h = Number(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false })); return String(t || '').replace(/\{saudacao\}/gi, h >= 5 && h < 12 ? 'bom dia' : h >= 12 && h < 18 ? 'boa tarde' : 'boa noite') }
let DP_VERS = [''], DP_ATUAL = 0
// sorteio de trechos: {Olá|Oi|Bom dia}
const comSorteio = t => String(t || '').replace(/\{([^{}]*\|[^{}]*)\}/g, (_, o) => { const l = o.split('|'); return l[Math.floor(Math.random() * l.length)].trim() })
const dpVersoes = () => DP_VERS.map(v => String(v || '').trim()).filter(Boolean)
// seletor com caixas de marcar. grupos = [[título, [[valor, texto, contagem]]]]
const DP_SL = {}
const dpSlHtml = (id, rotulo, grupos) => {
  const total = grupos.reduce((a, g) => a + g[1].length, 0)
  return `<div class="dp-sl" id="${id}"><span class="dp-lbl" id="${id}R">${rotulo}</span>
    <button type="button" class="dp-sl-bt" aria-haspopup="true" aria-expanded="false" aria-labelledby="${id}R ${id}V"><span class="dp-sl-v" id="${id}V"></span>${DP_SETA}</button>
    <div class="dp-sl-p" hidden>
      ${total > 6 ? `<input type="search" class="dp-sl-bu" placeholder="Procurar" aria-label="Procurar em ${rotulo}">` : ''}
      <div class="dp-sl-l">${grupos.map(([t, ops]) => ops.length ? `<div class="dp-sl-bloco">${t ? `<div class="dp-sl-g">${esc(t)}</div>` : ''}${ops.map(([v, x, n]) => `<label class="dp-sl-o"><input type="checkbox" value="${esc(v)}"><span>${esc(x)}</span>${n == null ? '' : `<b>${n}</b>`}</label>`).join('')}</div>` : '').join('')}<p class="dp-sl-nada" hidden>Nada encontrado.</p></div>
      <div class="dp-sl-rod"><button type="button" data-sl-limpa>Limpar</button><button type="button" data-sl-tudo>Marcar todas</button></div>
    </div></div>`
}
const dpSlFechar = (exceto) => document.querySelectorAll('.dp-sl').forEach(el => { if (el === exceto) return; el.querySelector('.dp-sl-p').hidden = true; el.querySelector('.dp-sl-bt').setAttribute('aria-expanded', 'false') })
document.addEventListener('click', e => { if (!e.target.closest?.('.dp-sl')) dpSlFechar() })
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const a = document.querySelector('.dp-sl-bt[aria-expanded="true"]'); if (a) { dpSlFechar(); a.focus() } })
const dpSlLigar = (id, conj, vazio, tudo, aoMudar, foraDoTudo = []) => {
  const el = $(id); if (!el) return
  const bt = el.querySelector('.dp-sl-bt'), p = el.querySelector('.dp-sl-p'), marcas = [...el.querySelectorAll('input[type=checkbox]')], busca = el.querySelector('.dp-sl-bu')
  const texto = i => i.nextElementSibling.textContent
  const pinta = () => {
    marcas.forEach(i => { i.checked = conj.has(i.value) })
    const on = marcas.filter(i => i.checked)
    const todasSemFora = marcas.filter(i => !foraDoTudo.includes(i.value))
    $(id + 'V').textContent = !on.length ? vazio : tudo && on.length === marcas.length ? tudo : tudo && foraDoTudo.length && on.length === todasSemFora.length && on.every(i => todasSemFora.includes(i)) ? 'Todas, menos Perdido' : on.length <= 2 ? on.map(texto).join(', ') : `${texto(on[0])} +${on.length - 1}`
    bt.classList.toggle('tem', !!on.length)
  }
  bt.onclick = () => { const abre = p.hidden; dpSlFechar(el); p.hidden = !abre; bt.setAttribute('aria-expanded', abre); if (abre) { if (busca && !mob()) busca.focus(); p.scrollIntoView({ block: 'nearest' }) } }
  marcas.forEach(i => i.onchange = () => { i.checked ? conj.add(i.value) : conj.delete(i.value); pinta(); aoMudar?.(i.value, i.checked) })
  if (busca) busca.oninput = () => {
    const q = semAc(busca.value.trim()); let algum = false
    el.querySelectorAll('.dp-sl-o').forEach(o => { const ve = semAc(o.textContent).includes(q); o.hidden = !ve; algum = algum || ve })
    el.querySelectorAll('.dp-sl-bloco').forEach(b => { b.hidden = ![...b.querySelectorAll('.dp-sl-o')].some(o => !o.hidden) })
    el.querySelector('.dp-sl-nada').hidden = algum
  }
  el.querySelector('[data-sl-limpa]').onclick = () => { conj.clear(); pinta(); aoMudar?.() }
  const bTudo = el.querySelector('[data-sl-tudo]'); if (!tudo) bTudo.hidden = true
  else bTudo.onclick = () => { marcas.forEach(i => { if (!foraDoTudo.includes(i.value)) conj.add(i.value) }); pinta(); aoMudar?.() }
  DP_SL[id] = { pinta }; pinta()
}
// grupos de mensagens por segmento: a etiqueta escolhida traz as frases do grupo
let DP_GRUPOS = [], DP_GR = null, DP_GR_NOVO = false, DP_GR_ERRO = false, DP_GR_BASE = '[]', DP_SEGS = [], DP_GR_ETQ = new Set()
const dpGrCarregar = async () => { const { data, error } = await sb.from('grupo_mensagem').select('id, nome, etiquetas, versoes').order('nome'); DP_GR_ERRO = !!error; DP_GRUPOS = data || [] }
const dpGrAtual = () => DP_GRUPOS.find(g => g.id === DP_GR)
const dpGrSujo = () => JSON.stringify(dpVersoes()) !== DP_GR_BASE
const dpGrIdentificar = () => { const v = JSON.stringify(dpVersoes()); DP_GR = DP_GRUPOS.find(g => JSON.stringify(g.versoes) === v)?.id || null; DP_GR_NOVO = false; DP_GR_BASE = v }
const dpGrCasa = (g, seg) => (g.etiquetas || []).includes(seg) || semAc(g.nome) === semAc(seg)
const dpGrSegsEscolhidos = () => [...DP_INC].filter(k => k.startsWith('s:') || k.startsWith('e:')).map(k => k.slice(2))
const dpGrFormHtml = () => `<div class="dp-gr-form" id="dGrForm" hidden>
    <label class="dp-lbl" for="dGrNome">Nome do grupo</label>
    <input id="dGrNome" class="dp-gr-in" maxlength="60" placeholder="Escola" autocomplete="off">
    <div id="dGrEtqBox"></div>
    <small class="at-hint">Quando você escolher uma dessas etiquetas no disparo, as mensagens deste grupo aparecem sozinhas.</small>
    <button type="button" class="dp-link dp-gr-del" id="dGrDel" hidden>Excluir grupo</button>
  </div>`
const campoMensagem = () => `<label class="dp-lbl" for="dGrupo">Grupo de mensagens</label>
      <div class="dp-gr-l"><select id="dGrupo" class="dp-gr-s"></select><button type="button" class="btn line sm" id="dGrEdita" hidden>Editar</button></div>
      <small class="at-hint dp-gr-dica" id="dGrDica" hidden></small>
      ${dpGrFormHtml()}
      <label class="dp-lbl" for="dMsg">Mensagem que vai ser enviada</label>
      <div class="dp-vers" id="dVers"></div>
      <textarea id="dMsg" class="dp-ta" rows="3" maxlength="1000"></textarea>
      <small class="at-hint"><b>{saudacao}</b> vira bom dia, boa tarde ou boa noite. <b>{Olá|Oi|Bom dia}</b> sorteia uma opção por pessoa.</small>
      <button type="button" class="btn line sm dp-gr-salva" id="dGrSalva" hidden></button>
      <div class="dp-cfg" style="margin-top:8px">Vai chegar assim: <b id="dMsgPrev"></b></div>
      <div class="dp-teste"><input id="dTel" class="at-in" inputmode="tel" placeholder="Seu número" aria-label="Seu número com DDD para receber o teste" autocomplete="tel"><button type="button" class="btn line sm" id="dTeste">Enviar teste para mim</button></div>`
const ligarVersoes = () => {
  const t = $('dMsg'); if (!t) return
  const previa = () => { $('dMsgPrev').textContent = comSaudacao(comSorteio(t.value.trim())) || 'escreva a mensagem' }
  dpGrIdentificar()
  const pinta = () => {
    $('dVers').innerHTML = DP_VERS.map((_, i) => `<button type="button" class="${i === DP_ATUAL ? 'on' : ''}" data-v="${i}" aria-label="Versão ${i + 1}">${i + 1}</button>`).join('') + (DP_VERS.length < 20 ? '<button type="button" data-vmais aria-label="Nova versão">+</button>' : '') + (DP_VERS.length > 1 ? '<button type="button" class="dp-vdel" data-vdel>Excluir esta</button>' : '')
    $('dVers').querySelectorAll('[data-v]').forEach(b => b.onclick = () => { DP_ATUAL = +b.dataset.v; pinta() })
    const mais = $('dVers').querySelector('[data-vmais]'); if (mais) mais.onclick = () => { DP_VERS.push(''); DP_ATUAL = DP_VERS.length - 1; pinta(); t.focus() }
    const del = $('dVers').querySelector('[data-vdel]'); if (del) del.onclick = () => { DP_VERS.splice(DP_ATUAL, 1); DP_ATUAL = Math.max(0, DP_ATUAL - 1); pinta() }
    t.value = DP_VERS[DP_ATUAL] || ''; previa(); dpGrPinta()
  }
  t.oninput = () => { DP_VERS[DP_ATUAL] = t.value; previa(); dpGrPinta() }
  dpGrRepintaVersoes = pinta
  pinta()
  dpGrLigar()
  try { $('dTel').value = localStorage.getItem('kz_tel_teste') || '' } catch (_) {}
  $('dTeste').onclick = async () => {
    const b = $('dTeste'), telefone = $('dTel').value.trim(), versoes = dpVersoes()
    if (!telefone) return liz('Coloca o seu número com DDD.')
    if (!versoes.length) return liz('Escreve a mensagem antes de testar.')
    try { localStorage.setItem('kz_tel_teste', telefone) } catch (_) {}
    b.disabled = true; b.textContent = 'Enviando…'
    try { const r = await chamar('disparo_teste', { telefone, versoes }); liz(`Teste enviado: ${r.enviadas} ${r.enviadas === 1 ? 'versão' : 'versões'}.`) } catch (e) { liz(esc(e.message || 'O teste não saiu. Tenta de novo.')) }
    b.disabled = false; b.textContent = 'Enviar teste para mim'
  }
}
let dpGrRepintaVersoes = () => {}
const dpGrAplicar = g => {
  DP_GR = g ? g.id : null; DP_GR_NOVO = false
  DP_VERS = g ? [...g.versoes] : [saudacaoDono || 'Olá, {saudacao}, tudo bem?']; DP_ATUAL = 0
  DP_GR_BASE = JSON.stringify(dpVersoes())
  $('dGrForm').hidden = true
  dpGrRepintaVersoes(); dpPintarPublico()
}
const dpGrAbrirForm = () => {
  const g = dpGrAtual(), f = $('dGrForm')
  $('dGrNome').value = g ? g.nome : ''
  DP_GR_ETQ = new Set(g ? g.etiquetas : dpGrSegsEscolhidos())
  const ops = [...new Set([...DP_SEGS, ...DP_GR_ETQ])].sort((x, y) => x.localeCompare(y)).map(x => [x, x])
  $('dGrEtqBox').innerHTML = ops.length ? dpSlHtml('slGrEtq', 'Etiquetas que trazem este grupo', [['', ops]]) : ''
  dpSlLigar('slGrEtq', DP_GR_ETQ, 'Nenhuma etiqueta', '')
  $('dGrDel').hidden = !g; $('dGrDel').textContent = 'Excluir grupo'; delete $('dGrDel').dataset.conf
  f.hidden = false
}
const dpGrPinta = () => {
  const sel = $('dGrupo'); if (!sel) return
  const v = DP_GR_NOVO ? 'novo' : DP_GR || ''
  sel.innerHTML = `<option value="">Sem grupo</option>${DP_GRUPOS.map(g => `<option value="${g.id}">${esc(g.nome)} (${g.versoes.length} ${g.versoes.length === 1 ? 'mensagem' : 'mensagens'})</option>`).join('')}<option value="novo">Novo grupo</option>`
  sel.value = v
  const g = dpGrAtual(), bt = $('dGrSalva'), formAberto = !$('dGrForm').hidden
  $('dGrEdita').hidden = !g || formAberto
  bt.hidden = !(DP_GR_NOVO || formAberto || dpGrSujo())
  bt.textContent = g ? `Salvar em ${g.nome}` : 'Salvar como grupo'
  const segs = dpGrSegsEscolhidos(), dica = $('dGrDica')
  const semGrupo = !g && !DP_GR_NOVO && segs.length && !DP_GRUPOS.some(x => segs.every(s => dpGrCasa(x, s)))
  dica.hidden = !(DP_GR_ERRO || semGrupo)
  dica.textContent = DP_GR_ERRO ? 'Não consegui abrir seus grupos. Feche e abra o disparo de novo.' : semGrupo ? 'Nenhum grupo tem essa etiqueta ainda. Escolha Novo grupo para criar.' : ''
}
const dpGrAuto = () => {
  if (!$('dGrupo')) return
  const segs = dpGrSegsEscolhidos()
  if (segs.length) {
    const cand = DP_GRUPOS.filter(g => segs.every(s => dpGrCasa(g, s)))
    if (cand.length === 1 && cand[0].id !== DP_GR) {
      if (dpGrSujo()) liz(`Você mudou as mensagens. Para trocar, escolha ${esc(cand[0].nome)} no grupo de mensagens.`)
      else { dpGrAplicar(cand[0]); liz(`Trouxe ${cand[0].versoes.length} ${cand[0].versoes.length === 1 ? 'mensagem' : 'mensagens'} do grupo ${esc(cand[0].nome)}.`) }
    }
  }
  dpGrPinta()
}
const dpGrLigar = () => {
  const sel = $('dGrupo'); if (!sel) return
  sel.onchange = () => {
    const v = sel.value
    if (dpGrSujo() && sel.dataset.conf !== v) { sel.dataset.conf = v; sel.value = DP_GR_NOVO ? 'novo' : DP_GR || ''; return liz('Você tem mensagens sem salvar. Salve ou escolha de novo para descartar.') }
    delete sel.dataset.conf
    if (v === 'novo') { DP_GR = null; DP_GR_NOVO = true; DP_VERS = ['']; DP_ATUAL = 0; DP_GR_BASE = '[]'; dpGrAbrirForm(); dpGrRepintaVersoes(); dpPintarPublico(); $('dGrNome').focus(); return }
    dpGrAplicar(DP_GRUPOS.find(g => g.id === v) || null)
  }
  $('dGrEdita').onclick = () => { dpGrAbrirForm(); dpGrPinta(); $('dGrNome').focus() }
  $('dGrSalva').onclick = async () => {
    const g = dpGrAtual(), versoes = dpVersoes(), bt = $('dGrSalva'), formAberto = !$('dGrForm').hidden
    if (!versoes.length) return liz('Escreve pelo menos uma mensagem.')
    if (!g && !formAberto) { DP_GR_NOVO = true; dpGrAbrirForm(); dpGrPinta(); $('dGrNome').focus(); return }
    const nome = formAberto ? $('dGrNome').value.trim() : g.nome
    if (!nome) { $('dGrNome').focus(); return liz('Dá um nome pro grupo.') }
    const dados = { nome, versoes, etiquetas: formAberto ? [...DP_GR_ETQ] : g.etiquetas, atualizado_em: new Date().toISOString() }
    bt.disabled = true
    const q = g ? sb.from('grupo_mensagem').update(dados).eq('id', g.id) : sb.from('grupo_mensagem').insert(dados)
    const { data, error } = await q.select('id, nome, etiquetas, versoes').single()
    bt.disabled = false
    if (error) return liz(error.code === '23505' ? 'Já existe um grupo com esse nome.' : 'Não consegui salvar o grupo. Tenta de novo.')
    DP_GRUPOS = [...DP_GRUPOS.filter(x => x.id !== data.id), data].sort((a, b) => a.nome.localeCompare(b.nome))
    DP_GR = data.id; DP_GR_NOVO = false; DP_GR_BASE = JSON.stringify(versoes); $('dGrForm').hidden = true
    dpGrPinta(); liz(`Grupo ${esc(data.nome)} salvo com ${versoes.length} ${versoes.length === 1 ? 'mensagem' : 'mensagens'}.`)
  }
  $('dGrDel').onclick = async () => {
    const b = $('dGrDel'), g = dpGrAtual(); if (!g) return
    if (!b.dataset.conf) { b.dataset.conf = '1'; b.textContent = 'Toque de novo para excluir'; return }
    const { error } = await sb.from('grupo_mensagem').delete().eq('id', g.id)
    if (error) return liz('Não consegui excluir o grupo.')
    DP_GRUPOS = DP_GRUPOS.filter(x => x.id !== g.id); DP_GR = null; DP_GR_BASE = '[]'; $('dGrForm').hidden = true
    dpGrPinta(); liz(`Grupo ${esc(g.nome)} excluído. As mensagens continuam aqui até você trocar.`)
  }
}
const dpOpcoes = (vals, atual, fmt) => [...new Set([...vals, atual])].sort((a, b) => a - b).map(v => `<option value="${v}"${v === atual ? ' selected' : ''}>${fmt(v)}</option>`).join('')
const DP_SETA = '<i class="dp-seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></i>'
const dpResumo = c => `${c.intervalo_seg_min} a ${c.intervalo_seg_max} s · pausa a cada ${c.pausa_cada_min} a ${c.pausa_cada_max} · até ${c.limite_dia}/dia · ${c.hora_ini}h às ${c.hora_fim}h`
const DP_PADRAO = { intervalo_seg_min: 30, intervalo_seg_max: 90, pausa_cada_min: 2, pausa_cada_max: 4, pausa_dur_min: 5, pausa_dur_max: 12, limite_dia: 300, hora_ini: 10, hora_fim: 18, dias: [1, 2, 3, 4, 5, 6], modo_versao: 'sequencia' }
const dpCampoN = (id, v) => `<input id="${id}" type="number" min="0" inputmode="numeric" value="${v}" aria-label="${id}">`
// acordeão das configurações: editável até ligar; rodando, só mostra
const dpConfig = (dados = {}, soLer = false) => {
  const c = { ...DP_PADRAO, ...dados }, nd = (c.dias || []).length
  if (soLer) return `<details class="dp-acc"><summary><span><b>Configurações</b><small>${dpResumo(c)}</small></span>${DP_SETA}</summary><p class="dp-var">Intervalo sorteado a cada envio, sem repetir o anterior. Descansa de ${c.pausa_dur_min} a ${c.pausa_dur_max} min a cada ${c.pausa_cada_min} a ${c.pausa_cada_max} mensagens.</p></details>`
  return `<details class="dp-acc"><summary><span><b>Configurações</b><small id="dCfgRes">${dpResumo(c)}</small></span>${DP_SETA}</summary>
    <div class="dp-cf">
      <div class="dp-sec">Intervalo entre cada mensagem <span>(sorteado a cada envio)</span></div>
      <div class="dp-li">de ${dpCampoN('dIntMin', c.intervalo_seg_min)} a ${dpCampoN('dIntMax', c.intervalo_seg_max)} <select id="dIntUn" aria-label="Unidade do intervalo"><option value="1">segundos</option><option value="60">minutos</option></select></div>
      <div class="dp-sec">Pausa longa</div>
      <div class="dp-li">a cada ${dpCampoN('dCadaMin', c.pausa_cada_min)} a ${dpCampoN('dCadaMax', c.pausa_cada_max)} mensagens</div>
      <div class="dp-li">descansar ${dpCampoN('dDurMin', c.pausa_dur_min)} a ${dpCampoN('dDurMax', c.pausa_dur_max)} minutos</div>
      <div class="dp-sec">Versões da mensagem</div>
      <select id="dModo" aria-label="Como usar as versões"><option value="sequencia"${c.modo_versao === 'sorteio' ? '' : ' selected'}>Alternar em sequência (1, 2, 3, 1, 2…)</option><option value="sorteio"${c.modo_versao === 'sorteio' ? ' selected' : ''}>Sortear uma por contato</option></select>
      <div class="dp-sec">Máximo por dia</div>
      <div class="dp-li">${dpCampoN('dLim', c.limite_dia)} mensagens</div>
      <div class="dp-sec">Horário e dias</div>
      <div class="dp-li">das <select id="dHi" aria-label="Início">${dpOpcoes(Array.from({ length: 24 }, (_, h) => h), c.hora_ini, v => v)}</select> às <select id="dHf" aria-label="Fim">${dpOpcoes(Array.from({ length: 24 }, (_, h) => h + 1), c.hora_fim, v => v)}</select> h</div>
      <select id="dDias" aria-label="Dias"><option value="5"${nd <= 5 ? ' selected' : ''}>segunda a sexta</option><option value="6"${nd === 6 ? ' selected' : ''}>segunda a sábado</option><option value="7"${nd === 7 ? ' selected' : ''}>todos os dias</option></select>
      <p class="dp-var" style="padding:0">Cada espera é sorteada dentro da faixa e nunca repete a anterior. Para 100+ pessoas, use no mínimo 30 a 90 segundos.</p>
    </div></details>`
}
// lê a tela e corrige: nada abaixo de 0, máximo nunca menor que o mínimo, intervalo nunca abaixo de 15 s
const dpLer = () => {
  const n = id => Math.max(0, Math.round(+$(id).value || 0)), un = +$('dIntUn').value || 1
  const imin = Math.max(15, n('dIntMin') * un), cmin = n('dCadaMin'), dmin = n('dDurMin')
  return { complemento_ligado: DP_COMP_ON, complementos: DP_COMP.map(v => String(v || '').trim()).filter(Boolean), versoes: dpVersoes(), modo_versao: $('dModo').value, intervalo_seg_min: imin, intervalo_seg_max: Math.max(imin, n('dIntMax') * un), pausa_cada_min: cmin, pausa_cada_max: Math.max(cmin, n('dCadaMax')), pausa_dur_min: dmin, pausa_dur_max: Math.max(dmin, n('dDurMax')), limite_dia: Math.min(300, Math.max(1, n('dLim'))), hora_ini: +$('dHi').value, hora_fim: +$('dHf').value, dias: { 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] }[$('dDias').value] }
}
const ligarConfig = () => {
  if (!$('dIntMin')) return
  document.querySelector('.dp-cf').addEventListener('input', () => { $('dCfgRes').textContent = dpResumo(dpLer()) })
}
// atendimento automático: a Liz responde quem respondeu ao disparo. Desligado, a resposta fica em Conversas para você.
let DP_ATENDE = false
const dpAtende = () => `<label class="dp-sw"><span><b>Atendimento automático</b><small id="dAtTx"></small></span><input type="checkbox" role="switch" id="dAtende"${DP_ATENDE ? ' checked' : ''}><i aria-hidden="true"></i></label>`
const ligarAtende = () => {
  const c = $('dAtende'); if (!c) return
  const tx = () => { $('dAtTx').textContent = c.checked ? 'A Liz responde quem responder ao disparo.' : 'Desligado: as respostas ficam em Conversas para você.' }
  tx()
  c.onchange = async () => {
    const quer = c.checked; c.disabled = true
    const { error } = await sb.from('canal_whatsapp').update({ atende: quer }).eq('dono', usuario.id)
    c.disabled = false
    if (error) { c.checked = !quer; tx(); return liz('Não consegui mudar o atendimento. Tenta de novo.') }
    DP_ATENDE = quer; tx(); liz(quer ? 'Atendimento automático ligado.' : 'Atendimento automático desligado.')
  }
}
// complemento automático: para quem caiu na saudação automática da clínica
const DP_COMP_PADRAO = 'Oi! Vi que caiu na mensagem automática de vocês, então vou direto ao ponto. Hoje cuido sozinho de mais de 20 clientes com ajuda da IA. Sem ela, eu pagaria mais de R$ 12 mil em salários, e sei como isso pesa para quem empreende. Posso te mostrar como funciona?'
let DP_COMP = [DP_COMP_PADRAO], DP_COMP_ON = false
const dpComplemento = () => `<div class="dp-comp"><label class="dp-sw"><span><b>Complemento automático</b><small>Para quem cair na saudação automática: uma vez, de 2 a 5 minutos depois. Cancela se a pessoa ou você responder.</small></span><input type="checkbox" role="switch" id="dComp"${DP_COMP_ON ? ' checked' : ''}><i aria-hidden="true"></i></label>
  <div id="dCompBox"${DP_COMP_ON ? '' : ' hidden'}><div class="dp-vers" id="dCompV"></div><textarea id="dCompT" class="dp-ta" rows="6" maxlength="1000" aria-label="Texto do complemento"></textarea><button type="button" class="btn line sm" id="dCompS" style="width:100%;margin-top:8px">Salvar complemento</button></div></div>`
const ligarComplemento = campId => {
  const c = $('dComp'); if (!c) return
  const t = $('dCompT'), box = $('dCompV'); let at = 0
  const textos = () => DP_COMP.map(v => String(v || '').trim()).filter(Boolean)
  const pinta = () => {
    box.innerHTML = DP_COMP.map((_, i) => `<button type="button" class="${i === at ? 'on' : ''}" data-i="${i}" aria-label="Versão ${i + 1}">${i + 1}</button>`).join('') + (DP_COMP.length < 20 ? '<button type="button" data-m aria-label="Nova versão">+</button>' : '') + (DP_COMP.length > 1 ? '<button type="button" class="dp-vdel" data-d>Excluir esta</button>' : '')
    box.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { at = +b.dataset.i; pinta() })
    const m = box.querySelector('[data-m]'); if (m) m.onclick = () => { DP_COMP.push(''); at = DP_COMP.length - 1; pinta(); t.focus() }
    const d = box.querySelector('[data-d]'); if (d) d.onclick = () => { DP_COMP.splice(at, 1); at = Math.max(0, at - 1); pinta() }
    t.value = DP_COMP[at] || ''
  }
  t.oninput = () => { DP_COMP[at] = t.value }
  const salvar = async () => { if (!campId) return true; const { error } = await sb.from('campanha').update({ complemento_ligado: c.checked, complementos: textos() }).eq('id', campId); if (error) liz('Não consegui salvar o complemento. Tenta de novo.'); return !error }
  c.onchange = async () => {
    if (c.checked && !textos().length) DP_COMP = [DP_COMP_PADRAO]
    const antes = DP_COMP_ON; DP_COMP_ON = c.checked; $('dCompBox').hidden = !c.checked; pinta(); c.disabled = true
    const ok = await salvar(); c.disabled = false
    if (!ok) { DP_COMP_ON = antes; c.checked = antes; $('dCompBox').hidden = !antes; return }
    if (campId) liz(c.checked ? 'Complemento automático ligado.' : 'Complemento automático desligado.')
  }
  $('dCompS').onclick = async () => { if (!textos().length) return liz('Escreve o texto do complemento.'); if (await salvar()) liz(campId ? 'Complemento salvo.' : 'Complemento pronto. Vale quando montar o disparo.') }
  pinta()
}
// Kompila Guardian: protege o número e avisa antes de dar problema
const DP_G_NOMES = [['supressao', 'Consultar lista de supressão', 'Quem pediu para sair não recebe.'], ['duplicidade', 'Verificar duplicidade', 'O mesmo número entra uma vez.'], ['frequencia', 'Verificar frequência', 'Espera 3 dias e no máximo 4 mensagens em 30 dias.'], ['conteudo', 'Validar conteúdo', 'Bloqueia sem identificação, sem como sair ou com link encurtado.']]
let DP_G = { supressao: true, duplicidade: true, frequencia: false, conteudo: false }, DP_OPT = new Set(), DP_ENVIOS = {}, DP_QUEDA = null, DP_G_TELS = []
const dpFrequente = tel => { const l = DP_ENVIOS[tel] || []; return l.length >= 4 || l.some(t => Date.now() - t < 3 * 864e5) }
async function carregarGuardian() {
  const desde = new Date(Date.now() - 30 * 864e5).toISOString()
  const [{ data: can }, { data: opt }, { data: env }, { data: cps }] = await Promise.all([
    sb.from('canal_whatsapp').select('guardian').eq('dono', usuario.id).maybeSingle(),
    sb.from('optout').select('telefone').limit(5000),
    sb.from('envio').select('telefone, enviado_em').gte('enviado_em', desde).limit(5000),
    sb.from('campanha').select('motivo_pausa').ilike('motivo_pausa', '%caiu%').gte('criada_em', new Date(Date.now() - 7 * 864e5).toISOString()).limit(1)
  ])
  DP_G = { ...DP_G, ...(can?.guardian || {}) }; DP_OPT = new Set((opt || []).map(x => x.telefone)); DP_ENVIOS = {}
  ;(env || []).forEach(e => { (DP_ENVIOS[e.telefone] = DP_ENVIOS[e.telefone] || []).push(new Date(e.enviado_em).getTime()) })
  DP_QUEDA = cps?.[0] || null
}
const DP_SPAM = /ganhe|gratis|promocao imperdivel|clique aqui|ultimas vagas|dinheiro facil|renda extra|sorteio|premio|oferta relampago|100% garantido/
const dpItensGuardian = tels => {
  const itens = [], vers = dpVersoes(), add = (n, t) => itens.push([n, t])
  const ruins = vers.filter(v => /(bit\.ly|tinyurl|cutt\.ly|\bt\.co\/|is\.gd)/i.test(v)).length
  if (ruins) add(DP_G.conteudo ? 'grave' : 'aviso', `${ruins === 1 ? 'Uma versão tem' : ruins + ' versões têm'} link encurtado, sinal forte de spam.`)
  if (DP_G.conteudo) {
    const sem = vers.filter(v => !/(\bsair\b|parar|nao receber|não receber)/i.test(v)).length
    if (sem) add('grave', `${sem === 1 ? 'Uma versão não diz' : sem + ' versões não dizem'} como parar de receber.`)
    const semId = vers.filter(v => !/(me chamo|\bsou\b|aqui é|aqui e)/i.test(v)).length
    if (semId) add('grave', `${semId === 1 ? 'Uma versão não diz' : semId + ' versões não dizem'} quem está falando.`)
  }
  vers.forEach((v, i) => { const sa = semAc(v), letras = v.replace(/[^a-zA-ZÀ-ú]/g, ''), cx = letras.replace(/[^A-ZÀ-Ú]/g, '').length; if (DP_SPAM.test(sa)) add('aviso', `Versão ${i + 1} tem palavra de spam.`); if (letras.length > 30 && cx / letras.length > .45) add('aviso', `Versão ${i + 1} tem muita letra maiúscula.`); if ((v.match(/https?:\/\//g) || []).length > 2) add('aviso', `Versão ${i + 1} tem mais de 2 links.`) })
  const longas = vers.filter(v => v.length > 280).length
  if (longas) add('aviso', `${longas === 1 ? 'Uma versão é longa' : longas + ' versões são longas'} para quem não te conhece: aumenta a chance de denúncia.`)
  if (vers.length === 1 && tels.length > 20) add('aviso', `O mesmo texto para ${tels.length} pessoas parece disparo. Use mais versões.`)
  if ($('dIntMin')) { const c = dpLer(), ciclo = (c.intervalo_seg_min + c.intervalo_seg_max) / 2 + (c.pausa_cada_max > 0 ? ((c.pausa_dur_min + c.pausa_dur_max) / 2 * 60) / Math.max(1, (c.pausa_cada_min + c.pausa_cada_max) / 2) : 0), porHora = Math.round(3600 / ciclo); if (porHora > 30) add('aviso', `Ritmo de ${porHora} mensagens por hora é alto. O último bloqueio veio depois de 50 mensagens em 1h14.`) }
  if (DP_QUEDA) add('aviso', 'Um número seu caiu nos últimos 7 dias. Comece devagar.')
  const recentes = tels.filter(dpFrequente).length
  if (recentes && !DP_G.frequencia) add('aviso', `${recentes} já ${recentes === 1 ? 'recebeu' : 'receberam'} mensagem há menos de 3 dias ou 4 vezes no mês. Ligue a frequência para tirar.`)
  const fora = tels.filter(t => DP_OPT.has(t)).length
  if (fora && !DP_G.supressao) add('grave', `${fora} ${fora === 1 ? 'pediu' : 'pediram'} para sair e vão receber.`)
  return itens
}
const dpGuardianHtml = () => `<details class="dp-acc" id="dGuard" open><summary><span><b>Kompila Guardian</b><small id="dGRes"></small></span>${DP_SETA}</summary>
  <div class="dp-gitens" id="dGItens"></div>
  <div class="dp-glist">${DP_G_NOMES.map(([k, t, d]) => `<label class="dp-sw"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" role="switch" data-g="${k}"${DP_G[k] ? ' checked' : ''}><i aria-hidden="true"></i></label>`).join('')}</div>
  <button type="button" class="dp-link" data-qual style="padding:4px 12px 12px">Ver painel de qualidade</button></details>`
const pintarGuardian = (tels = DP_G_TELS) => {
  DP_G_TELS = tels; if (!$('dGItens')) return
  const itens = dpItensGuardian(tels), graves = itens.filter(i => i[0] === 'grave').length, avisos = itens.length - graves
  $('dGRes').textContent = graves ? `${graves} problema${graves === 1 ? '' : 's'} grave${graves === 1 ? '' : 's'}: não dá para enviar assim` : avisos ? `${avisos} aviso${avisos === 1 ? '' : 's'} antes de enviar` : 'Nada a apontar'
  $('dGRes').className = graves ? 'g-grave' : avisos ? 'g-aviso' : 'g-ok'
  $('dGItens').innerHTML = itens.map(([n, t]) => `<div class="g-i g-${n}">${esc(t)}</div>`).join('')
}
const guardianBloqueia = () => { const g = dpItensGuardian(DP_G_TELS).filter(i => i[0] === 'grave'); if (!g.length) return false; const d = $('dGuard'); if (d) d.open = true; liz(esc(g[0][1])); return true }
const ligarGuardian = () => {
  document.querySelectorAll('[data-g]').forEach(c => c.onchange = async () => {
    const k = c.dataset.g, antes = DP_G[k]; DP_G = { ...DP_G, [k]: c.checked }
    const { error } = await sb.from('canal_whatsapp').update({ guardian: DP_G }).eq('dono', usuario.id)
    if (error) { DP_G = { ...DP_G, [k]: antes }; c.checked = antes; return liz('Não consegui salvar. Tenta de novo.') }
    if ($('dpLista')) dpPintarPublico(); else pintarGuardian()
  })
  document.querySelectorAll('[data-qual]').forEach(b => b.onclick = () => abrirQualidade())
  $('dMsg')?.addEventListener('input', () => pintarGuardian())
  $('dVers')?.addEventListener('click', () => setTimeout(() => pintarGuardian(), 0))
  document.querySelector('.dp-cf')?.addEventListener('input', () => pintarGuardian())
  pintarGuardian()
}
// painel de Qualidade: últimos 30 dias, com os critérios da extensão
const qualNivel = c => { if (/caiu/i.test(c.motivo_pausa || '') || c.recl >= 1 || c.saiu / Math.max(1, c.env) >= .03 || c.falha / Math.max(1, c.env + c.falha) >= .15) return ['risco', 'Risco']; if (c.saiu / Math.max(1, c.env) >= .01 || c.falha / Math.max(1, c.env + c.falha) >= .07) return ['atencao', 'Atenção']; return ['boa', 'Boa'] }
async function abrirQualidade(empilhar = true) {
  const desde = new Date(Date.now() - 30 * 864e5).toISOString()
  const [{ data: evs }, { data: cps }, { data: opt }, { data: esp }, { count: auto }] = await Promise.all([
    sb.from('envio').select('campanha_id, telefone, status, enviado_em, entregue_em, lido_em, resposta, complemento_status').gte('criado_em', desde).limit(10000),
    sb.from('campanha').select('id, nome, status, motivo_pausa, criada_em').gte('criada_em', desde).order('criada_em', { ascending: false }).limit(20),
    sb.from('optout').select('telefone, motivo, criado_em').order('criado_em', { ascending: false }).limit(5000),
    sb.rpc('aguardando_resposta'),
    sb.from('conversa').select('id', { count: 'exact', head: true }).eq('direcao', 'in').eq('automatica', true).gte('criado_em', desde)
  ])
  const es = evs || [], saiu = e => !!e.enviado_em, RE = /spam|denunci|bloquear|golpe|procon|ass[eé]dio/i
  const total = { env: es.filter(saiu).length, ent: es.filter(e => e.entregue_em).length, lid: es.filter(e => e.lido_em).length, resp: es.filter(e => e.status === 'respondeu').length, sem: es.filter(e => e.status === 'sem_whatsapp').length, falha: es.filter(e => e.status === 'falhou').length, saidas: es.filter(e => e.status === 'parou').length, recl: es.filter(e => RE.test(e.resposta || '')).length, comp: es.filter(e => e.complemento_status === 'enviado').length }
  const pct = (a, b) => b ? `${Math.round(a / b * 100)}%` : ''
  const cards = [['Enviadas', total.env, ''], ['Entregues', total.ent, total.ent ? pct(total.ent, total.env) : 'medido após reconectar'], ['Lidas', total.lid, total.lid ? pct(total.lid, total.env) : 'medido após reconectar'], ['Responderam', total.resp, pct(total.resp, total.env)], ['Saudação automática', auto || 0, ''], ['Complementos', total.comp, ''], ['Sem WhatsApp', total.sem, ''], ['Falhas', total.falha, ''], ['Pediram para sair', total.saidas, pct(total.saidas, total.env)], ['Reclamações', total.recl, ''], ['Precisam de você', (esp || []).length, '']]
  const camp = (cps || []).map(c => { const l = es.filter(e => e.campanha_id === c.id), x = { ...c, env: l.filter(saiu).length, resp: l.filter(e => e.status === 'respondeu').length, falha: l.filter(e => e.status === 'falhou').length, saiu: l.filter(e => e.status === 'parou').length, recl: l.filter(e => RE.test(e.resposta || '')).length }; x.nivel = qualNivel(x); return x }).filter(c => c.env || c.falha)
  const optHtml = q => { const s = String(q || '').replace(/\D/g, ''), l = (opt || []).filter(o => !s || o.telefone.includes(s)); return l.length ? l.slice(0, 200).map(o => `<div class="dp-it"><div class="dp-it-top"><div><b>${esc(tfmt(o.telefone))}</b><small>${esc(String(o.motivo || 'Sem motivo').slice(0, 70))} · ${new Date(o.criado_em).toLocaleDateString('pt-BR')}</small></div><button type="button" class="dp-link" data-reat="${esc(o.telefone)}">Reativar</button></div></div>`).join('') : '<p class="dp-var" style="padding:14px">Ninguém na lista.</p>' }
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Qualidade do disparo</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b dp ql">
    <h3 class="dp-esq-t">Últimos 30 dias</h3>
    <div class="ql-g">${cards.map(([t, n, s]) => `<div class="ql-c"><b>${n}</b><span>${t}${s ? `<small>${esc(s)}</small>` : ''}</span></div>`).join('')}</div>
    <h3 class="dp-esq-t">Por campanha</h3>
    ${camp.length ? `<div class="dp-list">${camp.map(c => `<div class="dp-it"><div class="dp-it-top"><div><b>${esc(c.nome)}</b><small>${new Date(c.criada_em).toLocaleDateString('pt-BR')} · ${c.env} enviadas · ${c.resp} responderam · ${c.falha} falhas · ${c.saiu} saíram${c.motivo_pausa ? ` · ${esc(c.motivo_pausa)}` : ''}</small></div><span class="ql-n ql-${c.nivel[0]}">${c.nivel[1]}</span></div></div>`).join('')}</div>` : '<p class="dp-var" style="padding:0">Nenhuma campanha com envio nesse período.</p>'}
    ${(esp || []).length ? `<h3 class="dp-esq-t">Precisam de você</h3><div class="dp-list">${esp.slice(0, 30).map(e => `<div class="dp-it"><div class="dp-it-top"><div><b>${esc(e.nome || tfmt(e.fone || e.telefone))}</b><small>${esc(String(e.texto || '').slice(0, 90))}</small></div><button type="button" class="dp-link" data-abre="${esc(e.telefone)}">Abrir conversa</button></div></div>`).join('')}</div>` : ''}
    <h3 class="dp-esq-t">Lista de supressão <span id="qlN">${(opt || []).length}</span></h3>
    <div class="dp-teste"><input id="qlB" class="at-in" inputmode="tel" placeholder="Buscar ou adicionar número" aria-label="Buscar ou adicionar número" autocomplete="off"><button type="button" class="btn line sm" id="qlAdd">Adicionar</button></div>
    <div class="dp-list" id="qlLista">${optHtml('')}</div>
    <button type="button" class="dp-link" id="qlCsv">Baixar lista</button>
  </div>`
  $('capX').onclick = fecharCapivara
  if (empilhar) empilha('qualidade')
  const ligarLista = () => {
    $('qlLista').querySelectorAll('[data-reat]').forEach(b => b.onclick = async () => { b.disabled = true; const { error } = await sb.from('optout').delete().eq('telefone', b.dataset.reat); if (error) { b.disabled = false; return liz('Não consegui reativar.') } liz('Número reativado.'); abrirQualidade(false) })
  }
  ligarLista()
  $('qlB').oninput = e => { $('qlLista').innerHTML = optHtml(e.target.value); ligarLista() }
  $('qlAdd').onclick = async () => { const tel = dpTelefone($('qlB').value); if (!tel) return liz('Confere o número, com DDD.'); const { error } = await sb.from('optout').upsert({ dono: usuario.id, telefone: tel, motivo: 'Adicionado à mão' }, { onConflict: 'dono,telefone' }); if (error) return liz('Não consegui adicionar.'); liz('Número na lista de supressão.'); abrirQualidade(false) }
  $('qlCsv').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿Telefone;Motivo;Data\n' + (opt || []).map(o => [o.telefone, String(o.motivo || '').replace(/[;\n]/g, ' '), o.criado_em].join(';')).join('\n')], { type: 'text/csv;charset=utf-8' })); a.download = 'lista-supressao.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000) }
  $('cap').querySelectorAll('[data-abre]').forEach(b => b.onclick = () => abrirConversas(true, b.dataset.abre))
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
}
// público do pipeline, como na extensão: checkbox de etapas com a contagem e exclusão por etiqueta
let DP_PIPE = [], DP_ETAPAS = new Set(['a_contatar']), DP_EXC = new Set(), DP_INC = new Set()
const dpFoneDe = d => {
  const e = d.empresa || {}
  let x = String(e.whatsapp || (/^\(?\d{2}\)?\s?9/.test(e.telefone || '') ? e.telefone : '') || d.telefone || '').replace(/\D/g, '').replace(/^0+/, '')
  if (x.length === 10 || x.length === 11) x = '55' + x
  return x.length >= 12 && x.length <= 13 ? x : ''
}
const dpTem = (l, conj) => conj.has('t:' + l.temp) || (l.seg && conj.has('s:' + l.seg)) || (l.cat && conj.has('c:' + l.cat)) || (l.etq || []).some(t => conj.has('e:' + t))
// tirar quem já respondeu vale pela conversa, não só pela etapa: dá para responder e continuar em A contatar
let DP_TIRA_RESP = true, DP_RESP_TEL = new Set()
const DP_ETAPA_RESPONDEU = ['respondeu', 'reuniao', 'cliente']
// lista, etiqueta, categoria e temperatura somam: Estetica + Frio é quem está nas duas
const dpNaEscolha = l => { const k = [...DP_INC], tem = p => k.some(x => x.startsWith(p)); return (!tem('e:') || (l.etq || []).some(t => DP_INC.has('e:' + t))) && (!tem('s:') || DP_INC.has('s:' + l.seg)) && (!tem('c:') || DP_INC.has('c:' + l.cat)) && (!tem('t:') || DP_INC.has('t:' + l.temp)) }
const dpTemEtiqueta = l => dpTem(l, DP_EXC) || !dpNaEscolha(l)
const dpPublico = () => {
  const vistos = new Set(), alvo = []; let semCel = 0, porEtiqueta = 0, repetidos = 0, suprimidos = 0, frequentes = 0, responderam = 0
  for (const l of DP_PIPE) {
    if (!DP_ETAPAS.has(l.etapa)) continue
    if (DP_TIRA_RESP && l.resp) { responderam++; continue }
    if (!l.tel) { semCel++; continue }
    if (DP_G.supressao && DP_OPT.has(l.tel)) { suprimidos++; continue }
    if (DP_G.frequencia && dpFrequente(l.tel)) { frequentes++; continue }
    if (dpTemEtiqueta(l)) { porEtiqueta++; continue }
    if (DP_G.duplicidade && vistos.has(l.tel)) { repetidos++; continue }
    vistos.add(l.tel); alvo.push(l)
  }
  return { alvo, semCel, porEtiqueta, repetidos, suprimidos, frequentes, responderam }
}
const dpTempoTxt = n => {
  if (!n || !$('dIntMin')) return ''
  const c = dpLer(), media = (c.intervalo_seg_min + c.intervalo_seg_max) / 2, cada = (c.pausa_cada_min + c.pausa_cada_max) / 2, pausa = (c.pausa_dur_min + c.pausa_dur_max) / 2
  const min = Math.round(n * media / 60 + (cada > 0 && c.pausa_cada_max > 0 ? Math.floor(n / cada) * pausa : 0))
  const janela = Math.max(1, c.hora_fim - c.hora_ini) * 60, dias = Math.max(Math.ceil(n / c.limite_dia), Math.ceil(min / janela))
  return `${min < 60 ? min + ' min' : Math.floor(min / 60) + 'h' + String(min % 60).padStart(2, '0')} de envio${dias > 1 ? `, em ${dias} dias dentro do horário e do limite` : ''}`
}
const dpPintarPublico = () => {
  if (!$('dpLista')) return
  const { alvo, semCel, porEtiqueta, repetidos, suprimidos, frequentes, responderam } = dpPublico(), n = alvo.length
  $('dpEsqT').textContent = `${n} ${n === 1 ? 'empresa vai' : 'empresas vão'} receber`
  $('dpLista').innerHTML = n ? `<div class="dp-list">${alvo.map(l => `<div class="dp-it"><div class="dp-it-top"><div><b>${esc(l.nome)}</b><small>${esc([tfmt(l.tel), l.bairro].filter(Boolean).join(' · '))}</small></div><span class="dp-chip c-f">${esc((ETAPAS.find(x => x[0] === l.etapa) || [])[1] || '')}${l.resp && !DP_ETAPA_RESPONDEU.includes(l.etapa) ? ' · respondeu' : ''}</span></div></div>`).join('')}</div>` : '<p class="dp-lead">Nenhuma empresa com essa escolha. Escolha outra lista ou etapa.</p>'
  const fora = [responderam && `${responderam} que já ${responderam === 1 ? 'respondeu' : 'responderam'}`, semCel && `${semCel} só com telefone fixo`, porEtiqueta && `${porEtiqueta} pela lista escolhida`, repetidos && `${repetidos} com número repetido`, suprimidos && `${suprimidos} na lista de supressão`, frequentes && `${frequentes} por frequência`].filter(Boolean).join(', ')
  $('dpResumo').innerHTML = `<b>${n} ${n === 1 ? 'empresa' : 'empresas'}</b>${dpVersoes().length ? ` · ${dpVersoes().length} ${dpVersoes().length === 1 ? 'versão' : 'versões'}` : ''}${dpTempoTxt(n) ? ` · ${dpTempoTxt(n)}` : ''}${fora ? `<br>Ficam de fora: ${fora}.` : ''}`
  pintarGuardian(alvo.map(l => l.tel))
  const b = $('dUsarRaiox'); b.disabled = !n; b.textContent = `Montar disparo para ${n} ${n === 1 ? 'empresa' : 'empresas'}`
}
const ligarPublico = () => {
  if (!$('dpPara')) return
  dpSlLigar('slEtapa', DP_ETAPAS, 'Nenhuma etapa', 'Todas as etapas', (v, on) => { if (on && DP_ETAPA_RESPONDEU.includes(v) && DP_TIRA_RESP) { DP_TIRA_RESP = false; $('dTiraResp').checked = false } dpPintarPublico() }, ['perdido'])
  if ($('dTiraResp')) $('dTiraResp').onchange = ev => { DP_TIRA_RESP = ev.target.checked; dpPintarPublico() }
  dpSlLigar('slInc', DP_INC, 'Todas', '', (v, on) => { if (on) { DP_EXC.delete(v); DP_SL.slExc?.pinta() } dpPintarPublico(); dpGrAuto() })
  dpSlLigar('slExc', DP_EXC, 'Nenhuma', '', (v, on) => { if (on) { DP_INC.delete(v); DP_SL.slInc?.pinta(); dpGrAuto() } dpPintarPublico() })
  document.querySelector('.dp-cf')?.addEventListener('input', dpPintarPublico)
  $('dVers')?.addEventListener('click', () => setTimeout(dpPintarPublico, 0))
  dpPintarPublico()
}
// números manuais: um por linha. Aceita nome junto, separado por TAB, ponto e vírgula ou vírgula.
const dpTelefone = v => { let x = String(v ?? '').replace(/\D/g, '').replace(/^0+/, ''); if (x.length === 10 || x.length === 11) x = '55' + x; return x.length >= 12 && x.length <= 13 ? x : '' }
const dpLerNumeros = texto => {
  const lista = [], vistos = new Set(); let invalidos = 0
  for (const linha of String(texto || '').split(/\r?\n/)) {
    if (!linha.trim()) continue
    const campos = linha.split(/[\t;,]/).map(x => x.trim()).filter(Boolean)
    const tels = campos.map(dpTelefone).filter(Boolean)
    if (!tels.length) { invalidos++; continue }
    const nome = campos.find(x => !dpTelefone(x) && /[a-zà-ú]/i.test(x)) || 'Contato'
    tels.forEach(tel => { if (!vistos.has(tel)) { vistos.add(tel); lista.push({ tel, nome }) } })
  }
  return { lista, invalidos }
}
const semAc = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
function dpCarregarXlsx() {
  if (window.XLSX) return Promise.resolve()
  return new Promise((ok, erro) => { const js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; js.onload = ok; js.onerror = () => erro(new Error('Não consegui abrir o leitor de planilha.')); document.head.appendChild(js) })
}
// reconhece as colunas pelo nome, sem diferenciar maiúsculas e acentos, como na extensão
async function dpLerPlanilha(arquivo) {
  await dpCarregarXlsx()
  const buf = await arquivo.arrayBuffer()
  let wb
  if (/\.csv$/i.test(arquivo.name)) {
    // CSV pode vir em UTF-8 ou no padrão do Excel: sem isso, "Clínica" vira "ClÃ­nica"
    let texto; try { texto = new TextDecoder('utf-8', { fatal: true }).decode(buf) } catch (_) { texto = new TextDecoder('windows-1252').decode(buf) }
    wb = window.XLSX.read(texto.replace(/^﻿/, ''), { type: 'string' })
  } else wb = window.XLSX.read(buf, { type: 'array' })
  const linhas = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false })
  if (!linhas.length) return []
  const cols = Object.keys(linhas[0]), acha = re => cols.find(c => re.test(semAc(c)))
  const cTel = acha(/tel|cel|fone|whats|numero|phone|contato/), cNome = acha(/nome|name|funcionario|colaborador/), cEmp = acha(/empresa|companhia|loja|negocio|razao/)
  if (!cTel) throw new Error('Não achei a coluna de telefone. Use um título como Telefone ou WhatsApp.')
  return linhas.map(l => [String(l[cNome] || l[cEmp] || '').replace(/[\t;,]/g, ' ').trim(), String(l[cTel] || '').trim()].filter(Boolean).join(';'))
}
const dpPintarNumeros = () => {
  const b = $('dCriarL'), t = $('dNums'); if (!b || !t) return
  const { lista, invalidos } = dpLerNumeros(t.value)
  pintarGuardian(lista.map(n => n.tel))
  $('dNumsInfo').textContent = t.value.trim() ? `${lista.length} reconhecido${lista.length === 1 ? '' : 's'}${invalidos ? `, ${invalidos} inválido${invalidos === 1 ? '' : 's'}` : ''}. Repetidos entram uma vez.` : 'Com nome, separe por ponto e vírgula: Clínica Bela;11 99999-0000'
  b.textContent = lista.length ? `Montar disparo para ${lista.length} número${lista.length === 1 ? '' : 's'}` : 'Montar disparo para estes números'
}
const ligarNumeros = () => {
  const t = $('dNums'); if (!t) return
  t.oninput = dpPintarNumeros
  $('dPlan').onchange = async e => {
    const f = e.target.files?.[0]; e.target.value = ''; if (!f) return
    const rot = $('dPlanRot'); rot.textContent = 'Lendo…'
    try {
      const novas = await dpLerPlanilha(f)
      t.value = [t.value.trim(), ...novas].filter(Boolean).join('\n')
      dpPintarNumeros(); liz(`Planilha lida: ${dpLerNumeros(novas.join('\n')).lista.length} números.`)
    } catch (er) { liz(esc(er.message || 'Não consegui ler a planilha.')) }
    rot.textContent = 'Importar planilha (.xlsx ou .csv)'
  }
  $('dModelo').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeffNome;Telefone\nClínica Exemplo;11 99999-0000\n'], { type: 'text/csv;charset=utf-8' })); a.download = 'modelo-disparo.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000) }
  dpPintarNumeros()
}
const dpAba = qual => {
  if ($('dpPara')) $('dpPara').hidden = qual !== 'pipe'
  document.querySelectorAll('[data-dptab]').forEach(t => { const on = t.dataset.dptab === qual; t.classList.toggle('on', on); t.setAttribute('aria-selected', on) })
  $('dpEsqPipe').hidden = $('dUsarRaiox').hidden = qual !== 'pipe'
  $('dpEsqNums').hidden = $('dCriarL').hidden = qual !== 'nums'
}
async function abrirDisparo(empilhar = true, doPipeline = false) {
  await carregarSaudacao()
  const { data: canalAt } = await sb.from('canal_whatsapp').select('atende').eq('dono', usuario.id).maybeSingle()
  DP_ATENDE = !!canalAt?.atende
  await Promise.all([carregarGuardian(), dpGrCarregar()])
  let prontosDisparo = 0
  const { data: cs } = await sb.from('campanha').select('*').in('status', ['rodando', 'pausada']).order('criada_em', { ascending: false }).limit(1)
  const camp = cs && cs[0]
  let body = ''
  if (camp) {
    const { data: evs } = await sb.from('envio').select('id, empresa_nome, telefone, status, mensagem, resposta').eq('campanha_id', camp.id).order('ordem', { ascending: true })
    const es = evs || [], ct = s => es.filter(e => e.status === s).length
    const total = es.length, fila = ct('na_fila'), falhou = ct('falhou')
    const enviados = ct('enviado') + ct('entregue') + ct('lido') + ct('respondeu'), resp = ct('respondeu')
    const pct = total ? Math.round(enviados / total * 100) : 0, rod = camp.status === 'rodando'
    DP_COMP_ON = !!camp.complemento_ligado; DP_COMP = camp.complementos?.length ? [...camp.complementos] : [DP_COMP_PADRAO]
    DP_VERS = camp.versoes?.length ? [...camp.versoes] : [es.find(e => e.status === 'na_fila')?.mensagem || saudacaoDono || 'Olá, {saudacao}, tudo bem?']; DP_ATUAL = 0
    if (!rod && fila) { const { data: sg } = await sb.from('diagnosticos').select('segmento, etiquetas, busca:buscas(nicho)').eq('decisao', 'aprovada').eq('arquivado', false).limit(2000); DP_SEGS = [...new Set((sg || []).flatMap(d => [String(d.segmento || d.busca?.nicho || '').trim(), ...(d.etiquetas || [])]).filter(Boolean))] }
    body = `<div class="dp-duas">
      <div class="dp-esq">
        <h3 class="dp-esq-t">${total} empresa${total === 1 ? '' : 's'} neste disparo</h3>
        <div class="dp-list" id="dpList">${es.map(e => `<div class="dp-it" data-ev="${e.id}"><div class="dp-it-top"><div><b>${esc(e.empresa_nome || 'Contato')}</b><small>${esc(tfmt(e.telefone))}</small></div><span class="dp-chip c-${(CHIP_DP[e.status] || ['', ''])[1]}">${(CHIP_DP[e.status] || [e.status])[0]}</span></div><div class="dp-conv"><div class="dp-msg out">${esc(comSaudacao(e.mensagem))}</div><div class="dp-msg in" data-in>${e.resposta ? esc(e.resposta) : ''}</div></div></div>`).join('')}</div>
      </div>
      <aside class="dp-dir">
        <div class="dp-dir-rola">
          <div class="dp-top"><span class="dp-badge s-${DISP_ST[camp.status][1]}">${rod ? '<i class="dp-pulse"></i>' : '❚❚ '}${DISP_ST[camp.status][0]}</span><h3>${esc(camp.nome)}</h3></div>
          <div class="dp-bar"><i id="dpBar" style="width:${pct}%"></i></div>
          <div class="dp-k"><div><b id="dpEnv">${enviados}</b><span>enviados</span></div><div><b id="dpFila">${fila}</b><span>na fila</span></div><div><b id="dpResp">${resp}</b><span>responderam</span></div></div>
          ${rod ? `<div class="dp-live" id="dpLive"><i class="dp-pulse"></i> disparando… a tela atualiza sozinha</div>` : ''}
          ${camp.motivo_pausa && !rod ? `<div class="dp-aviso">${esc(camp.motivo_pausa)}</div>` : ''}
          ${!rod && fila ? campoMensagem() : ''}
          ${dpAtende()}
          ${dpGuardianHtml()}
          ${dpComplemento()}
          ${dpConfig(camp, rod)}
          ${falhou ? `<div class="dp-cfg"><span class="dp-ferr">${falhou} falhou</span></div>` : ''}
          ${rod ? '' : `<label class="dp-ok"><input type="checkbox" id="dCiente"> Entendi: vai disparar sozinho pelo meu WhatsApp conectado, sem a API oficial, e o WhatsApp pode banir esse número. O risco é meu.</label>`}
          <button class="btn ghost sm" id="dFim" style="width:100%">Encerrar e montar outro disparo</button>
        </div>
        <div class="dp-fix">${rod ? `<button class="btn line" id="dPausa" style="width:100%">Pausar</button>` : `<button class="btn ok lg" id="dLiga" style="width:100%" disabled>Ligar o disparo</button>`}</div>
      </aside></div>`
  } else {
    const [{ data: ds }, { data: ins }, { data: atv }] = await Promise.all([
      sb.from('diagnosticos').select('id, etapa, etapa_em, nota_dor, temperatura, segmento, etiquetas, telefone, capivara, busca:buscas(nicho), empresa:empresas(nome, bairro, whatsapp, telefone, categoria)').eq('decisao', 'aprovada').eq('arquivado', false).order('nota_dor', { ascending: false, nullsFirst: false }).limit(2000),
      sb.from('conversa').select('telefone, criado_em').eq('direcao', 'in').eq('automatica', false).order('criado_em', { ascending: false }).limit(1000),
      sb.rpc('atividade_leads')
    ])
    const respId = new Set((atv || []).map(a => a.diagnostico_id).filter(Boolean))
    DP_RESP_TEL = new Set((atv || []).flatMap(a => [chaveTel(a.telefone), chaveTel(a.fone)]).filter(Boolean)); DP_TIRA_RESP = true
    const ultimaIn = {}; (ins || []).forEach(m => { if (!ultimaIn[m.telefone]) ultimaIn[m.telefone] = m.criado_em })
    DP_PIPE = (ds || []).map(d => { const tel = dpFoneDe(d), etapa = d.etapa || 'a_contatar'; return { id: d.id, etapa, tel, nome: d.empresa?.nome || d.capivara?.nome || 'Empresa', bairro: d.empresa?.bairro || '', seg: String(d.segmento || d.busca?.nicho || '').trim(), cat: String(d.empresa?.categoria || '').trim(), etq: d.etiquetas || [], resp: DP_ETAPA_RESPONDEU.includes(etapa) || respId.has(d.id) || DP_RESP_TEL.has(chaveTel(tel)), temp: calcTemp(etapa, d.temperatura, ultimaIn[tel], d.etapa_em)[0] } })
    DP_ETAPAS = new Set(['a_contatar']); DP_EXC = new Set(); DP_INC = new Set()
    // veio do pipeline filtrado: o disparo já abre na mesma lista
    if (doPipeline) { if (pipeF.seg && DP_PIPE.some(l => l.seg === pipeF.seg)) DP_INC.add('s:' + pipeF.seg); if (pipeF.temp) DP_INC.add('t:' + pipeF.temp); if (pipeF.etq && DP_PIPE.some(l => l.etq.includes(pipeF.etq))) DP_INC.add('e:' + pipeF.etq) }
    const prontos = prontosDisparo = DP_PIPE.filter(l => l.tel).length
    const nEtapa = k => DP_PIPE.filter(l => l.etapa === k).length
    const segs = [...new Set(DP_PIPE.map(l => l.seg).filter(Boolean))].sort((x, y) => x.localeCompare(y))
    const nTempD = k => DP_PIPE.filter(l => l.temp === k).length
    const etqsD = [...new Set(DP_PIPE.flatMap(l => l.etq))].sort((x, y) => x.localeCompare(y))
    DP_SEGS = [...new Set([...segs, ...etqsD])]
    const cats = [...new Set(DP_PIPE.map(l => l.cat).filter(Boolean))].sort((x, y) => DP_PIPE.filter(l => l.cat === y).length - DP_PIPE.filter(l => l.cat === x).length)
    const nResp = DP_PIPE.filter(l => l.resp).length
    const etqGrupos = [['Etiqueta', etqsD.map(g => [`e:${g}`, g, DP_PIPE.filter(l => l.etq.includes(g)).length])], ['Lista', segs.map(g => [`s:${g}`, g, DP_PIPE.filter(l => l.seg === g).length])], ['Categoria', cats.map(g => [`c:${g}`, g, DP_PIPE.filter(l => l.cat === g).length])], ['Temperatura', TEMP_MAN.filter(([k]) => nTempD(k)).map(([k, t]) => [`t:${k}`, t, nTempD(k)])]]
    const temEtq = etqGrupos.some(g => g[1].length)
    DP_VERS = [saudacaoDono || 'Olá, {saudacao}, tudo bem?']; DP_ATUAL = 0
    DP_COMP_ON = false; DP_COMP = [DP_COMP_PADRAO]
    body = `<div class="dp-duas">
      <div class="dp-esq">
        <div id="dpEsqPipe">
          <h3 class="dp-esq-t" id="dpEsqT"></h3>
          <div id="dpLista"></div>
        </div>
        <div id="dpEsqNums" hidden>
          <h3 class="dp-esq-t">Números que vão receber</h3>
          <div class="dp-plan"><label class="btn line sm" for="dPlan"><span id="dPlanRot">Importar planilha (.xlsx ou .csv)</span></label><input id="dPlan" type="file" accept=".xlsx,.xls,.csv" hidden><button type="button" class="dp-link" id="dModelo">Baixar planilha modelo</button></div>
          <label class="dp-lbl" for="dNums">Ou cole um por linha</label>
          <textarea id="dNums" class="dp-ta dp-ta-alta" placeholder="11 99999-0000&#10;Clínica Bela;11 98888-7777"></textarea>
          <small class="at-hint" id="dNumsInfo"></small>
        </div>
      </div>
      <aside class="dp-dir">
        <div class="dp-dir-rola">
          <div class="dp-tabs" role="tablist" aria-label="Para quem enviar">
            <button type="button" role="tab" data-dptab="pipe"${prontos ? '' : ' disabled'}>Empresas do pipeline <b>${prontos}</b></button>
            <button type="button" role="tab" data-dptab="nums">Colar números</button>
          </div>
          <div id="dpPara">
            ${temEtq ? dpSlHtml('slInc', 'Quem vai receber', etqGrupos) : ''}
            ${dpSlHtml('slEtapa', 'Etapa do pipeline', [['', ETAPAS.map(([k, t]) => [k, t, nEtapa(k)])]])}
            ${temEtq ? dpSlHtml('slExc', 'Não enviar para', etqGrupos) : '<p class="dp-var" style="padding:12px 0 0">Nenhuma lista no pipeline ainda.</p>'}
            <label class="dp-tira"><input type="checkbox" id="dTiraResp" checked><span>Tirar quem já respondeu</span><b>${nResp}</b></label>
            <div class="dp-cfg" id="dpResumo" style="margin-top:12px"></div>
          </div>
          ${campoMensagem()}
          ${dpAtende()}
          ${dpGuardianHtml()}
          ${dpComplemento()}
          ${dpConfig()}
          <div class="dp-aviso">Começa devagar pra não queimar o número. Intervalo curto demais toma bloqueio.</div>
        </div>
        <div class="dp-fix">
          <button class="btn ok lg" id="dUsarRaiox" style="width:100%">Montar disparo para ${prontos} empresa${prontos === 1 ? '' : 's'}</button>
          <button class="btn ok lg" id="dCriarL" style="width:100%" hidden>Montar disparo para estes números</button>
        </div>
      </aside></div>`
  }
  $('cap').dataset.seq = ''; $('cap').classList.remove('largo')
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Disparo automático</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b dp">${body}</div>`
  $('capX').onclick = fecharCapivara
  if (empilhar) empilha('disparo')
  const recarrega = () => abrirDisparo(false)
  ligarVersoes(); ligarConfig(); ligarAtende(); ligarComplemento(camp?.id); ligarPublico(); ligarNumeros(); ligarGuardian()
  if (doPipeline && !camp && DP_INC.size) dpGrAuto()
  document.querySelectorAll('[data-dptab]').forEach(t => t.onclick = () => dpAba(t.dataset.dptab))
  if ($('dUsarRaiox')) dpAba(prontosDisparo ? 'pipe' : 'nums')
  // a mensagem escolhida vira a padrão da conta: é a mesma que aparece no pipeline
  const guardarMensagem = async msg => { if (DP_GR) return; const { error } = await sb.from('canal_whatsapp').update({ saudacao: msg }).eq('dono', usuario.id); if (!error) saudacaoDono = msg }
  if ($('dpList')) $('dpList').querySelectorAll('.dp-it').forEach(el => { const top = el.querySelector('.dp-it-top'); if (top) top.onclick = () => el.classList.toggle('aberto') })
  if ($('dCriarL')) $('dCriarL').onclick = async () => {
    const { lista: todosNums } = dpLerNumeros($('dNums').value)
    const nums = todosNums.filter(n => !(DP_G.supressao && DP_OPT.has(n.tel)) && !(DP_G.frequencia && dpFrequente(n.tel)) && !DP_RESP_TEL.has(chaveTel(n.tel)))
    if (!nums.length) return liz(todosNums.length ? 'Todos esses números ficaram de fora: pelo Guardian ou porque já responderam.' : 'Põe pelo menos um número com DDD.')
    DP_G_TELS = nums.map(n => n.tel); if (guardianBloqueia()) return
    if (nums.length < todosNums.length) liz(`${todosNums.length - nums.length} número(s) ficaram de fora: pelo Guardian ou porque já responderam.`)
    const msg = dpVersoes()[0]
    if (!msg) return liz('Escreve a mensagem que vai ser enviada.')
    const cfg = dpLer()
    if (cfg.hora_ini >= cfg.hora_fim) { document.querySelector('.dp-acc').open = true; return liz('O horário de início precisa ser antes do fim.') }
    $('dCriarL').disabled = true; $('dCriarL').textContent = 'Montando…'
    await guardarMensagem(msg)
    const { data: c, error } = await sb.from('campanha').insert({ nome: 'Minha lista ' + new Date().toLocaleDateString('pt-BR'), status: 'pausada', intervalo_min: 5, ...cfg }).select('id').single()
    if (error) { $('dCriarL').disabled = false; $('dCriarL').textContent = 'Montar disparo para estes números'; return liz(esc(error.message)) }
    for (let i = 0; i < nums.length; i += 200) {
      const { error: e2 } = await sb.from('envio').insert(nums.slice(i, i + 200).map((n, j) => ({ campanha_id: c.id, dono: usuario.id, empresa_nome: n.nome, telefone: n.tel, mensagem: msg, ordem: i + j + 1, status: 'na_fila' })))
      if (e2) { await sb.from('campanha').update({ status: 'cancelada' }).eq('id', c.id); $('dCriarL').disabled = false; dpPintarNumeros(); return liz(`Não consegui montar a fila: ${esc(e2.message)}`) }
    }
    recarrega()
  }
  if ($('dUsarRaiox')) $('dUsarRaiox').onclick = async () => {
    const msg = dpVersoes()[0]
    if (!msg) return liz('Escreve a mensagem que vai ser enviada.')
    if (guardianBloqueia()) return
    const cfg = dpLer()
    if (cfg.hora_ini >= cfg.hora_fim) { document.querySelector('.dp-acc').open = true; return liz('O horário de início precisa ser antes do fim.') }
    $('dUsarRaiox').disabled = true; $('dUsarRaiox').textContent = 'Montando…'
    await guardarMensagem(msg)
    const { alvo } = dpPublico()
    const volta = t => { $('dUsarRaiox').disabled = false; dpPintarPublico(); liz(esc(t)) }
    if (!alvo.length) return volta('Nenhuma empresa com essa escolha.')
    const { data: nova, error } = await sb.from('campanha').insert({ nome: 'Prospecção ' + new Date().toLocaleDateString('pt-BR'), status: 'pausada', intervalo_min: 5, ...cfg }).select('id').single()
    if (error) return volta(error.message)
    for (let i = 0; i < alvo.length; i += 200) {
      const { error: eEnv } = await sb.from('envio').insert(alvo.slice(i, i + 200).map((l, j) => ({ campanha_id: nova.id, dono: usuario.id, diagnostico_id: l.id, empresa_nome: l.nome, telefone: l.tel, mensagem: msg, ordem: i + j + 1, status: 'na_fila' })))
      if (eEnv) { await sb.from('campanha').update({ status: 'cancelada' }).eq('id', nova.id); return volta(`Não consegui montar a fila: ${eEnv.message}`) }
    }
    recarrega()
  }
  if ($('dCiente')) $('dCiente').onchange = e => { $('dLiga').disabled = !e.target.checked }
  if ($('dLiga')) $('dLiga').onclick = async () => {
    DP_G_TELS = (await sb.from('envio').select('telefone').eq('campanha_id', camp.id).eq('status', 'na_fila')).data?.map(e => e.telefone) || []
    if (guardianBloqueia()) return
    const cfg = dpLer()
    if (cfg.hora_ini >= cfg.hora_fim) { document.querySelector('.dp-acc').open = true; return liz('O horário de início precisa ser antes do fim.') }
    if ($('dMsg')) {
      const msg = dpVersoes()[0]
      if (!msg) return liz('Escreve a mensagem que vai ser enviada.')
      const { error } = await sb.from('envio').update({ mensagem: msg }).eq('campanha_id', camp.id).eq('status', 'na_fila')
      if (error) return liz('Não consegui salvar a mensagem. Tenta de novo.')
      await guardarMensagem(msg)
    }
    const { error: eLiga } = await sb.from('campanha').update({ ...cfg, status: 'rodando', motivo_pausa: null }).eq('id', camp.id)
    if (eLiga) return liz('Não consegui ligar o disparo. Tenta de novo.')
    liz('Disparo ligado. Vou mandando no ritmo combinado.'); recarrega() }
  if ($('dPausa')) $('dPausa').onclick = async () => { await sb.from('campanha').update({ status: 'pausada' }).eq('id', camp.id); recarrega() }
  if ($('dFim')) $('dFim').onclick = async () => { clearInterval(dispTimer); await sb.from('campanha').update({ status: 'cancelada' }).eq('id', camp.id); liz('Disparo encerrado. Quem não recebeu continua no pipeline. Monte o novo aqui.'); recarrega() }
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
  if (!fila.length) corpo = '<div class="cp-vazio">Ninguém esperando contato.<br>Faça uma busca e toque em <b>Adicionar ao pipeline</b>.</div>'
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
  const { data: todas } = await sb.from('buscas').select('id, cidade, nicho, status, olhadas, novas, com_dor, criada_em').order('criada_em', { ascending: false }).limit(200)
  // um item por lista, com o total de empresas somando cada "Encontrar mais"; pesquisa com erro fica separada
  const data = []
  for (const b of todas || []) {
    const g = b.status === 'erro' ? null : data.find(x => x.status !== 'erro' && mesmaLista(x, b))
    if (g) g.total += b.novas || 0; else data.push({ ...b, total: b.novas || 0 })
  }
  data.splice(30)
  $('hist').innerHTML = data.length ? data.map(b => `<div class="hi" data-id="${b.id}"><b>${esc(b.cidade === 'Lista' ? 'Lista · ' + b.nicho : b.nicho + ' · ' + b.cidade.split(',')[0])}</b><small>${new Date(b.criada_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${b.total} empresa${b.total === 1 ? '' : 's'} · ${{ pronta: 'pronta', erro: 'deu erro' }[b.status] || 'em andamento'}</small></div>`).join('') : '<div class="vazio">Nenhuma busca ainda.</div>'
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
async function abrirBusca(b) {
  if (history.state?.camada === 'hist') history.replaceState(null, '')
  $('hist').classList.remove('on'); $('ask').hidden = true; document.body.classList.remove('fora'); fecharCapivara()
  vistos.clear(); montarCanvas({ ...b }, false); busca = { ...b }
  ;(await sb.from('diagnosticos').select('id').eq('busca_id', b.id).eq('status', 'pronto')).data?.forEach(x => vistos.add(x.id))
  vivo(b.status !== 'pronta' && b.status !== 'erro', b.status === 'pronta' ? 'Liz parada' : 'Liz trabalhando')
  acompanhar()
  // busca salva sempre abre em cards; o Raio-X de cada empresa abre pelo card
  await abrirListaHome()
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
  const custoContas = gest.data ? ((await sb.rpc('custo_por_conta')).data || []) : []
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
    <div class="pf-pl2"><button class="btn ok" data-assinar="comeco">Assinar Começo · R$ 247/mês</button><button class="btn line" data-assinar="escala">Assinar Escala · R$ 578/mês</button></div>
    <p class="pf-pl2n">Pagamento seguro no Mercado Pago. Cobra todo mês, cancela quando quiser. ${BTN_COMO}</p>` : ''}
    <div class="pf-sd"><div><small>Seu saldo dá pra</small><b>${SALDO.isento ? 'usar à vontade' : `${rende().listas} listas simples`}</b><span>${SALDO.isento ? 'Conta isenta: nada é descontado.' : `até ${emp(rende().listas)} empresas · saldo ${brlC(SALDO.saldo)}`}</span></div>${BTN_COMO}</div>
    ${movs.length ? `<div class="pf-mv">${movs.map(m => `<div><span>${esc(m.descricao || m.tipo)}</span><small>${new Date(m.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</small><b class="${m.centavos < 0 ? 'neg' : 'pos'}">${m.centavos < 0 ? '−' : '+'} ${brlC(Math.abs(m.centavos))}</b></div>`).join('')}</div>` : ''}
    <div class="pf-t">Meu uso em ${mes}</div>
    <div class="pf-g">${card(bus.count || 0, 'buscas')}${card(reais(gasto), 'custo registrado', 'estimado, câmbio do dia')}</div>
    <div class="pf-ac">
      <button class="pfx wapp" id="pfWapp"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.3-.2.6-.1l1.9.9c.3.1.5.2.5.4.1.2.1.9-.1 1.5Z"/></svg></span>Conectar WhatsApp</button>
      <button class="pfx robo" id="pfRobo"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="7" width="16" height="12" rx="3"/><circle cx="9" cy="13" r="1.5" fill="#fff"/><circle cx="15" cy="13" r="1.5" fill="#fff"/><path d="M12 3v4M8 19v2M16 19v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>Robô de atendimento</button>
      <button class="pfx disp" id="pfDisp"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg></span>Disparo automático</button>
      <button class="pfx conv" id="pfQual"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg></span>Qualidade e Guardian</button>
      <button class="pfx conv" id="pfConv"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4V5a1 1 0 0 1 1-1z"/></svg></span>Conversas</button>
      <button class="pfx indi" id="pfInd"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-2.2a3 3 0 1 0-5.8-1 3 3 0 1 0-5.8 1H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1ZM4 12v7a1 1 0 0 0 1 1h6v-8H4Zm9 8h6a1 1 0 0 0 1-1v-7h-7v8Z"/></svg></span>Indicar e ganhar 1 mês</button>
      <button class="pfx pipe" id="pfPipe"><span class="ico"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="5" height="16" rx="1.2"/><rect x="9.5" y="4" width="5" height="11" rx="1.2"/><rect x="16" y="4" width="5" height="14" rx="1.2"/></svg></span>Ver meu pipeline</button>
    </div>
    ${g ? `<div class="pf-t">Gestão da prospecção · ${mes}</div>
    <div class="pf-g">${card(g.contas, 'contas', `${g.novas_mes} nova${g.novas_mes === 1 ? '' : 's'} no mês`)}${card(g.ativas_mes, 'ativas no mês', 'fizeram busca')}${card(g.pagantes, 'pagantes', `${g.mes_gratis} em mês grátis`)}${card(reais(Number(g.custo_usd_mes)), 'custo registrado', `${g.buscas_mes} busca${g.buscas_mes === 1 ? '' : 's'}`)}</div>
    <div class="pf-t">Custo por conta · ${mes}</div>
    <div class="dp-list pf-cc">${custoContas.filter(c => Number(c.total_usd) > 0 || c.preco_centavos).map(c => { const tot = Number(c.total_usd), receita = c.preco_centavos / 100, sobra = receita - tot * DOLAR; return `<div class="dp-it"><div class="dp-it-top"><div><b>${esc(c.email)}</b><small>Google ${reais(Number(c.google_usd))} · Liz ${reais(Number(c.liz_usd))} · Áudio ${reais(Number(c.audio_usd))} · Outros ${reais(Number(c.outros_usd))}</small><small>${esc(c.plano)}${c.preco_centavos ? ` · paga R$ ${receita.toFixed(2).replace('.', ',')} · ${sobra >= 0 ? 'sobra' : 'prejuízo'} R$ ${Math.abs(sobra).toFixed(2).replace('.', ',')}` : ' · não paga'}</small></div><b class="pf-cct">${reais(tot)}</b></div></div>` }).join('') || '<p class="dp-var" style="padding:14px">Nenhum custo registrado no mês.</p>'}</div>
    <p class="pf-ccn">Estimativa pela tabela oficial, sem descontar a franquia grátis do Google. Google, Liz e áudio contam a partir de 05/11/2026. O valor exato está nas faturas. Servidor fora da conta.</p>
    ${g.pedidos ? `<div class="pf-al">${g.pedidos} pessoa${g.pedidos === 1 ? '' : 's'} pediu acesso por indicação e está esperando.</div>` : ''}
    ${avisos.length ? avisos.map(av => `<div class="pf-aviso" data-av="${av.id}"><div>${IC.at}<span>${esc(av.texto)}</span></div><div class="pf-aviso-ac"><button class="btn line sm" data-teto>Soltar +R$ 100 de teto</button><button class="btn ghost sm" data-tirafree>Tirar Free do site</button><button class="btn ghost sm" data-visto>Ok, vi</button></div></div>`).join('') : ''}
    <div class="pf-free"><div class="pf-free-h"><span>Gasto com contas Free no mês</span><b>${brlC(g.custo_free_centavos || 0)} <i>de ${brlC(g.teto_free_centavos || 0)}</i></b></div><div class="pf-free-b"><em style="width:${Math.min(100, (g.custo_free_centavos || 0) / (g.teto_free_centavos || 1) * 100)}%"></em></div>${(g.custo_free_centavos || 0) >= (g.teto_free_centavos || 0) ? '<small class="neg">Teto atingido: contas Free pausadas até virar o mês.</small>' : ''}</div>
    <a class="btn go pf-crm" href="https://crm.kompila.com.br/kompila/prospeccao" target="_blank" rel="noopener">Abrir o controle completo no CRM</a>` : ''}
    <button class="pf-sair" id="pfSair">Sair da conta</button>
    <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  $('capX').onclick = fecharCapivara
  $('pfWapp').onclick = () => abrirConectar()
  $('pfRobo').onclick = () => comIA(abrirAtendimento)
  $('pfDisp').onclick = () => comIA(abrirDisparo)
  $('pfQual').onclick = () => abrirQualidade()
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
    <p class="cn-risco"><b>Regra do jogo:</b> essa conexão não usa a API oficial do WhatsApp. O WhatsApp pode restringir ou banir o número, principalmente com disparo em volume. O risco é real e fica com o dono do número. Use um chip só pra isso.</p>
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
const VALORP = { comeco: 247, escala: 578 }
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
