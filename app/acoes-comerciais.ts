'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { alunoAtual } from '../lib/sessao.ts';
import {
  abrirPedido, ativarTrial, cancelarAssinatura, pedirReembolso, garantirCpf } from '../lib/checkout.ts';
import type { MeioPagamento } from '../lib/pagamento.ts';
import type { Periodo, Produto } from '../lib/precos.ts';
import { portalIdAtual } from '../lib/portal-consultas.ts';

export interface EstadoComercial { erro?: string; ok?: string }

const PERIODOS = ['mensal', 'trimestral', 'semestral', 'anual'];
const MEIOS = ['PIX', 'CARTAO'];

export async function acaoAtivarTrial(_e: EstadoComercial, dados: FormData): Promise<EstadoComercial> {
  const aluno = await alunoAtual();
  if (!aluno) redirect('/entrar?destino=/planos');

  const materiaId = Number(dados.get('materiaId'));
  if (!Number.isInteger(materiaId)) return { erro: 'Escolha uma matéria para começar.' };

  try {
    await ativarTrial(aluno.id, aluno.email, materiaId);
  } catch (err) {
    return { erro: (err as Error).message };
  }
  revalidatePath('/painel');
  redirect('/painel?trial=1');
}

export async function acaoComprar(_e: EstadoComercial, dados: FormData): Promise<EstadoComercial> {
  const aluno = await alunoAtual();
  if (!aluno) redirect('/entrar?destino=/planos');

  const produto = String(dados.get('produto') ?? '') as Produto;
  const periodo = String(dados.get('periodo') ?? '') as Periodo;
  const meio = String(dados.get('meio') ?? 'PIX') as MeioPagamento;
  const materiaBruta = String(dados.get('materiaId') ?? '');
  const materiaId = produto === 'CATALOGO' || materiaBruta === '' ? null : Number(materiaBruta);

  if (!['MATERIA', 'CATALOGO'].includes(produto)) return { erro: 'Produto inválido.' };
  if (!PERIODOS.includes(periodo)) return { erro: 'Período inválido.' };
  if (!MEIOS.includes(meio)) return { erro: 'Meio de pagamento inválido.' };
  if (produto === 'MATERIA' && !Number.isInteger(materiaId)) {
    return { erro: 'Escolha qual matéria você quer.' };
  }

  let referencia: string;
  try {
    await garantirCpf(aluno.id, String(dados.get('cpf') ?? ''));
    const pedido = await abrirPedido(
      await portalIdAtual(), aluno.id, aluno.email, produto, periodo, materiaId, meio,
    );
    referencia = pedido.referencia;
  } catch (err) {
    return { erro: (err as Error).message };
  }
  redirect(`/checkout/${referencia}`);
}

export async function acaoCancelar(dados: FormData) {
  const aluno = await alunoAtual();
  if (!aluno) redirect('/entrar');
  await cancelarAssinatura(aluno.id, aluno.email, Number(dados.get('assinaturaId')));
  revalidatePath('/conta');
}

export async function acaoReembolsar(dados: FormData) {
  const aluno = await alunoAtual();
  if (!aluno) redirect('/entrar');
  await pedirReembolso(aluno.id, aluno.email, Number(dados.get('pedidoId')));
  revalidatePath('/conta');
  revalidatePath('/painel');
}
