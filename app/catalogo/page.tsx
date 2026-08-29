import Link from 'next/link';
import type { Metadata } from 'next';
import { Pagina, Icone } from '../componentes.tsx';
import { listarAreasEmCache, listarMateriasEmCache, formatarDuracao } from '../../lib/catalogo.ts';
import { brl } from '../../lib/precos.ts';
import { tabelaVigente } from '../../lib/precos-consultas.ts';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'As 7 áreas do Direito e as 11 matérias do catálogo, com lançamento em ondas.',
};
export const dynamic = 'force-dynamic';

const ONDA = (o: number | null) => (o === null ? 'Em breve' : `${o}ª onda`);

export default async function Catalogo() {
  const [areas, materias, tabela] = await Promise.all([
    listarAreasEmCache(), listarMateriasEmCache(), tabelaVigente(),
  ]);

  return (
    <Pagina ativo="catalogo">
      <section className="cabeca-materia">
        <div className="container">
          <div className="trilha-topo">
            <Link href="/">Início</Link><Icone nome="chevron_right" tamanho={16} /><span>Catálogo</span>
          </div>
          <h1>O catálogo, matéria por matéria</h1>
          <p className="sub">
            São 7 áreas do Direito e um catálogo de partida de 11 matérias. Você escolhe livremente
            o que quer estudar — a licença é por matéria, e as aulas e exercícios vêm junto.
          </p>
        </div>
      </section>

      <section className="secao">
        <div className="container pilha-lg">
          <div className="sabia">
            <div className="titulo"><Icone nome="waves" tamanho={20} /> Lançamento em ondas</div>
            As matérias da <strong>1ª onda</strong> já estão publicadas. As seguintes abrem a cada
            duas a quatro semanas — entre na lista de espera para votar na próxima.
          </div>

          {areas.map((area) => {
            const daArea = materias.filter((m) => m.areaSlug === area.slug);
            const noAr = daArea.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
            return (
              <div key={area.id}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
                  <h2 className="headline-md">{area.nome}</h2>
                  <span className="caption suave">
                    {daArea.length
                      ? `${daArea.length} ${daArea.length === 1 ? 'matéria' : 'matérias'} · ${noAr.length} publicada${noAr.length === 1 ? '' : 's'}`
                      : 'Área ainda sem matéria no catálogo de partida'}
                  </span>
                </div>

                <div className="grade-3">
                  {daArea.map((m) => {
                    const publicada = m.status === 'publicado' && m.aulasPublicadas > 0;
                    const conteudo = (
                      <>
                        <span className={`chip ${publicada ? 'chip-secundaria' : 'chip-terciaria'}`}>{ONDA(m.onda)}</span>
                        <h3>{m.nome}</h3>
                        <p>{m.ementa}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 12, borderTop: '1px dashed var(--surface-variant)', fontSize: 13 }}>
                          {publicada ? (
                            <>
                              <span className="suave">{m.aulasPublicadas} aulas · {formatarDuracao(m.duracaoTotal)}</span>
                              <strong style={{ color: 'var(--primary)' }}>{brl(tabela.MATERIA.mensal)}/mês</strong>
                            </>
                          ) : (
                            <>
                              <span className="suave">Em produção</span>
                              <span className="chip chip-neutra">Avise-me</span>
                            </>
                          )}
                        </div>
                      </>
                    );
                    return publicada ? (
                      <Link className="cartao cartao-area" href={`/materia/${m.slug}`} key={m.id}>{conteudo}</Link>
                    ) : (
                      <div className="cartao cartao-area" style={{ opacity: .72, borderStyle: 'dashed' }} key={m.id}>{conteudo}</div>
                    );
                  })}

                  {daArea.length === 0 && (
                    <div className="cartao cartao-area" style={{ opacity: .72, borderStyle: 'dashed' }}>
                      <span className="chip chip-terciaria">Em breve</span>
                      <h3>Área do mapa definitivo</h3>
                      <p>{area.nome} faz parte do mapa para onde o catálogo cresce, mas ainda não tem matéria no catálogo de partida.</p>
                      <span className="chip chip-neutra">Entrar na lista</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="chamada">
            <h2>Vai estudar mais de uma matéria?</h2>
            <p>O passe completo libera todas as matérias publicadas — inclusive as lançadas durante a sua vigência.</p>
            <Link className="btn btn-primario" href="/planos">Ver planos</Link>
          </div>
        </div>
      </section>
    </Pagina>
  );
}
