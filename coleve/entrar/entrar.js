// Sistema Coleve · tela de acesso, ligada ao banco coleve-sistema
const perfil = document.querySelector('.perfil');
const form = document.getElementById('form-acesso');
const aviso = form.querySelector('.aviso');
const botao = form.querySelector('button[type=submit]');
const ajudaCliente = document.querySelector('.ajuda__cliente');
const ajudaEquipe = document.querySelector('.ajuda__equipe');

const avisa = (txt, ok = false) => { aviso.classList.toggle('ok', ok); aviso.textContent = txt; };

// cliente ou equipe
perfil.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  perfil.dataset.perfil = b.dataset.perfil;
  perfil.querySelectorAll('button').forEach(x => {
    x.classList.toggle('is-ativo', x === b);
    x.setAttribute('aria-selected', x === b);
  });
  const equipe = b.dataset.perfil === 'equipe';
  ajudaCliente.hidden = equipe;
  ajudaEquipe.hidden = !equipe;
  form.email.placeholder = equipe ? 'seu usuário ou e-mail da Coleve' : 'voce@suaempresa.com.br ou seu usuário';
  avisa('');
}));

// mostrar senha
const olho = form.querySelector('.olho');
olho.addEventListener('click', () => {
  const ver = form.senha.type === 'password';
  form.senha.type = ver ? 'text' : 'password';
  olho.setAttribute('aria-label', ver ? 'Esconder senha' : 'Mostrar senha');
});

// "manter conectado" fica lembrado neste aparelho
try { form.lembrar.checked = localStorage.getItem('coleve_lembrar') !== '0'; } catch {}

const carregaBanco = async () => (await import('../sistema/conexao.js?v=2'));

// já logado? vai direto pro sistema
carregaBanco().then(async ({ quemSou }) => {
  const eu = await quemSou();
  if (eu?.pessoa?.ativo) location.replace('../sistema/');
}).catch(() => {});

form.addEventListener('submit', async ev => {
  ev.preventDefault();
  form.querySelectorAll('.erro').forEach(x => x.classList.remove('erro'));
  const email = form.email.value.trim().toLowerCase(), senha = form.senha.value;
  const faltas = [];
  if (!email || (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) faltas.push(form.email);
  if (!senha) faltas.push(form.senha);
  if (faltas.length) {
    faltas.forEach(i => i.closest('.campo').classList.add('erro'));
    avisa(faltas[0] === form.email ? 'Digite o seu e-mail ou usuário.' : 'Digite a sua senha.');
    faltas[0].focus();
    return;
  }

  try { localStorage.setItem('coleve_lembrar', form.lembrar.checked ? '1' : '0'); } catch {}
  botao.disabled = true; botao.textContent = 'Entrando...'; avisa('');

  try {
    const { banco, quemSou, entrarCom } = await carregaBanco();
    if (!(await entrarCom(email, senha))) {
      form.senha.closest('.campo').classList.add('erro');
      avisa('Usuário, e-mail ou senha não conferem.');
      return;
    }
    const eu = await quemSou();
    if (!eu?.pessoa || !eu.pessoa.ativo) {
      await banco.auth.signOut();
      avisa('Seu acesso ainda não foi liberado. Fale com a Coleve no WhatsApp (11) 92002-7321.');
      return;
    }
    location.replace('../sistema/');
  } catch {
    avisa('Sem conexão com o sistema. Confira a internet e tente de novo.');
  } finally {
    botao.disabled = false; botao.textContent = 'Entrar';
  }
});

// esqueci a senha: manda o link por e-mail
document.getElementById('esqueci').addEventListener('click', async ev => {
  ev.preventDefault();
  const email = form.email.value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.email.closest('.campo').classList.add('erro');
    avisa('Escreva o seu e-mail (não o usuário) acima e clique de novo em "Esqueci a senha". Se você só tem usuário, peça ao Alex para trocar a senha.');
    form.email.focus();
    return;
  }
  try {
    const { banco } = await carregaBanco();
    const volta = new URL('nova-senha/', location.href).href;
    const { error } = await banco.auth.resetPasswordForEmail(email, { redirectTo: volta });
    if (error && /rate|seconds/i.test(error.message)) { avisa('Já mandamos um link há pouco. Espere um minuto e tente de novo.'); return; }
    avisa('Se esse e-mail tiver acesso, o link para criar uma nova senha chega em instantes. Olhe também o spam.', true);
  } catch {
    avisa('Sem conexão com o sistema. Confira a internet e tente de novo.');
  }
});
