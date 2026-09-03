import { cache } from 'react';
import { headers } from 'next/headers';
import { queryOne } from './db.ts';
import { CABECALHO_PORTAL, PLATAFORMA, type Portal } from './portal.ts';

/** Consultas de portal (§5.10). Só servidor — importa `pg`. */

export function buscarPortalPorMascara(mascara: string) {
  // RASCUNHO não resolve: portal que ainda não pagou a 1ª mensalidade
  // (§5.10.2, etapa 1) não existe publicamente — o endereço cai na
  // plataforma, como qualquer máscara desconhecida. SUSPENSO resolve,
  // porque o aluno com licença vigente continua assistindo (§5.10);
  // o corte do que o visitante vê num portal suspenso é da etapa 4.
  return queryOne<Portal>(
    // id::int — o driver devolve BIGINT como string, e o id do portal é
    // comparado com números (0 = plataforma) em toda parte.
    `SELECT id::int AS id, mascara, nome_exibicao AS "nomeExibicao", status, personalizacao,
            responsavel_nome AS "responsavelNome", responsavel_doc AS "responsavelDoc"
       FROM portal
      WHERE lower(mascara) = lower($1) AND status IN ('ATIVO', 'SUSPENSO')`,
    [mascara],
  );
}

/**
 * O portal desta requisição. `cache` do React garante uma consulta só,
 * ainda que layout, página e ações perguntem em separado.
 *
 * Máscara desconhecida cai na plataforma em vez de erro: um subdomínio que
 * não existe não precisa anunciar que o sistema é multi-tenant, e quem
 * digitou errado chega ao site principal em vez de a uma tela de falha.
 */
export const portalAtual = cache(async (): Promise<Portal> => {
  const mascara = (await headers()).get(CABECALHO_PORTAL);
  if (!mascara) return PLATAFORMA;
  return (await buscarPortalPorMascara(mascara)) ?? PLATAFORMA;
});

/** Atalho para as consultas: só o identificador, que é o que elas usam. */
export async function portalIdAtual(): Promise<number> {
  return (await portalAtual()).id;
}
