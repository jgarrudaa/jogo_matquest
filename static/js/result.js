document.addEventListener('DOMContentLoaded', () => {
  const type = document.querySelector('.result-shell').dataset.result; const state = window.GameState.get(); const mascot = document.querySelector('#result-mascot');
  const configs = {
    acerto: ['Resposta correta', 'Muito bem.', `+${state.lastPoints || 100} pontos`, 'Próxima pergunta', true],
    erro: ['Continue tentando', 'Quase lá.', 'Você perdeu uma vida.', 'Tentar novamente', false],
    vencedor: ['Jornada concluída', 'Incrível.', `${state.score} pontos`, 'Jogar novamente', true],
    perdedor: ['Jornada encerrada', 'Você chegou longe.', `${state.score} pontos`, 'Tentar novamente', false],
    'sem-vidas': ['Vidas esgotadas', 'Não desanime.', 'Cada tentativa ensina um novo caminho.', 'Tentar novamente', false],
  };
  const c = configs[type]; document.querySelector('#result-kicker').textContent=c[0]; document.querySelector('#result-title').textContent=c[1]; document.querySelector('#result-message').textContent=c[2]; mascot.src=c[4]?mascot.dataset.happy:mascot.dataset.sad; document.querySelector('#result-explanation').textContent = type==='erro' ? state.lastExplanation : '';
  const button = document.querySelector('#result-primary'); button.textContent=c[3]; button.addEventListener('click', () => { if (['vencedor','perdedor','sem-vidas'].includes(type)) { window.GameState.reset(); location.href='/jogar'; return; } if (type==='acerto') { const next=state.questionIndex+1; if (next>=10) { location.href=`/resultado/${state.correct>=7?'vencedor':'perdedor'}`; return; } window.GameState.set({questionIndex:next}); } location.href='/jogar'; });
});
