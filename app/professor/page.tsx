import Link from 'next/link';
import type { Metadata } from 'next';
import { alunoAtual } from '../../lib/sessao.ts';
import { portalDoProfessor } from '../../lib/professor.ts';
import { listarFaturas } from '../../lib/portal-financeiro.ts';
import { dominioBase } from '../../lib/portal.ts';
import { brl } from '../../lib/precos.ts';

export const metadata: Metadata = { title: 'Painel do professor' };

const CHIP: Record<string, string> = {
  ATIVO: 'chip-secundaria', RASCUNHO: 'chip-neutra', SUSPENSO: 'chip-erro', ENCERRADO: 'chip-neutra',
  APROVADA: 'chip-secundaria', EM_ANALISE: 'chip-terciaria', PENDENTE: 'chip-neutra', RECUSADA: 'chip-erro',
};
const DATA = (d: Date | null) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');

export default async function VisaoGeralProfessor() {
  const u = (await alunoAtual())!;
  const portal = (await portalDoProfessor(u.id))!;
  const faturas = (await listarFaturas(portal.id)).filter((f) => f.status !== 'PAGA' && f.status !== 'CANCELADA');
  const endereco = `${portal.mascara}.${dominioBase()}`;

  const passos = [
    { feito: portal.status === 'ATIVO', texto: 'Portal ativo (1ª mensalidade paga)' },
    { feito: portal.subcontaSituacao === 'APROVADA', texto: 'Conta de recebimento aprovada — é o que abre a venda' },
    { feito: Boolean(portal.personalizacao.chamada), texto: 'Página personalizada (chamada, propósito, contato)', href: '/professor/site' },
    { feito: portal.aulasPublicadas > 0, texto: 'Primeira aula publicada, com exercício', href: '/professor/cursos' },
  ];

  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">Olá, {u.nome.split(' ')[0]}</h1>
          <p className="suave">
            <a href={`http://${endereco}`} target="_blank" rel="noreferrer"><code>{endereco}</code></a>
            {' '}· plano {portal.planoNome ?? '—'}
          </p>
        </div>
        <div className="acoes">
          <a className="btn btn-primario" href={`http://${endereco}`} target="_blank" rel="noreferrer">Ver meu portal</a>
        </div>
      </div>

      {portal.status === 'SUSPENSO' && (
        <p className="alerta alerta-erro">
          <strong>Seu portal está suspenso por fatura em atraso.</strong> Visitantes não veem
          o catálogo e novas vendas estão bloqueadas; seus alunos com licença continuam
          assistindo. Pague a fatura em <Link href="/professor/financeiro">Financeiro</Link> e
          o portal volta ao ar na hora.
        </p>
      )}
      {portal.subcontaSituacao === 'RECUSADA' && (
        <p className="alerta alerta-erro">
          <strong>Sua conta de recebimento foi recusada pelo meio de pagamento.</strong> Fale
          com o suporte para entender o motivo — sem ela o portal não vende.
        </p>
      )}

      <div className="grade-4" style={{ marginBottom: 24 }}>
        <div className="cartao">
          <span className="label-md suave">PORTAL</span>
          <div><span className={`chip ${CHIP[portal.status]}`}>{portal.status.toLowerCase()}</span></div>
          <p className="caption suave">no ar desde {DATA(portal.publicadoEm)}</p>
        </div>
        <div className="cartao">
          <span className="label-md suave">RECEBIMENTO</span>
          <div><span className={`chip ${CHIP[portal.subcontaSituacao]}`}>{portal.subcontaSituacao.toLowerCase().replace('_', ' ')}</span></div>
          <p className="caption suave">
            {portal.subcontaSituacao === 'APROVADA'
              ? `retenção de ${portal.escrowDias} dias (prazo de reembolso do aluno)`
              : 'a venda abre quando aprovar'}
          </p>
        </div>
        <div className="cartao">
          <span className="label-md suave">ACERVO</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>{portal.aulasPublicadas}</div>
          <p className="caption suave">aula(s) no ar em {portal.materias} curso(s)</p>
        </div>
        <div className="cartao">
          <span className="label-md suave">ALUNOS</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>{portal.alunos}</div>
          <p className="caption suave">na sua base — ela é sua</p>
        </div>
      </div>

      <div className="grade-2">
        <div className="cartao">
          <h2 className="headline-md" style={{ marginBottom: 12 }}>Próximos passos</h2>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
            {passos.map((p) => (
              <li key={p.texto} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className={`chip chip-sm ${p.feito ? 'chip-secundaria' : 'chip-neutra'}`}>{p.feito ? 'feito' : 'a fazer'}</span>
                <span>{p.href && !p.feito ? <Link href={p.href}>{p.texto}</Link> : p.texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="cartao">
          <h2 className="headline-md" style={{ marginBottom: 12 }}>Seu contrato</h2>
          {portal.contrato ? (
            <p>
              <strong>{brl(portal.contrato.licencaMensalCentavos)}/mês</strong> +{' '}
              <strong>{Number(portal.contrato.percentualBase)}%</strong> sobre cada venda no portal
              (+{Number(portal.contrato.acrescimoIndicacaoPp)} p.p. só na 1ª compra de aluno que a
              plataforma trouxer por anúncio). Curso seu vendido na vitrine da plataforma: você
              recebe <strong>{Number(portal.contrato.comissaoVitrinePp)}%</strong>.
              <br /><span className="caption suave">aceito em {DATA(portal.contrato.aceitoEm)}</span>
            </p>
          ) : <p className="suave">Sem contrato vigente — fale com o suporte.</p>}
          {faturas.length > 0 && (
            <p className="aviso" style={{ marginTop: 14 }}>
              <strong>{faturas.length} fatura(s) em aberto.</strong>{' '}
              <Link href="/professor/financeiro">Ver e pagar</Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
