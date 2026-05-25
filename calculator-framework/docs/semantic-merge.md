# Semantic Merge Method

Semantic merging is not source-code merging. It is the process of finding common product intent, user journey, data shape, calculation lifecycle, and testing needs across calculators.

The goal is to prevent random reinvention while avoiding a premature universal abstraction.

## Merge Inputs

Each calculator should provide a manifest that describes:

- Domain and primary user question.
- Main entities the user selects or edits.
- Input modes such as catalog, structured selection, custom numeric entry, or presets.
- Output types such as capacity, throughput, cost, time, count, ratio, or risk.
- Guided setup steps.
- Workspace tabs.
- Formula trace requirements.
- Source policy.
- Export targets.
- i18n and testing expectations.

## Classification

After comparing manifests, classify each repeated idea as one of these:

- Stable base: same intent and similar implementation across calculators.
- Configurable base: same intent but different domain vocabulary or ordering.
- Domain only: specific to one calculation domain.

Examples:

- Stable base: formula trace cards, source-backed fact cards, export envelope, numeric draft input behavior.
- Configurable base: guided step labels, output metric groups, catalog filters, unit formatting.
- Domain only: KV cache geometry, mortgage amortization rules, nutrition macro constraints.

## Evidence Ladder

Use this ladder before extracting implementation:

| Evidence | Action |
| --- | --- |
| Appears in one calculator | Document as local pattern |
| Appears in two calculators | Mark as base candidate |
| Appears in three calculators with similar change shape | Extract into base |
| Needs frequent per-domain exceptions | Keep as adapter/config |

## Merge Procedure

1. Normalize vocabulary. Map domain terms to generic roles, such as workload, environment, assumption, result, fact, warning, and source.
2. Compare user journeys. Look for repeated stages, not exact labels.
3. Compare data contracts. Find fields that support the same responsibility.
4. Compare formula lifecycle. Check whether formulas need variables, substitutions, results, interpretations, and caveats.
5. Compare source policy. Decide whether facts require provenance and conflict rules.
6. Compare UI regions. Keep the base at region level before extracting small visual components.
7. Compare tests. Shared user risks are usually stronger base evidence than shared code.

## Anti-Overdesign Rules

- Do not generalize around one domain.
- Do not make every noun generic if the UI becomes harder to understand.
- Do not hide formulas behind a generic result engine; calculators need inspectability.
- Do not force every calculator to have every tab.
- Prefer explicit adapter fields over clever inference.

