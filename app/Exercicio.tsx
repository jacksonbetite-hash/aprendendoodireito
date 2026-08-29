'use client';

import { useState } from 'react';
import { Icone } from './ui.tsx';
import type { Questao } from '../lib/exercicio.ts';

/**
 * Exercício da aula (§5.3 e §5.5): correção imediata e comentário em
 * TODAS as alternativas — inclusive nas que o aluno não marcou.
 * O comentário vem no formato "Comentário da Professora" do design
 * system, com o artigo citado ao alcance da mão.
 */
export default function Exercicio(
  { questoes, professor }: { questoes: Questao[]; professor?: string | null },
) {
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const respondidas = Object.keys(respostas).length;
  const acertos = questoes.filter((q) =>
    q.alternativas.some((a) => a.id === respostas[q.id] && a.correta),
  ).length;

  function responder(questaoId: number, alternativaId: number) {
    if (respostas[questaoId]) return;                 // uma tentativa por questão
    setRespostas((r) => ({ ...r, [questaoId]: alternativaId }));
    fetch('/api/resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questaoId, alternativaId }),
    }).catch(() => {});                                // o feedback não espera a rede
  }

  const concluido = respondidas === questoes.length && questoes.length > 0;
  const pct = questoes.length ? Math.round((acertos / questoes.length) * 100) : 0;

  return (
    <section id="exercicio" style={{ marginTop: 40 }}>
      <div className="barra-exercicio">
        <span className="rotulo">Progresso</span>
        <div className="progresso terciaria">
          <i style={{ width: `${questoes.length ? (respondidas / questoes.length) * 100 : 0}%` }} />
        </div>
        <span className="contador">{respondidas} / {questoes.length}</span>
      </div>

      {questoes.map((q, i) => {
        const marcada = respostas[q.id];
        const acertou = q.alternativas.some((a) => a.id === marcada && a.correta);
        const multipla = q.alternativas.length > 2;
        const artigo = /art\.?\s*\d+/i.exec(q.alternativas.find((a) => a.correta)?.comentario ?? '')?.[0];

        return (
          <div key={q.id} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="chip chip-secundaria">Questão {i + 1} de {questoes.length}</span>
              <span className="chip chip-neutra">{q.origem}</span>
            </div>
            <p className="enunciado">{q.enunciado}</p>

            {q.alternativas.map((a, j) => {
              const letra = String.fromCharCode(65 + j);
              let classe = '';
              if (marcada) {
                if (a.correta) classe = ' certa';
                else if (a.id === marcada) classe = ' errada';
                else classe = ' apagada';
              }
              return (
                <button
                  className={`alternativa${classe}`} key={a.id}
                  disabled={Boolean(marcada)}
                  onClick={() => responder(q.id, a.id)}
                >
                  <span className="letra">
                    {marcada && a.correta ? <Icone nome="check" tamanho={16} /> : multipla ? letra : letra}
                  </span>
                  <span>{a.texto}</span>
                </button>
              );
            })}

            {marcada && (
              <div className="comentario">
                <div className="cabeca">
                  <span className="selo"><Icone nome="school" /></span>
                  <div>
                    <strong>Comentário {professor?.startsWith('Prof.ª') ? 'da Professora' : 'do Professor'}</strong>
                    <span>{professor ?? 'Equipe Aprendendo o Direito'}</span>
                  </div>
                  <span className="xp"><Icone nome="bolt" tamanho={14} /> {acertou ? '+10 XP' : '+3 XP'}</span>
                </div>

                <p style={{ fontWeight: 700, marginBottom: 12, color: acertou ? 'var(--on-secondary-fixed-variant)' : 'var(--on-error-container)' }}>
                  {acertou ? 'Excelente escolha!' : 'Não foi dessa vez — e tudo bem, é assim que fixa.'}
                </p>

                {q.alternativas.map((a, j) => (
                  <div className="caixa" key={a.id}>
                    <b>{multipla ? `${String.fromCharCode(65 + j)}) ` : `${a.texto}: `}</b>
                    {a.comentario}
                  </div>
                ))}

                <div className="acoes">
                  {artigo && (
                    <a className="btn btn-primario btn-sm" href={`/vademecum?q=${encodeURIComponent(artigo)}`}>
                      <Icone nome="menu_book" tamanho={18} /> Ler {artigo}
                    </a>
                  )}
                  {!acertou && (
                    <span className="chip chip-primaria">
                      <Icone nome="replay" tamanho={16} /> Foi para o seu caderno de erros
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {concluido && (
        <div className="resultado-exercicio">
          <strong>Exercício concluído — {acertos} de {questoes.length} ({pct}%)</strong>
          {pct >= 80
            ? 'Mandou bem. Pode seguir para a próxima aula com tranquilidade.'
            : 'Vale rever o resumo antes de seguir — as questões erradas já estão no seu caderno de erros.'}
        </div>
      )}
    </section>
  );
}
