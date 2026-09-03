/**
 * Mural de vagas — parte pura, sem acesso a banco (§5.7.1).
 *
 * Mesma separação de `precos.ts` × `precos-consultas.ts`, e pelo mesmo
 * motivo: os formulários de cadastro da retaguarda são componentes de
 * cliente e precisam dos rótulos. Se os rótulos morassem em `vagas.ts`,
 * que importa `pg`, o driver do Postgres iria parar no bundle do
 * navegador — junto com a string de conexão do banco.
 */

export type TipoVaga = 'estagio' | 'trainee' | 'advogado_jr' | 'advogado_pleno';
export type RegimeVaga = 'integral' | 'meio_periodo';
export type ModalidadeVaga = 'presencial' | 'hibrido' | 'remoto';
export type StatusVaga =
  'rascunho' | 'em_moderacao' | 'publicada' | 'pausada' | 'expirada' | 'removida';

export const POR_PAGINA = 5;

/** Teto do §5.7.1, em dias. Três meses é o limite; 90 dias é como se conta. */
export const DIAS_MAXIMOS = 90;

export const ROTULO_TIPO: Record<TipoVaga, string> = {
  estagio: 'Estágio',
  trainee: 'Trainee',
  advogado_jr: 'Advogado Jr.',
  advogado_pleno: 'Advogado Pleno',
};

export const ROTULO_REGIME: Record<RegimeVaga, string> = {
  integral: 'Integral',
  meio_periodo: 'Meio período',
};

export const ROTULO_MODALIDADE: Record<ModalidadeVaga, string> = {
  presencial: 'Presencial',
  hibrido: 'Híbrido',
  remoto: '100% remoto',
};

export const ICONE_MODALIDADE: Record<ModalidadeVaga, string> = {
  presencial: 'account_balance',
  hibrido: 'dashboard',
  remoto: 'public',
};

/** Como cada situação é dita na retaguarda — o mural público só vê "publicada". */
export const ROTULO_STATUS: Record<StatusVaga, string> = {
  rascunho: 'Rascunho',
  em_moderacao: 'Aguardando moderação',
  publicada: 'No ar',
  pausada: 'Pausada',
  expirada: 'Expirada',
  removida: 'Recusada/removida',
};

export const TIPOS = Object.keys(ROTULO_TIPO) as TipoVaga[];
export const REGIMES = Object.keys(ROTULO_REGIME) as RegimeVaga[];
export const MODALIDADES = Object.keys(ROTULO_MODALIDADE) as ModalidadeVaga[];
