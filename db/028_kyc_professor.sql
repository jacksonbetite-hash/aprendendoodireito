-- §8.2: o gateway real não abre a subconta só com CNPJ e e-mail — exige
-- telefone, renda e endereço do responsável. Coletados no autosserviço e
-- guardados aqui para a abertura (e reabertura) da subconta.
ALTER TABLE portal
  ADD COLUMN responsavel_telefone text,
  ADD COLUMN responsavel_renda_centavos integer
    CHECK (responsavel_renda_centavos IS NULL OR responsavel_renda_centavos > 0),
  ADD COLUMN responsavel_endereco jsonb;
