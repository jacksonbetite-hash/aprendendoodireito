import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Pagina } from '../componentes.tsx';
import { FormCadastro } from '../FormAuth.tsx';
import { criarConta } from '../acoes-auth.ts';
import { alunoAtual } from '../../lib/sessao.ts';

export const metadata: Metadata = { title: 'Criar conta' };
export const dynamic = 'force-dynamic';

export default async function Cadastrar() {
  if (await alunoAtual()) redirect('/painel');
  return (
    <Pagina>
      <section className="secao caixa-auth">
        <div className="cartao cartao-auth">
          <h1>Criar conta grátis</h1>
          <p className="sub">
            Dá acesso ao vade-mécum completo, à 1ª aula de cada assunto e ao teste de 7 dias.
          </p>
          <FormCadastro acao={criarConta} />
        </div>
      </section>
    </Pagina>
  );
}
