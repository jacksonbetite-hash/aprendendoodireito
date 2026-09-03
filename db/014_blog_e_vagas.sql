-- =====================================================================
-- Blog (§5.5 — topo de funil e motor de SEO) e mural de vagas (§5.7.1).
--
-- O 001 deixou os dois de fora ("Repasse, publicidade e vagas ficam para
-- a Fase 2"). O blog entrou antes do previsto porque é a porta de entrada
-- orgânica do catálogo; o mural entra com o schema completo do §5.7.1 —
-- moderação prévia e vigência máxima de 3 meses gravadas como restrição,
-- e não como regra combinada na aplicação.
-- =====================================================================

-- ---------- Blog ----------
CREATE TABLE categoria_blog (
  id     BIGSERIAL PRIMARY KEY,
  slug   TEXT NOT NULL UNIQUE,
  nome   TEXT NOT NULL,
  ordem  INT  NOT NULL DEFAULT 0
);

CREATE TABLE post (
  id              BIGSERIAL PRIMARY KEY,
  categoria_id    BIGINT NOT NULL REFERENCES categoria_blog(id),
  slug            TEXT NOT NULL UNIQUE,
  titulo          TEXT NOT NULL,
  resumo          TEXT NOT NULL,          -- serve à listagem E à meta description
  corpo           TEXT NOT NULL,          -- parágrafos separados por linha em branco
  autor_nome      TEXT NOT NULL,
  autor_cargo     TEXT,
  autor_foto      TEXT,                   -- arquivo em public/retratos, sem extensão
  minutos_leitura INT  NOT NULL,
  destaque        BOOLEAN NOT NULL DEFAULT false,   -- o cartão grande da capa
  status          status_publicacao NOT NULL DEFAULT 'rascunho',
  publicado_em    TIMESTAMPTZ,

  -- Post publicado sem data apareceria no fim da lista para sempre, e sem
  -- carimbo na página: a data é parte do conteúdo, não metadado opcional.
  CONSTRAINT post_publicado_tem_data
    CHECK (status <> 'publicado' OR publicado_em IS NOT NULL)
);

CREATE INDEX post_vitrine_idx ON post (publicado_em DESC) WHERE status = 'publicado';

-- Assinatura da newsletter do rodapé do blog. Guarda só o e-mail: pedir
-- nome para receber artigo é atrito sem contrapartida (§12.1 — mínimo
-- necessário). O opt-out fica no próprio e-mail enviado.
CREATE TABLE newsletter_assinante (
  id        BIGSERIAL PRIMARY KEY,
  email     TEXT NOT NULL UNIQUE,
  origem    TEXT NOT NULL DEFAULT 'blog',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Mural de vagas (§5.7.1) ----------
CREATE TYPE tipo_vaga       AS ENUM ('estagio', 'trainee', 'advogado_jr', 'advogado_pleno');
CREATE TYPE regime_vaga     AS ENUM ('integral', 'meio_periodo');
CREATE TYPE modalidade_vaga AS ENUM ('presencial', 'hibrido', 'remoto');
CREATE TYPE status_vaga     AS ENUM
  ('rascunho', 'em_moderacao', 'publicada', 'pausada', 'expirada', 'removida');

CREATE TABLE vaga (
  id              BIGSERIAL PRIMARY KEY,
  titulo          TEXT NOT NULL,
  empresa         TEXT NOT NULL,
  empresa_cnpj    TEXT,                   -- §5.7.1: obrigatório do anunciante real
  tipo            tipo_vaga       NOT NULL,
  regime          regime_vaga     NOT NULL,
  modalidade      modalidade_vaga NOT NULL,
  cidade          TEXT,
  uf              TEXT,
  area_atuacao    TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  requisitos      TEXT NOT NULL,
  faixa_salarial  TEXT,                   -- opcional por decisão do §5.7.1
  como_candidatar TEXT NOT NULL,          -- link ou e-mail: a candidatura é fora daqui
  status          status_vaga NOT NULL DEFAULT 'em_moderacao',
  publicada_em    TIMESTAMPTZ,
  expira_em       TIMESTAMPTZ,
  criada_em       TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Vaga publicada sem data de expiração é a "vaga fantasma perpétua" que
  -- o §5.7.1 existe para impedir. As duas datas andam com a publicação.
  CONSTRAINT vaga_publicada_tem_datas
    CHECK (status <> 'publicada' OR (publicada_em IS NOT NULL AND expira_em IS NOT NULL)),

  -- Vigência máxima de 3 meses contada da publicação (§5.7.1). Renovar
  -- exige repostar — e repostar passa de novo pela moderação.
  CONSTRAINT vaga_vigencia_maxima
    CHECK (expira_em IS NULL OR publicada_em IS NULL
           OR expira_em <= publicada_em + INTERVAL '3 months'),

  -- Só a vaga 100% remota pode não ter local. Nas outras, "onde é" é a
  -- primeira pergunta de quem procura estágio.
  CONSTRAINT vaga_presencial_tem_local
    CHECK (modalidade = 'remoto' OR (cidade IS NOT NULL AND uf IS NOT NULL)),
  CONSTRAINT vaga_uf_com_duas_letras
    CHECK (uf IS NULL OR uf ~ '^[A-Z]{2}$')
);

-- A lista pública é sempre "publicada e dentro da vigência, mais recente
-- primeiro" — o índice acompanha exatamente essa consulta.
CREATE INDEX vaga_mural_idx ON vaga (publicada_em DESC) WHERE status = 'publicada';
