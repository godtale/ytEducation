import { createHash } from 'node:crypto';

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateLesson(lesson) {
  requireValue(lesson?.schema_version === 1, 'Unsupported lesson schema_version.');
  requireValue(typeof lesson.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.id), 'Lesson id must be a lowercase slug.');
  requireValue(typeof lesson.title === 'string' && lesson.title.trim() && lesson.title.length <= 160, 'Supply a title of at most 160 characters.');
  requireValue(['en', 'ta'].includes(lesson.language), 'Language must be en or ta.');
  requireValue(lesson.problem?.type === 'linear_equation', 'Only linear_equation lessons are implemented.');
  const { coefficient: a, constant: b, result: c } = lesson.problem;
  requireValue(Number.isInteger(a) && a >= 1 && a <= 6, 'Coefficient must be an integer from 1 to 6.');
  requireValue(Number.isInteger(b) && b >= 0 && b <= 12, 'Constant must be an integer from 0 to 12.');
  requireValue(Number.isInteger(c) && c > b && c <= 36, 'Result must be an integer greater than the constant and at most 36.');
  requireValue((c - b) % a === 0, 'This first balance visual requires a positive whole-number answer. Fractional answers are not supported yet.');
  requireValue((c - b) / a <= 12, 'Answer must be at most 12 for this visual.');
  return lesson;
}

export function equation(a, b, c) {
  return `${a === 1 ? '' : a}x${b ? ` + ${b}` : ''} = ${c}`;
}

export function createLessonPlan(input) {
  const lesson = validateLesson(input);
  const { coefficient: a, constant: b, result: c } = lesson.problem;
  const remainder = c - b;
  const answer = remainder / a;
  const tamil = lesson.language === 'ta';
  const steps = [];
  const add = (id, durationSeconds, title, narration, expression, visual) => {
    const startSeconds = steps.at(-1)?.endSeconds ?? 0;
    steps.push({ id, title, narration, expression, visual, durationSeconds, startSeconds, endSeconds: startSeconds + durationSeconds });
  };
  add('understand', 8,
    tamil ? 'சமநிலையைப் புரிந்துகொள்வோம்' : 'An equation is a balance',
    tamil ? `இரண்டு பக்கங்களும் சமம். இடது பக்கத்தில் ${a} பெட்டிகளும் ${b} அலகுகளும் உள்ளன. வலது பக்கத்தில் ${c} அலகுகள் உள்ளன. ஒவ்வொரு பெட்டியின் மதிப்பையும் கண்டுபிடிப்போம்.`
      : `Both sides have equal value. The left has ${a} unknown ${a === 1 ? 'box' : 'boxes'}${b ? ` and ${b} units` : ''}. The right has ${c} units. What is the value of each box?`,
    equation(a, b, c), { type: 'balance', boxes: a, constants: b, units: c, removing: 0, groups: 1 });
  if (b) {
    add('subtract-both', 9,
      tamil ? 'இரண்டு பக்கங்களிலும் கழிப்போம்' : `Subtract ${b} from BOTH sides`,
      tamil ? `சமநிலை மாறாமல் இருக்க, இரண்டு பக்கங்களிலும் ${b} அலகுகளைக் கழிக்கிறோம். இதனால் ${a} பெட்டிகளின் மொத்த மதிப்பு ${remainder} என்று தெரிகிறது.`
        : `Remove ${b} units from each side. Doing the same operation on both sides keeps them equal. The ${a === 1 ? 'box is' : `${a} boxes are`} now worth ${remainder} units.`,
      `${equation(a, b, c)}  →  ${equation(a, 0, remainder)}`,
      { type: 'balance', boxes: a, constants: b, units: c, removing: b, groups: 1 });
  }
  if (a > 1) {
    add('divide-both', 9,
      tamil ? 'சமமான குழுக்களாகப் பிரிப்போம்' : `Divide BOTH sides by ${a}`,
      tamil ? `இரண்டு பக்கங்களையும் ${a} சமமான குழுக்களாகப் பிரிக்கிறோம். ஒவ்வொரு குழுவிலும் ஒரு பெட்டியும் ${answer} அலகுகளும் உள்ளன. எனவே x இன் மதிப்பு ${answer}.`
        : `Split both sides into ${a} equal groups. Each group has one box and ${answer} units. So x equals ${answer}.`,
      `${equation(a, 0, remainder)}  →  x = ${answer}`,
      { type: 'balance', boxes: a, constants: 0, units: remainder, removing: 0, groups: a });
  }
  add('check', 8,
    tamil ? 'விடையைச் சரிபார்ப்போம்' : 'Check it in the original equation',
    tamil ? `x க்கு பதிலாக ${answer} ஐ இடுவோம். ${a} பெருக்கல் ${answer}, அதனுடன் ${b} சேர்த்தால் ${c} கிடைக்கிறது. இரண்டு பக்கங்களும் சமம். விடை சரி.`
      : `Replace x with ${answer}. ${a} times ${answer}${b ? ` plus ${b}` : ''} equals ${c}. Both sides match. Our answer works.`,
    `${a} × ${answer}${b ? ` + ${b}` : ''} = ${c}  ✓`,
    { type: 'substitution', coefficient: a, constant: b, answer, result: c });
  return {
    schema_version: 1,
    lessonId: lesson.id,
    title: lesson.title,
    language: lesson.language,
    lessonHash: createHash('sha256').update(JSON.stringify(lesson)).digest('hex'),
    status: 'draft_for_review',
    problem: lesson.problem,
    answer,
    mathCheck: { method: 'integer-substitution', left: a * answer + b, right: c, passed: a * answer + b === c },
    timing: { method: 'authored-preview-timing', measuredAudio: false, totalSeconds: steps.at(-1).endSeconds },
    steps
  };
}
