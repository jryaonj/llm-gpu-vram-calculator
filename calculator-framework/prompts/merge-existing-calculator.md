# Prompt: Merge Existing Calculator Into The Base Pattern

Use this prompt inside an existing calculator repository after copying in `calculator-framework/`.

```md
We are going to run a calculator-framework merge experiment.

Goal:
Analyze this existing calculator and map it into the shared calculator framework without immediately rewriting everything. The first deliverable is semantic alignment: manifest, feature classification, and migration plan.

Important context:
- Read `calculator-framework/README.md`.
- Read `calculator-framework/docs/semantic-merge.md`.
- Read `calculator-framework/docs/adapter-contract.md`.
- Read `calculator-framework/manifest.schema.json`.
- Inspect the current app, docs, data files, formula code, UI flow, exports, tests, and package scripts.

Do this in order:
1. Identify what kind of calculator this repo currently is.
2. Identify the primary user question.
3. List the main entities users select or edit.
4. List all input modes: catalog, structured choices, presets, numeric/custom entry, file import, or others.
5. List all outputs and classify them as capacity, throughput, cost, time, count, ratio, risk, or score.
6. List all formulas and whether they are exact, empirical, heuristic, or source-backed.
7. List catalog/source policy: official sources, supplemental sources, derived values, caveats.
8. List guided or implicit user journey steps.
9. List workspace/result regions and tabs.
10. List export targets.
11. List i18n requirements.
12. List existing tests and missing high-risk tests.

Then create:
- `calculator-framework/examples/<calculator-id>.manifest.json`
- `docs/calculator_framework_merge.md`

The merge doc must include:
- Current calculator summary.
- Proposed manifest mapping.
- Feature classification table with columns: feature, current location, classification, reason, migration action.
- Classification values: stable-base, configurable-base, domain-only, unclear.
- Adapter boundary proposal.
- Incremental migration plan.
- Risks and questions.

Rules:
- Do not rewrite app code in the first pass unless the repository is already broken and a tiny fix is needed to inspect it.
- Do not hide domain vocabulary behind vague generic names.
- Do not extract a base component unless there is evidence it belongs outside the domain.
- Keep the existing app runnable.
- Prefer manifest and docs first, code movement second.

After the first pass, run available validation commands such as build, lint, tests, or typecheck. Report what passed and what could not be run.
```

