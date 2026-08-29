/**
 * Tabela de preços — §7 do discovery.
 * "Hipótese inicial e precisa de teste de disposição a pagar na Fase 0."
 * Fica em um único lugar porque o §5.9 prevê tabela versionada no admin:
 * quando o admin existir, isto vira leitura da tabela `preco` com vigência.
 */
export type Periodo = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export const MESES: Record<Periodo, number> = {
  mensal: 1, trimestral: 3, semestral: 6, anual: 12,
};

export const PRECOS: Record<Periodo, { materia: number; passe: number }> = {
  mensal:     { materia: 24.9,  passe: 59.9 },
  trimestral: { materia: 59.9,  passe: 149.9 },
  semestral:  { materia: 99.9,  passe: 269.9 },
  anual:      { materia: 169.9, passe: 449.9 },
};

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const porMes = (valor: number, periodo: Periodo) => valor / MESES[periodo];

/** Economia do período longo contra pagar o mensal 12 vezes. */
export function economiaAnual(produto: 'materia' | 'passe'): number {
  const doze = PRECOS.mensal[produto] * 12;
  return Math.round(((doze - PRECOS.anual[produto]) / doze) * 100);
}
