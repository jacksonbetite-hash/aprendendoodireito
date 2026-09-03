-- =====================================================================
-- Vitrine compartilhada — etapa 5 do §5.10.2.
--
-- Até aqui `portal_id` respondia a duas perguntas de uma vez: de quem é
-- o aluno e de quem é o curso. A vitrine compartilhada as separa: um
-- aluno DA PLATAFORMA pode comprar um curso DE UM PORTAL (o professor
-- marcou `na_vitrine_plataforma`), e a venda é nossa — aluno nosso,
-- comissão ao professor pela regra do §5.6.1.
--
--   portal_id          → de quem é o aluno (base, login, site)
--   materia_portal_id  → de quem é o curso (quem produziu, quem recebe)
--
-- A chave estrangeira composta continua garantindo que o curso EXISTE
-- naquele portal; o CHECK permite as duas divergirem SOMENTE quando o
-- comprador é da plataforma. Portal de professor nunca vende curso de
-- outro — a trava do §15.14 fica declarativa, como antes.
--
-- A conferência de `na_vitrine_plataforma` fica na aplicação, de
-- propósito: o professor pode tirar o curso da vitrine amanhã, e isso
-- NÃO invalida a licença de quem já comprou.
-- =====================================================================

-- ---------- licença ----------
ALTER TABLE licenca ADD COLUMN materia_portal_id BIGINT;
UPDATE licenca SET materia_portal_id = portal_id;
ALTER TABLE licenca ALTER COLUMN materia_portal_id SET NOT NULL;

ALTER TABLE licenca DROP CONSTRAINT licenca_materia_mesmo_portal;
ALTER TABLE licenca ADD CONSTRAINT licenca_materia_existe
  FOREIGN KEY (materia_id, materia_portal_id) REFERENCES materia (id, portal_id);
ALTER TABLE licenca ADD CONSTRAINT licenca_curso_alheio_so_na_plataforma
  CHECK (materia_portal_id = portal_id OR portal_id = 0);

-- ---------- pedido ----------
ALTER TABLE pedido ADD COLUMN materia_portal_id BIGINT;
UPDATE pedido SET materia_portal_id = portal_id;
ALTER TABLE pedido ALTER COLUMN materia_portal_id SET NOT NULL;
ALTER TABLE pedido ADD CONSTRAINT pedido_materia_existe
  FOREIGN KEY (materia_id, materia_portal_id) REFERENCES materia (id, portal_id);
ALTER TABLE pedido ADD CONSTRAINT pedido_curso_alheio_so_na_plataforma
  CHECK (materia_portal_id = portal_id OR portal_id = 0);

-- A comissão do professor numa venda NOSSA do curso dele (§5.6.1),
-- gravada no ato como o percentual do split: auditoria de venda antiga
-- não pode depender do contrato de hoje. Só existe quando o curso é de
-- outro portal — venda de curso próprio não tem comissão a ninguém.
ALTER TABLE pedido ADD COLUMN comissao_professor_pp NUMERIC(5,2)
  CHECK (comissao_professor_pp IS NULL OR (comissao_professor_pp >= 0 AND comissao_professor_pp <= 100));
ALTER TABLE pedido ADD CONSTRAINT pedido_comissao_so_em_curso_alheio
  CHECK (comissao_professor_pp IS NULL OR materia_portal_id <> portal_id);

-- ---------- assinatura ----------
ALTER TABLE assinatura ADD COLUMN materia_portal_id BIGINT;
UPDATE assinatura SET materia_portal_id = portal_id;
ALTER TABLE assinatura ALTER COLUMN materia_portal_id SET NOT NULL;
ALTER TABLE assinatura ADD CONSTRAINT assinatura_materia_existe
  FOREIGN KEY (materia_id, materia_portal_id) REFERENCES materia (id, portal_id);
ALTER TABLE assinatura ADD CONSTRAINT assinatura_curso_alheio_so_na_plataforma
  CHECK (materia_portal_id = portal_id OR portal_id = 0);

-- ---------- a taxa da vitrine, no plano e no contrato ----------
-- Quanto o professor recebe quando NÓS vendemos o curso dele. Copiada
-- do plano para o contrato no aceite, como as demais condições. O valor
-- de partida (50%) é hipótese — decisão pendente registrada no §16.
ALTER TABLE portal_plano ADD COLUMN comissao_vitrine_pp NUMERIC(5,2) NOT NULL DEFAULT 50.00
  CHECK (comissao_vitrine_pp >= 0 AND comissao_vitrine_pp <= 100);
ALTER TABLE portal_contrato ADD COLUMN comissao_vitrine_pp NUMERIC(5,2) NOT NULL DEFAULT 50.00
  CHECK (comissao_vitrine_pp >= 0 AND comissao_vitrine_pp <= 100);
