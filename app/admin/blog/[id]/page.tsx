import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import FormPost from '../FormPost.tsx';
import { acaoEditarPost } from '../acoes.ts';
import { buscarPost, listarCategorias } from '../../../../lib/admin-blog.ts';

export const metadata: Metadata = { title: 'Editar artigo — Administração' };
export const dynamic = 'force-dynamic';

export default async function EditarPost(
  { params, searchParams }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ criado?: string }>;
  },
) {
  const { id } = await params;
  const { criado } = await searchParams;
  const numero = Number(id);
  if (!Number.isInteger(numero)) notFound();

  const [post, categorias] = await Promise.all([buscarPost(numero), listarCategorias()]);
  if (!post) notFound();

  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">Editar artigo</h1>
          <p className="suave">
            Salvar não muda a data que o leitor vê — só a data de edição. Corrigir uma vírgula
            não empurra o artigo de volta ao topo da vitrine.
          </p>
        </div>
        <div className="acoes">
          {post.status === 'publicado' && (
            <Link className="btn btn-contorno" href={`/blog/${post.slug}`} target="_blank">
              Ver no site
            </Link>
          )}
          <Link className="btn btn-contorno" href="/admin/blog">Voltar</Link>
        </div>
      </div>

      {criado && (
        <p className="alerta alerta-ok" role="status">
          Artigo criado. O endereço público ficou <code>/blog/{post.slug}</code>.
        </p>
      )}

      <div className="cartao">
        <FormPost acao={acaoEditarPost} categorias={categorias} post={post} />
      </div>
    </>
  );
}
