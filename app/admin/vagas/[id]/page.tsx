import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import FormVaga from '../FormVaga.tsx';
import AcoesVaga from '../AcoesVaga.tsx';
import {
  acaoEditarVaga, acaoPublicarVaga, acaoRecusarVaga,
  acaoPausarVaga, acaoRetomarVaga, acaoReporVaga,
} from '../acoes.ts';
import { buscarVaga } from '../../../../lib/admin-vagas.ts';
import { ROTULO_STATUS } from '../../../../lib/vagas-rotulos.ts';

export const metadata: Metadata = { title: 'Editar vaga — Administração' };
export const dynamic = 'force-dynamic';

const DATA = (d: Date | null) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');

export default async function EditarVaga(
  { params, searchParams }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ criada?: string }>;
  },
) {
  const { id } = await params;
  const { criada } = await searchParams;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  const vaga = await buscarVaga(numero);
  if (!vaga) notFound();

  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">{vaga.titulo}</h1>
          <p className="suave">
            {vaga.empresa} · {ROTULO_STATUS[vaga.status]}
            {vaga.expiraEm && ` · expira em ${DATA(vaga.expiraEm)}`}
          </p>
        </div>
        <div className="acoes">
          {vaga.noAr && (
            <Link className="btn btn-contorno" href={`/vagas/${vaga.id}`} target="_blank">
              Ver no mural
            </Link>
          )}
          <Link className="btn btn-contorno" href="/admin/vagas">Voltar</Link>
        </div>
      </div>

      {criada && (
        <p className="alerta alerta-ok" role="status">
          Vaga cadastrada e na fila de moderação. Aprove abaixo para colocá-la no ar.
        </p>
      )}

      <div className="cartao">
        <h2 className="headline-md" style={{ marginBottom: 6 }}>Moderação</h2>
        <p className="caption suave" style={{ marginBottom: 16 }}>
          A vigência começa a correr na aprovação e vai até 90 dias — o teto de 3 meses do
          §5.7.1 é o que impede a vaga fantasma perpétua.
        </p>
        <AcoesVaga
          vaga={{
            id: vaga.id, status: vaga.status,
            moderadaPor: vaga.moderadaPor,
            moderadaEm: vaga.moderadaEm ? DATA(vaga.moderadaEm) : null,
          }}
          publicar={acaoPublicarVaga}
          recusar={acaoRecusarVaga}
          pausar={acaoPausarVaga}
          retomar={acaoRetomarVaga}
          repor={acaoReporVaga}
        />
        {vaga.motivoRecusa && (
          <p className="alerta alerta-erro" style={{ marginTop: 16 }}>
            Recusada: {vaga.motivoRecusa}
          </p>
        )}
      </div>

      <div className="cartao" style={{ marginBottom: 0 }}>
        <h2 className="headline-md" style={{ marginBottom: 16 }}>Dados da vaga</h2>
        <FormVaga acao={acaoEditarVaga} vaga={vaga} />
      </div>
    </>
  );
}
