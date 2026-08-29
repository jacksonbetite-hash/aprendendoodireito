import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina, Icone } from '../../componentes.tsx';
import {
  buscarMateria, listarAulasDaMateria, formatarDuracao,
} from '../../../lib/catalogo.ts';
import { espectadorAtual } from '../../../lib/sessao.ts';
import { podeAcessar } from '../../../lib/licenca.ts';
import { brl, porMes } from '../../../lib/precos.ts';
import { tabelaVigente } from '../../../lib/precos-consultas.ts';

export const dynamic = 'force-dynamic';   // o cadeado depende de quem olha

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const m = await buscarMateria(slug);
  return m ? { title: m.nome, description: m.ementa } : { title: 'Matéria não encontrada' };
}

export default async function PaginaMateria({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const materia = await buscarMateria(slug);
  if (!materia) notFound();

  const [aulas, espectador, tabela] = await Promise.all([
    listarAulasDaMateria(materia.id), espectadorAtual(), tabelaVigente(),
  ]);
  const publicadas = aulas.filter((a) => a.status === 'publicado');
  const emProducao = aulas.filter((a) => a.status !== 'publicado');
  const assuntos = [...new Set(publicadas.map((a) => a.assuntoSlug))];

  return (
    <Pagina ativo="catalogo">
      <section className="cabeca-materia">
        <div className="container">
          <div className="trilha-topo">
            <Link href="/">Início</Link><Icone nome="chevron_right" tamanho={16} />
            <Link href="/catalogo">Catálogo</Link><Icone nome="chevron_right" tamanho={16} />
            <span>{materia.areaNome}</span>
          </div>
          <span className="chip chip-secundaria" style={{ marginTop: 12 }}>{materia.onda}ª onda · publicada</span>
          <h1>{materia.nome}</h1>
          <p className="sub">{materia.ementa}</p>
          {materia.professor && (
            <div className="professor">
              <span className="avatar">
                {materia.professor.replace(/^Prof\.?ª?\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <strong>{materia.professor}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="secao" style={{ paddingTop: 40 }}>
        <div className="container materia-grade">
          <div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28, fontSize: 14 }} className="suave">
              <span><Icone nome="library_books" tamanho={18} /> {assuntos.length} assuntos</span>
              <span><Icone nome="play_circle" tamanho={18} /> {materia.aulasPublicadas} aulas</span>
              <span><Icone nome="edit_note" tamanho={18} /> {materia.questoes} questões</span>
              <span><Icone nome="schedule" tamanho={18} /> {formatarDuracao(materia.duracaoTotal)} de vídeo</span>
            </div>

            {assuntos.map((assuntoSlug, i) => {
              const doAssunto = publicadas.filter((a) => a.assuntoSlug === assuntoSlug);
              return (
                <div className="assunto-bloco" key={assuntoSlug}>
                  <h3>
                    {i + 1}. {doAssunto[0].assuntoNome}
                    {doAssunto.some((a) => a.amostraGratuita) && (
                      <span className="chip chip-secundaria">1ª aula grátis</span>
                    )}
                  </h3>
                  {doAssunto.map((aula) => {
                    const d = podeAcessar(espectador, {
                      id: aula.id, materiaId: materia.id,
                      amostraGratuita: aula.amostraGratuita, noTrial: aula.noTrial,
                    });
                    const etiqueta = aula.amostraGratuita
                      ? { c: 'chip-secundaria', t: 'Grátis' }
                      : d.libera
                        ? { c: 'chip-terciaria', t: d.motivo === 'TRIAL' ? 'Teste' : 'Liberada' }
                        : { c: 'chip-neutra', t: 'Licença' };
                    return (
                      <Link
                        className={`linha-aula ${d.libera ? (aula.amostraGratuita ? 'concluida' : '') : 'bloqueada'}`}
                        href={`/aula/${aula.slug}`} key={aula.id}
                      >
                        <span className="estado">
                          <Icone nome={d.libera ? 'play_arrow' : 'lock'} />
                        </span>
                        <span className="texto">
                          <strong>{aula.titulo}</strong>
                          <span>{formatarDuracao(aula.duracaoSegundos)} · {aula.questoes} questões</span>
                        </span>
                        <span className={`chip ${etiqueta.c}`}>{etiqueta.t}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            {emProducao.length > 0 && (
              <div className="aviso">
                <strong>Mais {emProducao.length} {emProducao.length === 1 ? 'aula gravada aguarda' : 'aulas gravadas aguardam'} o exercício</strong>{' '}
                para ir ao ar. Aula sem exercício não é publicada — é regra, não exceção.
              </div>
            )}
          </div>

          <aside className="cartao caixa-compra">
            <span className="label-md suave">LICENÇA DESTA MATÉRIA</span>
            <div className="preco" style={{ marginTop: 8 }}>
              {brl(tabela.MATERIA.mensal)}<small>/mês</small>
            </div>
            <p className="caption suave">
              ou {brl(tabela.MATERIA.anual)} no plano anual ({brl(porMes(tabela.MATERIA.anual, 'anual'))}/mês)
            </p>
            <div className="pilha-sm" style={{ marginTop: 20 }}>
              <Link className="btn btn-primario" href="/planos">Assinar esta matéria</Link>
              <Link className="btn btn-contorno" href="/cadastrar">Testar 7 dias grátis</Link>
            </div>
            <ul className="lista-inclui">
              {[
                `${materia.aulasPublicadas} aulas em vídeo com legendas`,
                `${materia.questoes} questões comentadas`,
                'Vade-mécum dentro da aula',
                'Material de apoio em PDF',
                'Anotações e caderno de erros',
              ].map((t) => (
                <li key={t}><Icone nome="check_circle" /> {t}</li>
              ))}
            </ul>
            <p className="caption suave" style={{ borderTop: '1px dashed var(--surface-variant)', paddingTop: 14 }}>
              Arrependeu? Devolvemos 100% em até 7 dias, sem justificativa (CDC, art. 49).
            </p>
          </aside>
        </div>
      </section>
    </Pagina>
  );
}
