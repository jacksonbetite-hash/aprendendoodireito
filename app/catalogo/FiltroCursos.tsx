'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Icone } from '../ui.tsx';

/**
 * Barra de filtros + grade do catálogo.
 *
 * O filtro roda no navegador porque o catálogo inteiro cabe numa página:
 * são dezenas de cursos, não milhares. Ida ao servidor a cada tecla seria
 * latência sem ganho. A página continua renderizada no servidor — este
 * componente só recebe a lista pronta e decide o que mostrar.
 */

export interface CursoCartao {
  id: number;
  slug: string;
  nome: string;
  ementa: string;
  onda: number | null;
  professor: string | null;
  areaSlug: string;
  publicada: boolean;
  aulas: number;
  duracao: string;
  duracaoSegundos: number;
  preco: string;
  /** Destino do cartão; por padrão o curso do próprio portal. */
  href?: string;
}

export interface AreaSecao { id: number; slug: string; nome: string }

type Ordem = 'catalogo' | 'nome' | 'aulas' | 'duracao';

/** Sem acento e em minúscula: "Introdução" acha "introducao". */
const dobrar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const ONDA = (o: number | null) => (o === null ? 'Em breve' : `${o}ª onda`);

/** "1 aula" e "2 aulas" — a contagem carrega a concordancia junto. */
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/* A cor da pill segue a onda, não a situação: 1ª onda em verde, as
   seguintes em âmbar, sem onda em neutro. É o mesmo código de cores das
   etiquetas de estado no resto do sistema. */
const CHIP_ONDA = (o: number | null) =>
  o === null ? 'chip-neutra' : o === 1 ? 'chip-secundaria' : 'chip-terciaria';

export default function FiltroCursos(
  { areas, cursos }: { areas: AreaSecao[]; cursos: CursoCartao[] },
) {
  const [termo, setTermo] = useState('');
  const [area, setArea] = useState('');
  const [situacao, setSituacao] = useState('');
  const [professor, setProfessor] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('catalogo');

  const professores = useMemo(
    () => [...new Set(cursos.map((c) => c.professor).filter((p): p is string => !!p))].sort(
      (a, b) => a.localeCompare(b, 'pt-BR'),
    ),
    [cursos],
  );

  const filtrados = useMemo(() => {
    const busca = dobrar(termo.trim());
    const achados = cursos.filter((c) => {
      if (area && c.areaSlug !== area) return false;
      if (professor && c.professor !== professor) return false;
      if (situacao === 'publicado' && !c.publicada) return false;
      if (situacao === 'producao' && c.publicada) return false;
      if (!busca) return true;
      return dobrar(`${c.nome} ${c.ementa} ${c.professor ?? ''}`).includes(busca);
    });
    if (ordem === 'catalogo') return achados;
    return [...achados].sort((a, b) => {
      if (ordem === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR');
      if (ordem === 'aulas') return b.aulas - a.aulas;
      return b.duracaoSegundos - a.duracaoSegundos;
    });
  }, [cursos, termo, area, situacao, professor, ordem]);

  const filtrando = !!(termo.trim() || area || situacao || professor);

  function limpar() {
    setTermo(''); setArea(''); setSituacao(''); setProfessor(''); setOrdem('catalogo');
  }

  return (
    <>
      <div className="filtros-bloco">
        <div className="filtros-catalogo">
          <div className="filtro-busca">
            <Icone nome="search" tamanho={20} />
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar cursos…"
              aria-label="Buscar cursos pelo nome, ementa ou professor"
            />
          </div>

          <div className="filtro-selects">
            <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Filtrar por área">
              <option value="">Todas as áreas</option>
              {areas.map((a) => <option key={a.slug} value={a.slug}>{a.nome}</option>)}
            </select>

            <select value={situacao} onChange={(e) => setSituacao(e.target.value)} aria-label="Filtrar por situação">
              <option value="">Todas as situações</option>
              <option value="publicado">Publicados</option>
              <option value="producao">Em produção</option>
            </select>

            <select
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              aria-label="Filtrar por professor"
              disabled={professores.length === 0}
            >
              <option value="">Todos os professores</option>
              {professores.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} aria-label="Ordenar cursos">
              <option value="catalogo">Ordem do catálogo</option>
              <option value="nome">Nome (A–Z)</option>
              <option value="aulas">Mais aulas</option>
              <option value="duracao">Maior duração</option>
            </select>
          </div>
        </div>

        <p className="filtro-resultado" role="status">
          {filtrando
            ? `${filtrados.length} ${filtrados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}`
            : `${cursos.length} cursos no catálogo`}
          {filtrando && (
            <button type="button" className="filtro-limpar" onClick={limpar}>Limpar filtros</button>
          )}
        </p>
      </div>

      {areas.map((a) => {
        const daArea = filtrados.filter((c) => c.areaSlug === a.slug);
        /* Com filtro ativo, área sem resultado sai da tela — a lista de
           "nada aqui" seria mais longa que a de achados. Sem filtro, a área
           vazia continua aparecendo: ela faz parte do mapa do catálogo. */
        if (filtrando && daArea.length === 0) return null;
        const publicados = daArea.filter((c) => c.publicada).length;
        return (
          <section key={a.id}>
            <div className="cabeca-area">
              <h2 className="headline-md">{a.nome}</h2>
              <span className="caption suave">
                {daArea.length
                  ? `${daArea.length} ${daArea.length === 1 ? 'curso' : 'cursos'} · ${publicados} publicado${publicados === 1 ? '' : 's'}`
                  : 'Área ainda sem curso no catálogo de partida'}
              </span>
            </div>

            <div className="grade-3">
              {daArea.map((c) => <Cartao curso={c} key={c.id} />)}

              {daArea.length === 0 && (
                <div className="cartao cartao-curso cartao-fantasma">
                  <span className="chip chip-sm chip-terciaria">Em breve</span>
                  <h3>Área do mapa definitivo</h3>
                  <p className="ementa">
                    {a.nome} faz parte do mapa para onde o catálogo cresce, mas ainda não tem
                    curso no catálogo de partida.
                  </p>
                  <div className="rodape-cartao">
                    <div className="linha-preco">
                      <span className="suave">Em produção</span>
                      <span className="chip chip-sm chip-neutra">Entrar na lista</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {filtrados.length === 0 && (
        <div className="vazio">
          Nenhum curso corresponde a esses filtros.{' '}
          <button type="button" className="filtro-limpar" onClick={limpar}>Limpar filtros</button>
        </div>
      )}
    </>
  );
}

export function Cartao({ curso }: { curso: CursoCartao }) {
  const miolo = (
    <>
      <span className={`chip chip-sm ${CHIP_ONDA(curso.onda)}`}>{ONDA(curso.onda)}</span>
      <h3>{curso.nome}</h3>
      {curso.professor && <p className="autor">{curso.professor}</p>}
      <p className="ementa">{curso.ementa}</p>
      <div className="rodape-cartao">
        {curso.publicada ? (
          <>
            <div className="linha-preco">
              <span className="suave">{plural(curso.aulas, 'aula', 'aulas')} · {curso.duracao}</span>
              <strong>{curso.preco}/mês</strong>
            </div>
            <span className="btn btn-primario btn-sm btn-bloco">Ver detalhes</span>
          </>
        ) : (
          <div className="linha-preco">
            <span className="suave">Em produção</span>
            <span className="chip chip-sm chip-neutra">Avise-me</span>
          </div>
        )}
      </div>
    </>
  );

  return curso.publicada ? (
    <Link className="cartao cartao-curso" href={curso.href ?? `/materia/${curso.slug}`}>{miolo}</Link>
  ) : (
    <div className="cartao cartao-curso cartao-fantasma">{miolo}</div>
  );
}
