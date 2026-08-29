-- =====================================================================
-- Autenticação e tabela de preços versionada.
--
-- Autenticação (§10): e-mail + senha com hash forte e sessão revogável
-- no banco. Magic link e Google entram depois; 2FA de admin/professor
-- está previsto no discovery e fica registrado como pendência.
--
-- Preços (§5.9): "preço novo vale a partir de data X, sem afetar
-- licenças vigentes", com histórico de alterações. Por isso preço é
-- tabela com vigência, não constante no código.
-- =====================================================================

-- ---------- Papéis ----------
CREATE TYPE papel_usuario AS ENUM ('aluno', 'professor', 'revisor', 'admin');

ALTER TABLE usuario ADD COLUMN papel papel_usuario NOT NULL DEFAULT 'aluno';
ALTER TABLE usuario ADD COLUMN consentimento_responsavel_em TIMESTAMPTZ;  -- §12.2, menores

-- E-mail é identidade: comparar sem diferenciar caixa evita conta duplicada
CREATE UNIQUE INDEX usuario_email_unico ON usuario (lower(email));

-- ---------- Sessões ----------
-- Guardamos só o hash do token: vazamento do banco não vira sessão válida.
CREATE TABLE sessao (
  id           BIGSERIAL PRIMARY KEY,
  usuario_id   BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
  criada_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em    TIMESTAMPTZ NOT NULL,
  revogada_em  TIMESTAMPTZ,
  user_agent   TEXT,
  CONSTRAINT sessao_vigencia CHECK (expira_em > criada_em)
);
CREATE INDEX sessao_usuario_idx ON sessao (usuario_id) WHERE revogada_em IS NULL;

-- ---------- Preço com vigência ----------
CREATE TYPE produto_preco AS ENUM ('MATERIA', 'CATALOGO');
CREATE TYPE periodo_preco AS ENUM ('mensal', 'trimestral', 'semestral', 'anual');

CREATE TABLE preco (
  id           BIGSERIAL PRIMARY KEY,
  produto      produto_preco NOT NULL,
  periodo      periodo_preco NOT NULL,
  centavos     INT NOT NULL CHECK (centavos >= 0),
  vigente_de   DATE NOT NULL,
  vigente_ate  DATE,                       -- nulo = vigente por ora
  criado_por   TEXT NOT NULL DEFAULT 'seed',
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT preco_vigencia CHECK (vigente_ate IS NULL OR vigente_ate > vigente_de)
);
-- Um preço vigente por produto × período em cada momento.
CREATE UNIQUE INDEX preco_vigente_unico
  ON preco (produto, periodo) WHERE vigente_ate IS NULL;
CREATE INDEX preco_busca_idx ON preco (produto, periodo, vigente_de DESC);

-- Tabela inicial: a hipótese do §7, a validar na Fase 0
INSERT INTO preco (produto, periodo, centavos, vigente_de) VALUES
  ('MATERIA',  'mensal',      2490, '2026-01-01'),
  ('MATERIA',  'trimestral',  5990, '2026-01-01'),
  ('MATERIA',  'semestral',   9990, '2026-01-01'),
  ('MATERIA',  'anual',      16990, '2026-01-01'),
  ('CATALOGO', 'mensal',      5990, '2026-01-01'),
  ('CATALOGO', 'trimestral', 14990, '2026-01-01'),
  ('CATALOGO', 'semestral',  26990, '2026-01-01'),
  ('CATALOGO', 'anual',      44990, '2026-01-01');

-- ---------- Auditoria: quem alterou o quê (§5.9) ----------
CREATE INDEX log_auditoria_entidade_idx ON log_auditoria (entidade, entidade_id, criado_em DESC);
