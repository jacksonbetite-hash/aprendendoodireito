-- =====================================================================
-- Busca que não cobra acento de quem está com pressa.
--
-- O aluno digita "clausula petrea", "boa-fe objetiva", "prescricao". A lei
-- escreve "cláusula pétrea", "boa-fé objetiva", "prescrição". Com o índice
-- em português puro, essas buscas devolviam zero — e zero, aqui, é o mesmo
-- que dizer que a lei não está no acervo.
--
-- A correção é no índice, e não na consulta: uma configuração de busca que
-- tira o acento antes de reduzir a palavra ao radical. Assim "cláusula" e
-- "clausula" viram o mesmo termo dos dois lados, e quem digita com acento
-- continua achando o mesmo.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS unaccent;

DROP TEXT SEARCH CONFIGURATION IF EXISTS portugues_sem_acento CASCADE;
CREATE TEXT SEARCH CONFIGURATION portugues_sem_acento (COPY = portuguese);
ALTER TEXT SEARCH CONFIGURATION portugues_sem_acento
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, portuguese_stem;

-- O peso continua o de sempre (§5.4): rótulo (A) acima do apelido de aula
-- (B), e o apelido acima do corpo da lei (C) — quem procura "art. 5º" quer
-- o artigo 5º, não os trezentos artigos que remetem a ele.
ALTER TABLE dispositivo DROP COLUMN busca;
ALTER TABLE dispositivo ADD COLUMN busca tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portugues_sem_acento', coalesce(rotulo, '')),   'A') ||
    setweight(to_tsvector('portugues_sem_acento', coalesce(apelidos, '')), 'B') ||
    setweight(to_tsvector('portugues_sem_acento', coalesce(texto, '')),    'C')
  ) STORED;
CREATE INDEX dispositivo_busca_idx ON dispositivo USING GIN (busca);

-- E o mesmo para o nome da norma, que é como se acha "codigo penal" sem
-- acento ou "constituicao" escrita às pressas.
DROP INDEX IF EXISTS norma_apelidos_idx;
CREATE INDEX norma_apelidos_idx ON norma
  USING GIN (to_tsvector('portugues_sem_acento', coalesce(apelidos, '')));
