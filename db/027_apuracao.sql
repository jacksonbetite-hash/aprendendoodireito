-- =====================================================================
-- Apuração e repasse da comissão de vitrine — §5.6.1 do discovery.
--
-- Quando um aluno DA PLATAFORMA compra um curso de professor parceiro
-- (§5.10.2, etapa 5), a venda é nossa e o professor recebe comissão. A
-- comissão está gravada venda a venda em `pedido.comissao_professor_pp`;
-- o que faltava era o FECHAMENTO: consolidar o mês, dar ao professor o
-- extrato para conferir, receber a nota fiscal e registrar o pagamento.
--
-- O ciclo do §5.6.1, como estados:
--
--   EM_CONFERENCIA → (CONTESTADA →) APROVADA → PAGA
--   ACUMULADA      — comissão abaixo do mínimo de saque (R$ 100): o
--                    saldo entra na apuração do mês seguinte
--   INCORPORADA    — apuração acumulada que já entrou numa posterior
--   SEM_VALOR      — mês sem venda nem saldo: registra que se apurou
--
-- Cada venda entra UMA vez (no mês do pagamento) e cada reembolso entra
-- UMA vez (no mês em que ocorreu, como dedução) — o UNIQUE (pedido_id,
-- tipo) faz o banco garantir isso, não a rotina.
-- =====================================================================

CREATE TYPE status_apuracao AS ENUM (
  'EM_CONFERENCIA', 'CONTESTADA', 'APROVADA', 'PAGA',
  'ACUMULADA', 'INCORPORADA', 'SEM_VALOR'
);

CREATE TABLE apuracao (
  id                      BIGSERIAL PRIMARY KEY,
  portal_id               BIGINT NOT NULL REFERENCES portal(id) ON DELETE CASCADE,
  competencia             DATE NOT NULL,
  status                  status_apuracao NOT NULL,
  centavos_vendas         INT NOT NULL DEFAULT 0,   -- bruto vendido no mês
  centavos_reembolsos     INT NOT NULL DEFAULT 0,   -- bruto devolvido no mês
  centavos_saldo_anterior INT NOT NULL DEFAULT 0,   -- comissão acumulada de meses anteriores
  centavos_comissao       INT NOT NULL DEFAULT 0,   -- o que se repassa (pode ser negativo: carrega)
  apurada_em              TIMESTAMPTZ NOT NULL DEFAULT now(),
  apurada_por             TEXT NOT NULL,
  -- §5.6.1: 5 dias para o professor contestar o extrato
  prazo_contestacao       DATE NOT NULL,
  contestacao             TEXT,
  contestada_em           TIMESTAMPTZ,
  resposta                TEXT,                     -- o que o admin respondeu à contestação
  aprovada_em             TIMESTAMPTZ,
  nf_numero               TEXT,
  nf_em                   TIMESTAMPTZ,
  comprovante             TEXT,                     -- referência do Pix/TED, ou caminho do arquivo
  paga_em                 TIMESTAMPTZ,
  incorporada_em          BIGINT REFERENCES apuracao(id),
  CONSTRAINT apuracao_competencia_dia1 CHECK (date_trunc('month', competencia) = competencia),
  CONSTRAINT apuracao_unica UNIQUE (portal_id, competencia),
  -- Pagamento só com nota, e nota só depois de aprovada: é a ordem do §5.6.1.
  CONSTRAINT apuracao_paga_com_nota CHECK (status <> 'PAGA' OR (nf_numero IS NOT NULL AND paga_em IS NOT NULL)),
  CONSTRAINT apuracao_incorporada_aponta CHECK ((status = 'INCORPORADA') = (incorporada_em IS NOT NULL))
);
CREATE INDEX apuracao_pendentes_idx ON apuracao (status, prazo_contestacao);

CREATE TYPE tipo_item_apuracao AS ENUM ('VENDA', 'REEMBOLSO', 'SALDO_ANTERIOR');

CREATE TABLE apuracao_item (
  id                 BIGSERIAL PRIMARY KEY,
  apuracao_id        BIGINT NOT NULL REFERENCES apuracao(id) ON DELETE CASCADE,
  tipo               tipo_item_apuracao NOT NULL,
  pedido_id          BIGINT REFERENCES pedido(id) ON DELETE SET NULL,
  apuracao_origem_id BIGINT REFERENCES apuracao(id),
  descricao          TEXT NOT NULL,
  centavos_base      INT NOT NULL,                  -- o valor da venda/reembolso/saldo
  comissao_pp        NUMERIC(5,2),
  centavos_comissao  INT NOT NULL,                  -- + na venda, − no reembolso
  -- Uma venda entra uma vez; um reembolso entra uma vez.
  CONSTRAINT apuracao_item_unico UNIQUE (pedido_id, tipo)
);
CREATE INDEX apuracao_item_apuracao_idx ON apuracao_item (apuracao_id);
