import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina, Icone } from '../../componentes.tsx';
import {
  buscarVaga, iniciais, local as localDa, desdeQuando, listaDeRequisitos,
  linkDeCandidatura, diasParaExpirar,
  ROTULO_TIPO, ROTULO_REGIME, ROTULO_MODALIDADE, ICONE_MODALIDADE,
} from '../../../lib/vagas.ts';

export const dynamic = 'force-dynamic';

const numero = (id: string) => (/^\d+$/.test(id) ? Number(id) : NaN);

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const vaga = Number.isNaN(numero(id)) ? null : await buscarVaga(numero(id));
  if (!vaga) return { title: 'Vaga não encontrada' };
  return {
    title: `${vaga.titulo} — ${vaga.empresa}`,
    description: vaga.descricao.slice(0, 160),
  };
}

export default async function DetalheVaga({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chave = numero(id);
  // Vaga expirada, pausada ou em moderação cai aqui como inexistente: a
  // página pública não é o lugar de anunciar que ela existiu.
  const vaga = Number.isNaN(chave) ? null : await buscarVaga(chave);
  if (!vaga) notFound();

  const dias = diasParaExpirar(vaga);
  const porEmail = !vaga.comoCandidatar.startsWith('http');

  return (
    <Pagina ativo="vagas">
      <section className="cabeca-materia">
        <div className="container">
          <div className="trilha-topo">
            <Link href="/vagas">Mural de vagas</Link>
            <Icone nome="chevron_right" tamanho={16} />
            <span>{vaga.titulo}</span>
          </div>

          <div className="vaga-cabeca">
            <span className="vaga-marca grande" aria-hidden="true">{iniciais(vaga.empresa)}</span>
            <div>
              <h1>{vaga.titulo}</h1>
              <p className="sub">{vaga.empresa}</p>
            </div>
          </div>

          <div className="vaga-etiquetas">
            {vaga.cidade && (
              <span className="chip chip-sm chip-contorno">
                <Icone nome="public" tamanho={15} /> {localDa(vaga)}
              </span>
            )}
            <span className="chip chip-sm chip-primaria">
              <Icone nome={ICONE_MODALIDADE[vaga.modalidade]} tamanho={15} />{' '}
              {ROTULO_MODALIDADE[vaga.modalidade]}
            </span>
            <span className="chip chip-sm chip-contorno">
              <Icone nome="schedule" tamanho={15} /> {ROTULO_REGIME[vaga.regime]}
            </span>
            <span className="chip chip-sm chip-contorno">
              <Icone nome="work" tamanho={15} /> {ROTULO_TIPO[vaga.tipo]}
            </span>
            <span className="chip chip-sm chip-neutra">
              Publicada {desdeQuando(vaga.publicadaEm).toLowerCase()}
            </span>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container vaga-grade">
          <div className="pilha-md">
            <div className="cartao">
              <h2 className="titulo-cartao">Sobre a vaga</h2>
              <p>{vaga.descricao}</p>
            </div>

            <div className="cartao">
              <h2 className="titulo-cartao">Requisitos</h2>
              <ul className="lista-check">
                {listaDeRequisitos(vaga).map((r) => (
                  <li key={r}><Icone nome="check" tamanho={18} /> {r}</li>
                ))}
              </ul>
            </div>

            <div className="cartao">
              <h2 className="titulo-cartao">Área de atuação</h2>
              <p>{vaga.areaAtuacao}</p>
            </div>
          </div>

          <aside className="pilha-md">
            <div className="cartao caixa-compra">
              <h2 className="titulo-cartao">Como se candidatar</h2>
              {vaga.faixaSalarial && (
                <p className="vaga-salario">{vaga.faixaSalarial}</p>
              )}
              <p className="caption suave">
                A candidatura é feita direto com o anunciante, fora da plataforma.
              </p>
              <a
                className="btn btn-primario btn-bloco"
                href={linkDeCandidatura(vaga)}
                target={porEmail ? undefined : '_blank'}
                rel={porEmail ? undefined : 'noopener noreferrer'}
              >
                {porEmail ? 'Enviar currículo por e-mail' : 'Abrir página da vaga'}
                <Icone nome="arrow_forward" tamanho={18} />
              </a>
              <p className="caption suave">
                {porEmail ? vaga.comoCandidatar : new URL(vaga.comoCandidatar).host}
              </p>
              <hr className="vade-regua" />
              <p className="caption suave">
                <Icone nome="timer" tamanho={16} />{' '}
                {dias === 0
                  ? 'Expira hoje'
                  : `Sai do ar em ${dias} ${dias === 1 ? 'dia' : 'dias'}`}{' '}
                — vigência máxima de 3 meses.
              </p>
            </div>

            <div className="cartao">
              <h3 className="titulo-cartao">Segurança</h3>
              <p className="caption suave">
                Nenhuma vaga legítima cobra taxa de inscrição, curso ou material. Não
                envie documentos pessoais antes da entrevista.
              </p>
              <Link className="link-seta" href="/planos#legal">
                Denunciar esta vaga <Icone nome="arrow_forward" tamanho={16} />
              </Link>
            </div>
          </aside>
        </div>

        <div className="container">
          <p className="mural-aviso">
            <Icone nome="info" tamanho={18} />
            Anúncio de responsabilidade de {vaga.empresa}. O Aprimore o Saber não
            intermedeia a contratação nem garante a veracidade das condições oferecidas.
          </p>
          <p className="centro">
            <Link className="btn btn-contorno btn-sm" href="/vagas">
              <Icone nome="arrow_back" tamanho={16} /> Voltar ao mural
            </Link>
          </p>
        </div>
      </section>
    </Pagina>
  );
}
