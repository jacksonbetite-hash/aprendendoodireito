import { query, queryOne } from './db.ts';
import { emTransacao, auditar, type Exec } from './auditoria.ts';
import { slugificar, slugLivre, minutosDeLeitura, normalizarParagrafos } from './texto.ts';

/**
 * Blog na retaguarda — §5.5.
 *
 * O blog nasceu inteiro em seed (`db/015`, `016`, `017`): publicar um
 * artigo exigia escrever SQL, criar migração e reconstruir a imagem. Aqui
 * ele ganha cadastro próprio, com as mesmas duas regras que valem para
 * preço e licença: toda alteração passa por transação e deixa registro de
 * auditoria (§5.9).
 *
 * Duas decisões que atravessam o módulo:
 *
 * 1. O SLUG É CONGELADO NA CRIAÇÃO. Depois de publicado, o endereço é
 *    contrato com quem linkou e com o buscador. Editar o título não mexe
 *    no endereço; trocar o endereço é ato explícito, e a tela avisa.
 * 2. `publicado_em` É A DATA DO LEITOR, `atualizado_em` É A NOSSA.
 *    Corrigir uma vírgula não pode empurrar o artigo de volta ao topo da
 *    vitrine — a primeira só é preenchida quando o post é publicado.
 */

export type StatusPublicacao = 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado' | 'arquivado';

export interface PostAdmin {
  id: number; slug: string; titulo: string; resumo: string; corpo: string;
  categoriaId: number; categoriaNome: string;
  autorNome: string; autorCargo: string | null; autorFoto: string | null;
  minutosLeitura: number; destaque: boolean; capa: string | null;
  status: StatusPublicacao; publicadoEm: Date | null; atualizadoEm: Date;
}

export interface DadosPost {
  categoriaId: number;
  titulo: string;
  resumo: string;
  corpo: string;
  autorNome: string;
  autorCargo?: string | null;
  autorFoto?: string | null;
  capa?: string | null;
  destaque: boolean;
  /** Vazio = calculado a partir do corpo. */
  minutosLeitura?: number | null;
  status: StatusPublicacao;
  /** Só na edição: trocar o endereço público de propósito. */
  slug?: string | null;
}

// ---------- Leitura ----------

export function listarPosts(status = '', busca = '') {
  return query<PostAdmin>(
    `SELECT p.id, p.slug, p.titulo, p.resumo, p.corpo,
            p.categoria_id AS "categoriaId", c.nome AS "categoriaNome",
            p.autor_nome AS "autorNome", p.autor_cargo AS "autorCargo",
            p.autor_foto AS "autorFoto", p.minutos_leitura AS "minutosLeitura",
            p.destaque, p.capa, p.status,
            p.publicado_em AS "publicadoEm", p.atualizado_em AS "atualizadoEm"
       FROM post p JOIN categoria_blog c ON c.id = p.categoria_id
      WHERE ($1 = '' OR p.status::text = $1)
        AND ($2 = '' OR p.titulo ILIKE '%' || $2 || '%' OR p.resumo ILIKE '%' || $2 || '%')
      ORDER BY p.atualizado_em DESC`,
    [status, busca.trim()],
  );
}

export function buscarPost(id: number) {
  return queryOne<PostAdmin>(
    `SELECT p.id, p.slug, p.titulo, p.resumo, p.corpo,
            p.categoria_id AS "categoriaId", c.nome AS "categoriaNome",
            p.autor_nome AS "autorNome", p.autor_cargo AS "autorCargo",
            p.autor_foto AS "autorFoto", p.minutos_leitura AS "minutosLeitura",
            p.destaque, p.capa, p.status,
            p.publicado_em AS "publicadoEm", p.atualizado_em AS "atualizadoEm"
       FROM post p JOIN categoria_blog c ON c.id = p.categoria_id
      WHERE p.id = $1`,
    [id],
  );
}

export interface CategoriaAdmin {
  id: number; slug: string; nome: string; ordem: number; posts: number;
}

export function listarCategorias() {
  return query<CategoriaAdmin>(
    `SELECT c.id, c.slug, c.nome, c.ordem,
            (SELECT count(*)::int FROM post p WHERE p.categoria_id = c.id) AS posts
       FROM categoria_blog c ORDER BY c.ordem, c.nome`,
  );
}

// ---------- Escrita ----------

/** Endereço livre para o título, considerando o que já existe. */
async function slugParaTitulo(exec: Exec, titulo: string, ignorarId?: number) {
  const base = slugificar(titulo);
  if (!base) throw new Error('o título precisa ter ao menos uma letra ou número');
  const usados = await exec<{ slug: string }>(
    'SELECT slug FROM post WHERE ($1::bigint IS NULL OR id <> $1)',
    [ignorarId ?? null],
  );
  return slugLivre(base, usados.map((u) => u.slug));
}

function validar(d: DadosPost) {
  if (!d.titulo.trim()) throw new Error('o título é obrigatório');
  if (d.resumo.trim().length < 40) {
    // O resumo é a meta description e o texto do cartão: curto demais
    // vira reticências no Google e cartão vazio na vitrine.
    throw new Error('o resumo precisa de pelo menos 40 caracteres — ele é a chamada e a meta description');
  }
  if (d.corpo.trim().length < 200) throw new Error('o corpo está curto demais para um artigo');
  if (!d.autorNome.trim()) throw new Error('o autor é obrigatório — artigo sem assinatura não publica');
  if (!Number.isInteger(d.categoriaId)) throw new Error('escolha uma categoria');
}

export async function criarPost(ator: string, d: DadosPost) {
  validar(d);
  const corpo = normalizarParagrafos(d.corpo);
  const minutos = d.minutosLeitura && d.minutosLeitura > 0
    ? d.minutosLeitura : minutosDeLeitura(corpo);

  return emTransacao(async (exec) => {
    const slug = await slugParaTitulo(exec, d.titulo);
    // `publicado_em` só nasce com o post já publicado — a restrição
    // `post_publicado_tem_data` do banco recusa o contrário.
    const [novo] = await exec<{ id: number }>(
      `INSERT INTO post
         (categoria_id, slug, titulo, resumo, corpo, autor_nome, autor_cargo, autor_foto,
          minutos_leitura, destaque, capa, status, publicado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
               CASE WHEN $13 = 'publicado' THEN now() ELSE NULL END)
       RETURNING id`,
      [d.categoriaId, slug, d.titulo.trim(), d.resumo.trim(), corpo, d.autorNome.trim(),
       d.autorCargo?.trim() || null, d.autorFoto?.trim() || null,
       // O status vai duas vezes de propósito: uma na coluna (enum) e
       // outra na comparação de texto. Reaproveitar o mesmo parâmetro nos
       // dois papéis faz o Postgres recusar com "inconsistent types
       // deduced for parameter".
       minutos, d.destaque, d.capa?.trim() || null, d.status, d.status],
    );
    if (d.destaque) await tirarOutrosDestaques(exec, novo.id);
    await auditar(exec, ator, 'post.criado', 'post', novo.id,
      { slug, titulo: d.titulo.trim(), status: d.status });
    return { id: novo.id, slug };
  });
}

export async function editarPost(ator: string, id: number, d: DadosPost) {
  validar(d);
  const corpo = normalizarParagrafos(d.corpo);
  const minutos = d.minutosLeitura && d.minutosLeitura > 0
    ? d.minutosLeitura : minutosDeLeitura(corpo);

  return emTransacao(async (exec) => {
    const [antes] = await exec<{ slug: string; status: string }>(
      'SELECT slug, status FROM post WHERE id = $1', [id],
    );
    if (!antes) throw new Error('post não encontrado');

    // O endereço só muda quando pedido de propósito. Publicado, ele é
    // contrato com quem linkou — e trocar quebra o link alheio.
    let slug = antes.slug;
    if (d.slug && d.slug.trim() && slugificar(d.slug) !== antes.slug) {
      slug = await slugParaTitulo(exec, d.slug, id);
    }

    await exec(
      `UPDATE post SET
         categoria_id = $2, slug = $3, titulo = $4, resumo = $5, corpo = $6,
         autor_nome = $7, autor_cargo = $8, autor_foto = $9, minutos_leitura = $10,
         destaque = $11, capa = $12, status = $13,
         publicado_em = CASE
           WHEN $14 = 'publicado' THEN coalesce(publicado_em, now())
           ELSE publicado_em END,
         atualizado_em = now()
       WHERE id = $1`,
      [id, d.categoriaId, slug, d.titulo.trim(), d.resumo.trim(), corpo, d.autorNome.trim(),
       d.autorCargo?.trim() || null, d.autorFoto?.trim() || null, minutos,
       d.destaque, d.capa?.trim() || null, d.status, d.status],
    );
    if (d.destaque) await tirarOutrosDestaques(exec, id);

    await auditar(exec, ator, 'post.editado', 'post', id, {
      titulo: d.titulo.trim(),
      status: antes.status === d.status ? d.status : `${antes.status} → ${d.status}`,
      ...(slug !== antes.slug ? { endereco: `${antes.slug} → ${slug}` } : {}),
    });
    return { id, slug };
  });
}

/**
 * O destaque é o cartão grande da capa do blog — existe um só. Em vez de
 * confiar em quem cadastra lembrar de desmarcar o anterior, o novo
 * destaque apaga os outros na mesma transação.
 */
function tirarOutrosDestaques(exec: Exec, id: number) {
  return exec('UPDATE post SET destaque = false WHERE destaque AND id <> $1', [id]);
}

/** Publicar, despublicar e arquivar sem passar pelo formulário inteiro. */
export async function mudarStatusPost(ator: string, id: number, status: StatusPublicacao) {
  return emTransacao(async (exec) => {
    const [p] = await exec<{ status: string }>('SELECT status FROM post WHERE id = $1', [id]);
    if (!p) throw new Error('post não encontrado');
    await exec(
      `UPDATE post SET status = $2,
              publicado_em = CASE WHEN $3 = 'publicado' THEN coalesce(publicado_em, now())
                                  ELSE publicado_em END,
              atualizado_em = now()
        WHERE id = $1`,
      [id, status, status],
    );
    await auditar(exec, ator, 'post.status', 'post', id, { de: p.status, para: status });
  });
}

/**
 * Não existe apagar post: existe arquivar.
 *
 * Um artigo publicado tem link de fora, aparece em busca e pode estar
 * citado. Sumir com a linha transforma isso em 404 sem rastro e apaga a
 * própria auditoria do que foi publicado um dia. `arquivado` some da
 * vitrine — que é o que quem pediu "excluir" realmente quer.
 */
export function arquivarPost(ator: string, id: number) {
  return mudarStatusPost(ator, id, 'arquivado');
}

export async function salvarCategoria(
  ator: string, id: number | null, nome: string, ordem: number,
) {
  if (!nome.trim()) throw new Error('o nome da categoria é obrigatório');
  return emTransacao(async (exec) => {
    if (id) {
      // O slug da categoria é filtro na URL do blog: não muda ao renomear.
      await exec('UPDATE categoria_blog SET nome = $2, ordem = $3 WHERE id = $1',
        [id, nome.trim(), ordem]);
      await auditar(exec, ator, 'categoria_blog.editada', 'categoria_blog', id, { nome, ordem });
      return id;
    }
    const base = slugificar(nome);
    if (!base) throw new Error('o nome precisa ter ao menos uma letra ou número');
    const usados = await exec<{ slug: string }>('SELECT slug FROM categoria_blog');
    const slug = slugLivre(base, usados.map((u) => u.slug));
    const [nova] = await exec<{ id: number }>(
      'INSERT INTO categoria_blog (slug, nome, ordem) VALUES ($1,$2,$3) RETURNING id',
      [slug, nome.trim(), ordem],
    );
    await auditar(exec, ator, 'categoria_blog.criada', 'categoria_blog', nova.id, { slug, nome, ordem });
    return nova.id;
  });
}

/** Categoria com post não some — o post ficaria órfão de uma FK obrigatória. */
export async function excluirCategoria(ator: string, id: number) {
  return emTransacao(async (exec) => {
    const [c] = await exec<{ nome: string; posts: number }>(
      `SELECT nome, (SELECT count(*)::int FROM post WHERE categoria_id = $1) AS posts
         FROM categoria_blog WHERE id = $1`, [id],
    );
    if (!c) throw new Error('categoria não encontrada');
    if (c.posts > 0) {
      throw new Error(`a categoria tem ${c.posts} artigo(s) — mova-os antes de excluir`);
    }
    await exec('DELETE FROM categoria_blog WHERE id = $1', [id]);
    await auditar(exec, ator, 'categoria_blog.excluida', 'categoria_blog', id, { nome: c.nome });
  });
}
