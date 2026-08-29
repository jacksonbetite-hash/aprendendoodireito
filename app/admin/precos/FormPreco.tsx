'use client';

import { useActionState } from 'react';
import { PERIODOS } from '../../../lib/precos.ts';
import type { EstadoAdmin } from '../acoes.ts';

export default function FormPreco(
  { acao }: { acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin> },
) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={enviar} className="form-linha">
      {estado.erro && <p className="alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta-ok" role="status">{estado.ok}</p>}
      <div className="campos">
        <label>
          Produto
          <select name="produto" defaultValue="MATERIA">
            <option value="MATERIA">Matéria avulsa</option>
            <option value="CATALOGO">Passe completo</option>
          </select>
        </label>
        <label>
          Período
          <select name="periodo" defaultValue="mensal">
            {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>
          Novo valor (R$)
          <input name="valor" inputMode="decimal" placeholder="29,90" required />
        </label>
        <label>
          Vigente a partir de
          <input name="vigenteDe" type="date" defaultValue={hoje} required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={pendente}>
          {pendente ? 'Salvando…' : 'Aplicar'}
        </button>
      </div>
      <p className="dica">
        Quem já tem licença vigente continua no preço contratado até o fim do período.
      </p>
    </form>
  );
}
