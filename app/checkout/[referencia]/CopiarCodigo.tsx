'use client';

import { useState } from 'react';
import { Icone } from '../../ui.tsx';

export default function CopiarCodigo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div>
      <div style={{
        background: 'var(--surface-container-low)', border: '1px dashed var(--borda-controle)',
        borderRadius: 'var(--r-md)', padding: '14px 16px', fontSize: 12,
        fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all', marginBottom: 12,
      }}>
        {codigo}
      </div>
      <button
        className="btn btn-primario" style={{ width: '100%' }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(codigo);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
          } catch { /* sem permissão de área de transferência: o código está visível acima */ }
        }}
      >
        <Icone nome={copiado ? 'check' : 'edit'} tamanho={20} />
        {copiado ? 'Código copiado' : 'Copiar código Pix'}
      </button>
    </div>
  );
}
