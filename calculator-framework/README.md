# Calculator Framework Incubator

This folder captures the reusable calculator pattern from the LLM GPU VRAM calculator without turning it into a separate product too early.

Decision: keep the framework inside this repository until at least one more calculator is implemented against the same manifest and adapter contract. Extract it into a separate repository only after the shared parts have evidence from multiple domains.

## Why Not A New Empty Repo Yet

A separate empty repository looks clean, but it loses the concrete pressure from the working calculator. At this stage the useful source of truth is still the real app: guided setup, detailed controls, formula explanations, source-backed catalogs, exports, and i18n.

Keeping the framework here first gives us:

- A live reference implementation.
- A place to compare base rules against real LLM/GPU behavior.
- Lower cost for changing the manifest while it is still young.
- A clean extraction path once the contract stabilizes.

Create a separate repo when:

- Two or three calculators use the same manifest shape.
- The adapter contract stops changing every time a new domain appears.
- The base UI shell can run without LLM/GPU-specific imports.
- There is a versioned schema and at least one example manifest.

## What This Folder Owns

- `manifest.schema.json`: the portable schema each calculator can declare.
- `examples/`: concrete manifests that map existing calculators into the shared language.
- `docs/semantic-merge.md`: the method for finding shared parts across projects.
- `docs/adapter-contract.md`: the intended runtime boundary between base shell and domain logic.
- `docs/experiment-workflow.md`: how to try the framework on a new or existing calculator.
- `prompts/`: reusable prompts for merging an existing calculator or growing a new one from the ground.

## Extraction Rule

Do not extract code just because it is reusable in theory. Use this evidence ladder:

- One calculator: document the pattern.
- Two calculators: mark a base candidate.
- Three calculators with similar change shape: move it into the base framework.

This keeps the base from becoming a large abstract machine before it has earned its shape.
