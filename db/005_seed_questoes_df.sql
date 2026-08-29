-- ############ Aula: Direitos fundamentais na prática ############
WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='direitos-fundamentais-na-pratica'),
    'multipla_escolha', 'Sobre os direitos e garantias fundamentais na CF/88, assinale a alternativa correta:', 'Autoral · OAB', 1)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Podem ser abolidos por emenda constitucional aprovada por três quintos do Congresso Nacional.', false, 'Errada. Três quintos é o quórum para aprovar emenda (art. 60, §2º), mas nem com ele se abole direito e garantia individual: o art. 60, §4º, IV veda a própria deliberação da proposta.', 1),
 ('Os direitos e garantias individuais são cláusulas pétreas e não podem ser objeto de emenda tendente a aboli-los.', true, 'Correta. É a literalidade do art. 60, §4º, IV. Atenção à expressão "tendente a abolir": ampliar ou regulamentar o direito é permitido — o que a Constituição barra é o esvaziamento.', 2),
 ('As normas definidoras de direitos fundamentais só produzem efeito depois de regulamentadas por lei.', false, 'Errada. O art. 5º, §1º diz o oposto: essas normas têm aplicação imediata. Algumas pedem regulamentação para o exercício pleno, mas a regra é a aplicabilidade direta.', 3),
 ('Todo tratado internacional de direitos humanos ingressa com status de emenda constitucional.', false, 'Errada. Só os aprovados pelo rito do art. 5º, §3º (duas Casas, dois turnos, três quintos). Fora desse rito, o STF os reconhece como supralegais — acima da lei, abaixo da Constituição.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='direitos-fundamentais-na-pratica'),
    'multipla_escolha', 'Um direito fundamental pode ser limitado diante de outro direito fundamental no caso concreto?', 'Autoral', 2)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Sim. Direitos fundamentais não são absolutos e se harmonizam por ponderação no caso concreto.', true, 'Correta. É a posição consolidada do STF: nenhum direito fundamental é absoluto. Quando dois colidem, resolve-se por ponderação, preservando o núcleo essencial de ambos.', 1),
 ('Não. Direito fundamental é absoluto por definição.', false, 'Errada. É o erro mais comum do início da graduação. Se fossem absolutos, direitos em rota de colisão (liberdade de imprensa × privacidade) seriam insolúveis.', 2),
 ('Só quando houver lei autorizando expressamente a limitação.', false, 'Errada. A lei ajuda, mas a limitação recíproca decorre da própria Constituição — o juiz pondera mesmo sem lei específica.', 3),
 ('Apenas durante estado de sítio ou estado de defesa.', false, 'Errada. Estado de sítio e de defesa (arts. 136 a 141) permitem restrições excepcionais e temporárias, mas a ponderação entre direitos ocorre na normalidade institucional também.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='direitos-fundamentais-na-pratica'),
    'certo_errado', 'Julgue: "cláusula pétrea significa que o dispositivo constitucional não pode sofrer qualquer alteração".', 'Inspirada em prova · Cebraspe', 3)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Certo', false, 'Errado. O art. 60, §4º proíbe emenda "tendente a abolir" — não congela o texto. Emenda que amplia ou detalha o direito é válida; o que não se admite é suprimi-lo ou esvaziá-lo.', 1),
 ('Errado', true, 'Certo. A vedação é à emenda tendente a abolir, não a toda e qualquer alteração. Aperfeiçoar a proteção é constitucional.', 2)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='direitos-fundamentais-na-pratica'),
    'multipla_escolha', 'Os direitos fundamentais alcançam estrangeiros que estão no Brasil?', 'Autoral', 4)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Não. O art. 5º fala apenas em brasileiros.', false, 'Errada. O próprio caput menciona "aos estrangeiros residentes no País". Ler só metade do caput derruba a questão.', 1),
 ('Sim, mas apenas os estrangeiros com visto permanente.', false, 'Errada. A jurisprudência não faz esse recorte: o critério é estar sob jurisdição brasileira, não a modalidade do visto.', 2),
 ('Sim. O caput cita os estrangeiros residentes, e o STF estende a proteção a qualquer pessoa sob jurisdição brasileira, inclusive o turista.', true, 'Correta. A leitura literal já inclui o residente, e a interpretação do STF alcança quem está em território nacional — direitos fundamentais protegem a pessoa, não a nacionalidade.', 3),
 ('Sim, desde que haja tratado de reciprocidade com o país de origem.', false, 'Errada. Reciprocidade é exigência de alguns direitos específicos, não uma condição geral para os direitos fundamentais aqui.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='direitos-fundamentais-na-pratica'),
    'multipla_escolha', 'Qual dos itens abaixo NÃO é cláusula pétrea expressa no art. 60, §4º da CF/88?', 'Autoral', 5)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('A forma federativa de Estado', false, 'É cláusula pétrea (inciso I). Por isso não se admite emenda que transforme o Brasil em Estado unitário.', 1),
 ('O voto direto, secreto, universal e periódico', false, 'É cláusula pétrea (inciso II). Repare que o voto obrigatório não está na lista — a obrigatoriedade pode ser alterada por emenda.', 2),
 ('A forma republicana de governo', true, 'Correta — é a que NÃO consta do §4º. A forma republicana figura no art. 34, VII, "a" como princípio sensível, mas ficou fora do rol das cláusulas pétreas.', 3),
 ('A separação dos Poderes', false, 'É cláusula pétrea (inciso III), o que impede emenda que subordine um Poder a outro.', 4)
) AS v(texto, correta, comentario, ordem);

-- ############ Aula: Cláusulas pétreas e os limites da emenda ############
WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='clausulas-petreas'),
    'multipla_escolha', 'Emenda constitucional que amplia a proteção de um direito fundamental é:', 'Autoral', 1)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Inconstitucional, por violar cláusula pétrea.', false, 'Errada. A vedação alcança a emenda tendente a ABOLIR. Ampliar caminha no sentido oposto ao que a Constituição proíbe.', 1),
 ('Constitucional, pois a vedação atinge apenas emenda tendente a abolir.', true, 'Correta. Cláusula pétrea protege um patamar mínimo, não um teto. O chamado princípio da vedação ao retrocesso reforça essa leitura.', 2),
 ('Constitucional apenas se aprovada por unanimidade.', false, 'Errada. Não existe exigência de unanimidade para emenda: o quórum é de três quintos, em dois turnos, em cada Casa.', 3),
 ('Inconstitucional, porque direitos fundamentais são taxativos.', false, 'Errada. O rol não é taxativo — o próprio art. 5º, §2º admite outros direitos decorrentes do regime e dos tratados.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='clausulas-petreas'),
    'multipla_escolha', 'Os limites circunstanciais ao poder de emenda impedem alteração da Constituição durante:', 'Autoral · OAB', 2)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Intervenção federal, estado de defesa e estado de sítio.', true, 'Correta. É o art. 60, §1º. A lógica: em momento de anormalidade institucional, o poder de reforma fica suspenso para evitar mudanças sob pressão.', 1),
 ('Recesso parlamentar e período eleitoral.', false, 'Errada. Nenhum dos dois consta do §1º. Período eleitoral limita outras coisas (nomeações, publicidade oficial), não a emenda.', 2),
 ('Qualquer estado de calamidade pública declarado.', false, 'Errada. Calamidade pública não é hipótese do §1º — a lista é fechada: intervenção federal, estado de defesa e estado de sítio.', 3),
 ('O primeiro ano de mandato presidencial.', false, 'Errada. Não existe essa restrição no texto constitucional brasileiro.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='clausulas-petreas'),
    'certo_errado', 'Julgue: "o voto obrigatório é cláusula pétrea".', 'Inspirada em prova · Cebraspe', 3)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Certo', false, 'Errado. O inciso II protege o voto direto, secreto, universal e periódico. Obrigatoriedade não está lá — pode ser alterada por emenda.', 1),
 ('Errado', true, 'Certo. É a pegadinha mais cobrada do art. 60, §4º, II: quatro adjetivos protegidos, e "obrigatório" não é um deles.', 2)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='clausulas-petreas'),
    'multipla_escolha', 'Uma proposta de emenda rejeitada pode ser reapresentada quando?', 'Autoral', 4)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Imediatamente, sem restrição.', false, 'Errada. Existe restrição temporal expressa no art. 60, §5º.', 1),
 ('Na mesma sessão legislativa, com quórum maior.', false, 'Errada. Quórum maior não destrava: a vedação é temporal, não de maioria.', 2),
 ('Somente em nova sessão legislativa.', true, 'Correta. Art. 60, §5º: a matéria rejeitada ou havida por prejudicada não pode ser objeto de nova proposta na mesma sessão legislativa.', 3),
 ('Nunca mais, por preclusão.', false, 'Errada. A vedação é apenas para a mesma sessão legislativa — no ano seguinte a proposta pode voltar.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='clausulas-petreas'),
    'multipla_escolha', 'Quem pode propor emenda à Constituição?', 'Autoral', 5)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Apenas o Presidente da República.', false, 'Errada. O Presidente é um dos legitimados (art. 60, II), mas não o único.', 1),
 ('Um terço dos membros da Câmara ou do Senado, o Presidente da República, ou mais da metade das Assembleias Legislativas.', true, 'Correta. São os três legitimados do art. 60, I a III. Repare que não há iniciativa popular para emenda — só para lei ordinária (art. 61, §2º).', 2),
 ('Qualquer cidadão, por iniciativa popular.', false, 'Errada. A iniciativa popular do art. 61, §2º alcança projeto de lei, não proposta de emenda constitucional.', 3),
 ('O Supremo Tribunal Federal.', false, 'Errada. O STF tem iniciativa de lei sobre seu próprio estatuto e organização judiciária, mas não de emenda constitucional.', 4)
) AS v(texto, correta, comentario, ordem);
