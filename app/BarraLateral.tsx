'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icone } from './ui.tsx';
import { itemAtivo } from '../lib/navegacao.ts';

/**
 * A barra lateral do painel — uma só, para admin, aluno e conta.
 *
 * Antes existiam três cópias escritas à mão, cada uma acendendo um item
 * fixo no código. Três defeitos vinham daí:
 *
 * 1. o realce nunca saía de "Dashboard" (o item aceso era literal);
 * 2. sair do admin para o painel do aluno trocava o menu inteiro, sem
 *    caminho de volta visível;
 * 3. "Catálogo", "Biblioteca" e "Planos" levavam a páginas do site
 *    público, onde a barra lateral simplesmente desaparecia.
 *
 * O item aceso passa a vir da rota (`lib/navegacao.ts`). O terceiro
 * problema não se resolve arrastando as páginas públicas para dentro do
 * painel — elas são páginas de venda e de SEO, e vivem com cabeçalho e
 * rodapé por bom motivo. Resolve-se dizendo a verdade ao usuário: os
 * destinos que saem do painel ficam num grupo à parte, marcado, para que
 * o sumiço da barra deixe de ser surpresa e passe a ser esperado.
 *
 * É componente de cliente porque lê `usePathname`. Nada de sessão ou de
 * banco atravessa daqui — quem lê a sessão é o layout, no servidor.
 */

export interface ItemLateral {
  href: string;
  icone: string;
  texto: string;
  /** Destino fora do painel: o menu lateral não existe lá. */
  saiDoPainel?: boolean;
}

export interface GrupoLateral {
  /** Rótulo do grupo. Vazio no primeiro, que não precisa de título. */
  titulo?: string;
  itens: ItemLateral[];
}

export default function BarraLateral({
  titulo, subtitulo, grupos, rodape,
}: {
  titulo: string;
  subtitulo: string;
  grupos: GrupoLateral[];
  /** O formulário de sair, montado por quem tem a ação de servidor. */
  rodape?: React.ReactNode;
}) {
  const caminho = usePathname() ?? '/';
  const todos = grupos.flatMap((g) => g.itens.map((i) => i.href));
  const aceso = itemAtivo(caminho, todos);

  return (
    <aside className="lateral">
      <div className="lateral-marca">
        <span className="nome">{titulo}</span>
        <span className="sub">{subtitulo}</span>
      </div>

      {grupos.map((grupo, indice) => (
        <div className="lateral-grupo" key={grupo.titulo ?? indice}>
          {grupo.titulo && <span className="lateral-grupo-titulo">{grupo.titulo}</span>}
          {grupo.itens.map((item) => {
            const ativo = item.href === aceso;
            return (
              <Link
                key={item.href}
                className={`item-lateral${ativo ? ' ativo' : ''}`}
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
              >
                <Icone nome={item.icone} /> {item.texto}
                {item.saiDoPainel && (
                  <Icone nome="arrow_forward" tamanho={16} className="ico-sai" />
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {rodape && <div className="lateral-rodape">{rodape}</div>}
    </aside>
  );
}
