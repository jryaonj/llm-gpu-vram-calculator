# Experiment Workflow

Use this framework in two different situations:

- Merge an existing calculator into the shared pattern.
- Grow a new calculator from the shared pattern.

In both cases, the first useful output is not code. The first useful output is a manifest that explains the calculator's intent, entities, inputs, outputs, formulas, sources, exports, and tests.

## Path A: Merge An Existing Calculator

Recommended flow:

1. Clone the existing calculator repository.
2. Create a new branch for the framework experiment.
3. Keep the existing app runnable.
4. Copy only `calculator-framework/` into the repo, or add it as a reference folder.
5. Ask the agent to read the existing calculator and produce a manifest.
6. Ask the agent to classify each current feature as base, configurable, or domain-only.
7. Only then refactor code toward an adapter boundary.

Moving the old code into a `legacy/` subfolder is useful only if the goal is a full rewrite. For a safer migration, keep the original structure first and make the manifest describe reality.

Suggested folder shape for a merge experiment:

```txt
old-calculator/
  calculator-framework/
  src/
  docs/
  package.json
```

If doing a full rewrite:

```txt
old-calculator/
  legacy/
  calculator-framework/
  src/
  docs/
  package.json
```

## Path B: Grow A New Calculator

Recommended flow:

1. Create a new empty repo.
2. Copy `calculator-framework/` into the repo.
3. Fill out a domain manifest before writing UI code.
4. Write theory notes and source policy.
5. Implement the calculation core with fixture tests.
6. Implement the UI shell using the manifest as the product contract.
7. Compare the result back against the framework and mark reusable candidates.

Suggested folder shape:

```txt
new-calculator/
  calculator-framework/
  docs/
    theory.md
  src/
    domain/
    calculator/
    components/
```

## What To Compare After Each Experiment

Update the framework notes with:

- Which manifest fields were natural.
- Which manifest fields felt forced.
- Which UI components repeated cleanly.
- Which features needed domain-specific exceptions.
- Which tests caught real mistakes.
- Which names should become stable base language.

The merge should produce evidence, not just code movement.

