import Link from 'next/link';
import { alunoAtual } from '../lib/sessao.ts';
import { portalAtual } from '../lib/portal-consultas.ts';
import { corSegura, formatarCnpj } from '../lib/portal.ts';
import { sair } from './acoes-auth.ts';

import MenuFerramentas, { type Ferramenta } from './MenuFerramentas.tsx';

export { Icone, Marca } from './ui.tsx';
import { Icone, Marca } from './ui.tsx';

/* O submenu "Ferramentas" reúne o que se USA durante o estudo — consulta
   e apoio, não conteúdo de leitura. Só entra aqui destino que existe:
   menu com item morto é pior que menu curto.
   `naBarra` marca a ferramenta que também tem item de primeiro nível no
   topo — hoje só o caderno de erros, que mora dentro do painel. As
   demais emprestam o realce ao gatilho, senão a página não teria nenhum
   marcador aceso na barra. */
const FERRAMENTAS: Ferramenta[] = [
  {
    chave: 'vademecum',
    href: '/vademecum',
    nome: 'Vade-mécum Digital',
    descricao: 'Consulta a leis e códigos, com busca por artigo ou trecho',
    icone: 'gavel',
  },
  {
    chave: 'vagas',
    href: '/vagas',
    nome: 'Mural de Vagas',
    descricao: 'Estágios e vagas de emprego no mercado jurídico',
    icone: 'work',
  },
  {
    chave: 'caderno-de-erros',
    href: '/painel#caderno',
    nome: 'Caderno de erros',
    descricao: 'As questões que você errou, reunidas para revisar',
    icone: 'edit_note',
    naBarra: true,
  },
];

export async function Cabecalho({ ativo }: { ativo?: string }) {
  const [aluno, portal] = await Promise.all([alunoAtual(), portalAtual()]);
  const noPortal = portal.id !== 0;
  const item = (href: string, chave: string, texto: string) => (
    <Link href={href} className={ativo === chave ? 'ativo' : undefined}>{texto}</Link>
  );
  // No portal de um professor (§5.10), o site é dele: a marca é a dele, e
  // blog e mural de vagas — conteúdo nosso — saem do menu. A biblioteca
  // fica, porque a lei ao lado da aula é o método, não conteúdo editorial.
  const ferramentas = noPortal ? FERRAMENTAS.filter((f) => f.chave !== 'vagas') : FERRAMENTAS;

  return (
    <header className="topo">
      <div className="container topo-nav">
        <Marca nome={noPortal ? portal.nomeExibicao : undefined} />
        {/* Navegação ao centro: a marca ancora a esquerda, a ação de entrar
            ancora a direita, e o miolo fica com os destinos. */}
        {/* A Biblioteca saiu da barra: ela é ferramenta de consulta e já
            tem lugar no submenu, onde a descrição diz o que ela faz. O
            Blog ocupa o primeiro nível porque é conteúdo de leitura, a
            porta de entrada de quem ainda não é aluno. */}
        <nav className="topo-links">
          {item('/catalogo', 'catalogo', 'Cursos')}
          {!noPortal && item('/blog', 'blog', 'Blog')}
          {item('/planos', 'planos', 'Planos')}
          {item('/painel', 'painel', 'Meu painel')}
          <MenuFerramentas itens={ferramentas} ativo={ativo} />
        </nav>
        <div className="topo-acoes">
          {aluno ? (
            <>
              {aluno.papel === 'admin' && (
                <Link className="btn btn-contorno btn-sm" href="/admin">Admin</Link>
              )}
              {aluno.papel === 'professor' && !noPortal && (
                <Link className="btn btn-contorno btn-sm" href="/professor">Meu portal</Link>
              )}
              <form action={sair}>
                <button className="link-entrar" type="submit">Sair</button>
              </form>
            </>
          ) : (
            <Link className="btn btn-primario btn-sm" href="/entrar">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export async function Rodape() {
  // O convite ao professor só existe no site principal: no portal de um
  // professor, o rodapé anunciar "monte o seu" seria concorrência dentro
  // da casa dele (§5.10.2, etapa 3).
  const portal = await portalAtual();
  const plataforma = portal.id === 0;

  if (!plataforma) {
    // §5.10, rodapé legal do portal: quem responde pelo conteúdo é o
    // professor (identificado), e quem opera cobrança e entrega é a
    // plataforma. Os dois nomes, com todas as letras.
    return (
      <footer className="rodape">
        <div className="container">
          <div className="rodape-grade">
            <div>
              <Marca nome={portal.nomeExibicao} />
              <p className="caption suave" style={{ marginTop: 12, maxWidth: '22rem', lineHeight: 1.7 }}>
                {portal.personalizacao.contato && <>Contato: {portal.personalizacao.contato}<br /></>}
                Responsável pelo conteúdo: {portal.responsavelNome ?? portal.nomeExibicao}
                {portal.responsavelDoc && <> · CNPJ {formatarCnpj(portal.responsavelDoc)}</>}
              </p>
            </div>
            <div>
              <h4>Neste portal</h4>
              <Link href="/catalogo">Cursos</Link>
              <Link href="/planos">Planos</Link>
              <Link href="/vademecum">Biblioteca</Link>
              <Link href="/painel">Área do aluno</Link>
            </div>
            <div>
              <h4>Suporte</h4>
              <Link href="/planos#legal">Pagamento e cancelamento</Link>
              <Link href="/planos#legal">Reembolso</Link>
              <Link href="/planos#legal">Privacidade</Link>
            </div>
          </div>
          <div className="rodape-legal">
            <strong>Curso livre</strong>, de responsabilidade do professor identificado acima.
            Portal hospedado e operado pela plataforma Aprimore o Saber, que responde por
            cobrança, entrega e suporte técnico. Não é instituição credenciada pelo MEC.<br />
            Direito de arrependimento em 7 dias (CDC, art. 49) · Cancelamento em 2 cliques no painel.
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="rodape">
      <div className="container">
        <div className="rodape-grade">
          <div>
            <Marca />
            <p className="caption suave" style={{ marginTop: 12, maxWidth: '22rem', lineHeight: 1.7 }}>
              © 2026 Aprimore o Saber. Conhecimento aplicado, no seu ritmo, sem decoreba.
            </p>
          </div>
          <div>
            <h4>Plataforma</h4>
            <Link href="/catalogo">Cursos</Link>
            <Link href="/planos">Planos</Link>
            <Link href="/vademecum">Biblioteca</Link>
            <Link href="/painel">Área do aluno</Link>
          </div>
          <div>
            <h4>Empresa</h4>
            <Link href="/planos#legal">Sobre nós</Link>
            {plataforma && <Link href="/para-professores">Para professores</Link>}
            <Link href="/blog">Blog</Link>
            <Link href="/vagas">Mural de vagas</Link>
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
          <strong>Curso livre.</strong> O Aprimore o Saber não é instituição de ensino
          credenciada pelo MEC e não emite certificado de curso reconhecido. Também não presta
          consultoria profissional nem responde a caso concreto.<br />
          Direito de arrependimento em 7 dias (CDC, art. 49) · Cancelamento em 2 cliques no painel.
        </div>
      </div>
    </footer>
  );
}

/**
 * §5.10 — inadimplência do professor: o portal SUSPENSO sai do ar para o
 * visitante, mas o aluno com licença vigente continua assistindo. As
 * páginas públicas perguntam aqui se devem esconder o conteúdo; quem tem
 * algo liberado (login, licença) passa reto.
 */
export async function portalSuspenso(): Promise<boolean> {
  return (await portalAtual()).status === 'SUSPENSO';
}

export async function PortalSuspenso() {
  const portal = await portalAtual();
  return (
    <Pagina>
      <section className="secao caixa-auth">
        <div className="cartao cartao-auth" style={{ width: 'min(560px, 92vw)' }}>
          <h1>{portal.nomeExibicao} está temporariamente indisponível</h1>
          <p className="sub">
            O portal está fora do ar por pendência administrativa do responsável. Se você já
            tem uma licença ativa, entre na sua conta: o seu acesso continua valendo até o
            fim do período contratado.
          </p>
          <Link className="btn btn-primario" href="/entrar">Entrar na minha conta</Link>
        </div>
      </section>
    </Pagina>
  );
}

export async function Pagina({ children, ativo }: { children: React.ReactNode; ativo?: string }) {
  // §5.10 — a cor principal do portal entra como variável de tema. Só uma
  // cor validada (#rgb/#rrggbb) chega ao CSS: cor é dado, não código.
  const portal = await portalAtual();
  const cor = corSegura(portal.personalizacao.corPrimaria);
  return (
    <>
      {cor && (
        <style>{`:root{--primary:${cor};--primary-texto:${cor};--primary-container:${cor};--on-primary-fixed-variant:${cor}}`}</style>
      )}
      <Cabecalho ativo={ativo} />
      <main>{children}</main>
      <Rodape />
    </>
  );
}
