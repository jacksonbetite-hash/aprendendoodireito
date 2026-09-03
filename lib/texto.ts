/**
 * Texto — parte pura, sem banco. Serve ao cadastro do admin.
 *
 * Enquanto o conteúdo vinha de seed, o slug era escrito à mão no SQL e
 * revisado por quem escreveu. Com cadastro pela tela, ele passa a ser
 * derivado do título — e derivar mal significa endereço público feio,
 * quebrado ou duplicado, que depois não se conserta sem perder o que já
 * foi indexado. Por isso a regra é explícita e testada.
 */

/**
 * Título vira endereço: sem acento, sem maiúscula, sem pontuação, com
 * hífen no lugar do espaço.
 *
 * `NFD` separa a letra do acento, e o intervalo U+0300–U+036F remove só
 * os acentos — "ação" vira "acao", e não "ao".
 */
export function slugificar(texto: string, limite = 80): string {
  const base = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // "&" é a única pontuação que carrega sentido no título de um artigo.
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (base.length <= limite) return base;
  // Corta na palavra, não no meio dela: "prescricao-e-decad" é pior
  // endereço do que um slug mais curto e inteiro.
  const cortado = base.slice(0, limite);
  const ultimo = cortado.lastIndexOf('-');
  return (ultimo > limite / 2 ? cortado.slice(0, ultimo) : cortado).replace(/-+$/, '');
}

/**
 * Slug livre a partir de um já usado: `titulo`, `titulo-2`, `titulo-3`…
 *
 * O sufixo numérico é preferível a mandar o admin inventar outro título:
 * dois artigos podem legitimamente chamar-se "Prescrição e decadência".
 */
export function slugLivre(desejado: string, usados: readonly string[]): string {
  const tomados = new Set(usados);
  if (!tomados.has(desejado)) return desejado;
  for (let n = 2; n < 1000; n++) {
    const tentativa = `${desejado}-${n}`;
    if (!tomados.has(tentativa)) return tentativa;
  }
  throw new Error('não foi possível derivar um endereço livre');
}

/**
 * Minutos de leitura a partir do corpo do artigo.
 *
 * 200 palavras por minuto é a média de leitura de texto corrido em
 * português; o número aparece no cartão do blog e é estimativa honesta,
 * não promessa. Mínimo de 1 — "0 min de leitura" não existe.
 */
export function minutosDeLeitura(corpo: string): number {
  const palavras = corpo.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
}

/**
 * O corpo do post e a descrição da vaga são parágrafos separados por
 * linha em branco (é assim que `db/015` os semeou e como o site os
 * renderiza). Normalizar na entrada evita que uma colagem do Word entre
 * com `\r\n` e três linhas em branco e quebre a exibição.
 */
export function normalizarParagrafos(texto: string): string {
  return texto
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim().replace(/[ \t]+\n/g, '\n'))
    .filter(Boolean)
    .join('\n\n');
}
