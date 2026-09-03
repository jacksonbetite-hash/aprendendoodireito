'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../acoes.ts';

export default function FormArea({
  acao, portalId,
}: {
  acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;
  portalId: number;
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  return (
    <form action={enviar} className="form-linha">
      <input type="hidden" name="portalId" value={portalId} />
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}
      <div className="campos">
        <label>
          Nome da área
          <input name="nome" required maxLength={80} placeholder="Direito Penal" />
        </label>
        <label>
          Ordem
          <input name="ordem" type="number" defaultValue={10} />
        </label>
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Criando…' : 'Criar área'}
        </button>
      </div>
      <p className="dica">
        A área agrupa as matérias no catálogo. Cada portal tem as próprias — o professor não é
        obrigado às nossas (§5.10).
      </p>
    </form>
  );
}
