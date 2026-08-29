'use client';

import { useState } from 'react';
import type { Questao } from '../lib/exercicio.ts';

/**
 * Exercício da aula (§5.3 e §5.5): correção imediata e comentário em
 * TODAS as alternativas — inclusive nas que o aluno não marcou.
 * A resposta é registrada no servidor para alimentar estatística e
 * caderno de erros; o feedback não espera essa ida e volta.
 */
export default function Exercicio({ questoes }: { questoes: Questao[] }) {
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const respondidas = Object.keys(respostas).length;
  const acertos = questoes.filter((q) =>
    q.alternativas.some((a) => a.id === respostas[q.id] && a.correta),
  ).length;

  function responder(questaoId: number, alternativaId: number) {
    if (respostas[questaoId]) return;             // uma tentativa por questão
    setRespostas((r) => ({ ...r, [questaoId]: alternativaId }));
    // registro assíncrono: se falhar, o aluno não perde o feedback
    fetch('/api/resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questaoId, alternativaId }),
    }).catch(() => {});
  }

  const concluido = respondidas === questoes.length && questoes.length > 0;
  const percentual = questoes.length ? Math.round((acertos / questoes.length) * 100) : 0;

  return (
    <section className="exercicio">
      <h2>✍️ Exercício da aula</h2>
      <p className="sub">
        {questoes.length} questões. Toda alternativa tem comentário — inclusive as que você
        não marcou. Errou? A questão vai para o seu caderno de erros.
      </p>

      {questoes.map((q, i) => {
        const marcada = respostas[q.id];
        const acertou = q.alternativas.some((a) => a.id === marcada && a.correta);
        const multipla = q.alternativas.length > 2;

        return (
          <div className="questao" key={q.id}>
            <div className="qtag">
              <span className="pill">Questão {i + 1} de {questoes.length}</span>{' '}
              <span className="pill coral">{q.origem}</span>
            </div>
            <p className="enunciado">{q.enunciado}</p>

            {q.alternativas.map((a, j) => {
              const letra = String.fromCharCode(65 + j);
              const classe = !marcada ? '' : a.correta ? ' correct' : a.id === marcada ? ' wrong' : '';
              return (
                <button
                  className={`q-option${classe}`}
                  key={a.id}
                  disabled={Boolean(marcada)}
                  onClick={() => responder(q.id, a.id)}
                >
                  {multipla ? `${letra}) ` : ''}{a.texto}
                </button>
              );
            })}

            {marcada && (
              <div className="q-comment show">
                <strong>{acertou ? '✅ Você acertou.' : '❌ Não foi dessa vez.'}</strong>
                <ul style={{ marginTop: '.6rem' }}>
                  {q.alternativas.map((a, j) => (
                    <li style={{ padding: '.25rem 0' }} key={a.id}>
                      <strong>{multipla ? `${String.fromCharCode(65 + j)}) ` : ''}</strong>
                      {a.comentario}
                    </li>
                  ))}
                </ul>
                {!acertou && (
                  <p style={{ marginTop: '.6rem' }}>
                    🔁 Esta questão foi para o seu <strong>caderno de erros</strong>.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {concluido && (
        <div className="empty-state">
          <strong style={{ fontSize: '1.05rem' }}>
            Exercício concluído — {acertos} de {questoes.length} ({percentual}%)
          </strong>
          <br />
          {percentual >= 80
            ? 'Mandou bem. Pode seguir para a próxima aula com tranquilidade.'
            : 'Vale rever o resumo antes de seguir — as questões erradas já estão no seu caderno de erros.'}
        </div>
      )}
    </section>
  );
}
