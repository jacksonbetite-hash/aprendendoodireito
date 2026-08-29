'use client';

import { useState } from 'react';

export default function AbasAula({ abas }: { abas: { id: string; rotulo: string; conteudo: React.ReactNode }[] }) {
  const [ativa, setAtiva] = useState(abas[0]?.id);
  return (
    <>
      <div className="tabbar" role="tablist">
        {abas.map((a) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={ativa === a.id}
            className={ativa === a.id ? 'active' : ''}
            onClick={() => setAtiva(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      {abas.map((a) => (
        <div className={`tabpane${ativa === a.id ? ' active' : ''}`} key={a.id}>
          {a.conteudo}
        </div>
      ))}
    </>
  );
}
