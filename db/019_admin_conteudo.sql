-- =====================================================================
-- O que faltava para o conteúdo ser gerido pelo admin, e não por seed.
--
-- Até aqui, blog (§5.5), mural de vagas (§5.7.1), catálogo (§4) e portais
-- (§5.10) existiam só como linhas semeadas por migração: publicar um post
-- exigia escrever SQL e reconstruir a imagem. As tabelas estavam certas —
-- o que faltava eram as colunas que só fazem sentido quando existe gente
-- operando o sistema: quem mexeu, quando, e por que recusou.
--
-- Nada aqui muda o que o site público lê. É acréscimo, e por isso roda
-- sobre a base em produção sem reescrever uma linha existente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Blog (§5.5)
-- ---------------------------------------------------------------------
-- `publicado_em` é a data que o LEITOR vê e que ordena a vitrine; não
-- serve para saber quando o texto foi mexido pela última vez. Com edição
-- pelo admin, essas duas datas divergem no primeiro dia — corrigir um
-- parágrafo não pode empurrar o artigo de volta ao topo da lista.
ALTER TABLE post ADD COLUMN criado_em     TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE post ADD COLUMN atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now();

-- A lista da retaguarda é "tudo, rascunho primeiro, mais recente no
-- topo" — consulta diferente da vitrine pública, que só olha publicados.
CREATE INDEX post_retaguarda_idx ON post (status, atualizado_em DESC);

-- ---------------------------------------------------------------------
-- Mural de vagas (§5.7.1)
-- ---------------------------------------------------------------------
-- A moderação prévia já estava no schema como estado (`em_moderacao`), mas
-- sem registro de quem decidiu. Sem isso, "por que esta vaga foi recusada?"
-- é pergunta sem resposta — e o §5.7.1 promete ao anunciante um motivo.
ALTER TABLE vaga ADD COLUMN moderada_por   TEXT;
ALTER TABLE vaga ADD COLUMN moderada_em    TIMESTAMPTZ;
ALTER TABLE vaga ADD COLUMN motivo_recusa  TEXT;
ALTER TABLE vaga ADD COLUMN atualizada_em  TIMESTAMPTZ NOT NULL DEFAULT now();

-- Contato do anunciante: `como_candidatar` é o que o candidato vê; para
-- avisar quem publicou que a vaga foi recusada, ou que expira em breve,
-- é preciso um endereço nosso, que não vai para a tela pública.
ALTER TABLE vaga ADD COLUMN contato_anunciante TEXT;

-- Recusar sem dizer por quê transforma a moderação em caixa-preta. A
-- restrição obriga o motivo no único estado em que ele é devido.
ALTER TABLE vaga ADD CONSTRAINT vaga_recusa_tem_motivo
  CHECK (status <> 'removida' OR motivo_recusa IS NOT NULL);

-- A fila de moderação é a tela mais usada do mural: "em_moderacao,
-- mais antiga primeiro" — quem esperou mais é atendido antes.
CREATE INDEX vaga_fila_moderacao_idx ON vaga (criada_em)
  WHERE status = 'em_moderacao';

-- ---------------------------------------------------------------------
-- Catálogo (§4)
-- ---------------------------------------------------------------------
-- `aula.atualizada_em` já existe desde a 001. Matéria e assunto não
-- tinham carimbo nenhum — e com edição pelo admin, saber o que mudou
-- ontem passa a ser o primeiro filtro de quem revisa.
ALTER TABLE materia ADD COLUMN atualizada_em TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE assunto ADD COLUMN atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now();

-- §5.3: a aula publicada precisa de resumo — ele é a meta description e o
-- que o aluno lê antes de dar play. A regra estava só no texto do
-- discovery; passa a ser do banco, onde não há como esquecer.
ALTER TABLE aula ADD CONSTRAINT aula_publicada_tem_resumo
  CHECK (status <> 'publicado' OR length(btrim(resumo)) >= 20);

-- ---------------------------------------------------------------------
-- Portais de professor (§5.10)
-- ---------------------------------------------------------------------
-- O portal 0 nasceu com id explícito na 018 e a sequência ficou para trás.
-- Enquanto portais forem criados à mão isso passa despercebido; no dia em
-- que o admin criar o primeiro, `nextval` devolveria um id já usado e a
-- inserção quebraria com violação de chave primária.
SELECT setval(
  pg_get_serial_sequence('portal', 'id'),
  GREATEST((SELECT max(id) FROM portal), 1)
);

-- Mesma precaução para as demais sequências que receberam linha semeada
-- com id implícito — barato agora, incidente de produção depois.
SELECT setval(pg_get_serial_sequence('portal_plano', 'id'),
              GREATEST((SELECT max(id) FROM portal_plano), 1));

-- §5.6/§5.10: sem contrato aceito o professor não publica. O dado já
-- existia (`aceito_em`); faltava saber QUEM registrou o aceite do nosso
-- lado, que é o que a auditoria do §5.9 exige de contrato.
ALTER TABLE portal_contrato ADD COLUMN registrado_por TEXT;

-- Identificação do responsável no rodapé de cada portal (§5.10, mitigação
-- do risco de conteúdo de terceiro no nosso domínio). É dado legal, não
-- personalização: fica em coluna, não no JSONB que o professor edita.
ALTER TABLE portal ADD COLUMN responsavel_nome  TEXT;
ALTER TABLE portal ADD COLUMN responsavel_doc   TEXT;   -- CNPJ do professor
ALTER TABLE portal ADD COLUMN responsavel_email TEXT;
