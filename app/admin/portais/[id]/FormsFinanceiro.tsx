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

/** Apura a comissão de vitrine de uma competência (§5.6.1). */
export function FormApurar({ acao, portalId, competenciaSugerida }: { acao: Acao; portalId: number; competenciaSugerida: string }) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  return (
    <form action={enviar} className="form-linha" id="apurar">
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}
      <input type="hidden" name="portalId" value={portalId} />
      <div className="campos">
        {/* type=month devolve "AAAA-MM"; a ação completa o dia 1. */}
        <label>Competência<input name="mes" type="month" required defaultValue={competenciaSugerida.slice(0, 7)} /></label>
      </div>
      <button className="btn btn-primario" type="submit" disabled={pendente}>
        {pendente ? 'Apurando…' : 'Apurar comissão do mês'}
      </button>
      <p className="dica">
        Vendas nossas de cursos deste portal pagas no mês, menos reembolsos do mês, mais saldo
        acumulado. Abaixo de R$ 100 acumula; acima, abre 5 dias de conferência para o professor.
      </p>
    </form>
  );
}

/** Aprovar (respondendo contestação) e registrar o repasse. */
export function FormApuracaoAdmin({
  aprovar, pagar, pagarGateway, portalId, apuracaoId, status, contestacao, temNota,
}: {
  aprovar: Acao; pagar: Acao; pagarGateway: Acao; portalId: number; apuracaoId: number;
  status: string; contestacao: string | null; temNota: boolean;
}) {
  const [ea, enviarAprovar, pa] = useActionState(aprovar, {});
  const [ep, enviarPagar, pp] = useActionState(pagar, {});
  const [eg, enviarGateway, pg] = useActionState(pagarGateway, {});
  const erro = ea.erro ?? ep.erro ?? eg.erro;
  const ok = ea.ok ?? ep.ok ?? eg.ok;
  return (
    <div className="pilha-sm">
      {erro && <p className="alerta alerta-erro" role="alert">{erro}</p>}
      {ok && <p className="alerta alerta-ok" role="status">{ok}</p>}
      {status === 'APROVADA' && temNota && (
        <form action={enviarGateway} className="acoes-linha">
          <input type="hidden" name="portalId" value={portalId} />
          <input type="hidden" name="apuracaoId" value={apuracaoId} />
          <button className="btn btn-primario btn-sm" type="submit" disabled={pg}>
            {pg ? 'Transferindo…' : 'Pagar pelo gateway'}
          </button>
        </form>
      )}
      {(status === 'EM_CONFERENCIA' || status === 'CONTESTADA') && (
        <form action={enviarAprovar} className="acoes-linha">
          <input type="hidden" name="portalId" value={portalId} />
          <input type="hidden" name="apuracaoId" value={apuracaoId} />
          {status === 'CONTESTADA' && (
            <input name="resposta" required placeholder={`Resposta à contestação: "${(contestacao ?? '').slice(0, 40)}…"`}
                   style={{ width: 320, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)' }} />
          )}
          <button className="btn btn-contorno btn-sm" type="submit" disabled={pa}>Aprovar</button>
        </form>
      )}
      {status === 'APROVADA' && (
        <form action={enviarPagar} className="acoes-linha">
          <input type="hidden" name="portalId" value={portalId} />
          <input type="hidden" name="apuracaoId" value={apuracaoId} />
          <input name="comprovante" required placeholder="comprovante (ref. do Pix/TED)"
                 style={{ width: 240, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)' }} />
          <button className="btn btn-contorno btn-sm" type="submit" disabled={pp}>Registrar repasse manual</button>
        </form>
      )}
    </div>
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
