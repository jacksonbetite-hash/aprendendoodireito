-- Domínio próprio do professor (§5.10, Fase 2): o portal responde também
-- em `site.dominiodele.com.br`, por CNAME para `<mascara>.<nosso domínio>`.
--
-- É upgrade pago: o preço mora no plano (NULL = o plano não oferece). Só
-- resolve depois de VERIFICADO — o CNAME apontando para o endereço certo —
-- para que ninguém cadastre um domínio que não controla.
ALTER TABLE portal_plano
  ADD COLUMN centavos_dominio_proprio integer
    CHECK (centavos_dominio_proprio IS NULL OR centavos_dominio_proprio >= 0);

ALTER TABLE portal ADD COLUMN dominio_verificado_em timestamptz;

CREATE UNIQUE INDEX portal_dominio_proprio_unico
  ON portal (lower(dominio_proprio)) WHERE dominio_proprio IS NOT NULL;
