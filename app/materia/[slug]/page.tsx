import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina } from '../../componentes.tsx';
import {
  buscarMateria, listarAulasDaMateria, listarMaterias, formatarDuracao,
} from '../../../lib/catalogo.ts';
import { espectadorAtual } from '../../../lib/sessao.ts';
import { brl, porMes } from '../../../lib/precos.ts';
import { tabelaVigente } from '../../../lib/precos-consultas.ts';
import { podeAcessar } from '../../../lib/licenca.ts';

export const dynamic = 'force-dynamic';  // o cadeado depende da licença de quem olha

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const materia = await buscarMateria(slug);
  if (!materia) return { title: 'Matéria não encontrada' };
  return { title: materia.nome, description: materia.ementa };
}

export default async function PaginaMateria({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const materia = await buscarMateria(slug);
  if (!materia) notFound();

  const [aulas, espectador, tabela] = await Promise.all([
    listarAulasDaMateria(materia.id),
    espectadorAtual(),
    tabelaVigente(),
  ]);

  const publicadas = aulas.filter((a) => a.status === 'publicado');
  const emProducao = aulas.filter((a) => a.status !== 'publicado');
  const assuntos = [...new Set(publicadas.map((a) => a.assuntoSlug))];

  return (
    <Pagina>
      <section className="materia-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link> › <Link href="/catalogo">Matérias</Link> › {materia.areaNome}
          </div>
          <span className="pill wave">{materia.onda}ª onda · publicada</span>
          <h1>{materia.nome}</h1>
          <p className="sub">{materia.ementa}</p>
          {materia.professor && (
            <div className="prof-chip">
              <span className="avatar">
                {materia.professor.replace(/^Prof\.?ª?\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <span><strong>{materia.professor}</strong></span>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2.4rem' }}>
        <div className="container materia-layout">
          <div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.6rem', fontSize: '.9rem', color: 'var(--ink-soft)' }}>
              <span>📚 {assuntos.length} assuntos</span>
              <span>🎬 {materia.aulasPublicadas} aulas</span>
              <span>✍️ {materia.questoes} questões</span>
              <span>⏱ {formatarDuracao(materia.duracaoTotal)} de vídeo</span>
            </div>

            {assuntos.map((assuntoSlug, i) => {
              const doAssunto = publicadas.filter((a) => a.assuntoSlug === assuntoSlug);
              return (
                <div className="assunto" key={assuntoSlug}>
                  <h3>
                    {i + 1}. {doAssunto[0].assuntoNome}
                    {doAssunto.some((a) => a.amostraGratuita) && <span className="pill free">1ª aula grátis</span>}
                  </h3>
                  {doAssunto.map((aula) => {
                    const decisao = podeAcessar(espectador, {
                      id: aula.id, materiaId: materia.id,
                      amostraGratuita: aula.amostraGratuita, noTrial: aula.noTrial,
                    });
                    const etiqueta = aula.amostraGratuita
                      ? { classe: 'free', texto: 'Grátis' }
                      : decisao.libera
                        ? { classe: 'wave', texto: decisao.motivo === 'TRIAL' ? 'Teste' : 'Liberada' }
                        : { classe: 'locked', texto: 'Licença' };

                    const conteudo = (
                      <>
                        <span className="num">{decisao.libera ? '▶' : '🔒'}</span>
                        <span className="t">
                          <strong>{aula.titulo}</strong>
                          <span>{formatarDuracao(aula.duracaoSegundos)} · {aula.questoes} questões</span>
                        </span>
                        <span className={`pill ${etiqueta.classe}`}>{etiqueta.texto}</span>
                      </>
                    );

                    return decisao.libera ? (
                      <Link className="aula-row" href={`/aula/${aula.slug}`} key={aula.id}>{conteudo}</Link>
                    ) : (
                      <Link className="aula-row locked" href={`/aula/${aula.slug}`} key={aula.id}>{conteudo}</Link>
                    );
                  })}
                </div>
              );
            })}

            {emProducao.length > 0 && (
              <div className="notice">
                ✍️ Mais {emProducao.length} {emProducao.length === 1 ? 'aula gravada aguarda' : 'aulas gravadas aguardam'} o
                exercício para ir ao ar. Aula sem exercício não é publicada — é regra, não exceção.
              </div>
            )}
          </div>

          <aside className="card compra-box">
            <div style={{ fontSize: '.8rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 800, marginBottom: '.5rem' }}>
              Licença desta matéria
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--brand-900)' }}>
              {brl(tabela.MATERIA.mensal)}<small style={{ fontSize: '.9rem', fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', fontWeight: 600 }}>/mês</small>
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginBottom: '1.1rem' }}>
              ou {brl(tabela.MATERIA.anual)} no plano anual ({brl(porMes(tabela.MATERIA.anual, 'anual'))}/mês)
            </p>
            <Link className="btn btn-primary" style={{ width: '100%', marginBottom: '.6rem' }} href="/planos">
              Assinar esta matéria
            </Link>
            <Link className="btn btn-outline" style={{ width: '100%', marginBottom: '1.1rem' }} href="/planos">
              Testar 7 dias grátis
            </Link>
            <ul style={{ fontSize: '.88rem' }}>
              <li style={{ padding: '.3rem 0' }}>✔ {materia.aulasPublicadas} aulas em vídeo com legendas</li>
              <li style={{ padding: '.3rem 0' }}>✔ {materia.questoes} questões comentadas</li>
              <li style={{ padding: '.3rem 0' }}>✔ Vade-mécum dentro da aula</li>
              <li style={{ padding: '.3rem 0' }}>✔ Material de apoio em PDF</li>
              <li style={{ padding: '.3rem 0' }}>✔ Anotações e caderno de erros</li>
            </ul>
            <p style={{ fontSize: '.78rem', color: 'var(--ink-soft)', marginTop: '1rem', borderTop: '1px dashed var(--line)', paddingTop: '.8rem' }}>
              Arrependeu? Devolvemos 100% em até 7 dias, sem justificativa (CDC, art. 49).
            </p>
          </aside>
        </div>
      </section>
    </Pagina>
  );
}
