// Sistema Coleve · tela de acesso (só a tela; o login entra quando o sistema existir)
const perfil = document.querySelector('.perfil');
const form = document.getElementById('form-acesso');
const aviso = form.querySelector('.aviso');
const ajudaCliente = document.querySelector('.ajuda__cliente');
const ajudaEquipe = document.querySelector('.ajuda__equipe');

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
  form.email.placeholder = equipe ? 'voce@coleve.com.br' : 'voce@suaempresa.com.br';
  aviso.textContent = '';
}));

// mostrar senha
const olho = form.querySelector('.olho');
olho.addEventListener('click', () => {
  const ver = form.senha.type === 'password';
  form.senha.type = ver ? 'text' : 'password';
  olho.setAttribute('aria-label', ver ? 'Esconder senha' : 'Mostrar senha');
});

// valida e avisa que o acesso abre em breve
form.addEventListener('submit', ev => {
  ev.preventDefault();
  form.querySelectorAll('.erro').forEach(x => x.classList.remove('erro'));
  aviso.classList.remove('ok');
  const email = form.email.value.trim(), senha = form.senha.value;
  const faltas = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) faltas.push(form.email);
  if (!senha) faltas.push(form.senha);
  if (faltas.length) {
    faltas.forEach(i => i.closest('.campo').classList.add('erro'));
    aviso.textContent = faltas[0] === form.email ? 'Confira o e-mail.' : 'Digite a sua senha.';
    faltas[0].focus();
    return;
  }
  aviso.classList.add('ok');
  aviso.textContent = 'O Sistema Coleve está em implantação. Você recebe o convite de acesso por e-mail assim que a sua conta for liberada.';
});

document.getElementById('esqueci').addEventListener('click', ev => {
  ev.preventDefault();
  aviso.classList.add('ok');
  aviso.textContent = 'Para trocar a senha, fale com a Coleve no WhatsApp (11) 92002-7321.';
});
