// Sistema Coleve · Central de Regularidade Fiscal, visão do cliente (27/11/2026)
// Cliente vê só a própria empresa e só o que a equipe validou e publicou (RLS no banco, migração 0038).
// Equipe abre com ?empresa=<id> para a prévia; aqui todas as consultas filtram publicada = true,
// então a prévia mostra exatamente o que o cliente vê. ?imprimir=1 mostra o relatório em PDF.
import { banco, quemSou } from '../conexao.js?v=2';

// Índice de Regularidade: regra provisória até o Manu validar. Enquanto false, só a equipe vê o índice na prévia.
const MOSTRA_INDICE_CLIENTE = false;

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo) { location.replace('../../entrar/'); throw 0; }
const P = eu.pessoa, EQUIPE = P.tipo === 'equipe';
const qs = new URLSearchParams(location.search);

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const iniciais = n => (n || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
const reais = v => v == null || v === '' ? '-' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = d => d ? String(d).slice(0, 10).split('-').reverse().join('/') : '';
const diaHora = d => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
const dia = d => d ? new Date(d).toLocaleDateString('pt-BR') : '';
const mesAno = d => d ? String(d).slice(5, 7) + '/' + String(d).slice(0, 4) : '';
let avisoT; const avisa = t => { $('aviso').textContent = t; clearTimeout(avisoT); avisoT = setTimeout(() => { $('aviso').textContent = ''; }, 4000); };

// cor só em status: regular verde, irregular vermelho, pendência âmbar, sem informação cinza
const SIT = {
  regular: ['Regular', 'ok'], irregular: ['Irregular', 'erro'], pendencia: ['Pendência', 'pend'],
  sem_informacao: ['Sem informação', 'cinza'], indisponivel: ['Consulta indisponível', 'cinza'], nao_consultado: ['Não consultado', 'cinza'],
  desatualizada: ['Consulta desatualizada', 'cinza'], nao_aplica: ['Não se aplica', 'cinza'],
  vencida: ['Vencida', 'erro'], vence_15: ['Vence em até 15 dias', 'pend'], valida: ['Válida', 'ok']
};
const selo = (k, txt) => { const [n, c] = SIT[k] || [k || '-', 'cinza']; return `<span class="rg-selo rg-selo--${c}">${esc(txt || n)}</span>`; };
const FRASE = {
  regular: 'Nenhuma pendência nos órgãos consultados.', irregular: 'Existem pendências identificadas.',
  pendencia: 'Há itens em acompanhamento, sem débito exigível.', sem_informacao: 'Algum órgão ainda não tem consulta válida. Isso não significa regularidade.'
};
const SITDEB = { exigivel: 'Exigível', inscrito: 'Dívida ativa', parcelado: 'Parcelado', suspenso: 'Suspenso' };
const CERT = { negativa: 'Negativa (CND)', positiva_efeito_negativa: 'Positiva com efeito de negativa', positiva: 'Positiva' };
const seloCert = s => `<span class="rg-selo rg-selo--${s === 'negativa' ? 'ok' : s === 'positiva' ? 'erro' : 'pend'}">${CERT[s]}</span>`;
const RES = { regular: 'Regular', irregular: 'Irregular', sem_informacao: 'Sem informação', indisponivel: 'Consulta indisponível', nao_aplica: 'Não se aplica' };
const NOME_ST = { identificada: 'Pendência identificada', aguardando_analise: 'Em análise pela Coleve', em_analise: 'Em análise pela Coleve', cliente_comunicado: 'Cliente comunicado', aguardando_cliente: 'Aguardando documentação ou pagamento', em_regularizacao: 'Em regularização', regularizado: 'Regularizado', arquivado: 'Concluído' };

// ===== barra =====
$('nome').textContent = P.nome;
$('avatar').textContent = iniciais(P.nome);
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };
if (EQUIPE) { $('papel').textContent = 'Equipe Coleve'; $('previa').hidden = false; document.querySelector('.barra__nav a').href = './'; document.querySelector('.barra__nav a').textContent = 'Central'; }

// ===== empresa =====
let empresas = [];
if (EQUIPE) {
  if (!qs.get('empresa')) { location.replace('./'); throw 0; }
  const { data } = await banco.from('empresa').select('id,razao_social,nome_fantasia,cnpj,uf,municipio').eq('id', qs.get('empresa'));
  empresas = data || [];
} else {
  const { data } = await banco.from('empresa').select('id,razao_social,nome_fantasia,cnpj,uf,municipio').order('razao_social');
  empresas = data || [];
}
if (!empresas.length) {
  $('painel').innerHTML = '<div class="rc-bloco"><p class="rc-vazio">Nenhuma empresa vinculada a este acesso.</p></div>';
  $('pdf').hidden = true; document.body.classList.remove('carregando'); throw 0;
}
let empId = empresas.some(e => e.id === qs.get('empresa')) ? qs.get('empresa') : empresas[0].id;
if (empresas.length > 1) {
  $('e-sel').hidden = false;
  $('e-sel').innerHTML = empresas.map(e => `<option value="${e.id}">${esc(e.nome_fantasia || e.razao_social)}</option>`).join('');
  $('e-sel').onchange = () => { empId = $('e-sel').value; history.replaceState(null, '', '?empresa=' + empId); mostra(); };
}

// ===== dados (sempre só o publicado) =====
async function dados(id) {
  const [og, co, pe, ce, ix] = await Promise.all([
    banco.rpc('reg_orgaos', { p_so_publicado: true }).eq('empresa_id', id).order('ordem'),
    banco.from('consulta_fiscal').select('id,orgao_id,consultado_em,origem,resultado,resumo').eq('empresa_id', id).eq('publicada', true).order('consultado_em', { ascending: false }).limit(40),
    banco.from('v_pendencia_fiscal').select('*').eq('empresa_id', id).eq('publicada', true).order('vencimento', { ascending: true, nullsFirst: false }),
    banco.from('v_certidao').select('*').eq('empresa_id', id).eq('publicada', true).order('valida_ate', { ascending: false }),
    banco.rpc('indice_regularidade', { p_empresa: id, p_so_publicado: true })
  ]);
  const erro = [og, co, pe, ce].find(r => r.error);
  if (erro) avisa('Não deu para carregar tudo: ' + erro.error.message);
  const cons = co.data || [], pends = pe.data || [];
  const ids = cons.map(c => c.id), pids = pends.map(p => p.id);
  const [ev, rz] = await Promise.all([
    ids.length ? banco.from('evidencia_fiscal').select('id,consulta_id,nome,arquivo').in('consulta_id', ids) : { data: [] },
    pids.length ? banco.from('regularizacao').select('pendencia_id,para,criado_em').in('pendencia_id', pids).order('criado_em') : { data: [] }
  ]);
  const orgs = og.data || [];
  const abertas = pends.filter(p => p.aberta);
  const certs = (ce.data || []);
  const vigentes = certs.filter(c => c.vigente);
  const soma = k => orgs.reduce((s, o) => s + Number(o[k] || 0), 0);
  const geral = orgs.some(o => o.situacao === 'irregular') || abertas.some(p => ['exigivel', 'inscrito'].includes(p.situacao)) ? 'irregular'
    : orgs.some(o => ['nao_consultado', 'desatualizada', 'sem_informacao', 'indisponivel'].includes(o.situacao)) ? 'sem_informacao'
    : abertas.length || vigentes.some(c => c.validade === 'vencida') ? 'pendencia' : 'regular';
  const esfera = e => abertas.filter(p => p.esfera === e && ['exigivel', 'inscrito'].includes(p.situacao)).reduce((s, p) => s + Number(p.valor_referencia || 0), 0);
  return {
    orgs, cons, pends, abertas, certs, vigentes, geral, indice: ix.data,
    evid: ev.data || [], etapas: rz.data || [],
    total: { aberto: soma('em_aberto'), divida: soma('divida_ativa'), parcelado: soma('parcelado'), suspenso: soma('suspenso'), semValor: soma('sem_valor'),
             federal: esfera('federal'), estadual: esfera('estadual'), municipal: esfera('municipal') },
    consultados: orgs.filter(o => o.consulta_id).length,
    falhas: orgs.filter(o => ['sem_informacao', 'indisponivel'].includes(o.situacao)).length,
    regularizadas: pends.filter(p => !p.aberta)
  };
}

const baixa = async caminho => {
  const { data, error } = await banco.storage.from('regularidade').createSignedUrl(caminho, 120);
  if (error) return avisa('Não deu para abrir o arquivo.');
  window.open(data.signedUrl, '_blank', 'noopener');
};

// ===== painel =====
let D = null, orgaoSel = null;
async function mostra() {
  const e = empresas.find(x => x.id === empId);
  $('e-nome').textContent = e.nome_fantasia || e.razao_social;
  $('e-info').textContent = [e.cnpj, [e.municipio, e.uf].filter(Boolean).join('/')].filter(Boolean).join(' · ');
  $('pdf').href = `?empresa=${empId}&imprimir=1`;
  D = await dados(empId);
  orgaoSel = (D.orgs.find(o => o.pendencias > 0) || {}).orgao_id || null;
  desenha();
}

function desenha() {
  const t = D.total, ver = MOSTRA_INDICE_CLIENTE || EQUIPE;
  const cls = { irregular: 'erro', regular: 'ok', pendencia: 'pend', sem_informacao: 'cinza' }[D.geral];
  const ix = D.indice?.indice ?? null;
  const corIx = ix == null ? '#8A919C' : ix >= 80 ? 'var(--ui-verde)' : ix >= 50 ? 'var(--ui-ambar)' : 'var(--ui-verm)';
  const det = orgaoSel ? D.orgs.find(o => o.orgao_id === orgaoSel) : null;
  const pendsDet = det ? D.abertas.filter(p => p.orgao_id === orgaoSel) : [];
  const evDet = det ? D.evid.filter(x => x.consulta_id === det.consulta_id || pendsDet.some(p => p.consulta_id === x.consulta_id)) : [];

  $('painel').innerHTML = `
    <div class="rc-kpis">
      <div class="rc-cx rc-cx--${cls}"><small>Situação geral</small><b>${(SIT[D.geral] || [D.geral])[0]}</b><p>${FRASE[D.geral]}</p></div>
      <div class="rc-cx${t.aberto ? ' rc-cx--erro' : ''}"><small>Débitos em aberto</small><b>${reais(t.aberto)}</b><p>exigíveis e inscritos em dívida ativa</p></div>
      <div class="rc-cx"><small>Órgãos consultados</small><b>${D.consultados}</b><p>${D.falhas ? D.falhas + ' consulta(s) sem resposta do órgão' : 'consultas realizadas'}</p></div>
      <div class="rc-cx${D.abertas.length ? ' rc-cx--pend' : ''}"><small>Pendências identificadas</small><b>${D.abertas.length}</b><p>itens em aberto</p></div>
    </div>
    <div class="rc-bloco">
      <h2>Valores por situação <small>não somamos tudo como dívida: parcelado e suspenso aparecem separados</small></h2>
      <div class="rc-valores" style="margin-top:0"><span>Exigível <b>${reais(t.aberto - t.divida)}</b></span><span>Dívida ativa <b>${reais(t.divida)}</b></span><span>Parcelado <b>${reais(t.parcelado)}</b></span><span>Suspenso <b>${reais(t.suspenso)}</b></span><span>Sem valor identificado <b>${t.semValor}</b></span></div>
      <div class="rc-valores"><span>Federal <b>${reais(t.federal)}</b></span><span>Estadual <b>${reais(t.estadual)}</b></span><span>Municipal <b>${reais(t.municipal)}</b></span></div>
      ${ver && ix != null ? `<div class="rc-indice" style="margin-top:14px"><span class="rc-indice__n">${ix}<small>/100</small></span><span class="rc-barra" style="--cor:${corIx}"><i style="width:${ix}%"></i></span></div>
        <p class="rc-vazio" style="margin-top:6px">Índice de Regularidade: indicativo, não substitui a análise do contador.${EQUIPE && !MOSTRA_INDICE_CLIENTE ? ' Regra provisória: só a equipe vê até o Manu validar.' : ''}</p>
        ${D.indice.criterios?.length ? `<details class="rg-det"><summary>Como foi calculado</summary><ul class="rg-crit">${D.indice.criterios.map(c => `<li><span>${esc(c.criterio)}</span><span>${c.pontos}</span></li>`).join('')}</ul></details>` : ''}` : ''}
    </div>

    <div class="rc-bloco">
      <h2>Resumo por órgão <small>toque para ver o detalhamento</small></h2>
      <div class="rc-orgaos">${D.orgs.map(o => `<button type="button" class="rc-org${o.orgao_id === orgaoSel ? ' is-on' : ''}" data-org="${o.orgao_id}">
        <b>${esc(o.orgao_nome)}</b>${selo(o.situacao)}
        <strong>${reais(o.em_aberto)}</strong><small>${o.consultado_em ? 'consultado em ' + dia(o.consultado_em) : 'ainda não consultado'}</small></button>`).join('') || '<p class="rc-vazio">Nenhum órgão consultado ainda.</p>'}</div>
    </div>

    ${det ? `<div class="rc-bloco" id="detalhe">
      <h2>Detalhamento · ${esc(det.orgao_nome)} <small>${pendsDet.length} pendência(s) · ${reais(det.em_aberto)} em aberto</small></h2>
      ${pendsDet.length ? `<div class="rc-rolagem"><table class="rc-tab"><thead><tr><th>Tributo</th><th>Código</th><th>Período</th><th>Vencimento</th><th class="n">Principal</th><th class="n">Multa</th><th class="n">Juros</th><th class="n">Atualizado</th><th>Situação</th><th>Processo ou inscrição</th><th>Andamento</th></tr></thead><tbody>
        ${pendsDet.map(p => `<tr><td>${esc(p.tributo)}</td><td>${esc(p.codigo_receita || '-')}</td><td>${mesAno(p.periodo) || '-'}</td><td>${dataBR(p.vencimento) || '-'}</td>
          <td class="n">${reais(p.valor_principal)}</td><td class="n">${reais(p.valor_multa)}</td><td class="n">${reais(p.valor_juros)}</td><td class="n">${reais(p.valor_referencia)}</td>
          <td>${p.situacao ? `<span class="rg-selo rg-selo--${['exigivel', 'inscrito'].includes(p.situacao) ? 'erro' : p.situacao === 'parcelado' ? 'pend' : 'cinza'}">${SITDEB[p.situacao]}</span>` : '<span class="rg-selo rg-selo--pend">Sem valor</span>'}</td>
          <td>${esc(p.processo || '-')}</td><td>${esc(NOME_ST[p.status])}</td></tr>
          ${p.orientacao ? `<tr class="rc-ori"><td colspan="11">Orientação: ${esc(p.orientacao)}</td></tr>` : ''}`).join('')}</tbody></table></div>`
        : `<p class="rc-vazio">${det.situacao === 'regular' ? 'Nenhuma pendência neste órgão.' : esc((SIT[det.situacao] || [''])[0]) + '. ' + esc(D.cons.find(c => c.id === det.consulta_id)?.resumo || '')}</p>`}
      ${evDet.length ? `<p class="rc-vazio" style="margin-top:10px">Comprovante da consulta:</p><ul class="rg-evid">${evDet.map(x => `<li><button type="button" data-baixa="${esc(x.arquivo)}"><span>${esc(x.nome)}</span></button></li>`).join('')}</ul>` : ''}
    </div>` : ''}

    <div class="rc-2">
      <div class="rc-bloco">
        <h2>Certidões</h2>
        ${D.vigentes.length ? `<table class="rc-tab"><tbody>${D.vigentes.map(c => `<tr><td>${esc(c.tipo)}<br><small class="rg-muted">${esc(c.orgao_sigla)} · emitida em ${dataBR(c.emitida_em)}</small></td>
          <td>${seloCert(c.situacao)}</td><td>${selo(c.validade, 'até ' + dataBR(c.valida_ate))}</td>
          <td class="n">${c.arquivo ? `<button class="ui-btn ui-btn--fan" type="button" data-baixa="${esc(c.arquivo)}" style="height:26px">Baixar</button>` : ''}</td></tr>`).join('')}</tbody></table>`
          : '<p class="rc-vazio">Nenhuma certidão disponível ainda.</p>'}
      </div>
      <div class="rc-bloco">
        <h2>Últimas consultas</h2>
        ${D.cons.length ? `<table class="rc-tab"><thead><tr><th>Órgão</th><th>Data</th><th>Resultado</th></tr></thead><tbody>${D.cons.slice(0, 8).map(c => `<tr><td>${esc(D.orgs.find(o => o.orgao_id === c.orgao_id)?.orgao_sigla || c.orgao_id)}</td><td>${dia(c.consultado_em)}</td><td>${selo(c.resultado, RES[c.resultado])}</td></tr>`).join('')}</tbody></table>`
          : '<p class="rc-vazio">Nenhuma consulta publicada ainda.</p>'}
      </div>
    </div>

    <div class="rc-bloco">
      <h2>Histórico de regularizações</h2>
      ${D.regularizadas.length ? `<table class="rc-tab"><tbody>${D.regularizadas.map(p => { const fim = D.etapas.filter(x => x.pendencia_id === p.id && ['regularizado', 'arquivado'].includes(x.para)).pop();
        return `<tr><td>${esc(p.tributo)}${p.periodo ? ' · ' + mesAno(p.periodo) : ''} <small class="rg-muted">${esc(p.orgao_sigla)}</small>${p.solucao ? `<br><small class="rg-muted">${esc(p.solucao)}</small>` : ''}</td><td>${selo(p.status === 'regularizado' ? 'regular' : 'nao_aplica', NOME_ST[p.status])}</td><td class="n">${fim ? dia(fim.criado_em) : ''}</td></tr>`; }).join('')}</tbody></table>`
        : '<p class="rc-vazio">Nenhuma regularização concluída ainda.</p>'}
    </div>
    <p class="rc-vazio" style="margin-top:12px">Consulta indisponível ou sem resposta do órgão não significa regularidade. Os resultados são conferidos pela equipe contábil da Coleve antes de aparecer aqui.</p>`;
}
$('painel').addEventListener('click', e => {
  const o = e.target.closest('[data-org]');
  if (o) { orgaoSel = orgaoSel === o.dataset.org ? null : o.dataset.org; desenha(); if (orgaoSel) $('detalhe')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const b = e.target.closest('[data-baixa]'); if (b) baixa(b.dataset.baixa);
});

// ===== relatório para imprimir (molde do PDF das reuniões) =====
async function relatorio() {
  const e = empresas.find(x => x.id === empId);
  D = await dados(empId);
  const t = D.total, ver = MOSTRA_INDICE_CLIENTE || EQUIPE;
  document.title = 'Relatório de regularidade fiscal · ' + (e.nome_fantasia || e.razao_social);
  document.querySelector('.barra').hidden = true; $('rc').hidden = true; document.body.classList.add('modo-doc');
  const tab = (cab, linhas, num = []) => linhas.length ? `<table><tr>${cab.map((c, i) => `<th${num.includes(i) ? ' class="n"' : ''}>${c}</th>`).join('')}</tr>${linhas.map(l => `<tr>${l.map((c, i) => `<td${num.includes(i) ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</table>` : '<p class="vz">Nada a informar.</p>';
  const sec = (tt, html) => `<section><h3>${tt}</h3>${html}</section>`;
  const sitTxt = k => (SIT[k] || [k])[0];
  const ori = D.abertas.filter(p => p.orientacao);
  $('doc').hidden = false;
  $('doc').innerHTML = `
    <div class="doc__barra"><button type="button" class="ui-btn ui-btn--pri" onclick="print()">Salvar PDF</button></div>
    <header class="doc__topo"><img src="../../img/logo_contabilidade.svg" alt="Coleve contabilidade"><address>Travessa Dona Paula, 13 · Higienópolis, São Paulo<br>www.coleve.com.br</address></header>
    <div class="doc__tit"><h1>Relatório de Regularidade Fiscal</h1><p>COLEVE CONTABILIDADE · ${esc(e.razao_social)}</p></div>
    <div class="doc__info"><div><small>CNPJ</small><b>${esc(e.cnpj || '-')}</b></div><div><small>Município</small><b>${esc([e.municipio, e.uf].filter(Boolean).join('/') || '-')}</b></div><div><small>Situação geral</small><b>${sitTxt(D.geral)}</b></div><div><small>Emitido em</small><b>${new Date().toLocaleDateString('pt-BR')}</b></div></div>
    ${sec('1. Resumo', `<p>${FRASE[D.geral]}</p>${tab(['Débitos em aberto', 'Exigível', 'Dívida ativa', 'Parcelado', 'Suspenso', 'Sem valor identificado'], [[reais(t.aberto), reais(t.aberto - t.divida), reais(t.divida), reais(t.parcelado), reais(t.suspenso), t.semValor]], [0, 1, 2, 3, 4, 5])}
      ${ver && D.indice ? `<p style="margin-top:8px">Índice de Regularidade: <b>${D.indice.indice}/100</b> (indicativo, não substitui a análise do contador).</p>` : ''}`)}
    ${sec('2. Situação por órgão', tab(['Órgão', 'Situação', 'Em aberto', 'Última consulta'], D.orgs.map(o => [esc(o.orgao_nome), sitTxt(o.situacao), reais(o.em_aberto), o.consultado_em ? diaHora(o.consultado_em) : 'não consultado']), [2]))}
    ${sec('3. Pendências identificadas', tab(['Órgão', 'Tributo', 'Código', 'Período', 'Vencimento', 'Principal', 'Multa', 'Juros', 'Atualizado', 'Situação', 'Processo'],
      D.abertas.map(p => [esc(p.orgao_sigla), esc(p.tributo), esc(p.codigo_receita || '-'), mesAno(p.periodo) || '-', dataBR(p.vencimento) || '-', reais(p.valor_principal), reais(p.valor_multa), reais(p.valor_juros), reais(p.valor_referencia), p.situacao ? SITDEB[p.situacao] : 'Sem valor', esc(p.processo || '-')]), [5, 6, 7, 8]))}
    ${ori.length ? sec('4. Orientações de regularização', `<ul>${ori.map(p => `<li><b>${esc(p.tributo)}${p.periodo ? ' ' + mesAno(p.periodo) : ''}:</b> ${esc(p.orientacao)}</li>`).join('')}</ul>`) : ''}
    ${sec((ori.length ? '5' : '4') + '. Certidões', tab(['Certidão', 'Órgão', 'Situação', 'Emissão', 'Validade'], D.vigentes.map(c => [esc(c.tipo), esc(c.orgao_sigla), CERT[c.situacao], dataBR(c.emitida_em), dataBR(c.valida_ate) + (c.validade === 'vencida' ? ' (vencida)' : '')])))}
    ${sec((ori.length ? '6' : '5') + '. Regularizações concluídas', tab(['Pendência', 'Órgão', 'Situação', 'Solução'], D.regularizadas.map(p => [esc(p.tributo) + (p.periodo ? ' ' + mesAno(p.periodo) : ''), esc(p.orgao_sigla), NOME_ST[p.status], esc(p.solucao || '-')])))}
    ${sec((ori.length ? '7' : '6') + '. Consultas realizadas', tab(['Órgão', 'Data e hora', 'Origem', 'Resultado'], D.cons.map(c => [esc(D.orgs.find(o => o.orgao_id === c.orgao_id)?.orgao_sigla || c.orgao_id), diaHora(c.consultado_em), c.origem === 'manual' ? 'Consulta no portal do órgão' : 'Consulta automática', RES[c.resultado]])))}
    <p class="doc__pe">Resultados conferidos pela equipe contábil da Coleve. Consulta indisponível ou sem resposta do órgão não significa regularidade. Valores parcelados e suspensos aparecem separados e não entram em "débitos em aberto". Os comprovantes de cada consulta ficam disponíveis na área do cliente.</p>`;
}

if (qs.get('imprimir')) { await relatorio(); document.body.classList.remove('carregando'); throw 0; }
await mostra();
document.body.classList.remove('carregando');
