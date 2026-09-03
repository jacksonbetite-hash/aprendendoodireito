import { randomBytes } from 'node:crypto';
import { query, queryOne } from './db.ts';
import type { Exec } from './auditoria.ts';

/**
 * Indicação — o acréscimo de 5 pontos do §5.10.1.
 *
 * O ciclo, e onde cada pedaço mora:
 *
 *   clique no nosso anúncio  → /ir/[mascara] cria a linha (criarIndicacao)
 *                              e redireciona ao portal com ?i=token
 *   chegada ao portal        → proxy.ts guarda o token num cookie do portal
 *   cadastro ou login        → acoes-auth.ts vincula (vincularIndicacao)
 *   abertura do pedido       → checkout.ts aplica base + acréscimo
 *   pagamento confirmado     → checkout.ts consome (consumirIndicacao)
 *
 * A regra que sustenta tudo: o vínculo nasce NO CLIQUE, antes de existir
 * venda, e o professor não escreve nesta tabela. É o que prova a origem
 * numa disputa (§15.12) — e é por isso que o token é um nonce guardado no
 * banco, não um valor calculado que qualquer um poderia forjar.
 */

/** Um clique gera um token; o token é o que viaja na URL e no cookie. */
export async function criarIndicacao(portalId: number, canal = 'VITRINE') {
  // A validade sai do CONTRATO vigente, congelada aqui: mudar o contrato
  // depois não estende clique que já aconteceu.
  const contrato = await queryOne<{ dias: number }>(
    `SELECT validade_clique_dias AS dias FROM portal_contrato
      WHERE portal_id = $1 AND vigente_ate IS NULL AND aceito_em IS NOT NULL`,
    [portalId],
  );
  const dias = contrato?.dias ?? 90;
  const token = randomBytes(24).toString('base64url');
  await query(
    `INSERT INTO indicacao (portal_id, token, canal, expira_em)
     VALUES ($1, $2, $3, now() + ($4 || ' days')::interval)`,
    [portalId, token, canal.slice(0, 40), String(dias)],
  );
  return { token, dias };
}

/**
 * Liga o token ao aluno que acabou de se cadastrar (ou entrar) no portal.
 *
 * Silencioso por desenho: token vencido, de outro portal, já consumido
 * ou aluno que já tem uma indicação viva — nada disso pode derrubar um
 * cadastro. O acréscimo é receita nossa; o cadastro é do professor.
 */
export async function vincularIndicacao(token: string, usuarioId: number, portalId: number) {
  try {
    const r = await query<{ id: number }>(
      `UPDATE indicacao
          SET usuario_id = $2
        WHERE token = $1 AND portal_id = $3
          AND consumida_em IS NULL AND expira_em > now()
          AND (usuario_id IS NULL OR usuario_id = $2)
          AND NOT EXISTS (
            SELECT 1 FROM indicacao i2
             WHERE i2.portal_id = $3 AND i2.usuario_id = $2
               AND i2.consumida_em IS NULL AND i2.id <> indicacao.id)
        RETURNING id`,
      [token, usuarioId, portalId],
    );
    return r.length > 0;
  } catch {
    return false;
  }
}

/** A indicação que ainda vale para este aluno neste portal, se houver. */
export async function indicacaoViva(exec: Exec | typeof query, usuarioId: number, portalId: number) {
  const [i] = await exec<{ id: number }>(
    `SELECT id FROM indicacao
      WHERE usuario_id = $1 AND portal_id = $2
        AND consumida_em IS NULL AND expira_em > now()
      ORDER BY criada_em LIMIT 1`,
    [usuarioId, portalId],
  );
  return i?.id ?? null;
}

/**
 * Consome no pagamento confirmado — não na abertura do pedido: um Pix
 * abandonado não pode gastar a indicação. Idempotente: consumida uma vez,
 * a segunda chamada não faz nada.
 */
export async function consumirIndicacao(exec: Exec, indicacaoId: number, pedidoId: number) {
  await exec(
    `UPDATE indicacao SET consumida_em = now(), pedido_id = $2
      WHERE id = $1 AND consumida_em IS NULL`,
    [indicacaoId, pedidoId],
  );
}
