// kompila prospecção · app (31/10/2026)
// Login Google → Liz pergunta (cidade + nicho, ou lista) → canvas ao vivo → capivara de cada empresa.
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
const ANG = { dor: 'Dor', canal: 'Falta de canal', crescimento: 'Crescimento', nenhum: 'Fora do perfil' }

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
  history.replaceState(null, '', location.pathname)
  $('login').hidden = true
  $('pUser').hidden = $('pHist').hidden = $('pZoom').hidden = false
  const inicial = () => { $('av').hidden = true; $('avL').hidden = false; $('avL').textContent = (usuario.user_metadata?.full_name || usuario.email || '?').trim().charAt(0).toUpperCase() }
  $('av').onerror = inicial
  if (usuario.user_metadata?.avatar_url) $('av').src = usuario.user_metadata.avatar_url; else inicial()
  $('av').title = $('avL').title = usuario.email
  vivo(false, 'Liz parada')
  carregarHist()
  pergunta(1)
}

/* ======================= pergunta ======================= */
const PIN = IC.ok
let esc_ = { cidade: '', nicho: '', todas: false }
function pergunta(passo) {
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
    ${passo === 2 ? `<div class="ou">capivara de quantas?</div><div class="sg" id="qt"><button data-t="0" class="on">As 14 melhores · ~US$ 0,50</button><button data-t="1">Todas · ~US$ 2</button></div>` : ''}
    ${passo === 1 ? `<div class="ou">ou</div><div class="drop" id="drop"><div class="di">${IC.arq}</div><div><b>Sobe uma lista</b><small>Excel ou CSV com empresa, site ou cidade. Conta pessoal eu descarto.</small></div></div>` : ''}`
  const aq = $('aq'); if (!mob()) aq.focus()
  const vai = v => {
    v = (v || '').trim()
    if (!v) { $('ae').textContent = passo === 1 ? 'Me fala uma cidade pra eu começar.' : 'Me fala um nicho pra eu começar.'; aq.focus(); return }
    if (passo === 1) { esc_.cidade = cid.find(c => c.toLowerCase().startsWith(v.toLowerCase())) || v; pergunta(2) }
    else { esc_.nicho = v.charAt(0).toUpperCase() + v.slice(1); fecharPergunta(); rodarBusca(esc_.cidade, esc_.nicho, esc_.todas) }
  }
  $('ab').onclick = () => vai(aq.value)
  aq.onkeydown = e => { if (e.key === 'Enter') vai(aq.value) }
  $('askc').querySelectorAll('.sg:not(#qt) button').forEach(b => b.onclick = () => vai(b.textContent))
  $('askc').querySelectorAll('#qt button').forEach(b => b.onclick = () => { $('askc').querySelectorAll('#qt button').forEach(x => x.classList.toggle('on', x === b)); esc_.todas = b.dataset.t === '1' })
  const dr = $('drop')
  if (dr) {
    dr.onclick = () => $('arq').click()
    dr.ondragover = e => { e.preventDefault(); dr.classList.add('on') }
    dr.ondragleave = () => dr.classList.remove('on')
    dr.ondrop = e => { e.preventDefault(); dr.classList.remove('on'); if (e.dataTransfer.files[0]) lerArquivo(e.dataTransfer.files[0]) }
  }
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
    <p class="sub">Descartei ${fora.length} conta${fora.length === 1 ? '' : 's'} pessoa${fora.length === 1 ? 'l' : 'is'}. ${itens.length > MAX ? `Vou analisar as primeiras ${MAX} agora, o resto fica pra próxima rodada.` : 'Vou achar cada uma no Google e montar a capivara.'}</p>
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

async function rodarBusca(cidade, nicho, todas = false, quero = 60, novaMesmo = false) {
  // já pesquisou essa cidade e esse nicho? abre o que já tem e não gasta nada
  if (!novaMesmo) {
    const { data: ja } = await sb.from('buscas').select('*').ilike('cidade', cidade.trim()).ilike('nicho', nicho.trim()).neq('status', 'erro').order('criada_em', { ascending: false }).limit(1)
    if (ja?.length) {
      await abrirBusca(ja[0])
      liz(`Você já pesquisou <b>${esc(nicho)} em ${esc(cidade.split(',')[0])}</b> em ${new Date(ja[0].criada_em).toLocaleDateString('pt-BR')}. Abri o resultado, sem gastar nada. Quer empresas novas? Usa o <b>Buscar mais</b>.`, 9000)
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
    await peneirar(todas)
  } catch (e) { erro(e) }
}
async function rodarLista(nome, itens) {
  montarCanvas({ cidade: 'Lista', nicho: nome, status: 'buscando', olhadas: itens.length, novas: 0, com_dor: 0 }, true)
  vivo(true, 'Liz procurando')
  try {
    const r = await chamar('importar', { nome_lista: nome, itens })
    busca = { id: r.busca_id, cidade: 'Lista', nicho: nome, status: 'peneirando', olhadas: r.na_lista, novas: r.achadas_no_google + r.so_pelo_site, com_dor: 0 }
    atualizarFunil(); dizer(`Achei ${r.achadas_no_google} no Google${r.so_pelo_site ? ` e ${r.so_pelo_site} só pelo site` : ''}.${r.nao_e_empresa ? ` ${r.nao_e_empresa} não parecem empresa.` : ''} Montando as capivaras.`)
    await peneirar(true)
  } catch (e) { erro(e) }
}
async function peneirar(todas) {
  const a = await chamar('analisar', { busca_id: busca.id, todas })
  busca.com_dor = a.com_dor; atualizarFunil()
  // contatos de todas (Instagram, e-mail, WhatsApp): grátis, roda em paralelo com as capivaras
  chamar('contatos', { busca_id: busca.id }).then(c => c?.instagram && setTimeout(() => dizer(`Achei o Instagram de ${c.instagram} empresas. Tá na lista.`), 6000)).catch(() => {})
  if (!a.finalistas) return fim('Nenhuma empresa com oportunidade forte aqui. Bora outro nicho?')
  dizer(`${a.finalistas} empresas merecem capivara. Já estou montando, uma por uma.`)
  acompanhar()
}
function erro(e) { vivo(false, 'Liz parada'); liz(`Travei aqui: ${esc(e.message)}`, 8000); if (busca) { busca.status = 'erro'; atualizarFunil() } }
function fim(t) { vivo(false, 'Liz parada'); dizer(t); carregarHist() }

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
      fim(`Pronto. ${n} capivara${n === 1 ? '' : 's'} pra você olhar. ${mob() ? 'Toca' : 'Clica'} numa empresa pra abrir.`)
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
  busca = { ...b }; diags = []; L = layout(); assinatura = ''
  $('fname').textContent = b.cidade === 'Lista' ? `/ Lista · ${b.nicho}` : `/ ${b.nicho} · ${b.cidade.split(',')[0]}`
  if (mob()) return montarCelular(b)
  vp.hidden = false; $('mobv').hidden = true
  world.querySelectorAll('.frame,#liz,.cred').forEach(n => n.remove()); wires.innerHTML = ''
  const fr = (id, r, label, html, ghost) => { const d = document.createElement('div'); d.className = 'frame' + (ghost ? ' ghost' : ''); d.id = id; Object.assign(d.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px' }); d.innerHTML = `<div class="fl"><b>${label}</b></div><div class="fb"></div><div class="fc">${html}</div>`; world.appendChild(d); return d }
  const lista = b.cidade === 'Lista'
  fr('fA', L.A, 'Briefing', `<div class="br"><div style="flex:1;min-width:0"><div class="per">${new Date().toLocaleDateString('pt-BR')} · agora</div><div class="say" id="say">${lista ? 'Lendo a sua lista.' : 'Procurando no Google Maps.'}</div>
    <div class="chips">${lista ? `<span class="chip">${IC.arq}${esc(b.nicho)}</span>` : `<span class="chip">${IC.nicho}${esc(b.nicho)}</span><span class="chip">${IC.pin}${esc(b.cidade)}</span>`}</div></div><img src="img/liz_fala_3d.png" alt="Liz"></div>`)
  const nodes = [['olhadas', lista ? 'na lista' : 'empresas olhadas', lista ? 'da sua planilha' : 'Google Maps'], ['novas', lista ? 'achadas' : 'novas', lista ? 'no Google ou pelo site' : 'sem repetir'], ['com_dor', 'com oportunidade', 'dor, canal ou crescimento', 1], ['capivaras', 'capivaras', 'prontas pra você'], ['aprovadas', 'aprovadas', 'nada sai sem seu ok']]
  const fl = nodes.map(([k, t, s, hl]) => `<div class="node${hl ? ' hl' : ''}" id="n_${k}"><div class="v">0</div><div class="k">${t}</div><div class="s">${s}</div></div>`)
  fr('fB', L.B, 'Funil', mob() ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${fl.join('')}</div>` : `<div class="flow">${fl.join(`<div class="arr">${IC.arr}</div>`)}</div>`)
  fr('fC', L.C, 'Capivaras · clica numa empresa pra abrir', '<div class="cards" id="cards"></div>', true)
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
  const nodes = [['olhadas', lista ? 'na lista' : 'olhadas'], ['novas', lista ? 'achadas' : 'novas'], ['com_dor', 'com oportunidade', 1], ['capivaras', 'capivaras'], ['aprovadas', 'aprovadas']]
  m.innerHTML = `<section class="m-br"><img src="img/liz_fala_3d.png" alt="Liz"><div style="min-width:0"><div class="say" id="say">${lista ? 'Lendo a sua lista.' : 'Procurando no Google Maps.'}</div>
      <div class="chips">${lista ? `<span class="chip">${IC.arq}${esc(b.nicho)}</span>` : `<span class="chip">${IC.nicho}${esc(b.nicho)}</span><span class="chip">${IC.pin}${esc(b.cidade.split(',')[0])}</span>`}</div></div></section>
    <div class="m-fun">${nodes.map(([k, t, hl]) => `<div class="node${hl ? ' hl' : ''}" id="n_${k}"><div class="v">0</div><div class="k">${t}</div></div>`).join('')}</div>
    <div class="m-acoes" id="mAcoes"></div>
    <div class="m-tit"><span>Capivaras</span><button data-lista>Ver todas em lista</button></div>
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
    if (say) say.innerHTML = busca.status === 'pronta' ? `Achei <em>${cap} empresa${cap === 1 ? '' : 's'}</em> que valem a abordagem.` : busca.status === 'erro' ? 'Travei nessa busca.' : busca.status === 'diagnosticando' ? `Montando as capivaras: <em>${cap}</em> prontas.` : say.innerHTML
    const ac = $('mAcoes')
    if (ac) ac.innerHTML = busca.status === 'erro' ? '<button class="btn go" id="bDeNovo">Tentar de novo</button>'
      : busca.status === 'pronta' ? `${resto ? `<button class="btn line" id="bResto">Capivara das outras ${resto} · ~US$ ${(resto * 0.035).toFixed(2).replace('.', ',')}</button>` : ''}${busca.cidade !== 'Lista' ? `<div class="m-mais"><span>Buscar mais novas:</span>${[12, 30, 60].map(n => `<button class="btn line" data-mais="${n}">${n}</button>`).join('')}</div>` : ''}` : ''
    return
  }
  if (say) say.innerHTML = busca.status === 'pronta' ? `Achei <em>${cap} empresa${cap === 1 ? '' : 's'}</em> que valem a abordagem.${resto ? `<br><button class="btn line sm" id="bResto" style="margin-top:12px">Fazer capivara das outras ${resto} · ~US$ ${(resto * 0.035).toFixed(2).replace('.', ',')}</button>` : ''}${busca.cidade !== 'Lista' ? `<div style="display:flex;gap:8px;align-items:center;margin-top:12px;flex-wrap:wrap"><span style="font-size:13px;color:var(--mu);font-weight:400">Buscar mais novas:</span>${[12, 30, 60].map(n => `<button class="btn line sm" data-mais="${n}">${n}</button>`).join('')}</div>` : ''}` : busca.status === 'erro' ? 'Travei nessa busca. <button class="btn go sm" id="bDeNovo" style="margin-top:12px">Tentar de novo</button>' : busca.status === 'diagnosticando' ? `Montando as capivaras: <em>${cap}</em> prontas.` : say.innerHTML
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
  if (!sem?.length) return liz('Todas já têm capivara.')
  await sb.from('diagnosticos').update({ status: 'na_fila' }).in('id', sem.map(x => x.id))
  await sb.from('buscas').update({ status: 'diagnosticando', terminada_em: null }).eq('id', busca.id)
  busca.status = 'diagnosticando'; vivo(true, 'Liz trabalhando'); dizer(`Bora: mais ${sem.length} capivaras.`)
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
      <div class="rod"><span class="ang a-${c.angulo || d.angulo}">${ANG[c.angulo || d.angulo] || ''}</span>${d.decisao !== 'pendente' ? `<span class="dec ${d.decisao}">${{ aprovada: '✓ Aprovada', pulada: 'Pulada', ajustar: 'Ajustada' }[d.decisao] || ''}</span>` : ''}</div></div>`
  }).join('')
  box.querySelectorAll('.co:not(.lendo)').forEach(el => el.onclick = () => abrirCapivara(diags[+el.dataset.i]))
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
  else if (!c) { $('capO').classList.remove('on'); $('cap').classList.remove('on') }
})
async function abrirCapivara(d, empilhar = true) {
  const c = d.capivara, id = c.identidade || {}
  const u = await urls([id.print_celular, id.print_computador, ...(id.fotos || [])])
  const o = Math.round(314 - 314 * (c.nota || 0) / 100), site = c.blocos?.site, url = site?.link || ''
  const palco = id.print_computador || id.print_celular
    ? `<div class="palco"><div class="tit">${IC.site}<b>Print do site</b> · computador e celular</div>
      ${id.print_computador && u(id.print_computador) ? `<div class="shot"><div class="sb"><i></i><i></i><i></i><span>${esc(url.replace(/^https?:\/\//, ''))}</span></div><img src="${u(id.print_computador)}" alt=""></div>` : ''}
      ${id.print_celular && u(id.print_celular) ? `<div class="cel"><img src="${u(id.print_celular)}" alt=""></div>` : ''}</div>`
    : `<div class="palco"><div class="semprint"><div><b>${site?.status_txt === 'Só rede social' ? 'Sem site próprio' : 'Sem print do site'}</b>${site?.status_txt === 'Só rede social' ? 'No lugar do site ela usa ' + esc(site.linhas?.[1]?.valor || 'rede social') + '.' : 'O site não abriu, bloqueou a leitura ou não existe.'}</div></div></div>`
  const vel = id.velocidade, velCor = vel >= 90 ? '#14A35A' : vel >= 50 ? '#B7790A' : '#D93D42'
  const bloco = ([k, ic, tit]) => { const b = c.blocos?.[k]; if (!b) return ''; return `<article class="bl"><div class="bl-h"><div class="ico ${ic}">${IC[ic]}</div><div><b>${tit}</b><small>${esc(b.sub || '')}</small></div><span class="st ${b.status}">${esc(b.status_txt)}</span></div>
    <div class="rows">${b.linhas.map(r => `<div class="r"><span class="d ${r.t}">${r.t === 'ok' ? '✓' : r.t === 'bad' ? '!' : '–'}</span><span class="l">${esc(r.label)}</span><span class="v">${esc(r.valor)}</span></div>`).join('')}</div>
    <div class="bl-f"><span>Fonte: ${esc(b.fonte)}</span>${b.link ? `<a class="lnk" href="${esc(b.link)}" target="_blank" rel="noopener">${esc(b.link_txt || 'Abrir')}${IC.ext}</a>` : ''}</div></article>` }
  const fotos = (id.fotos || []).map(f => u(f)).filter(Boolean)
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Capivara · ${esc(c.nome)}</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
  <header class="hd"><div><div class="k">${esc(c.categoria || '')}${c.categoria ? ' · ' : ''}${esc((c.cidade || '').split(',')[0])}</div><h1>${esc(c.nome)}</h1>
    <div class="lo">${IC.pin}${esc([c.bairro, c.cidade].filter(Boolean).join(' · '))}</div>
    <div class="sel">${(c.selos || []).map(s => `<span class="sp ${s.t}">${s.t === 'ok' ? IC.ok : s.t === 'at' ? IC.at : IC.bad}${esc(s.txt)}</span>`).join('')}</div></div>
    <div class="dor" style="--o:${o}"><svg viewBox="0 0 112 112"><defs><linearGradient id="gdor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7BF0B0"/><stop offset="1" stop-color="#14A35A"/></linearGradient></defs><circle class="b" cx="56" cy="56" r="50"/><circle class="f" cx="56" cy="56" r="50"/></svg><div class="n"><div><b>${c.nota ?? d.nota_dor}</b><span>oportunidade</span></div></div></div></header>
  <section class="liz"><img src="img/liz_rosto_3d.png" alt="Liz"><div><div class="t">${esc(c.resumo)}</div>${c.prova ? `<div class="prova"><div class="m">Avaliação no Google</div>${esc(c.prova)}</div>` : c.motivo ? `<div class="prova"><div class="m">Por que entrou</div>${esc(c.motivo)}</div>` : ''}</div></section>
  <div class="sec"><h2>Identidade</h2></div>
  <section class="idt">${palco}<div class="lado">
    <div class="mini"><h4>Marca <span>do site</span></h4><div class="marca"><div class="logo-t">${id.logo ? `<img src="${esc(id.logo)}" alt="" onerror="this.remove()">` : ''}</div><div class="fn"><b>${esc((c.nome || '').split(' - ')[0])}</b><br>${id.fonte ? 'Fonte: ' + esc(id.fonte) : 'Fonte não medida'}</div></div>
      ${(id.paleta || []).length ? `<div class="pal">${id.paleta.map(h => `<div class="cor"><i style="background:${esc(h)}"></i>${esc(h)}</div>`).join('')}</div>` : '<div class="fn" style="margin-top:12px;color:var(--mu2)">Sem site pra medir cores.</div>'}</div>
    <div class="mini"><h4>Velocidade no celular <span>PageSpeed</span></h4>${vel != null ? `<div class="vel"><div class="gauge"><svg viewBox="0 0 72 72"><circle class="b" cx="36" cy="36" r="32"/><circle class="f" cx="36" cy="36" r="32" style="stroke:${velCor};stroke-dashoffset:${Math.round(201 - 201 * vel / 100)}"/></svg><b style="color:${velCor}">${vel}</b></div><div class="tx"><b>${vel >= 90 ? 'Rápido' : vel >= 50 ? 'Médio' : 'Lento'}</b>O conteúdo principal aparece em ${esc(id.carregamento || '?')} no celular.</div></div>` : '<div class="fn" style="color:var(--mu2)">Sem site pra medir.</div>'}</div>
    <div class="olho"><div class="ai">${IC.eye}</div><div><small>O que o Opus 5.5 viu</small>${esc(id.leitura_visual)}</div></div></div></section>
  ${fotos.length ? `<div class="fotos" style="grid-template-columns:repeat(${fotos.length},1fr)">${fotos.map((f, i) => `<div class="foto"><img src="${f}" alt=""><span>Foto ${i + 1} · Google</span></div>`).join('')}</div>` : ''}
  <div class="sec"><h2>A capivara</h2></div><section class="grid">${BL.map(bloco).join('')}</section>
  ${(c.avaliacoes || []).length ? `<div class="sec"><h2>O que dizem no Google</h2></div><section class="revs">${c.avaliacoes.map(a => `<div class="rv${a.etiqueta ? ' bad' : ''}"><div class="m"><span class="stars">${[1, 2, 3, 4, 5].map(i => star(i <= a.estrelas)).join('')}</span>${esc((a.data || '').slice(0, 10).split('-').reverse().join('/'))}</div>${esc((a.texto || '').slice(0, 260))}${(a.texto || '').length > 260 ? '…' : ''}${a.etiqueta ? `<span class="tg">${esc(a.etiqueta)}</span>` : ''}</div>`).join('')}</section>` : ''}
  <div class="sec"><h2>Abordagem</h2></div>
  <section class="ab"><div class="msg"><div class="h">Mensagem sugerida pela Liz<b>sai por ${esc(c.canal)}</b></div><div id="msgBox"><p>${esc(d.abordagem || c.abordagem)}</p></div></div><div class="decd" id="decd"></div></section>
  <div class="cred"><a href="https://kompila.com.br/?utm_source=prospeccao&utm_medium=credito" target="_blank" rel="noopener">Desenvolvido por <b>[ <i>kompila</i> ]</b> · 2026</a></div></div>`
  desenharDecisao(d)
  if (empilhar) empilha('cap')
  $('capX').onclick = fecharCapivara
  $('capO').classList.add('on'); $('cap').classList.add('on'); $('cap').scrollTop = 0
}
function desenharDecisao(d) {
  const box = $('decd')
  if (d.decisao === 'aprovada') { box.innerHTML = `<div class="q">Decidido.</div><div class="feito">${IC.ok}Aprovada. Ela entra na fila de abordagem.</div><button class="btn ghost" id="dDes">Desfazer</button>`; $('dDes').onclick = () => decidir(d, 'pendente'); return }
  if (d.decisao === 'pulada') { box.innerHTML = `<div class="q">Decidido.</div><div class="feito" style="background:#F1F2EF;color:var(--mu)">Pulada. Não volta a aparecer.</div><button class="btn ghost" id="dDes">Desfazer</button>`; $('dDes').onclick = () => decidir(d, 'pendente'); return }
  box.innerHTML = `<div class="q">Nada sai sem o seu ok.</div><button class="btn ok" id="dOk">${IC.ok}Aprovar</button><button class="btn adj" id="dAj">Ajustar a mensagem</button><button class="btn ghost" id="dPu">Pular empresa</button><div class="err" id="dErr"></div>`
  $('dOk').onclick = () => decidir(d, 'aprovada')
  $('dPu').onclick = () => decidir(d, 'pulada')
  $('dAj').onclick = () => {
    $('msgBox').innerHTML = `<textarea id="msgTx">${esc(d.abordagem || d.capivara.abordagem)}</textarea><div style="display:flex;gap:8px;margin-top:8px"><button class="btn go" id="msgSal">Salvar mensagem</button><button class="btn ghost" id="msgCan">Cancelar</button></div>`
    $('msgTx').focus()
    $('msgCan').onclick = () => $('msgBox').innerHTML = `<p>${esc(d.abordagem || d.capivara.abordagem)}</p>`
    $('msgSal').onclick = async () => {
      const t = $('msgTx').value.trim(); if (!t) return
      $('msgSal').textContent = 'Salvando…'
      const { error } = await sb.from('diagnosticos').update({ abordagem: t, decisao: 'ajustar', decidida_em: new Date().toISOString() }).eq('id', d.id)
      if (error) { $('msgSal').textContent = 'Não salvou. Tenta de novo'; return }
      d.abordagem = t; d.decisao = 'ajustar'; $('msgBox').innerHTML = `<p>${esc(t)}</p>`; liz('Mensagem guardada. Agora é só aprovar.'); desenharCards()
    }
  }
}
async function decidir(d, decisao) {
  const btn = document.activeElement; if (btn?.tagName === 'BUTTON') btn.disabled = true
  const { error } = await sb.from('diagnosticos').update({ decisao, decidida_em: decisao === 'pendente' ? null : new Date().toISOString() }).eq('id', d.id)
  if (error) { const e = $('dErr'); if (e) e.textContent = 'Não salvou. Tenta de novo.'; if (btn) btn.disabled = false; return }
  d.decisao = decisao; desenharDecisao(d); desenharCards(); atualizarFunil()
  if (decisao === 'aprovada') liz(`Aprovada: ${esc(d.capivara.nome)}. Fica guardada pra abordagem por ${esc(d.capivara.canal)}.`)
}
function fecharCapivara() {
  if (history.state?.camada) return history.back() // o popstate fecha (ou volta pra lista)
  $('capO').classList.remove('on'); $('cap').classList.remove('on')
}
$('capO').onclick = fecharCapivara
addEventListener('keydown', e => { if (e.key === 'Escape') { fecharCapivara(); $('hist').classList.remove('on') } })

/* ======================= lista simples ======================= */
let filtroLista = 'todas', rolagemLista = 0
async function abrirLista(empilhar = true) {
  if (!busca?.id) return liz('Faz uma busca primeiro que eu monto a lista.')
  const { data } = await sb.from('diagnosticos').select('id, status, angulo, nota_dor, motivo, decisao, capivara, empresa:empresas(nome, bairro, cidade, telefone, site, google_maps_url, nota, total_avaliacoes, instagram, email, whatsapp, contatos_lidos_em)').eq('busca_id', busca.id).order('nota_dor', { ascending: false })
  const todos = data || []
  const grupos = { todas: todos, capivara: todos.filter(d => Object.keys(d.capivara || {}).length), sem: todos.filter(d => !Object.keys(d.capivara || {}).length && d.status !== 'na_fila' && d.status !== 'lendo'), fora: todos.filter(d => d.angulo === 'nenhum'), insta: todos.filter(d => d.empresa?.instagram) }
  const faltaLer = todos.some(d => !d.empresa?.contatos_lidos_em)
  const lst = grupos[filtroLista] || todos
  $('cap').innerHTML = `<div class="cap-x"><span class="t">Lista · ${esc(busca.cidade === 'Lista' ? busca.nicho : busca.nicho + ' · ' + busca.cidade)}</span><button class="ibtn" id="capX" aria-label="Fechar">${IC.x}</button></div><div class="cap-b">
    <div class="lst-top"><h2>${todos.length} empresas</h2>${faltaLer ? '<button class="btn go sm" id="lLer">Buscar Instagrams</button>' : ''}${grupos.insta.length ? `<button class="btn line sm" id="lCopia">Copiar os ${grupos.insta.length} @</button>` : ''}<button class="btn line sm" id="lCsv">Baixar planilha</button>
      <div class="filt">${[['todas', 'Todas'], ['insta', 'Com Instagram'], ['capivara', 'Com capivara'], ['sem', 'Sem capivara'], ['fora', 'Fora do perfil']].map(([k, t]) => `<button data-f="${k}" class="${filtroLista === k ? 'on' : ''}">${t}<span>${grupos[k].length}</span></button>`).join('')}</div></div>
    ${lst.map(d => { const e = d.empresa || {}, tem = Object.keys(d.capivara || {}).length, fila = d.status === 'na_fila' || d.status === 'lendo'
      return `<div class="li${d.angulo === 'nenhum' ? ' vazio' : ''}"><div class="nt">${d.nota_dor ?? '–'}<small>oport.</small></div>
      <div class="nm"><b>${esc(e.nome)}</b><small>${esc([e.bairro, (e.cidade || '').split(',')[0]].filter(Boolean).join(' · '))}${e.nota ? ` · ${String(e.nota).replace('.', ',')} ★ (${e.total_avaliacoes})` : ''}</small></div>
      <div class="ct">${e.instagram ? `<a href="https://instagram.com/${esc(e.instagram)}" target="_blank" rel="noopener" style="color:#C93676;font-weight:500">@${esc(e.instagram)}</a>` : e.contatos_lidos_em ? '<span>sem Instagram no site</span><br>' : ''}${e.telefone ? esc(e.telefone) : 'sem telefone'}${e.email ? `<a href="mailto:${esc(e.email)}">${esc(e.email)}</a>` : ''}${e.site ? `<a href="${esc(e.site)}" target="_blank" rel="noopener">${esc(e.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : '<span>sem site</span>'}</div>
      <div class="mo"><span class="ang a-${d.angulo || 'nenhum'}">${ANG[d.angulo] || ''}</span><div>${esc(d.motivo || '')}</div></div>
      <div class="ac">${tem ? `<button class="btn go sm" data-abre="${d.id}">Abrir capivara</button>` : fila ? '<span class="lendo-tag"><i></i>Liz montando…</span>' : `<button class="btn line sm" data-faz="${d.id}">Fazer capivara</button>`}</div></div>` }).join('') || '<div class="vazio" style="color:var(--mu)">Nada nesse filtro.</div>'}</div>`
  $('capX').onclick = fecharCapivara
  $('cap').querySelectorAll('.filt button').forEach(b => b.onclick = () => { filtroLista = b.dataset.f; rolagemLista = 0; abrirLista(false) })
  $('cap').querySelectorAll('[data-abre]').forEach(b => b.onclick = () => abrirCapivara(todos.find(d => d.id === b.dataset.abre)))
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
  const linhas = [['Empresa', 'Bairro', 'Cidade', 'Telefone', 'Instagram', 'E-mail', 'WhatsApp', 'Site', 'Nota Google', 'Avaliações', 'Ângulo', 'Oportunidade', 'Motivo', 'Tem capivara', 'Decisão'].map(cel).join(';')]
  todos.forEach(d => { const e = d.empresa || {}; linhas.push([e.nome, e.bairro, e.cidade, e.telefone, e.instagram ? '@' + e.instagram : '', e.email, e.whatsapp, e.site, e.nota, e.total_avaliacoes, ANG[d.angulo] || '', d.nota_dor, d.motivo, Object.keys(d.capivara || {}).length ? 'sim' : 'não', d.decisao].map(cel).join(';')) })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' }))
  a.download = `prospeccao_${(busca.nicho + '_' + busca.cidade).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(a.href)
}
$('bLista').onclick = abrirLista

/* ======================= histórico ======================= */
async function carregarHist() {
  const { data } = await sb.from('buscas').select('id, cidade, nicho, status, olhadas, com_dor, criada_em').order('criada_em', { ascending: false }).limit(30)
  $('hist').innerHTML = (data || []).length ? data.map(b => `<div class="hi" data-id="${b.id}"><b>${esc(b.cidade === 'Lista' ? 'Lista · ' + b.nicho : b.nicho + ' · ' + b.cidade.split(',')[0])}</b><small>${new Date(b.criada_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · ${b.olhadas} olhadas · ${{ pronta: 'pronta', erro: 'deu erro' }[b.status] || 'em andamento'}</small></div>`).join('') : '<div class="vazio">Nenhuma busca ainda.</div>'
  $('hist').querySelectorAll('.hi').forEach(el => el.onclick = () => abrirBusca(data.find(b => b.id === el.dataset.id)))
}
$('histX').hidden = false
$('histX').onclick = () => { if (history.state?.camada === 'hist') history.back(); else $('hist').classList.remove('on') }
$('bHist').onclick = e => { e.stopPropagation(); const on = !$('hist').classList.contains('on'); $('hist').classList.toggle('on', on); if (on && mob()) empilha('hist') }
document.addEventListener('click', e => { if (!e.target.closest('#hist,#bHist')) $('hist').classList.remove('on') })
$('bNova').onclick = () => { clearInterval(poll); fecharCapivara(); pergunta(1) }
async function abrirBusca(b) {
  if (history.state?.camada === 'hist') history.replaceState(null, '')
  $('hist').classList.remove('on'); $('ask').hidden = true; document.body.classList.remove('fora'); fecharCapivara()
  vistos.clear(); montarCanvas({ ...b }, false); busca = { ...b }
  ;(await sb.from('diagnosticos').select('id').eq('busca_id', b.id).eq('status', 'pronto')).data?.forEach(x => vistos.add(x.id))
  vivo(b.status !== 'pronta' && b.status !== 'erro', b.status === 'pronta' ? 'Liz parada' : 'Liz trabalhando')
  acompanhar()
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
iniciar()
