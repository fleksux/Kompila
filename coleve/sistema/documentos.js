// Sistema Coleve · documentos dos clientes (guias, apurações...) guardados no Drive, sem link público.
// A equipe anexa na tarefa; o cliente só vê depois do "Enviar ao cliente"; baixar passa pela função documento.
import { banco } from './conexao.js?v=2';

const FUNCAO = 'https://hnuxwonsaijfxeqojlie.supabase.co/functions/v1/documento';

export const TIPOS = { guia: 'Guia', apuracao: 'Apuração', memoria_calculo: 'Memória de cálculo', recibo: 'Recibo', certidao: 'Certidão', contrato: 'Contrato', extrato: 'Extrato', nfse: 'NFS-e', ponto: 'Ponto', outro: 'Outro',
  xml_vendas: 'XML das notas', adquirente: 'Cartões e app', energia: 'Fatura de energia', compras: 'Compras e despesas', contas: 'Contas a pagar e receber', ativo: 'Equipamento' };

async function chama(acao, extra) {
  const { data, error } = await banco.functions.invoke('documento', { body: { acao, ...extra } });
  if (error || data?.erro) throw new Error(data?.erro || error?.message || 'documento');
  return data;
}

// manda o arquivo direto do navegador pra pasta da empresa no Drive e registra o documento na tarefa
export async function anexar(tarefa, arquivo, campos, progresso) {
  const { envio } = await chama('enviar', { tarefa_id: tarefa.id, nome: arquivo.name, tipo: arquivo.type || 'application/octet-stream', tamanho: arquivo.size });
  const f = await new Promise((ok, falha) => {
    const x = new XMLHttpRequest();
    x.open('PUT', envio);
    x.upload.onprogress = e => progresso?.(e.loaded / e.total);
    x.onload = () => x.status < 300 ? ok(JSON.parse(x.responseText)) : falha(new Error('Drive ' + x.status));
    x.onerror = () => falha(new Error('rede'));
    x.send(arquivo);
  });
  const { data: { session } } = await banco.auth.getSession();
  const { error } = await banco.from('documento').insert({
    empresa_id: tarefa.empresa_id, tarefa_id: tarefa.id, nome: arquivo.name, tipo: campos.tipo || 'guia',
    competencia: tarefa.competencia, arquivo: 'drive:' + f.id, mime: arquivo.type || null, tamanho: arquivo.size,
    valor: campos.valor || null, vencimento: campos.vencimento || null, enviado_por: session.user.id, visivel_cliente: false
  });
  if (error) throw error;
}

// baixa (ou abre, se for PDF ou imagem) pelo servidor, que confere quem está pedindo
export async function baixar(doc) {
  const { data: { session } } = await banco.auth.getSession();
  const r = await fetch(FUNCAO, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ acao: 'baixar', documento_id: doc.id })
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).erro || 'não deu para baixar');
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url; a.download = doc.nome;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export const reais = v => v == null ? '' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// o cliente manda o arquivo de um item do checklist: vai pro Drive da empresa e dá baixa na pendência
export async function enviarPendencia(empresaId, tipo, competencia, arquivo, progresso) {
  const { envio } = await chama('enviar_cliente', { empresa_id: empresaId, competencia, nome: arquivo.name, tipo: arquivo.type || 'application/octet-stream', tamanho: arquivo.size });
  const f = await new Promise((ok, falha) => {
    const x = new XMLHttpRequest();
    x.open('PUT', envio);
    x.upload.onprogress = e => progresso?.(e.loaded / e.total);
    x.onload = () => x.status < 300 ? ok(JSON.parse(x.responseText)) : falha(new Error('Drive ' + x.status));
    x.onerror = () => falha(new Error('rede'));
    x.send(arquivo);
  });
  const { error } = await banco.rpc('enviar_pendencia', { p_empresa: empresaId, p_tipo: tipo, p_competencia: competencia,
    p_arquivo: 'drive:' + f.id, p_nome: arquivo.name, p_mime: arquivo.type || null, p_tamanho: arquivo.size });
  if (error) throw error;
}

// ===== checklist do mês com a cara da Coleve: o mesmo conteúdo pro e-mail, pro WhatsApp e pro sistema =====
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const mesNome = comp => MESES[+comp.slice(5, 7) - 1] + ' de ' + comp.slice(0, 4);
const dm = d => d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '';
const LINK = 'https://kompila.com.br/coleve/sistema/';

// itens: [{ nome, explica, formato, prazo, recebido }]
export function checklistWhats({ empresa, contato, competencia, itens }) {
  const falta = itens.filter(i => !i.recebido), ok = itens.filter(i => i.recebido);
  return [
    `*Coleve · documentos de ${mesNome(competencia)}*`,
    ``,
    `Olá${contato ? ', ' + contato : ''}! Para fecharmos o mês da *${empresa}*, precisamos destes arquivos:`,
    ``,
    ...falta.map(i => `▸ *${i.nome}* (${i.formato})${i.prazo ? ' · até ' + dm(i.prazo) : ''}`),
    ...(ok.length ? [``, `Já recebemos: ${ok.map(i => i.nome).join(', ')}. Obrigado!`] : []),
    ``,
    `É só enviar pela Área do cliente, sem precisar mandar por aqui:`,
    LINK,
    ``,
    `Equipe Coleve`
  ].join('\n');
}

export function checklistEmail({ empresa, contato, competencia, itens }) {
  const e = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const linha = i => `<tr><td style="padding:14px 0;border-bottom:1px solid #DCE4F2;vertical-align:top">
      <div style="font:800 16px Arial,sans-serif;color:#282828">${e(i.nome)}</div>
      <div style="font:400 14px Arial,sans-serif;color:#5B6474;margin-top:2px">${e((i.explica || '').replace(/\.$/, ''))}${i.formato ? ' · ' + e(i.formato) : ''}</div></td>
    <td style="padding:14px 0 14px 12px;border-bottom:1px solid #DCE4F2;text-align:right;white-space:nowrap;vertical-align:top">
      ${i.recebido ? '<span style="display:inline-block;background:#B9FC01;color:#282828;font:800 12px Arial,sans-serif;border-radius:999px;padding:5px 12px">RECEBIDO</span>'
        : `<span style="display:inline-block;background:#E6EFFF;color:#1A71FF;font:800 12px Arial,sans-serif;border-radius:999px;padding:5px 12px">${i.prazo ? 'ATÉ ' + dm(i.prazo) : 'QUANDO TIVER'}</span>`}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F4F9;padding:24px 0"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden">
    <tr><td style="background:#1A71FF;padding:28px 32px">
      <img src="https://kompila.com.br/coleve/img/logo_ev_branco.png" alt="Coleve" width="150" style="display:block;width:150px;height:auto">
      <div style="font:800 13px Arial,sans-serif;letter-spacing:.14em;color:#B9FC01;margin-top:20px">DOCUMENTOS DE ${e(mesNome(competencia).toUpperCase())}</div>
      <div style="font:400 28px Arial,sans-serif;color:#fff;margin-top:6px;line-height:1.15">O que precisamos da <b>${e(empresa)}</b></div>
    </td></tr>
    <tr><td style="padding:24px 32px 8px;font:400 16px Arial,sans-serif;color:#282828;line-height:1.5">
      Olá${contato ? ', ' + e(contato) : ''}! Para fecharmos o mês, envie os arquivos abaixo pela Área do cliente. Cada um vai direto para a pasta da sua empresa.
    </td></tr>
    <tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itens.map(linha).join('')}</table></td></tr>
    <tr><td style="padding:28px 32px 32px" align="left">
      <a href="${LINK}" style="display:inline-block;background:#B9FC01;color:#282828;font:800 16px Arial,sans-serif;text-decoration:none;border-radius:999px;padding:14px 28px">Enviar pela Área do cliente</a>
      <div style="font:400 13px Arial,sans-serif;color:#5B6474;margin-top:20px">Equipe Coleve</div>
    </td></tr>
  </table></td></tr></table>`;
}
