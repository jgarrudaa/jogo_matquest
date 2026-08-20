const GameState = {
  defaults: {
    questionIndex: 0,
    lives: 3,
    score: 0,
    correct: 0,
    streak: 0,
    hintUsed: false,
    lastResult: null,
    lastExplanation: '',
    lastPoints: 0,
    lastAnsweredIndex: null,
    roundQuestionIds: [],
    roundTopic: null,
    roundId: null,
  },
  normalize(value = {}) {
    const number = (candidate, fallback, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => (
      Number.isFinite(candidate) ? Math.min(maximum, Math.max(minimum, Math.trunc(candidate))) : fallback
    );
    const ids = Array.isArray(value.roundQuestionIds)
      ? [...new Map(value.roundQuestionIds.filter((id) => id !== null && id !== undefined).map((id) => [String(id), id])).values()]
      : [];
    return {
      ...this.defaults,
      questionIndex: number(value.questionIndex, this.defaults.questionIndex),
      lives: number(value.lives, this.defaults.lives, 0, 3),
      score: number(value.score, this.defaults.score),
      correct: number(value.correct, this.defaults.correct),
      streak: number(value.streak, this.defaults.streak),
      hintUsed: value.hintUsed === true,
      lastResult: ['acerto', 'erro'].includes(value.lastResult) ? value.lastResult : null,
      lastExplanation: typeof value.lastExplanation === 'string' ? value.lastExplanation : '',
      lastPoints: number(value.lastPoints, this.defaults.lastPoints, 0, 100),
      lastAnsweredIndex: Number.isInteger(value.lastAnsweredIndex) && value.lastAnsweredIndex >= 0
        ? value.lastAnsweredIndex
        : null,
      roundQuestionIds: ids,
      roundTopic: ['seno', 'cosseno', 'tangente', 'razoes'].includes(value.roundTopic) ? value.roundTopic : null,
      roundId: typeof value.roundId === 'string' ? value.roundId : null,
    };
  },
  get() {
    try { return this.normalize(JSON.parse(localStorage.getItem('triquest_game') || '{}')); }
    catch { return this.normalize(); }
  },
  set(patch) {
    const value = this.normalize({ ...this.get(), ...patch });
    localStorage.setItem('triquest_game', JSON.stringify(value));
    return value;
  },
  reset() {
    const value = this.normalize();
    localStorage.setItem('triquest_game', JSON.stringify(value));
    return value;
  },
};
window.GameState = GameState;

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message; toast.hidden = false;
  window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3200);
}
window.showToast = showToast;

async function hydrateUser() {
  const client = window.triquestSupabase;
  if (!client) return;
  try {
    const { data } = await client.auth.getUser();
    const user = data?.user;
    const name = user?.user_metadata?.display_name || localStorage.getItem('triquest_name') || 'Estudante';
    document.querySelectorAll('[data-user-name]').forEach((node) => { node.textContent = name; });
    const chip = document.querySelector('#user-chip'); if (chip) chip.textContent = name;
    if (user && document.body.classList.contains('page-home')) {
      const [progressResult, questionsResult, attemptsResult] = await Promise.all([
        client.from('user_progress').select('score,total_correct,current_streak').eq('user_id', user.id).maybeSingle(),
        client.from('questions').select('id,topic').eq('is_active', true),
        client.from('attempts').select('question_id,is_correct').eq('user_id', user.id),
      ]);
      const firstError = progressResult.error || questionsResult.error || attemptsResult.error;
      if (firstError) throw firstError;
      const progress = progressResult.data;
      if (progress) {
        document.querySelector('#stat-score').textContent = progress.score || 0;
        document.querySelector('#stat-correct').textContent = progress.total_correct || 0;
        document.querySelector('#stat-streak').textContent = progress.current_streak || 0;
      }
      const mastery = window.TriQuestEngine.calculateMastery(questionsResult.data || [], attemptsResult.data || []);
      document.querySelectorAll('[data-topic-card]').forEach((card) => {
        const percent = mastery[card.dataset.topicCard] || 0;
        card.querySelector('.progress i').style.width = `${percent}%`;
        card.querySelector('.mastery-label').textContent = `${percent}% dominado`;
        card.querySelector('.progress').setAttribute('aria-label', `${percent}% dominado`);
      });
    }
  } catch {
    if (document.body.classList.contains('page-home')) showToast('Não foi possível sincronizar seu progresso agora.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateUser();
  document.querySelector('#logout-button')?.addEventListener('click', async () => {
    try { await window.triquestSupabase?.auth.signOut(); } catch { /* The local logout still completes. */ }
    localStorage.removeItem('triquest_name');
    location.href = '/';
  });
  document.querySelector('#mobile-profile')?.addEventListener('click', () => showToast('Seu progresso está salvo na sua conta.'));
});
