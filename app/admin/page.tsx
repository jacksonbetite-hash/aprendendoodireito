import Link from 'next/link';
import type { Metadata } from 'next';
import { resumoOperacao, listarAuditoria } from '../../lib/admin.ts';
import { brl } from '../../lib/precos.ts';
import { tabelaVigente } from '../../lib/precos-consultas.ts';

export const metadata: Metadata = { title: 'Administração' };

const QUANDO = (d: Date) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default async function VisaoGeral() {
  const [resumo, auditoria, tabela] = await Promise.all([
    resumoOperacao(), listarAuditoria(12), tabelaVigente(),
  ]);

  return (
    <>
      <h1>Visão geral</h1>
      <p className="sub">O que está acontecendo na operação agora.</p>

      <div className="stat-row">
        <div className="stat"><strong>{resumo?.alunos ?? 0}</strong><span>alunos cadastrados</span></div>
        <div className="stat"><strong>{resumo?.licencasAtivas ?? 0}</strong><span>licenças vigentes</span></div>
        <div className="stat"><strong>{resumo?.trials ?? 0}</strong><span>testes em andamento</span></div>
      </div>
      <div className="stat-row">
        <div className="stat"><strong>{resumo?.materiasPublicadas ?? 0}</strong><span>matérias publicadas</span></div>
        <div className="stat"><strong>{resumo?.respostas7d ?? 0}</strong><span>exercícios respondidos em 7 dias</span></div>
        <div className="stat">
          <strong>{brl(tabela.MATERIA.mensal)}</strong>
          <span>matéria avulsa · <Link href="/admin/precos" style={{ color: 'var(--brand-700)', fontWeight: 700 }}>alterar</Link></span>
        </div>
      </div>

      <div className="panel">
        <h2>Auditoria recente</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginBottom: '.8rem' }}>
          Alteração de preço e concessão de licença são registradas por exigência do §5.9 — quem
          fez, o quê e quando.
        </p>
        {auditoria.length === 0 ? (
          <div className="empty-state">Nenhuma alteração administrativa ainda.</div>
        ) : (
          <table className="tabela">
            <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhe</th></tr></thead>
            <tbody>
              {auditoria.map((a) => (
                <tr key={a.id}>
                  <td className="nowrap">{QUANDO(a.criadoEm)}</td>
                  <td>{a.ator}</td>
                  <td><span className="pill">{a.acao}</span></td>
                  <td className="mono">{JSON.stringify(a.detalhe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="notice">
        ⚠️ <strong>Ainda fora do admin:</strong> financeiro e conciliação com gateway (§8),
        cadastro de professores e fechamento de contas (§5.6), anunciantes (§5.7). O §10 também
        pede <strong>2FA obrigatório</strong> para admin e professor — não implementado.
      </div>
    </>
  );
}
