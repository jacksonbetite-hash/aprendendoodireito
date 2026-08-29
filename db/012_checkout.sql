-- =====================================================================
-- Checkout, assinatura e reembolso — §8 e §6.6 do discovery.
--
-- `assinatura` (contrato de cobrança recorrente) e `licenca` (direito de
-- acesso) já eram separadas no §11; aqui a cobrança ganha corpo:
-- pedido → pagamento → licença. O webhook do gateway precisa ser
-- idempotente (§8.3): o mesmo evento pode chegar duas vezes e NUNCA
-- pode liberar duas licenças.
-- =====================================================================

CREATE TYPE meio_pagamento AS ENUM ('PIX', 'CARTAO', 'PIX_AUTOMATICO');
CREATE TYPE status_pedido  AS ENUM ('ABERTO', 'PAGO', 'EXPIRADO', 'CANCELADO', 'REEMBOLSADO');
CREATE TYPE status_assinatura AS ENUM ('ATIVA', 'EM_ATRASO', 'CANCELADA', 'ENCERRADA');

CREATE TABLE assinatura (
  id              BIGSERIAL PRIMARY KEY,
  usuario_id      BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  escopo          escopo_licenca NOT NULL,
  materia_id      BIGINT REFERENCES materia(id),
  periodo         periodo_preco NOT NULL,
  meio            meio_pagamento NOT NULL,
  status          status_assinatura NOT NULL DEFAULT 'ATIVA',
  proxima_cobranca DATE,
  cancelada_em    TIMESTAMPTZ,
  protocolo_cancelamento TEXT,          -- §6.6: cancelar gera protocolo
  criada_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT assinatura_escopo CHECK (
    (escopo = 'CATALOGO' AND materia_id IS NULL) OR
    (escopo = 'MATERIA'  AND materia_id IS NOT NULL)
  )
);
CREATE INDEX assinatura_usuario_idx ON assinatura (usuario_id, status);

CREATE TABLE pedido (
  id            BIGSERIAL PRIMARY KEY,
  referencia    TEXT NOT NULL UNIQUE,   -- identificador mostrado ao aluno
  usuario_id    BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  escopo        escopo_licenca NOT NULL,
  materia_id    BIGINT REFERENCES materia(id),
  periodo       periodo_preco NOT NULL,
  centavos      INT NOT NULL CHECK (centavos >= 0),
  meio          meio_pagamento NOT NULL,
  status        status_pedido NOT NULL DEFAULT 'ABERTO',
  assinatura_id BIGINT REFERENCES assinatura(id),
  expira_em     TIMESTAMPTZ NOT NULL,
  pago_em       TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pedido_escopo CHECK (
    (escopo = 'CATALOGO' AND materia_id IS NULL) OR
    (escopo = 'MATERIA'  AND materia_id IS NOT NULL)
  )
);
CREATE INDEX pedido_usuario_idx ON pedido (usuario_id, criado_em DESC);

CREATE TABLE pagamento (
  id             BIGSERIAL PRIMARY KEY,
  pedido_id      BIGINT NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
  meio           meio_pagamento NOT NULL,
  centavos       INT NOT NULL,
  -- dados do meio: no Pix, o copia-e-cola; no cartão, só os 4 últimos
  -- dígitos e a bandeira. Número de cartão nunca passa por aqui
  -- (PCI-DSS SAQ-A: quem captura é o gateway).
  detalhe        JSONB,
  confirmado_em  TIMESTAMPTZ,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- §8.3: idempotência do webhook. O identificador do evento no gateway é
-- único; processar de novo vira no-op em vez de segunda licença.
CREATE TABLE evento_gateway (
  id            BIGSERIAL PRIMARY KEY,
  provedor      TEXT NOT NULL,
  evento_id     TEXT NOT NULL,
  tipo          TEXT NOT NULL,
  corpo         JSONB NOT NULL,
  processado_em TIMESTAMPTZ,
  resultado     TEXT,
  recebido_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provedor, evento_id)
);

CREATE TABLE reembolso (
  id           BIGSERIAL PRIMARY KEY,
  pedido_id    BIGINT NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
  centavos     INT NOT NULL,
  motivo       TEXT NOT NULL,
  protocolo    TEXT NOT NULL UNIQUE,
  solicitado_por TEXT NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Liga a licença ao contrato e ao pedido que a originaram. O ponteiro
-- vive só deste lado: se `pedido` também apontasse para `licenca`, a
-- referência ficaria circular e nenhum dos dois poderia ser removido.
ALTER TABLE licenca ADD COLUMN assinatura_id BIGINT REFERENCES assinatura(id);
ALTER TABLE licenca ADD COLUMN pedido_id BIGINT REFERENCES pedido(id) ON DELETE SET NULL;
