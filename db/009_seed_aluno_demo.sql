-- =====================================================================
-- Aluno de demonstração. Enquanto a autenticação não existe, é ele que
-- a sessão resolve — assim as telas já leem do banco e passam pelo
-- mesmo podeAcessar que o aluno real vai passar.
-- =====================================================================
INSERT INTO usuario (nome, email, status_conta, ultimo_login_em)
VALUES ('Ana Souza', 'ana@exemplo.com', 'ATIVA', now());

INSERT INTO campanha_promocional (nome, codigo, tipo_concessao, modalidade, materia_id, duracao_dias, max_resgates, valida_de, valida_ate)
VALUES ('Cortesia de lançamento', 'BEMVINDA', 'CODIGO', 'GRATUITA',
        (SELECT id FROM materia WHERE slug='introducao-ao-direito'), 30, 500, '2026-08-01', '2026-12-31');

-- Trial de 7 dias na matéria de Constitucional (§6.1)
INSERT INTO licenca (usuario_id, escopo, materia_id, origem, status, inicio_em, fim_em, cota)
VALUES ((SELECT id FROM usuario WHERE email='ana@exemplo.com'), 'MATERIA',
        (SELECT id FROM materia WHERE slug='nocoes-de-direito-constitucional'),
        'TRIAL', 'ATIVA', now() - interval '5 days', now() + interval '2 days',
        '{"aulas": 4, "exercicios": 30}'::jsonb);

-- Promocional por código, com acesso total à matéria (§6.1.1)
INSERT INTO licenca (usuario_id, escopo, materia_id, origem, campanha_id, status, inicio_em, fim_em)
VALUES ((SELECT id FROM usuario WHERE email='ana@exemplo.com'), 'MATERIA',
        (SELECT id FROM materia WHERE slug='introducao-ao-direito'),
        'PROMOCIONAL', (SELECT id FROM campanha_promocional WHERE codigo='BEMVINDA'),
        'ATIVA', now() - interval '3 days', now() + interval '27 days');

-- Progresso: uma aula concluída e outra pela metade
INSERT INTO progresso_aula (usuario_id, aula_id, segundos_assistidos, concluida, atualizado_em)
VALUES
 ((SELECT id FROM usuario WHERE email='ana@exemplo.com'),
  (SELECT id FROM aula WHERE slug='o-que-e-uma-constituicao'), 552, true, now() - interval '2 days'),
 ((SELECT id FROM usuario WHERE email='ana@exemplo.com'),
  (SELECT id FROM aula WHERE slug='direitos-fundamentais-na-pratica'), 446, false, now() - interval '3 hours');

-- Algumas respostas, para as estatísticas e o caderno de erros terem lastro
INSERT INTO resposta (usuario_id, questao_id, alternativa_id, acertou, respondida_em)
SELECT (SELECT id FROM usuario WHERE email='ana@exemplo.com'), q.id, a.id, a.correta,
       now() - (row_number() OVER (ORDER BY q.id)) * interval '20 minutes'
  FROM questao q
  JOIN exercicio e ON e.id = q.exercicio_id
  JOIN aula au ON au.id = e.aula_id AND au.slug = 'o-que-e-uma-constituicao'
  JOIN alternativa a ON a.questao_id = q.id
 WHERE a.ordem = CASE WHEN q.ordem <= 3 THEN (SELECT ordem FROM alternativa x WHERE x.questao_id=q.id AND x.correta LIMIT 1)
                      ELSE 1 END;
