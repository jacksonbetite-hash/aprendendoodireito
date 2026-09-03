# Capas do blog — procedência

Fotos de banco de imagens (Unsplash), baixadas para cá em 01/09/2026. Ficam no
projeto, e não em URL de terceiro, pelo mesmo motivo dos retratos: requisição a
serviço externo falha de vez em quando, e capa que não carrega deixa o cartão do
artigo com um buraco cinza no meio da vitrine.

O nome do arquivo é o `slug` do post, e a coluna `post.capa` guarda esse nome.
A pasta é `capas/`, e não `blog/`, para os arquivos não dividirem a URL com a
rota `/blog` da aplicação.

Post sem capa cadastrada não quebra: a tela cai no fundo colorido da categoria
com o ícone do assunto, que é como o blog nasceu.

## O que cada arquivo é

| Arquivo (`.jpg`) | Artigo | Origem |
|---|---|---|
| `atrasos-e-cancelamentos-de-voo` | Atrasos e cancelamentos de voo | `unsplash.com/photos/photo-1530521954074-e64f6810b32d` |
| `ler-processos-volumosos-sem-perder-o-fio` | Ler processos volumosos | `photo-1507842217343-583bb7270b66` |
| `novas-diretrizes-audiencia-de-custodia` | Audiência de custódia | `photo-1436450412740-6b988f486c6b` |
| `lgpd-nas-pequenas-e-medias-empresas` | LGPD nas PMEs | `photo-1614064641938-3bbee52942c7` |
| `reforma-tributaria-o-que-muda-na-pratica` | Reforma tributária | `photo-1554224155-6726b3ff858f` |
| `prescricao-e-decadencia-sem-decoreba` | Prescrição e decadência | `photo-1589829545856-d10d557cf95f` |
| `primeiro-estagio-o-que-realmente-conta` | Primeiro estágio | `photo-1521737711867-e3b97375f902` |
| `reler-nao-e-estudar` | Revisão espaçada | `photo-1434030216411-0b793f4b4173` |
| `ia-no-trabalho-o-que-delegar` | IA no trabalho | `photo-1677442136019-21780ecad995` |
| `o-orcamento-que-sobrevive-ao-mes-real` | Orçamento pessoal | `photo-1633158829585-23ba8f7c8caf` |

Recorte aplicado no download: `?w=1200&h=630&fit=crop&q=72` — proporção de
cartão social, que serve à capa larga do destaque e ao topo dos cartões.

## Por que aqui o limite é outro

A Licença Unsplash permite uso comercial sem atribuição, e a ressalva que pesa
sobre `public/retratos/` — direito de imagem de pessoa identificável sob nome
fictício — **não se aplica do mesmo jeito aqui**: são cenas e objetos que
ilustram o assunto, não pessoas apresentadas como alguém.

Duas ficam de olho: `primeiro-estagio-...` mostra pessoas trabalhando e
`atrasos-...`, um passageiro no aeroporto. Ninguém ali é identificado, citado
como fonte nem apresentado como aluno ou professor da plataforma — a legenda é
o título do artigo. Se algum dia uma dessas capas for usada ao lado de um
depoimento ou de um nome, vale a mesma regra dos retratos: cessão de uso de
imagem, ou a foto sai.

Ao trocar uma capa, atualize a linha desta tabela junto — a procedência some
depressa quando fica só na cabeça de quem baixou.
