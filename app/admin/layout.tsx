import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Marca } from '../componentes.tsx';
import { sair } from '../acoes-auth.ts';
import { alunoAtual, exigirAdmin } from '../../lib/sessao.ts';

export const dynamic = 'force-dynamic';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  // Guarda única do painel: qualquer rota sob /admin passa por aqui.
  const u = await exigirAdmin();
  if (!u) {
    // Distingue os dois casos: quem não está logado precisa entrar; quem
    // está logado sem o papel precisa saber que não tem acesso, e não ser
    // jogado numa tela de login que o devolveria ao painel sem explicação.
    const logado = await alunoAtual();
    redirect(logado ? '/painel?sem-acesso=1' : '/entrar?destino=/admin');
  }

  return (
    <div className="app-body">
      <div className="app-shell">
        <aside className="sidebar">
          <Marca claro />
          <span className="etiqueta-admin">Administração</span>
          <Link className="side-link" href="/admin">📊 Visão geral</Link>
          <Link className="side-link" href="/admin/precos">💰 Preços</Link>
          <Link className="side-link" href="/admin/licencas">🔑 Licenças</Link>
          <Link className="side-link" href="/admin/alunos">👥 Alunos</Link>
          <Link className="side-link" href="/painel">↩ Área do aluno</Link>
          <form action={sair} style={{ marginTop: 'auto' }}>
            <button className="side-link" type="submit" style={{ width: '100%', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
              🚪 Sair
            </button>
          </form>
        </aside>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
