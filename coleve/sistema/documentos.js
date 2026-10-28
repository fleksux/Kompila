// Sistema Coleve · documentos dos clientes (guias, apurações...) guardados no Drive, sem link público.
// A equipe anexa na tarefa; o cliente só vê depois do "Enviar ao cliente"; baixar passa pela função documento.
import { banco } from './conexao.js?v=2';

const FUNCAO = 'https://hnuxwonsaijfxeqojlie.supabase.co/functions/v1/documento';

export const TIPOS = { guia: 'Guia', apuracao: 'Apuração', memoria_calculo: 'Memória de cálculo', recibo: 'Recibo', certidao: 'Certidão', contrato: 'Contrato', extrato: 'Extrato', nfse: 'NFS-e', ponto: 'Ponto', outro: 'Outro' };

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
