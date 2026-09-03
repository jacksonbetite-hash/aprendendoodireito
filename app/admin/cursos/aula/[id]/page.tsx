import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import FormAula from '../../FormAula.tsx';
import Exercicio from '../../Exercicio.tsx';
import {
  acaoEditarAula, acaoStatusAula, acaoSalvarQuestao, acaoExcluirQuestao,
} from '../../acoes.ts';
import { buscarAula, listarAssuntos, exercicioDaAula } from '../../../../../lib/admin-cursos.ts';
import { PORTAL_PLATAFORMA } from '../../../../../lib/portal.ts';

export const metadata: Metadata = { title: 'Aula — Administração' };
export const dynamic = 'force-dynamic';

export default async function Aula(
  { params, searchParams }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ portal?: string; criada?: string }>;
  },
) {
  const { id } = await params;
  const { portal = '', criada } = await searchParams;
  const portalId = portal !== '' && Number.isInteger(Number(portal))
    ? Number(portal) : PORTAL_PLATAFORMA;
  const aulaId = Number(id);
  if (!Number.isInteger(aulaId)) notFound();

  const aula = await buscarAula(portalId, aulaId);
  if (!aula) notFound();

  const [assuntos, questoes] = await Promise.all([
    listarAssuntos(portalId, aula.materiaId), exercicioDaAula(portalId, aulaId),
  ]);

  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">{aula.titulo}</h1>
          <p className="suave">
            {aula.materiaNome} · {aula.assuntoNome} · {questoes.length} questão(ões)
          </p>
        </div>
        <div className="acoes">
          {aula.status === 'publicado' && portalId === PORTAL_PLATAFORMA && (
            <Link className="btn btn-contorno" href={`/aula/${aula.slug}`} target="_blank">
              Ver no site
            </Link>
          )}
          <form action={acaoStatusAula}>
            <input type="hidden" name="portalId" value={portalId} />
            <input type="hidden" name="materiaId" value={aula.materiaId} />
            <input type="hidden" name="id" value={aula.id} />
            <input type="hidden" name="status"
              value={aula.status === 'publicado' ? 'rascunho' : 'publicado'} />
            <button className={`btn ${aula.status === 'publicado' ? 'btn-contorno' : 'btn-primario'}`}
              type="submit">
              {aula.status === 'publicado' ? 'Despublicar' : 'Publicar'}
            </button>
          </form>
          <Link className="btn btn-contorno"
            href={`/admin/cursos/${aula.materiaId}?portal=${portalId}`}>Voltar ao curso</Link>
        </div>
      </div>

      {criada && (
        <p className="alerta alerta-ok" role="status">
          Aula criada em <code>/aula/{aula.slug}</code>. Falta o exercício, logo abaixo.
        </p>
      )}

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 16 }}>Dados da aula</h2>
        <FormAula acao={acaoEditarAula} assuntos={assuntos} portalId={portalId} aula={aula} />
      </div>

      <div className="cartao" style={{ marginBottom: 0 }}>
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Exercício</h2>
        <p className="caption suave" style={{ marginBottom: 16 }}>
          Comentário em toda alternativa (§5.3) — inclusive nas erradas: é o que transforma o
          exercício em estudo, e não em gabarito. Questão já respondida por aluno não pode ser
          excluída: apagá-la levaria junto o caderno de erros de quem a respondeu.
        </p>
        <div style={{ display: 'grid', gap: 16 }}>
          <Exercicio questoes={questoes} portalId={portalId} aulaId={aulaId}
            salvar={acaoSalvarQuestao} excluir={acaoExcluirQuestao} />
        </div>
      </div>
    </>
  );
}
