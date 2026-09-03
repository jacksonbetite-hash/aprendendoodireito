'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icone } from '../ui.tsx';

interface Sugestao {
  id: number;
  rotulo: string;
  norma: string;
  normaSlug: string;
  trecho: string;
}

/**
 * A busca do vade-mécum (§5.4): mostra a lei enquanto se digita.
 *
 * Com 7.929 artigos no acervo, esperar o Enter é esperar demais — quem
 * procura "art. 5º" ou "prescri" quer ver o artigo antes de terminar de
 * escrever, e decidir pela leitura se era aquele mesmo. A lista aqui não é
 * autocompletar de termo: cada linha já é o artigo, com o trecho que casou.
 *
 * O teclado manda: seta para andar, Enter para abrir, Esc para fechar. Quem
 * consulta lei durante uma prova não tira a mão do teclado para usar o rato.
 */
export default function BuscaVade({ termoInicial }: { termoInicial: string }) {
  const [termo, setTermo] = useState(termoInicial);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [aberta, setAberta] = useState(false);
  const [marcada, setMarcada] = useState(-1);
  const [buscando, setBuscando] = useState(false);

  const campo = useRef<HTMLInputElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const idLista = useId();

  /* O atalho global "/" pedido no §5.4. */
  useEffect(() => {
    function atalho(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      if (e.key !== '/' || alvo?.tagName === 'INPUT' || alvo?.tagName === 'TEXTAREA') return;
      e.preventDefault();
      campo.current?.focus();
    }
    document.addEventListener('keydown', atalho);
    return () => document.removeEventListener('keydown', atalho);
  }, []);

  /* Clicar fora fecha a lista — senão ela ficaria pairando sobre a leitura. */
  useEffect(() => {
    function fora(e: MouseEvent) {
      if (!caixa.current?.contains(e.target as Node)) setAberta(false);
    }
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, []);

  /**
   * Uma consulta por pausa na digitação, e não uma por tecla.
   *
   * Sem a espera, escrever "improbidade" dispararia onze buscas das quais
   * dez já nasceriam desatualizadas. E sem o `AbortController`, a resposta
   * de "impro" poderia chegar DEPOIS da de "improbidade" e sobrescrevê-la
   * na tela — o resultado certo substituído pelo antigo, que é o tipo de
   * defeito que só aparece na conexão ruim de quem está com pressa.
   */
  useEffect(() => {
    const busca = termo.trim();
    if (busca.length < 2) { setSugestoes([]); setBuscando(false); return; }
    /* A página de resultados chega com o termo já no campo. Buscar de novo
       e abrir a lista sobre os resultados seria oferecer, por cima da
       resposta, a mesma resposta em miniatura. */
    if (busca === termoInicial.trim()) return;

    const cancelar = new AbortController();
    const espera = setTimeout(async () => {
      setBuscando(true);
      try {
        const resposta = await fetch(`/api/vademecum?q=${encodeURIComponent(busca)}`,
          { signal: cancelar.signal });
        const { resultados } = await resposta.json();
        setSugestoes(resultados);
        setMarcada(-1);
        setAberta(true);
      } catch (erro) {
        if ((erro as Error).name !== 'AbortError') setSugestoes([]);
      } finally {
        if (!cancelar.signal.aborted) setBuscando(false);
      }
    }, 180);

    return () => { clearTimeout(espera); cancelar.abort(); };
  }, [termo, termoInicial]);

  function irPara(destino: string) {
    setAberta(false);
    router.push(destino);
  }

  /* O "#d123" no fim leva a rolagem até o artigo; o "artigo=123" diz à
     página qual das dezenas de páginas da norma precisa ser carregada para
     que essa âncora exista. */
  const enderecoDa = (s: Sugestao) => `/vademecum?norma=${s.normaSlug}&artigo=${s.id}#d${s.id}`;
  const enderecoDaBusca = () =>
    termo.trim() ? `/vademecum?q=${encodeURIComponent(termo.trim())}` : '/vademecum';

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    // com uma linha marcada, o Enter abre ELA; sem marcação, faz a busca
    irPara(marcada >= 0 && sugestoes[marcada] ? enderecoDa(sugestoes[marcada]) : enderecoDaBusca());
  }

  function teclado(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setAberta(false); return; }
    if (!aberta || sugestoes.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const passo = e.key === 'ArrowDown' ? 1 : -1;
      setMarcada((atual) => {
        const proximo = atual + passo;
        // -1 é "nenhuma linha marcada", e é para onde a lista volta ao dar a
        // volta: o Enter então faz a busca completa, e não abre um artigo
        // que o aluno não escolheu
        if (proximo < -1) return sugestoes.length - 1;
        if (proximo >= sugestoes.length) return -1;
        return proximo;
      });
    }
  }

  return (
    <div className="busca-vade-caixa" ref={caixa}>
      <form className="busca-vade" onSubmit={submeter} role="search">
        <span className="lupa"><Icone nome="search" tamanho={20} /></span>
        <input
          ref={campo}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={teclado}
          onFocus={() => sugestoes.length > 0 && setAberta(true)}
          type="search"
          placeholder="Digite art. 5º CF, 121 do CP ou uma palavra da lei…"
          aria-label="Buscar no vade-mécum"
          role="combobox"
          aria-expanded={aberta}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={marcada >= 0 ? `${idLista}-${marcada}` : undefined}
          autoComplete="off"
        />
        {/* O atalho some quando o campo já está em uso: ali ele viraria só
            ruído ao lado do botão que resolve a mesma coisa. */}
        {!termo && <kbd>/</kbd>}
        <button className="btn btn-primario" type="submit">Buscar</button>
      </form>

      {aberta && termo.trim().length >= 2 && (
        <div className="busca-sugestoes" id={idLista} role="listbox" aria-label="Artigos encontrados">
          {sugestoes.map((s, i) => (
            <button
              key={s.id}
              id={`${idLista}-${i}`}
              type="button"
              role="option"
              aria-selected={i === marcada}
              className={`sugestao ${i === marcada ? 'marcada' : ''}`}
              onMouseEnter={() => setMarcada(i)}
              onClick={() => irPara(enderecoDa(s))}
            >
              <span className="sugestao-rotulo">
                <span className="sigla">{s.norma}</span>
                {s.rotulo}
              </span>
              <span className="sugestao-trecho">{destacar(s.trecho)}</span>
            </button>
          ))}

          {sugestoes.length === 0 && !buscando && (
            <p className="sugestao-vazia">
              Nada encontrado para “{termo.trim()}”. Tente o número do artigo com a sigla da
              norma — <strong>art. 5º CF</strong> — ou uma palavra do texto legal.
            </p>
          )}

          {sugestoes.length > 0 && (
            <button type="button" className="sugestao-todas" onClick={() => irPara(enderecoDaBusca())}>
              Ver todos os resultados para “{termo.trim()}”
              <Icone nome="arrow_forward" tamanho={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * O banco devolve o trecho com o termo entre « », e não em HTML: marcação
 * vinda do banco direto para dentro da página seria uma porta aberta para
 * injeção. Aqui ela vira elemento React, que o navegador não interpreta
 * como código.
 */
function destacar(trecho: string) {
  return trecho.split(/[«»]/).map((parte, i) => (
    i % 2 === 1 ? <mark key={i}>{parte}</mark> : <span key={i}>{parte}</span>
  ));
}
