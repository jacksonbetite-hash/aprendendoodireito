import Link from 'next/link';
import type { Metadata } from 'next';
import { Pagina } from '../componentes.tsx';
import SeletorPeriodo from './SeletorPeriodo.tsx';
import { economiaAnual } from '../../lib/precos.ts';

export const metadata: Metadata = {
  title: 'Planos e licenças',
  description: 'Licença por matéria ou passe completo, teste de 7 dias sem cartão, Pix ou cartão e cancelamento em 2 cliques.',
};

export default function Planos() {
  return (
    <Pagina>
      <section className="materia-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Início</Link> › Planos</div>
          <h1>Escolha o que você vai estudar — e pague só por isso</h1>
          <p className="sub">
            A licença é por matéria. Se for estudar várias, o passe completo sai mais em conta.
            Tudo o que está escrito aqui é o que vale na hora da compra (CDC, art. 30).
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <SeletorPeriodo economia={economiaAnual('passe')} />
          <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--ink-soft)', marginTop: '1.4rem' }}>
            Preços de referência — hipótese a validar antes do lançamento.
          </p>
        </div>
      </section>

      <section className="section tint">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Camadas de acesso</div>
            <h2>O que dá para fazer sem pagar nada</h2>
            <p>Boa parte da plataforma é aberta. Isso não é isca: é o conteúdo que traz gente para cá.</p>
          </div>
          <div className="grid-4">
            <div className="card">
              <div className="icon mint">🔓</div>
              <h3>Sem cadastro</h3>
              <p>Ementas de todas as matérias, <strong>vade-mécum completo</strong> e a 1ª aula de cada assunto.</p>
            </div>
            <div className="card">
              <div className="icon">🎁</div>
              <h3>Teste de 7 dias</h3>
              <p>Uma matéria, ~20% das aulas, até 30 exercícios. Um por CPF, sem cartão, sem renovação automática.</p>
            </div>
            <div className="card">
              <div className="icon sun">🎟️</div>
              <h3>Licença promocional</h3>
              <p>Por código, parceria ou campanha: acesso <strong>total</strong> a uma matéria pelo período da promoção.</p>
            </div>
            <div className="card">
              <div className="icon coral">🔑</div>
              <h3>Licença paga</h3>
              <p>Por matéria ou passe completo. As licenças somam: comprou o passe tendo uma matéria? As duas seguem valendo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="legal">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Pagamento e cancelamento</div>
            <h2>Sem pegadinha</h2>
          </div>
          <div className="grid-3">
            <div className="card">
              <div className="icon mint">📲</div>
              <h3>Pix ou cartão</h3>
              <p>Pix por QR ou copia-e-cola libera o acesso em segundos. No cartão, a renovação é automática — e avisamos 3 dias antes de cada cobrança.</p>
            </div>
            <div className="card">
              <div className="icon coral">↩️</div>
              <h3>7 dias para desistir</h3>
              <p>Comprou e não era o que esperava? Devolução integral em até 7 dias, sem justificativa, mesmo que já tenha assistido (CDC, art. 49).</p>
            </div>
            <div className="card">
              <div className="icon">✌️</div>
              <h3>Cancela em 2 cliques</h3>
              <p>No painel, com protocolo. O acesso continua até o fim do período já pago — e seu progresso fica guardado se você voltar.</p>
            </div>
          </div>

          <div className="notice" style={{ marginTop: '1.6rem' }}>
            👨‍👩‍👧 <strong>Menor de 18 anos?</strong> Pode estudar aqui, mas o cadastro precisa do aceite
            do responsável legal, e a compra é sempre feita no CPF do adulto responsável. Contas de
            menores não recebem publicidade dirigida por comportamento.
          </div>
        </div>
      </section>
    </Pagina>
  );
}
