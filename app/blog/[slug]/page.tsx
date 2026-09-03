import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Pagina, Icone } from '../../componentes.tsx';
import {
  buscarPost, postsRelacionados, dataLonga, paragrafos,
} from '../../../lib/blog.ts';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await buscarPost(slug);
  if (!post) return { title: 'Artigo não encontrado' };
  return { title: post.titulo, description: post.resumo.slice(0, 160) };
}

export default async function Artigo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await buscarPost(slug);
  if (!post) notFound();

  const relacionados = await postsRelacionados(post);

  return (
    <Pagina ativo="blog">
      <article className="artigo">
        <div className="container">
          <div className="trilha-topo">
            <Link href="/blog">Blog</Link>
            <Icone nome="chevron_right" tamanho={16} />
            <Link href={`/blog?categoria=${post.categoriaSlug}`}>{post.categoriaNome}</Link>
          </div>

          <h1>{post.titulo}</h1>
          <p className="artigo-resumo">{post.resumo}</p>

          <div className="artigo-assinatura">
            <span className="post-autor">
              {post.autorFoto && (
                <img src={`/retratos/${post.autorFoto}.jpg`} alt="" width={48} height={48} />
              )}
              <span>
                <strong>{post.autorNome}</strong>
                <small>{post.autorCargo}</small>
              </span>
            </span>
            <span className="post-tempo">
              <Icone nome="schedule" tamanho={15} /> {dataLonga(post.publicadoEm)} ·{' '}
              {post.minutosLeitura} min de leitura
            </span>
          </div>

          {/* A mesma foto da vitrine abre o artigo: quem clicou no cartão
              reconhece que chegou onde queria. Decorativa — o título
              logo acima já diz do que se trata. */}
          {post.capa && (
            <figure className="artigo-capa">
              <img src={`/capas/${post.capa}.jpg`} alt="" />
            </figure>
          )}

          <div className="artigo-corpo">
            {paragrafos(post.corpo).map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {/* Conteúdo aberto de topo de funil (§5.5): informa, mas não
              responde a caso concreto — o mesmo limite que o rodapé
              legal declara para o curso. O texto serve a qualquer área
              do blog, e não só às jurídicas. */}
          <p className="artigo-aviso">
            <Icone nome="info" tamanho={18} />
            Material de estudo, escrito para explicar como o tema funciona. Não é
            consultoria profissional nem resposta a caso concreto — decisão sua que
            dependa disto pede um profissional da área.
          </p>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="secao clara">
          <div className="container pilha-md">
            <h2 className="blog-secao">
              <Icone nome="library_books" tamanho={24} /> Continue lendo
            </h2>
            <div className="grade-3">
              {relacionados.map((p) => (
                <article className="post-cartao simples" key={p.id}>
                  <div className="post-corpo">
                    <span className="chip chip-sm chip-primaria">{p.categoriaNome}</span>
                    <h3><Link href={`/blog/${p.slug}`}>{p.titulo}</Link></h3>
                    <p>{p.resumo}</p>
                    <div className="post-rodape">
                      <Link className="link-seta" href={`/blog/${p.slug}`}>
                        Ler mais <Icone nome="arrow_forward" tamanho={16} />
                      </Link>
                      <span className="post-tempo">
                        <Icone nome="schedule" tamanho={15} /> {p.minutosLeitura} min
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </Pagina>
  );
}
