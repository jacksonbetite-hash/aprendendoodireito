-- =====================================================================
-- Aprimore o Saber — schema inicial (Fase 1 / MVP)
-- Modelado a partir do §11 do discovery. Só os domínios do MVP:
-- identidade, catálogo, exercícios, legislação, comercial e progresso.
-- Repasse, publicidade e vagas ficam para a Fase 2.
-- =====================================================================

-- ---------- Identidade ----------
CREATE TYPE status_conta AS ENUM ('ATIVA', 'INATIVA_AVISO', 'BLOQUEADA_INATIVIDADE', 'ENCERRADA');

CREATE TABLE usuario (
  id             BIGSERIAL PRIMARY KEY,
  nome           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  senha_hash     TEXT,
  cpf            TEXT,                       -- §12.1: só pedido na compra, não no cadastro
  nascimento     DATE,
  status_conta   status_conta NOT NULL DEFAULT 'ATIVA',
  ultimo_login_em TIMESTAMPTZ,               -- §6.5: relógio da inatividade
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Catálogo (§4: Área → Matéria → Assunto → Aula) ----------
CREATE TABLE area (
  id     BIGSERIAL PRIMARY KEY,
  slug   TEXT NOT NULL UNIQUE,
  nome   TEXT NOT NULL,
  ordem  INT  NOT NULL DEFAULT 0
);

CREATE TYPE status_publicacao AS ENUM ('rascunho', 'em_revisao', 'aprovado', 'publicado', 'arquivado');

CREATE TABLE materia (
  id           BIGSERIAL PRIMARY KEY,
  area_id      BIGINT NOT NULL REFERENCES area(id),
  slug         TEXT NOT NULL UNIQUE,
  nome         TEXT NOT NULL,
  ementa       TEXT NOT NULL,
  onda         INT,                          -- onda de lançamento (§4); NULL = sem data
  status       status_publicacao NOT NULL DEFAULT 'rascunho',
  professor    TEXT,
  ordem        INT NOT NULL DEFAULT 0
);

CREATE TABLE assunto (
  id          BIGSERIAL PRIMARY KEY,
  materia_id  BIGINT NOT NULL REFERENCES materia(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  nome        TEXT NOT NULL,
  ordem       INT NOT NULL DEFAULT 0,
  UNIQUE (materia_id, slug)
);

CREATE TABLE aula (
  id               BIGSERIAL PRIMARY KEY,
  assunto_id       BIGINT NOT NULL REFERENCES assunto(id) ON DELETE CASCADE,
  slug             TEXT NOT NULL UNIQUE,
  titulo           TEXT NOT NULL,
  duracao_segundos INT  NOT NULL,
  resumo           TEXT NOT NULL,            -- §5.3: obrigatório, serve ao SEO
  video_url        TEXT,
  amostra_gratuita BOOLEAN NOT NULL DEFAULT false,  -- 1ª aula de cada assunto (§6.1)
  no_trial         BOOLEAN NOT NULL DEFAULT false,  -- dentro da cota de ~20% do trial
  status           status_publicacao NOT NULL DEFAULT 'rascunho',
  ordem            INT NOT NULL DEFAULT 0,
  atualizada_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE material_apoio (
  id       BIGSERIAL PRIMARY KEY,
  aula_id  BIGINT NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
  titulo   TEXT NOT NULL,
  arquivo  TEXT NOT NULL,
  bytes    INT
);

-- ---------- Legislação (§5.4) ----------
CREATE TABLE norma (
  id             BIGSERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  sigla          TEXT NOT NULL,
  nome           TEXT NOT NULL,
  conferido_em   DATE NOT NULL,              -- carimbo "texto conferido em"
  fonte          TEXT NOT NULL DEFAULT 'LexML / Planalto',
  ordem          INT NOT NULL DEFAULT 0
);

CREATE TABLE dispositivo (
  id         BIGSERIAL PRIMARY KEY,
  norma_id   BIGINT NOT NULL REFERENCES norma(id) ON DELETE CASCADE,
  rotulo     TEXT NOT NULL,                  -- "Art. 5º, §1º"
  texto      TEXT NOT NULL,
  agrupador  TEXT,                           -- título/capítulo, para o índice
  ordem      INT NOT NULL DEFAULT 0,
  UNIQUE (norma_id, rotulo)
);

-- Busca full-text em português (§10: tsvector cobre o MVP, sem Meilisearch)
ALTER TABLE dispositivo ADD COLUMN busca tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(rotulo, '') || ' ' || coalesce(texto, ''))
  ) STORED;
CREATE INDEX dispositivo_busca_idx ON dispositivo USING GIN (busca);

-- Deep link bidirecional aula ↔ artigo (§5.4)
CREATE TABLE aula_dispositivo (
  aula_id        BIGINT NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
  dispositivo_id BIGINT NOT NULL REFERENCES dispositivo(id) ON DELETE CASCADE,
  PRIMARY KEY (aula_id, dispositivo_id)
);

-- ---------- Exercícios (§5.5) ----------
CREATE TYPE tipo_questao AS ENUM ('multipla_escolha', 'certo_errado');

CREATE TABLE exercicio (
  id      BIGSERIAL PRIMARY KEY,
  aula_id BIGINT NOT NULL REFERENCES aula(id) ON DELETE CASCADE UNIQUE
);

CREATE TABLE questao (
  id           BIGSERIAL PRIMARY KEY,
  exercicio_id BIGINT NOT NULL REFERENCES exercicio(id) ON DELETE CASCADE,
  tipo         tipo_questao NOT NULL DEFAULT 'multipla_escolha',
  enunciado    TEXT NOT NULL,
  origem       TEXT NOT NULL DEFAULT 'autoral',
  dificuldade  TEXT NOT NULL DEFAULT 'introdutorio',
  ordem        INT NOT NULL DEFAULT 0
);

CREATE TABLE alternativa (
  id         BIGSERIAL PRIMARY KEY,
  questao_id BIGINT NOT NULL REFERENCES questao(id) ON DELETE CASCADE,
  texto      TEXT NOT NULL,
  correta    BOOLEAN NOT NULL DEFAULT false,
  comentario TEXT NOT NULL,                  -- §5.3: comentário em TODA alternativa
  ordem      INT NOT NULL DEFAULT 0
);

CREATE TABLE resposta (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  questao_id     BIGINT NOT NULL REFERENCES questao(id) ON DELETE CASCADE,
  alternativa_id BIGINT NOT NULL REFERENCES alternativa(id),
  acertou        BOOLEAN NOT NULL,
  respondida_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX resposta_usuario_idx ON resposta (usuario_id, respondida_em DESC);

-- ---------- Comercial: a licença é a entidade de primeira classe (§11) ----------
CREATE TYPE escopo_licenca  AS ENUM ('CATALOGO', 'MATERIA');
CREATE TYPE origem_licenca  AS ENUM ('TRIAL', 'COMPRA', 'PROMOCIONAL', 'CORTESIA', 'MIGRACAO');
CREATE TYPE status_licenca  AS ENUM ('PENDENTE', 'ATIVA', 'EM_ATRASO', 'SUSPENSA', 'CANCELADA', 'EXPIRADA');

CREATE TABLE campanha_promocional (
  id                  BIGSERIAL PRIMARY KEY,
  nome                TEXT NOT NULL,
  codigo              TEXT UNIQUE,
  tipo_concessao      TEXT NOT NULL DEFAULT 'CODIGO',    -- CODIGO | MANUAL | EVENTO
  modalidade          TEXT NOT NULL DEFAULT 'GRATUITA',  -- GRATUITA | DESCONTO
  materia_id          BIGINT REFERENCES materia(id),
  duracao_dias        INT NOT NULL,
  desconto_percentual INT,
  max_resgates        INT,
  resgates_usados     INT NOT NULL DEFAULT 0,
  valida_de           DATE,
  valida_ate          DATE,
  criada_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE licenca (
  id            BIGSERIAL PRIMARY KEY,
  usuario_id    BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  escopo        escopo_licenca NOT NULL,
  materia_id    BIGINT REFERENCES materia(id),
  origem        origem_licenca NOT NULL,
  campanha_id   BIGINT REFERENCES campanha_promocional(id),
  status        status_licenca NOT NULL DEFAULT 'PENDENTE',
  inicio_em     TIMESTAMPTZ NOT NULL,
  fim_em        TIMESTAMPTZ NOT NULL,
  cota          JSONB,                       -- limites do trial: aulas, exercícios
  criada_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- escopo CATALOGO não aponta matéria; escopo MATERIA obriga apontar
  CONSTRAINT licenca_escopo_materia CHECK (
    (escopo = 'CATALOGO' AND materia_id IS NULL) OR
    (escopo = 'MATERIA'  AND materia_id IS NOT NULL)
  ),
  -- campanha só faz sentido em licença promocional
  CONSTRAINT licenca_campanha CHECK (
    (origem = 'PROMOCIONAL') OR campanha_id IS NULL
  ),
  CONSTRAINT licenca_vigencia CHECK (fim_em > inicio_em)
);
CREATE INDEX licenca_usuario_idx ON licenca (usuario_id, status);

-- Um teste por CPF, não renovável e não acumulável (§6.1)
CREATE UNIQUE INDEX licenca_trial_unico ON licenca (usuario_id) WHERE origem = 'TRIAL';

-- ---------- Progresso ----------
CREATE TABLE progresso_aula (
  usuario_id        BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  aula_id           BIGINT NOT NULL REFERENCES aula(id) ON DELETE CASCADE,
  segundos_assistidos INT NOT NULL DEFAULT 0,
  concluida         BOOLEAN NOT NULL DEFAULT false,
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, aula_id)
);

CREATE TABLE anotacao (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  aula_id        BIGINT REFERENCES aula(id) ON DELETE CASCADE,
  dispositivo_id BIGINT REFERENCES dispositivo(id) ON DELETE CASCADE,
  texto          TEXT NOT NULL,
  criada_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favorito (
  usuario_id     BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  dispositivo_id BIGINT NOT NULL REFERENCES dispositivo(id) ON DELETE CASCADE,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, dispositivo_id)
);

-- ---------- Governança (§12.1) ----------
CREATE TABLE log_auditoria (
  id         BIGSERIAL PRIMARY KEY,
  ator       TEXT NOT NULL,
  acao       TEXT NOT NULL,
  entidade   TEXT NOT NULL,
  entidade_id BIGINT,
  detalhe    JSONB,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
