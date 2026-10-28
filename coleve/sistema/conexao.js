// Sistema Coleve · conexão com o banco coleve-sistema (Supabase).
// A chave anon é pública por desenho: quem protege os dados são as regras de acesso (RLS) do banco.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const BANCO_URL = 'https://hnuxwonsaijfxeqojlie.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudXh3b25zYWlqZnhlcW9qbGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDk2NzQsImV4cCI6MjEwODcyNTY3NH0.lZP7V-RwS-x0Pwn6Jmv8AHBqGrI4XNi7_l9B96ZcDeQ';

// "Manter conectado" desmarcado: a sessão some quando fecha o navegador
const lembrar = (() => { try { return localStorage.getItem('coleve_lembrar') !== '0'; } catch { return true; } })();

export const banco = createClient(BANCO_URL, ANON, {
  auth: { storage: lembrar ? localStorage : sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export const raiz = new URL('../', import.meta.url).href;   // .../coleve/

// quem está logado: sessão + linha em pessoa (tipo cliente ou equipe)
export async function quemSou() {
  const { data: { session } } = await banco.auth.getSession();
  if (!session) return null;
  const { data: pessoa } = await banco.from('pessoa').select('id,nome,email,tipo,papel,area,ativo,usuario,trocar_senha').eq('id', session.user.id).maybeSingle();
  // primeiro acesso (senha provisória): ninguém passa sem criar a própria senha
  if (pessoa?.trocar_senha && !location.pathname.includes('/nova-senha/')) {
    location.replace(new URL('../entrar/nova-senha/?primeiro=1', import.meta.url).href);
    await new Promise(() => {});
  }
  return { session, pessoa };
}

// entrar com usuário (sem @): o servidor acha o e-mail; com @, entra direto
export async function entrarCom(login, senha) {
  if (login.includes('@')) {
    const { error } = await banco.auth.signInWithPassword({ email: login, password: senha });
    return !error;
  }
  const r = await fetch(BANCO_URL + '/functions/v1/entrar', {
    method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: login, senha })
  });
  const d = await r.json().catch(() => ({}));
  if (!d.access_token) return false;
  const { error } = await banco.auth.setSession({ access_token: d.access_token, refresh_token: d.refresh_token });
  return !error;
}
