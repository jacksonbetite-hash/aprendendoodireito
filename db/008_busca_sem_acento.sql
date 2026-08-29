-- =====================================================================
-- Busca por número de artigo tolerante a acento e pontuação:
-- quem digita "art 5" precisa achar "Art. 5º".
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION normaliza_busca(t text) RETURNS text AS $$
  SELECT lower(regexp_replace(unaccent(coalesce(t, '')), '[^a-z0-9]+', ' ', 'gi'));
$$ LANGUAGE sql IMMUTABLE;

CREATE INDEX dispositivo_rotulo_normalizado_idx
  ON dispositivo (normaliza_busca(rotulo) text_pattern_ops);
