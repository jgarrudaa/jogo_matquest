document.addEventListener('DOMContentLoaded', () => {
  const engine = window.TriQuestEngine;
  const shell = document.querySelector('.result-shell');
  const type = shell.dataset.result;
  const state = window.GameState.get();
  const mascot = document.querySelector('#result-mascot');
  const isRoundEnd = ['vencedor', 'perdedor', 'sem-vidas'].includes(type);
  const configs = {
    acerto: ['Resposta correta', 'Muito bem.', `+${state.lastPoints} pontos`, 'Próximo desafio', true],
    erro: ['Revise a resolução', 'Vamos tentar outra vez.', 'Você perdeu uma vida, mas não perdeu pontos.', 'Tentar novamente', false],
    vencedor: ['Rodada concluída', 'Excelente desempenho.', `${state.score} pontos`, 'Nova rodada', true],
    perdedor: ['Rodada concluída', 'Continue praticando.', `${state.score} pontos`, 'Tentar novamente', false],
    'sem-vidas': ['Vidas esgotadas', 'A rodada terminou.', `${state.score} pontos conquistados`, 'Tentar novamente', false],
  };
  const config = configs[type];
  document.querySelector('#result-kicker').textContent = config[0];
  document.querySelector('#result-title').textContent = config[1];
  document.querySelector('#result-message').textContent = config[2];
  document.querySelector('#result-explanation').textContent = type === 'erro' ? state.lastExplanation : performanceFeedback(state.score, type);
  mascot.src = config[4] ? mascot.dataset.happy : mascot.dataset.sad;
  if (type === 'vencedor') shell.classList.add('celebrate');

  const primary = document.querySelector('#result-primary');
  primary.textContent = config[3];
  primary.addEventListener('click', () => {
    if (isRoundEnd) {
      const topicQuery = state.roundTopic ? `&topic=${state.roundTopic}` : '';
      window.GameState.reset();
      location.href = `/jogar?new=1${topicQuery}`;
      return;
    }
    if (type === 'acerto') {
      const nextIndex = state.questionIndex + 1;
      if (nextIndex >= engine.ROUND_SIZE) {
        location.href = `/resultado/${state.score >= engine.WIN_SCORE ? 'vencedor' : 'perdedor'}`;
        return;
      }
      window.GameState.set({ questionIndex: nextIndex });
    }
    location.href = '/jogar';
  });
});

function performanceFeedback(score, type) {
  if (type === 'sem-vidas') return 'Revise as explicações e inicie uma nova rodada quando estiver pronto.';
  if (score >= 900) return 'Você demonstrou domínio excelente das razões trigonométricas.';
  if (score >= 700) return 'Você concluiu a rodada com um ótimo domínio dos conceitos.';
  return 'Observe as dicas e explicações para aumentar sua pontuação na próxima rodada.';
}
