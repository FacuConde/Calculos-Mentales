import { Difficulty, GameMode, Operation, Operator } from '../types/types';
import { DIFFICULTY_PARAMS } from '../constants/difficulty';

let opCounter = 0;

function uid(): string {
  return `op_${Date.now()}_${++opCounter}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperator(difficulty: Difficulty): Operator {
  const ops = DIFFICULTY_PARAMS[difficulty].operators;
  return ops[Math.floor(Math.random() * ops.length)];
}

function buildOperands(
  operator: Operator,
  difficulty: Difficulty
): [number, number, number] {
  const { operandRange, multiplyRange } = DIFFICULTY_PARAMS[difficulty];
  const [min, max] = operandRange;

  if (operator === '*') {
    const [mMin, mMax] = multiplyRange;
    const a = randInt(mMin, mMax);
    const b = randInt(mMin, mMax);
    return [a, b, a * b];
  }

  if (operator === '/') {
    // Generate result first, then multiply to guarantee exact integer division
    const result = randInt(2, Math.floor(max / 2));
    const divisor = randInt(2, Math.min(12, Math.floor(max / result)));
    const dividend = result * divisor;
    return [dividend, divisor, result];
  }

  if (operator === '-') {
    // Avoid negative results in Facil/Medio
    if (difficulty !== Difficulty.Dificil) {
      const a = randInt(min, max);
      const b = randInt(min, a);
      return [a, b, a - b];
    }
    const a = randInt(min, max);
    const b = randInt(min, max);
    return [a, b, a - b];
  }

  // addition
  const a = randInt(min, max);
  const b = randInt(min, max);
  return [a, b, a + b];
}

function operatorSymbol(op: Operator): string {
  const map: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return map[op];
}

function generateDistractors(correct: number, count: number): number[] {
  const distractors = new Set<number>();
  let attempts = 0;

  while (distractors.size < count && attempts < 200) {
    attempts++;
    const delta = randInt(1, 10) * (Math.random() < 0.5 ? 1 : -1);
    const candidate = correct + delta;
    if (candidate !== correct && candidate >= 0) {
      distractors.add(candidate);
    }
  }

  // Fallback if not enough unique distractors generated
  let fallback = correct + 1;
  while (distractors.size < count) {
    if (fallback !== correct) distractors.add(fallback);
    fallback++;
  }

  return Array.from(distractors).slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateOperation(
  difficulty: Difficulty,
  mode: GameMode,
  lastOperationId?: string
): Operation {
  const operator = pickOperator(difficulty);
  const [a, b, correct] = buildOperands(operator, difficulty);

  const expression = `${a} ${operatorSymbol(operator)} ${b}`;

  const base: Operation = {
    id: uid(),
    expression,
    operands: [a, b],
    operator,
    correctAnswer: correct,
  };

  if (mode === GameMode.MultipleChoice) {
    const distractors = generateDistractors(correct, 3);
    base.options = shuffle([correct, ...distractors]);
  }

  if (mode === GameMode.VerdaderoFalso) {
    const showCorrect = Math.random() < 0.5;
    if (showCorrect) {
      base.displayedAnswer = correct;
      base.isDisplayedCorrect = true;
    } else {
      const wrong = correct + (Math.random() < 0.5 ? randInt(1, 10) : -randInt(1, 10));
      base.displayedAnswer = wrong !== correct ? wrong : correct + 1;
      base.isDisplayedCorrect = false;
    }
  }

  return base;
}
