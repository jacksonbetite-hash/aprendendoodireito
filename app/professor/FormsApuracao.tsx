'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../admin/acoes.ts';

type Acao = (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;

/**
 * O lado do professor no ciclo do §5.6.1: contestar o extrato dentro do
 * prazo, e informar a nota quando aprovado.
 */
export default function FormsApuracao({
  contestar, informarNota, apuracaoId, status,
}: { contestar: Acao; informarNota: Acao; apuracaoId: number; status: string }) {
  const [ec, enviarContestar, pc] = useActionState(contestar, {});
  const [en, enviarNota, pn] = useActionState(informarNota, {});
  return (
    <div className="pilha-sm">
      {(ec.erro || en.erro) && <p className="alerta alerta-erro" role="alert">{ec.erro ?? en.erro}</p>}
      {(ec.ok || en.ok) && <p className="alerta alerta-ok" role="status">{ec.ok ?? en.ok}</p>}
      {status === 'EM_CONFERENCIA' && (
        <form action={enviarContestar} className="acoes-linha">
          <input type="hidden" name="apuracaoId" value={apuracaoId} />
          <input name="texto" required placeholder="algo errado no extrato? diga o quê"
                 style={{ width: 280, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)' }} />
          <button className="btn btn-contorno btn-sm" type="submit" disabled={pc}>Contestar</button>
        </form>
      )}
      {status === 'APROVADA' && (
        <form action={enviarNota} className="acoes-linha">
          <input type="hidden" name="apuracaoId" value={apuracaoId} />
          <input name="numero" required placeholder="número da NF"
                 style={{ width: 180, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)' }} />
          <button className="btn btn-primario btn-sm" type="submit" disabled={pn}>Informar nota</button>
        </form>
      )}
    </div>
  );
}
