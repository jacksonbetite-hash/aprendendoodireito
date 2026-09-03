import Link from 'next/link';
import type { Metadata } from 'next';
import FormVaga from '../FormVaga.tsx';
import { acaoCriarVaga } from '../acoes.ts';

export const metadata: Metadata = { title: 'Nova vaga — Administração' };
export const dynamic = 'force-dynamic';

export default function NovaVaga() {
  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">Nova vaga</h1>
          <p className="suave">
            A vaga entra na fila de moderação, mesmo cadastrada aqui dentro — a aprovação é um
            ato separado, com nome e data (§5.7.1).
          </p>
        </div>
        <div className="acoes">
          <Link className="btn btn-contorno" href="/admin/vagas">Voltar</Link>
        </div>
      </div>

      <div className="cartao">
        <FormVaga acao={acaoCriarVaga} />
      </div>
    </>
  );
}
