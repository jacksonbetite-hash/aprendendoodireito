'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../acoes.ts';

export default function FormConceder({
  acao, alunos, materias,
}: {
  acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;
  alunos: { id: number; nome: string; email: string }[];
  materias: { id: number; nome: string }[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  return (
    <form action={enviar} className="form-linha">
      {estado.erro && <p className="alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta-ok" role="status">{estado.ok}</p>}
      <div className="campos">
        <label>
          Aluno
          <select name="usuarioId" required defaultValue="">
            <option value="" disabled>escolha…</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>{a.nome} — {a.email}</option>
            ))}
          </select>
        </label>
        <label>
          Escopo
          <select name="materiaId" defaultValue="catalogo">
            <option value="catalogo">Passe completo</option>
            {materias.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </label>
        <label>
          Dias
          <input name="dias" type="number" min={1} max={3650} defaultValue={30} required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={pendente}>
          {pendente ? 'Concedendo…' : 'Conceder'}
        </button>
      </div>
      <p className="dica">
        Cortesia dá acesso igual ao da licença paga durante a vigência. Ao expirar não renova —
        o aluno recebe oferta de conversão, com o progresso preservado.
      </p>
    </form>
  );
}
