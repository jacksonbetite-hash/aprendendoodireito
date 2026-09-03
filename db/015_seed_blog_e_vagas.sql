-- =====================================================================
-- Seed — artigos do blog e vagas do mural.
--
-- Conteúdo ILUSTRATIVO, do mesmo tipo que os retratos da página inicial:
-- serve para a tela existir com volume real (filtro, paginação, cartão
-- de destaque) antes do conteúdo editorial e dos anunciantes de verdade.
-- Ao entrar em produção, esta seed sai e as duas tabelas ficam vazias
-- até o primeiro post publicado e a primeira vaga aprovada.
-- =====================================================================

INSERT INTO categoria_blog (slug, nome, ordem) VALUES
  ('direito-civil',         'Direito Civil',         1),
  ('direito-penal',         'Direito Penal',         2),
  ('direito-tributario',    'Direito Tributário',    3),
  ('direito-do-consumidor', 'Direito do Consumidor', 4),
  ('direito-digital',       'Direito Digital',       5),
  ('carreira',              'Carreira',              6);

INSERT INTO post
  (categoria_id, slug, titulo, resumo, corpo, autor_nome, autor_cargo, autor_foto,
   minutos_leitura, destaque, status, publicado_em)
VALUES
  ((SELECT id FROM categoria_blog WHERE slug='direito-do-consumidor'),
   'atrasos-e-cancelamentos-de-voo',
   'O guia definitivo: como lidar com atrasos e cancelamentos de voo',
   'Uma leitura organizada da jurisprudência recente sobre danos morais e materiais decorrentes de cancelamentos e atrasos severos em companhias aéreas nacionais.',
   $txt$Atraso de voo é o caso de consumidor que mais chega ao balcão de quem começa a advogar — e também o que mais se resolve mal, por falta de método. A pergunta não é "cabe indenização?", e sim "o que exatamente foi descumprido, e quanto disso está provado?".

O ponto de partida é a Resolução 400 da ANAC: a partir de quatro horas de atraso, a companhia deve reacomodação, reembolso integral ou execução do serviço por outra modalidade, à escolha do passageiro. Assistência material — comunicação, alimentação e hospedagem — começa antes disso, em uma escada de uma, duas e quatro horas.

O dano material é aritmética: diária perdida, transfer, compromisso profissional desmarcado. Cada item pede documento. É a parte do pedido que se ganha ou se perde no anexo, não na tese.

Já o dano moral não decorre do atraso em si. A jurisprudência dominante pede a circunstância agravante: pernoite no aeroporto, passageiro idoso ou criança sem assistência, perda de evento inadiável, tratamento ríspido no balcão. Petição que descreve a circunstância convence; petição que descreve a indignação, não.

Antes de qualquer coisa, registre a reclamação no consumidor.gov.br e guarde o protocolo. Além de resolver boa parte dos casos sem processo, ele prova que a companhia teve a chance de reparar — e isso pesa na fixação do valor.$txt$,
   'Camila Soares', 'Advogada e professora convidada', 'docente-02', 8, true, 'publicado',
   now() - INTERVAL '3 days'),

  ((SELECT id FROM categoria_blog WHERE slug='carreira'),
   'ler-processos-volumosos-sem-perder-o-fio',
   'Como ler processos volumosos sem perder o fio',
   'Técnicas de leitura em camadas e resumo estruturado para atravessar autos de centenas de páginas sem reler três vezes a mesma coisa.',
   $txt$Ninguém lê um processo de 800 páginas do começo ao fim. Quem tenta chega ao fim sem lembrar do começo — e volta a folhear o que já leu, que é onde o tempo some.

Leia em três camadas. Na primeira, só as peças que definem o esqueleto: inicial, contestação, decisão saneadora, sentença. Em vinte minutos você já sabe do que se trata e o que está controvertido.

Na segunda camada, entre apenas nos pontos controvertidos — e leia com o pedido ao lado. Prova que não conversa com nenhum pedido é leitura que pode esperar.

A terceira camada é a do detalhe: datas, valores, nomes. Ela só rende depois das duas primeiras, porque agora você sabe qual detalhe importa.

Escreva o resumo enquanto lê, e sempre no mesmo formato: fatos, pedidos, defesa, provas, decisões, prazos. Formato fixo é o que permite comparar dois processos — e o que transforma a sua leitura de hoje em consulta útil daqui a seis meses.$txt$,
   'Luiza Andrade', 'Coordenadora de conteúdo', 'docente-04', 6, false, 'publicado',
   now() - INTERVAL '5 days'),

  ((SELECT id FROM categoria_blog WHERE slug='direito-penal'),
   'novas-diretrizes-audiencia-de-custodia',
   'Novas diretrizes para audiências de custódia por videoconferência',
   'O CNJ estabeleceu novos parâmetros técnicos e procedimentais para a realização de audiências de custódia por meio remoto. O que muda na prática.',
   $txt$A audiência de custódia existe para uma finalidade específica: colocar a pessoa presa diante de um juiz em até 24 horas e verificar a legalidade da prisão e a integridade física de quem foi preso.

Essa segunda finalidade é a que a videoconferência tensiona. Marca de agressão se vê melhor de perto; e a pessoa que responde na frente de quem a prendeu responde diferente de quem responde sozinha na sala.

Por isso as diretrizes cercam o formato remoto de condições: sala reservada, entrevista prévia e reservada com a defesa, câmera que permita ver o corpo do custodiado e registro em ata sempre que qualquer dessas condições faltar.

Para quem estuda, o ponto é enxergar a estrutura: a norma não escolhe entre presencial e remoto por preferência tecnológica — ela protege a finalidade do ato e admite o formato que conseguir cumpri-la.$txt$,
   'Daniel Prado', 'Professor de Direito Penal', 'docente-01', 5, false, 'publicado',
   now() - INTERVAL '8 days'),

  ((SELECT id FROM categoria_blog WHERE slug='direito-digital'),
   'lgpd-nas-pequenas-e-medias-empresas',
   'LGPD: impactos nas pequenas e médias empresas',
   'Um roteiro prático de adequação para PMEs, focado no que dá resultado com pouco orçamento — e no que costuma ser vendido sem necessidade.',
   $txt$Adequação à LGPD em empresa pequena não começa por política de privacidade: começa por inventário. Quais dados entram, por onde, para quê, onde ficam e quem acessa. Sem esse mapa, todo o resto é documento bonito descrevendo uma realidade que ninguém conferiu.

Com o inventário na mão, três decisões resolvem a maior parte do risco: apagar o que não deveria estar guardado, fechar o acesso de quem não precisa acessar e escolher uma base legal para cada finalidade — consentimento não é a base padrão, e usá-lo onde cabe legítimo interesse cria obrigação de gerenciar revogação sem necessidade.

Só então vêm os documentos: aviso de privacidade em linguagem que o titular entenda, canal de atendimento ao titular que alguém realmente leia e registro das operações.

O erro caro é comprar ferramenta antes de fazer o inventário. Software não sabe quais dados a empresa coleta; a empresa é que sabe.$txt$,
   'Marina Estrela', 'Advogada de proteção de dados', 'docente-06', 12, false, 'publicado',
   now() - INTERVAL '12 days'),

  ((SELECT id FROM categoria_blog WHERE slug='direito-tributario'),
   'reforma-tributaria-o-que-muda-na-pratica',
   'Reforma tributária: o que muda na prática',
   'Os principais pontos do novo texto e como ele afeta a tributação de serviços advocatícios ao longo do período de transição.',
   $txt$O desenho é simples de enunciar e trabalhoso de aplicar: cinco tributos sobre consumo dão lugar a um imposto dual, com crédito amplo e cobrança no destino.

Para escritórios e prestadores de serviço, o ponto sensível é a combinação de dois efeitos opostos. A alíquota nominal sobre serviços sobe; a possibilidade de creditar o que se paga na cadeia, que era quase nenhuma, aumenta. Quem tem pouca despesa creditável sente mais.

A transição é longa e convive com o sistema antigo por anos. Na prática, isso significa duas apurações em paralelo e uma decisão de regime que precisa ser refeita quando as alíquotas de referência forem fixadas.

Para o estudante, é uma oportunidade rara: acompanhar uma mudança estrutural enquanto ela acontece ensina mais sobre sistema tributário do que qualquer resumo pronto vai ensinar depois.$txt$,
   'Caio Nogueira', 'Professor de Direito Tributário', 'docente-05', 15, false, 'publicado',
   now() - INTERVAL '16 days'),

  ((SELECT id FROM categoria_blog WHERE slug='direito-civil'),
   'prescricao-e-decadencia-sem-decoreba',
   'Prescrição e decadência sem decoreba',
   'A diferença entre os dois institutos fica óbvia quando se olha para o que cada um extingue — e não para a tabela de prazos.',
   $txt$Quem tenta guardar a diferença pela tabela de prazos esquece na semana seguinte. Quem entende o que cada instituto extingue não esquece mais.

A prescrição atinge a pretensão: o direito continua existindo, mas você perde a possibilidade de exigi-lo em juízo. Por isso ela se interrompe, se suspende e admite renúncia depois de consumada.

A decadência atinge o próprio direito potestativo, aquele que se exerce sozinho e que a outra parte apenas suporta — anular o negócio, desfazer a compra com vício. Como o direito acaba, não há o que interromper.

Daí decorre o resto, sem memorização: prazo que corre contra direito de exigir prestação é prescricional; prazo que corre contra direito de mudar uma situação jurídica é decadencial.$txt$,
   'Helena Braga', 'Professora de Direito Civil', 'docente-02', 7, false, 'publicado',
   now() - INTERVAL '21 days'),

  ((SELECT id FROM categoria_blog WHERE slug='carreira'),
   'primeiro-estagio-o-que-realmente-conta',
   'Primeiro estágio: o que realmente conta na seleção',
   'O que escritórios olham na triagem de estagiários do 4º ao 8º semestre — e o que ocupa espaço no currículo sem contar ponto.',
   $txt$Na triagem de estágio, três coisas decidem quase tudo: escrita, disponibilidade e alguma prova de interesse pela área.

Escrita vem primeiro porque é a tarefa real do estagiário. Um parágrafo do seu e-mail já diz mais do que a lista de cursos livres — e um e-mail com erro de concordância elimina antes da entrevista.

Disponibilidade some das conversas e é o motivo mais comum de recusa. Diga o turno e a carga desde o começo; ninguém se ofende com clareza.

Prova de interesse não é certificado: é qualquer coisa que mostre que você já se aproximou da área — projeto de extensão, monitoria, um caso que acompanhou, um resumo que escreveu. Um exemplo concreto vale mais que dez linhas de "tenho grande interesse".

E adapte o currículo a cada vaga. Não é retórica de coach: é o que faz o recrutador encontrar em cinco segundos aquilo que ele está procurando.$txt$,
   'Rafael Miranda', 'Coordenador de Carreiras Jurídicas', 'docente-03', 6, false, 'publicado',
   now() - INTERVAL '27 days');

-- ---------- Vagas do mural ----------
-- Todas já aprovadas e dentro da vigência de 3 meses (§5.7.1).
INSERT INTO vaga
  (titulo, empresa, empresa_cnpj, tipo, regime, modalidade, cidade, uf, area_atuacao,
   descricao, requisitos, faixa_salarial, como_candidatar, status, publicada_em, expira_em)
VALUES
  ('Estágio em Direito Civil estratégico', 'Silva & Associados Advogados', '12.345.678/0001-90',
   'estagio', 'meio_periodo', 'hibrido', 'São Paulo', 'SP', 'Direito Civil',
   'Atuação no núcleo de contencioso cível estratégico, com acompanhamento de audiências e elaboração de peças sob supervisão.',
   E'Matrícula do 4º ao 8º semestre\nBoa redação\nInteresse em contencioso cível\nDisponibilidade de 6 horas diárias',
   'R$ 1.800 + vale-transporte', 'vagas@silvaassociados.exemplo.br',
   'publicada', now(), now() + INTERVAL '3 months'),

  ('Advogado(a) trabalhista pleno', 'Macedo & Lima Consultoria', '23.456.789/0001-01',
   'advogado_pleno', 'integral', 'presencial', 'Rio de Janeiro', 'RJ', 'Direito do Trabalho',
   'Condução de contencioso trabalhista patronal, com realização de audiências e elaboração de defesas e recursos.',
   E'OAB ativa\nMínimo de 3 anos em contencioso trabalhista\nExperiência em audiências\nDisponibilidade para viagens eventuais',
   'R$ 9.000 a R$ 12.000', 'https://macedolima.exemplo.br/carreiras',
   'publicada', now() - INTERVAL '1 day', now() - INTERVAL '1 day' + INTERVAL '3 months'),

  ('Trainee em Direito Tributário', 'TechLaw Inovação Jurídica', '34.567.890/0001-12',
   'trainee', 'integral', 'remoto', NULL, NULL, 'Direito Tributário',
   'Programa de trainee para recém-formados, com imersão em consultivo tributário e projetos de automação de rotinas fiscais.',
   E'Formatura entre 2024 e 2026\nOAB em andamento ou concluída\nInglês intermediário\nAfinidade com tecnologia',
   'R$ 5.500', 'trainee@techlaw.exemplo.br',
   'publicada', now() - INTERVAL '2 days', now() - INTERVAL '2 days' + INTERVAL '3 months'),

  ('Estágio em Direito Penal empresarial', 'Dias & Bastos Boutique Penal', '45.678.901/0001-23',
   'estagio', 'meio_periodo', 'presencial', 'Brasília', 'DF', 'Direito Penal',
   'Apoio à atuação em crimes do colarinho branco e compliance criminal, com pesquisa de jurisprudência e acompanhamento processual.',
   E'Matrícula a partir do 6º semestre\nDiscrição e organização\nPesquisa de jurisprudência\nDisponibilidade no turno da tarde',
   'R$ 2.000 + auxílio-alimentação', 'estagio@diasbastos.exemplo.br',
   'publicada', now() - INTERVAL '3 days', now() - INTERVAL '3 days' + INTERVAL '3 months'),

  ('Advogado(a) júnior — contencioso do consumidor', 'Nunes Advocacia', '56.789.012/0001-34',
   'advogado_jr', 'integral', 'hibrido', 'Belo Horizonte', 'MG', 'Direito do Consumidor',
   'Atuação em demandas de consumo de massa, com elaboração de peças e sustentação em audiências de conciliação.',
   E'OAB ativa\nAté 2 anos de formado\nExperiência com Juizados Especiais\nRedação clara',
   'R$ 5.000 a R$ 6.500', 'https://nunesadv.exemplo.br/vagas/juridico',
   'publicada', now() - INTERVAL '4 days', now() - INTERVAL '4 days' + INTERVAL '3 months'),

  ('Estágio em Direito Digital e proteção de dados', 'Órbita Tecnologia S.A.', '67.890.123/0001-45',
   'estagio', 'meio_periodo', 'remoto', NULL, NULL, 'Direito Digital',
   'Apoio ao time jurídico interno em adequação à LGPD, revisão de contratos de software e atendimento a titulares.',
   E'Matrícula a partir do 5º semestre\nInteresse em proteção de dados\nInglês para leitura\nOrganização',
   'R$ 2.200', 'juridico@orbita.exemplo.br',
   'publicada', now() - INTERVAL '6 days', now() - INTERVAL '6 days' + INTERVAL '3 months'),

  ('Advogado(a) pleno — societário', 'Vieira Corporate Law', '78.901.234/0001-56',
   'advogado_pleno', 'integral', 'presencial', 'São Paulo', 'SP', 'Direito Empresarial',
   'Estruturação de operações societárias, due diligence e acompanhamento de fusões e aquisições de médio porte.',
   E'OAB ativa\n4 anos ou mais em societário\nInglês fluente\nExperiência em due diligence',
   'R$ 14.000 a R$ 18.000', 'talentos@vieiralaw.exemplo.br',
   'publicada', now() - INTERVAL '7 days', now() - INTERVAL '7 days' + INTERVAL '3 months'),

  ('Estágio em Direito Público', 'Procuradoria Municipal de Campinas', '89.012.345/0001-67',
   'estagio', 'meio_periodo', 'presencial', 'Campinas', 'SP', 'Direito Público',
   'Apoio à procuradoria em pareceres administrativos, licitações e contencioso de execução fiscal.',
   E'Matrícula a partir do 4º semestre\nAprovação em processo seletivo público\nRedação técnica\nTurno da manhã',
   'R$ 1.500 + vale-transporte', 'https://campinas.exemplo.br/estagio-juridico',
   'publicada', now() - INTERVAL '9 days', now() - INTERVAL '9 days' + INTERVAL '3 months'),

  ('Advogado(a) júnior — imobiliário', 'Ribeiro & Castro Advogados', '90.123.456/0001-78',
   'advogado_jr', 'integral', 'hibrido', 'Curitiba', 'PR', 'Direito Civil',
   'Consultivo imobiliário: contratos de compra e venda, incorporação, regularização e assessoria a incorporadoras.',
   E'OAB ativa\nAté 3 anos de formado\nNoções de registros públicos\nBoa comunicação com cliente',
   'R$ 5.200', 'rh@ribeirocastro.exemplo.br',
   'publicada', now() - INTERVAL '11 days', now() - INTERVAL '11 days' + INTERVAL '3 months'),

  ('Trainee jurídico — departamento interno', 'Grupo Aurora Varejo', '01.234.567/0001-89',
   'trainee', 'integral', 'hibrido', 'Porto Alegre', 'RS', 'Direito Empresarial',
   'Programa de dois anos com rodízio por contratos, consumidor e trabalhista no departamento jurídico do grupo.',
   E'Formatura entre 2024 e 2026\nDisponibilidade para rodízio de áreas\nExcel intermediário\nInglês intermediário',
   'R$ 6.000', 'https://grupoaurora.exemplo.br/trainee-juridico',
   'publicada', now() - INTERVAL '14 days', now() - INTERVAL '14 days' + INTERVAL '3 months'),

  ('Estágio em contencioso trabalhista', 'Almeida Advocacia Trabalhista', '11.222.333/0001-44',
   'estagio', 'meio_periodo', 'hibrido', 'Recife', 'PE', 'Direito do Trabalho',
   'Acompanhamento de audiências, cálculo de liquidação e elaboração de peças simples sob supervisão.',
   E'Matrícula a partir do 5º semestre\nInteresse em Direito do Trabalho\nNoções de cálculo trabalhista\nTurno da tarde',
   'R$ 1.600 + auxílio-transporte', 'estagio@almeidatrabalhista.exemplo.br',
   'publicada', now() - INTERVAL '18 days', now() - INTERVAL '18 days' + INTERVAL '3 months'),

  ('Advogado(a) pleno — tributário contencioso', 'Fonseca Tributário', '22.333.444/0001-55',
   'advogado_pleno', 'integral', 'remoto', NULL, NULL, 'Direito Tributário',
   'Defesas administrativas e judiciais em matéria tributária, com atuação perante conselhos de contribuintes.',
   E'OAB ativa\n5 anos ou mais em tributário\nExperiência em CARF ou TIT\nPós-graduação em Tributário é diferencial',
   'R$ 13.000 a R$ 16.000', 'carreiras@fonsecatributario.exemplo.br',
   'publicada', now() - INTERVAL '23 days', now() - INTERVAL '23 days' + INTERVAL '3 months');
