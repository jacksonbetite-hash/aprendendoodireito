import type { Metadata } from 'next';
import { FormSite } from '../../admin/portais/Formularios.tsx';
import { acaoSalvarSite } from '../acoes.ts';
import { alunoAtual } from '../../../lib/sessao.ts';
import { portalDoProfessor } from '../../../lib/professor.ts';
import { dominioBase } from '../../../lib/portal.ts';

export const metadata: Metadata = { title: 'Minha página — Painel do professor' };

export default async function MinhaPagina() {
  const u = (await alunoAtual())!;
  const portal = (await portalDoProfessor(u.id))!;
  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">Minha página</h1>
          <p className="suave">
            O que aparece em <code>{portal.mascara}.{dominioBase()}</code>: abertura, propósito,
            quem ensina, contato e cor. O acervo e a oferta entram sozinhos.
          </p>
        </div>
      </div>
      <div className="cartao">
        <FormSite acao={acaoSalvarSite} portalId={portal.id} personalizacao={portal.personalizacao} />
      </div>
    </>
  );
}
