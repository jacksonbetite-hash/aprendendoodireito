import Link from 'next/link';
import { Pagina, Icone } from './componentes.tsx';
import { listarAreasEmCache, listarMateriasEmCache } from '../lib/catalogo.ts';

export const dynamic = 'force-dynamic';

/** Cor do selo por área, para o catálogo ter identidade visual própria. */
const SELO: Record<string, { classe: string; icone: string }> = {
  fundamentos:      { classe: 'selo-primaria',   icone: 'account_balance' },
  'direito-publico':{ classe: 'selo-secundaria', icone: 'public' },
  'direito-privado':{ classe: 'selo-terciaria',  icone: 'handshake' },
  penal:            { classe: 'selo-primaria',   icone: 'gavel' },
  trabalho:         { classe: 'selo-secundaria', icone: 'work' },
  processo:         { classe: 'selo-terciaria',  icone: 'description' },
  profissional:     { classe: 'selo-neutra',     icone: 'workspace_premium' },
};

export default async function Home() {
  const [areas, materias] = await Promise.all([listarAreasEmCache(), listarMateriasEmCache()]);
  const publicadas = materias.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
  const aulas = publicadas.reduce((s, m) => s + m.aulasPublicadas, 0);
  const questoes = publicadas.reduce((s, m) => s + m.questoes, 0);

  return (
    <Pagina>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-grade">
          <div>
            <span className="chip chip-secundaria">
              <Icone nome="auto_awesome" tamanho={16} /> Direito Descomplicado
            </span>
            <h1>Entenda Direito sem <em>decorar.</em></h1>
            <p>
              Transformamos conceitos complexos em uma jornada de aprendizado visual, empática e
              focada no que realmente importa para a sua compreensão.
            </p>
            <form className="busca-hero" action="/vademecum">
              <Icone nome="search" tamanho={22} />
              <input name="q" placeholder="O que você quer aprender hoje?" aria-label="Buscar" />
              <button className="btn btn-primario btn-sm" type="submit">Buscar</button>
            </form>
            <p className="caption suave" style={{ marginTop: 20 }}>
              {publicadas.length} matérias no ar · {aulas} aulas · {questoes} questões comentadas
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="hero-figura">
              <span className="marca-agua">aula em vídeo · 8 a 15 min</span>
              <Icone nome="play_circle" tamanho={84} className="" />
            </div>
            <div className="hero-selo">
              <span className="selo selo-terciaria"><Icone nome="menu_book" tamanho={22} /></span>
              <span className="texto">Aulas baseadas em<strong>Casos Reais</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Áreas do Direito ---------- */}
      <section className="secao">
        <div className="container">
          <div className="secao-titulo">
            <h2>Explore as áreas do Direito</h2>
            <p>Caminhos de aprendizado estruturados para guiar você desde os conceitos básicos até as aplicações práticas.</p>
          </div>

          <div className="grade-4">
            {areas.map((area) => {
              const daArea = materias.filter((m) => m.areaSlug === area.slug);
              const noAr = daArea.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
              const pct = daArea.length ? Math.round((noAr.length / daArea.length) * 100) : 0;
              const visual = SELO[area.slug] ?? SELO.profissional;
              const primeira = noAr[0];

              return (
                <Link className="cartao cartao-area" href={primeira ? `/materia/${primeira.slug}` : '/catalogo'} key={area.id}>
                  <span className={`selo ${visual.classe}`}><Icone nome={visual.icone} /></span>
                  <h3>{area.nome}</h3>
                  <p>
                    {daArea.length
                      ? daArea.map((m) => m.nome.replace(/^Noções de /, '')).slice(0, 3).join(', ') + '.'
                      : 'Área do mapa definitivo, ainda em produção.'}
                  </p>
                  <div className="progresso" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
                  <span className="acao">
                    {noAr.length ? 'Começar' : 'Em breve'} <Icone nome="arrow_forward" tamanho={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Como funciona ---------- */}
      <section className="secao tinta">
        <div className="container">
          <div className="secao-titulo">
            <h2>Como funciona</h2>
            <p>Um método simples, visual e direto ao ponto. Sem jargões desnecessários.</p>
          </div>
          <div className="grade-3">
            {[
              { n: 1, cor: 'var(--primary)', icone: 'play_circle', titulo: 'Assista a aula',
                texto: 'Vídeos curtos, animações visuais e exemplos do dia a dia para você entender o conceito de primeira.' },
              { n: 2, cor: 'var(--secondary)', icone: 'menu_book', titulo: 'Consulte a lei',
                texto: 'Lemos o artigo da lei junto com você, traduzindo o "juridiquês" em tempo real com notas explicativas.' },
              { n: 3, cor: 'var(--tertiary)', icone: 'quiz', titulo: 'Faça o exercício',
                texto: 'Teste seu conhecimento imediatamente com questões práticas e receba feedback detalhado se errar.' },
            ].map((p) => (
              <div className="cartao passo" key={p.n}>
                <span className="numero" style={{ background: p.cor }}>{p.n}</span>
                <Icone nome={p.icone} tamanho={30} />
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Chamada ---------- */}
      <section className="secao">
        <div className="container">
          <div className="chamada">
            <h2>Experimente 7 dias grátis</h2>
            <p>
              Liberte-se da decoreba. Acesse o catálogo, faça exercícios e descubra que o Direito
              pode ser fascinante. Sem compromisso, sem precisar de cartão de crédito agora.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn-primario" href="/cadastrar">Começar meu teste grátis</Link>
              <span className="nota">* Não requer cartão de crédito</span>
            </div>
          </div>
        </div>
      </section>
    </Pagina>
  );
}
