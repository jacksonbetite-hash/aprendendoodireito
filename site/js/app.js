// Interação da "Questão do dia" no painel do aluno
document.querySelectorAll('.q-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    const feedback = document.getElementById('feedback');
    const answered = document.querySelector('.q-option.correct, .q-option.wrong');
    if (answered) return; // uma tentativa por questão

    const isCorrect = btn.dataset.correct === 'true';
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    if (!isCorrect) {
      document.querySelector('.q-option[data-correct="true"]').classList.add('correct');
    }

    feedback.textContent = isCorrect
      ? '✅ Correto! O art. 60, §4º, IV, da CF/88 veda emenda constitucional tendente a abolir os direitos e garantias individuais — são cláusulas pétreas.'
      : '❌ Não foi dessa vez. A resposta correta é a alternativa B: o art. 60, §4º, IV, da CF/88 protege os direitos e garantias individuais como cláusulas pétreas.';
    feedback.classList.add('show');
  });
});
