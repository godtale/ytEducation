# Education Studio

A separate educational-video workflow for worked problems, concepts, formulas, and eventually theorem explanations. The history production project stays in [ytAutomation](https://github.com/godtale/ytAutomation).

The first working slice turns a structured linear equation into a mathematically checked teaching plan and a standalone, step-by-step visual preview. It uses exact integer arithmetic and deterministic vector diagrams. No API key, subscription, external font, or package installation is needed.

## Try it

Requires Node.js 22 or newer.

```powershell
npm.cmd test
npm.cmd run demo
```

Open the printed `preview.html` path in a browser. Use Previous / Next, the arrow keys, or Play steps. The preview works offline and includes the narration script. It is silent; step durations are authored placeholders, not measured speech.

```powershell
npm.cmd run lesson -- check lessons/linear-equation.json
npm.cmd run lesson -- prepare lessons/linear-equation.json
```

Edit the lesson JSON to change the problem, title, or narration language (`en` or `ta`). The worked example is `2x + 3 = 11`:

1. Connect the equation to a balance of unknown boxes and individual units.
2. Cross out three units on both sides, explaining that equality is preserved.
3. Divide both sides into two equal groups, showing four units for each box.
4. Substitute the answer into the original equation to check it.

The first visual supports `ax + b = c` with integer `a` from 1–6, `b` from 0–12, `c` at most 36, and a positive whole-number answer at most 12. Unsupported problems are rejected explicitly. Subtracting zero and dividing by one are skipped. Fractions, negative values, nonlinear equations, general formula notation, and theorem proofs are future lesson types.

## Outputs

Prepared artifacts are grouped under `output/<lesson-id>/<content-hash>/`:

- `lesson-plan.json`: verified answer, typed visual states, narration, and step timeline.
- `preview.html`: self-contained visual player, with no network requests.
- `narration.txt`: editable recording reference.

Every plan remains `draft_for_review`. Arithmetic checks verify this supported problem family; they do not approve teaching quality, translation, pronunciation, or future proofs. Generated artifacts and credentials are excluded from Git.

## Code

- `src/lesson.js`: input validation, algebra, teaching steps, and timing.
- `src/preview.js`: accessible player and deterministic SVG visuals.
- `src/cli.js`: local check/prepare commands and versioned outputs.
- `test/lesson.test.js`: substitution, visual invariants, input boundaries, timeline continuity, and safe HTML embedding.

There is no AI generation, narration synthesis, MP4 export, or publishing integration in this starter. See [the roadmap](docs/roadmap.md) for the next implementation slices.
