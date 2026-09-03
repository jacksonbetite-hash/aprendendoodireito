/**
 * O dispositivo chega do acervo com um bloco por linha — caput, incisos,
 * alíneas, parágrafos —, na ordem em que a lei os escreveu. A tela de
 * consulta lê como o papel: o caput corrido, os incisos recuados em
 * algarismo romano, as alíneas dentro do inciso, o parágrafo destacado.
 *
 * Aqui as linhas ganham tipo. Não é enfeite: o que distingue um inciso de
 * um parágrafo é o que a lei diz sobre cada um, e um § renderizado como
 * inciso é a lei lida errado.
 *
 * O acervo importado do Planalto já vem com as linhas separadas. Um
 * dispositivo escrito à mão, num parágrafo corrido, não vem — e é por isso
 * que a divisão por pontuação continua existindo: ela reconstrói as linhas
 * que a fonte não trouxe, e só é usada quando não há linha alguma.
 */

export type TipoBloco = 'caput' | 'inciso' | 'alinea' | 'item' | 'paragrafo' | 'pena' | 'rubrica' | 'texto';

export interface Bloco {
  tipo: TipoBloco;
  rotulo: string;   // "II", "a", "§ 1º", "Pena" — vazio no caput
  texto: string;
}

/* Inciso é romano ("II - ..."), item é arábico ("1. ..."), alínea é letra
   com parêntese ("a) ..."). O separador varia entre travessão, meia-risca e
   hífen: a fonte não é constante nisso, e o leitor não precisa saber. */
const INCISO = /^([IVXLCDM]{1,7})\s*[-–—]\s+/;
const ALINEA = /^([a-z])\)\s*/;
const ITEM = /^(\d{1,2})[.)]\s+/;
const PARAGRAFO = /^(Parágrafo único|§\s*\d+[ºo°]?(?:-[A-Z])?)\s*[.\-–—]?\s*/;
/* No Código Penal a pena é linha própria e é o que se procura no artigo. */
const PENA = /^(Pena|Multa|Reclusão|Detenção)\s*[-–—:]\s*/;

export function partirDispositivo(bruto: string): Bloco[] {
  const linhas = bruto.includes('\n')
    ? bruto.split('\n').map((l) => l.trim()).filter(Boolean)
    : reconstruirLinhas(bruto);

  /* O caput não é necessariamente a primeira linha: no Código Penal a
     rubrica marginal vem antes dele. É a primeira linha que não é rubrica
     nem inciso nem parágrafo — e depois dela, o resto é continuação. */
  let caputVisto = false;
  return linhas.map((linha) => {
    const bloco = classificar(linha, { unica: linhas.length === 1, caputVisto });
    if (bloco.tipo === 'caput') caputVisto = true;
    return bloco;
  });
}

function classificar(linha: string, onde: { unica: boolean; caputVisto: boolean }): Bloco {
  const paragrafo = linha.match(PARAGRAFO);
  if (paragrafo) {
    return { tipo: 'paragrafo', rotulo: normalizarParagrafo(paragrafo[1]), texto: linha.slice(paragrafo[0].length) };
  }
  const pena = linha.match(PENA);
  if (pena) return { tipo: 'pena', rotulo: pena[1], texto: linha.slice(pena[0].length) };

  const inciso = linha.match(INCISO);
  if (inciso) return { tipo: 'inciso', rotulo: inciso[1], texto: linha.slice(inciso[0].length) };

  const alinea = linha.match(ALINEA);
  if (alinea) return { tipo: 'alinea', rotulo: alinea[1], texto: linha.slice(alinea[0].length) };

  const item = linha.match(ITEM);
  if (item) return { tipo: 'item', rotulo: item[1], texto: linha.slice(item[0].length) };

  /* "Homicídio qualificado", "Lei penal no tempo": o Código Penal intitula o
     instituto antes de enunciá-lo, numa linha curta sem ponto final. É
     título, não texto legal, e no papel aparece como título — inclusive
     quando é a primeira linha do artigo, que é onde a rubrica marginal do
     art. 2º do CP fica.

     O caput não é confundido com ela porque termina em pontuação: "Matar
     alguem:" abre os dois-pontos que a pena vai fechar. */
  if (!onde.unica && ehRubrica(linha)) return { tipo: 'rubrica', rotulo: '', texto: linha };

  if (!onde.caputVisto) return { tipo: 'caput', rotulo: '', texto: linha };
  return { tipo: 'texto', rotulo: '', texto: linha };
}

const ehRubrica = (linha: string) => linha.length < 70 && !/[.;:,!?]$/.test(linha);

/** "§ 2°" e "§2º" são o mesmo parágrafo; na tela existe um jeito só. */
function normalizarParagrafo(rotulo: string) {
  return rotulo.replace(/^§\s*(\d+)[ºo°]?(-[A-Z])?$/, '§ $1º$2');
}

/* ---------------------------------------------------------------------
   Reconstrução de um dispositivo escrito em parágrafo corrido.

   Um inciso só começa depois de ":", ";" ou "." — nunca no meio da frase.
   Sem essa âncora, o "I" de uma sigla qualquer viraria inciso. A mesma
   exigência de pontuação anterior é o que separa o parágrafo de uma
   remissão escrita no meio do texto ("na forma do § 1º deste artigo").
   --------------------------------------------------------------------- */
const MARCA = /(?:^|[:;.]\s)\s*(?=(?:[IVXLCDM]{1,7}\s*[-–—]\s|Parágrafo único|§\s?\d+[ºo°]?\s))/g;

function reconstruirLinhas(texto: string) {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  const cortes: number[] = [];
  MARCA.lastIndex = 0;
  let marca: RegExpExecArray | null;
  while ((marca = MARCA.exec(limpo))) {
    // a pontuação que fecha o trecho anterior fica COM ele: o caput termina
    // nos dois-pontos e cada inciso termina no seu ponto e vírgula
    const corte = marca.index === 0 ? 0 : marca.index + 1;
    if (corte > 0) cortes.push(corte);
    MARCA.lastIndex = marca.index + 1;
  }

  const linhas: string[] = [];
  let inicio = 0;
  for (const corte of cortes) {
    linhas.push(limpo.slice(inicio, corte).trim());
    inicio = corte;
  }
  linhas.push(limpo.slice(inicio).trim());
  return linhas.filter(Boolean);
}

/**
 * "Título I — Dos Princípios Fundamentais" vira duas linhas na tela: a
 * numeração em destaque e o assunto abaixo, como no índice impresso.
 */
export function partirAgrupador(agrupador: string) {
  const [primeiro, ...resto] = agrupador.split(/\s[—–]\s/);
  return resto.length
    ? { titulo: primeiro.trim(), subtitulo: resto.join(' — ').trim() }
    : { titulo: primeiro.trim(), subtitulo: '' };
}

/**
 * O agrupador guarda a hierarquia inteira do ponto em que o artigo está
 * ("LIVRO I › TÍTULO II › CAPÍTULO I"). No corpo da página só o nível mais
 * fundo precisa aparecer — os de cima já estão no caminho acima dele.
 */
export function ultimoNivel(agrupador: string) {
  const niveis = agrupador.split(' › ');
  return niveis[niveis.length - 1] ?? '';
}
