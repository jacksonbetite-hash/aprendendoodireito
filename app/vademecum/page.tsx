import Link from 'next/link';
import type { Metadata } from 'next';
import { Pagina } from '../componentes.tsx';
import BuscaVade from './BuscaVade.tsx';
import {
  listarNormas, buscarNorma, dispositivosDaNorma, buscarDispositivos, aulasQueExplicam,
} from '../../lib/vademecum.ts';

export const metadata: Metadata = {
  title: 'Vade-mécum aberto',
  description: 'Consulta livre à legislação, com busca por artigo e link para as aulas que explicam cada dispositivo.',
};
export const dynamic = 'force-dynamic';

export default async function VadeMecum(
  { searchParams }: { searchParams: Promise<{ q?: string; norma?: string }> },
) {
  const { q = '', norma } = await searchParams;
  const normas = await listarNormas();
  const termo = q.trim();

  const atual = await buscarNorma(norma ?? normas[0]?.slug ?? 'cf-88');
  const dispositivos = termo
    ? await buscarDispositivos(termo)
    : atual ? await dispositivosDaNorma(atual.id) : [];

  // deep link bidirecional (§5.4): cada artigo mostra as aulas que o explicam
  const aulasPorDispositivo = new Map(
    await Promise.all(
      dispositivos.map(async (d) => [d.id, await aulasQueExplicam(d.id)] as const),
    ),
  );

  return (
    <Pagina>
      <section className="materia-hero" style={{ paddingBottom: '1.8rem' }}>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Início</Link> › Vade-mécum</div>
          <h1>Vade-mécum aberto</h1>
          <p className="sub">
            Consulta livre, sem cadastro. Busque pelo número do artigo (<code>art. 5º</code>)
            ou por qualquer trecho — inclusive pelo apelido que você aprendeu na aula,
            como “cláusula pétrea”.
          </p>
        </div>
      </section>

      <div className="container vade-layout">
        <nav className="vade-nav">
          <h3>Acervo</h3>
          {normas.map((n) => (
            <Link
              key={n.id}
              href={`/vademecum?norma=${n.slug}`}
              className={!termo && atual?.slug === n.slug ? 'active' : ''}
            >
              {n.sigla} <span style={{ opacity: .6, fontWeight: 400 }}>· {n.dispositivos}</span>
            </Link>
          ))}
        </nav>

        <div>
          <BuscaVade termoInicial={termo} />

          <div className="lei-doc">
            {termo ? (
              <>
                <h2 className="lei-titulo">
                  {dispositivos.length} {dispositivos.length === 1 ? 'resultado' : 'resultados'} para “{termo}”
                </h2>
                <p className="lei-sub">
                  Busca full-text em português, com stemming — “poder” encontra “Poderes”.
                </p>
              </>
            ) : atual && (
              <>
                <h2 className="lei-titulo">{atual.nome}</h2>
                <p className="lei-sub">
                  <span style={{ color: 'var(--success-700)', fontWeight: 700 }}>
                    ✔ texto conferido em {new Date(atual.conferidoEm).toLocaleDateString('pt-BR')}
                  </span>{' '}
                  · fonte: {atual.fonte}
                </p>
              </>
            )}

            {dispositivos.map((d) => {
              const aulas = aulasPorDispositivo.get(d.id) ?? [];
              return (
                <div className="dispositivo" key={d.id}>
                  <div className="d-head">
                    <strong>{termo ? `${d.normaSigla} · ${d.rotulo}` : d.rotulo}</strong>
                    <div className="d-acts">
                      <span className="icon-btn" title="Favoritar">☆</span>
                      <span className="icon-btn" title="Anotar">✎</span>
                    </div>
                  </div>
                  {d.agrupador && !termo && (
                    <p style={{ fontSize: '.78rem', color: 'var(--ink-soft)', marginBottom: '.3rem' }}>{d.agrupador}</p>
                  )}
                  <div className="texto-lei">{d.texto}</div>
                  {aulas.length > 0 && (
                    <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.6rem' }}>
                      ↗ Explicado em:{' '}
                      {aulas.map((a, i) => (
                        <span key={a.slug}>
                          {i > 0 && ', '}
                          <Link href={`/aula/${a.slug}`} style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
                            {a.titulo}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              );
            })}

            {dispositivos.length === 0 && (
              <p className="empty-state">
                Nenhum dispositivo encontrado{termo && ` para “${termo}”`}. O acervo do protótipo
                cobre uma amostra da CF/88, do CDC, do CC e do CP — a ingestão completa via LexML
                entra junto com a rotina de atualização.
              </p>
            )}
          </div>

          <div className="notice" style={{ marginTop: '1.4rem' }}>
            ⚖️ Textos de lei não são protegidos por direito autoral (Lei 9.610/98, art. 8º, IV).
            A obrigação aqui é de <strong>exatidão e atualização</strong> — por isso cada norma
            carrega a data em que foi conferida.
          </div>
        </div>
      </div>
    </Pagina>
  );
}
