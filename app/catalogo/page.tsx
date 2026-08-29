import Link from 'next/link';
import type { Metadata } from 'next';
import { Pagina } from '../componentes.tsx';
import { listarAreasEmCache, listarMateriasEmCache } from '../../lib/catalogo.ts';

export const metadata: Metadata = {
  title: 'Matérias',
  description: 'As 7 áreas do Direito e as 11 matérias do catálogo, com lançamento em ondas.',
};
export const dynamic = 'force-dynamic';

const ROTULO_ONDA = (onda: number | null) =>
  onda === null ? 'Em breve' : onda === 1 ? '1ª onda' : `${onda}ª onda`;

export default async function Catalogo() {
  const [areas, materias] = await Promise.all([listarAreasEmCache(), listarMateriasEmCache()]);

  return (
    <Pagina>
      <section className="materia-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Início</Link> › Matérias</div>
          <h1>O catálogo, matéria por matéria</h1>
          <p className="sub">
            São 7 áreas do Direito e um catálogo de partida de 11 matérias. Você escolhe
            livremente o que quer estudar — a licença é vendida por matéria, e as aulas e
            exercícios vêm junto. As demais entram em ondas.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="notice" style={{ marginBottom: '2.2rem' }}>
            🌊 <strong>Lançamento em ondas.</strong> As matérias marcadas como <em>1ª onda</em> já
            estão publicadas. As de ondas seguintes abrem a cada duas a quatro semanas — entre na
            lista de espera para votar na próxima.
          </div>

          {areas.map((area) => {
            const daArea = materias.filter((m) => m.areaSlug === area.slug);
            const publicadas = daArea.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);

            return (
              <div className="area-block" key={area.id}>
                <header>
                  <h3>{area.nome}</h3>
                  <span className="count">
                    {daArea.length === 0
                      ? 'Área ainda sem matéria no catálogo de partida'
                      : `${daArea.length} ${daArea.length === 1 ? 'matéria' : 'matérias'} · ${publicadas.length} publicada${publicadas.length === 1 ? '' : 's'}`}
                  </span>
                </header>

                <div className="materia-grid">
                  {daArea.map((m) => {
                    const noAr = m.status === 'publicado' && m.aulasPublicadas > 0;
                    if (!noAr) {
                      return (
                        <div className="materia-card soon" key={m.id}>
                          <span className="pill soon">{ROTULO_ONDA(m.onda)}</span>
                          <h4>{m.nome}</h4>
                          <p className="ementa">{m.ementa}</p>
                          <div className="foot">
                            <span>Em produção</span>
                            <span className="pill">Avise-me</span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link className="materia-card" href={`/materia/${m.slug}`} key={m.id}>
                        <span className="pill wave">{ROTULO_ONDA(m.onda)}</span>
                        <h4>{m.nome}</h4>
                        <p className="ementa">{m.ementa}</p>
                        <div className="foot">
                          <span>{m.aulasPublicadas} aulas · {m.questoes} questões</span>
                          <span>R$ 24,90/mês</span>
                        </div>
                      </Link>
                    );
                  })}

                  {daArea.length === 0 && (
                    <div className="materia-card soon">
                      <span className="pill soon">Em breve</span>
                      <h4>Área do mapa definitivo</h4>
                      <p className="ementa">
                        {area.nome} faz parte do mapa para onde o catálogo cresce, mas ainda não tem
                        matéria no catálogo de partida.
                      </p>
                      <div className="foot">
                        <span>Lista de espera aberta</span>
                        <span className="pill">Entrar na lista</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="callout" style={{ marginTop: '1rem' }}>
            <div>
              <h2>Vai estudar mais de uma matéria?</h2>
              <p>O passe completo libera todas as matérias publicadas — inclusive as lançadas durante a sua vigência.</p>
            </div>
            <Link className="btn btn-coral btn-lg" href="/planos">Ver planos</Link>
          </div>
        </div>
      </section>
    </Pagina>
  );
}
