'use server';

import { validarEmail } from '../../lib/auth.ts';
import { assinarNewsletter } from '../../lib/blog.ts';

export interface EstadoNewsletter { erro?: string; ok?: string }

/**
 * Assinatura da newsletter do blog.
 *
 * Responde igual para e-mail novo e para e-mail já inscrito: a diferença
 * transformaria o formulário em consulta de "quem está na lista".
 */
export async function assinar(
  _estado: EstadoNewsletter,
  dados: FormData,
): Promise<EstadoNewsletter> {
  const email = String(dados.get('email') ?? '').trim();

  const erro = validarEmail(email);
  if (erro) return { erro };

  await assinarNewsletter(email);
  return { ok: 'Pronto! O próximo envio vai para o seu e-mail.' };
}
