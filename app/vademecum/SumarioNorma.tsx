'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icone } from '../ui.tsx';
import { partirAgrupador } from '../../lib/vademecum-texto.ts';

interface Secao { agrupador: string; pagina: number; artigos: number }

/**
 * O índice da norma, como o do livro impresso (§5.4).
 *
 * Sem ele, chegar ao Direito de Família seria virar 40 páginas do Código
 * Civil de quarenta artigos cada. Com ele, é um clique — e o índice fica
 * fechado por padrão, porque quem entrou pelo art. 1º quer ler o art. 1º,
 * não escolher entre 861 capítulos.
 */
export default function SumarioNorma(
  { normaSlug, secoes, paginaAtual }: { normaSlug: string; secoes: Secao[]; paginaAtual: number },
) {
  const [aberto, setAberto] = useState(false);

  /* O agrupador guarda o caminho inteiro ("LIVRO I › TÍTULO II › CAPÍTULO
     I"). No índice entram os dois primeiros níveis: o terceiro daria as 861
     linhas do Código Civil, que é uma lista para rolar, não para ler. */
  const partes = doisPrimeirosNiveis(secoes);
  const divisoes = partes.reduce((total, parte) => total + parte.filhos.length, 0);

  return (
    <div className="vade-indice">
      <button
        type="button"
        className="vade-indice-botao"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
      >
        <Icone nome="library_books" tamanho={18} />
        Índice da norma
        <span className="conta">{divisoes} divisões</span>
        <Icone nome={aberto ? 'expand_more' : 'chevron_right'} tamanho={18} />
      </button>

      {aberto && (
        <div className="vade-indice-lista">
          {partes.map((parte) => (
            <section key={parte.nome}>
              {/* O nível de cima fica como cabeçalho porque cada livro
                  reinicia a numeração: sem ele, o índice do Código Civil
                  seria uma lista de oito "TÍTULO I" indistinguíveis. */}
              <h4>{parte.nome}</h4>
              <ol>
                {parte.filhos.map((filho) => {
                  const { titulo, subtitulo } = partirAgrupador(filho.agrupador);
                  return (
                    <li key={filho.agrupador} className={filho.pagina === paginaAtual ? 'nesta-pagina' : ''}>
                      <Link href={`/vademecum?norma=${normaSlug}&p=${filho.pagina}`}>
                        <strong>{titulo}</strong>
                        {subtitulo && <span>{subtitulo}</span>}
                        <span className="pagina">p. {filho.pagina}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Do caminho hierárquico de cada artigo, o índice fica com os dois níveis
 * mais altos que a norma usa de fato — "PARTE › TÍTULO" no Código Penal,
 * "LIVRO › TÍTULO" no Código Civil, e só o TÍTULO numa lei que não tem nem
 * parte nem livro. Cada divisão aparece uma vez, na página em que começa.
 */
function doisPrimeirosNiveis(secoes: Secao[]) {
  const partes: { nome: string; filhos: Secao[] }[] = [];
  const porNome = new Map<string, { nome: string; filhos: Secao[] }>();
  const jaVistos = new Set<string>();

  for (const secao of secoes) {
    const [topo, segundo] = secao.agrupador.split(' › ');
    const chave = segundo ? `${topo} › ${segundo}` : topo;
    // a primeira ocorrência é a que manda: é onde a divisão começa
    if (jaVistos.has(chave)) continue;
    jaVistos.add(chave);

    let parte = porNome.get(topo);
    if (!parte) {
      parte = { nome: topo, filhos: [] };
      porNome.set(topo, parte);
      partes.push(parte);
    }
    if (segundo) parte.filhos.push({ ...secao, agrupador: segundo });
  }

  /* Norma sem subdivisão (a LINDB, por exemplo) tem um nível só: ele deixa
     de ser cabeçalho vazio e vira a própria linha do índice. */
  return partes.map((parte) => (
    parte.filhos.length > 0 ? parte : { nome: '', filhos: [{ ...secoes.find((s) => s.agrupador === parte.nome)!, agrupador: parte.nome }] }
  ));
}
