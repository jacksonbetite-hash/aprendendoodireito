import Link from 'next/link';

export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <Link className="brand" href="/" style={claro ? { color: '#fff' } : undefined}>
      <span className="mark">§</span> Aprendendo <em>o Direito</em>
    </Link>
  );
}

export function Cabecalho() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Marca />
        <nav className="nav-links">
          <Link href="/catalogo">Matérias</Link>
          <Link href="/vademecum">Vade-mécum</Link>
          <Link href="/planos">Planos</Link>
        </nav>
        <div className="nav-cta">
          <Link className="btn btn-outline btn-sm" href="/painel">Entrar</Link>
          <Link className="btn btn-primary btn-sm" href="/planos">Testar 7 dias grátis</Link>
        </div>
      </div>
    </header>
  );
}

export function Rodape() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Marca claro />
            <p style={{ marginTop: '.7rem', maxWidth: '26rem' }}>
              Entender Direito sem precisar decorar. Aula curta, linguagem de gente e a lei ao lado.
            </p>
          </div>
          <div>
            <h4>Plataforma</h4>
            <Link href="/catalogo">Matérias</Link>
            <Link href="/vademecum">Vade-mécum</Link>
            <Link href="/planos">Planos e licenças</Link>
            <Link href="/painel">Área do aluno</Link>
          </div>
          <div>
            <h4>Institucional</h4>
            <Link href="/planos#legal">Termos e reembolso</Link>
            <Link href="/planos#legal">Privacidade e LGPD</Link>
          </div>
        </div>
        <div className="footer-legal">
          <strong>Curso livre.</strong> O Aprendendo o Direito não é instituição de ensino
          credenciada pelo MEC e não emite certificado de curso reconhecido. Também não presta
          consultoria jurídica nem responde a caso concreto.<br />
          Direito de arrependimento em 7 dias (CDC, art. 49) · Cancelamento em 2 cliques no painel.
        </div>
      </div>
    </footer>
  );
}

export function Pagina({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cabecalho />
      {children}
      <Rodape />
    </>
  );
}
