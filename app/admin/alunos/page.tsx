import type { Metadata } from 'next';
import { listarAlunos } from '../../../lib/admin.ts';

export const metadata: Metadata = { title: 'Alunos — Administração' };

const DATA = (d: Date | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

/** Dias sem login — o relógio do bloqueio por inatividade (§6.5). */
function inatividade(ultimo: Date | null): { dias: number | null; alerta: boolean } {
  if (!ultimo) return { dias: null, alerta: false };
  const dias = Math.floor((Date.now() - new Date(ultimo).getTime()) / 86_400_000);
  return { dias, alerta: dias >= 300 };
}

export default async function Alunos(
  { searchParams }: { searchParams: Promise<{ q?: string }> },
) {
  const { q = '' } = await searchParams;
  const alunos = await listarAlunos(q);

  return (
    <>
      <h1>Alunos</h1>
      <p className="sub">{alunos.length} {alunos.length === 1 ? 'conta' : 'contas'}{q && ` para “${q}”`}.</p>

      <form className="searchbar" style={{ maxWidth: '520px' }}>
        <span>🔎</span>
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" aria-label="Buscar aluno" />
      </form>

      <div className="panel">
        <table className="tabela">
          <thead>
            <tr><th>Aluno</th><th>Conta</th><th>Licenças</th><th>Cadastro</th><th>Último acesso</th></tr>
          </thead>
          <tbody>
            {alunos.map((a) => {
              const inat = inatividade(a.ultimoLoginEm);
              return (
                <tr key={a.id}>
                  <td><strong>{a.nome}</strong><br /><span className="suave">{a.email}</span></td>
                  <td>
                    <span className={`pill ${a.statusConta === 'ATIVA' ? 'free' : 'locked'}`}>
                      {a.statusConta.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{a.licencasAtivas > 0 ? `${a.licencasAtivas} vigente(s)` : <span className="suave">nenhuma</span>}</td>
                  <td className="suave nowrap">{DATA(a.criadoEm)}</td>
                  <td className="nowrap">
                    {DATA(a.ultimoLoginEm)}
                    {inat.dias !== null && (
                      <span className={inat.alerta ? 'pill soon' : 'suave'} style={{ marginLeft: '.4rem' }}>
                        {inat.dias}d
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {alunos.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state">Nenhum aluno encontrado.</div></td></tr>
            )}
          </tbody>
        </table>
        <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.8rem' }}>
          Contas sem login há 12 meses são bloqueadas de forma reversível (§6.5). A coluna de
          último acesso marca em âmbar quem passou de 300 dias — a régua de avisos começa aos 10 meses.
        </p>
      </div>
    </>
  );
}
