-- =====================================================================
-- Seed — catálogo do §4 do discovery e o conteúdo da 1ª onda.
-- As 3 matérias da 1ª onda seguem a sugestão do §16.1 (a confirmar):
-- Introdução ao Direito, Carreiras Jurídicas e Noções de Constitucional.
-- =====================================================================

-- ---------- As 7 áreas do mapa definitivo ----------
INSERT INTO area (slug, nome, ordem) VALUES
  ('fundamentos',    'Fundamentos',    1),
  ('direito-publico','Direito Público',2),
  ('direito-privado','Direito Privado',3),
  ('penal',          'Penal',          4),
  ('trabalho',       'Trabalho',       5),
  ('processo',       'Processo',       6),
  ('profissional',   'Profissional',   7);

-- ---------- As 11 matérias do catálogo de partida ----------
INSERT INTO materia (area_id, slug, nome, ementa, onda, status, professor, ordem) VALUES
  ((SELECT id FROM area WHERE slug='fundamentos'), 'introducao-ao-direito',
   'Introdução ao Direito',
   'Norma, Constituição, justiça, moral e ética, conflito, técnica jurídica, escolas e fontes do Direito.',
   1, 'publicado', 'Prof. Daniel Prado', 1),

  ((SELECT id FROM area WHERE slug='fundamentos'), 'carreiras-juridicas',
   'Carreiras Jurídicas',
   'Juiz, promotor, defensor público, procurador, advogado, analista, técnico, oficial de justiça e carreiras policiais.',
   1, 'publicado', 'Prof.ª Luiza Andrade', 2),

  ((SELECT id FROM area WHERE slug='fundamentos'), 'breve-historia-do-direito',
   'Breve História do Direito',
   'O Direito nos povos primitivos, na Grécia e na Roma antigas, na Idade Média, Moderna e Contemporânea.',
   2, 'rascunho', NULL, 3),

  ((SELECT id FROM area WHERE slug='fundamentos'), 'filosofia-do-direito',
   'Filosofia do Direito',
   'Por que as coisas são como são — ou como deveriam ser. Contato transformador com os grandes pensadores.',
   2, 'rascunho', NULL, 4),

  ((SELECT id FROM area WHERE slug='direito-publico'), 'nocoes-de-direito-constitucional',
   'Noções de Direito Constitucional',
   'Poderes Executivo, Legislativo e Judiciário, direitos políticos e direitos fundamentais.',
   1, 'publicado', 'Prof.ª Camila Rocha', 1),

  ((SELECT id FROM area WHERE slug='direito-publico'), 'nocoes-de-direito-administrativo',
   'Noções de Direito Administrativo',
   'Poderes e responsabilidades da Administração Pública — atenção especial para quem mira concurso público.',
   2, 'rascunho', NULL, 2),

  ((SELECT id FROM area WHERE slug='direito-privado'), 'teoria-geral-do-direito-civil',
   'Teoria Geral do Direito Civil',
   'Personalidade e capacidade civil, direitos da personalidade, pessoas jurídicas de direito público e privado.',
   2, 'rascunho', NULL, 1),

  ((SELECT id FROM area WHERE slug='direito-privado'), 'direito-do-consumidor',
   'Direito do Consumidor',
   'Consumidor e fornecedor, produtos e serviços, vício e defeito, responsabilidade civil do fornecedor.',
   2, 'rascunho', NULL, 2),

  ((SELECT id FROM area WHERE slug='penal'), 'nocoes-de-direito-penal',
   'Noções de Direito Penal',
   'Principais princípios, aplicação da lei penal, teoria geral do crime e sanções.',
   2, 'rascunho', NULL, 1),

  ((SELECT id FROM area WHERE slug='penal'), 'criminologia',
   'Criminologia',
   'A ciência que estuda o crime e o infrator, para captar informações e reduzir delitos na sociedade.',
   3, 'rascunho', NULL, 2),

  ((SELECT id FROM area WHERE slug='processo'), 'teoria-geral-do-processo',
   'Teoria Geral do Processo',
   'Formas de resolução de conflitos, princípios processuais, petição inicial e atos dos magistrados.',
   2, 'rascunho', NULL, 1);

-- ---------- Legislação do vade-mécum ----------
INSERT INTO norma (slug, sigla, nome, conferido_em, ordem) VALUES
  ('cf-88', 'CF/88', 'Constituição da República Federativa do Brasil de 1988', '2026-08-28', 1),
  ('cdc',   'CDC',   'Lei 8.078/90 — Código de Defesa do Consumidor',          '2026-08-28', 2),
  ('cc',    'CC',    'Lei 10.406/02 — Código Civil',                            '2026-08-28', 3),
  ('cp',    'CP',    'Decreto-Lei 2.848/40 — Código Penal',                     '2026-08-28', 4);

INSERT INTO dispositivo (norma_id, rotulo, texto, agrupador, ordem) VALUES
  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 1º',
   'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos: I — a soberania; II — a cidadania; III — a dignidade da pessoa humana; IV — os valores sociais do trabalho e da livre iniciativa; V — o pluralismo político.',
   'Título I — Dos Princípios Fundamentais', 1),

  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 5º',
   'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes: I — homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição; II — ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei; III — ninguém será submetido a tortura nem a tratamento desumano ou degradante.',
   'Título II — Dos Direitos e Garantias Fundamentais', 2),

  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 5º, § 1º',
   'As normas definidoras dos direitos e garantias fundamentais têm aplicação imediata.',
   'Título II — Dos Direitos e Garantias Fundamentais', 3),

  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 5º, § 3º',
   'Os tratados e convenções internacionais sobre direitos humanos que forem aprovados, em cada Casa do Congresso Nacional, em dois turnos, por três quintos dos votos dos respectivos membros, serão equivalentes às emendas constitucionais.',
   'Título II — Dos Direitos e Garantias Fundamentais', 4),

  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 6º',
   'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.',
   'Título II — Dos Direitos e Garantias Fundamentais', 5),

  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 60, § 4º',
   'Não será objeto de deliberação a proposta de emenda tendente a abolir: I — a forma federativa de Estado; II — o voto direto, secreto, universal e periódico; III — a separação dos Poderes; IV — os direitos e garantias individuais.',
   'Título IV — Da Organização dos Poderes', 6),

  ((SELECT id FROM norma WHERE slug='cf-88'), 'Art. 2º',
   'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
   'Título I — Dos Princípios Fundamentais', 7),

  ((SELECT id FROM norma WHERE slug='cdc'), 'Art. 49',
   'O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço, sempre que a contratação de fornecimento de produtos e serviços ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicílio.',
   'Da Proteção Contratual', 1),

  ((SELECT id FROM norma WHERE slug='cdc'), 'Art. 30',
   'Toda informação ou publicidade, suficientemente precisa, veiculada por qualquer forma ou meio de comunicação com relação a produtos e serviços oferecidos ou apresentados, obriga o fornecedor que a fizer veicular ou dela se utilizar e integra o contrato que vier a ser celebrado.',
   'Da Oferta', 2),

  ((SELECT id FROM norma WHERE slug='cc'), 'Art. 1º',
   'Toda pessoa é capaz de direitos e deveres na ordem civil.',
   'Das Pessoas Naturais', 1),

  ((SELECT id FROM norma WHERE slug='cp'), 'Art. 1º',
   'Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.',
   'Da Aplicação da Lei Penal', 1);
