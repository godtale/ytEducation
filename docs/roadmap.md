# Education workflow roadmap

## 1. Checked lesson and visual preview — implemented

Structured linear equation → validated teaching steps → deterministic balance diagrams → offline HTML preview. English and Tamil narration text share the same mathematics. Review the complete lesson before recording or media generation.

## 2. Narration and synchronized export

Add version-specific lesson approval. Adapt the history project's environment-only speech credentials, provider interface, and request ledger into this repository without introducing a runtime dependency on the history folder. Cache audio per teaching step using text, voice, model, and relevant synthesis settings. Rebuild timing from measured audio and explicit teaching pauses. Render the vector states into captioned vertical and landscape MP4 previews.

Exit criterion: the checked equation lesson exports a locally reviewable narrated MP4; rerendering uses no paid requests, and changing one narration step only regenerates that step's audio.

## 3. Fractions and formula rendering

Introduce rational arithmetic, area models, number lines, and a mathematical notation renderer. Specify valid input domains and pedagogical rules for every lesson type. Test equivalent transformations and visual quantities, including boundary and invalid cases.

## 4. Graphs and geometry

Add coordinate planes, annotated points, slope, triangles, and measured angle constructions. Separate hypotheses, intermediate reasoning, and conclusions in theorem lessons. A diagram or matching numerical example is not proof. Mathematical and teaching review remain explicit.

## 5. Lesson automation and editor

Build a topic/problem editor, step reordering with revalidation, narration review, batch lesson queue, restart recovery, usage estimates, and budget controls. AI proposals must conform to a supported lesson type and pass its checks before entering the review flow. Keep external provider requests opt-in and avoid automatic retries after uncertain billing.

## Design rules

- Show the same mathematical operation on both sides.
- Synchronize each explanation with the corresponding visual change.
- Reveal one teaching idea at a time, with time to think.
- Pair colour with labels, positions, and shapes.
- Keep mathematical notation independent of narration language.
- Prefer exact vectors and computations for mathematics; generated art is optional supporting context.
- Keep this repository and its release cycle independent of history production.
