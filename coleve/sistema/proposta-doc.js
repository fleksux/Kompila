// Sistema Coleve · a proposta que o cliente lê (24/11/2026)
// Um lugar só: o link do cliente, a prévia da equipe, o PDF e o texto do WhatsApp saem daqui,
// sempre dos números que o banco calculou (gatilho proposta_calcula). Nada de preço escrito na tela.

const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const reais = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number(v) % 1 ? 2 : 0 });
const dataBR = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '';
const primeiro = n => (n || '').trim().split(/\s+/)[0] || '';

// linha da tabela proposta (v_proposta) + planos -> o mesmo formato que proposta_publica devolve
export function deLinha(p, planos) {
  const pl = planos.find(x => x.codigo === p.plano_codigo) || {};
  return {
    numero: p.numero, razao_social: p.razao_social, nome_fantasia: p.nome_fantasia, contato_nome: p.contato_nome,
    municipio: p.municipio, uf: p.uf, segmento: p.segmento, abrir_empresa: p.abrir_empresa, abertura_gratis: p.abertura_gratis,
    qtd_cnpj: p.qtd_cnpj, motivo: p.motivo, observacao: p.observacao,
    preco_tabela: p.preco_tabela, desconto_pct: p.desconto_pct, preco_final: p.preco_final,
    validade: p.validade, status: p.status, aceita_em: p.aceita_em, aceite_nome: p.aceite_nome, vencida: p.vencida,
    plano: { codigo: pl.codigo, nome: pl.nome, resumo: pl.resumo, inclui: pl.inclui || [] },
    outros: planos.filter(x => x.ativo && x.codigo !== p.plano_codigo).map(x => ({ nome: x.nome, preco: x.preco })),
    vendedor: p.vendedor_nome, emitida: p.enviada_em || p.criado_em
  };
}

const nomeEmpresa = d => d.nome_fantasia || d.razao_social;

// texto pro WhatsApp: curto, sem negrito nem lista, um preço, um link
export function textoWhats(d, link) {
  const oi = primeiro(d.contato_nome) ? `Olá, ${primeiro(d.contato_nome)}! ` : 'Olá! ';
  const mais = d.qtd_cnpj > 1 ? ` por empresa (${d.qtd_cnpj} empresas)` : '';
  return [
    `${oi}Segue a proposta da Coleve para a ${nomeEmpresa(d)}.`,
    `O plano que recomendamos é o ${d.plano.nome}: ${reais(d.preco_final)} por mês${mais}.` + (d.abrir_empresa && d.abertura_gratis ? ' A abertura da empresa fica por nossa conta.' : ''),
    d.motivo || '',
    `Os detalhes e o botão para aceitar estão aqui: ${link}`,
    `A proposta vale até ${dataBR(d.validade)}. Qualquer dúvida, me chama por aqui.`
  ].filter(Boolean).join('\n\n');
}

// PDF da proposta: 2 páginas deitadas (16:9) no visual da Coleve. Lição do Farol (8 páginas, 5 planos):
// dono de empresa não tem tempo. Página 1 já diz plano e preço; página 2 tem o porquê, o que inclui e como começa.
export function pdfHTML(d, { raizImg = '../img/' } = {}) {
  const ev = d.segmento === 'ev';
  const desconto = Number(d.desconto_pct) > 0;
  const mais = d.qtd_cnpj > 1 ? ` por empresa · ${d.qtd_cnpj} empresas` : '';
  const emitida = dataBR(d.emitida ? String(d.emitida).slice(0, 10) : new Date().toISOString().slice(0, 10));
  const onde = [d.municipio, d.uf].filter(Boolean).join('/');
  const titulo = ev
    ? 'O seu eletroposto merece uma contabilidade que <em>entende do assunto.</em>'
    : 'Contabilidade em dia e <em>número na mão</em> para decidir.';
  const vantagens = [
    d.abrir_empresa && d.abertura_gratis ? ['Abertura sem custo', 'A constituição da empresa fica por nossa conta, já no enquadramento certo.'] : null,
    d.abrir_empresa ? null : ['Troca sem dor de cabeça', 'Falamos com o contador atual e trazemos tudo para a Coleve.'],
    ['Consultor que fala a sua língua', 'Atendimento humano direto pelo WhatsApp, sem fila de chamado.'],
    ['Tudo numa plataforma', 'Guias, documentos e pedidos num lugar só, no celular.']
  ].filter(Boolean).slice(0, 3);
  const passos = [
    ['Você aceita', 'Pelo link que enviamos ou respondendo a mensagem.'],
    ['Contrato digital', 'Assinatura pelo celular, sem papel.'],
    [d.abrir_empresa ? 'Abrimos a empresa' : 'Assumimos a contabilidade', d.abrir_empresa ? 'E começamos com tudo no lugar.' : 'E você já começa com a gente no mês seguinte.']
  ];
  const logo = (branco) => ev ? `<img class="pdf-logo" src="${raizImg}${branco ? 'logo_ev_branco.png' : 'logo_ev.png'}" alt="Coleve">`
                              : `<img class="pdf-logo${branco ? ' pdf-logo--branco' : ''}" src="${raizImg}logo_contabilidade.svg" alt="Coleve">`;
  const pe = (n) => `<footer class="pdf-pe"><span>Coleve Contabilidade · CRC-SP 2SP048990 · coleve.com.br</span><span>${esc(d.numero || 'Rascunho')} · ${n}/2</span></footer>`;
  return `
  <section class="pdf-pg pdf-capa">
    <div class="pdf-capa__txt">
      ${logo(true)}
      <p class="pdf-pill">Proposta · ${esc(nomeEmpresa(d))}</p>
      <p class="pdf-sec">${ev ? 'Contabilidade para eletromobilidade' : 'Proposta comercial'}</p>
      <h1>${titulo}</h1>
      <p class="pdf-para">Preparada para <b>${esc(d.contato_nome || nomeEmpresa(d))}</b>${d.contato_nome ? `, da ${esc(nomeEmpresa(d))}` : ''}${onde ? `, em ${esc(onde)}` : ''}.</p>
      <div class="pdf-capa__plano">
        <div><span>Plano recomendado</span><b>${esc(d.plano.nome)}</b></div>
        <strong>${reais(d.preco_final)}<small>/mês${mais}</small></strong>
      </div>
      <p class="pdf-capa__datas">Emitida em ${emitida} · válida até ${dataBR(d.validade)}${d.vendedor ? ` · consultor ${esc(d.vendedor)}` : ''}</p>
    </div>
    <div class="pdf-capa__foto" style="background-image:url('${raizImg}${ev ? 'banner_hero.webp' : 'escritorio_2.webp'}')"></div>
  </section>

  <section class="pdf-pg pdf-prop">
    <div class="pdf-prop__esq">
      ${logo(false)}
      <p class="pdf-sec pdf-sec--azul">Por que este plano</p>
      <h2>${esc(d.plano.nome)}</h2>
      ${d.motivo ? `<p class="pdf-motivo">${esc(d.motivo)}</p>` : `<p class="pdf-motivo">${esc(d.plano.resumo)}</p>`}
      <ul class="pdf-inclui">${d.plano.inclui.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <div class="pdf-vant">${vantagens.map(([t, x]) => `<div><b>${t}</b><p>${x}</p></div>`).join('')}</div>
      ${d.observacao ? `<p class="pdf-obs">${esc(d.observacao)}</p>` : ''}
      ${d.outros.length ? `<p class="pdf-outros">Outros planos: ${d.outros.map(o => `${esc(o.nome)} ${reais(o.preco)}`).join(' · ')}</p>` : ''}
      ${pe(2)}
    </div>
    <div class="pdf-prop__dir">
      <p class="pdf-sec">Investimento</p>
      <div class="pdf-preco">${desconto ? `<s>${reais(d.preco_tabela)}</s>` : ''}<strong>${reais(d.preco_final)}</strong><span>por mês${mais}</span>${desconto ? `<em>${Number(d.desconto_pct).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% de desconto</em>` : ''}</div>
      <p class="pdf-sec">Como começa</p>
      <ol class="pdf-passos">${passos.map(([t, x], i) => `<li><span>${i + 1}</span><div><b>${t}</b><p>${x}</p></div></li>`).join('')}</ol>
      <div class="pdf-contato">
        <b>Fale com a Coleve</b>
        <p>WhatsApp (11) 92002-7321 · Telefone (11) 96378-1010</p>
        <p>Travessa Dona Paula, 13 · Higienópolis · São Paulo</p>
      </div>
    </div>
  </section>`;
}

// a página da proposta (link do cliente e prévia da equipe). opcoes.aceite = true mostra o botão de aceitar
export function docHTML(d, { raizImg = '../img/', aceite = false } = {}) {
  const ev = d.segmento === 'ev';
  const desconto = Number(d.desconto_pct) > 0;
  const mais = d.qtd_cnpj > 1 ? `<small>por empresa · ${d.qtd_cnpj} empresas</small>` : '';
  const passos = [
    ['Você aceita', 'Aqui mesmo, no botão abaixo. Leva 10 segundos.'],
    ['Contrato digital', 'Mandamos o contrato para assinar pelo celular, sem papel.'],
    [d.abrir_empresa ? 'Abrimos a empresa' : 'Assumimos a contabilidade', d.abrir_empresa ? 'Cuidamos da abertura e já começamos com tudo no lugar.' : 'Falamos com o contador atual e fazemos a troca para você.']
  ];
  const estado = d.status === 'aceita'
    ? `<div class="pc-ok"><b>Proposta aceita</b><span>${esc(d.aceite_nome || '')}${d.aceita_em ? ' · ' + new Date(d.aceita_em).toLocaleDateString('pt-BR') : ''}. A Coleve já foi avisada e vai te chamar com o contrato.</span></div>`
    : d.status === 'perdida' ? `<div class="pc-off">Esta proposta foi encerrada. Fale com a Coleve para uma nova.</div>`
    : d.vencida ? `<div class="pc-off">Esta proposta venceu em ${dataBR(d.validade)}. Fale com a Coleve para atualizar.</div>`
    : aceite ? `<form class="pc-aceite" id="pc-aceite"><label>Seu nome<input id="pc-nome" required autocomplete="name" placeholder="Nome de quem aceita" value="${esc(d.contato_nome || '')}"></label><button type="submit">Aceitar proposta</button><p id="pc-erro" role="alert"></p></form>`
    : '';
  return `
  <header class="pc-topo">
    <img src="${raizImg}${ev ? 'logo_ev.png' : 'logo_contabilidade.svg'}" alt="Coleve" class="pc-logo">
    <div class="pc-num"><b>${esc(d.numero || 'Rascunho')}</b><span>válida até ${dataBR(d.validade)}</span></div>
  </header>

  <section class="pc-abre">
    <p class="pc-sec">Proposta para ${esc(nomeEmpresa(d))}</p>
    <h1>${primeiro(d.contato_nome) ? esc(primeiro(d.contato_nome)) + ', este' : 'Este'} é o plano certo para ${d.abrir_empresa ? 'começar' : 'vocês'}.</h1>
  </section>

  <section class="pc-plano">
    <div class="pc-plano__cab">
      <div><p class="pc-tag">Recomendado</p><h2>${esc(d.plano.nome)}</h2><p class="pc-resumo">${esc(d.plano.resumo)}</p></div>
      <div class="pc-preco">${desconto ? `<s>${reais(d.preco_tabela)}</s>` : ''}<strong>${reais(d.preco_final)}</strong><span>por mês</span>${mais}${desconto ? `<em>${Number(d.desconto_pct).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% de desconto</em>` : ''}</div>
    </div>
    ${d.motivo ? `<div class="pc-porque"><b>Por que este plano</b><p>${esc(d.motivo)}</p></div>` : ''}
    <ul class="pc-inclui">${d.plano.inclui.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    ${d.abrir_empresa && d.abertura_gratis ? '<p class="pc-brinde">Abertura da empresa sem custo</p>' : ''}
    ${d.observacao ? `<p class="pc-obs">${esc(d.observacao)}</p>` : ''}
  </section>

  <section class="pc-passos">
    <p class="pc-sec">Como começa</p>
    <ol>${passos.map(([t, x], i) => `<li><span>${i + 1}</span><div><b>${t}</b><p>${x}</p></div></li>`).join('')}</ol>
  </section>

  <section class="pc-fim">${estado}</section>

  <footer class="pc-pe">
    ${d.outros.length ? `<p class="pc-outros">Outros planos: ${d.outros.map(o => `${esc(o.nome)} ${reais(o.preco)}`).join(' · ')}</p>` : ''}
    <p>Coleve Contabilidade · CRC-SP 2SP048990 · Travessa Dona Paula, 13 · Higienópolis, São Paulo · coleve.com.br</p>
  </footer>`;
}
