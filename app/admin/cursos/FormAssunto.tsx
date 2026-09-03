'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../acoes.ts';

export default function FormAssunto({
  acao, portalId, materiaId,
}: {
  acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;
  portalId: number;
  materiaId: number;
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  return (
    <form action={enviar} className="form-linha">
      <input type="hidden" name="portalId" value={portalId} />
      <input type="hidden" name="materiaId" value={materiaId} />
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}
      <div className="campos">
        <label>
          Novo assunto
          <input name="nome" required maxLength={140} placeholder="Direitos fundamentais" />
        </label>
        <label>
          Ordem
          <input name="ordem" type="number" defaultValue={10} />
        </label>
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Criando…' : 'Criar assunto'}
        </button>
      </div>
      <p className="dica">
        O assunto organiza as aulas dentro do curso. Não é unidade de venda — a licença é do
        curso inteiro (§6).
      </p>
    </form>
  );
}
