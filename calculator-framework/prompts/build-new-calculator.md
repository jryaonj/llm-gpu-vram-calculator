# Prompt: Grow New Calculator From The Base Pattern

Use this prompt inside a new empty calculator repository after copying in `calculator-framework/`.

```md
We are going to grow a new calculator from the shared calculator framework.

Goal:
Build a domain-specific calculator using the framework pattern as the product contract. Do not start from a decorative landing page. The first screen should be the usable calculator.

Calculator topic:
<describe the calculator topic here>

Primary user:
<describe the target user here>

Primary user question:
<write the concrete question the calculator must answer>

Known inputs:
<list known inputs, entities, catalogs, assumptions, presets, numeric fields>

Known outputs:
<list expected result metrics and units>

Known formulas or source references:
<paste formulas, rules, source links, caveats, or say what needs research>

Important context:
- Read `calculator-framework/README.md`.
- Read `calculator-framework/docs/semantic-merge.md`.
- Read `calculator-framework/docs/adapter-contract.md`.
- Read `calculator-framework/manifest.schema.json`.
- If there is an example manifest, read it as a shape reference, not as domain truth.

Do this in order:
1. Ask at most three clarification questions only if the missing information would materially change the calculator.
2. Create a calculator manifest at `calculator-framework/examples/<calculator-id>.manifest.json`.
3. Create `docs/theory.md` with formulas, assumptions, source policy, and calibration notes.
4. Propose the domain adapter boundary: entities, inputs, compute result envelope, formula traces, facts, hints, exports.
5. Scaffold the app using the repo's chosen stack.
6. Implement the calculation core before polishing the UI.
7. Add fixture tests for representative inputs and edge cases.
8. Implement the UI as Guided Setup, Detailed Controls, and Theory/Method notes where appropriate.
9. Include source-backed facts near the values they support.
10. Add export for the current estimate and any built-in catalogs.
11. Verify build/lint/tests and responsive behavior if browser tooling is available.

Design rules:
- Operational calculator, not marketing page.
- Dense but readable.
- No decorative hero section unless the product truly needs one.
- Show formulas and assumptions.
- Keep numeric inputs editable during partial typing.
- Keep long names, units, formulas, and URLs from escaping their containers.
- Use icons for tools and mode switches where the stack supports it.

Framework rules:
- The base owns the shell language: guided flow, detailed controls, formula cards, source cards, hints, exports.
- The domain owns meaning: entities, formulas, catalogs, units, source caveats, result interpretation.
- If a concept appears only in this calculator, keep it domain-local.
- If a concept looks reusable, mark it as a base candidate in `docs/framework_candidates.md` instead of extracting it immediately.

Final output should include:
- What was built.
- Manifest path.
- Theory/source notes path.
- How to run it.
- What validation passed.
- Any remaining domain assumptions or source gaps.
```

