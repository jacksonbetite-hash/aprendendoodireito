import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Icone } from '../componentes.tsx';
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
    <div className="">
      <div className="app">
        <aside className="lateral">
          <div className="lateral-marca">
            <span className="nome">
              <span className="selo selo-primaria"><Icone nome="admin_panel_settings" /></span>
              Painel Admin
            </span>
            <span className="sub">Gestão jurídica humanista</span>
          </div>
          <Link className="item-lateral ativo-admin" href="/admin"><Icone nome="dashboard" /> Dashboard</Link>
          <Link className="item-lateral" href="/admin/precos"><Icone nome="payments" /> Preços</Link>
          <Link className="item-lateral" href="/admin/licencas"><Icone nome="verified_user" /> Licenças</Link>
          <Link className="item-lateral" href="/admin/alunos"><Icone nome="group" /> Alunos</Link>
          <Link className="item-lateral" href="/painel"><Icone nome="school" /> Área do aluno</Link>
          <form action={sair} style={{ marginTop: 'auto' }}>
            <button className="item-lateral saida" type="submit"><Icone nome="logout" /> Sair</button>
          </form>
        </aside>
        <div className="conteudo"><div className="miolo">{children}</div></div>
      </div>
    </div>
  );
}
