import Link from 'next/link';
import { alunoAtual } from '../lib/sessao.ts';
import { sair } from './acoes-auth.ts';

export { Icone, Marca } from './ui.tsx';
import { Icone, Marca } from './ui.tsx';

export async function Cabecalho({ ativo }: { ativo?: string }) {
  const aluno = await alunoAtual();
  const item = (href: string, chave: string, texto: string) => (
    <Link href={href} className={ativo === chave ? 'ativo' : undefined}>{texto}</Link>
  );

  return (
    <header className="topo">
      <div className="container topo-nav">
        <Marca />
        <nav className="topo-links">
          {item('/catalogo', 'catalogo', 'Catálogo')}
          {item('/vademecum', 'vademecum', 'Vade-mécum')}
          {item('/planos', 'planos', 'Planos')}
        </nav>
        <form className="busca-topo" action="/vademecum">
          <Icone nome="search" tamanho={20} />
          <input name="q" placeholder="Buscar na lei…" aria-label="Buscar no vade-mécum" />
        </form>
        <div className="topo-acoes">
          {aluno ? (
            <>
              {aluno.papel === 'admin' && (
                <Link className="btn btn-contorno btn-sm" href="/admin">Admin</Link>
              )}
              <Link className="link-entrar" href="/painel">Meu painel</Link>
              <form action={sair}>
                <button className="link-entrar" type="submit">Sair</button>
              </form>
            </>
          ) : (
            <>
              <Link className="link-entrar" href="/entrar">Entrar</Link>
              <Link className="btn btn-primario btn-sm" href="/cadastrar">Teste Grátis</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="container">
        <div className="rodape-grade">
          <div>
            <Marca />
            <p className="caption suave" style={{ marginTop: 12, maxWidth: '22rem', lineHeight: 1.7 }}>
              © 2026 Aprendendo o Direito. Democratizando o conhecimento jurídico com afeto.
            </p>
          </div>
          <div>
            <h4>Plataforma</h4>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/planos">Planos</Link>
            <Link href="/vademecum">Vade-mécum</Link>
            <Link href="/painel">Área do aluno</Link>
          </div>
          <div>
            <h4>Empresa</h4>
            <Link href="/planos#legal">Sobre nós</Link>
            <Link href="/planos#legal">Carreiras</Link>
            <Link href="/planos#legal">Blog</Link>
          </div>
          <div>
            <h4>Suporte</h4>
            <Link href="/planos#legal">Ajuda</Link>
            <Link href="/planos#legal">Contato</Link>
            <Link href="/planos#legal">Termos</Link>
            <Link href="/planos#legal">Privacidade</Link>
          </div>
        </div>
        <div className="rodape-legal">
          <strong>Curso livre.</strong> O Aprendendo o Direito não é instituição de ensino
          credenciada pelo MEC e não emite certificado de curso reconhecido. Também não presta
          consultoria jurídica nem responde a caso concreto.<br />
          Direito de arrependimento em 7 dias (CDC, art. 49) · Cancelamento em 2 cliques no painel.
        </div>
      </div>
    </footer>
  );
}

export async function Pagina({ children, ativo }: { children: React.ReactNode; ativo?: string }) {
  return (
    <>
      <Cabecalho ativo={ativo} />
      <main>{children}</main>
      <Rodape />
    </>
  );
}
