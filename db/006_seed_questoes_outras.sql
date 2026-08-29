-- ############ Aula: O que é uma norma jurídica (Introdução ao Direito) ############
WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-norma-juridica'),
  'multipla_escolha', 'O que distingue a norma jurídica da norma moral?', 'Autoral', 1) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('A norma jurídica é sempre justa; a moral, nem sempre.', false, 'Errada. Justiça é critério de valoração, não de distinção. Existem normas jurídicas injustas — e continuam sendo jurídicas.', 1),
 ('A norma jurídica conta com sanção organizada aplicável pelo Estado.', true, 'Correta. É a coercibilidade: as duas dizem como agir, mas só a jurídica pode ser imposta pela força estatal organizada.', 2),
 ('A norma moral não impõe dever algum.', false, 'Errada. A norma moral impõe dever, sim — o que falta é a sanção institucionalizada. A reprovação social não é sanção jurídica.', 3),
 ('A norma jurídica é escrita e a moral é oral.', false, 'Errada. Existe norma jurídica não escrita (o costume) e código moral escrito (códigos de ética privados). A forma não é o critério.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-norma-juridica'),
  'multipla_escolha', 'A estrutura "se A, então deve ser B" descreve:', 'Autoral', 2) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Uma lei da natureza.', false, 'Errada. A lei natural é descritiva: "se A, então É B". Ela constata; não prescreve.', 1),
 ('A estrutura condicional da norma jurídica.', true, 'Correta. A norma liga uma hipótese a uma consequência no plano do dever-ser — daí a fórmula clássica da imputação.', 2),
 ('Um silogismo lógico puro.', false, 'Errada. O silogismo é forma de raciocínio (premissas → conclusão), não a estrutura da norma.', 3),
 ('O princípio da proporcionalidade.', false, 'Errada. A proporcionalidade é critério de aplicação de normas em colisão, não a estrutura de uma norma.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-norma-juridica'),
  'certo_errado', 'Julgue: "toda norma jurídica corresponde a um dever moral".', 'Inspirada em prova · Cebraspe', 3) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Certo', false, 'Errado. Há normas moralmente indiferentes — dirigir pela direita, o prazo de um recurso. Elas organizam a convivência sem carga moral.', 1),
 ('Errado', true, 'Certo. Direito e Moral se cruzam parcialmente: há campo jurídico moralmente neutro e dever moral que o Direito não exige.', 2)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-norma-juridica'),
  'multipla_escolha', 'Sanção jurídica é:', 'Autoral', 4) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Sempre uma pena de prisão.', false, 'Errada. Prisão é uma espécie de sanção penal. A maior parte das sanções é civil ou administrativa: indenizar, multar, anular.', 1),
 ('A consequência prevista para o descumprimento da norma.', true, 'Correta. E ela pode ser negativa (multa, nulidade, pena) ou até premial (o benefício por adimplemento antecipado).', 2),
 ('A opinião negativa da sociedade sobre o infrator.', false, 'Errada. Isso é sanção social difusa, sem organização estatal — exatamente o que falta à norma moral.', 3),
 ('Sinônimo de coação física.', false, 'Errada. Coação é o meio possível de imposição; sanção é a consequência prevista. A maioria das sanções nunca chega à força física.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-norma-juridica'),
  'multipla_escolha', 'O que significa dizer que o Direito é bilateral atributivo?', 'Autoral', 5) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Que toda norma tem duas interpretações possíveis.', false, 'Errada. Ambiguidade interpretativa é outro assunto — bilateralidade não se refere a leituras do texto.', 1),
 ('Que ao dever de um corresponde a pretensão de outro, exigível.', true, 'Correta. É a fórmula de Reale: a relação jurídica sempre tem dois polos, e um pode exigir do outro. A moral é unilateral — não gera pretensão exigível.', 2),
 ('Que o Direito vale para as duas partes de um contrato.', false, 'Errada. Isso descreve um efeito do contrato, não a característica geral do Direito como ordem normativa.', 3),
 ('Que existem dois sistemas jurídicos no mundo.', false, 'Errada. Civil law e common law são famílias jurídicas — nada a ver com bilateralidade atributiva.', 4)
) AS v(texto, correta, comentario, ordem);

-- ############ Aula: Juiz, promotor e defensor (Carreiras Jurídicas) ############
WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='juiz-promotor-defensor'),
  'multipla_escolha', 'Em uma ação penal, quem faz a acusação?', 'Autoral', 1) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('O juiz, ao receber a denúncia.', false, 'Errada. O juiz recebe ou rejeita a denúncia, mas não acusa — se acusasse, perderia a imparcialidade. É o sistema acusatório.', 1),
 ('O membro do Ministério Público.', true, 'Correta. A ação penal pública é privativa do MP (art. 129, I, da CF/88). O promotor acusa; o juiz julga.', 2),
 ('O delegado de polícia.', false, 'Errada. O delegado preside o inquérito e apura, mas quem leva a acusação a juízo é o MP.', 3),
 ('O defensor público.', false, 'Errada. O defensor faz o oposto: defende o acusado que não pode pagar advogado.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='juiz-promotor-defensor'),
  'multipla_escolha', 'A Defensoria Pública atende:', 'Autoral', 2) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Apenas réus em processo criminal.', false, 'Errada. A atuação é bem mais ampla: família, consumidor, saúde, moradia, execução penal.', 1),
 ('Quem comprova insuficiência de recursos, em qualquer área.', true, 'Correta. O art. 134 da CF/88 define a Defensoria como instituição de orientação jurídica e defesa dos necessitados, em todos os graus.', 2),
 ('Somente quem ganha até um salário mínimo.', false, 'Errada. Não há valor fixo na Constituição — cada Defensoria fixa critérios, e a insuficiência é analisada no caso concreto.', 3),
 ('Qualquer pessoa, independentemente de renda.', false, 'Errada. O critério constitucional é a insuficiência de recursos. Há atuações coletivas que alcançam todos, mas a regra individual exige hipossuficiência.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='juiz-promotor-defensor'),
  'certo_errado', 'Julgue: "para tomar posse como juiz, é obrigatório manter a inscrição na OAB".', 'Inspirada em prova · Cebraspe', 3) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Certo', false, 'Errado. A inscrição é necessária para advogar e costuma servir para comprovar atividade jurídica antes do concurso, mas ao tomar posse o magistrado não advoga — a inscrição é cancelada ou licenciada.', 1),
 ('Errado', true, 'Certo. Magistratura e advocacia são incompatíveis: o Estatuto da OAB veda o exercício da advocacia a quem ocupa cargo de magistrado.', 2)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='juiz-promotor-defensor'),
  'multipla_escolha', 'Qual carreira defende, em juízo, os interesses patrimoniais do próprio ente público?', 'Autoral', 4) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('O Ministério Público.', false, 'Errada. Desde a CF/88 o MP deixou de representar judicialmente a Fazenda — ele defende a sociedade, e pode até processar o ente público.', 1),
 ('A Advocacia Pública (AGU, procuradorias).', true, 'Correta. Arts. 131 e 132 da CF/88: a Advocacia-Geral da União e as procuradorias representam judicialmente e consultivamente os entes federativos.', 2),
 ('A Defensoria Pública.', false, 'Errada. A Defensoria representa pessoas necessitadas — inclusive contra o Estado.', 3),
 ('A Polícia Federal.', false, 'Errada. A PF exerce polícia judiciária da União: apura infrações, não representa o ente em juízo.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='juiz-promotor-defensor'),
  'multipla_escolha', 'O requisito de "três anos de atividade jurídica" para juiz e promotor é contado a partir de:', 'Autoral · OAB', 5) RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Do ingresso na faculdade de Direito.', false, 'Errada. O tempo de graduação não conta — seria transformar o requisito em mera formalidade.', 1),
 ('Da conclusão do curso de Direito (colação de grau).', true, 'Correta. Arts. 93, I e 129, §3º da CF/88, na leitura consolidada: os três anos correm a partir da colação de grau.', 2),
 ('Da aprovação no Exame da OAB.', false, 'Errada. A aprovação na OAB habilita a advogar, mas o marco do requisito é a conclusão do curso.', 3),
 ('Da inscrição no concurso público.', false, 'Errada. Nessa data o requisito é verificado, não iniciado — o tempo já deve estar cumprido.', 4)
) AS v(texto, correta, comentario, ordem);

-- =====================================================================
-- §5.3 é regra de produto: aula sem exercício NÃO é publicável.
-- As aulas que ainda não têm as 5 questões voltam para 'aprovado' —
-- prontas, aguardando o exercício antes de irem ao ar.
-- =====================================================================
UPDATE aula SET status = 'aprovado'
WHERE status = 'publicado'
  AND id NOT IN (
    SELECT e.aula_id FROM exercicio e
    JOIN questao q ON q.exercicio_id = e.id
    GROUP BY e.aula_id HAVING count(*) >= 5
  );

DELETE FROM exercicio WHERE aula_id IN (SELECT id FROM aula WHERE status <> 'publicado');
