import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLessonPlan } from './lesson.js';
import { renderPreview } from './preview.js';

async function main() {
  const [command, input] = process.argv.slice(2);
  if (!['check', 'prepare'].includes(command) || !input) throw new Error('Usage: npm run lesson -- check|prepare lessons/<lesson>.json');
  const plan = createLessonPlan(JSON.parse(await readFile(resolve(input), 'utf8')));
  if (command === 'check') {
    console.log(`Valid: ${plan.lessonId}; x = ${plan.answer}; ${plan.steps.length} teaching steps; substitution passed.`);
    return;
  }
  const dir = resolve('output', plan.lessonId, plan.lessonHash);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'lesson-plan.json'), JSON.stringify(plan, null, 2) + '\n');
  await writeFile(join(dir, 'narration.txt'), plan.steps.map(s => `[${s.id}]\n${s.narration}`).join('\n\n') + '\n');
  await writeFile(join(dir, 'preview.html'), renderPreview(plan));
  console.log(`Prepared: ${dir}\nPreview: ${pathToFileURL(join(dir, 'preview.html')).href}\nDraft for review. Preview timing is authored, not measured speech. No API calls or media publication.`);
}

main().catch(error => { console.error(`Error: ${error.message}`); process.exitCode = 1; });
