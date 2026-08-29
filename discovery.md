# Aprendendo o Direito — Documento de Discovery

**Versão:** 1.0 · **Data:** 29/08/2026 · **Estágio:** ideia / do zero
**Construção:** sistema próprio · **Autoria:** multi-professor (responsável + convidados)

---

## 1. Sumário executivo

O **Aprendendo o Direito** é uma plataforma de ensino jurídico com duas camadas: um site aberto que atrai por conteúdo (dicas, explicações e vade-mécum de consulta livre) e uma área paga com aulas em vídeo, materiais e exercícios, segmentada por área e assunto do Direito.

O que sustenta o produto:

1. **Segmentação fina do conteúdo** — Área → Matéria → Assunto → Aula → Exercício. Isso é o que permite vender por matéria e não só o catálogo inteiro.
2. **Licença como entidade de primeira classe** — o acesso não é "assinante sim/não", é a resolução de um conjunto de licenças com escopo e vigência.
3. **Vade-mécum integrado à aula** — o diferencial defensável. Não um PDF anexo, mas um painel lateral que abre o artigo citado na aula, com busca, favoritos e anotações.
4. **Exercício ao final de toda aula** — a aula sem exercício não é publicável. É regra de produto, não item opcional.

**Recomendação central de escopo:** o gargalo deste negócio não é software, é produção de conteúdo. O aluno escolhe livremente a matéria que deseja entre as publicadas. O catálogo tem **mapa definitivo de 7 áreas** e **catálogo de partida definido: 11 matérias** (§4), todas ainda a produzir, com **lançamento em ondas** — abre com as primeiras 3 a 5 prontas e libera as demais em ondas quinzenais/mensais. Quem preferir orientação em vez de escolha ganha, na Fase 2, um **plano de ensino sugerido**: um questionário rápido de perfil e nivelamento constrói a sugestão de estudo (§5.8).

**Decisões já validadas com o responsável:** licença vendida no nível Matéria (não por assunto) · trial de 7 dias sem cartão, limitado a ~20% do conteúdo · **a plataforma atenderá também menores de idade**, o que torna os requisitos do ECA Digital parte do escopo do sistema (§12.2) · **licença promocional** por matéria e período, gratuita ou com desconto, concedida por código, pelo admin ou por evento (§6.1.1) · **conta sem login por mais de 1 ano é bloqueada**, de forma reversível, com avisos prévios (§6.5) · **escolha livre de matéria pelo aluno**, com lançamento de 3 a 5 matérias e catálogo crescente · **plano de ensino sugerido por diagnóstico** de perfil e nivelamento, na Fase 2 (§5.8) · **site e sistema adaptados a mobile** — aluno mobile-first, admin e professor responsivos (§9) · **bloqueio de download dos vídeos com marca d'água dinâmica** — proteção em camadas (§10) · **mural de vagas e estágios** gratuito e em autosserviço, com aprovação prévia, gestão pelo anunciante e vigência máxima de 3 meses (§5.7.1).

---

## 2. Visão e proposta de valor

> Entender Direito sem precisar decorar. Aula curta, linguagem de gente, a lei ao lado e um exercício no final para provar que você aprendeu.

**Para quem:** estudantes de Direito, bacharéis em preparação e curiosos que querem conhecer seus direitos.
**O que resolve:** o conteúdo jurídico gratuito é disperso e o pago é caro e enciclopédico. Falta o meio-termo: barato, direto, por assunto, e com prática imediata.
**Como se diferencia:** vende por matéria (não obriga o pacote), abre parte do conteúdo de graça, integra a lei ao estudo e usa linguagem acessível.

### O que NÃO é

- Não é curso preparatório oficial nem instituição de ensino credenciada pelo MEC — é **curso livre**, e isso precisa estar explícito no site.
- Não é consultoria jurídica nem responde caso concreto de usuário.
- Não substitui doutrina; complementa.

---

## 3. Personas

| Persona | Perfil | Dor | O que a converte |
|---|---|---|---|
| **Ana, 21 — graduanda** | 3º semestre, estuda pelo celular no ônibus, orçamento apertado | Não entende a matéria pela aula da faculdade, prova na semana que vem | Aula curta do assunto exato + exercício que simula a prova. Preço de uma matéria avulsa. |
| **Rafael, 27 — bacharel** | Trabalha, estuda à noite, foco em OAB/concurso | Precisa de revisão dirigida e volume de questões | Passe completo, simulados, estatística de acertos por assunto |
| **Carla, 34 — leiga** | Quer entender benefício do INSS / direito do consumidor | Linguagem jurídica é barreira | Conteúdo aberto + matéria avulsa por período curto |
| **Prof. convidado** | Especialista que quer alcance sem montar plataforma | Não quer cuidar de tecnologia, pagamento e suporte | Painel de autoria simples, relatório de audiência e repasse claro |
| **Você (admin)** | Responsável pelo produto, conteúdo e operação | Tempo escasso (5–15h/semana) | Operação que roda sozinha: cobrança, liberação, suspensão e relatórios automáticos |

**Nota sobre público:** o perfil de estudante de Direito no Brasil tem maioria feminina. Isso deve orientar tom e identidade visual (acolhedor, sem estética "cursinho masculino de concurso"), mas o produto não deve ser segmentado por gênero.

---

## 4. Taxonomia do conteúdo

A hierarquia é a espinha dorsal do sistema — dela dependem navegação, busca, licenciamento e relatórios.

```
Área          → Matéria/Disciplina  → Assunto/Tema              → Aula        → Exercício
Direito Público → Direito Constitucional → Controle de Constitucionalidade → Aula 03: ADI e ADC → 8 questões
```

### Mapa definitivo do catálogo (7 áreas)

Estrutura completa de áreas e matérias, mantida por decisão do responsável — é o mapa para onde o catálogo cresce:

- **Fundamentos** — Introdução ao Estudo do Direito, Hermenêutica, Filosofia e Sociologia Jurídica, Direitos Humanos
- **Direito Público** — Constitucional, Administrativo, Tributário, Previdenciário, Ambiental, Eleitoral, Financeiro
- **Direito Privado** — Civil (Parte Geral, Obrigações, Contratos, Coisas, Família, Sucessões), Empresarial, Consumidor
- **Penal** — Direito Penal (Geral e Especial), Processo Penal, Execução Penal
- **Trabalho** — Direito do Trabalho, Processo do Trabalho
- **Processo** — Processo Civil
- **Profissional** — Ética Profissional e Estatuto da OAB

### Catálogo de partida (as 11 matérias, encaixadas no mapa)

Definido pelo responsável. Todo o conteúdo **ainda será produzido**, e o lançamento é **em ondas**: abre com as primeiras 3 a 5 matérias prontas e libera as demais em ondas quinzenais/mensais — notícia recorrente sem segurar o lançamento. Cada matéria é segmentada por aulas, e **o vídeo da aula ministrada é o elemento principal de exibição** (§5.3). Carreiras Jurídicas, Breve História do Direito e Criminologia não constavam do mapa e **somam-se a ele** nas áreas indicadas.

| # | Matéria | Área | Ementa resumida |
|---|---|---|---|
| 1 | **Introdução ao Direito** | Fundamentos (≙ Introdução ao Estudo do Direito) | Norma, Constituição, Justiça, Moral e Ética, Conflito, Técnica Jurídica, Escolas do Direito, Fontes do Direito |
| 2 | **Carreiras Jurídicas** | Fundamentos *(soma ao mapa)* | Juiz, promotor, defensor público, procurador, advogado, analista, técnico, oficial de justiça e carreiras policiais |
| 3 | **Breve História do Direito** | Fundamentos *(soma ao mapa)* | Direito nos povos primitivos, Grécia Antiga, Roma Antiga, Idade Média, Idade Moderna e Idade Contemporânea |
| 4 | **Filosofia do Direito** | Fundamentos (≙ Filosofia e Sociologia Jurídica) | Por que as coisas são como são (ou como deveriam ser); contato transformador com os pensamentos de filósofos |
| 5 | **Teoria Geral do Direito Civil** | Direito Privado (≙ Civil — Parte Geral) | Personalidade e capacidade civil, direitos da personalidade, pessoas jurídicas de direito público e privado, vocabulário da área |
| 6 | **Teoria Geral do Processo** | Processo (porta de entrada de Processo Civil) | Formas de resolução de conflitos, princípios processuais, petição inicial, início do processo, atos dos magistrados (despachos, decisões, sentenças) |
| 7 | **Noções de Direito Constitucional** | Direito Público (nível introdutório de Constitucional) | Poderes Executivo, Legislativo e Judiciário, direitos políticos, direitos fundamentais |
| 8 | **Noções de Direito Administrativo** | Direito Público (nível introdutório de Administrativo) | Poderes e responsabilidades da Administração Pública — atenção especial para quem mira concurso público |
| 9 | **Noções de Direito Penal** | Penal (nível introdutório de Direito Penal) | Principais princípios, aplicação da lei penal, teoria geral do crime e sanções |
| 10 | **Criminologia** | Penal *(soma ao mapa)* | A ciência que estuda o crime e o infrator, para captar informações e reduzir delitos na sociedade |
| 11 | **Direito do Consumidor** | Direito Privado (≙ Consumidor) | Consumidor e fornecedor, produtos e serviços, vício e defeito, responsabilidade civil do fornecedor |

**Leitura editorial do catálogo:** as 11 de partida são a porta de entrada — "Noções de", teoria geral, história, carreiras — perfeitas para o posicionamento descontraído e para os públicos Ana (graduanda de início de curso) e Carla (leiga). As demais matérias do mapa (Tributário, Previdenciário, Trabalho, Ética/OAB, os módulos avançados de Civil etc.) entram nas ondas seguintes, guiadas pela lista de espera/votação. As "Noções de" também funcionam como degrau natural: quem conclui a introdutória recebe oferta da matéria completa quando ela for publicada.

**Áreas para navegação:** as 7 do mapa — Fundamentos · Direito Público · Direito Privado · Penal · Trabalho · Processo · Profissional. No lançamento, áreas ainda sem matéria publicada (Trabalho, Profissional) aparecem com "em breve" e lista de espera.

**Tags transversais** (ortogonais à hierarquia, usadas em filtros e trilhas):
`objetivo` (faculdade · OAB · concurso · cidadão) · `fase` (1º ao 10º semestre) · `dificuldade` (introdutório · intermediário · avançado) · `formato` (aula · revisão · caso prático · resumo)

**Regra de modelagem:** a licença é vendida no nível **Matéria**. Assunto e Aula herdam. Isso evita o inferno de precificar assunto avulso.

---

## 5. Escopo funcional por módulo

### 5.1 Site público (aberto, sem cadastro)
- Home com proposta de valor e prova social
- Catálogo navegável por área e matéria (ementa visível, aulas listadas com cadeado)
- Blog/artigos com dicas — motor de SEO e topo de funil
- **Vade-mécum de consulta livre** (aberto, é isca de tráfego orgânico)
- Glossário "juridiquês → português"
- Página de planos e licenças, com explicação de como adquirir
- Páginas legais: Termos, Privacidade, Reembolso e Cancelamento, Sobre, Contato

### 5.2 Área do aluno
- Painel com "continue de onde parou", progresso por matéria, próximos passos
- Player de aula: vídeo, transcrição, capítulos, materiais para download, artigos citados
- **Painel lateral do vade-mécum** dentro da aula
- Exercício ao final da aula, com correção imediata e comentário por alternativa
- Caderno de erros (questões erradas para refazer)
- Anotações pessoais e favoritos (em aulas e em artigos de lei)
- Minha conta: licenças ativas, faturas, meio de pagamento, cancelamento em 2 cliques

### 5.3 Aula — anatomia obrigatória
Toda aula publicada tem, sem exceção:

1. **Vídeo da aula ministrada — o elemento principal de exibição** (8–15 min é o alvo). O player abre a página da aula; tudo o mais (resumo, materiais, lei, exercício) orbita em torno dele.
2. Resumo em texto (3–8 parágrafos) — serve para SEO e para quem não quer vídeo
3. Dispositivos legais vinculados (chave para o vade-mécum)
4. Material de apoio (PDF opcional)
5. **Exercício** com no mínimo 5 questões e comentário em todas as alternativas

### 5.4 Vade-mécum
- Acervo: CF/88, CC, CP, CPC, CPP, CLT, CTN, CDC, Leis 8.212/91 e 8.213/91, Estatuto da OAB (8.906/94), ECA
- Busca por número de artigo (`art. 5º CF`) e por texto integral, com atalho global (tecla `/`)
- Navegação pelo índice hierárquico (livro / título / capítulo / seção / artigo)
- Favoritar artigo, anotar, marcar
- Deep link bidirecional: da aula para o artigo e do artigo para as aulas que o explicam
- Carimbo visível "texto conferido em DD/MM/AAAA" e rotina de atualização

**Fonte de dados:** LexML (Senado — dados abertos em JSON, licença aberta com atribuição) e Planalto para textos consolidados. Textos de lei e decisões judiciais **não são protegidos por direito autoral** (Lei 9.610/98, art. 8º, IV), então a reprodução é livre — a obrigação é de exatidão e atualização, não de licença.

### 5.5 Exercícios
- **v1:** múltipla escolha (formato OAB, 4 alternativas) e certo/errado (formato Cebraspe)
- **v2:** caso prático discursivo com espelho de correção; simulado cronometrado por matéria
- **v3:** revisão espaçada (o sistema devolve a questão errada em 3, 7 e 21 dias)
- Metadados por questão: gabarito, comentário por alternativa, dispositivos legais, dificuldade, tags, origem (autoral / inspirada em prova)
- Estatística por aluno: acerto por assunto, evolução, tempo médio

### 5.6 Professores: cadastro, autoria e remuneração

**Cadastro do professor** (pelo admin; autocadastro com aprovação em fase posterior):
- Dados pessoais e fiscais: nome, CPF/CNPJ, dados bancários/Pix, endereço, e-mail
- Perfil público: foto, mini-currículo, titulação, matérias que ministra (exibido nas páginas das matérias)
- **Contrato digital**: modelo de remuneração, percentual/valores, prazo, cessão/licença de uso do conteúdo, exclusividade — armazenado e versionado; **sem contrato ativo, o professor não publica**
- Status: `convidado → cadastrado → ativo → suspenso → desligado`

**Responsabilidade pelo conteúdo:** o professor é o responsável técnico pelas aulas que ministra — nome exibido na aula, e o contrato registra a responsabilidade pelo conteúdo apresentado. O desligamento de um professor não remove o conteúdo já cedido (conforme contrato).

**Modelos de remuneração (definidos pelo responsável — os dois suportados, escolhidos por contrato):**

| Modelo | Como funciona | Quando paga |
|---|---|---|
| **Por conteúdo gerado (cachê)** | Valor fixo por aula/módulo entregue e aprovado, definido no contrato | Na aprovação/publicação do conteúdo, no ciclo mensal |
| **Por comissão de vendas** | Percentual (definido no contrato) sobre a receita líquida das licenças da(s) matéria(s) do professor | Fechamento mensal (§5.6.1) |

Um contrato pode combinar os dois (ex.: cachê menor + comissão menor). Passe completo: a receita é rateada entre as matérias consumidas pelo aluno no período (critério de rateio: minutos assistidos por matéria — auditável e à prova de discussão).

**Autoria e fluxo editorial:**
- Perfis: **Autor** (cria e edita rascunho) · **Revisor** (aprova) · **Publicador/Admin** (publica, define preço e visibilidade)
- Estados do conteúdo: `rascunho → em_revisão → aprovado → publicado → arquivado`, com versionamento e histórico
- Relatório do professor: aulas publicadas, minutos assistidos, alunos alcançados, valor a receber
- Upload de vídeo pelo próprio autor, com transcodificação e revisão antes de publicar

### 5.6.1 Fechamento de contas do professor (comissão)

Modelo definido: **apuração mensal automática**.

```
Ciclo (dia 1 a último dia do mês):
1. APURAÇÃO   — sistema consolida as vendas líquidas do mês por professor:
                receita bruta das licenças da matéria
                (−) taxas de gateway   (−) impostos   (−) reembolsos/estornos do período
                (×) percentual do contrato  = comissão do mês
                (+) cachês de conteúdo aprovado no mês
2. CONFERÊNCIA — extrato detalhado venda a venda liberado ao professor
                 (D+3 úteis); prazo de contestação de 5 dias
3. FATURAMENTO — professor emite NF no valor apurado
4. PAGAMENTO   — transferência/Pix até o dia 15; valor mínimo de saque
                 R$ 100 (saldo menor acumula para o mês seguinte)
```

- **Estornos e reembolsos** (inclusive os 7 dias do CDC): deduzidos da apuração do mês em que ocorrem — por isso a apuração mensal foi escolhida em vez do split imediato na venda.
- **Extrato permanente** no painel do professor: cada venda, cada dedução, cada fechamento — transparência é o que mantém professor parceiro.
- Estados da apuração: `aberta → em_conferencia → contestada → aprovada → paga`.
- Toda apuração e pagamento auditados (quem aprovou, quando, comprovante).

### 5.7 Publicidade e patrocínio

Requisito definido pelo responsável: o site vende espaço publicitário para **faculdades, cursos, empresas e patrocinadores**.

**Modelo de venda (decisão):** venda direta gerida no admin — página "Anuncie aqui" com mídia kit (audiência, perfis, posições, tabela de preços) e formulário de contato; a negociação é feita por você, e o admin cadastra anunciante, campanha e peças. Sem autosserviço na v1.

**Posições (decisão): somente áreas gratuitas** — site público, blog, vade-mécum aberto e contas free/trial. **Assinante pago estuda sem anúncio** — isso vira benefício explícito do plano pago na página de vendas.

**Formatos previstos:**
- Banner display nas páginas públicas (topo, lateral, entre seções do blog)
- Conteúdo patrocinado no blog (artigo identificado como "oferecido por")
- Patrocínio de seção (ex.: "Vade-mécum oferecido por [Faculdade X]" por período)
- Destaque no diretório de Carreiras Jurídicas (faculdades e cursos parceiros)

**Regras e salvaguardas:**
- Toda peça identificada como publicidade (CDC, art. 36 — publicidade deve ser identificável como tal)
- **ECA Digital:** anúncios servidos por posição/contexto, **nunca por comportamento** — sem remarketing nem segmentação comportamental, o que também resolve a restrição para menores (§12.2). Anunciante não recebe dado pessoal de aluno.
- Curadoria editorial: recusa de anúncios incompatíveis (conteúdo enganoso, "aprovação garantida" etc.) prevista em contrato
- Métricas para o anunciante: impressões e cliques por peça, relatório mensal automático

**Gestão no admin:** cadastro de anunciante (razão social, CNPJ, contato, contrato), campanhas (peças, posições, período, valor), calendário de ocupação de posições, faturamento do anunciante e relatório de entrega.

### 5.7.1 Mural de vagas de emprego e estágio — Fase 2

Requisito definido pelo responsável: o site tem uma seção de **vagas de emprego e estágio** que escritórios de advocacia (e empresas com vagas jurídicas em geral — departamentos jurídicos, órgãos, faculdades) publicam de forma **gratuita e em autosserviço**.

**Fluxo:**

```
Anunciante cria conta (CNPJ obrigatório) → cadastra a vaga →
fila de moderação (aprovação prévia do admin) → publicada →
gestão pelo próprio anunciante → expira em até 3 meses
```

**Portal do anunciante (requisito do responsável):** para anunciar, o escritório **se cadastra na plataforma** e ganha uma **sessão própria de gestão**, separada da área do aluno:

- **Cadastro do escritório:** razão social, CNPJ (validado), responsável, contato, endereço, logo — editável a qualquer momento pelo próprio anunciante.
- **Gestão de vagas:** criar, editar, pausar, encerrar e repostar vagas; visão do status de cada uma (`em moderação`, `publicada`, `pausada`, `expirada`, `reprovada` com motivo) e da data de expiração.
- **Métricas por vaga:** visualizações e cliques em "como se candidatar".
- Login próprio com perfil `anunciante` (mesmo sistema de autenticação, papel distinto — um usuário pode acumular papéis, ex.: advogado que é aluno e anunciante).
- É o mesmo cadastro de anunciante da frente publicitária (§5.7): quem anuncia vaga hoje é lead natural de banner e patrocínio amanhã.

**Regras definidas:**
- **Publicação gratuita e em autosserviço** — o anunciante cria, edita, pausa e encerra a própria vaga; a gestão da vaga é **responsabilidade do anunciante** (disclaimer visível: a plataforma não intermedeia a contratação nem garante a vaga).
- **Aprovação prévia:** toda vaga passa pela fila de moderação antes de publicar — proteção contra golpes e vagas falsas, essencial com menores na plataforma. Reprovação com motivo notificado.
- **Vigência máxima de 3 meses:** contada da publicação, com expiração automática. Avisos ao anunciante em D-15 e D-3; renovar exige repostar (novo ciclo de moderação), o que impede vaga fantasma perpétua.
- Campos da vaga: cargo, tipo (emprego/estágio), regime, local ou remoto, requisitos, faixa salarial (opcional), como se candidatar (link ou e-mail externo — a candidatura acontece fora da plataforma na v1).
- **Denúncia de vaga** pelo aluno, com fila de revisão no admin.
- Filtros para o aluno: tipo, cidade/UF, área do Direito, data; conexão com a matéria **Carreiras Jurídicas** (vagas exibidas junto ao conteúdo da carreira correspondente).
- **Monetização futura (não é requisito):** destaque pago opcional (topo da lista, selo, divulgação no blog) — reaproveita o cadastro de anunciante da frente publicitária.

**LGPD:** a candidatura ocorre fora da plataforma (link/e-mail do anunciante), então não armazenamos currículos na v1 — decisão que elimina uma classe inteira de obrigações de proteção de dados. Se no futuro houver candidatura interna, tratar como novo requisito com retenção própria.

### 5.8 Plano de ensino sugerido (diagnóstico) — Fase 2

O aluno tem dois caminhos de entrada, sempre:

1. **Escolha livre** — navega no catálogo e escolhe a matéria que quiser. É o caminho padrão, disponível desde o MVP.
2. **Plano de ensino sugerido** — para quem prefere orientação: um **conjunto de questões de resposta rápida** define o perfil e o nível de entendimento do aluno, e o sistema constrói uma sugestão de estudo personalizada.

**O diagnóstico (5–10 minutos):**
- *Perfil:* objetivo (faculdade, OAB, concurso, conhecimento pessoal), fase/semestre, tempo disponível por semana, preferência de formato.
- *Nivelamento:* questões rápidas dos assuntos-chave das matérias relacionadas ao objetivo, sorteadas do banco de questões existente, para medir o nível de entendimento por assunto.

**O plano sugerido entrega (as quatro dimensões definidas):**
1. **Ordem de estudo dentro da matéria** — sequência de assuntos e aulas, pulando ou marcando como revisão o que o nivelamento indicar como dominado.
2. **Trilha entre matérias** — roteiro que cruza matérias conforme o objetivo (ex.: "para seu objetivo, comece por Constitucional, depois Administrativo").
3. **Ritmo e cronograma** — distribuição semanal com base no tempo declarado (ex.: "3 aulas + 15 questões por semana; conclusão estimada em 8 semanas"), com recalibração se o aluno atrasar ou adiantar.
4. **Sugestão de licença** — com o plano montado, o sistema indica o que compensa: matéria avulsa, combo ou passe completo. O plano vira ferramenta de conversão.

**Regras:**
- O diagnóstico é gratuito e aberto a qualquer cadastrado — é isca de topo de funil e alimenta a sugestão de licença.
- O plano é **sugestão, não trilho obrigatório**: o aluno edita, reordena e abandona quando quiser.
- Refazer o nivelamento é permitido (ex.: a cada 3 meses) e recalibra o plano.
- O progresso real (aulas concluídas, acertos em exercícios) realimenta o plano continuamente.
- Entra na **Fase 2**: precisa de mais matérias publicadas e banco de questões volumoso para calibrar bem. No MVP, um recorte leve (quiz de perfil sem nivelamento, apenas para ordenar o catálogo exibido) pode ser avaliado no planejamento da Fase 1.

### 5.9 Administração

Reforço do responsável: a área administrativa concentra **controle de valores das licenças, cadastros e financeiro**.

**Valores e comercial**
- **Tabela de valores das licenças:** preço por matéria × período e do passe completo, com vigência (preço novo vale a partir de data X, sem afetar licenças vigentes), histórico de alterações e simulação de impacto
- Planos, cupons e campanhas promocionais (criar campanha, gerar códigos, conceder manualmente, gatilhos automáticos, acompanhar resgates)

**Cadastros**
- Alunos: busca, perfil, licenças, progresso, atendimento
- **Professores:** cadastro completo, contrato e modelo de remuneração (§5.6)
- Anunciantes e campanhas publicitárias (§5.7)
- Gestão de licenças (conceder cortesia, estender, suspender) e de contas inativas (painel por estado, reativação manual)

**Financeiro**
- Recebimentos, inadimplência, reembolsos, conciliação com gateway
- **Fechamento de contas dos professores** (§5.6.1): fila de apurações do mês, aprovação, registro de NF e comprovante de pagamento
- Faturamento de anunciantes
- Visão consolidada: receita por fonte (licenças, publicidade), custos, repasses

**Transversal**
- Painel de métricas (§13)
- Auditoria: quem alterou o quê e quando — obrigatória em preço, contrato, apuração e concessão de licença

---

## 6. Regras de negócio — licenciamento

Esta é a parte mais crítica do sistema. Erro aqui vira prejuízo ou cliente irritado.

### 6.1 Camadas de acesso

| Camada | Cadastro | Cartão | O que libera | Duração |
|---|---|---|---|---|
| **Aberta** | não | não | Blog, vade-mécum completo, ementas, **1ª aula de cada assunto** | permanente |
| **Teste gratuito** | sim | **não** | 1 matéria à escolha, limitada a ~20% das aulas e 30 exercícios no total. Sem download de material, sem certificado. | 7 dias corridos a partir do 1º acesso |
| **Licença por matéria** | sim | sim | 1 matéria completa: aulas, exercícios, materiais, simulados daquela matéria | período contratado |
| **Licença promocional** | sim | não obrigatório | **1 matéria com acesso total** (igual à licença paga da matéria) | **período definido na campanha** |
| **Passe completo** | sim | sim | Todas as matérias publicadas, incluindo as lançadas durante a vigência | período contratado |

**Regras do teste gratuito**
- Um teste por CPF, não renovável e não acumulável.
- Não exige meio de pagamento (reduz atrito e evita disputa de cobrança indevida).
- Ao expirar: conteúdo bloqueia, mas progresso e anotações são preservados — isso vira argumento de conversão.

### 6.1.1 Licença promocional

Diferente do trial (que é limitado em conteúdo), a promocional dá **acesso total a uma matéria**, limitado apenas pelo **período** definido na campanha. É a ferramenta de marketing e parcerias do sistema.

**Formas de concessão (as três suportadas):**

1. **Cupom/código de campanha** — o admin cria a campanha (matéria, período de acesso, gratuita ou com desconto, quantidade de resgates, validade do código); o aluno resgata o código no site e a licença é criada na hora.
2. **Concessão manual pelo admin** — direto na conta de um aluno específico (parceria, brinde, influenciador, professor convidado).
3. **Automática por evento** — o sistema concede sozinho em gatilhos configuráveis (ex.: indicou um amigo que assinou, concluiu o trial com X% de progresso, data comemorativa).

**Modalidades:** a campanha define se a promocional é **gratuita** (cortesia — sem cobrança) ou **com desconto** (é uma compra normal de licença por matéria com preço promocional; nesse caso passa pelo checkout).

**Regras:**
- Acesso idêntico ao da licença paga da matéria durante a vigência (aulas, exercícios, materiais, simulados).
- Ao expirar, não renova: o aluno recebe oferta de conversão para licença paga, com progresso preservado.
- Limites anti-abuso por campanha: nº máximo de resgates, 1 resgate por CPF por campanha, e política de acúmulo (por padrão, promocional não acumula com outra promocional da mesma matéria).
- Toda concessão fica auditada: campanha de origem, quem concedeu, quando.

### 6.2 Períodos de contratação
Mensal · Trimestral · Semestral · Anual — com desconto crescente. Períodos mais longos são a defesa contra o churn alto típico de assinatura para estudante.

### 6.3 Resolução de acesso (algoritmo)

```
podeAcessar(usuario, aula):
  materia = aula.assunto.materia
  se aula.amostra_gratuita == true            → LIBERA
  licencas = licencas_do_usuario(status = ATIVA, vigencia contém agora)
  se existe licenca de escopo CATALOGO         → LIBERA
  se existe licenca de escopo MATERIA(materia) → LIBERA
  se existe licenca TRIAL cobrindo materia
     e aula está dentro da cota do trial       → LIBERA
  senão                                        → BLOQUEIA (mostra oferta contextual)
```

Licenças **somam**, nunca se anulam. Um aluno pode ter 3 licenças de matéria e depois comprar o passe — a mais abrangente prevalece, as outras seguem válidas até expirar.

A licença promocional **não exige regra nova no algoritmo**: ela é uma licença de escopo `MATERIA` com origem `PROMOCIONAL` e vigência própria — o mesmo `podeAcessar` resolve. Essa é a vantagem de tratar licença como entidade de primeira classe.

### 6.4 Ciclo de vida da licença e da conta

`PENDENTE` (aguardando pagamento) → `ATIVA` → `EM_ATRASO` → `SUSPENSA` → `CANCELADA` / `EXPIRADA`

- **Renovação no cartão:** aviso por e-mail 3 dias antes. Recusa → 3 novas tentativas em 5 dias → `EM_ATRASO` com 3 dias de carência de acesso → `SUSPENSA`.
- **Renovação no Pix avulso:** não renova sozinha. Lembretes em D-7, D-3 e D-0 com link de pagamento em 1 clique.
- **Pix Automático:** renova sozinha, e o aluno cancela pelo app do próprio banco — o sistema precisa tratar o cancelamento vindo por webhook, não só pelo painel.
- **Cancelamento pelo aluno:** acesso mantido até o fim do período já pago. Sem reembolso proporcional após os 7 dias legais.
- **Upgrade matéria → passe:** crédito proporcional do saldo não consumido, abatido na nova cobrança.

### 6.5 Inatividade e bloqueio de conta

Regra definida pelo responsável: **conta sem uso por mais de 1 ano é bloqueada**.

- **O que conta como uso:** qualquer login zera o contador de inatividade. (Simples de entender e de implementar; o aluno é dono do próprio relógio.)
- **Régua de avisos antes do bloqueio:** e-mails automáticos aos 10 meses, 11 meses e 11 meses e 15 dias de inatividade — "entre na sua conta para mantê-la ativa".
- **Bloqueio (reversível):** aos 12 meses, a conta muda para `BLOQUEADA_INATIVIDADE`. Nenhum acesso é possível, mas progresso, anotações e histórico ficam preservados.
- **Reativação self-service:** o próprio aluno reativa por link de verificação enviado ao e-mail cadastrado — sem depender de suporte.
- **Licenças durante o bloqueio:** licenças vigentes têm o prazo **congelado ou não** conforme o caso — como o gatilho é 1 ano sem login, na prática só contas sem licença ativa em uso chegam ao bloqueio; se houver licença vigente (ex.: anual comprada e nunca usada), ela continua correndo normalmente e o bloqueio não estende prazo.
- **Ciclo de vida da conta:** `ATIVA → INATIVA (aviso) → BLOQUEADA_INATIVIDADE → reativada` — estado separado do status das licenças.
- **Conexão com a LGPD (§12.1):** o bloqueio por inatividade alimenta a política de retenção — conta bloqueada há mais de X meses (sugestão: 24) entra na fila de anonimização, com último aviso prévio por e-mail. O prazo exato é decisão pendente (§16).

### 6.6 Reembolso (obrigação legal, não escolha)
- **Arrependimento em 7 dias** (CDC, art. 49 e Decreto do Comércio Eletrônico): devolução **integral**, sem justificativa, mesmo que o aluno já tenha assistido. Vale para toda compra feita a distância.
- **Cancelamento fácil** (CDC, art. 51): botão no painel, em no máximo 2 cliques, com confirmação e protocolo. Esconder cancelamento é cláusula abusiva.
- **Oferta vincula** (CDC, art. 30): o que a página de planos diz é o que vale — preço total, prazo de acesso, o que está incluído.

---

## 7. Precificação — hipótese a validar

Posicionamento pretendido: **abaixo dos grandes preparatórios**, acima do gratuito. A tabela abaixo é hipótese inicial e precisa de teste de disposição a pagar na Fase 0.

| Produto | Mensal | Trimestral | Semestral | Anual |
|---|---|---|---|---|
| Matéria avulsa | R$ 24,90 | R$ 59,90 | R$ 99,90 | R$ 169,90 |
| Passe completo | R$ 59,90 | R$ 149,90 | R$ 269,90 | R$ 449,90 |

**Alavancas a testar:** desconto de estudante com comprovante; combo de 3 matérias; preço menor no primeiro mês; passe anual como oferta principal (melhor previsibilidade de caixa e menor churn).

**Regra de ouro:** o preço da matéria avulsa multiplicado por 3 deve ficar próximo do passe completo. Se ficar muito abaixo, ninguém compra o passe; muito acima, ninguém compra avulso.

---

## 8. Pagamentos

**Meios aceitos:** Pix e cartão de crédito. Sem boleto, sem carteiras digitais na v1 (decisão do produto).

### 8.1 Como cada meio funciona no sistema

| Meio | Uso | Recorrência | Observação |
|---|---|---|---|
| **Pix (QR + copia-e-cola)** | compra avulsa de período | não | Liberação em segundos via webhook. Menor custo por transação. Ideal para o público sem cartão. |
| **Cartão de crédito** | assinatura | sim, automática | Exige tokenização. Nunca armazenar o número do cartão (PCI-DSS SAQ-A: o gateway captura). |
| **Pix Automático** | assinatura sem cartão | sim, automática | Disponível no Brasil desde junho de 2025 e em crescimento acelerado. **É o principal desbloqueio para este público** — grande parte dos estudantes não tem cartão de crédito. |

### 8.2 Escolha de gateway

Faixas indicativas de mercado (confirmar na negociação — variam por volume e mudam com frequência):

| Gateway | Pix | Cartão | Recorrência | Split |
|---|---|---|---|---|
| Asaas | ~R$ 0,49 por transação | ~2,99% | avançada | sim |
| Pagar.me | variável | ~3,19% | sim | nativo e robusto |
| Iugu | variável | a partir de ~2,49% | avançada | sim |
| Mercado Pago | ~0,99% | ~4,99% | básica | sim |
| Stripe | variável | ~3,99% + R$ 0,39 | avançada | Connect |

**Recomendação:** **Asaas** ou **Pagar.me**. O critério decisivo não é a taxa, é o **split de pagamento** — com professores convidados recebendo percentual, o repasse automático na liquidação evita virar rotina manual de transferência e reduz risco fiscal. Confirmar antes de fechar: (a) suporte a Pix Automático via API, (b) split com retenção, (c) qualidade dos webhooks e reenvio em falha.

### 8.3 Requisitos transversais de pagamento
- Webhook idempotente (o mesmo evento pode chegar duas vezes — nunca liberar duas licenças).
- Fila com retentativa para eventos de pagamento; nada de processar direto no request.
- Conciliação diária entre pedidos do sistema e liquidação do gateway.
- Emissão de NFS-e (ISS municipal) — verificar obrigação no município da empresa.
- Antifraude e política de chargeback no cartão.
- Cupons de desconto com regras: validade, limite de uso, escopo (matéria específica ou geral), primeiro pagamento ou recorrente.

---

## 9. Identidade e diretrizes de UX

O pedido é "visual descontraído". Traduzindo em regras aplicáveis:

**Tom de voz** — segunda pessoa, frases curtas, zero juridiquês desnecessário. O conteúdo é sério; o tom não precisa ser solene. Humor contido, nunca infantilizado — o aluno está pagando para levar a matéria a sério.

**Requisito confirmado pelo responsável: site e sistema adaptados a equipamentos mobile.** Isso vale para as três frentes:

| Frente | Exigência mobile |
|---|---|
| **Site público** | Responsivo completo — catálogo, blog, vade-mécum e checkout funcionam integralmente no celular; Pix por copia-e-cola e QR |
| **Área do aluno** | **Mobile-first**: player em tela cheia com legendas, resumo legível, exercícios com alvos de toque generosos, vade-mécum lateral vira painel deslizante (bottom sheet) no celular |
| **Sistema (admin e professor)** | Responsivo — as tarefas do dia a dia (aprovar aula, conceder licença, ver métricas, responder aluno) executáveis do celular; tarefas pesadas (upload de vídeo, edição longa) otimizadas para desktop, mas não bloqueadas no mobile |

**Interface**
- **Mobile-first, sem negociação.** O aluno estuda no celular, em deslocamento, muitas vezes sem som — daí a importância de legendas e do resumo em texto.
- Testar em aparelhos de entrada e rede 3G/4G limitada: vídeo com qualidade adaptativa (HLS), páginas leves, imagens comprimidas. O público-alvo nem sempre tem flagship com Wi-Fi.
- O caminho para "app" já está no roadmap: PWA instalável com download offline na Fase 3 — sem app nativo antes disso.
- Aulas curtas e progresso sempre visível (barra por matéria, não só por aula).
- Cor e ilustração leves; hierarquia tipográfica forte para textos longos de lei.
- Estados vazios que ensinam ("você ainda não errou nenhuma questão — quando errar, ela aparece aqui para revisar").
- **Acessibilidade WCAG 2.1 AA:** contraste, navegação por teclado, legendas em todo vídeo, alvos de toque adequados.

**Cuidado regulatório com gamificação:** o ECA Digital restringe design manipulativo dirigido a menores (recompensa variável, notificação persistente, gamificação excessiva). Streaks e badges leves, sim; mecânica de vício, não.

---

## 10. Arquitetura técnica proposta

Escolhida para caber no seu ambiente atual (Docker Compose no WSL2, ao lado das stacks `appluz-dev` e `teiaflow`) e para operar com pouca manutenção.

```
[Next.js 15 App Router]  →  páginas públicas em SSG/ISR (SEO) + área logada em SSR
        │
        ├── API (rotas Next ou NestJS separado)
        ├── PostgreSQL 16      — dados, licenças, progresso, busca full-text pt-BR
        ├── Redis              — sessão, cache, rate limit
        ├── BullMQ             — webhooks, e-mails, ingestão de leis, transcodificação
        ├── Cloudflare R2 / S3 — PDFs e materiais
        ├── Panda Video        — hospedagem e proteção de vídeo
        └── Gateway (Asaas/Pagar.me) — Pix, cartão, Pix Automático, split
```

**Decisões e porquês**
- **Next.js** — o site público precisa ranquear no Google; SSG/ISR resolve isso sem stack separada.
- **PostgreSQL com `tsvector` em português** cobre a busca do vade-mécum no MVP; Meilisearch só se o acervo e o volume justificarem.
- **Vídeo no Panda Video** — plataforma brasileira, cobrança em real, com marca d'água dinâmica, anti-download e controle de domínio prontos. Cloudflare Stream é mais barato, mas exigiria construir a proteção. Para conteúdo pago, a proteção pronta vale a diferença.
- **Autenticação** — e-mail + senha, magic link e Google. 2FA obrigatório para admin e professor.
- **Proteção de vídeo — REQUISITO formal do responsável: bloqueio de download, com marca d'água.** Solução em camadas (nenhuma camada sozinha basta; juntas tornam a pirataria cara e rastreável):

| Camada | Mecanismo | O que impede |
|---|---|---|
| 1. Streaming, nunca arquivo | Vídeo servido em **HLS com URLs assinadas e expiração curta** (minutos); nenhum MP4 exposto | Download direto pelo link e compartilhamento de URL |
| 2. Criptografia | HLS com chave criptografada (AES-128 / DRM do provedor) entregue só a sessão autenticada | Captura do stream por ferramentas de download (yt-dlp e similares) |
| 3. Player protegido | Player sem botão de download, bloqueio de clique direito, domínio restrito (o vídeo só toca no site) | Embed do vídeo em outros sites e download casual |
| 4. **Marca d'água dinâmica visível** | Nome + CPF parcial do aluno **sobrepostos ao vídeo em posição móvel**, renderizados por sessão | Regravação de tela: o vídeo vazado identifica quem vazou — dissuasão principal |
| 5. Marca d'água forense (quando disponível no provedor) | Identificador invisível embutido no stream por sessão | Rastreio de vazamento mesmo com a marca visível recortada |
| 6. Controle de sessão | Limite de sessões simultâneas e de dispositivos por conta; detecção de uso anômalo (IPs distantes no mesmo horário) e bloqueio progressivo | Conta compartilhada |

  - **Implantação:** as camadas 1–4 são atendidas por provedor especializado (Panda Video entrega URLs assinadas, anti-download, domínio restrito e marca d'água dinâmica prontos — critério decisivo da escolha em vez do Cloudflare Stream). A camada 5 depende do plano do provedor; a 6 é do nosso sistema.
  - **Termos de uso:** cláusula expressa proibindo captura/redistribuição, com previsão de suspensão da conta e responsabilização — a marca d'água é o que torna a cláusula aplicável na prática.
  - **Limite honesto:** nenhuma solução impede 100% a regravação de tela; o objetivo é tornar o vazamento **identificável** (marca com dados do aluno) e **caro** (esforço técnico), o que na prática reduz a pirataria a nível residual.
  - **Materiais de apoio (PDFs):** download é permitido por natureza; recebem carimbo com nome/e-mail do aluno na geração.
- **Deploy** — Docker Compose em VPS, coerente com o que você já opera. Ambientes: dev (WSL2) · staging · produção. CI/CD por GitHub Actions. Backup diário do Postgres **com teste de restauração** (backup não testado não é backup).
- **Observabilidade** — Sentry, logs estruturados, monitor de uptime, alerta em falha de webhook de pagamento.

**Custo de infraestrutura estimado no MVP:** cerca de R$ 200 a R$ 450/mês (VPS, vídeo, e-mail transacional, domínio), mais as taxas por transação do gateway. Valor indicativo, a confirmar.

---

## 11. Modelo de dados (entidades principais)

| Domínio | Entidades |
|---|---|
| **Identidade** | `usuario`, `perfil` (aluno/professor/revisor/admin), `professor`, `sessao`, `dispositivo` |
| **Catálogo** | `area`, `materia`, `assunto`, `aula`, `aula_versao`, `video`, `material_apoio`, `tag` |
| **Exercícios** | `exercicio`, `questao`, `alternativa`, `tentativa`, `resposta`, `caderno_erros` |
| **Legislação** | `norma`, `dispositivo` (artigo/parágrafo/inciso), `vinculo_aula_dispositivo`, `favorito`, `anotacao` |
| **Comercial** | `plano`, `preco`, `cupom`, `campanha_promocional`, `resgate`, `pedido`, `pagamento`, `assinatura`, **`licenca`**, `reembolso` |
| **Progresso** | `progresso_aula`, `progresso_materia`, `evento_aprendizagem` |
| **Plano de ensino** | `diagnostico` (respostas de perfil e nivelamento), `plano_estudo`, `plano_item` (aula/exercício, ordem, semana prevista, status) |
| **Repasse** | `contrato_professor` (modelo cachê/comissão, percentual, vigência), `apuracao`, `apuracao_item` (venda a venda), `repasse`, `nota_fiscal_professor` |
| **Publicidade** | `anunciante`, `campanha_publicitaria`, `peca` (criativo, formato), `insercao` (posição × período), `metrica_peca` (impressões, cliques) |
| **Vagas** | `vaga` (status: `rascunho → em_moderacao → publicada → pausada → expirada → removida`; `publicada_em`, `expira_em` ≤ 3 meses), `denuncia_vaga` |
| **Futuro previsto** | `contrato_b2b` (licenças patrocinadas), `afiliado` + origem no `pedido` (§12-B) |
| **Governança** | `log_auditoria`, `solicitacao_titular` (LGPD), `consentimento` |

**Entidade `licenca` — o coração do sistema:**

```
licenca
  id
  usuario_id
  escopo          ENUM: CATALOGO | MATERIA
  materia_id      (nulo quando escopo = CATALOGO)
  origem          ENUM: TRIAL | COMPRA | PROMOCIONAL | CORTESIA | MIGRACAO
  campanha_id     (nulo exceto quando origem = PROMOCIONAL)
  status          ENUM: PENDENTE | ATIVA | EM_ATRASO | SUSPENSA | CANCELADA | EXPIRADA
  inicio_em
  fim_em
  assinatura_id   (nulo em compra avulsa)
  cota            JSON — limites do trial (aulas, exercícios)
  criada_em / atualizada_em
```

Separar `assinatura` (contrato de cobrança recorrente) de `licenca` (direito de acesso vigente) é o que permite Pix avulso, cortesia, trial, promocional e cartão recorrente coexistirem sem gambiarra.

**Entidade `campanha_promocional`:**

```
campanha_promocional
  id
  nome / codigo            (código de resgate, quando aplicável)
  tipo_concessao   ENUM: CODIGO | MANUAL | EVENTO
  modalidade       ENUM: GRATUITA | DESCONTO
  materia_id
  duracao_acesso           (período que a licença concede)
  desconto_percentual      (nulo quando GRATUITA)
  gatilho          JSON    (regra do evento, quando tipo = EVENTO)
  max_resgates / resgates_usados
  valida_de / valida_ate
  criada_por / status
```

**Estado da conta (`usuario.status_conta`):** `ATIVA | INATIVA_AVISO | BLOQUEADA_INATIVIDADE | ENCERRADA`, com `ultimo_login_em` como base do relógio de inatividade (§6.5) — um job diário varre e transiciona os estados.

---

## 12. Conformidade e riscos jurídicos

### 12.1 LGPD
- **Bases legais:** execução de contrato (conta, pagamento, entrega da aula) · legítimo interesse (métricas agregadas, antifraude) · consentimento (marketing e cookies não essenciais).
- **Encarregado (DPO)** nomeado, com canal de contato publicado.
- **Direitos do titular:** portal para acesso, correção, exclusão, portabilidade e revogação, com prazo de resposta controlado.
- **Minimização:** não pedir CPF no cadastro — só na compra (para NF e marca d'água).
- **Retenção e descarte:** prazos definidos por tipo de dado; anonimização após exclusão de conta, preservando o mínimo exigido pela legislação fiscal. O bloqueio por inatividade (§6.5) é o primeiro estágio dessa política: conta bloqueada há mais tempo que o prazo definido entra na fila de anonimização, com aviso prévio.
- **Banner de cookies** com recusa tão fácil quanto o aceite; analytics não essencial só após consentimento.
- **Contrato de operador** com gateway, hospedagem de vídeo e e-mail.

### 12.2 Menores de idade (ECA Digital)
**Decisão do responsável: a plataforma atenderá também menores de idade** (ex.: vestibulandos e adolescentes interessados). Com isso, as obrigações do ECA Digital vigentes em 2026 deixam de ser risco a evitar e viram **requisitos do sistema**:

- **Verificação de idade** que vá além da autodeclaração — data de nascimento + validação por CPF é o mínimo; avaliar serviço de verificação na compra.
- **Consentimento do responsável legal** para cadastro de menor de 18 anos, com fluxo próprio (e-mail/aceite do responsável) e registro do consentimento.
- **Compra sempre pelo responsável:** menor não contrata; o meio de pagamento e a NF ficam no CPF do adulto responsável.
- **Privacy by design:** perfil privado por padrão, sem compartilhamento de dados de menores com terceiros, analytics mínimo.
- **Proibição de publicidade comportamental dirigida a menores** — o modelo de receita já é assinatura, o que ajuda; remarketing e pixels de anúncio não podem ser aplicados a contas de menores.
- **Design não manipulativo:** sem recompensa variável, notificação persistente ou gamificação de vício para esse público (reforça §9).
- Se a base de menores crescer muito (limiar legal de 1 milhão de usuários menores), há obrigação de **relatórios semestrais** — distante do MVP, mas registrado.

**Impacto no escopo:** o fluxo de cadastro ganha ramificação por idade e consentimento parental já na Fase 1 (ou, alternativa mais barata: lançar o MVP 18+ e habilitar o fluxo de menores na Fase 2, quando o produto estiver validado — a decidir no planejamento da Fase 1).

### 12.3 Consumidor
Já detalhado em §6.5: arrependimento em 7 dias, cancelamento fácil com protocolo, oferta que vincula, informação completa antes da compra (CNPJ, endereço, carga horária, prazo de acesso, preço total, política de reembolso).

### 12.4 Propriedade intelectual
- **Aulas** — contrato com cada professor convidado definindo cessão ou licença de uso, prazo, exclusividade e remuneração. Sem contrato assinado, não publica.
- **Lei e jurisprudência** — livres de direito autoral (Lei 9.610/98, art. 8º, IV). Reprodução permitida; a obrigação é de exatidão.
- **Doutrina** — protegida. Citação apenas dentro dos limites do art. 46 da mesma lei, com atribuição.
- **Imagens e trilhas** — só de banco licenciado ou próprias.
- **Marca** — registrar no INPI (classe 41). Atenção: "Aprendendo o Direito" é bastante descritivo, o que aumenta o risco de indeferimento por falta de distintividade. **Registrar como marca mista** (nome + logo) melhora a chance. Verificar disponibilidade antes de investir em identidade visual.

### 12.5 Publicidade profissional
Se o responsável for advogado inscrito na OAB, as regras de publicidade da entidade se aplicam. Conteúdo educacional é permitido; o cuidado é não misturar a plataforma com captação de clientela para escritório.

### 12.6 Certificação
Curso livre não exige credenciamento do MEC, e o certificado emitido é de curso livre. Isso precisa estar dito com todas as letras na página de vendas — prometer mais do que isso é publicidade enganosa.

---

## 12-B. Oportunidades adicionais (selecionadas pelo responsável)

Soluções propostas além do escopo original, aprovadas para o discovery. Todas reutilizam infraestrutura já planejada — nenhuma exige retrabalho se o modelo de dados nascer preparado:

### B.1 Licenças patrocinadas (B2B)
Faculdade, empresa ou patrocinador compra **lotes de licenças** para seus alunos/funcionários. Painel do parceiro com convites por e-mail/código, relatório agregado de uso (sem dados individuais além do consentido) e renovação por contrato. É a ponte natural entre a publicidade (§5.7) e o licenciamento (§6): o anunciante de hoje é o comprador B2B de amanhã. Tecnicamente é a entidade `licenca` com origem nova (`B2B`) + entidade `contrato_b2b` — por isso vale prever agora. **Fase 3.**

### B.2 Programa de afiliados
Alunos, professores e influenciadores divulgam com link/cupom próprio e ganham comissão por venda. **Reutiliza integralmente o motor de fechamento de contas do professor** (§5.6.1): apuração mensal, extrato, mínimo de saque, NF. Prevista no modelo: entidade `afiliado` + rastreio de origem no `pedido`. **Fase 2–3**, após o fechamento estar rodando bem para professores.

### B.3 Mural de vagas e estágios — promovido a requisito
Virou funcionalidade definida do site (§5.7.1): publicação **gratuita e em autosserviço** por escritórios e empresas, com aprovação prévia, gestão pelo anunciante e vigência máxima de 3 meses. **Fase 2.** A monetização por destaque pago permanece como oportunidade futura.

### B.4 Eventos ao vivo patrocinados
Aulões e webinars gratuitos com marca do patrocinador ("Aulão de véspera de OAB oferecido por X"). Gera lead qualificado para o patrocinador (inscritos que consentirem) e cadastro para a plataforma; a gravação vira conteúdo do catálogo depois. Operacionalmente simples: transmissão via ferramenta externa (YouTube unlisted/Zoom) com página de inscrição própria. **Fase 2–3**, pode ser testado manualmente antes de virar funcionalidade.

**Sequência sugerida:** B.4 (teste manual barato) → B.2 (afiliados, motor já pronto) → B.1 e B.3 (exigem força comercial B2B).

---

## 13. Métricas de sucesso

| Métrica | O que mede | Meta inicial |
|---|---|---|
| Ativação | % de cadastros que assistem à 1ª aula em 24h | ≥ 60% |
| Conversão trial → pago | eficácia do teste gratuito | 8% a 15% |
| Churn mensal | retenção da assinatura | < 8% |
| Conclusão de aula | qualidade e duração do conteúdo | > 70% |
| Exercícios por aluno ativo/semana | engajamento real com a prática | ≥ 15 |
| LTV / CAC | sustentabilidade da aquisição | > 3 |
| Tráfego orgânico | eficácia do conteúdo aberto e do vade-mécum | crescimento mês a mês |
| Receita de publicidade | ocupação das posições e ticket médio por anunciante | fila de anunciantes ≥ posições a partir da Fase 2 |
| NPS | satisfação | > 50 |

**Instrumentação mínima no MVP:** eventos de cadastro, início e conclusão de aula, resposta de exercício, início e fim de trial, checkout iniciado e concluído, cancelamento. Sem isso, não há como decidir nada depois.

---

## 14. Roadmap por fases

### Fase 0 — Validação (2 a 3 semanas, antes de escrever código de produto)
Entrevistar 10 estudantes · publicar landing de captura de e-mail · gravar 3 aulas piloto e medir conclusão · testar disposição a pagar com preço real (pré-venda) · registrar domínio e verificar a marca no INPI.
**Critério para seguir:** 3 das 10 pessoas dizem que pagariam, e pelo menos 1 paga na pré-venda.

### Fase 1 — MVP (10 a 14 semanas de desenvolvimento)
**1ª onda do catálogo: 3 a 5 das 11 matérias definidas (§4)** — o aluno escolhe livremente entre elas; as demais entram em ondas quinzenais/mensais pós-lançamento, com lista de espera/votação ordenando a fila. Site público com catálogo e blog · cadastro e login · player com resumo, materiais e exercício de múltipla escolha · vade-mécum com busca e painel lateral na aula · trial de 7 dias · licença por matéria e passe completo · concessão manual de promocional e bloqueio por inatividade · Pix e cartão · painel do aluno com cancelamento · admin básico · páginas legais completas.
**Fora do MVP:** multi-professor com fechamento de contas, publicidade, split, diagnóstico/plano de ensino, motor de campanhas, simulados, certificados, gamificação, app. (A "página Anuncie aqui" estática com formulário de contato pode entrar já no MVP para começar a formar fila de anunciantes.)

### Fase 2 — Escala (8 a 10 semanas)
Painel de autoria e fluxo editorial · **cadastro completo de professores com contrato e fechamento de contas mensal (§5.6)** · **frente publicitária: mídia kit, gestão de anunciantes e primeiras posições (§5.7)** · **diagnóstico de perfil/nivelamento e plano de ensino sugerido (§5.8)** · Pix Automático · simulados cronometrados · cupons e **campanhas promocionais completas** (códigos, concessão automática por evento) · caderno de erros · **ondas restantes das 11 matérias do catálogo** · **mural de vagas e estágios: gratuito, autosserviço, aprovação prévia, vigência máx. 3 meses (§5.7.1)** · eventos ao vivo patrocinados (teste manual) · programa de indicação.

*Nota:* a concessão **manual** de licença promocional pelo admin e o bloqueio por inatividade são simples e já entram na **Fase 1**; o motor de campanhas (códigos e gatilhos automáticos) fica para a Fase 2.

### Fase 3 — Diferenciação
Revisão espaçada · trilhas por objetivo (faculdade, OAB, concurso) · tutor de IA ancorado no vade-mécum e nas aulas · certificados · PWA com download para consumo offline · **licenças patrocinadas B2B com painel do parceiro (§12-B.1)** · **programa de afiliados (§12-B.2)** · destaque pago no mural de vagas · área institucional para faculdades.

**Nota de realismo:** com 5 a 15 horas por semana e execução solo, a Fase 1 leva de 6 a 9 meses de calendário só de desenvolvimento — e o lançamento com **3 a 5 matérias completas multiplica a carga de produção de conteúdo** (a grosso modo, 40 a 100 aulas com exercícios). Isso torna quase obrigatório antecipar os professores convidados: fechar 2 a 4 parceiros na Fase 0/1 para produzirem matérias em paralelo (mesmo que o painel de autoria só chegue na Fase 2 — o conteúdo pode ser recebido e publicado pelo admin). Alternativas: contratar apoio pontual de desenvolvimento para liberar seu tempo para conteúdo, ou lançar no limite inferior (3 matérias).

---

## 15. Riscos e mitigação

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| 1 | **Produção de conteúdo trava o projeto** — lançar com 3 a 5 matérias multiplica a carga de gravação | Crítico | Antecipar professores convidados (2 a 4 parceiros produzindo em paralelo desde a Fase 0/1), roteiro padronizado, gravação em lote, e lançar no limite inferior (3 matérias) se preciso |
| 2 | **Pirataria** — vídeo redistribuído | Alto | Requisito formal atendido pela proteção em 6 camadas do §10: streaming assinado, criptografia, player protegido, marca d'água visível e forense, controle de sessão |
| 3 | **Vade-mécum desatualizado** — lei muda e o aluno estuda errado | Alto | Rotina automática de atualização, carimbo de data visível, aviso destacado de alteração recente |
| 4 | **Churn alto** — assinatura de estudante é volátil | Alto | Priorizar planos semestral e anual, conteúdo novo constante, revisão espaçada como gancho de retorno |
| 5 | **Concorrência de grandes players** | Médio | Não competir em catálogo. Competir em preço por matéria, linguagem acessível e integração com a lei |
| 6 | **Dependência de professor convidado** | Médio | Contrato com prazo e cessão claros; nunca deixar uma matéria inteira nas mãos de um único autor sem contrato |
| 7 | **Pix avulso não renova** — receita cai no vencimento | Médio | Régua de lembretes D-7/D-3/D-0 e adoção de Pix Automático na Fase 2 |
| 8 | **Complexidade do licenciamento** gera bug de acesso | Médio | Testes automatizados cobrindo toda a matriz de escopo × status × vigência antes do lançamento |
| 9 | **Conformidade com menores** (ECA Digital) falha ou incompleta | Alto | Verificação de idade + consentimento parental como requisito de Fase 1/2; compra sempre no CPF do responsável; sem publicidade comportamental |
| 10 | **Marca descritiva** indeferida no INPI | Baixo | Registro como marca mista; verificar antes de investir na identidade |
| 11 | **Conflito de interesse na publicidade** — anunciar cursos concorrentes ou conteúdo enganoso | Médio | Curadoria editorial em contrato, direito de recusa, identificação obrigatória de publicidade (CDC art. 36) |
| 12 | **Disputa com professor sobre comissão** | Médio | Contrato com percentual e critério de rateio explícitos, extrato venda a venda, prazo formal de contestação na apuração |
| 13 | **Vaga falsa ou golpe no mural** expõe alunos | Médio | Aprovação prévia obrigatória, CNPJ validado, denúncia pelo aluno, disclaimer de responsabilidade do anunciante, expiração automática em 3 meses |

---

## 16. Decisões pendentes

Estas travam o detalhamento e precisam de resposta antes da Fase 1:

1. **Ordem das ondas de lançamento** — o catálogo das 11 matérias está definido (§4); falta ordenar quais 3 a 5 abrem a 1ª onda e a sequência das demais. Sugestão de 1ª onda: Introdução ao Direito, Carreiras Jurídicas e Noções de Constitucional (porta de entrada + maior busca), validar na Fase 0.
2. **CNPJ ou pessoa física?** Define emissão de NF, contrato com gateway e tributação.
3. **Modelo de remuneração dos professores convidados** — cachê fixo por aula ou percentual da receita da matéria? Muda o desenho do split.
4. **Certificado de conclusão** entra em qual fase, e com qual carga horária declarada?
5. **Público-alvo primário** — graduando, candidato à OAB ou leigo? A resposta muda tom, formato da aula e estilo do exercício.
6. **Orçamento e disponibilidade real** para a Fase 1 — determina se o caminho é solo, apoio pontual ou redução de escopo.
7. **Nome definitivo** — confirmar disponibilidade da marca e do domínio antes de qualquer investimento em identidade visual.
8. **Quando entra o fluxo de menores** — cadastro com consentimento parental já na Fase 1, ou MVP 18+ com o fluxo habilitado na Fase 2? (O atendimento a menores está decidido; o timing, não.)
9. **Prazo de anonimização após bloqueio por inatividade** — sugestão de 24 meses de conta bloqueada antes de anonimizar os dados; confirmar o prazo.
10. **Tabela de preços da publicidade** — valores por posição/formato/período para o mídia kit; definir quando houver os primeiros números de audiência.
11. **Percentuais de comissão dos professores** — faixa padrão a ofertar em contrato (mercado pratica de 20% a 50% conforme exclusividade e produção); definir antes de fechar os primeiros parceiros.

---

## Fontes consultadas

- [Comparativo de gateways de pagamento no Brasil 2026 — Mind Group](https://mindconsulting.com.br/2026/07/gateways-pagamento-online-brasil-comparativo-2026/)
- [Pix Automático: análise de dados do 1º trimestre — PagBrasil](https://www.pagbrasil.com/pt-br/blog/pagamento-recorrente/pix-automatico-2026/)
- [Panda Video vs. Vimeo — comparativo oficial](https://www.pandavideo.com/br/compare/panda-vimeo)
- [Dados abertos do LexML — Projeto LexML / Senado Federal](https://projeto.lexml.gov.br/transparencia/dados-abertos)
- [Cursos online sem ciladas: direitos do consumidor no EAD](https://codigoalpha.blog/cursos-online-direitos-do-consumidor-ead/)
- [LGPD na educação em 2026: o impacto do ECA Digital — Confidata](https://confidata.com.br/blog/lgpd-educacao-2026-impacto-eca-digital)
