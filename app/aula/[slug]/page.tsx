import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina } from '../../componentes.tsx';
import Exercicio from '../../Exercicio.tsx';
import AbasAula from '../../AbasAula.tsx';
import { buscarAula, materiaisDaAula, vizinhas, formatarDuracao } from '../../../lib/catalogo.ts';
import { dispositivosDaAula } from '../../../lib/vademecum.ts';
import { exercicioDaAula } from '../../../lib/exercicio.ts';
import { espectadorAtual, alunoAtual } from '../../../lib/sessao.ts';
import { podeAcessar, ofertaPara } from '../../../lib/licenca.ts';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const aula = await buscarAula(slug);
  if (!aula) return { title: 'Aula não encontrada' };
  return {
    title: aula.titulo,
    // o resumo é público mesmo com a aula bloqueada — é o motor de SEO (§5.3)
    description: aula.resumo.split('\n')[0].slice(0, 160),
  };
}

export default async function PaginaAula({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const aula = await buscarAula(slug);
  if (!aula || aula.status !== 'publicado') notFound();

  const [espectador, aluno, leis, materiais, viz] = await Promise.all([
    espectadorAtual(), alunoAtual(),
    dispositivosDaAula(aula.id), materiaisDaAula(aula.id), vizinhas(aula),
  ]);

  // §6.3 — a decisão de acesso passa toda por aqui
  const decisao = podeAcessar(espectador, {
    id: aula.id, materiaId: aula.materiaId,
    amostraGratuita: aula.amostraGratuita, noTrial: aula.noTrial,
  });

  const questoes = decisao.libera ? await exercicioDaAula(aula.id) : [];
  const marcaDagua = aluno ? `${aluno.nome} · ***.456.789-**` : 'visitante';

  const painelLei = (
    <aside className="vade-panel">
      <header>
        <strong>📖 Vade-mécum</strong>
        <span style={{ fontSize: '.75rem', opacity: .85 }}>nesta aula</span>
      </header>
      <div className="body">
        {leis.length === 0 && <p style={{ fontSize: '.88rem', color: 'var(--ink-soft)' }}>Esta aula não cita dispositivos.</p>}
        {leis.map((d) => (
          <div className="artigo" key={d.id}>
            <div className="ref">
              <span>{d.normaSigla} · {d.rotulo}</span>
              <Link href={`/vademecum?q=${encodeURIComponent(d.rotulo)}`} style={{ fontWeight: 700 }}>abrir ↗</Link>
            </div>
            <div className="texto-lei">{d.texto}</div>
          </div>
        ))}
      </div>
      <div className="stamp">✔ Texto conferido em 28/08/2026 · fonte: LexML / Planalto</div>
    </aside>
  );

  return (
    <Pagina>
      <div className="container aula-layout">
        <div className="player-block">
          <div className="breadcrumb" style={{ marginBottom: '.8rem' }}>
            <Link href="/catalogo">Matérias</Link> ›{' '}
            <Link href={`/materia/${aula.materiaSlug}`}>{aula.materiaNome}</Link> ›{' '}
            {aula.assuntoNome}
          </div>

          {decisao.libera ? (
            <div className="video-mock">
              {/* §10: marca d'água dinâmica com dados do aluno, posição móvel */}
              <span className="wm">{marcaDagua}</span>
              <span className="play">▶</span>
              <span className="dur">{formatarDuracao(aula.duracaoSegundos)}</span>
            </div>
          ) : (
            <div className="video-mock" style={{ background: 'linear-gradient(135deg,#3b3357,#584a7d)' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem' }}>🔒</div>
                <p style={{ maxWidth: '30rem', margin: '.6rem auto 0', fontSize: '.92rem', opacity: .9 }}>
                  {ofertaPara(decisao.motivo)}
                </p>
              </div>
            </div>
          )}

          <div className="aula-title">
            <h1>{aula.titulo}</h1>
            <p className="meta">
              {aula.professor} · {formatarDuracao(aula.duracaoSegundos)} · atualizada em{' '}
              {new Date(aula.atualizadaEm).toLocaleDateString('pt-BR')}
              {decisao.libera && decisao.motivo === 'TRIAL' && (
                <span className="pill wave" style={{ marginLeft: '.4rem' }}>Liberada pelo seu teste</span>
              )}
              {decisao.libera && decisao.motivo === 'AMOSTRA_GRATUITA' && (
                <span className="pill free" style={{ marginLeft: '.4rem' }}>Aula aberta</span>
              )}
            </p>
          </div>

          {!decisao.libera && (
            <div className="notice" style={{ marginBottom: '1.2rem' }}>
              🔒 {ofertaPara(decisao.motivo)}{' '}
              <Link href="/planos" style={{ fontWeight: 800, color: 'var(--brand-700)' }}>Ver planos →</Link>
            </div>
          )}

          <AbasAula
            abas={[
              {
                id: 'resumo', rotulo: 'Resumo',
                conteudo: <>{aula.resumo.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</>,
              },
              {
                id: 'lei', rotulo: 'Na lei',
                conteudo: (
                  <>
                    <p>Dispositivos vinculados a esta aula:</p>
                    <div style={{ marginBottom: '1rem' }}>
                      {leis.map((d) => (
                        <Link className="law-chip" href={`/vademecum?q=${encodeURIComponent(d.rotulo)}`} key={d.id}>
                          📖 {d.rotulo}, {d.normaSigla}
                        </Link>
                      ))}
                    </div>
                    <p style={{ fontSize: '.88rem', color: 'var(--ink-soft)' }}>
                      O caminho funciona nos dois sentidos: no vade-mécum, cada artigo lista as aulas que o explicam.
                    </p>
                  </>
                ),
              },
              {
                id: 'material', rotulo: 'Material',
                conteudo: decisao.libera ? (
                  <>
                    {materiais.length === 0 && <p>Esta aula ainda não tem material de apoio.</p>}
                    {materiais.map((m) => (
                      <div className="aula-row" key={m.id}>
                        <span className="num">📄</span>
                        <span className="t">
                          <strong>{m.titulo}</strong>
                          <span>PDF · {Math.round(m.bytes / 1024)} KB</span>
                        </span>
                        <span className="btn btn-outline btn-sm">Baixar</span>
                      </div>
                    ))}
                    <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.8rem' }}>
                      Os PDFs saem carimbados com seu nome e e-mail.
                    </p>
                  </>
                ) : (
                  <p className="empty-state">O material de apoio abre com a licença da matéria.</p>
                ),
              },
            ]}
          />

          {decisao.libera ? (
            <Exercicio questoes={questoes} />
          ) : (
            <section className="exercicio">
              <h2>✍️ Exercício da aula</h2>
              <p className="empty-state">
                Esta aula tem exercício com {aula.questoes} questões comentadas. Ele abre junto com a aula.
              </p>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {viz.anterior
              ? <Link className="btn btn-outline btn-sm" href={`/aula/${viz.anterior.slug}`}>← {viz.anterior.titulo}</Link>
              : <span />}
            {viz.proxima && (
              <Link className="btn btn-primary btn-sm" href={`/aula/${viz.proxima.slug}`}>{viz.proxima.titulo} →</Link>
            )}
          </div>
        </div>

        {painelLei}
      </div>
    </Pagina>
  );
}
