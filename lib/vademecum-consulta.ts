/**
 * O que o aluno digita, e o que ele quis dizer (§5.4).
 *
 * A busca do vade-mécum recebe três coisas misturadas na mesma caixa:
 *
 *   "art 5 cf"           → artigo 5 da Constituição
 *   "121 cp"             → artigo 121 do Código Penal
 *   "prescri"            → texto, ainda pela metade
 *   "cláusula pétrea"    → texto, pelo nome que se aprende na aula
 *
 * Separar essas intenções é o que faz a diferença entre 7.929 artigos e o
 * artigo certo: "5" procurado como texto casa com centenas de remissões ao
 * art. 5º; procurado como número, casa com o artigo 5º.
 *
 * Esta separação é feita sem banco, para poder ser testada sozinha — o que
 * ela devolve é o pedido interpretado, não a resposta.
 */

export interface Consulta {
  numero: number | null;   // 5, em "art 5º-A cf"
  sufixo: string;          // "A"
  palavras: string[];      // o que sobra: o texto a procurar e o nome da norma
}

const semAcento = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* "art", "artigo", "arts" — e as preposições que ligam o número à norma
   ("121 DO cp", "art. 5º DA constituição"). Nenhuma delas é o que se
   procura; todas atrapalham se forem procuradas. */
const RUIDO = new Set([
  'art', 'arts', 'artigo', 'artigos', 'lei', 'leis',
  'do', 'da', 'de', 'dos', 'das', 'no', 'na', 'o', 'a', 'e',
]);

/* "5", "5º", "5o", "5-a", "1.723", "121a" */
const NUMERO_ARTIGO = /^(\d{1,3}(?:\.\d{3})+|\d{1,4})(?:[ºªo°])?(?:-?([a-z]))?$/;

export function interpretarBusca(bruto: string): Consulta {
  const limpo = bruto.trim();
  /* A pontuação vira separador: "art.5º" e "art. 5º" são a mesma pergunta, e
     quem digita rápido escreve das duas formas. Ponto e hífen sobrevivem
     dentro da palavra, porque lá eles são parte do número do artigo — o
     milhar do Código Civil ("1.723") e o acréscimo ("121-A"). */
  const palavras = semAcento(limpo)
    // o ponto só é parte da palavra entre dois dígitos: em "1.723" ele é o
    // milhar, em "art.5º" e em "art." ele é pontuação e separa
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
    .replace(/[^a-z0-9º°ª.-]+/g, ' ')
    .split(' ')
    .map((p) => p.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(Boolean);

  let numero: number | null = null;
  let sufixo = '';
  const sobra: string[] = [];

  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];

    if (RUIDO.has(palavra)) {
      /* "art" some, mas deixa um rastro: o número que vem depois dele é
         número de artigo mesmo que a busca tenha outras palavras. */
      continue;
    }

    const artigo = palavra.match(NUMERO_ARTIGO);
    if (artigo && numero === null) {
      numero = Number(artigo[1].replace(/\./g, ''));
      sufixo = (artigo[2] ?? '').toUpperCase();
      continue;
    }
    sobra.push(palavra);
  }

  // a norma é procurada entre as palavras que sobraram; qual delas é o
  // apelido de uma norma, só o banco sabe
  return { numero, sufixo, palavras: sobra };
}

/**
 * As palavras viram duas consultas, porque o acervo é indexado duas vezes.
 *
 *   completa — todas as palavras, no índice por radical. É o que faz
 *              "prescrever" achar "prescrição": as duas viram "prescr".
 *   prefixo  — a última palavra aberta, no índice sem radical. É o que faz
 *              "improbid" achar "improbidade" enquanto ainda se digita —
 *              no índice por radical isso nunca casaria, porque o que está
 *              guardado ali ("improb") é MENOR que o que foi digitado.
 *
 * Um dispositivo entra no resultado se qualquer uma das duas casar. Buscar
 * só por radical perde quem está no meio da palavra; só por prefixo perde o
 * plural e a conjugação. As duas juntas cobrem a digitação inteira.
 *
 * A limpeza é obrigatória: `to_tsquery` é uma linguagem, e um "&" ou um
 * parêntese digitado por acidente derrubaria a consulta com erro de sintaxe
 * em vez de simplesmente não achar nada.
 */
export function consultasDeTexto(palavras: string[]) {
  const termos = palavras
    // "boa-fé" são duas palavras para o índice, como para o dicionário:
    // apagar o hífen faria procurar "boafé", que não existe em lugar nenhum
    .flatMap((p) => p.split(/[^a-z0-9à-ú]+/i))
    .filter((p) => p.length > 0);
  if (termos.length === 0) return { completa: '', prefixo: '' };

  return {
    completa: termos.join(' & '),
    prefixo: termos.map((t, i) => (i === termos.length - 1 ? `${t}:*` : t)).join(' & '),
  };
}
