import Link from 'next/link';
import type { Metadata } from 'next';
import FormPost from '../FormPost.tsx';
import { acaoCriarPost } from '../acoes.ts';
import { listarCategorias } from '../../../../lib/admin-blog.ts';

export const metadata: Metadata = { title: 'Novo artigo — Administração' };
export const dynamic = 'force-dynamic';

export default async function NovoPost() {
  const categorias = await listarCategorias();

  return (
    <>
      <div className="cabecalho-tela">
        <div>
          <h1 className="headline-lg">Novo artigo</h1>
          <p className="suave">
            O endereço público é derivado do título quando o artigo é criado, e a partir daí
            não muda sozinho.
          </p>
        </div>
        <div className="acoes">
          <Link className="btn btn-contorno" href="/admin/blog">Voltar</Link>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="cartao">
          <div className="vazio">
            Não há categoria cadastrada, e todo artigo pertence a uma.{' '}
            <Link href="/admin/blog/categorias" style={{ color: 'var(--primary-texto)', fontWeight: 700 }}>
              Criar a primeira
            </Link>.
          </div>
        </div>
      ) : (
        <div className="cartao">
          <FormPost acao={acaoCriarPost} categorias={categorias} />
        </div>
      )}
    </>
  );
}
