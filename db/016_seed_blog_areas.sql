-- =====================================================================
-- O blog deixa de ser só de Direito.
--
-- A 015 abriu o blog com seis categorias, todas jurídicas — o que
-- amarrava o topo de funil a uma única área enquanto o catálogo cresce
-- para as demais. Aqui entram as áreas transversais (método de estudo,
-- carreira, tecnologia e finanças pessoais), cada uma com artigo
-- publicado: categoria sem post não aparece no filtro, e pílula que
-- filtra para o vazio é pior que pílula a menos.
--
-- A ordem também muda: as áreas que servem a qualquer aluno vêm antes
-- das de uma área só, senão a fileira de filtros continuaria dizendo
-- "isto aqui é um blog jurídico" mesmo com o conteúdo novo dentro.
-- =====================================================================

UPDATE categoria_blog SET ordem = 20 WHERE slug = 'direito-civil';
UPDATE categoria_blog SET ordem = 21 WHERE slug = 'direito-penal';
UPDATE categoria_blog SET ordem = 22 WHERE slug = 'direito-tributario';
UPDATE categoria_blog SET ordem = 23 WHERE slug = 'direito-do-consumidor';
UPDATE categoria_blog SET ordem = 24 WHERE slug = 'direito-digital';
UPDATE categoria_blog SET ordem = 2  WHERE slug = 'carreira';

INSERT INTO categoria_blog (slug, nome, ordem) VALUES
  ('metodo-de-estudo',  'Método de Estudo',  1),
  ('tecnologia',        'Tecnologia',        3),
  ('financas-pessoais', 'Finanças Pessoais', 4);

INSERT INTO post
  (categoria_id, slug, titulo, resumo, corpo, autor_nome, autor_cargo, autor_foto,
   minutos_leitura, destaque, status, publicado_em)
VALUES
  ((SELECT id FROM categoria_blog WHERE slug='metodo-de-estudo'),
   'reler-nao-e-estudar',
   'Reler não é estudar: o que a revisão espaçada muda',
   'Por que a leitura repetida dá sensação de domínio sem produzir memória — e como trocar releitura por recuperação, com o intervalo certo.',
   $txt$Reler é confortável. O texto já é conhecido, tudo faz sentido, e essa fluência é lida pelo cérebro como "eu sei isto". É justamente aí que mora o erro: fluência de leitura não é o mesmo que capacidade de lembrar sem o texto na frente.

A troca que resolve é simples de descrever e desconfortável de fazer: feche o material e tente recuperar. Escreva o que lembra, responda a uma questão, explique o assunto em voz alta para uma cadeira vazia. O esforço de puxar a informação da memória é o que a fixa — e o incômodo de não conseguir é o sinal de que está funcionando.

O intervalo vem depois. Recuperar hoje, de novo em dois dias, depois em uma semana, depois em duas. Cada revisão bem-sucedida compra mais tempo até a seguinte, e é por isso que quinze minutos por dia rendem mais que três horas na véspera.

O que abandonar sem dó: marca-texto que pinta metade da página, resumo copiado palavra por palavra e a terceira leitura do mesmo capítulo. Nenhum dos três exige recuperação — os três dão a mesma sensação boa de estar estudando.

Um roteiro que cabe na semana: leia uma vez com atenção, feche e escreva o que ficou, confira o que faltou, e marque as três revisões seguintes na agenda antes de sair da mesa.$txt$,
   'Juliana Prado', 'Coordenadora pedagógica', 'docente-04', 7, false, 'publicado',
   now() - INTERVAL '1 day'),

  ((SELECT id FROM categoria_blog WHERE slug='tecnologia'),
   'ia-no-trabalho-o-que-delegar',
   'IA no trabalho: o que dá para delegar e o que não dá',
   'Um critério prático para separar a tarefa que a ferramenta faz bem daquela em que ela custa mais caro do que economiza.',
   $txt$A pergunta útil não é "a IA consegue fazer isto?", e sim "quanto me custa conferir o resultado?". Tarefa cuja conferência é rápida e barata vale delegar; tarefa em que conferir dá o mesmo trabalho que fazer, não.

Rende bem: transformar formato (transcrição em ata, anotação em roteiro), gerar primeira versão de texto que você vai reescrever, listar hipóteses que talvez você não tivesse lembrado, e explicar um trecho técnico em outras palavras.

Rende mal: qualquer coisa em que o erro seja plausível e difícil de flagrar — número, citação, referência, data, nome de norma. A ferramenta produz o formato correto com o conteúdo errado, que é exatamente o tipo de erro que passa despercebido na revisão apressada.

E há o que não se delega por outro motivo: dado sigiloso de terceiro. Antes de colar qualquer coisa em uma ferramenta, pergunte de quem é aquela informação e o que o contrato diz sobre onde ela pode ser processada.

O hábito que separa quem ganha tempo de quem perde: pedir a fonte e conferir a fonte. Sem isso, o ganho de velocidade vira retrabalho com juros.$txt$,
   'Diego Sampaio', 'Professor de Tecnologia', 'docente-07', 9, false, 'publicado',
   now() - INTERVAL '9 days'),

  ((SELECT id FROM categoria_blog WHERE slug='financas-pessoais'),
   'o-orcamento-que-sobrevive-ao-mes-real',
   'O orçamento que sobrevive ao mês real',
   'Planilha detalhada demais morre na segunda semana. O que funciona é decidir três números antes do mês começar.',
   $txt$Quase todo orçamento fracassa pelo mesmo motivo: exige um registro que ninguém sustenta. Anotar cada café por trinta dias é possível; por trezentos e sessenta e cinco, não.

Comece pelo avesso. Em vez de classificar tudo o que sai, decida três números antes do mês começar: quanto vai poupar, quanto está comprometido com contas fixas e quanto sobra para o resto. O terceiro número é o único que precisa de acompanhamento, e ele cabe em uma olhada por semana.

Poupar primeiro muda o resultado mais do que qualquer planilha. Transferência automática no dia do pagamento transforma a poupança em conta fixa — e o que sobra se ajusta sozinho, porque é o que existe.

A reserva vem antes do investimento. Sem três a seis meses de custo guardados em algo que se resgata no mesmo dia, qualquer imprevisto vira dívida cara, e a dívida cara come o rendimento de qualquer aplicação.

Uma revisão por trimestre basta para o resto: conferir se os fixos continuam fazendo sentido, se a reserva acompanhou a inflação e se o número de poupança pode subir um pouco.$txt$,
   'Caio Nogueira', 'Professor de Finanças Pessoais', 'docente-05', 8, false, 'publicado',
   now() - INTERVAL '19 days');
