-- =====================================================================
-- Achar a lei antes de terminar de digitar a palavra.
--
-- O índice de busca guarda o RADICAL da palavra: "improbidade" é gravada
-- como "improb". Isso é o que faz "prescrever" achar "prescrição" — e é o
-- que faz "improbid" não achar nada, porque um prefixo maior que o radical
-- nunca casa com ele. Quem digita devagar via a busca falhar no meio da
-- palavra e voltar a funcionar na última letra, sem entender por quê.
--
-- A saída é um segundo índice, sem radical nenhum, usado só para o pedaço
-- que ainda está sendo digitado. Os dois convivem porque respondem a
-- perguntas diferentes: o de radical entende a palavra, o de prefixo
-- entende a digitação.
-- =====================================================================

DROP TEXT SEARCH CONFIGURATION IF EXISTS portugues_prefixo CASCADE;
CREATE TEXT SEARCH CONFIGURATION portugues_prefixo (COPY = simple);
ALTER TEXT SEARCH CONFIGURATION portugues_prefixo
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, simple;

ALTER TABLE dispositivo ADD COLUMN busca_prefixo tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portugues_prefixo', coalesce(rotulo, '')),   'A') ||
    setweight(to_tsvector('portugues_prefixo', coalesce(apelidos, '')), 'B') ||
    setweight(to_tsvector('portugues_prefixo', coalesce(texto, '')),    'C')
  ) STORED;
CREATE INDEX dispositivo_busca_prefixo_idx ON dispositivo USING GIN (busca_prefixo);
