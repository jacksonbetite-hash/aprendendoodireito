import type { Metadata } from 'next';
import { FormSite } from '../../admin/portais/Formularios.tsx';
import Enviar from '../Enviar.tsx';
import FormDominio from './FormDominio.tsx';
import { acaoSalvarSite, acaoDefinirDominio, acaoVerificarDominio } from '../acoes.ts';
import { alunoAtual } from '../../../lib/sessao.ts';
import { portalDoProfessor } from '../../../lib/professor.ts';
import { situacaoDominio } from '../../../lib/portal-dominio.ts';
import { dominioBase } from '../../../lib/portal.ts';
import { brl } from '../../../lib/precos.ts';

export const metadata: Metadata = { title: 'Minha página — Painel do professor' };

export default async function MinhaPagina() {
  const u = (await alunoAtual())!;
  const portal = (await portalDoProfessor(u.id))!;
  const dominio = await situacaoDominio(portal.id);
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
      <div className="cartao" style={{ marginBottom: 24 }}>
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Foto de apresentação</h2>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {portal.personalizacao.foto && (
            <img src={portal.personalizacao.foto} alt="Foto atual" width={120} height={120}
                 style={{ borderRadius: 16, objectFit: 'cover' }} />
          )}
          <div style={{ flex: 1, minWidth: 260 }}>
            <Enviar tipo="imagem" rotulo="Enviar foto" aceita="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    dica="JPG, PNG ou WebP, até 5 MB. Aparece na abertura da sua página." />
          </div>
        </div>
      </div>

      <div className="cartao" style={{ marginBottom: 24 }}>
        <FormSite acao={acaoSalvarSite} portalId={portal.id} personalizacao={portal.personalizacao} />
      </div>

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Domínio próprio</h2>
        {dominio.centavosMes === null ? (
          <p className="suave">
            Seu plano não inclui domínio próprio. O portal continua em{' '}
            <code>{portal.mascara}.{dominioBase()}</code>.
          </p>
        ) : (
          <>
            <p className="suave" style={{ marginBottom: 16 }}>
              Além de <code>{portal.mascara}.{dominioBase()}</code>, o portal pode responder no seu
              endereço — <code>cursos.seudominio.com.br</code>, por exemplo.
            </p>
            <FormDominio
              acaoDefinir={acaoDefinirDominio} acaoVerificar={acaoVerificarDominio}
              dominio={dominio.dominio} esperado={dominio.esperado}
              verificadoEm={dominio.verificadoEm ? dominio.verificadoEm.toLocaleDateString('pt-BR') : null}
              precoMes={brl(dominio.centavosMes)} />
          </>
        )}
      </div>
    </>
  );
}
