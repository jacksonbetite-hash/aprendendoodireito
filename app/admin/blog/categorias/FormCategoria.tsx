'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../../acoes.ts';

/**
 * Criar categoria. Editar nome e ordem acontece na própria linha da
 * tabela — a lista é curta, e abrir uma tela para trocar uma palavra é
 * atrito sem contrapartida.
 */
export default function FormCategoria(
  { acao }: { acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin> },
) {
  const [estado, enviar, pendente] = useActionState(acao, {});

  return (
    <form action={enviar} className="form-linha">
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}
      <div className="campos">
        <label>
          Nome
          <input name="nome" required maxLength={80} placeholder="Direito Digital" />
        </label>
        <label>
          Ordem
          <input name="ordem" type="number" defaultValue={10} />
        </label>
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Criando…' : 'Criar categoria'}
        </button>
      </div>
      <p className="dica">
        O endereço do filtro vem do nome e não muda ao renomear depois — quem já linkou
        <code> /blog?categoria=…</code> continua chegando ao mesmo lugar. A ordem decide a
        posição na fileira de filtros do blog; menor vem antes.
      </p>
    </form>
  );
}
