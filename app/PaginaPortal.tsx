import Link from 'next/link';
import { Pagina, Icone, portalSuspenso, PortalSuspenso } from './componentes.tsx';
import { listarAreasEmCache, listarMateriasEmCache, listarAulasDaMateria, formatarDuracao } from '../lib/catalogo.ts';
import { portalAtual } from '../lib/portal-consultas.ts';
import { alunoAtual, espectadorAtual } from '../lib/sessao.ts';
import { podeAcessar } from '../lib/licenca.ts';
import { tabelaVigente } from '../lib/precos-consultas.ts';
import { brl, porMes } from '../lib/precos.ts';

/**
 * A página única do portal do professor — §5.10, "Anatomia": abertura,
 * acervo por área e assunto, oferta, prova e contato. O rodapé legal
 * (identificação do responsável) mora no Rodape, que já sabe em que
 * portal está.
 *
 * Estrutura fixa, de propósito: o professor preenche campos (texto, foto,
 * cor), não escreve HTML. É o que mantém o provisionamento automático e
 * o suporte viáveis (§5.10).
 */
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default async function PaginaPortal() {
  const portal = await portalAtual();
  const aluno = await alunoAtual();
  if (await portalSuspenso() && !aluno) return <PortalSuspenso />;

  const p = portal.personalizacao;
  const [areas, materias, tabela, espectador] = await Promise.all([
    listarAreasEmCache(portal.id), listarMateriasEmCache(portal.id),
    tabelaVigente(portal.id), espectadorAtual(),
  ]);
  const publicadas = materias.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
  const aulasPorMateria = new Map(
    await Promise.all(publicadas.map(async (m) =>
      [m.id, (await listarAulasDaMateria(portal.id, m.id)).filter((a) => a.status === 'publicado')] as const)),
  );
  const totalAulas = publicadas.reduce((t, m) => t + m.aulasPublicadas, 0);
  const totalHoras = Math.round(publicadas.reduce((t, m) => t + m.duracaoTotal, 0) / 3600);
  const areasComCurso = areas.filter((a) => publicadas.some((m) => m.areaSlug === a.slug));

  return (
    <Pagina ativo="inicio">
      {/* ---- 1. Abertura ---- */}
      <section className="cabeca-materia" style={{ paddingTop: 56, paddingBottom: 48 }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: p.foto ? '1fr auto' : '1fr', gap: 32, alignItems: 'center' }}>
          <div>
            <span className="chip chip-sm chip-secundaria">{portal.nomeExibicao}</span>
            <h1 style={{ marginTop: 14 }}>{p.chamada || `Aulas de ${portal.nomeExibicao}`}</h1>
            <p className="sub" style={{ fontSize: 18 }}>
              {p.proposito || 'Aulas em vídeo, com a lei ao lado e exercício ao final de cada uma.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
              <a className="btn btn-primario btn-lg" href="#acervo">Ver as aulas</a>
              {!aluno && <Link className="btn btn-contorno btn-lg" href="/cadastrar">Criar conta</Link>}
            </div>
            {publicadas.length > 0 && (
              <p className="caption suave" style={{ marginTop: 18 }}>
                {plural(publicadas.length, 'curso', 'cursos')} · {plural(totalAulas, 'aula', 'aulas')}
                {totalHoras > 0 && ` · ${plural(totalHoras, 'hora', 'horas')} de vídeo`}
              </p>
            )}
          </div>
          {p.foto && (
            <img src={p.foto} alt={`Foto de ${portal.nomeExibicao}`} width={220} height={220}
                 style={{ borderRadius: 24, objectFit: 'cover', boxShadow: 'var(--e-marca)' }} />
          )}
        </div>
      </section>

      {/* ---- 2. Acervo por área e assunto ---- */}
      <section className="secao" id="acervo">
        <div className="container">
          <div className="secao-titulo">
            <h2>As <em>aulas</em></h2>
            <p>Organizadas por área e assunto. A primeira aula de cada assunto com amostra é aberta.</p>
          </div>

          {publicadas.length === 0 && (
            <div className="vazio">As primeiras aulas estão em produção. Volte em breve.</div>
          )}

          {areasComCurso.map((area) => (
            <div key={area.id} style={{ marginBottom: 36 }}>
              <h3 className="headline-md" style={{ marginBottom: 14 }}>{area.nome}</h3>
              <div className="grade-2">
                {publicadas.filter((m) => m.areaSlug === area.slug).map((m) => {
                  const aulas = aulasPorMateria.get(m.id) ?? [];
                  const assuntos = [...new Set(aulas.map((a) => a.assuntoNome))];
                  return (
                    <div className="cartao" key={m.id}>
                      <h3><Link href={`/materia/${m.slug}`}>{m.nome}</Link></h3>
                      <p className="ementa suave" style={{ margin: '6px 0 12px' }}>{m.ementa}</p>
                      <p className="caption suave" style={{ marginBottom: 10 }}>
                        {plural(assuntos.length, 'assunto', 'assuntos')} · {plural(aulas.length, 'aula', 'aulas')} · {formatarDuracao(m.duracaoTotal)}
                      </p>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {aulas.slice(0, 4).map((a) => {
                          const d = podeAcessar(espectador, {
                            id: a.id, materiaId: m.id, amostraGratuita: a.amostraGratuita, noTrial: a.noTrial,
                          });
                          return (
                            <Link className={`linha-aula ${d.libera ? '' : 'bloqueada'}`} href={`/aula/${a.slug}`} key={a.id}>
                              <span className="estado"><Icone nome={d.libera ? 'play_arrow' : 'lock'} /></span>
                              <span className="texto">
                                <strong>{a.titulo}</strong>
                                <span>{a.assuntoNome} · {formatarDuracao(a.duracaoSegundos)}</span>
                              </span>
                            </Link>
                          );
                        })}
                        {aulas.length > 4 && (
                          <Link className="caption" href={`/materia/${m.slug}`} style={{ fontWeight: 700 }}>
                            + {aulas.length - 4} aulas — ver o curso completo →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- 3. Oferta ---- */}
      <section className="secao tinta" id="oferta">
        <div className="container">
          <div className="secao-titulo">
            <h2>Como <em>assinar</em></h2>
            <p>Licença por curso ou passe completo. Pix ou cartão, 7 dias para desistir, cancelamento em 2 cliques.</p>
          </div>
          <div className="grade-3">
            <div className="cartao">
              <h3>Um curso</h3>
              <div className="preco" style={{ marginTop: 8 }}>{brl(tabela.MATERIA.mensal)}<small>/mês</small></div>
              <p className="caption suave">ou {brl(tabela.MATERIA.anual)} por ano ({brl(porMes(tabela.MATERIA.anual, 'anual'))}/mês)</p>
            </div>
            <div className="cartao" style={{ border: '2px solid var(--primary)' }}>
              <h3>Passe completo</h3>
              <div className="preco" style={{ marginTop: 8 }}>{brl(tabela.CATALOGO.mensal)}<small>/mês</small></div>
              <p className="caption suave">todos os cursos deste portal, inclusive os que forem lançados</p>
            </div>
            <div className="cartao">
              <h3>Teste grátis</h3>
              <div className="preco" style={{ marginTop: 8 }}>R$ 0</div>
              <p className="caption suave">7 dias, um curso à escolha, sem cartão</p>
            </div>
          </div>
          <div className="centro" style={{ marginTop: 24 }}>
            <Link className="btn btn-primario btn-lg" href="/planos">Ver planos e assinar</Link>
          </div>
        </div>
      </section>

      {/* ---- 4. Prova e contato ---- */}
      {(p.sobre || p.contato) && (
        <section className="secao" id="sobre">
          <div className="container grade-2">
            {p.sobre && (
              <div className="cartao">
                <h2 className="headline-md">Quem ensina</h2>
                {p.sobre.split('\n\n').map((par, i) => <p key={i} style={{ marginTop: 10 }}>{par}</p>)}
              </div>
            )}
            {p.contato && (
              <div className="cartao">
                <h2 className="headline-md">Contato</h2>
                <p style={{ marginTop: 10 }}>{p.contato}</p>
                <p className="caption suave" style={{ marginTop: 10 }}>
                  Dúvida sobre pagamento, acesso ou reembolso? A plataforma responde pelo
                  suporte; conteúdo e didática são com o professor.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </Pagina>
  );
}
