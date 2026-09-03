/**
 * Qual item do menu está aceso — parte pura, sem React e sem banco.
 *
 * Vivia escrito à mão em três lugares (`app/admin/layout.tsx`,
 * `app/painel/page.tsx` e `app/conta/page.tsx`), cada um fixando a classe
 * `ativo` num item escolhido no código. O efeito era o defeito relatado:
 * em `/admin/precos` o realce continuava em "Dashboard", e o menu parecia
 * não responder ao clique. A regra passa a ser derivada da rota, e como
 * ela é pura, é testável sem navegador (`navegacao.test.ts`).
 *
 * A regra: vence o item cujo endereço é o prefixo MAIS LONGO do caminho
 * atual. É o que faz `/admin` perder para `/admin/blog` quando se está em
 * `/admin/blog/novo` — sem isso, o item raiz do painel roubaria o realce
 * de todos os outros para sempre.
 */

/** Tira barra final, âncora e query: só o caminho interessa à comparação. */
function normalizar(endereco: string): string {
  const caminho = endereco.split('#')[0].split('?')[0];
  if (caminho.length > 1 && caminho.endsWith('/')) return caminho.slice(0, -1);
  return caminho || '/';
}

/**
 * O endereço do item aceso, tal como veio na lista, ou `null` quando
 * nenhum item cobre o caminho atual.
 *
 * Devolve o valor original (e não o normalizado) para que quem chamou
 * possa comparar por igualdade com o que tem em mãos.
 */
export function itemAtivo(caminho: string, enderecos: readonly string[]): string | null {
  const atual = normalizar(caminho);
  let vencedor: string | null = null;
  let tamanho = -1;

  for (const endereco of enderecos) {
    const alvo = normalizar(endereco);
    // `startsWith(alvo + '/')` e não `startsWith(alvo)`: sem a barra,
    // `/admin/precos` acenderia o item `/admin/preco`.
    const casa = atual === alvo || (alvo !== '/' && atual.startsWith(alvo + '/'));
    if (casa && alvo.length > tamanho) {
      vencedor = endereco;
      tamanho = alvo.length;
    }
  }
  return vencedor;
}
