import Link from 'next/link';
import { PORTAL_PLATAFORMA } from '../../../lib/portal.ts';

/**
 * De qual acervo se está falando (§5.10).
 *
 * O sistema deixou de ter um catálogo e passou a ter N: o da casa (portal
 * 0) e o de cada professor. Sem um seletor explícito, quem opera não tem
 * como saber em qual acervo está mexendo — e "publiquei e não apareceu no
 * site" vira o chamado mais comum da retaguarda.
 */
export default function SeletorPortal({
  portais, atual, base,
}: {
  portais: { id: number; nome: string; mascara: string }[];
  atual: number;
  /** Rota de destino, sem a query. */
  base: string;
}) {
  if (portais.length <= 1) return null;

  return (
    <div className="filtros">
      {portais.map((p) => (
        <Link key={p.id}
          className={`chip chip-sm ${p.id === atual ? 'chip-primaria' : 'chip-contorno'}`}
          href={`${base}?portal=${p.id}`}>
          {p.id === PORTAL_PLATAFORMA ? 'Plataforma' : p.nome}
        </Link>
      ))}
    </div>
  );
}
