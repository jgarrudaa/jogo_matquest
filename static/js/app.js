const GameState = {
  defaults: { questionIndex: 0, lives: 3, score: 0, correct: 0, streak: 0, hintUsed: false, lastResult: null, lastExplanation: '' },
  get() { try { return { ...this.defaults, ...JSON.parse(localStorage.getItem('triquest_game') || '{}') }; } catch { return { ...this.defaults }; } },
  set(patch) { const value = { ...this.get(), ...patch }; localStorage.setItem('triquest_game', JSON.stringify(value)); return value; },
  reset() { localStorage.setItem('triquest_game', JSON.stringify(this.defaults)); return { ...this.defaults }; },
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
  const { data } = await client.auth.getUser();
  const user = data?.user;
  const name = user?.user_metadata?.display_name || localStorage.getItem('triquest_name') || 'Estudante';
  document.querySelectorAll('[data-user-name]').forEach((node) => { node.textContent = name; });
  const chip = document.querySelector('#user-chip'); if (chip) chip.textContent = name;
  if (user && document.body.classList.contains('page-home')) {
    const { data: progress } = await client.from('user_progress').select('score,total_correct,current_streak').eq('user_id', user.id).maybeSingle();
    if (progress) {
      document.querySelector('#stat-score').textContent = progress.score || 0;
      document.querySelector('#stat-correct').textContent = progress.total_correct || 0;
      document.querySelector('#stat-streak').textContent = progress.current_streak || 0;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateUser();
  document.querySelector('#logout-button')?.addEventListener('click', async () => { await window.triquestSupabase?.auth.signOut(); localStorage.removeItem('triquest_name'); location.href = '/'; });
  document.querySelector('#mobile-profile')?.addEventListener('click', () => showToast('Seu progresso está salvo na sua conta.'));
});
