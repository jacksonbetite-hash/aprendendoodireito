-- =====================================================================
-- O aluno busca pelo nome que aprendeu na aula ("cláusula pétrea"),
-- não pela literalidade da lei — o art. 60, §4º nunca usa a expressão.
-- Apelidos entram no índice para fechar essa lacuna.
-- =====================================================================
ALTER TABLE dispositivo DROP COLUMN busca;
ALTER TABLE dispositivo ADD COLUMN apelidos TEXT;

ALTER TABLE dispositivo ADD COLUMN busca tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(rotulo, '')),   'A') ||
    setweight(to_tsvector('portuguese', coalesce(apelidos, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(texto, '')),    'C')
  ) STORED;
CREATE INDEX dispositivo_busca_idx ON dispositivo USING GIN (busca);

UPDATE dispositivo SET apelidos = 'cláusula pétrea cláusulas pétreas limites materiais ao poder de emenda'
 WHERE rotulo = 'Art. 60, § 4º';
UPDATE dispositivo SET apelidos = 'direitos e garantias fundamentais igualdade caput do artigo quinto'
 WHERE rotulo = 'Art. 5º';
UPDATE dispositivo SET apelidos = 'aplicação imediata das normas de direitos fundamentais'
 WHERE rotulo = 'Art. 5º, § 1º';
UPDATE dispositivo SET apelidos = 'tratados internacionais de direitos humanos status de emenda rito especial'
 WHERE rotulo = 'Art. 5º, § 3º';
UPDATE dispositivo SET apelidos = 'direitos sociais'                         WHERE rotulo = 'Art. 6º';
UPDATE dispositivo SET apelidos = 'separação dos poderes tripartição'        WHERE rotulo = 'Art. 2º';
UPDATE dispositivo SET apelidos = 'fundamentos da república dignidade da pessoa humana estado democrático de direito'
 WHERE rotulo = 'Art. 1º' AND norma_id = (SELECT id FROM norma WHERE slug='cf-88');
UPDATE dispositivo SET apelidos = 'direito de arrependimento prazo de sete dias compra fora do estabelecimento'
 WHERE rotulo = 'Art. 49';
UPDATE dispositivo SET apelidos = 'oferta vincula o fornecedor publicidade obriga'
 WHERE rotulo = 'Art. 30';
UPDATE dispositivo SET apelidos = 'princípio da legalidade penal anterioridade da lei penal nullum crimen'
 WHERE rotulo = 'Art. 1º' AND norma_id = (SELECT id FROM norma WHERE slug='cp');
UPDATE dispositivo SET apelidos = 'capacidade de direito personalidade civil'
 WHERE rotulo = 'Art. 1º' AND norma_id = (SELECT id FROM norma WHERE slug='cc');
