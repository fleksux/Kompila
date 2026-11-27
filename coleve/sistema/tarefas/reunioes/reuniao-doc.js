// Sistema Coleve · PDF do resumo executivo de reunião (modelo do Manu). Usado pela equipe (Reuniões) e pelo cliente
// (reunioes-cliente.html). Recebe a reunião já com os nomes resolvidos; o reservado e a transcrição nunca entram aqui.
// r = { titulo, quando, participantes, empresa_nome, acompanha_nome, status, objetivo, assuntos[], definido, feito, informes,
//       riscos[{risco, impacto, acao, responsavel_nome}], proximo_acomp, proximo_resp_nome, resultado_esperado,
//       acoes[{tipo: plano|proximo|pendencia, descricao, falta, gatilho, prazo, responsavel_nome, solicitante_nome, status}] }
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dataBR = d => d ? d.slice(0, 10).split('-').reverse().join('/') : '';
const quandoBR = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const AD = '<span class="ad">A definir</span>';
const STATUS = { a_fazer: 'A fazer', andamento: 'Em andamento', atencao: 'Em atenção', concluido: 'Concluído' };
const ST_ASS = { andamento: 'Em andamento', concluido: 'Concluído', pendente: 'Pendente' };
const ST_TAREFA = { a_fazer: 'A fazer', fazendo: 'Em andamento', conferencia: 'Em conferência', pronto: 'Pronto', enviado: 'Concluído', cancelado: 'Cancelado' };

export function docHTML(r, { logo = '../../../img/logo_contabilidade.svg', imprimir = true } = {}) {
  const ou = (v, html = false) => v ? (html ? v : esc(v)) : AD;
  const lista = t => (t || '').split('\n').map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  const ul = t => lista(t).length ? `<ul>${lista(t).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="vz">-</p>';
  const tab = (cab, linhas) => linhas.length ? `<table><tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr>${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>` : '<p class="vz">-</p>';
  const stp = (s, cls) => `<span class="pill pill--${cls}">${s}</span>`;
  const sec = (n, t, html) => `<section><h3><span>${n}</span>${t}</h3>${html}</section>`;
  const acoes = r.acoes || [];
  const plano = acoes.filter(a => a.tipo === 'plano'), prox = acoes.filter(a => a.tipo === 'proximo'), pend = acoes.filter(a => a.tipo === 'pendencia');
  const stT = a => a.status ? stp(ST_TAREFA[a.status], a.status === 'enviado' ? 'ok' : a.status === 'a_fazer' ? 'novo' : 'and') : stp('Sem responsável', 'novo');
  const quando = a => a.prazo ? dataBR(a.prazo) : a.gatilho ? 'Quando ' + esc(a.gatilho.replace(/^quando\s+/i, '')) : AD;
  return `
    ${imprimir ? '<div class="doc__barra"><button type="button" class="btn-a" onclick="print()">Salvar PDF</button></div>' : ''}
    <header class="doc__topo"><img src="${logo}" alt="Coleve contabilidade"><address>Travessa Dona Paula, 13 · Higienópolis, São Paulo<br>www.coleve.com.br</address></header>
    <div class="doc__tit"><h1>Resumo Executivo de Reunião</h1><p>COLEVE CONTABILIDADE</p></div>
    <div class="doc__info"><div><small>Data da reunião</small><b>${quandoBR(r.quando)}</b></div><div><small>Participantes</small><b>${ou(r.participantes)}</b></div><div><small>Projeto / área</small><b>${esc(r.titulo)}${r.empresa_nome ? ' · ' + esc(r.empresa_nome) : ''}</b></div><div><small>Acompanhamento</small><b>${ou(r.acompanha_nome)}</b></div><div><small>Status geral</small>${stp(STATUS[r.status] || r.status, { concluido: 'ok', atencao: 'pend', a_fazer: 'novo' }[r.status] || 'and')}</div></div>
    ${sec(1, 'Objetivo da reunião', `<p>${esc(r.objetivo || '-')}</p>`)}
    ${sec(2, 'Assuntos tratados', tab(['Assunto', 'Síntese / contexto', 'Status'], (r.assuntos || []).map(a => [esc(a.assunto), esc(a.sintese), stp(ST_ASS[a.status] || a.status, { concluido: 'ok', pendente: 'pend' }[a.status] || 'and')])))}
    ${sec(3, 'O que foi definido', ul(r.definido))}
    ${sec(4, 'Plano de ação · tarefas delegadas', tab(['Tarefa / entrega', 'Responsável', 'Solicitante', 'Prazo', 'Status'], plano.map(a => [esc(a.descricao), ou(a.responsavel_nome), esc(a.solicitante_nome || '-'), quando(a), stT(a)])))}
    <div class="doc__2">${sec(5, 'O que já foi feito', ul(r.feito))}${sec(6, 'Pendências e assuntos em aberto', tab(['Pendência', 'O que falta', 'Responsável', 'Prazo'], pend.map(p => [esc(p.descricao), esc(p.falta || '-'), ou(p.responsavel_nome), quando(p)])))}</div>
    <div class="doc__2">${sec(7, 'Pontos de atenção e riscos', tab(['Risco', 'Impacto', 'Ação preventiva', 'Responsável'], (r.riscos || []).map(x => [esc(x.risco), esc(x.impacto), esc(x.acao), ou(x.responsavel_nome)])))}${sec(8, 'Informes compartilhados', ul(r.informes))}</div>
    ${sec(9, 'Próximos passos', tab(['Ordem', 'Ação', 'Responsável', 'Prazo ou gatilho'], prox.map((a, i) => [i + 1, esc(a.descricao), ou(a.responsavel_nome), quando(a)])))}
    <footer class="doc__pe"><div><small>Próximo acompanhamento</small><b>${r.proximo_acomp ? dataBR(r.proximo_acomp) : AD}</b></div><div><small>Responsável</small><b>${ou(r.proximo_resp_nome)}</b></div><div><small>Resultado esperado</small><b>${ou(r.resultado_esperado)}</b></div></footer>`;
}

// ===== "Montar resumo pela IA": por enquanto só monta o texto para colar numa IA (sem chave de IA no sistema) =====
// PONTO DE INTEGRAÇÃO: quando houver chave, trocar o corpo de montarResumoIA() por uma chamada a uma função do banco
// (ex.: supabase/functions/reuniao_resumo, recebendo {reuniao_id}) que devolve o JSON abaixo e preenche o formulário
// com preencheComResumo(). O formato pedido já é o que a tela entende.
export const FORMATO_RESUMO = {
  objetivo: 'texto de 1 a 3 frases',
  assuntos: [{ assunto: '', sintese: '', status: 'andamento | concluido | pendente' }],
  definido: 'uma decisão por linha',
  plano: [{ descricao: '', responsavel: 'nome de quem vai fazer', prazo: 'AAAA-MM-DD ou vazio' }],
  feito: 'uma entrega por linha',
  pendencias: [{ descricao: '', falta: '', responsavel: '', prazo: '' }],
  riscos: [{ risco: '', impacto: '', acao: '', responsavel: '' }],
  informes: 'um por linha',
  proximos: [{ descricao: '', responsavel: '', prazo: 'AAAA-MM-DD', gatilho: 'use quando não houver data' }],
  proximo_acomp: 'AAAA-MM-DD', resultado_esperado: ''
};
export function montarResumoIA({ transcricao, titulo, participantes, equipe = [] }) {
  return [
    'Você é o assistente da Coleve Contabilidade. Monte o RESUMO EXECUTIVO DE REUNIÃO a partir das anotações abaixo.',
    'Responda só com um JSON neste formato (campos vazios quando a anotação não disser):',
    JSON.stringify(FORMATO_RESUMO, null, 2),
    'Regras: português do Brasil, frases curtas, sem travessão. Não invente prazo nem responsável. Assunto reservado (salário, sócio, conflito) não entra.',
    equipe.length ? 'Equipe da Coleve (use estes nomes como responsáveis): ' + equipe.join(', ') : '',
    `Reunião: ${titulo || '-'} · Participantes: ${participantes || '-'}`,
    '--- ANOTAÇÕES ---',
    transcricao || ''
  ].filter(Boolean).join('\n\n');
}
