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
  const { data: pessoa } = await banco.from('pessoa').select('id,nome,email,tipo,papel,area,ativo').eq('id', session.user.id).maybeSingle();
  return { session, pessoa };
}
