import Link from 'next/link';
import { Pagina } from './componentes.tsx';
import { listarMateriasEmCache, formatarDuracao } from '../lib/catalogo.ts';
import { dispositivosDaAula } from '../lib/vademecum.ts';
import { buscarAula } from '../lib/catalogo.ts';

// SSR com consultas em cache (lib/cache.ts): HTML completo para o Google
// sem exigir banco no tempo de build.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const materias = await listarMateriasEmCache();
  const publicadas = materias.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
  const totalAulas = publicadas.reduce((s, m) => s + m.aulasPublicadas, 0);
  const totalQuestoes = publicadas.reduce((s, m) => s + m.questoes, 0);

  const destaque = await buscarAula('direitos-fundamentais-na-pratica');
  const leis = destaque ? await dispositivosDaAula(destaque.id) : [];

  return (
    <Pagina>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">✦ Curso livre de Direito</span>
            <h1>Entender Direito <span className="hl">sem precisar decorar</span></h1>
            <p className="lead">
              Aula curta, linguagem de gente, a lei ao lado e um exercício no final
              para provar que você aprendeu. Você escolhe a matéria — não precisa
              levar o pacote inteiro.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" href="/planos">Começar teste de 7 dias</Link>
              <Link className="btn btn-outline btn-lg" href="/catalogo">Ver as matérias</Link>
            </div>
            <p className="hero-note">
              {publicadas.length} matérias no ar · {totalAulas} aulas · {totalQuestoes} questões comentadas
            </p>
          </div>

          {destaque && (
            <aside className="hero-card">
              <div className="video-mock">
                <span className="wm">Ana Souza · ***.456.789-**</span>
                <span className="play">▶</span>
                <span className="dur">{formatarDuracao(destaque.duracaoSegundos)}</span>
              </div>
              <h3>{destaque.titulo}</h3>
              <p className="meta">{destaque.materiaNome} · {destaque.professor}</p>
              <div>
                {leis.slice(0, 3).map((d) => (
                  <span className="law-chip" key={d.id}>📖 {d.rotulo}, {d.normaSigla}</span>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Como funciona</div>
            <h2>Toda aula tem a mesma anatomia — e nenhuma sai sem exercício</h2>
            <p>É regra de produto, não item opcional: aula sem exercício não é publicada.</p>
          </div>
          <div className="grid-4">
            <div className="card lift">
              <div className="icon">🎬</div>
              <h3>Vídeo de 8 a 15 min</h3>
              <p>O vídeo da aula ministrada é o centro da página. Curto o bastante para caber no ônibus.</p>
            </div>
            <div className="card lift">
              <div className="icon accent">📝</div>
              <h3>Resumo em texto</h3>
              <p>Prefere ler? Todo vídeo tem resumo escrito, legendas e material de apoio em PDF.</p>
            </div>
            <div className="card lift">
              <div className="icon success">⚖️</div>
              <h3>A lei ao lado</h3>
              <p>Os artigos citados abrem num painel lateral, sem sair da aula. Favorite e anote.</p>
            </div>
            <div className="card lift">
              <div className="icon deep">✅</div>
              <h3>Exercício no final</h3>
              <p>No mínimo 5 questões, com comentário em <em>todas</em> as alternativas — inclusive nas erradas.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section tint">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Catálogo em ondas</div>
            <h2>Comece pelas matérias que já estão no ar</h2>
            <p>
              Abrimos com as primeiras matérias prontas e liberamos as demais em ondas.
              Entre na lista de espera e ajude a decidir qual vem primeiro.
            </p>
          </div>
          <div className="materia-grid">
            {publicadas.map((m) => (
              <Link className="materia-card" href={`/materia/${m.slug}`} key={m.id}>
                <span className="pill wave">{m.onda}ª onda</span>
                <h4>{m.nome}</h4>
                <p className="ementa">{m.ementa}</p>
                <div className="foot">
                  <span>{m.areaNome}</span>
                  <span>{m.aulasPublicadas} {m.aulasPublicadas === 1 ? 'aula' : 'aulas'}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
            <Link className="btn btn-outline" href="/catalogo">Ver as 11 matérias e as 7 áreas →</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <div className="kicker" style={{ color: 'var(--accent-600)', fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase', fontSize: '.78rem', marginBottom: '.5rem' }}>
                O diferencial
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', lineHeight: 1.22, marginBottom: '.8rem' }}>
                Vade-mécum de verdade, dentro da aula
              </h2>
              <p style={{ color: 'var(--ink-soft)', marginBottom: '1.2rem' }}>
                Não é um PDF anexo. É um painel que abre o artigo exato que o professor está
                explicando — com busca por número (<code>art. 5º CF</code>), índice navegável,
                favoritos e anotações suas. E é <strong>aberto</strong>: dá para consultar sem pagar nada.
              </p>
              <Link className="btn btn-primary" href="/vademecum">Abrir o vade-mécum</Link>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="vade-panel" style={{ border: 0, position: 'static' }}>
                <header><strong>📖 Vade-mécum</strong><span style={{ fontSize: '.78rem', opacity: .8 }}>nesta aula</span></header>
                <div className="body" style={{ maxHeight: 'none' }}>
                  {leis.slice(0, 2).map((d) => (
                    <div className="artigo" key={d.id}>
                      <div className="ref"><span>{d.normaSigla} · {d.rotulo}</span></div>
                      <div className="texto-lei">{d.texto.slice(0, 240)}{d.texto.length > 240 ? ' […]' : ''}</div>
                    </div>
                  ))}
                </div>
                <div className="stamp">✔ Texto conferido em 28/08/2026 · fonte: LexML / Planalto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="callout">
            <div>
              <h2>Teste 7 dias, sem cartão</h2>
              <p>Escolha uma matéria e estude de verdade antes de decidir. Se não continuar, seu progresso e suas anotações ficam guardados.</p>
            </div>
            <Link className="btn btn-accent btn-lg" href="/planos">Quero testar</Link>
          </div>
        </div>
      </section>
    </Pagina>
  );
}
