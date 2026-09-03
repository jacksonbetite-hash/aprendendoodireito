import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ConteudoAula from '../../../../aula/[slug]/ConteudoAula.tsx';
import { buscarAula, buscarMateria } from '../../../../../lib/catalogo.ts';
import { portalIdAtual, buscarPortalPorMascara } from '../../../../../lib/portal-consultas.ts';
import { espectadorAtual } from '../../../../../lib/sessao.ts';
import { licencaVigente } from '../../../../../lib/licenca.ts';

export const dynamic = 'force-dynamic';

/** Aula de curso parceiro na nossa vitrine — mesma regra da página do curso. */
async function resolver(mascara: string, slug: string) {
  if ((await portalIdAtual()) !== 0) return null;
  const portal = await buscarPortalPorMascara(mascara);
  if (!portal) return null;
  const aula = await buscarAula(portal.id, slug);
  if (!aula) return null;
  const materia = await buscarMateria(portal.id, aula.materiaSlug);
  if (!materia) return null;

  const licenciado = (await espectadorAtual()).licencas.some((l) =>
    l.escopo === 'MATERIA' && l.materiaId === materia.id && licencaVigente(l, new Date()));
  const naVitrine = materia.naVitrinePlataforma && materia.status === 'publicado';
  if (!naVitrine && !licenciado) return null;
  return { portal, aula };
}

export async function generateMetadata(
  { params }: { params: Promise<{ mascara: string; slug: string }> },
): Promise<Metadata> {
  const { mascara, slug } = await params;
  const r = await resolver(mascara, slug);
  if (!r) return { title: 'Aula não encontrada' };
  return { title: r.aula.titulo, description: r.aula.resumo.split('\n')[0].slice(0, 160) };
}

export default async function AulaParceiro(
  { params }: { params: Promise<{ mascara: string; slug: string }> },
) {
  const { mascara, slug } = await params;
  const r = await resolver(mascara, slug);
  if (!r) notFound();
  const base = `/parceiros/${r.portal.mascara}`;
  return (
    <ConteudoAula slug={slug} portalDoCurso={r.portal.id} base={base}
                  oferta={`${base}/materia/${r.aula.materiaSlug}`} />
  );
}
