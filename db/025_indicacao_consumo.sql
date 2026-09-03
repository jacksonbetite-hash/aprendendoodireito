-- =====================================================================
-- Indicação: a coerência entre consumo e pedido (§5.10.1) estava rígida
-- demais e brigava com a própria chave estrangeira.
--
-- `indicacao.pedido_id` é ON DELETE SET NULL (a indicação sobrevive ao
-- pedido — é o registro do clique, prova de origem numa disputa). Mas o
-- CHECK original exigia (consumida_em IS NULL) = (pedido_id IS NULL): ao
-- apagar um pedido que consumiu a indicação, o SET NULL deixava
-- `consumida_em` preenchido e `pedido_id` vazio, e o banco recusava a
-- própria ação em cascata. Descoberto pela limpeza dos testes da etapa 4.
--
-- A invariante que importa é uma só: "aponta para pedido" implica
-- "consumida". Consumida sem pedido é um estado legítimo — o pedido foi
-- removido — e continua contando como gasta (indicacaoViva olha só
-- consumida_em).
-- =====================================================================

ALTER TABLE indicacao DROP CONSTRAINT indicacao_consumo;
ALTER TABLE indicacao ADD CONSTRAINT indicacao_consumo
  CHECK (pedido_id IS NULL OR consumida_em IS NOT NULL);
