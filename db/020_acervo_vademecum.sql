-- =====================================================================
-- O vade-mécum deixa de ser amostra e passa a ser acervo (§5.4).
--
-- Onze artigos escritos à mão cabiam numa lista; trinta mil, importados do
-- Planalto, não cabem. Esta migração prepara o que muda com a escala:
-- o número do artigo vira coluna (para achar "art. 5º" sem varrer texto),
-- a norma ganha ícone e grupo (para o sumário organizar 20 códigos em vez
-- de 4), e a busca ganha o que o aluno digita antes de terminar a palavra.
-- =====================================================================

-- ---------- Identidade da norma no sumário ----------
-- Estavam num mapa no código, o que obrigava a alterar a página a cada
-- norma nova. Com o acervo importado por script, quem sabe o ícone e o
-- grupo de cada código é o catálogo de importação — então é ele que grava.
ALTER TABLE norma ADD COLUMN IF NOT EXISTS icone TEXT NOT NULL DEFAULT 'description';
ALTER TABLE norma ADD COLUMN IF NOT EXISTS grupo TEXT NOT NULL DEFAULT 'Legislação';
ALTER TABLE norma ADD COLUMN IF NOT EXISTS url_fonte TEXT;

-- O nome oficial abre a norma ("Decreto-Lei 2.848/40 — Código Penal"); no
-- sumário, com 22 linhas na lateral, ele ocuparia três linhas cada. O nome
-- curto é como o aluno chama a norma, e é ele que cabe na lista.
ALTER TABLE norma ADD COLUMN IF NOT EXISTS nome_curto TEXT;

-- Como o aluno chama a norma quando digita: "art 5 cf", "121 do penal",
-- "49 cdc". Sem isso, "cf" seria só mais uma palavra procurada no texto de
-- trinta mil artigos — e não o filtro que reduz a busca à Constituição.
ALTER TABLE norma ADD COLUMN IF NOT EXISTS apelidos TEXT;

-- ---------- Número do artigo como número ----------
-- "Art. 5º" é texto na tela e busca por número na prática: quem digita
-- "art 5" quer o artigo 5, não os 400 artigos que citam o art. 5º no
-- corpo. Com o número em coluna indexada, essa busca é um índice; sem
-- ela, seria uma varredura de trinta mil textos a cada tecla digitada.
ALTER TABLE dispositivo ADD COLUMN IF NOT EXISTS numero INT NOT NULL DEFAULT 0;
ALTER TABLE dispositivo ADD COLUMN IF NOT EXISTS sufixo TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS dispositivo_numero_idx ON dispositivo (numero, norma_id);
CREATE INDEX IF NOT EXISTS dispositivo_norma_ordem_idx ON dispositivo (norma_id, ordem);

-- Preenche o que já estava no acervo semeado ("Art. 60, § 4º" → 60).
UPDATE dispositivo
   SET numero = COALESCE(NULLIF(regexp_replace(
         regexp_replace(rotulo, '^Art\.?\s*', ''), '[^0-9].*$', ''), ''), '0')::int
 WHERE numero = 0;

-- ---------- Busca enquanto se digita ----------
-- `plainto_tsquery` só casa palavra inteira: quem digitou "prescri" ainda
-- não digitou "prescrição" e não veria nada até a última letra. A sugestão
-- usa prefixo (`to_tsquery('portugues:*')`), e o índice GIN que já existe
-- atende os dois — não há índice novo a criar para isso.
--
-- Falta o caminho inverso: achar a NORMA pela sigla ou pelo apelido que o
-- aluno digita junto do artigo ("art 5 cf", "121 do cp").
CREATE INDEX IF NOT EXISTS norma_apelidos_idx ON norma USING GIN (to_tsvector('portuguese', coalesce(apelidos, '')));

-- ---------- Higiene do acervo ----------
-- A amostra semeada em 002 foi escrita à mão, com o mesmo slug das normas
-- que o importador traz do Planalto. Deixá-la conviver com o texto oficial
-- daria dois "Art. 5º" na CF/88 — um conferido, outro não. O importador
-- substitui a norma inteira quando reimporta; aqui só marcamos a origem do
-- que veio antes dele, para essa substituição ser rastreável.
UPDATE norma SET fonte = 'Amostra do protótipo' WHERE fonte = 'LexML / Planalto';
