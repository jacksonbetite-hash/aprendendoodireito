import Link from 'next/link';
import type { Metadata } from 'next';
import { Pagina, Icone, portalSuspenso, PortalSuspenso } from '../componentes.tsx';
import SeletorPeriodo from './SeletorPeriodo.tsx';
import { economia, brl } from '../../lib/precos.ts';
import { tabelaVigente } from '../../lib/precos-consultas.ts';
import { listarMateriasEmCache } from '../../lib/catalogo.ts';
import { alunoAtual, licencasDo } from '../../lib/sessao.ts';
import { acaoComprar, acaoAtivarTrial } from '../acoes-comerciais.ts';
import { portalIdAtual } from '../../lib/portal-consultas.ts';
import { planoDeLancamento } from '../../lib/portal-assinatura.ts';

export const metadata: Metadata = {
  title: 'Planos e licenças',
  description: 'Licença por curso ou passe completo, teste de 7 dias sem cartão, Pix ou cartão e cancelamento em 2 cliques.',
};

export const dynamic = 'force-dynamic';

export default async function Planos() {
  const portalId = await portalIdAtual();
  const [tabela, materias, aluno, planoPortal] = await Promise.all([
    tabelaVigente(portalId), listarMateriasEmCache(portalId), alunoAtual(),
    portalId === 0 ? planoDeLancamento() : Promise.resolve(null),
  ]);
  // §5.10 — portal suspenso não vende para visitante; aluno logado vê
  // seus planos (e a compra é barrada em abrirPedido de todo jeito).
  if (!aluno && await portalSuspenso()) return <PortalSuspenso />;
  const publicadas = materias
    .filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0)
    .map((m) => ({ id: m.id, nome: m.nome }));
  const licencas = aluno ? await licencasDo(aluno.id) : [];
  const temTrial = licencas.some((l) => l.origem === 'TRIAL');
  return (
    <Pagina ativo="planos">
      <section className="cabeca-materia">
        <div className="container">
          <div className="trilha-topo"><Link href="/">Início</Link><Icone nome="chevron_right" tamanho={16} /><span>Planos</span></div>
          <h1>Planos <em className="cor-marca">sob medida</em></h1>
          <p className="sub">
            A licença é por curso. Se for estudar vários, o passe completo sai mais em conta.
            Tudo o que está escrito aqui é o que vale na hora da compra (CDC, art. 30).
          </p>
        </div>
      </section>

      <section className="secao" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <SeletorPeriodo
            tabela={tabela}
            economiaAnual={economia(tabela, 'CATALOGO', 'anual')}
            materias={publicadas}
            logado={Boolean(aluno)}
            temTrial={temTrial}
            acaoComprar={acaoComprar}
            acaoTrial={acaoAtivarTrial}
          />
          <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--on-surface-variant)', marginTop: '1.4rem' }}>
            Preços de referência — hipótese a validar antes do lançamento.
          </p>
        </div>
      </section>

      <section className="secao tinta">
        <div className="container">
          <div className="secao-titulo">
            <h2>O que dá para fazer <em>sem pagar nada</em></h2>
            <p>Boa parte da plataforma é aberta. Isso não é isca: é o conteúdo que traz gente para cá.</p>
          </div>
          <div className="grade-4">
            <div className="cartao">
              <h3>Sem cadastro</h3>
              <p>Ementas de todos os cursos, <strong>biblioteca completa</strong> e a 1ª aula de cada assunto.</p>
            </div>
            <div className="cartao">
              <h3>Teste de 7 dias</h3>
              <p>Um curso, ~20% das aulas, até 30 exercícios. Um por CPF, sem cartão, sem renovação automática.</p>
            </div>
            <div className="cartao">
              <h3>Licença promocional</h3>
              <p>Por código, parceria ou campanha: acesso <strong>total</strong> a um curso pelo período da promoção.</p>
            </div>
            <div className="cartao">
              <h3>Licença paga</h3>
              <p>Por curso ou passe completo. As licenças somam: comprou o passe tendo um curso? Os dois seguem valendo.</p>
            </div>
          </div>
        </div>
      </section>

      {portalId === 0 && (
        <section className="secao" id="professores">
          <div className="container">
            <div className="chamada chamada-lado">
              <span className="bolha bolha-a" aria-hidden="true" />
              <span className="bolha bolha-b" aria-hidden="true" />
              <div className="chamada-texto">
                <h2>Para professores: o seu portal</h2>
                <p>
                  Seu site de aulas com endereço próprio, checkout e alunos seus —
                  {' '}{planoPortal ? <>por <strong>{brl(planoPortal.licencaMensalCentavos)}/mês + {Number(planoPortal.percentualBase)}% sobre as vendas</strong></> : 'contratação em minutos'}.
                  Exige CNPJ; o portal vai ao ar no dia da contratação.
                </p>
              </div>
              <Link className="btn btn-primario btn-lg" href="/para-professores">Conhecer e contratar</Link>
            </div>
          </div>
        </section>
      )}

      <section className="secao" id="legal">
        <div className="container">
          <div className="secao-titulo">
            <h2>Pagamento e cancelamento <em>sem pegadinha</em></h2>
          </div>
          <div className="grade-3">
            <div className="cartao">
              <h3>Pix ou cartão</h3>
              <p>Pix por QR ou copia-e-cola libera o acesso em segundos. No cartão, a renovação é automática — e avisamos 3 dias antes de cada cobrança.</p>
            </div>
            <div className="cartao">
              <h3>7 dias para desistir</h3>
              <p>Comprou e não era o que esperava? Devolução integral em até 7 dias, sem justificativa, mesmo que já tenha assistido (CDC, art. 49).</p>
            </div>
            <div className="cartao">
              <h3>Cancela em 2 cliques</h3>
              <p>No painel, com protocolo. O acesso continua até o fim do período já pago — e seu progresso fica guardado se você voltar.</p>
            </div>
          </div>

          <div className="sabia" style={{ marginTop: '1.6rem' }}>
            👨‍👩‍👧 <strong>Menor de 18 anos?</strong> Pode estudar aqui, mas o cadastro precisa do aceite
            do responsável legal, e a compra é sempre feita no CPF do adulto responsável. Contas de
            menores não recebem publicidade dirigida por comportamento.
          </div>
        </div>
      </section>
    </Pagina>
  );
}
