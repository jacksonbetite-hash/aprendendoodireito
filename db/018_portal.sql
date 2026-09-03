-- =====================================================================
-- Portal do Professor — modelo white-label (§5.10).
--
-- O sistema deixa de ter um catálogo e passa a ter N. Cada portal é um
-- tenant: catálogo próprio, alunos próprios, preços próprios e dinheiro
-- próprio, tudo servido pela mesma aplicação e separado pelo endereço de
-- acesso (subdomínio, §5.10).
--
-- Três decisões de modelagem sustentam o arquivo inteiro:
--
-- 1. A PLATAFORMA É O PORTAL 0. O discovery falava em `portal_id NULL`
--    para o conteúdo próprio; aqui ele vira uma linha reservada e a
--    coluna é NOT NULL. O motivo é o §15.14 (vazamento entre portais é
--    risco crítico): com NULL, toda consulta precisaria de
--    `IS NOT DISTINCT FROM` e um esquecimento vira vazamento silencioso;
--    com sentinela, `WHERE portal_id = $1` é sempre correto e, se o
--    parâmetro vier nulo por bug, a consulta devolve zero linhas — falha
--    fechada, que é como uma falha de isolamento deve falhar.
--
-- 2. O ISOLAMENTO É DO BANCO, NÃO DA APLICAÇÃO. Cada tabela do catálogo
--    ganha `UNIQUE (id, portal_id)` e as filhas apontam para esse par por
--    chave estrangeira composta. Resultado: é fisicamente impossível
--    pendurar um assunto do portal 7 numa matéria do portal 3, ou dar a
--    um aluno do portal 7 licença de matéria do portal 3. O teste
--    automatizado do §15.14 continua necessário para a LEITURA; a
--    ESCRITA passa a ser garantida aqui.
--
-- 3. O NÚMERO USADO FICA GRAVADO. Percentual da venda, percentual de
--    retenção, preço — tudo é copiado para o registro no momento do fato,
--    nunca recalculado depois a partir do contrato vigente. É o que
--    permite auditar uma venda de dois anos atrás (§5.10.1) sem
--    reconstituir a história dos contratos.
--
-- Fora do escopo desta migração, por decisão do §5.10: domínio próprio do
-- professor (Fase 2 — a coluna já existe, sem uso), editor livre de
-- layout, cupons por portal e certificados.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Planos e portais
-- ---------------------------------------------------------------------

CREATE TYPE status_portal AS ENUM (
  'RASCUNHO',    -- criado, ainda não publicado
  'ATIVO',
  'SUSPENSO',    -- inadimplência (§5.10): fora do ar, aluno vigente continua
  'ENCERRADO'
);

-- O plano é a oferta comercial; o contrato (adiante) é o que foi de fato
-- acordado com aquele professor. Mudar o plano não altera contrato vivo.
CREATE TABLE portal_plano (
  id                       BIGSERIAL PRIMARY KEY,
  nome                     TEXT NOT NULL UNIQUE,
  licenca_mensal_centavos  INT NOT NULL CHECK (licenca_mensal_centavos >= 0),
  percentual_base          NUMERIC(5,2) NOT NULL CHECK (percentual_base >= 0 AND percentual_base <= 100),
  -- §5.10.1: pontos percentuais SOMADOS quando o aluno vem de anúncio nosso
  acrescimo_indicacao_pp   NUMERIC(5,2) NOT NULL DEFAULT 5.00
                             CHECK (acrescimo_indicacao_pp >= 0 AND acrescimo_indicacao_pp <= 100),
  gb_armazenamento         INT NOT NULL CHECK (gb_armazenamento >= 0),
  gb_banda_mes             INT NOT NULL CHECK (gb_banda_mes >= 0),
  -- §5.10: excedente é cobrado, não bloqueado
  centavos_por_gb_excedente INT NOT NULL CHECK (centavos_por_gb_excedente >= 0),
  ativo                    BOOLEAN NOT NULL DEFAULT true,
  criado_em                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT plano_percentual_total CHECK (percentual_base + acrescimo_indicacao_pp <= 100)
);

CREATE TABLE portal (
  id            BIGSERIAL PRIMARY KEY,
  -- A máscara (§5.10): o nome que o cliente escolhe e que vira
  -- <mascara>.aprimoreosaber.com.br. É por ela que o middleware resolve
  -- o tenant a partir do cabeçalho Host.
  mascara       TEXT NOT NULL,
  -- Fase 2 (upgrade pago): site.dominiodele.com.br apontado por CNAME.
  -- A coluna nasce aqui porque a resolução por Host já serve aos dois.
  dominio_proprio TEXT,
  professor_id  BIGINT REFERENCES usuario(id),
  plano_id      BIGINT REFERENCES portal_plano(id),
  status        status_portal NOT NULL DEFAULT 'RASCUNHO',
  nome_exibicao TEXT NOT NULL,
  -- Conteúdo da página única (§5.10): chamada, propósito, foto, cores.
  -- JSONB porque o professor preenche campos de um layout fixo — não é
  -- estrutura livre, e por isso não merece tabela por seção.
  personalizacao JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Identificador da subconta no gateway (walletId do Asaas). É para cá
  -- que o split manda a parte dele.
  gateway_wallet_id TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  publicado_em  TIMESTAMPTZ,
  suspenso_em   TIMESTAMPTZ,
  encerrado_em  TIMESTAMPTZ,

  -- Formato da máscara: minúscula, dígito e hífen; nem começa nem termina
  -- com hífen. O que não couber aqui não vira subdomínio válido.
  CONSTRAINT portal_mascara_formato CHECK (
    id = 0 OR mascara ~ '^[a-z0-9]([a-z0-9-]{1,30})?[a-z0-9]$'
  ),
  -- O portal 0 é a plataforma: não tem professor, nem plano, nem cobrança.
  -- Qualquer outro precisa dos dois para existir de verdade.
  CONSTRAINT portal_plataforma_reservada CHECK (
    (id = 0 AND professor_id IS NULL AND plano_id IS NULL) OR
    (id <> 0 AND professor_id IS NOT NULL AND plano_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX portal_mascara_unica ON portal (lower(mascara));
CREATE UNIQUE INDEX portal_dominio_unico ON portal (lower(dominio_proprio))
  WHERE dominio_proprio IS NOT NULL;
CREATE INDEX portal_professor_idx ON portal (professor_id);

-- A linha reservada. Todo o conteúdo que já existe passa a ser dela.
INSERT INTO portal (id, mascara, nome_exibicao, status, publicado_em)
VALUES (0, 'plataforma', 'Aprimore o Saber', 'ATIVO', now());

COMMENT ON TABLE portal IS
  'Tenant. A linha id=0 é a própria plataforma e não pode ser removida (§5.10).';

-- §5.10: a máscara não pode colidir com rota do sistema, marca de
-- terceiro ou termo ofensivo. Tabela em vez de constante no código porque
-- a lista cresce com a operação — e cada bloqueio precisa de motivo
-- registrado para o atendimento saber o que responder.
CREATE TABLE mascara_reservada (
  nome    TEXT PRIMARY KEY,
  motivo  TEXT NOT NULL
);

INSERT INTO mascara_reservada (nome, motivo) VALUES
  ('www',        'ROTA'), ('api',       'ROTA'), ('admin',     'ROTA'),
  ('app',        'ROTA'), ('blog',      'ROTA'), ('planos',    'ROTA'),
  ('catalogo',   'ROTA'), ('aula',      'ROTA'), ('materia',   'ROTA'),
  ('vademecum',  'ROTA'), ('vagas',     'ROTA'), ('conta',     'ROTA'),
  ('painel',     'ROTA'), ('checkout',  'ROTA'), ('entrar',    'ROTA'),
  ('cadastrar',  'ROTA'), ('plataforma','ROTA'),
  ('mail',       'INFRA'), ('smtp',     'INFRA'), ('ftp',      'INFRA'),
  ('cdn',        'INFRA'), ('static',   'INFRA'), ('midia',    'INFRA'),
  ('suporte',    'MARCA'), ('ajuda',    'MARCA'), ('oficial',  'MARCA'),
  ('aprimore',   'MARCA'), ('aprimoreosaber', 'MARCA');

-- ---------------------------------------------------------------------
-- Contrato do portal — versionado, como `preco` (§5.9)
-- ---------------------------------------------------------------------
--
-- Mesma razão da tabela de preços: condição nova vale a partir de uma
-- data, sem afetar o que já está em curso, e o histórico fica auditável.
-- Aqui isso não é conforto: é o que resolve a disputa do §15.12 sobre
-- quanto se cobrou por uma venda de um ano atrás.

CREATE TABLE portal_contrato (
  id                     BIGSERIAL PRIMARY KEY,
  portal_id              BIGINT NOT NULL REFERENCES portal(id) ON DELETE CASCADE,
  plano_id               BIGINT NOT NULL REFERENCES portal_plano(id),

  -- Copiados do plano no aceite: o plano pode mudar de preço amanhã, o
  -- contrato assinado não muda junto.
  licenca_mensal_centavos INT NOT NULL CHECK (licenca_mensal_centavos >= 0),
  percentual_base        NUMERIC(5,2) NOT NULL CHECK (percentual_base >= 0 AND percentual_base <= 100),
  acrescimo_indicacao_pp NUMERIC(5,2) NOT NULL DEFAULT 5.00
                           CHECK (acrescimo_indicacao_pp >= 0 AND acrescimo_indicacao_pp <= 100),
  -- §5.10.1: prazo entre o clique no nosso anúncio e a compra. 90 dias é
  -- premissa a confirmar; por isso é coluna, não constante.
  validade_clique_dias   INT NOT NULL DEFAULT 90 CHECK (validade_clique_dias > 0),

  -- §5.10: a proteção do reembolso de 7 dias do CDC num modelo com split.
  -- `dias_retencao` espelha o daysToExpire da Conta Escrow do Asaas — o
  -- valor cai na subconta do professor mas só fica sacável depois.
  dias_retencao          INT NOT NULL DEFAULT 30 CHECK (dias_retencao >= 0),
  -- Colchão adicional, aplicado por nós na apuração, para o chargeback
  -- que chega depois de a escrow ter liberado.
  percentual_reserva     NUMERIC(5,2) NOT NULL DEFAULT 0
                           CHECK (percentual_reserva >= 0 AND percentual_reserva <= 100),

  vigente_de             DATE NOT NULL,
  vigente_ate            DATE,               -- nulo = contrato em vigor
  aceito_em              TIMESTAMPTZ,
  aceito_ip              TEXT,
  criado_em              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT contrato_vigencia CHECK (vigente_ate IS NULL OR vigente_ate > vigente_de),
  CONSTRAINT contrato_percentual_total CHECK (percentual_base + acrescimo_indicacao_pp <= 100)
);

-- Um contrato em vigor por portal em cada momento.
CREATE UNIQUE INDEX portal_contrato_vigente_unico
  ON portal_contrato (portal_id) WHERE vigente_ate IS NULL;
CREATE INDEX portal_contrato_hist_idx ON portal_contrato (portal_id, vigente_de DESC);

-- §5.6: sem contrato aceito, o professor não publica. A regra vive na
-- aplicação (é fluxo, não invariante de linha), mas o dado que ela lê
-- está aqui: aceito_em preenchido e vigência aberta.

-- ---------------------------------------------------------------------
-- Escopo de portal no que já existe
-- ---------------------------------------------------------------------
--
-- Tudo o que já está no banco pertence à plataforma. Por isso
-- DEFAULT 0 antes do NOT NULL: as linhas existentes se resolvem sozinhas.

-- Área: cada portal organiza o acervo como quiser (§5.10, "classificado
-- por área e assunto"). O professor não é obrigado às nossas 7 áreas.
ALTER TABLE area ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE area DROP CONSTRAINT IF EXISTS area_slug_key;
ALTER TABLE area ADD CONSTRAINT area_slug_por_portal UNIQUE (portal_id, slug);
ALTER TABLE area ADD CONSTRAINT area_id_portal UNIQUE (id, portal_id);

-- Matéria: o `slug UNIQUE` global era a colisão anunciada no §5.10 — dois
-- professores com "Direito Penal" não podiam coexistir. Passa a ser único
-- por portal.
ALTER TABLE materia ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE materia DROP CONSTRAINT IF EXISTS materia_slug_key;
ALTER TABLE materia ADD CONSTRAINT materia_slug_por_portal UNIQUE (portal_id, slug);
ALTER TABLE materia ADD CONSTRAINT materia_id_portal UNIQUE (id, portal_id);
-- A matéria não pode estar numa área de outro portal.
ALTER TABLE materia ADD CONSTRAINT materia_area_mesmo_portal
  FOREIGN KEY (area_id, portal_id) REFERENCES area (id, portal_id);

-- §5.10: o professor decide, matéria a matéria, se ela aparece também na
-- nossa vitrine. Falso por padrão — compartilhar é ato deliberado.
ALTER TABLE materia ADD COLUMN na_vitrine_plataforma BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE assunto ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE assunto ADD CONSTRAINT assunto_id_portal UNIQUE (id, portal_id);
ALTER TABLE assunto ADD CONSTRAINT assunto_materia_mesmo_portal
  FOREIGN KEY (materia_id, portal_id) REFERENCES materia (id, portal_id);

-- Aula: mesmo problema do slug global da matéria, agravado porque
-- /aula/[slug] é rota pública.
ALTER TABLE aula ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE aula DROP CONSTRAINT IF EXISTS aula_slug_key;
ALTER TABLE aula ADD CONSTRAINT aula_slug_por_portal UNIQUE (portal_id, slug);
ALTER TABLE aula ADD CONSTRAINT aula_assunto_mesmo_portal
  FOREIGN KEY (assunto_id, portal_id) REFERENCES assunto (id, portal_id);

-- Usuário: base separada por portal (§5.10). O mesmo e-mail pode existir
-- na plataforma e no portal do professor — são pessoas jurídicas
-- diferentes como controladoras do dado, e o §5.10 tratou disso.
ALTER TABLE usuario ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_email_key;
DROP INDEX IF EXISTS usuario_email_unico;
-- Continua sem diferenciar caixa; agora dentro do portal.
CREATE UNIQUE INDEX usuario_email_por_portal ON usuario (portal_id, lower(email));
ALTER TABLE usuario ADD CONSTRAINT usuario_id_portal UNIQUE (id, portal_id);

-- Preço: cada portal tem a própria tabela de valores, com a mesma
-- mecânica de vigência do §5.9. Limitação assumida do MVP — o preço
-- continua sendo por produto × período, não por matéria; se o professor
-- precisar cobrar diferente por matéria, é migração posterior.
ALTER TABLE preco ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
DROP INDEX IF EXISTS preco_vigente_unico;
CREATE UNIQUE INDEX preco_vigente_unico
  ON preco (portal_id, produto, periodo) WHERE vigente_ate IS NULL;
DROP INDEX IF EXISTS preco_busca_idx;
CREATE INDEX preco_busca_idx ON preco (portal_id, produto, periodo, vigente_de DESC);

-- Licença: o passe CATALOGO de um portal não alcança o acervo de outro.
-- As duas chaves compostas abaixo tornam isso invariante de banco.
ALTER TABLE licenca ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE licenca ADD CONSTRAINT licenca_usuario_mesmo_portal
  FOREIGN KEY (usuario_id, portal_id) REFERENCES usuario (id, portal_id);
ALTER TABLE licenca ADD CONSTRAINT licenca_materia_mesmo_portal
  FOREIGN KEY (materia_id, portal_id) REFERENCES materia (id, portal_id);
CREATE INDEX licenca_portal_idx ON licenca (portal_id, usuario_id, status);

ALTER TABLE assinatura ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE assinatura ADD CONSTRAINT assinatura_usuario_mesmo_portal
  FOREIGN KEY (usuario_id, portal_id) REFERENCES usuario (id, portal_id);

-- ---------------------------------------------------------------------
-- Indicação — o acréscimo de 5 pontos (§5.10.1)
-- ---------------------------------------------------------------------
--
-- O vínculo nasce NO CLIQUE, não no checkout. É o que permite provar a
-- origem para o professor e o que impede que ele a apague: a linha já
-- existe antes de a venda acontecer, e ele não escreve nesta tabela.

CREATE TABLE indicacao (
  id           BIGSERIAL PRIMARY KEY,
  portal_id    BIGINT NOT NULL REFERENCES portal(id) ON DELETE CASCADE,
  -- Token assinado que viaja no link do anúncio.
  token        TEXT NOT NULL UNIQUE,
  -- Onde o clique aconteceu: 'VITRINE', 'ANUNCIO', 'BLOG'… serve ao
  -- relatório de qual canal converte, não à regra de cobrança.
  canal        TEXT NOT NULL DEFAULT 'VITRINE',
  criada_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- criada_em + validade_clique_dias do contrato, congelado na criação:
  -- mudar o contrato depois não estende clique que já aconteceu.
  expira_em    TIMESTAMPTZ NOT NULL,
  -- Preenchido quando o visitante se cadastra no portal.
  usuario_id   BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  -- §5.10.1: incide UMA vez. Consumida, nunca mais.
  consumida_em TIMESTAMPTZ,
  pedido_id    BIGINT,          -- FK adicionada depois de `pedido` mudar

  CONSTRAINT indicacao_validade CHECK (expira_em > criada_em),
  CONSTRAINT indicacao_consumo CHECK ((consumida_em IS NULL) = (pedido_id IS NULL))
);

CREATE INDEX indicacao_usuario_idx ON indicacao (portal_id, usuario_id)
  WHERE consumida_em IS NULL;

-- O aluno só pode ter uma indicação viva por portal: o segundo clique no
-- mesmo anúncio não gera cobrança nova nem duplica o vínculo.
CREATE UNIQUE INDEX indicacao_viva_por_aluno
  ON indicacao (portal_id, usuario_id)
  WHERE consumida_em IS NULL AND usuario_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- Pedido: de quem é a venda, e quanto se cobrou por ela
-- ---------------------------------------------------------------------

ALTER TABLE pedido ADD COLUMN portal_id BIGINT NOT NULL DEFAULT 0 REFERENCES portal(id);
ALTER TABLE pedido ADD CONSTRAINT pedido_usuario_mesmo_portal
  FOREIGN KEY (usuario_id, portal_id) REFERENCES usuario (id, portal_id);

-- O percentual EFETIVAMENTE aplicado, gravado no ato. Sem isto, auditar
-- uma venda antiga exigiria reconstruir qual contrato vigia naquele dia —
-- e é exatamente aí que nasce a disputa do §15.12.
ALTER TABLE pedido ADD COLUMN percentual_aplicado NUMERIC(5,2);
ALTER TABLE pedido ADD COLUMN indicacao_id BIGINT REFERENCES indicacao(id);
ALTER TABLE pedido ADD CONSTRAINT pedido_percentual_faixa
  CHECK (percentual_aplicado IS NULL OR (percentual_aplicado >= 0 AND percentual_aplicado <= 100));
-- Venda da plataforma não tem split nem indicação de portal.
ALTER TABLE pedido ADD CONSTRAINT pedido_plataforma_sem_split CHECK (
  portal_id <> 0 OR (percentual_aplicado IS NULL AND indicacao_id IS NULL)
);

ALTER TABLE indicacao ADD CONSTRAINT indicacao_pedido_fk
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE SET NULL;

CREATE INDEX pedido_portal_idx ON pedido (portal_id, criado_em DESC);

-- ---------------------------------------------------------------------
-- Consumo e fatura mensal do professor
-- ---------------------------------------------------------------------
--
-- §5.10: vídeo é o custo real, e a medição por portal deixa de ser
-- observabilidade para virar insumo de faturamento. Uma linha por portal
-- por competência; o coletor atualiza a mesma linha ao longo do mês.

CREATE TABLE portal_consumo (
  portal_id         BIGINT NOT NULL REFERENCES portal(id) ON DELETE CASCADE,
  competencia       DATE NOT NULL,          -- sempre dia 1 do mês
  bytes_armazenados BIGINT NOT NULL DEFAULT 0 CHECK (bytes_armazenados >= 0),
  bytes_trafegados  BIGINT NOT NULL DEFAULT 0 CHECK (bytes_trafegados >= 0),
  medido_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (portal_id, competencia),
  CONSTRAINT consumo_competencia_dia1 CHECK (date_trunc('month', competencia) = competencia)
);

CREATE TYPE status_fatura_portal AS ENUM ('ABERTA', 'FECHADA', 'PAGA', 'EM_ATRASO', 'CANCELADA');

CREATE TABLE portal_fatura (
  id                    BIGSERIAL PRIMARY KEY,
  portal_id             BIGINT NOT NULL REFERENCES portal(id) ON DELETE CASCADE,
  contrato_id           BIGINT NOT NULL REFERENCES portal_contrato(id),
  competencia           DATE NOT NULL,
  -- As linhas da fatura (§5.10): licença do plano, excedente de mídia e
  -- os ajustes do período — reembolsos e chargebacks que já não puderam
  -- ser descontados na escrow.
  centavos_licenca      INT NOT NULL DEFAULT 0 CHECK (centavos_licenca >= 0),
  centavos_excedente    INT NOT NULL DEFAULT 0 CHECK (centavos_excedente >= 0),
  centavos_ajustes      INT NOT NULL DEFAULT 0,   -- pode ser negativo
  centavos_total        INT NOT NULL DEFAULT 0,
  status                status_fatura_portal NOT NULL DEFAULT 'ABERTA',
  vencimento            DATE,
  -- Cobrança correspondente no gateway, para conciliar o webhook.
  cobranca_externa_id   TEXT,
  fechada_em            TIMESTAMPTZ,
  paga_em               TIMESTAMPTZ,
  criada_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fatura_competencia_dia1 CHECK (date_trunc('month', competencia) = competencia)
);

-- Uma fatura por portal por mês. Fechar duas vezes é cobrar duas vezes.
CREATE UNIQUE INDEX portal_fatura_unica ON portal_fatura (portal_id, competencia);
CREATE INDEX portal_fatura_cobranca_idx ON portal_fatura (status, vencimento);

-- ---------------------------------------------------------------------
-- Plano de partida
-- ---------------------------------------------------------------------
-- Números provisórios: a decisão 13 do §16 ainda está aberta e depende do
-- custo real de CDN por aula. Estão aqui para o piloto rodar, não para
-- virar tabela pública.

INSERT INTO portal_plano
  (nome, licenca_mensal_centavos, percentual_base, acrescimo_indicacao_pp,
   gb_armazenamento, gb_banda_mes, centavos_por_gb_excedente)
VALUES
  ('Piloto', 14900, 10.00, 5.00, 50, 200, 90);
