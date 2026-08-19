(function exposeGameEngine(root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  root.TriQuestEngine = engine;
}(typeof globalThis !== 'undefined' ? globalThis : window, () => {
  const ROUND_SIZE = 10;
  const WIN_SCORE = 700;
  const MAX_LIVES = 3;

  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function createRound(questions, topic = null, random = Math.random) {
    const eligible = topic ? questions.filter((question) => question.topic === topic) : questions;
    if (eligible.length < ROUND_SIZE) {
      throw new Error(`São necessárias pelo menos ${ROUND_SIZE} perguntas para esta rodada.`);
    }
    return shuffle(eligible, random).slice(0, ROUND_SIZE);
  }

  function calculatePoints({ correct, hintUsed }) {
    if (!correct) return 0;
    return hintUsed ? 50 : 100;
  }

  function calculateMastery(questions, attempts) {
    const totals = {};
    const mastered = {};
    questions.forEach((question) => {
      totals[question.topic] = (totals[question.topic] || 0) + 1;
    });
    attempts.filter((attempt) => attempt.is_correct).forEach((attempt) => {
      const topic = attempt.questions?.topic;
      if (!topic) return;
      if (!mastered[topic]) mastered[topic] = new Set();
      mastered[topic].add(attempt.question_id);
    });
    return Object.fromEntries(Object.keys(totals).map((topic) => [
      topic,
      Math.round(((mastered[topic]?.size || 0) / totals[topic]) * 100),
    ]));
  }

  return { ROUND_SIZE, WIN_SCORE, MAX_LIVES, shuffle, createRound, calculatePoints, calculateMastery };
}));
