'use client';

import { useState } from 'react';

export default function AbasAula({ abas }: { abas: { id: string; rotulo: string; conteudo: React.ReactNode }[] }) {
  const [ativa, setAtiva] = useState(abas[0]?.id);
  return (
    <>
      <div className="abas" role="tablist">
        {abas.map((a) => (
          <button
            key={a.id} role="tab" aria-selected={ativa === a.id}
            className={ativa === a.id ? 'ativa' : ''}
            onClick={() => setAtiva(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      {abas.map((a) => (
        <div className={`painel-aba${ativa === a.id ? ' ativa' : ''}`} key={a.id}>{a.conteudo}</div>
      ))}
    </>
  );
}
