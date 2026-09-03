'use client';

import { useActionState, useState } from 'react';
import type { EstadoAdmin } from '../acoes.ts';
import type { PostAdmin, CategoriaAdmin } from '../../../lib/admin-blog.ts';

const SITUACOES = [
  { valor: 'rascunho', rotulo: 'Rascunho — só aqui dentro' },
  { valor: 'em_revisao', rotulo: 'Em revisão' },
  { valor: 'aprovado', rotulo: 'Aprovado, aguardando publicação' },
  { valor: 'publicado', rotulo: 'Publicado — no ar' },
  { valor: 'arquivado', rotulo: 'Arquivado — fora da vitrine' },
];

/**
 * O formulário do artigo, o mesmo para criar e para editar.
 *
 * Na criação o endereço não aparece: ele é derivado do título, e pedir
 * que alguém invente um slug antes de ter escrito o texto é pedir um
 * endereço ruim. Na edição ele aparece, com aviso — trocar o endereço de
 * um artigo publicado quebra o link de quem já apontou para ele.
 */
export default function FormPost({
  acao, categorias, post,
}: {
  acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;
  categorias: CategoriaAdmin[];
  post?: PostAdmin;
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  const [mostrarEndereco, setMostrarEndereco] = useState(false);

  return (
    <form action={enviar} className="form-editor">
      {post && <input type="hidden" name="id" value={post.id} />}
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}

      <label>
        Título
        <input name="titulo" defaultValue={post?.titulo} required maxLength={180}
          placeholder="O que o leitor vai encontrar aqui" />
      </label>

      <label>
        Resumo
        <textarea name="resumo" defaultValue={post?.resumo} required rows={3}
          placeholder="Duas ou três linhas: é a chamada do cartão e a descrição que aparece no Google." />
        <span className="dica">
          Mínimo de 40 caracteres. Serve à listagem e à meta description — o mesmo texto nos dois lugares.
        </span>
      </label>

      <label>
        Corpo
        <textarea name="corpo" className="alto" defaultValue={post?.corpo} required
          placeholder={'Parágrafos separados por uma linha em branco.\n\nComo este.'} />
        <span className="dica">
          Parágrafos separados por linha em branco. Sem HTML — o site monta a tipografia.
        </span>
      </label>

      <div className="linha">
        <label>
          Categoria
          <select name="categoriaId" defaultValue={post?.categoriaId ?? ''} required>
            <option value="" disabled>escolha…</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label>
          Situação
          <select name="status" defaultValue={post?.status ?? 'rascunho'}>
            {SITUACOES.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
          </select>
        </label>
        <label>
          Minutos de leitura
          <input name="minutosLeitura" type="number" min={1} max={90}
            defaultValue={post?.minutosLeitura ?? ''} placeholder="calcula sozinho" />
        </label>
      </div>

      <div className="linha">
        <label>
          Autor
          <input name="autorNome" defaultValue={post?.autorNome} required maxLength={120} />
        </label>
        <label>
          Cargo do autor
          <input name="autorCargo" defaultValue={post?.autorCargo ?? ''}
            placeholder="Advogada, professor…" />
        </label>
        <label>
          Retrato do autor
          <input name="autorFoto" defaultValue={post?.autorFoto ?? ''} placeholder="nome-do-arquivo" />
          <span className="dica">Arquivo em <code>public/retratos</code>, sem extensão.</span>
        </label>
      </div>

      <div className="linha">
        <label>
          Capa
          <input name="capa" defaultValue={post?.capa ?? ''} placeholder="nome-do-arquivo" />
          <span className="dica">
            Arquivo em <code>public/capas</code>, sem extensão. Vazio = fundo colorido da categoria.
          </span>
        </label>
        <label className="marcador">
          <input type="checkbox" name="destaque" defaultChecked={post?.destaque} />
          Destaque da capa do blog
          <span className="dica">Existe um só: marcar aqui desmarca o anterior.</span>
        </label>
      </div>

      {post && (
        <div>
          {mostrarEndereco ? (
            <label>
              Endereço público
              <input name="slug" defaultValue={post.slug} />
              <span className="dica">
                <strong>Cuidado:</strong> o endereço atual é <code>/blog/{post.slug}</code>. Trocá-lo
                quebra todo link já publicado para este artigo e zera o que o buscador indexou.
              </span>
            </label>
          ) : (
            <p className="dica">
              Endereço: <code>/blog/{post.slug}</code>{' '}
              <button type="button" className="btn btn-contorno btn-sm"
                onClick={() => setMostrarEndereco(true)}>
                alterar
              </button>
            </p>
          )}
        </div>
      )}

      <div className="acoes">
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Salvando…' : post ? 'Salvar artigo' : 'Criar artigo'}
        </button>
      </div>
    </form>
  );
}
