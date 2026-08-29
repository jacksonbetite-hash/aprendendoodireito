import Link from 'next/link';
import type { Metadata } from 'next';
import { Icone } from '../componentes.tsx';
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

  const indicadores = [
    { rotulo: 'Alunos cadastrados', valor: String(resumo?.alunos ?? 0), icone: 'school',
      selo: 'selo-secundaria', nota: 'contas com papel de aluno' },
    { rotulo: 'Licenças vigentes', valor: String(resumo?.licencasAtivas ?? 0), icone: 'verified_user',
      selo: 'selo-primaria', destaque: true, nota: `${resumo?.trials ?? 0} são testes em andamento` },
    { rotulo: 'Matérias publicadas', valor: String(resumo?.materiasPublicadas ?? 0), icone: 'menu_book',
      selo: 'selo-terciaria', nota: 'com exercício completo' },
    { rotulo: 'Exercícios em 7 dias', valor: String(resumo?.respostas7d ?? 0), icone: 'edit_note',
      selo: 'selo-neutra', nota: 'respostas registradas' },
  ];

  return (
    <>
      <h1 className="headline-lg">Visão geral</h1>
      <p className="suave">O que está acontecendo na operação agora.</p>

      <div className="grade-4">
        {indicadores.map((i) => (
          <div className="cartao indicador" key={i.rotulo}>
            <span className={`selo ${i.selo}`}><Icone nome={i.icone} /></span>
            <div className="rotulo">{i.rotulo}</div>
            <div className={`valor${i.destaque ? ' destaque' : ''}`}>{i.valor}</div>
            <div className="nota">{i.nota}</div>
          </div>
        ))}
      </div>

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Tabela de valores</h2>
        <p className="caption suave" style={{ marginBottom: 16 }}>
          Matéria avulsa a <strong>{brl(tabela.MATERIA.mensal)}</strong>/mês ·
          passe completo a <strong>{brl(tabela.CATALOGO.mensal)}</strong>/mês.{' '}
          <Link href="/admin/precos" style={{ color: 'var(--primary)', fontWeight: 700 }}>Alterar</Link>
        </p>
      </div>

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Auditoria recente</h2>
        <p className="caption suave" style={{ marginBottom: 16 }}>
          Alteração de preço e concessão de licença são registradas por exigência do §5.9 —
          quem fez, o quê e quando.
        </p>
        {auditoria.length === 0 ? (
          <div className="vazio">Nenhuma alteração administrativa ainda.</div>
        ) : (
          <table className="tabela">
            <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhe</th></tr></thead>
            <tbody>
              {auditoria.map((a) => (
                <tr key={a.id}>
                  <td className="apertado suave">{QUANDO(a.criadoEm)}</td>
                  <td>{a.ator}</td>
                  <td><span className="chip chip-neutra">{a.acao}</span></td>
                  <td className="mono">{JSON.stringify(a.detalhe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="aviso">
        <strong>Ainda fora do admin:</strong> financeiro e conciliação com gateway (§8),
        cadastro de professores e fechamento de contas (§5.6), anunciantes (§5.7) e moderação
        do mural de vagas (§5.7.1). O §10 também pede <strong>2FA obrigatório</strong> para
        admin e professor — não implementado.
      </div>
    </>
  );
}
