-- =====================================================================
-- Capa de imagem no post do blog.
--
-- O blog nasceu com capa desenhada — a cor da categoria com o ícone do
-- assunto — para não depender de alguém escolher uma foto por artigo. A
-- foto ganha do desenho na vitrine: ela diz do que o texto trata antes
-- de o título ser lido, e é o que faz o cartão parar o olho.
--
-- A coluna é opcional de propósito. Post sem capa continua caindo no
-- fundo colorido da categoria: artigo novo entra publicado no mesmo dia,
-- sem esperar imagem, e categoria nova não precisa de arte para existir.
--
-- Guarda o nome do arquivo em public/capas/, não a URL: endereço de
-- terceiro no banco volta a ser requisição externa que falha e deixa o
-- cartão com um buraco. A procedência de cada foto está no LEIA-ME
-- daquela pasta.
-- =====================================================================

ALTER TABLE post ADD COLUMN capa TEXT;

UPDATE post SET capa = slug WHERE slug IN (
  'atrasos-e-cancelamentos-de-voo',
  'ler-processos-volumosos-sem-perder-o-fio',
  'novas-diretrizes-audiencia-de-custodia',
  'lgpd-nas-pequenas-e-medias-empresas',
  'reforma-tributaria-o-que-muda-na-pratica',
  'prescricao-e-decadencia-sem-decoreba',
  'primeiro-estagio-o-que-realmente-conta',
  'reler-nao-e-estudar',
  'ia-no-trabalho-o-que-delegar',
  'o-orcamento-que-sobrevive-ao-mes-real'
);
