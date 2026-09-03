import Link from 'next/link';
import type { Metadata } from 'next';
import FormArea from '../../admin/cursos/FormArea.tsx';
import FormMateria from '../../admin/cursos/FormMateria.tsx';
import {
  acaoSalvarArea, acaoEditarAreaLinha, acaoExcluirArea, acaoCriarMateria, acaoStatusMateria,
} from '../acoes.ts';
import { listarAreas, listarMaterias } from '../../../lib/admin-cursos.ts';
import { alunoAtual } from '../../../lib/sessao.ts';
import { portalDoProfessor } from '../../../lib/professor.ts';

export const metadata: Metadata = { title: 'Cursos e aulas — Painel do professor' };

const CHIP: Record<string, string> = {
  publicado: 'chip-secundaria', rascunho: 'chip-neutra',
  em_revisao: 'chip-terciaria', aprovado: 'chip-primaria', arquivado: 'chip-neutra',
};

/**
 * O acervo do professor: áreas → cursos. Mesmos formulários da
 * retaguarda; o portal vem da sessão (acoes.ts), nunca do formulário.
 */
export default async function CursosDoProfessor() {
  const u = (await alunoAtual())!;
  const portal = (await portalDoProfessor(u.id))!;
  const [areas, materias] = await Promise.all([listarAreas(portal.id), listarMaterias(portal.id)]);

  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">Cursos e aulas</h1>
          <p className="suave">
            {areas.length} área(s) · {materias.length} curso(s). Publicação é direta — o
            conteúdo publicado é de sua responsabilidade (contrato).
          </p>
        </div>
      </div>

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Áreas</h2>
        <p className="caption suave" style={{ marginBottom: 16 }}>
          Como o seu acervo se organiza na página do portal. Crie as suas — não precisa
          seguir as da plataforma.
        </p>
        <FormArea acao={acaoSalvarArea} portalId={portal.id} />
        <table className="tabela" style={{ marginTop: 16 }}>
          <thead><tr><th>Área</th><th>Cursos</th><th>Ordem e ações</th></tr></thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.nome}</strong><br /><span className="suave mono">{a.slug}</span></td>
                <td>{a.materias || <span className="suave">nenhum</span>}</td>
                <td>
                  <div className="acoes-linha">
                    <form action={acaoEditarAreaLinha} className="acoes-linha">
                      <input type="hidden" name="id" value={a.id} />
                      <input name="nome" defaultValue={a.nome} aria-label={`Nome de ${a.nome}`}
                        style={{ width: 200, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)' }} />
                      <input name="ordem" type="number" defaultValue={a.ordem} aria-label={`Ordem de ${a.nome}`}
                        style={{ width: 72, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--outline-variant)' }} />
                      <button className="btn btn-contorno btn-sm" type="submit">Salvar</button>
                    </form>
                    {a.materias === 0 && (
                      <form action={acaoExcluirArea}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="btn btn-contorno btn-sm" type="submit">Excluir</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {areas.length === 0 && <tr><td colSpan={3}><div className="vazio">Crie a primeira área — o curso precisa de uma.</div></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 16 }}>Cursos</h2>
        <table className="tabela">
          <thead><tr><th>Curso</th><th>Área</th><th>Aulas no ar</th><th>Situação</th><th>Vitrine</th><th>Ações</th></tr></thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link href={`/professor/cursos/${m.id}`} style={{ color: 'var(--primary-texto)', fontWeight: 700 }}>{m.nome}</Link>
                  <br /><span className="suave">/materia/{m.slug}</span>
                </td>
                <td>{m.areaNome}</td>
                <td className="apertado">{m.aulasPublicadas}/{m.aulas}</td>
                <td><span className={`chip chip-sm ${CHIP[m.status]}`}>{m.status.replace('_', ' ')}</span></td>
                <td>{m.naVitrinePlataforma ? <span className="chip chip-sm chip-terciaria">na plataforma</span> : <span className="suave">só no portal</span>}</td>
                <td>
                  <form action={acaoStatusMateria}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value={m.status === 'publicado' ? 'rascunho' : 'publicado'} />
                    <button className={`btn btn-sm ${m.status === 'publicado' ? 'btn-contorno' : 'btn-primario'}`} type="submit">
                      {m.status === 'publicado' ? 'Despublicar' : 'Publicar'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {materias.length === 0 && <tr><td colSpan={6}><div className="vazio">Nenhum curso ainda.</div></td></tr>}
          </tbody>
        </table>
      </div>

      {areas.length > 0 && (
        <div className="cartao" style={{ marginBottom: 0 }}>
          <h2 className="headline-md" style={{ marginBottom: 16 }}>Novo curso</h2>
          <FormMateria acao={acaoCriarMateria} areas={areas} portalId={portal.id} ehPlataforma={false} />
        </div>
      )}
    </>
  );
}
