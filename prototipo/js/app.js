/* =============================================================
   Aprendendo o Direito — protótipo
   Interações do lado do cliente. No sistema real (§10 do
   discovery) isto vira Next.js consumindo a API; aqui os dados
   são fixos, só para o protótipo ser navegável.
   ============================================================= */

/* ---------- Abas da página de aula ---------- */
document.querySelectorAll('.tabbar button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tabpane').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ---------- Exercício da aula ----------
   Regra do discovery (§5.3): no mínimo 5 questões e comentário
   em TODAS as alternativas, inclusive nas não marcadas.        */
const QUESTOES = [
  {
    origem: 'Autoral · OAB',
    enunciado: 'Sobre os direitos e garantias fundamentais na CF/88, assinale a alternativa correta:',
    alternativas: [
      { t: 'Podem ser abolidos por emenda constitucional aprovada por três quintos do Congresso Nacional.', ok: false,
        c: 'Errada. Três quintos é o quórum para aprovar emenda (art. 60, §2º), mas nem com ele se abole direito e garantia individual: o art. 60, §4º, IV veda a própria deliberação da proposta.' },
      { t: 'Os direitos e garantias individuais são cláusulas pétreas e não podem ser objeto de emenda tendente a aboli-los.', ok: true,
        c: 'Correta. É a literalidade do art. 60, §4º, IV. Atenção à expressão "tendente a abolir": ampliar ou regulamentar o direito é permitido — o que a Constituição barra é o esvaziamento.' },
      { t: 'As normas definidoras de direitos fundamentais só produzem efeito depois de regulamentadas por lei.', ok: false,
        c: 'Errada. O art. 5º, §1º diz o oposto: essas normas têm aplicação imediata. Algumas pedem regulamentação para o exercício pleno, mas a regra é a aplicabilidade direta.' },
      { t: 'Todo tratado internacional de direitos humanos ingressa com status de emenda constitucional.', ok: false,
        c: 'Errada. Só os aprovados pelo rito do art. 5º, §3º (duas Casas, dois turnos, três quintos). Fora desse rito, o STF os reconhece como supralegais — acima da lei, abaixo da Constituição.' },
    ],
  },
  {
    origem: 'Autoral',
    enunciado: 'Um direito fundamental pode ser limitado diante de outro direito fundamental no caso concreto?',
    alternativas: [
      { t: 'Sim. Direitos fundamentais não são absolutos e se harmonizam por ponderação no caso concreto.', ok: true,
        c: 'Correta. É a posição consolidada do STF: nenhum direito fundamental é absoluto. Quando dois colidem, resolve-se por ponderação, preservando o núcleo essencial de ambos.' },
      { t: 'Não. Direito fundamental é absoluto por definição.', ok: false,
        c: 'Errada. É o erro mais comum do início da graduação. Se fossem absolutos, direitos em rota de colisão (liberdade de imprensa × privacidade) seriam insolúveis.' },
      { t: 'Só quando houver lei autorizando expressamente a limitação.', ok: false,
        c: 'Errada. A lei ajuda, mas a limitação recíproca decorre da própria Constituição — o juiz pondera mesmo sem lei específica.' },
      { t: 'Apenas durante estado de sítio ou estado de defesa.', ok: false,
        c: 'Errada. Estado de sítio e de defesa (arts. 136 a 141) permitem restrições excepcionais e temporárias, mas a ponderação entre direitos ocorre na normalidade institucional também.' },
    ],
  },
  {
    origem: 'Inspirada em prova · Cebraspe',
    enunciado: 'Julgue: "cláusula pétrea significa que o dispositivo constitucional não pode sofrer qualquer alteração".',
    alternativas: [
      { t: 'Certo', ok: false,
        c: 'Errado. O art. 60, §4º proíbe emenda "tendente a abolir" — não congela o texto. Emenda que amplia ou detalha o direito é válida; o que não se admite é suprimi-lo ou esvaziá-lo.' },
      { t: 'Errado', ok: true,
        c: 'Certo. A vedação é à emenda tendente a abolir, não a toda e qualquer alteração. Aperfeiçoar a proteção é constitucional.' },
    ],
  },
  {
    origem: 'Autoral',
    enunciado: 'Os direitos fundamentais alcançam estrangeiros que estão no Brasil?',
    alternativas: [
      { t: 'Não. O art. 5º fala apenas em brasileiros.', ok: false,
        c: 'Errada. O próprio caput menciona "aos estrangeiros residentes no País". Ler só metade do caput derruba a questão.' },
      { t: 'Sim, mas apenas os estrangeiros com visto permanente.', ok: false,
        c: 'Errada. A jurisprudência não faz esse recorte: o critério é estar sob jurisdição brasileira, não a modalidade do visto.' },
      { t: 'Sim. O caput cita os estrangeiros residentes, e o STF estende a proteção a qualquer pessoa sob jurisdição brasileira, inclusive o turista.', ok: true,
        c: 'Correta. A leitura literal já inclui o residente, e a interpretação do STF alcança quem está em território nacional — direitos fundamentais protegem a pessoa, não a nacionalidade.' },
      { t: 'Sim, desde que haja tratado de reciprocidade com o país de origem.', ok: false,
        c: 'Errada. Reciprocidade é exigência de alguns direitos específicos (certas garantias processuais em outros países), não uma condição geral para os direitos fundamentais aqui.' },
    ],
  },
  {
    origem: 'Autoral',
    enunciado: 'Qual dos itens abaixo NÃO é cláusula pétrea expressa no art. 60, §4º da CF/88?',
    alternativas: [
      { t: 'A forma federativa de Estado', ok: false,
        c: 'É cláusula pétrea (inciso I). Por isso não se admite emenda que transforme o Brasil em Estado unitário.' },
      { t: 'O voto direto, secreto, universal e periódico', ok: false,
        c: 'É cláusula pétrea (inciso II). Repare que o voto obrigatório não está na lista — obrigatoriedade pode ser alterada por emenda.' },
      { t: 'A forma republicana de governo', ok: true,
        c: 'Correta — é a que NÃO consta do §4º. A forma republicana era cláusula pétrea na Constituição de 1967/69 e figura no art. 34, VII, "a" como princípio sensível, mas ficou fora do rol do art. 60, §4º.' },
      { t: 'A separação dos Poderes', ok: false,
        c: 'É cláusula pétrea (inciso III), o que impede emenda que subordine um Poder a outro.' },
    ],
  },
];

const lista = document.getElementById('exercicio-lista');
if (lista) {
  const estado = { respondidas: 0, acertos: 0 };

  QUESTOES.forEach((q, i) => {
    const bloco = document.createElement('div');
    bloco.className = 'questao';
    bloco.innerHTML =
      '<div class="qtag"><span class="pill">Questão ' + (i + 1) + ' de ' + QUESTOES.length +
      '</span> <span class="pill accent">' + q.origem + '</span></div>' +
      '<p class="enunciado">' + q.enunciado + '</p>';

    const comentario = document.createElement('div');
    comentario.className = 'q-comment';

    q.alternativas.forEach((alt, j) => {
      const letra = String.fromCharCode(65 + j);
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.textContent = q.alternativas.length > 2 ? letra + ') ' + alt.t : alt.t;

      btn.addEventListener('click', () => {
        if (bloco.dataset.respondida) return;
        bloco.dataset.respondida = '1';
        estado.respondidas++;
        if (alt.ok) estado.acertos++;

        // marca a escolhida e revela a correta
        btn.classList.add(alt.ok ? 'correct' : 'wrong');
        bloco.querySelectorAll('.q-option').forEach((b, k) => {
          b.disabled = true;
          if (q.alternativas[k].ok) b.classList.add('correct');
        });

        // comentário de TODAS as alternativas — regra do §5.3
        comentario.innerHTML =
          '<strong>' + (alt.ok ? '✅ Você acertou.' : '❌ Não foi dessa vez.') + '</strong>' +
          '<ul style="margin-top:.6rem">' +
          q.alternativas.map((a, k) =>
            '<li style="padding:.25rem 0"><strong>' +
            (q.alternativas.length > 2 ? String.fromCharCode(65 + k) + ') ' : '') +
            '</strong>' + a.c + '</li>').join('') +
          '</ul>' +
          (alt.ok ? '' : '<p style="margin-top:.6rem">🔁 Esta questão foi para o seu <strong>caderno de erros</strong>.</p>');
        comentario.classList.add('show');
        atualizarResultado();
      });

      bloco.appendChild(btn);
    });

    bloco.appendChild(comentario);
    lista.appendChild(bloco);
  });

  function atualizarResultado() {
    const box = document.getElementById('exercicio-resultado');
    if (estado.respondidas < QUESTOES.length) return;
    const pct = Math.round((estado.acertos / QUESTOES.length) * 100);
    box.style.display = 'block';
    box.innerHTML =
      '<strong style="font-size:1.05rem">Exercício concluído — ' + estado.acertos + ' de ' +
      QUESTOES.length + ' (' + pct + '%)</strong><br>' +
      (pct >= 80
        ? 'Mandou bem. Pode seguir para a Aula 04 com tranquilidade.'
        : 'Vale rever o resumo antes de seguir — e as questões erradas já estão no seu caderno de erros.');
  }
}

/* ---------- Vade-mécum: busca e favoritos ---------- */
const busca = document.getElementById('vade-busca');
if (busca) {
  const normaliza = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  busca.addEventListener('input', () => {
    const termo = normaliza(busca.value.trim());
    let visiveis = 0;
    document.querySelectorAll('.dispositivo').forEach((d) => {
      const alvo = normaliza(d.dataset.busca + ' ' + d.textContent);
      const bate = termo === '' || alvo.includes(termo);
      d.style.display = bate ? '' : 'none';
      if (bate) visiveis++;
    });
    document.getElementById('vade-vazio').style.display = visiveis ? 'none' : 'block';
  });
}

// Atalho global "/" abre a busca do vade-mécum (§5.4)
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  if (busca) { e.preventDefault(); busca.focus(); }
  else window.location.href = 'vademecum.html';
});

document.querySelectorAll('.icon-btn.fav').forEach((b) => {
  b.addEventListener('click', () => {
    b.classList.toggle('on');
    b.textContent = b.classList.contains('on') ? '★' : '☆';
  });
});

/* ---------- Planos: troca de período ---------- */
const toggle = document.getElementById('toggle-periodo');
if (toggle) {
  // Tabela de preços do §7 do discovery (hipótese a validar)
  const PRECOS = {
    mensal:     { materia: '24,90', passe: '59,90',  label: 'por mês, renovação automática' },
    trimestral: { materia: '59,90', passe: '149,90', label: 'a cada 3 meses (R$ 19,97/mês)' },
    semestral:  { materia: '99,90', passe: '269,90', label: 'a cada 6 meses (R$ 16,65/mês)' },
    anual:      { materia: '169,90', passe: '449,90', label: 'por ano (R$ 14,16/mês)' },
  };
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    toggle.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const p = PRECOS[btn.dataset.p];
    document.querySelector('[data-preco-materia]').textContent = 'R$ ' + p.materia;
    document.querySelector('[data-preco-passe]').textContent = 'R$ ' + p.passe;
    document.querySelectorAll('[data-periodo-label]').forEach((el) => { el.textContent = p.label; });
  });
}
