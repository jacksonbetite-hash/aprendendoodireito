-- =====================================================================
-- Exercícios — §5.3: mínimo de 5 questões por aula e comentário em
-- TODAS as alternativas, inclusive nas que o aluno não marcou.
-- =====================================================================

-- Helper mental: cada bloco insere a questão e suas alternativas juntas.

-- ############ Aula: O que é uma Constituição, afinal ############
WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-uma-constituicao'),
    'multipla_escolha', 'A CF/88 é classificada como rígida porque:', 'Autoral', 1)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Não pode ser alterada de forma alguma.', false, 'Errada. Rigidez não é imutabilidade: a Constituição pode ser emendada — só exige um processo mais difícil. Imutável seria a chamada Constituição imutável ou granítica, que a CF/88 não é.', 1),
 ('Seu processo de alteração é mais difícil que o das leis comuns.', true, 'Correta. Rigidez é exatamente isso: dois turnos em cada Casa e três quintos dos votos (art. 60, §2º), contra a maioria simples de uma lei ordinária.', 2),
 ('Foi escrita por uma assembleia constituinte eleita.', false, 'Errada. Isso descreve a origem (constituinte originário), não a rigidez. Uma Constituição outorgada também pode ser rígida.', 3),
 ('Tem mais de duzentos artigos.', false, 'Errada. Extensão classifica a Constituição em analítica ou sintética — a CF/88 é analítica —, mas nada tem a ver com rigidez.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-uma-constituicao'),
    'multipla_escolha', 'O que significa dizer que a Constituição está no topo da hierarquia normativa?', 'Autoral', 2)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Que ela é o texto mais antigo do ordenamento.', false, 'Errada. Idade não define hierarquia — o Código Penal é de 1940 e está abaixo da Constituição de 1988.', 1),
 ('Que nenhuma norma pode contrariá-la, sob pena de inconstitucionalidade.', true, 'Correta. É a supremacia constitucional: toda norma retira dela seu fundamento de validade, e a que a contraria é inválida.', 2),
 ('Que ela só pode ser interpretada pelo STF.', false, 'Errada. O STF dá a palavra final, mas todo juiz interpreta e aplica a Constituição — o controle difuso permite a qualquer juiz afastar lei inconstitucional no caso concreto.', 3),
 ('Que ela revoga automaticamente todas as leis anteriores.', false, 'Errada. As leis anteriores compatíveis são recepcionadas; só as incompatíveis deixam de valer. Por isso o CP de 1940 continua em vigor.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-uma-constituicao'),
    'certo_errado', 'Julgue: "a Constituição apenas limita o poder do Estado, não o organiza".', 'Inspirada em prova · Cebraspe', 3)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Certo', false, 'Errado. Ela faz as duas coisas ao mesmo tempo: organiza (cria Poderes, reparte competências, desenha a federação) e limita (lista direitos que o Estado deve respeitar).', 1),
 ('Errado', true, 'Certo. A dupla função é a definição clássica: a Constituição é manual de organização e cerca de limitação.', 2)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-uma-constituicao'),
    'multipla_escolha', 'Qual dos fundamentos abaixo NÃO consta do art. 1º da CF/88?', 'Autoral · OAB', 4)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('A dignidade da pessoa humana', false, 'É fundamento (art. 1º, III) — talvez o mais citado de todos, base de boa parte da jurisprudência de direitos fundamentais.', 1),
 ('O pluralismo político', false, 'É fundamento (art. 1º, V). Não confunda com pluripartidarismo: o pluralismo é mais amplo, abrange a diversidade de ideias na sociedade.', 2),
 ('A prevalência dos direitos humanos', true, 'Correta — é a que NÃO está no art. 1º. Ela é princípio das relações internacionais (art. 4º, II). Trocar art. 1º por art. 4º é a pegadinha clássica.', 3),
 ('Os valores sociais do trabalho e da livre iniciativa', false, 'É fundamento (art. 1º, IV). Repare que os dois vêm juntos no mesmo inciso — trabalho e livre iniciativa não se opõem no texto.', 4)
) AS v(texto, correta, comentario, ordem);

WITH q AS (
  INSERT INTO questao (exercicio_id, tipo, enunciado, origem, ordem)
  VALUES ((SELECT e.id FROM exercicio e JOIN aula a ON a.id=e.aula_id WHERE a.slug='o-que-e-uma-constituicao'),
    'multipla_escolha', 'Uma lei ordinária de 1985, compatível com a CF/88, continua válida hoje. Como se chama esse fenômeno?', 'Autoral', 5)
  RETURNING id)
INSERT INTO alternativa (questao_id, texto, correta, comentario, ordem)
SELECT q.id, v.* FROM q, (VALUES
 ('Repristinação', false, 'Errada. Repristinação é a volta de uma lei revogada quando a lei que a revogou perde vigência — e no Brasil ela não é automática.', 1),
 ('Recepção', true, 'Correta. A norma anterior compatível com a nova Constituição é recepcionada e segue valendo, podendo até mudar de status (o CTN virou lei complementar por recepção).', 2),
 ('Desconstitucionalização', false, 'Errada. É a tese de que normas da Constituição antiga continuariam como lei comum — não adotada no Brasil, salvo previsão expressa.', 3),
 ('Mutação constitucional', false, 'Errada. Mutação é a mudança de sentido da Constituição sem mudança de texto, por nova interpretação — outro fenômeno.', 4)
) AS v(texto, correta, comentario, ordem);
