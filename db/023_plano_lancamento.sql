-- =====================================================================
-- Preço de lançamento do Portal do Professor — decisão de 03/09/2026
-- (§5.10.3 do discovery encerra a decisão 13 do §16).
--
-- O seed 'Piloto' da migração 018 era número de desenvolvimento. Este é o
-- preço calculado: levantamento de custo (Bunny Stream, Conta Escrow,
-- taxas Asaas, infra) contra o mercado (Hotmart 9,9% + R$1 sem
-- mensalidade; plataformas white-label R$150–300/mês sem percentual).
-- R$149 + 10% deixa o atrito total do professor (~13% + mensalidade)
-- na altura da Hotmart, entregando junto o site próprio.
--
-- Cotas: 100 GB guardam ~50 h de aula; 300 GB/mês servem ~430 h
-- assistidas. O excedente de R$ 0,40/GB cobre até o pior caso de banda
-- medido (POP América do Sul, ~R$ 0,23/GB) sem virar multa.
-- =====================================================================

UPDATE portal_plano
   SET nome                      = 'Portal do Professor',
       licenca_mensal_centavos   = 14900,
       percentual_base           = 10.00,
       acrescimo_indicacao_pp    = 5.00,
       gb_armazenamento          = 100,
       gb_banda_mes              = 300,
       centavos_por_gb_excedente = 40
 WHERE nome = 'Piloto';

-- ---------------------------------------------------------------------
-- A fatura do portal ganha o que falta para ser COBRÁVEL (etapa 1 do
-- §5.10.2): uma referência própria para o webhook do gateway achá-la, e
-- espaço para os dados da cobrança (copia-e-cola do Pix etc.).
--
-- A referência tem prefixo próprio ('PF-') para o webhook distinguir
-- fatura de portal de pedido de aluno sem consultar duas tabelas.
-- ---------------------------------------------------------------------

ALTER TABLE portal_fatura ADD COLUMN referencia TEXT UNIQUE;
ALTER TABLE portal_fatura ADD COLUMN detalhe JSONB;

-- A 1ª mensalidade nasce junto com o portal (autosserviço): a fatura
-- passa a poder existir antes de o mês fechar, com competência do mês
-- corrente. Nada muda na estrutura — só fica registrado o porquê.
