const FALLBACK_QUESTIONS = [
  { id: 'local-1', topic: 'seno', prompt: 'Uma escada de 10 m forma 30° com o chão. Qual altura ela alcança?', options: ['3 m', '5 m', '8,7 m', '10 m'], correct_answer: 1, hint: 'Use seno: altura ÷ 10. Lembre que sen(30°) = 0,5.', explanation: 'sen(30°) = altura/10. Portanto, altura = 10 × 0,5 = 5 m.' },
  { id: 'local-2', topic: 'seno', prompt: 'Qual razão representa o seno de um ângulo?', options: ['adjacente ÷ hipotenusa', 'oposto ÷ hipotenusa', 'oposto ÷ adjacente', 'hipotenusa ÷ oposto'], correct_answer: 1, hint: 'Use a relação SOH.', explanation: 'Seno é a razão entre o cateto oposto e a hipotenusa.' },
  { id: 'local-3', topic: 'seno', prompt: 'Em um triângulo retângulo, sen(θ) = 0,6 e a hipotenusa mede 20 cm. Quanto mede o cateto oposto?', options: ['8 cm', '10 cm', '12 cm', '14 cm'], correct_answer: 2, hint: 'Multiplique a hipotenusa pelo seno.', explanation: 'Cateto oposto = 20 × 0,6 = 12 cm.' },
  { id: 'local-4', topic: 'cosseno', prompt: 'Qual razão representa o cosseno de um ângulo?', options: ['oposto ÷ hipotenusa', 'hipotenusa ÷ adjacente', 'adjacente ÷ hipotenusa', 'oposto ÷ adjacente'], correct_answer: 2, hint: 'Use a relação CAH.', explanation: 'Cosseno é a razão entre o cateto adjacente e a hipotenusa.' },
  { id: 'local-5', topic: 'cosseno', prompt: 'Uma rampa de 8 m forma 60° com o chão. Qual é sua projeção horizontal?', options: ['2 m', '4 m', '6 m', '8 m'], correct_answer: 1, hint: 'Use cos(60°) = adjacente ÷ 8.', explanation: 'Adjacente = 8 × 0,5 = 4 m.' },
  { id: 'local-6', topic: 'cosseno', prompt: 'Qual é o valor de cos(30°)?', options: ['0,5', '√2/2', '√3/2', '1'], correct_answer: 2, hint: 'Consulte os valores dos ângulos notáveis.', explanation: 'O cosseno de 30° é √3/2.' },
  { id: 'local-7', topic: 'tangente', prompt: 'Um cateto oposto mede 3 m e o adjacente 4 m. Quanto vale tan(θ)?', options: ['0,50', '0,75', '1,00', '1,33'], correct_answer: 1, hint: 'Divida o cateto oposto pelo adjacente.', explanation: 'tan(θ) = 3 ÷ 4 = 0,75.' },
  { id: 'local-8', topic: 'tangente', prompt: 'Um poste projeta sombra de 6 m quando tan(θ) = 1,5. Qual é a altura?', options: ['4 m', '6 m', '7,5 m', '9 m'], correct_answer: 3, hint: 'Altura = tangente × sombra.', explanation: 'Altura = 1,5 × 6 = 9 m.' },
  { id: 'local-9', topic: 'tangente', prompt: 'Qual é o valor de tan(45°)?', options: ['0', '0,5', '1', '√3'], correct_answer: 2, hint: 'Em 45°, os catetos têm a mesma medida.', explanation: 'Catetos iguais formam a razão 1.' },
  { id: 'local-10', topic: 'razoes', prompt: 'Qual lado de um triângulo retângulo fica oposto ao ângulo de 90°?', options: ['Cateto oposto', 'Cateto adjacente', 'Hipotenusa', 'Base'], correct_answer: 2, hint: 'É sempre o maior lado do triângulo retângulo.', explanation: 'A hipotenusa é oposta ao ângulo reto.' },
  { id: 'local-11', topic: 'razoes', prompt: 'Os catetos medem 6 cm e 8 cm. Quanto mede a hipotenusa?', options: ['9 cm', '10 cm', '12 cm', '14 cm'], correct_answer: 1, hint: 'Use o teorema de Pitágoras: h² = 6² + 8².', explanation: 'h² = 36 + 64 = 100, então h = 10 cm.' },
  { id: 'local-12', topic: 'razoes', prompt: 'Em relação a θ, como chamamos o cateto que toca o ângulo e não é a hipotenusa?', options: ['Cateto oposto', 'Cateto adjacente', 'Hipotenusa', 'Diagonal'], correct_answer: 1, hint: 'Adjacente significa que está ao lado do ângulo.', explanation: 'Esse lado é o cateto adjacente.' },
];

document.addEventListener('DOMContentLoaded', async () => {
  const engine = window.TriQuestEngine;
  const client = window.triquestSupabase;
  const params = new URLSearchParams(location.search);
  let state = window.GameState.get();
  const topicParameter = ['seno', 'cosseno', 'tangente', 'razoes'].includes(params.get('topic')) ? params.get('topic') : null;
  const requestedTopic = params.has('topic') || params.get('new') === '1' ? topicParameter : state.roundTopic;
  let allQuestions = FALLBACK_QUESTIONS;

  try {
    if (!client) throw new Error('Supabase indisponível.');
    const { data, error } = await client.from('questions').select('id,topic,prompt,options,correct_answer,hint,explanation').eq('is_active', true);
    if (error) throw error;
    const validQuestions = (data || []).filter(isValidQuestion);
    if (validQuestions.length < engine.ROUND_SIZE) throw new Error('Banco de perguntas indisponível.');
    allQuestions = validQuestions;
  } catch {
    window.showToast('Modo offline: usando perguntas locais.');
  }

  const mustCreateRound = params.get('new') === '1' || state.roundQuestionIds.length !== engine.ROUND_SIZE || state.roundTopic !== requestedTopic;
  if (mustCreateRound) {
    try {
      const round = engine.createRound(allQuestions, requestedTopic);
      state = window.GameState.reset();
      state = window.GameState.set({
        roundQuestionIds: round.map((question) => question.id),
        roundTopic: requestedTopic,
        roundId: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
      });
    } catch (error) {
      showRoundError(error.message);
      return;
    }
  }

  if (state.questionIndex >= engine.ROUND_SIZE) {
    location.replace(`/resultado/${state.score >= engine.WIN_SCORE ? 'vencedor' : 'perdedor'}`);
    return;
  }

  const questionById = new Map(allQuestions.map((question) => [String(question.id), question]));
  const roundQuestions = state.roundQuestionIds.map((id) => questionById.get(String(id))).filter(Boolean);
  if (roundQuestions.length !== engine.ROUND_SIZE) {
    try {
      const replacement = engine.createRound(allQuestions, state.roundTopic);
      state = window.GameState.set({
        roundQuestionIds: replacement.map((question) => question.id),
        questionIndex: 0,
        hintUsed: false,
        lastAnsweredIndex: null,
      });
      roundQuestions.splice(0, roundQuestions.length, ...replacement);
      window.showToast('A rodada foi recuperada com uma nova seleção de perguntas.');
    } catch (error) {
      showRoundError(error.message);
      return;
    }
  }

  const index = Math.min(state.questionIndex, engine.ROUND_SIZE - 1);
  const question = roundQuestions[index];
  let selected = null;
  let submitting = false;
  const startedAt = Date.now();
  renderRoundTitle(state.roundTopic);
  renderMap(roundQuestions, index);
  renderQuestion(question, index, state);

  const hintButton = document.querySelector('#hint-button');
  const answerButton = document.querySelector('#answer-button');

  function revealHint() {
    document.querySelector('#hint-text').textContent = question.hint;
    document.querySelector('#hint-box').hidden = false;
    hintButton.disabled = true;
  }

  if (state.hintUsed) revealHint();

  hintButton.addEventListener('click', () => {
    revealHint();
    window.GameState.set({ hintUsed: true });
  });

  answerButton.addEventListener('click', async () => {
    if (selected === null || submitting) return;
    submitting = true;
    answerButton.disabled = true;
    hintButton.disabled = true;
    document.querySelectorAll('.option').forEach((option) => { option.disabled = true; });
    const current = window.GameState.get();
    const correct = selected === Number(question.correct_answer);
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    const points = engine.calculatePoints({ correct, hintUsed: current.hintUsed });
    const next = window.GameState.set({
      questionIndex: correct ? current.questionIndex + 1 : current.questionIndex,
      score: current.score + points,
      correct: current.correct + (correct ? 1 : 0),
      streak: correct ? current.streak + 1 : 0,
      lives: correct ? current.lives : current.lives - 1,
      lastResult: correct ? 'acerto' : 'erro',
      lastExplanation: question.explanation,
      lastPoints: points,
      lastAnsweredIndex: current.questionIndex,
      hintUsed: correct ? false : current.hintUsed,
    });
    await saveAttempt(question.id, selected, correct, points, elapsed);
    location.href = next.lives <= 0 ? '/resultado/sem-vidas' : `/resultado/${correct ? 'acerto' : 'erro'}`;
  });

  function renderQuestion(currentQuestion, currentIndex, currentState) {
    document.querySelector('#question-card').classList.remove('skeleton');
    document.querySelector('#question-topic').textContent = topicLabel(currentQuestion.topic);
    document.querySelector('#question-text').textContent = currentQuestion.prompt;
    document.querySelector('#question-counter').textContent = `Desafio ${currentIndex + 1} de ${engine.ROUND_SIZE}`;
    document.querySelector('#quiz-progress').style.width = `${((currentIndex + 1) / engine.ROUND_SIZE) * 100}%`;
    document.querySelector('#lives').innerHTML = `${'♥ '.repeat(currentState.lives)}${'♡ '.repeat(engine.MAX_LIVES - currentState.lives)}<b>${currentState.lives}/${engine.MAX_LIVES}</b>`;
    const letters = ['A', 'B', 'C', 'D'];
    const container = document.querySelector('#options');
    container.innerHTML = '';
    currentQuestion.options.forEach((option, optionIndex) => {
      const button = document.createElement('button');
      button.className = 'option';
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', 'false');
      const letter = document.createElement('b');
      letter.textContent = letters[optionIndex] || `${optionIndex + 1}`;
      const text = document.createElement('span');
      text.textContent = String(option);
      const marker = document.createElement('i');
      button.append(letter, text, marker);
      button.addEventListener('click', () => {
        selected = optionIndex;
        container.querySelectorAll('.option').forEach((node) => { node.classList.remove('selected'); node.setAttribute('aria-checked', 'false'); });
        button.classList.add('selected');
        button.setAttribute('aria-checked', 'true');
        document.querySelector('#answer-button').disabled = false;
      });
      container.appendChild(button);
    });
  }
});

function renderRoundTitle(topic) {
  document.querySelector('#round-title').textContent = topic ? `Prática de ${topicLabel(topic)}` : 'Desafio misto';
}

function topicLabel(topic) {
  return ({ seno: 'Seno', cosseno: 'Cosseno', tangente: 'Tangente', razoes: 'Razões no triângulo' })[topic] || topic;
}

function renderMap(questions, current) {
  const map = document.querySelector('#question-map');
  map.innerHTML = '';
  questions.forEach((question, index) => {
    const item = document.createElement('li');
    item.className = index < current ? 'done' : index === current ? 'current' : '';
    const marker = document.createElement('span');
    marker.textContent = index < current ? '✓' : `${index + 1}`;
    const label = document.createElement('b');
    label.textContent = topicLabel(question.topic);
    item.append(marker, label);
    map.appendChild(item);
  });
  document.querySelector('#map-progress').style.height = `${(current / (window.TriQuestEngine.ROUND_SIZE - 1)) * 100}%`;
}

function isValidQuestion(question) {
  return Boolean(
    question
    && question.id !== null
    && question.id !== undefined
    && ['seno', 'cosseno', 'tangente', 'razoes'].includes(question.topic)
    && typeof question.prompt === 'string'
    && question.prompt.trim()
    && Array.isArray(question.options)
    && question.options.length === 4
    && question.options.every((option) => ['string', 'number'].includes(typeof option))
    && Number.isInteger(Number(question.correct_answer))
    && Number(question.correct_answer) >= 0
    && Number(question.correct_answer) < question.options.length
    && typeof question.hint === 'string'
    && question.hint.trim()
    && typeof question.explanation === 'string'
    && question.explanation.trim()
  );
}

function showRoundError(message) {
  document.querySelector('#question-text').textContent = message;
  document.querySelector('#question-card').classList.remove('skeleton');
  document.querySelector('#options').innerHTML = '<a class="button button-primary" href="/inicio">Voltar ao início</a>';
  document.querySelector('.quiz-actions').hidden = true;
}

async function saveAttempt(questionId, answer, correct, points, elapsed) {
  const client = window.triquestSupabase;
  if (!client || String(questionId).startsWith('local')) return;
  try {
    const { data: auth, error: authError } = await client.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    if (authError) throw authError;
    const { error } = await client.from('attempts').insert({ user_id: user.id, question_id: questionId, selected_answer: answer, is_correct: correct, points_earned: points, response_time_seconds: elapsed });
    if (error) throw error;
  } catch {
    window.showToast('A resposta foi avaliada, mas o progresso não pôde ser sincronizado.');
  }
}
