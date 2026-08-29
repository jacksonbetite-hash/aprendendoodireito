import Link from 'next/link';
import type { Metadata } from 'next';
import { Marca } from '../componentes.tsx';
import {
  alunoAtual, licencasDo, progressoPorMateria, continuarDeOndeParou,
  estatisticas, cadernoDeErros,
} from '../../lib/sessao.ts';
import { licencaVigente } from '../../lib/licenca.ts';
import { formatarDuracao } from '../../lib/catalogo.ts';

export const metadata: Metadata = { title: 'Painel do aluno' };
export const dynamic = 'force-dynamic';

const DATA = (d: Date) => new Date(d).toLocaleDateString('pt-BR');

export default async function Painel() {
  const aluno = await alunoAtual();

  if (!aluno) {
    return (
      <main className="container" style={{ padding: '4rem 0' }}>
        <h1>Entre para ver seu painel</h1>
        <p style={{ color: 'var(--ink-soft)', margin: '.6rem 0 1.4rem' }}>
          A autenticação (e-mail, magic link e Google) entra junto com o checkout.
        </p>
        <Link className="btn btn-primary" href="/">Voltar ao início</Link>
      </main>
    );
  }

  const [licencas, progresso, continuar, stats, erros] = await Promise.all([
    licencasDo(aluno.id), progressoPorMateria(aluno.id), continuarDeOndeParou(aluno.id),
    estatisticas(aluno.id), cadernoDeErros(aluno.id),
  ]);

  const agora = new Date();
  const ativas = licencas.filter((l) =>
    licencaVigente({ ...l, inicioEm: new Date(l.inicioEm), fimEm: new Date(l.fimEm) }, agora),
  );
  const trial = ativas.find((l) => l.origem === 'TRIAL');
  const diasDeTrial = trial
    ? Math.max(0, Math.ceil((new Date(trial.fimEm).getTime() - agora.getTime()) / 86_400_000))
    : null;

  return (
    <div className="app-body">
      <div className="app-shell">
        <aside className="sidebar">
          <Marca claro />
          <div className="side-link active">🏠 Início</div>
          <Link className="side-link" href="/catalogo">📚 Minhas matérias</Link>
          <div className="side-link">🔁 Caderno de erros</div>
          <Link className="side-link" href="/vademecum">📖 Vade-mécum</Link>
          <div className="side-link">💳 Minha conta</div>
        </aside>

        <main className="app-main">
          <h1>Oi, {aluno.nome.split(' ')[0]} 👋</h1>
          <p className="sub">
            {diasDeTrial !== null
              ? `Seu teste gratuito termina em ${diasDeTrial} ${diasDeTrial === 1 ? 'dia' : 'dias'}.`
              : 'Bom estudo. Continue de onde parou.'}
          </p>

          {continuar && (
            <Link className="continue-card" href={`/aula/${continuar.slug}`}>
              <span className="thumb">▶</span>
              <div className="info">
                <div className="k">Continue de onde parou</div>
                <h2>{continuar.titulo}</h2>
                <div className="bar">
                  <i style={{ width: `${Math.round((continuar.segundosAssistidos / continuar.duracaoSegundos) * 100)}%` }} />
                </div>
                <p style={{ fontSize: '.82rem', opacity: .85, marginTop: '.4rem' }}>
                  {formatarDuracao(continuar.segundosAssistidos)} de {formatarDuracao(continuar.duracaoSegundos)} · {continuar.materiaNome}
                </p>
              </div>
              <span className="btn btn-accent">Retomar aula</span>
            </Link>
          )}

          <div className="stat-row">
            <div className="stat">
              <strong>{progresso.reduce((s, p) => s + p.aulasConcluidas, 0)} de {progresso.reduce((s, p) => s + p.aulasTotal, 0)}</strong>
              <span>aulas concluídas nas suas matérias</span>
            </div>
            <div className="stat">
              <strong>{stats.respondidas}</strong>
              <span>exercícios respondidos · {stats.percentual}% de acerto</span>
            </div>
            <div className="stat">
              <strong>{ativas.length}</strong>
              <span>{ativas.length === 1 ? 'licença ativa' : 'licenças ativas'}</span>
            </div>
          </div>

          <div className="panel">
            <h2>Seu progresso</h2>
            {progresso.length === 0 && (
              <p className="empty-state">
                Você ainda não tem matéria liberada. Comece pelo teste gratuito de 7 dias.
              </p>
            )}
            {progresso.map((p) => (
              <div className="prog-row" key={p.materiaSlug}>
                <span className="nome">
                  <Link href={`/materia/${p.materiaSlug}`}>{p.materiaNome}</Link>
                </span>
                <span className="bar"><i style={{ width: `${p.percentual}%` }} /></span>
                <span className="pct">{p.percentual}%</span>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Suas licenças</h2>
            {licencas.map((l) => {
              const vigente = licencaVigente(
                { ...l, inicioEm: new Date(l.inicioEm), fimEm: new Date(l.fimEm) }, agora,
              );
              return (
                <div className="lic-row" key={l.id}>
                  <span>
                    <strong>
                      {l.escopo === 'CATALOGO' ? 'Passe completo' : l.materiaNome}
                    </strong>
                    <br />
                    <span style={{ color: 'var(--ink-soft)', fontSize: '.83rem' }}>
                      Escopo: {l.escopo.toLowerCase()} · Origem: {l.origem.toLowerCase()}
                      {l.campanhaNome && ` (${l.campanhaNome})`} · Vence em {DATA(l.fimEm)}
                    </span>
                  </span>
                  <span style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                    <span className={`pill ${vigente ? (l.origem === 'TRIAL' ? 'wave' : 'free') : 'locked'}`}>
                      {vigente ? 'Ativa' : l.status.toLowerCase()}
                    </span>
                    {l.origem === 'TRIAL' && vigente && (
                      <Link className="btn btn-primary btn-sm" href="/planos">Assinar matéria</Link>
                    )}
                  </span>
                </div>
              );
            })}
            <p style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.9rem' }}>
              Licenças somam, nunca se anulam. Ao assinar o passe completo, as suas licenças de
              matéria continuam valendo até expirar.
            </p>
          </div>

          <div className="panel">
            <h2>🔁 Caderno de erros</h2>
            {erros.length === 0 ? (
              <div className="empty-state">
                Você ainda não errou nenhuma questão — quando errar, ela aparece aqui para revisar.
              </div>
            ) : (
              erros.map((e) => (
                <div className="lic-row" key={e.questaoId}>
                  <span>
                    {e.enunciado}
                    <br />
                    <span style={{ color: 'var(--ink-soft)', fontSize: '.83rem' }}>{e.aulaTitulo}</span>
                  </span>
                  <Link className="btn btn-outline btn-sm" href={`/aula/${e.aulaSlug}`}>Refazer</Link>
                </div>
              ))
            )}
          </div>

          <div className="panel" style={{ marginBottom: 0 }}>
            <h2>💳 Minha conta</h2>
            <div className="lic-row">
              <span>Meio de pagamento: <strong>nenhum cadastrado</strong></span>
              <span className="btn btn-outline btn-sm">Adicionar Pix ou cartão</span>
            </div>
            <div className="lic-row">
              <span>Cancelamento de assinatura — 2 cliques, com protocolo</span>
              <span className="btn btn-outline btn-sm">Cancelar assinatura</span>
            </div>
            <div className="lic-row" style={{ borderBottom: 0 }}>
              <span>Seus dados (LGPD): acessar, corrigir, exportar ou excluir</span>
              <span className="btn btn-outline btn-sm">Abrir meus dados</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
