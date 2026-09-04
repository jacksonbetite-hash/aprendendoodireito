import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina, Icone } from '../../../componentes.tsx';
import CopiarCodigo from '../../../checkout/[referencia]/CopiarCodigo.tsx';
import { alunoAtual } from '../../../../lib/sessao.ts';
import { faturaDoProfessor } from '../../../../lib/portal-assinatura.ts';
import { provedorAtual } from '../../../../lib/pagamento.ts';
import { dominioBase } from '../../../../lib/portal.ts';
import { brl } from '../../../../lib/precos.ts';

export const metadata: Metadata = { title: 'Pagamento do portal' };
export const dynamic = 'force-dynamic';

/**
 * A tela de pagamento da fatura do portal — irmã de /checkout/[referencia],
 * com dois finais diferentes: a fatura paga não libera uma licença, ela
 * PÕE UM SITE NO AR (§5.10.2, etapa 1) e conta o passo seguinte, a conta
 * de recebimento em análise (etapa 2).
 */
export default async function PagamentoPortal(
  { params }: { params: Promise<{ referencia: string }> },
) {
  const { referencia } = await params;
  const professor = await alunoAtual();
  if (!professor) redirect(`/entrar?destino=/para-professores/pagamento/${referencia}`);

  const fatura = await faturaDoProfessor(referencia, professor.id);
  if (!fatura) notFound();

  const provedor = provedorAtual();
  const paga = fatura.status === 'PAGA';
  const endereco = `${fatura.mascara}.${dominioBase()}`;
  const copiaECola = fatura.detalhe?.meio === 'PIX' && !paga
    ? (fatura.detalhe.copiaECola
       ?? `00020126580014BR.GOV.BCB.PIX0136${fatura.cobrancaExternaId ?? referencia}5204000053039865802BR5916APRIMORE O SABER6009SAO PAULO62070503***6304`)
    : null;
  const linkPagamento = fatura.detalhe?.linkPagamento ?? null;

  return (
    <Pagina>
      <section className="secao caixa-auth">
        <div className="cartao cartao-auth" style={{ width: 'min(560px, 92vw)' }}>
          {paga ? (
            <>
              <h1>Seu portal está no ar</h1>
              <p className="sub">
                <strong>{fatura.nomeExibicao}</strong> já responde em{' '}
                <a href={`http://${endereco}`} target="_blank" rel="noreferrer">
                  <strong>{endereco}</strong>
                </a>.
              </p>

              {fatura.subcontaSituacao !== 'APROVADA' && (
                <p className="aviso" style={{ marginBottom: 16 }}>
                  <strong>Falta um passo para vender:</strong> sua conta de recebimento
                  está em análise no meio de pagamento ({fatura.subcontaSituacao === 'RECUSADA'
                    ? 'foi recusada — fale com o suporte'
                    : 'costuma sair em 1 dia útil'}). Enquanto isso, prepare e publique
                  suas aulas — a venda abre sozinha quando a conta aprovar.
                </p>
              )}

              <div className="sabia">
                <div className="titulo"><Icone nome="lightbulb" tamanho={20} /> Próximos passos</div>
                Organize suas aulas por área e assunto e suba os vídeos. O aluno que
                comprar recebe o método completo: player protegido, a lei ao lado e
                exercício ao final.
              </div>
              <div className="pilha-sm" style={{ marginTop: 20 }}>
                <Link className="btn btn-primario btn-bloco" href="/professor">Ir para o meu painel</Link>
                <Link className="btn btn-contorno btn-bloco" href={`http://${endereco}`}>Ver meu portal</Link>
              </div>
            </>
          ) : (
            <>
              <h1>Falta só o pagamento</h1>
              <p className="sub">
                Fatura <strong>{fatura.referencia}</strong> · 1ª mensalidade de{' '}
                <strong>{fatura.nomeExibicao}</strong> ({endereco})
              </p>

              <div className="cartao" style={{ background: 'var(--surface-container-low)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="label-md suave">TOTAL</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--primary)' }}>
                    {brl(fatura.centavosTotal)}
                  </strong>
                </div>
              </div>

              {!provedor.cobraDeVerdade && (
                <p className="aviso" style={{ marginBottom: 20 }}>
                  <strong>Ambiente de demonstração.</strong> O provedor de pagamento é o
                  simulado: <strong>nenhuma cobrança real acontece</strong>.
                </p>
              )}

              {copiaECola ? (
                <>
                  <h2 className="headline-md" style={{ marginBottom: 8 }}>
                    <Icone nome="payments" /> Pague com Pix
                  </h2>
                  <p className="caption suave" style={{ marginBottom: 12 }}>
                    Copie o código e cole no aplicativo do seu banco. O portal vai ao ar
                    assim que o pagamento confirmar.
                  </p>
                  <CopiarCodigo codigo={copiaECola} />
                </>
              ) : (
                <>
                  <h2 className="headline-md" style={{ marginBottom: 8 }}>
                    <Icone nome="payments" /> Pagamento no cartão
                  </h2>
                  <p className="caption suave" style={{ marginBottom: 16 }}>
                    Os dados do cartão são capturados pelo gateway, nunca pelo nosso
                    servidor (PCI-DSS SAQ-A). A mensalidade renova sozinha.
                  </p>
                  {linkPagamento && (
                    <a className="btn btn-primario btn-bloco" href={linkPagamento} target="_blank" rel="noreferrer">
                      Pagar com cartão na página segura
                    </a>
                  )}
                </>
              )}

              <div className="sabia" style={{ marginTop: 20 }}>
                <div className="titulo"><Icone nome="lightbulb" tamanho={20} /> Como confirmar aqui</div>
                Este ambiente não tem gateway ligado. Para simular a confirmação que o
                banco enviaria, rode no terminal, na pasta do projeto:
                <code style={{ display: 'block', marginTop: 8, fontSize: 13, wordBreak: 'break-all' }}>
                  npm run confirmar-pagamento {fatura.referencia}
                </code>
              </div>

              <p className="caption suave" style={{ marginTop: 20 }}>
                Arrependeu? Devolução integral em até 7 dias (CDC, art. 49).
              </p>
            </>
          )}
        </div>
      </section>
    </Pagina>
  );
}
