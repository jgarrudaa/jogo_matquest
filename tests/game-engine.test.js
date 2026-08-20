const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../static/js/game-engine.js');

function questions(topic, count) {
  return Array.from({ length: count }, (_, index) => ({ id: `${topic}-${index}`, topic }));
}

test('creates randomized rounds with exactly ten unique questions', () => {
  const bank = [...questions('seno', 15), ...questions('cosseno', 15)];
  const round = engine.createRound(bank, null, () => 0.42);
  assert.equal(round.length, 10);
  assert.equal(new Set(round.map((question) => question.id)).size, 10);
});

test('topic round contains only the selected topic', () => {
  const bank = [...questions('seno', 15), ...questions('tangente', 15)];
  const round = engine.createRound(bank, 'tangente', () => 0.25);
  assert.equal(round.length, 10);
  assert.ok(round.every((question) => question.topic === 'tangente'));
});

test('rounds ignore duplicate question ids', () => {
  const bank = [...questions('seno', 10), { id: 'seno-0', topic: 'seno' }];
  const round = engine.createRound(bank, 'seno', () => 0.5);
  assert.equal(round.length, 10);
  assert.equal(new Set(round.map((question) => question.id)).size, 10);
});

test('scores first attempt, hint and incorrect answers correctly', () => {
  assert.equal(engine.calculatePoints({ correct: true, hintUsed: false }), 100);
  assert.equal(engine.calculatePoints({ correct: true, hintUsed: true }), 50);
  assert.equal(engine.calculatePoints({ correct: false, hintUsed: false }), 0);
});

test('mastery counts distinct correctly answered questions', () => {
  const bank = questions('seno', 4);
  const attempts = [
    { question_id: 'seno-0', is_correct: true, questions: { topic: 'seno' } },
    { question_id: 'seno-0', is_correct: true, questions: { topic: 'seno' } },
    { question_id: 'seno-1', is_correct: false, questions: { topic: 'seno' } },
    { question_id: 'seno-2', is_correct: true, questions: { topic: 'seno' } },
  ];
  assert.equal(engine.calculateMastery(bank, attempts).seno, 50);
});

test('mastery ignores attempts for inactive questions', () => {
  const bank = questions('seno', 2);
  const attempts = [
    { question_id: 'seno-0', is_correct: true },
    { question_id: 'inactive-question', is_correct: true },
  ];
  assert.equal(engine.calculateMastery(bank, attempts).seno, 50);
});

test('mastery totals count each active question once', () => {
  const bank = [...questions('seno', 2), { id: 'seno-0', topic: 'seno' }];
  const attempts = [{ question_id: 'seno-0', is_correct: true }];
  assert.equal(engine.calculateMastery(bank, attempts).seno, 50);
});
