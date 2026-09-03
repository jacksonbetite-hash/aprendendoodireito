/**
 * Portal (tenant) — parte pura, sem acesso a banco.
 *
 * §5.10 do discovery: o sistema serve N catálogos pela mesma aplicação, e
 * quem decide qual deles é o endereço da requisição —
 * `jackson.aprimoreosaber.com.br` é o portal do Jackson, o domínio nu é a
 * plataforma.
 *
 * A leitura do endereço mora aqui, separada do banco, por dois motivos:
 * é o pedaço que os testes cobrem (`portal.test.ts`), e é o pedaço que o
 * `proxy.ts` precisa — proxy roda antes da aplicação e não abre conexão.
 * As consultas ficam em `portal-consultas.ts`, que só o servidor importa.
 */

/** Onde a máscara viaja entre o proxy e a aplicação. */
export const CABECALHO_PORTAL = 'x-portal-mascara';

/**
 * O endereço EXTERNO da requisição (host:porta e protocolo como o
 * navegador digitou). No Next 16 o proxy roda fora do runtime e repassa a
 * requisição internamente, então `Host` chega à aplicação como
 * `localhost:3000` — inútil para montar um redirect para fora. Quem vê o
 * endereço real é o proxy; ele o repassa aqui.
 */
export const CABECALHO_HOST_EXTERNO = 'x-portal-host-externo';
export const CABECALHO_PROTO_EXTERNO = 'x-portal-proto-externo';

/**
 * A plataforma é o portal 0 — uma linha reservada em `portal`, criada por
 * `db/018_portal.sql`. Não é detalhe de implementação: com `NULL` para
 * "sem portal", toda consulta precisaria de `IS NOT DISTINCT FROM` e um
 * `=` esquecido vazaria o acervo de um professor no site de outro
 * (§15.14). Com sentinela, `WHERE portal_id = $1` está sempre certo, e um
 * parâmetro nulo por bug devolve zero linhas — falha fechada.
 */
export const PORTAL_PLATAFORMA = 0;

export type StatusPortal = 'RASCUNHO' | 'ATIVO' | 'SUSPENSO' | 'ENCERRADO';

/** O que o professor preenche na página única (§5.10, "Anatomia"). */
export interface Personalizacao {
  chamada?: string;
  proposito?: string;
  sobre?: string;
  contato?: string;
  corPrimaria?: string;
  foto?: string;
}

export interface Portal {
  id: number;
  mascara: string;
  nomeExibicao: string;
  status: StatusPortal;
  personalizacao: Personalizacao;
  /** Identificação do responsável no rodapé do portal (§5.10, LGPD/CDC). */
  responsavelNome: string | null;
  responsavelDoc: string | null;
}

export const PLATAFORMA: Portal = {
  id: PORTAL_PLATAFORMA,
  mascara: 'plataforma',
  nomeExibicao: 'Aprimore o Saber',
  status: 'ATIVO',
  personalizacao: {},
  responsavelNome: null,
  responsavelDoc: null,
};

/** Só #rgb ou #rrggbb entram no CSS do portal — cor é dado, não código. */
export function corSegura(cor: string | undefined): string | null {
  return cor && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(cor.trim()) ? cor.trim() : null;
}

/** CNPJ com pontuação, para o rodapé. Alfanumérico (2026) só ganha os separadores. */
export function formatarCnpj(doc: string | null): string | null {
  if (!doc || doc.length !== 14) return doc;
  return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`;
}

/**
 * Domínio sob o qual os portais vivem. Em desenvolvimento é `localhost`, e
 * `jackson.localhost:3010` funciona no navegador sem configurar nada.
 */
export const dominioBase = () =>
  (process.env.DOMINIO_BASE ?? 'localhost').toLowerCase();

/**
 * Validação de CNPJ — exigência do autosserviço (§5.10.2): sem CNPJ não
 * existe subconta no gateway (regra do Banco Central, §8.2), então barrar
 * aqui é o que evita descobrir no suporte.
 *
 * Cobre o formato NOVO da Receita (julho/2026): os 12 primeiros
 * caracteres podem ser letras, e o valor de cada um no cálculo é o código
 * ASCII menos 48 — para dígitos, dá o próprio número; os dois
 * verificadores continuam numéricos e o módulo 11 é o mesmo de sempre.
 */
export function validarCnpj(bruto: string): boolean {
  const s = bruto.toUpperCase().replace(/[.\/\- ]/g, '');
  if (!/^[A-Z0-9]{12}\d{2}$/.test(s)) return false;
  if (/^(.)\1{13}$/.test(s)) return false;   // "00000000000000" e afins

  const valor = (c: string) => c.charCodeAt(0) - 48;
  const dv = (base: string, pesos: number[]) => {
    const soma = [...base].reduce((t, c, i) => t + valor(c) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, ...pesos1];
  return dv(s.slice(0, 12), pesos1) === Number(s[12])
      && dv(s.slice(0, 13), pesos2) === Number(s[13]);
}

/** Cookie que carrega o token da indicação do clique até o cadastro (§5.10.1). */
export const COOKIE_INDICACAO = 'ad_indicacao';

export const GB = 1024 ** 3;

/**
 * Excedente de consumo (§5.10, "cota por plano, excedente cobrado").
 *
 * Cobra por GB INTEIRO acima da cota, arredondando para cima — 100,1 GB
 * numa cota de 100 são 1 GB de excedente, não 0,1: a fatura precisa ser
 * explicável numa linha ("passou 1 GB"), e frações de GB viram centavos
 * que ninguém entende. Armazenamento e banda são somados em GB excedentes
 * e cobrados ao mesmo preço, porque o plano tem um preço de excedente só.
 */
export function calcularExcedente(
  bytesArmazenados: number, bytesTrafegados: number,
  plano: { gbArmazenamento: number; gbBandaMes: number; centavosPorGbExcedente: number },
): { gbExcedentes: number; centavos: number } {
  const sobra = (bytes: number, cotaGb: number) =>
    Math.max(0, Math.ceil(bytes / GB - cotaGb));
  const gbExcedentes = sobra(bytesArmazenados, plano.gbArmazenamento)
                     + sobra(bytesTrafegados, plano.gbBandaMes);
  return { gbExcedentes, centavos: gbExcedentes * plano.centavosPorGbExcedente };
}

/** Primeiro dia do mês de uma data, no formato que a coluna `competencia` usa. */
export function competenciaDe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/** A competência anterior à de `d` — o mês que se fecha quando `d` é hoje. */
export function competenciaAnterior(d: Date): string {
  return competenciaDe(new Date(d.getFullYear(), d.getMonth() - 1, 1));
}

/**
 * Máscara embutida no endereço, ou `null` quando a requisição é do site
 * principal.
 *
 * Regra de ouro: só um rótulo de subdomínio conta. `a.b.dominio` não vira
 * portal `a` — endereço que não sabemos ler é a plataforma, nunca um
 * chute. O formato aceito é o mesmo da restrição `portal_mascara_formato`
 * da migração, para que não exista máscara guardada que este código
 * recuse (ou o contrário).
 */
export function mascaraDoHost(host: string | null, base = dominioBase()): string | null {
  if (!host) return null;

  // Além do domínio, o Host traz porta; atrás de proxy pode vir lista.
  const limpo = host.split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
  if (!limpo || limpo.startsWith('[')) return null;   // IPv6 não é portal
  if (limpo === base || limpo === `www.${base}`) return null;
  if (!limpo.endsWith(`.${base}`)) return null;

  const sub = limpo.slice(0, -(base.length + 1));
  if (!sub || sub.includes('.') || sub === 'www') return null;
  if (!/^[a-z0-9]([a-z0-9-]{1,30})?[a-z0-9]$/.test(sub)) return null;

  return sub;
}
