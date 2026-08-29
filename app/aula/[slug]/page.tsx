import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina, Icone } from '../../componentes.tsx';
import Exercicio from '../../Exercicio.tsx';
import AbasAula from '../../AbasAula.tsx';
import {
  buscarAula, materiaisDaAula, listarAulasDaMateria, formatarDuracao,
} from '../../../lib/catalogo.ts';
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
  // o resumo é público mesmo com a aula bloqueada — é o motor de SEO (§5.3)
  return { title: aula.titulo, description: aula.resumo.split('\n')[0].slice(0, 160) };
}

export default async function PaginaAula({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const aula = await buscarAula(slug);
  if (!aula || aula.status !== 'publicado') notFound();

  const [espectador, aluno, leis, materiais, doAssunto] = await Promise.all([
    espectadorAtual(), alunoAtual(), dispositivosDaAula(aula.id),
    materiaisDaAula(aula.id), listarAulasDaMateria(aula.materiaId),
  ]);

  // §6.3 — toda decisão de acesso passa por aqui
  const decisao = podeAcessar(espectador, {
    id: aula.id, materiaId: aula.materiaId,
    amostraGratuita: aula.amostraGratuita, noTrial: aula.noTrial,
  });

  const questoes = decisao.libera ? await exercicioDaAula(aula.id) : [];
  const doModulo = doAssunto.filter((a) => a.assuntoSlug === aula.assuntoSlug && a.status === 'publicado');
  const publicadas = doAssunto.filter((a) => a.status === 'publicado');
  const i = publicadas.findIndex((a) => a.id === aula.id);
  const proxima = publicadas[i + 1] ?? null;
  const anterior = publicadas[i - 1] ?? null;

  return (
    <Pagina ativo="catalogo">
      <div className="container aula-grade">
        <div>
          <div className="trilha-topo" style={{ marginBottom: 16 }}>
            <Link href="/catalogo">Catálogo</Link>
            <Icone nome="chevron_right" tamanho={16} />
            <Link href={`/materia/${aula.materiaSlug}`}>{aula.materiaNome}</Link>
            <Icone nome="chevron_right" tamanho={16} />
            <span className="suave">{aula.assuntoNome}</span>
          </div>

          {decisao.libera ? (
            <div className="player">
              {/* §10: marca d'água dinâmica com dados do aluno */}
              <span className="marca-agua">{aluno ? `${aluno.nome} · ***.456.789-**` : 'visitante'}</span>
              <span className="botao-play"><Icone nome="play_arrow" tamanho={40} /></span>
              <span className="legenda">Vídeo da aula · {formatarDuracao(aula.duracaoSegundos)} com legendas</span>
            </div>
          ) : (
            <div className="player bloqueado">
              <div className="cadeado">
                <Icone nome="lock" />
                <p>{ofertaPara(decisao.motivo)}</p>
              </div>
            </div>
          )}

          <h1 className="aula-titulo">{aula.titulo}</h1>
          <p className="aula-meta">
            {aula.professor} • Atualizado em{' '}
            {new Date(aula.atualizadaEm).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            {decisao.libera && decisao.motivo === 'TRIAL' && (
              <span className="chip chip-terciaria" style={{ marginLeft: 10 }}>Liberada pelo seu teste</span>
            )}
            {decisao.libera && decisao.motivo === 'AMOSTRA_GRATUITA' && (
              <span className="chip chip-secundaria" style={{ marginLeft: 10 }}>Aula aberta</span>
            )}
          </p>

          {!decisao.libera && (
            <p className="aviso" style={{ marginTop: 20 }}>
              {ofertaPara(decisao.motivo)}{' '}
              <Link href="/planos" style={{ fontWeight: 700, textDecoration: 'underline' }}>Ver planos</Link>
            </p>
          )}

          <AbasAula
            abas={[
              {
                id: 'resumo', rotulo: 'Resumo',
                conteudo: (
                  <>
                    {aula.resumo.split('\n\n').map((paragrafo, k) => (
                      <p key={k}>{paragrafo}</p>
                    ))}
                    {leis[0] && (
                      <div className="sabia" style={{ marginTop: 24 }}>
                        <div className="titulo"><Icone nome="lightbulb" tamanho={20} /> Você sabia?</div>
                        Esta aula está ancorada em <strong>{leis[0].rotulo} da {leis[0].normaSigla}</strong>.
                        O texto da lei fica ao lado, no painel — você não precisa sair daqui para conferir.
                      </div>
                    )}
                  </>
                ),
              },
              {
                id: 'materiais', rotulo: `Materiais (${materiais.length})`,
                conteudo: decisao.libera ? (
                  <>
                    {materiais.length === 0 && <p className="vazio">Esta aula ainda não tem material de apoio.</p>}
                    {materiais.map((m) => (
                      <div className="linha-aula" key={m.id}>
                        <span className="estado"><Icone nome="picture_as_pdf" /></span>
                        <span className="texto">
                          <strong>{m.titulo}</strong>
                          <span>PDF · {Math.round(m.bytes / 1024)} KB</span>
                        </span>
                        <span className="btn btn-contorno btn-sm">Baixar</span>
                      </div>
                    ))}
                    <p className="caption suave" style={{ marginTop: 12 }}>
                      Os PDFs saem carimbados com seu nome e e-mail.
                    </p>
                  </>
                ) : (
                  <p className="vazio">O material de apoio abre com a licença da matéria.</p>
                ),
              },
              {
                id: 'artigos', rotulo: `Artigos Citados (${leis.length})`,
                conteudo: (
                  <>
                    <p>Dispositivos vinculados a esta aula:</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0 16px' }}>
                      {leis.map((d) => (
                        <Link className="chip chip-terciaria" href={`/vademecum?q=${encodeURIComponent(d.rotulo)}`} key={d.id}>
                          <Icone nome="menu_book" tamanho={16} /> {d.rotulo}, {d.normaSigla}
                        </Link>
                      ))}
                    </div>
                    <p className="caption suave">
                      O caminho vale nos dois sentidos: no vade-mécum, cada artigo lista as aulas que o explicam.
                    </p>
                  </>
                ),
              },
            ]}
          />

          {decisao.libera ? (
            <>
              <div className="convite-exercicio">
                <div>
                  <h3>Pronto para testar seus conhecimentos?</h3>
                  <p>Fixe o conteúdo desta aula com {questoes.length} questões práticas.</p>
                </div>
                <a className="btn btn-primario" href="#exercicio">
                  <Icone nome="edit_note" tamanho={20} /> Fazer o exercício
                </a>
              </div>
              <Exercicio questoes={questoes} professor={aula.professor} />
            </>
          ) : (
            <div className="convite-exercicio">
              <div>
                <h3>Exercício com {aula.questoes} questões comentadas</h3>
                <p>Abre junto com a aula, e toda alternativa vem explicada.</p>
              </div>
              <Link className="btn btn-primario" href="/planos">Ver planos</Link>
            </div>
          )}

          <div className="nav-aula" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            {anterior
              ? <Link className="btn btn-contorno btn-sm" href={`/aula/${anterior.slug}`}><Icone nome="arrow_back" tamanho={18} /> {anterior.titulo}</Link>
              : <span />}
            {proxima && (
              <Link className="btn btn-primario btn-sm" href={`/aula/${proxima.slug}`}>{proxima.titulo} <Icone nome="arrow_forward" tamanho={18} /></Link>
            )}
          </div>
        </div>

        {/* ---------- Lateral: módulo + vade-mécum ---------- */}
        <aside className="modulo-lateral pilha-lg">
          <div>
            <h2>{aula.assuntoNome}</h2>
            <p className="suave">{aula.materiaNome}</p>
            <div style={{ marginTop: 16 }}>
              {doModulo.map((a) => {
                const dela = podeAcessar(espectador, {
                  id: a.id, materiaId: aula.materiaId,
                  amostraGratuita: a.amostraGratuita, noTrial: a.noTrial,
                });
                const atual = a.id === aula.id;
                const icone = atual ? 'play_circle' : dela.libera ? 'check_circle' : 'lock';
                const classe = atual ? 'atual' : dela.libera ? '' : 'trancada';
                return (
                  <Link className={`item-modulo ${classe}`} href={`/aula/${a.slug}`} key={a.id}>
                    <Icone nome={icone} />
                    <span>
                      <span className="titulo">{a.titulo}</span>
                      <span className="duracao">
                        {formatarDuracao(a.duracaoSegundos)}{atual && ' • Assistindo'}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="painel-lei">
            <header>
              <strong><Icone nome="gavel" tamanho={18} /> Vade-mécum</strong>
              <span className="caption">nesta aula</span>
            </header>
            <div className="corpo">
              {leis.length === 0 && <p className="caption suave">Esta aula não cita dispositivos.</p>}
              {leis.map((d) => (
                <div className="artigo" key={d.id}>
                  <div className="ref">
                    <span>{d.normaSigla} · {d.rotulo}</span>
                    <Link href={`/vademecum?q=${encodeURIComponent(d.rotulo)}`}>abrir ↗</Link>
                  </div>
                  <div className="texto-lei">{d.texto}</div>
                </div>
              ))}
            </div>
            <div className="carimbo">✔ Texto conferido em 28/08/2026 · fonte: LexML / Planalto</div>
          </div>
        </aside>
      </div>
    </Pagina>
  );
}
