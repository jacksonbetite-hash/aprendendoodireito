'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  autenticar, cadastrar, criarSessao, revogarSessao,
  validarEmail, validarSenha, COOKIE_SESSAO, DURACAO_SESSAO_DIAS,
} from '../lib/auth.ts';

export interface EstadoForm { erro?: string; aviso?: string }

async function abrirSessao(usuarioId: number) {
  const { token, expiraEm } = await criarSessao(usuarioId);
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,                                  // JS da página não lê o cookie
    sameSite: 'lax',                                 // barra CSRF vindo de outro site
    secure: process.env.NODE_ENV === 'production',   // só HTTPS fora do dev
    path: '/',
    expires: expiraEm,
    maxAge: DURACAO_SESSAO_DIAS * 86_400,
  });
}

export async function entrar(_estado: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const email = String(dados.get('email') ?? '');
  const senha = String(dados.get('senha') ?? '');
  if (!email || !senha) return { erro: 'Preencha e-mail e senha.' };

  const r = await autenticar(email, senha);
  if (!r.ok) {
    // Mensagem única de propósito: dizer "e-mail não existe" entrega
    // quais e-mails estão cadastrados a quem estiver sondando.
    return r.motivo === 'encerrada'
      ? { erro: 'Esta conta foi encerrada. Fale com o suporte.' }
      : { erro: 'E-mail ou senha não conferem.' };
  }

  await abrirSessao(r.usuarioId);
  redirect(r.statusConta === 'BLOQUEADA_INATIVIDADE' ? '/painel?reativar=1' : '/painel');
}

export async function criarConta(_estado: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const nome = String(dados.get('nome') ?? '').trim();
  const email = String(dados.get('email') ?? '').trim();
  const senha = String(dados.get('senha') ?? '');

  if (nome.length < 2) return { erro: 'Diga como podemos te chamar.' };
  const erroEmail = validarEmail(email);
  if (erroEmail) return { erro: erroEmail };
  const erroSenha = validarSenha(senha);
  if (erroSenha) return { erro: erroSenha };

  const id = await cadastrar(nome, email, senha);
  if (id === null) {
    return { erro: 'Já existe uma conta com esse e-mail. Tente entrar.' };
  }

  await abrirSessao(id);
  redirect('/painel?bemvindo=1');
}

export async function sair() {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (token) await revogarSessao(token);
  jar.delete(COOKIE_SESSAO);
  redirect('/');
}
