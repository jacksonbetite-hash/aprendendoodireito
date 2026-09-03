'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../../acoes.ts';

type Acao = (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;

/** Fecha uma competência do portal, com ajuste manual opcional. */
export function FormFechar({
  acao, portalId, competenciaSugerida,
}: { acao: Acao; portalId: number; competenciaSugerida: string }) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  return (
    <form action={enviar} className="form-linha">
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}
      <input type="hidden" name="portalId" value={portalId} />
      <div className="campos">
        <label>
          Competência
          <input name="competencia" type="month" required
                 defaultValue={competenciaSugerida.slice(0, 7)}
                 onChange={(e) => {
                   // <input type=month> devolve "2026-08"; a fatura usa o dia 1.
                   e.target.setCustomValidity('');
                 }} />
        </label>
        <label>
          Ajuste (R$, pode ser negativo)
          <input name="ajusteValor" type="text" inputMode="decimal" placeholder="0,00" />
        </label>
        <label>
          Motivo do ajuste
          <input name="ajusteMotivo" type="text" maxLength={140}
                 placeholder="ex.: chargeback não coberto pela escrow" />
        </label>
      </div>
      <button className="btn btn-primario" type="submit" disabled={pendente}
              onClick={(e) => {
                // Normaliza "AAAA-MM" para "AAAA-MM-01" antes de enviar.
                const form = e.currentTarget.form!;
                const comp = form.elements.namedItem('competencia') as HTMLInputElement;
                if (/^\d{4}-\d{2}$/.test(comp.value)) {
                  const oculto = document.createElement('input');
                  oculto.type = 'hidden'; oculto.name = 'competencia'; oculto.value = comp.value + '-01';
                  comp.disabled = true;
                  form.appendChild(oculto);
                }
              }}>
        {pendente ? 'Fechando…' : 'Fechar competência e gerar cobrança'}
      </button>
      <p className="dica">
        Licença do contrato + excedente do consumo medido + ajuste. O professor paga pelo
        mesmo Pix/cartão da 1ª mensalidade; vencida há 10 dias, o portal suspende sozinho.
      </p>
    </form>
  );
}

/** Cortesia a um aluno do portal. */
export function FormCortesiaPortal({
  acao, portalId, alunos, materias,
}: {
  acao: Acao; portalId: number;
  alunos: { id: number; nome: string; email: string }[];
  materias: { id: number; nome: string }[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  return (
    <form action={enviar} className="form-linha">
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}
      <input type="hidden" name="portalId" value={portalId} />
      <div className="campos">
        <label>
          Aluno
          <select name="usuarioId" required defaultValue="">
            <option value="" disabled>escolha…</option>
            {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome} — {a.email}</option>)}
          </select>
        </label>
        <label>
          Curso
          <select name="materiaId" defaultValue="">
            <option value="">Passe completo do portal</option>
            {materias.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </label>
        <label>
          Dias
          <input name="dias" type="number" min={1} max={3650} defaultValue={30} required />
        </label>
      </div>
      <button className="btn btn-primario" type="submit" disabled={pendente}>
        {pendente ? 'Concedendo…' : 'Conceder cortesia'}
      </button>
    </form>
  );
}
