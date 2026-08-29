import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Pagina } from '../componentes.tsx';
import { FormEntrar } from '../FormAuth.tsx';
import { entrar } from '../acoes-auth.ts';
import { alunoAtual } from '../../lib/sessao.ts';

export const metadata: Metadata = { title: 'Entrar' };
export const dynamic = 'force-dynamic';

export default async function Entrar() {
  if (await alunoAtual()) redirect('/painel');
  return (
    <Pagina>
      <section className="section caixa-auth">
        <div className="cartao-auth">
          <h1>Bom te ver de novo</h1>
          <p className="sub">Entre para continuar de onde parou.</p>
          <FormEntrar acao={entrar} />
        </div>
      </section>
    </Pagina>
  );
}
