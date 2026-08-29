/**
 * Preços — parte pura, sem acesso a banco.
 *
 * Este módulo é importado por componente cliente (o seletor de período da
 * página de planos). Nada aqui pode tocar o banco, senão o driver do
 * Postgres vai parar no bundle do navegador. As consultas ficam em
 * `precos-consultas.ts`, que só o servidor importa.
 *
 * A tabela em si é definida em §7 do discovery e mora no banco por
 * exigência do §5.9 (vigência e histórico).
 */
export type Periodo = 'mensal' | 'trimestral' | 'semestral' | 'anual';
export type Produto = 'MATERIA' | 'CATALOGO';

export const PERIODOS: Periodo[] = ['mensal', 'trimestral', 'semestral', 'anual'];
export const MESES: Record<Periodo, number> = {
  mensal: 1, trimestral: 3, semestral: 6, anual: 12,
};

export interface LinhaPreco {
  id: number; produto: Produto; periodo: Periodo; centavos: number;
  // node-pg converte DATE em Date — não em string. Tipar como string
  // fazia a formatação quebrar em produção e passar batido no build.
  vigenteDe: Date; vigenteAte: Date | null; criadoPor: string;
}

/** Data de vigência no formato brasileiro, tolerante a nulo. */
export const dataBR = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';

export type Tabela = Record<Produto, Record<Periodo, number>>;

export const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const porMes = (centavos: number, periodo: Periodo) => centavos / MESES[periodo];

export function economia(tabela: Tabela, produto: Produto, periodo: Periodo): number {
  const mensal = tabela[produto].mensal;
  const total = tabela[produto][periodo];
  if (!mensal || !total || periodo === 'mensal') return 0;
  const cheio = mensal * MESES[periodo];
  return Math.round(((cheio - total) / cheio) * 100);
}
