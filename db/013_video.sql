-- Origem do vídeo da aula (§10 — entrega de mídia).
--
-- `video_url` guardava um endereço cru e nunca chegou a ser usada. Uma URL
-- fixa no banco tem dois defeitos: amarra o sistema a um fornecedor, e é
-- pública por natureza — quem abrisse o HTML assistiria sem licença.
--
-- No lugar entra o par (provedor, id). O endereço deixa de ser um dado e
-- passa a ser calculado no servidor a cada carregamento, já assinado e com
-- prazo de validade, por lib/video.ts. Trocar de fornecedor vira um UPDATE
-- nesta tabela, não uma reescrita.

ALTER TABLE aula DROP COLUMN video_url;

ALTER TABLE aula
  ADD COLUMN video_provedor TEXT,
  ADD COLUMN video_id       TEXT;

-- LOCAL   — arquivo no volume de mídia da VPS (ver docker-compose.yml)
-- BUNNY   — Bunny Stream, quando a banda da VPS apertar
-- CLOUDFLARE — Cloudflare Stream, mesma função, outro preço
ALTER TABLE aula ADD CONSTRAINT aula_video_provedor_conhecido
  CHECK (video_provedor IS NULL OR video_provedor IN ('LOCAL', 'BUNNY', 'CLOUDFLARE'));

-- Os dois andam juntos: provedor sem id (ou id sem provedor) seria uma aula
-- que se diz publicada e não toca.
ALTER TABLE aula ADD CONSTRAINT aula_video_completo
  CHECK ((video_provedor IS NULL) = (video_id IS NULL));
