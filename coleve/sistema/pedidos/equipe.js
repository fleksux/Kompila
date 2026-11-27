// Sistema Coleve · pedidos abertos pelos clientes, visão da equipe (27/11/2026).
// Lista simples: cada pedido abre a tarefa dele em ../tarefas/#<id>.
import { banco, quemSou } from '../conexao.js?v=2';

const eu = await quemSou().catch(() => null);
if (!eu?.pessoa?.ativo) { location.replace('../../entrar/'); throw 0; }
const p = eu.pessoa;
if (p.tipo !== 'equipe') { location.replace('cliente.html'); throw 0; }

const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dBR = d => d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '';
const AREAS = { fiscal: 'Fiscal', contabil: 'Contábil', dp: 'DP', bpo: 'BPO', paralegal: 'Paralegal', atendimento: 'Atendimento' };
const ST = { 'Recebido': 'a_fazer', 'Em andamento': 'fazendo', 'Em conferência': 'conferencia', 'Pronto': 'pronto', 'Enviado': 'enviado', 'Cancelado': 'cancelado' };

$('nome').textContent = p.nome;
$('avatar').textContent = p.nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
$('papel').textContent = p.papel === 'admin' ? 'Equipe · acesso total' : 'Equipe';
$('sair').onclick = async () => { await banco.auth.signOut(); location.replace('../../entrar/'); };
$('area').insertAdjacentHTML('beforeend', Object.entries(AREAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join(''));

let P = [], filtro = 'abertos';
async function carrega() {
  const { data } = await banco.from('v_pedido').select('*').order('criado_em', { ascending: false }).limit(500);
  P = data || [];
  desenha();
}
function desenha() {
  const q = $('busca').value.trim().toLowerCase(), ar = $('area').value, so = $('urg').checked;
  const aberto = x => ['aberto', 'em_andamento'].includes(x.status);
  const L = P.filter(x => (filtro === 'todos' || (filtro === 'abertos' ? aberto(x) : !aberto(x)))
    && (!ar || x.area === ar) && (!so || x.urgente)
    && (!q || (x.empresa_nome + ' ' + x.tipo_nome + ' ' + (x.descricao || '')).toLowerCase().includes(q)))
    .sort((a, b) => filtro === 'abertos' ? (b.urgente - a.urgente) || (b.atrasado - a.atrasado) || (a.prazo || '9').localeCompare(b.prazo || '9') : 0);
  $('total').textContent = L.length + (L.length === 1 ? ' pedido' : ' pedidos');
  $('linhas').innerHTML = L.map(x => {
    const st = x.status === 'cancelado' ? 'cancelado' : ST[x.status_cliente] || 'a_fazer';
    const href = x.tarefa_id ? '../tarefas/#' + x.tarefa_id : '';
    const sub = x.resolvido_sozinho ? 'Resolvido sozinho: ' + esc(x.documento_nome || 'documento já enviado') : esc(x.descricao || '');
    return `<tr class="pd-tl" data-href="${href}" tabindex="0">
      <td class="c-ped"><b>${esc(x.tipo_nome)}${x.competencia ? ' · ' + x.competencia.slice(5, 7) + '/' + x.competencia.slice(0, 4) : ''}</b>${x.urgente ? ' <span class="pd-urg-s">Urgente</span>' : ''}${x.anexos ? ` <span class="ui-selo">${x.anexos} anexo${x.anexos > 1 ? 's' : ''}</span>` : ''}<small>${sub}</small></td>
      <td class="c-emp">${esc(x.empresa_nome)}${x.empresa_teste ? '<span class="pd-tag-teste">teste</span>' : ''}</td>
      <td class="c-area">${AREAS[x.area] || x.area}</td>
      <td class="c-st" data-st="${st}"><span class="pd-st">${x.status === 'cancelado' ? 'Cancelado' : esc(x.status_cliente)}</span></td>
      <td class="c-pz ${x.atrasado ? 'pd-atraso' : ''}">${x.prazo ? dBR(x.prazo) : ''}</td>
      <td class="c-resp">${esc(x.responsavel_nome || 'Sem responsável')}</td>
      <td class="c-qd">${dBR(x.criado_em.slice(0, 10))}</td></tr>`;
  }).join('') || `<tr><td colspan="7" class="pd-vazio">${filtro === 'abertos' ? 'Nenhum pedido aberto.' : 'Nada por aqui.'}</td></tr>`;
}
document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
  filtro = b.dataset.f;
  document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
  desenha();
});
['busca', 'area', 'urg'].forEach(id => $(id).addEventListener('input', desenha));
const vai = tr => { if (tr?.dataset.href) location.href = tr.dataset.href; };
$('linhas').addEventListener('click', e => vai(e.target.closest('tr.pd-tl')));
$('linhas').addEventListener('keydown', e => { if (e.key === 'Enter') vai(e.target.closest('tr.pd-tl')); });

await carrega();
document.body.classList.remove('carregando');
let tm;
banco.channel('coleve-pedidos-equipe')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'pedido' }, () => { clearTimeout(tm); tm = setTimeout(carrega, 400); })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tarefa' }, () => { clearTimeout(tm); tm = setTimeout(carrega, 400); })
  .subscribe();
