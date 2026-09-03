-- =====================================================================
-- Subconta do professor no gateway — etapa 2 do §5.10.2.
--
-- O dinheiro da venda do portal NÃO passa pela nossa conta: o split
-- divide na liquidação (decisão do §5.10), a parte do professor cai na
-- subconta dele e fica retida pela Conta Escrow pelo prazo do contrato
-- (`dias_retencao`) — é o que protege o reembolso de 7 dias do CDC.
--
-- O ciclo da subconta é assíncrono como no gateway real: nasce
-- EM_ANALISE quando o portal ativa, e a aprovação (ou recusa) chega por
-- webhook. Enquanto não estiver APROVADA com escrow habilitada, o portal
-- NÃO VENDE — essa é a trava que impede o cenário em que o professor
-- vende e a receita dele cai no nosso caixa.
-- =====================================================================

CREATE TYPE situacao_subconta AS ENUM (
  'PENDENTE',     -- portal ainda não pediu a subconta
  'EM_ANALISE',   -- criada no gateway, documentos em avaliação
  'APROVADA',     -- pode receber split; escrow habilitada em seguida
  'RECUSADA'      -- gateway negou; caso de suporte, não de retry cego
);

ALTER TABLE portal
  ADD COLUMN gateway_subconta_id  TEXT UNIQUE,
  ADD COLUMN subconta_situacao    situacao_subconta NOT NULL DEFAULT 'PENDENTE',
  -- Espelho do daysToExpire da Conta Escrow (§8.2), copiado do contrato
  -- no momento da habilitação: mudar o contrato depois não mexe na
  -- escrow já configurada sem um ato explícito.
  ADD COLUMN escrow_dias          INT,
  ADD COLUMN escrow_habilitada_em TIMESTAMPTZ;

-- Situação avançada exige a subconta correspondente; e escrow habilitada
-- só existe sobre subconta aprovada.
ALTER TABLE portal ADD CONSTRAINT portal_subconta_coerente CHECK (
  (subconta_situacao = 'PENDENTE' AND gateway_subconta_id IS NULL) OR
  (subconta_situacao <> 'PENDENTE' AND gateway_subconta_id IS NOT NULL)
);
ALTER TABLE portal ADD CONSTRAINT portal_escrow_sobre_aprovada CHECK (
  escrow_habilitada_em IS NULL OR subconta_situacao = 'APROVADA'
);

-- A plataforma (portal 0) não tem subconta: ela É a conta principal.
ALTER TABLE portal ADD CONSTRAINT portal_plataforma_sem_subconta CHECK (
  id <> 0 OR (gateway_subconta_id IS NULL AND subconta_situacao = 'PENDENTE')
);
