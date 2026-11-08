import test from 'node:test';
import assert from 'node:assert/strict';
import { createLessonPlan, validateLesson } from '../src/lesson.js';
import { renderPreview } from '../src/preview.js';

const lesson = (a = 2, b = 3, c = 11) => ({ schema_version: 1, id: 'linear-01', title: 'Solve an equation', language: 'en', problem: { type: 'linear_equation', coefficient: a, constant: b, result: c } });

test('worked example applies the same operations to both sides and verifies the answer', () => {
  const plan = createLessonPlan(lesson());
  assert.equal(plan.answer, 4);
  assert.deepEqual(plan.steps.map(s => s.id), ['understand', 'subtract-both', 'divide-both', 'check']);
  assert.equal(plan.steps[1].visual.removing, 3);
  assert.equal(plan.steps[2].visual.units / plan.steps[2].visual.groups, 4);
  assert.deepEqual(plan.mathCheck, { method: 'integer-substitution', left: 11, right: 11, passed: true });
});

test('every supported parameter combination produces a consistent visual and contiguous timeline', () => {
  let cases = 0;
  for (let a = 1; a <= 6; a++) for (let b = 0; b <= 12; b++) for (let x = 1; x <= 12; x++) {
    const c = a * x + b;
    if (c > 36) continue;
    const plan = createLessonPlan(lesson(a, b, c));
    assert.equal(plan.answer, x);
    let end = 0;
    for (const step of plan.steps) {
      assert.equal(step.startSeconds, end);
      assert.ok(step.durationSeconds > 0);
      end = step.endSeconds;
      const v = step.visual;
      if (v.type === 'balance') {
        assert.equal(v.boxes * x + v.constants, v.units);
        assert.ok(v.removing <= v.constants && v.removing <= v.units);
        if (v.groups > 1) assert.equal(v.units / v.groups, x);
      }
    }
    assert.equal(end, plan.timing.totalSeconds);
    assert.equal(plan.mathCheck.left, plan.mathCheck.right);
    cases++;
  }
  assert.ok(cases > 500);
});

test('unsupported inputs fail rather than generating misleading mathematical visuals', () => {
  for (const params of [[0, 3, 11], [7, 3, 31], [2, -3, 11], [2, 3, 3], [2, 3, 37], [3, 1, 8], [1, 0, 13], [2.5, 3, 13]]) {
    assert.throws(() => validateLesson(lesson(...params)));
  }
  const unsafe = lesson(); unsafe.id = '../escape';
  assert.throws(() => validateLesson(unsafe), /slug/);
});

test('identity operations are skipped and plan generation is deterministic', () => {
  const simple = createLessonPlan(lesson(1, 0, 4));
  assert.deepEqual(simple.steps.map(s => s.id), ['understand', 'check']);
  assert.deepEqual(createLessonPlan(lesson()), createLessonPlan(lesson()));
  const changed = lesson(); changed.title = 'A new title';
  assert.notEqual(createLessonPlan(changed).lessonHash, createLessonPlan(lesson()).lessonHash);
});

test('Tamil and English use the same mathematics and retain separate narration', () => {
  const ta = lesson(); ta.language = 'ta';
  const tamil = createLessonPlan(ta);
  assert.equal(tamil.answer, createLessonPlan(lesson()).answer);
  assert.match(tamil.steps[1].narration, /இரண்டு/);
});

test('lesson titles cannot break out of the HTML or embedded JSON', () => {
  const input = lesson(); input.title = '</script><script>alert(1)</script>';
  const html = renderPreview(createLessonPlan(input));
  assert.ok(!html.includes(input.title));
  assert.ok(html.includes('&lt;/script&gt;'));
  const embedded = html.match(/<script id="lesson-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(embedded).title, input.title);
});
