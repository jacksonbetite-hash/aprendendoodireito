'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { assinarPortal } from '../../lib/portal-assinatura.ts';
import { criarSessao, COOKIE_SESSAO, DURACAO_SESSAO_DIAS } from '../../lib/auth.ts';
import type { MeioPagamento } from '../../lib/pagamento.ts';

export interface EstadoContratar { erro?: string }

/**
 * A contratação do portal (§5.10.2, etapa 3). O trabalho pesado mora em
 * lib/portal-assinatura.ts; aqui é só o que pertence à requisição: o IP
 * que sustenta o aceite do contrato, e a sessão — quem acabou de
 * contratar sai logado, direto para a tela de pagamento, sem passar por
 * um login que ainda nem sabe que tem.
 */
export async function acaoContratar(
  _estado: EstadoContratar, dados: FormData,
): Promise<EstadoContratar> {
  const meio = String(dados.get('meio') ?? 'PIX');
  if (meio !== 'PIX' && meio !== 'CARTAO') return { erro: 'Meio de pagamento inválido.' };

  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim();

  let referencia: string;
  let professorId: number;
  try {
    const r = await assinarPortal({
      nome: String(dados.get('nome') ?? ''),
      email: String(dados.get('email') ?? ''),
      senha: String(dados.get('senha') ?? ''),
      cnpj: String(dados.get('cnpj') ?? ''),
      telefone: String(dados.get('telefone') ?? ''),
      rendaMensalCentavos: Math.round(Number(dados.get('renda') ?? 0) * 100),
      endereco: {
        cep: String(dados.get('cep') ?? ''),
        logradouro: String(dados.get('logradouro') ?? ''),
        numero: String(dados.get('numero') ?? ''),
        bairro: String(dados.get('bairro') ?? ''),
        complemento: String(dados.get('complemento') ?? ''),
      },
      mascara: String(dados.get('mascara') ?? '').trim().toLowerCase(),
      nomeExibicao: String(dados.get('nomeExibicao') ?? ''),
      meio: meio as MeioPagamento,
      aceitouContrato: dados.get('aceite') === 'on',
      ip,
    });
    referencia = r.referencia;
    professorId = r.professorId;
  } catch (err) {
    return { erro: (err as Error).message };
  }

  const { token, expiraEm } = await criarSessao(professorId);
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/', expires: expiraEm, maxAge: DURACAO_SESSAO_DIAS * 86_400,
  });

  redirect(`/para-professores/pagamento/${referencia}`);
}
