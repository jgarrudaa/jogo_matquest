const FALLBACK_QUESTIONS = [
  {id:'local-1',topic:'seno',world:1,prompt:'Em relação ao ângulo θ, qual lado é a hipotenusa?',options:['O lado oposto ao ângulo reto','O menor cateto','O lado adjacente a θ','Qualquer lado inclinado'],correct_answer:0,hint:'A hipotenusa sempre fica em frente ao ângulo de 90°.',explanation:'A hipotenusa é o maior lado e fica oposta ao ângulo reto.'},
  {id:'local-2',topic:'seno',world:1,prompt:'Qual razão representa o seno de um ângulo?',options:['adjacente ÷ hipotenusa','oposto ÷ hipotenusa','oposto ÷ adjacente','hipotenusa ÷ oposto'],correct_answer:1,hint:'Lembre-se de SOH.',explanation:'Seno é a razão entre o cateto oposto e a hipotenusa.'},
  {id:'local-3',topic:'cosseno',world:1,prompt:'Qual razão representa o cosseno de um ângulo?',options:['oposto ÷ hipotenusa','hipotenusa ÷ adjacente','adjacente ÷ hipotenusa','oposto ÷ adjacente'],correct_answer:2,hint:'Lembre-se de CAH.',explanation:'Cosseno é a razão entre o cateto adjacente e a hipotenusa.'},
  {id:'local-4',topic:'tangente',world:2,prompt:'Em um triângulo, o cateto oposto mede 3 e o adjacente mede 4. Quanto vale tan(θ)?',options:['0,50','0,75','1,00','1,33'],correct_answer:1,hint:'Divida o cateto oposto pelo adjacente.',explanation:'tan(θ) = 3 ÷ 4 = 0,75.'},
  {id:'local-5',topic:'seno',world:2,prompt:'Qual é o valor de sen(30°)?',options:['0','0,5','√2/2','1'],correct_answer:1,hint:'É metade da hipotenusa no triângulo 30°–60°–90°.',explanation:'O seno de 30° é 1/2, ou 0,5.'},
  {id:'local-6',topic:'cosseno',world:2,prompt:'Qual é o valor de cos(60°)?',options:['0,5','√2/2','√3/2','1'],correct_answer:0,hint:'Seno de 30° e cosseno de 60° são iguais.',explanation:'O cosseno de 60° é 1/2.'},
  {id:'local-7',topic:'tangente',world:2,prompt:'Qual é o valor de tan(45°)?',options:['0','0,5','1','√3'],correct_answer:2,hint:'Em 45°, os dois catetos têm a mesma medida.',explanation:'Catetos iguais produzem a razão 1.'},
  {id:'local-8',topic:'aplicacoes',world:3,prompt:'Uma escada de 10 m faz 30° com o chão. Que altura ela alcança?',options:['3 m','5 m','8,7 m','10 m'],correct_answer:1,hint:'Use sen(30°) = altura ÷ 10.',explanation:'altura = 10 × 0,5 = 5 m.'},
  {id:'local-9',topic:'aplicacoes',world:3,prompt:'Uma rampa sobe 1 m a cada 4 m horizontais. Qual é a tangente do ângulo?',options:['0,20','0,25','0,40','4,00'],correct_answer:1,hint:'Tangente é subida dividida pelo avanço horizontal.',explanation:'tan(θ) = 1 ÷ 4 = 0,25.'},
  {id:'local-10',topic:'aplicacoes',world:3,prompt:'Um poste projeta sombra de 6 m quando tan(θ) = 1,5. Qual é a altura?',options:['4 m','6 m','7,5 m','9 m'],correct_answer:3,hint:'altura = tangente × sombra.',explanation:'altura = 1,5 × 6 = 9 m.'},
];

document.addEventListener('DOMContentLoaded', async () => {
  const state = window.GameState.get(); let questions = FALLBACK_QUESTIONS;
  try {
    const { data, error } = await window.triquestSupabase.from('questions').select('id,topic,world,prompt,options,correct_answer,hint,explanation').eq('is_active', true).order('sort_order');
    if (!error && data?.length) questions = data;
  } catch { window.showToast('Modo offline: usando perguntas locais.'); }
  let selected = null; let startedAt = Date.now();
  const index = Math.min(state.questionIndex, questions.length - 1); const question = questions[index];
  renderMap(questions, index); renderQuestion(question, index, questions.length, state);

  document.querySelector('#hint-button').addEventListener('click', () => { document.querySelector('#hint-text').textContent = question.hint; document.querySelector('#hint-box').hidden = false; window.GameState.set({ hintUsed: true }); document.querySelector('#hint-button').disabled = true; });
  document.querySelector('#answer-button').addEventListener('click', async () => {
    if (selected === null) return;
    const current = window.GameState.get(); const correct = selected === question.correct_answer; const elapsed = Math.round((Date.now() - startedAt) / 1000); const points = correct ? (current.hintUsed ? 50 : 100) + (elapsed < 45 ? 20 : 0) : 0;
    const next = window.GameState.set({ score: current.score + points, correct: current.correct + (correct ? 1 : 0), streak: correct ? current.streak + 1 : 0, lives: correct ? current.lives : current.lives - 1, lastResult: correct ? 'acerto' : 'erro', lastExplanation: question.explanation, lastPoints: points, hintUsed: false });
    await saveAttempt(question.id, selected, correct, points, elapsed, next);
    location.href = next.lives <= 0 ? '/resultado/sem-vidas' : `/resultado/${correct ? 'acerto' : 'erro'}`;
  });

  function renderQuestion(q, i, total, s) {
    document.querySelector('#question-card').classList.remove('skeleton'); document.querySelector('#question-topic').textContent = `${q.topic} • mundo ${q.world}`; document.querySelector('#question-text').textContent = q.prompt; document.querySelector('#question-counter').textContent = `Pergunta ${i + 1} de ${total}`; document.querySelector('#quiz-progress').style.width = `${((i + 1) / total) * 100}%`; document.querySelector('#lives').innerHTML = `${'♥ '.repeat(s.lives)}${'♡ '.repeat(3-s.lives)}<b>${s.lives}/3</b>`;
    const letters = ['A','B','C','D']; const container = document.querySelector('#options'); container.innerHTML = '';
    q.options.forEach((option, optionIndex) => { const button = document.createElement('button'); button.className = 'option'; button.type = 'button'; button.setAttribute('role','radio'); button.setAttribute('aria-checked','false'); button.innerHTML = `<b>${letters[optionIndex]}</b><span>${option}</span><i></i>`; button.addEventListener('click', () => { selected = optionIndex; container.querySelectorAll('.option').forEach((node) => { node.classList.remove('selected'); node.setAttribute('aria-checked','false'); }); button.classList.add('selected'); button.setAttribute('aria-checked','true'); document.querySelector('#answer-button').disabled = false; }); container.appendChild(button); });
  }
});

function renderMap(questions, current) { const map = document.querySelector('#question-map'); questions.forEach((q,i) => { const item = document.createElement('li'); item.className = i < current ? 'done' : i === current ? 'current' : ''; item.innerHTML = `<span>${i < current ? '✓' : i + 1}</span><b>${q.topic}</b>`; map.appendChild(item); }); document.querySelector('#map-progress').style.height = `${(current / Math.max(1, questions.length - 1)) * 100}%`; }

async function saveAttempt(questionId, answer, correct, points, elapsed, state) {
  const client = window.triquestSupabase; if (!client || String(questionId).startsWith('local')) return;
  const { data: auth } = await client.auth.getUser(); const user = auth?.user; if (!user) return;
  await client.from('attempts').insert({ user_id:user.id, question_id:questionId, selected_answer:answer, is_correct:correct, points_earned:points, response_time_seconds:elapsed });
  await client.from('user_progress').upsert({ user_id:user.id, score:state.score, total_correct:state.correct, current_streak:state.streak, updated_at:new Date().toISOString() });
}
