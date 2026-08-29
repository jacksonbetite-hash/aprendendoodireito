-- =====================================================================
-- Conteúdo da 1ª onda: assuntos, aulas e exercícios.
-- §5.3: toda aula publicada tem vídeo, resumo, dispositivos vinculados e
-- exercício com no mínimo 5 questões, com comentário em toda alternativa.
-- =====================================================================

-- ---------- Noções de Direito Constitucional ----------
INSERT INTO assunto (materia_id, slug, nome, ordem) VALUES
  ((SELECT id FROM materia WHERE slug='nocoes-de-direito-constitucional'), 'constituicao-e-estado', 'A Constituição e o Estado', 1),
  ((SELECT id FROM materia WHERE slug='nocoes-de-direito-constitucional'), 'direitos-fundamentais', 'Direitos e garantias fundamentais', 2),
  ((SELECT id FROM materia WHERE slug='nocoes-de-direito-constitucional'), 'organizacao-dos-poderes', 'Organização dos Poderes', 3);

INSERT INTO aula (assunto_id, slug, titulo, duracao_segundos, resumo, amostra_gratuita, no_trial, status, ordem) VALUES
  ((SELECT id FROM assunto WHERE slug='constituicao-e-estado'),
   'o-que-e-uma-constituicao', 'O que é uma Constituição, afinal', 552,
   'Constituição é a norma que organiza o Estado e limita o poder de quem governa. Ela diz quem manda, até onde manda e o que nem a maioria pode tirar de você.

Toda Constituição faz duas coisas ao mesmo tempo: organiza (cria os Poderes, define competências, desenha a federação) e limita (lista direitos que o Estado precisa respeitar). Por isso se diz que ela é, ao mesmo tempo, um manual de instruções e uma cerca.

A CF/88 é rígida: mudar seu texto exige processo mais difícil que o de uma lei comum — dois turnos em cada Casa e três quintos dos votos. É isso que a coloca no topo da hierarquia: nenhuma lei pode contrariá-la, e a que contraria é inconstitucional.',
   true, true, 'publicado', 1),

  ((SELECT id FROM assunto WHERE slug='constituicao-e-estado'),
   'poder-constituinte', 'Poder constituinte: quem escreve a Constituição', 724,
   'Poder constituinte originário é o que cria uma Constituição nova, do zero. Não obedece à Constituição anterior — é ele que rompe com ela. É inicial, ilimitado juridicamente e incondicionado.

Poder constituinte derivado é o que a própria Constituição cria para alterá-la depois: é o poder de emenda. Esse, sim, tem limites — formais (o rito do art. 60), circunstanciais (não se emenda sob intervenção federal, estado de defesa ou de sítio) e materiais (as cláusulas pétreas).

A confusão comum: achar que o poder de emenda é "quase constituinte". Não é. Ele nasce dentro da Constituição e por isso pode ser declarado inconstitucional.',
   false, true, 'publicado', 2),

  ((SELECT id FROM assunto WHERE slug='direitos-fundamentais'),
   'direitos-fundamentais-na-pratica', 'Direitos fundamentais: o que são, na prática', 702,
   'Direito fundamental é o direito básico que a Constituição reconhece a você por você ser pessoa — e que o próprio Estado é obrigado a respeitar. Não é favor, não é benefício: é limite ao poder.

A Constituição de 1988 concentra a maior parte deles no art. 5º, mas eles aparecem espalhados por todo o texto: direitos sociais (art. 6º), direitos políticos (art. 14) e até tratados internacionais de direitos humanos podem entrar com esse status.

Três características que caem em prova e resolvem metade das questões: são aplicáveis de imediato (art. 5º, §1º — não dependem de lei para valer), não são absolutos (um direito pode ceder diante de outro no caso concreto) e os direitos e garantias individuais são cláusula pétrea (art. 60, §4º, IV — nem emenda constitucional pode aboli-los).

A confusão mais comum da graduação: "cláusula pétrea" não significa que o texto nunca muda. Significa que não se admite emenda tendente a abolir o direito. Ampliar, detalhar, regulamentar — pode.',
   false, true, 'publicado', 1),

  ((SELECT id FROM assunto WHERE slug='direitos-fundamentais'),
   'clausulas-petreas', 'Cláusulas pétreas e os limites da emenda', 630,
   'O art. 60, §4º lista quatro coisas que emenda constitucional nenhuma pode abolir: a forma federativa de Estado, o voto direto/secreto/universal/periódico, a separação dos Poderes e os direitos e garantias individuais.

Repare no verbo: "tendente a abolir". A vedação não congela o texto — proíbe o esvaziamento. Emenda que amplia a proteção de um direito fundamental é válida; a que o suprime, não.

Duas pegadinhas clássicas: a forma republicana de governo NÃO está no rol (é princípio sensível do art. 34, mas não cláusula pétrea), e o voto obrigatório também não — só o voto direto, secreto, universal e periódico.',
   false, false, 'publicado', 2),

  ((SELECT id FROM assunto WHERE slug='direitos-fundamentais'),
   'remedios-constitucionais', 'Remédios constitucionais sem decoreba', 798,
   'Remédio constitucional é a ferramenta que você usa quando um direito fundamental é violado. Cada um serve para uma coisa, e a prova quase sempre cobra essa correspondência.

Habeas corpus protege a liberdade de locomoção. Habeas data dá acesso e correção de informações suas em bancos de dados públicos. Mandado de segurança protege direito líquido e certo que não seja liberdade de locomoção nem dado pessoal. Mandado de injunção ataca a falta de norma que inviabiliza um direito constitucional. Ação popular anula ato lesivo ao patrimônio público.

O truque para não decorar: pergunte "o que foi violado?" antes de "qual o nome do remédio?". A resposta ao primeiro entrega o segundo.',
   false, false, 'publicado', 3),

  ((SELECT id FROM assunto WHERE slug='organizacao-dos-poderes'),
   'separacao-dos-poderes', 'Separação de poderes: freios e contrapesos', 665,
   'Os três Poderes são independentes e harmônicos entre si (art. 2º). Independentes porque nenhum manda no outro; harmônicos porque todos se controlam mutuamente.

Esse controle recíproco é o sistema de freios e contrapesos: o Executivo veta lei do Legislativo, o Legislativo derruba veto e julga o Presidente por crime de responsabilidade, o Judiciário declara inconstitucional a lei de um e o ato do outro.

Cada Poder também exerce funções atípicas: o Legislativo julga (o Senado, no impeachment), o Judiciário administra (concursos e orçamento próprios), o Executivo legisla (medida provisória).',
   true, true, 'publicado', 1);

-- ---------- Introdução ao Direito (1ª onda) ----------
INSERT INTO assunto (materia_id, slug, nome, ordem) VALUES
  ((SELECT id FROM materia WHERE slug='introducao-ao-direito'), 'norma-e-direito', 'Norma, Direito e sociedade', 1),
  ((SELECT id FROM materia WHERE slug='introducao-ao-direito'), 'fontes-do-direito', 'Fontes do Direito', 2);

INSERT INTO aula (assunto_id, slug, titulo, duracao_segundos, resumo, amostra_gratuita, no_trial, status, ordem) VALUES
  ((SELECT id FROM assunto WHERE slug='norma-e-direito'),
   'o-que-e-norma-juridica', 'O que é uma norma jurídica', 588,
   'Norma jurídica é a regra de conduta que o Estado pode fazer valer à força. É isso que a separa da regra moral e da regra de etiqueta: as três dizem como agir, mas só a jurídica tem sanção organizada por trás.

Toda norma tem estrutura condicional: "se acontecer A, então deve ser B". Se alguém causa dano a outrem, então deve indenizar. O "deve ser" é o que a distingue de uma lei da natureza, que descreve o que é.

Moral e Direito se cruzam mas não se confundem: há normas jurídicas moralmente indiferentes (a mão de direção) e deveres morais que o Direito não cobra (gratidão).',
   true, true, 'publicado', 1),

  ((SELECT id FROM assunto WHERE slug='fontes-do-direito'),
   'fontes-do-direito', 'De onde o Direito vem: as fontes', 612,
   'Fonte do Direito é o lugar de onde a norma nasce. A fonte principal no Brasil é a lei — somos um sistema de tradição romano-germânica, em que o texto escrito vem primeiro.

Ao lado dela estão o costume (prática reiterada tida como obrigatória), a jurisprudência (decisões reiteradas dos tribunais) e a doutrina (o que os estudiosos escrevem). No Brasil, súmula vinculante do STF tem força obrigatória — é jurisprudência que vira norma de observância geral.

Não confunda fonte formal (onde a norma se manifesta: lei, costume) com fonte material (o fato social que a provoca: a pressão por regular o trabalho por aplicativo, por exemplo).',
   false, true, 'publicado', 1);

-- ---------- Carreiras Jurídicas (1ª onda) ----------
INSERT INTO assunto (materia_id, slug, nome, ordem) VALUES
  ((SELECT id FROM materia WHERE slug='carreiras-juridicas'), 'carreiras-de-estado', 'Carreiras de Estado', 1);

INSERT INTO aula (assunto_id, slug, titulo, duracao_segundos, resumo, amostra_gratuita, no_trial, status, ordem) VALUES
  ((SELECT id FROM assunto WHERE slug='carreiras-de-estado'),
   'juiz-promotor-defensor', 'Juiz, promotor e defensor: quem faz o quê', 690,
   'As três carreiras aparecem no mesmo processo e fazem coisas opostas — confundi-las é o erro mais comum de quem está começando.

O juiz julga: é imparcial, não defende ninguém e decide o conflito. O promotor (Ministério Público) acusa na esfera criminal e defende interesses da sociedade — meio ambiente, consumidor, patrimônio público. O defensor público defende quem não pode pagar advogado, e é a porta de acesso à Justiça de boa parte da população.

Todas as três exigem bacharelado em Direito, aprovação em concurso público e tempo mínimo de atividade jurídica (3 anos, em regra). Nenhuma delas exige inscrição na OAB depois de empossado.',
   true, true, 'publicado', 1);

-- ---------- Vínculo aula ↔ dispositivo (§5.4) ----------
INSERT INTO aula_dispositivo (aula_id, dispositivo_id)
SELECT a.id, d.id FROM aula a, dispositivo d
WHERE (a.slug, d.rotulo) IN (
  ('direitos-fundamentais-na-pratica', 'Art. 5º'),
  ('direitos-fundamentais-na-pratica', 'Art. 5º, § 1º'),
  ('direitos-fundamentais-na-pratica', 'Art. 5º, § 3º'),
  ('direitos-fundamentais-na-pratica', 'Art. 60, § 4º'),
  ('direitos-fundamentais-na-pratica', 'Art. 6º'),
  ('clausulas-petreas',                'Art. 60, § 4º'),
  ('o-que-e-uma-constituicao',         'Art. 1º'),
  ('separacao-dos-poderes',            'Art. 2º'),
  ('separacao-dos-poderes',            'Art. 60, § 4º')
) AND d.norma_id = (SELECT id FROM norma WHERE slug='cf-88');

-- ---------- Materiais de apoio ----------
INSERT INTO material_apoio (aula_id, titulo, arquivo, bytes) VALUES
  ((SELECT id FROM aula WHERE slug='direitos-fundamentais-na-pratica'), 'Mapa mental — Direitos fundamentais', 'mapa-direitos-fundamentais.pdf', 389120),
  ((SELECT id FROM aula WHERE slug='direitos-fundamentais-na-pratica'), 'Tabela: o que é e o que não é cláusula pétrea', 'tabela-cláusulas-petreas.pdf', 215040);

-- ---------- Exercícios: um por aula publicada ----------
INSERT INTO exercicio (aula_id) SELECT id FROM aula WHERE status = 'publicado';
