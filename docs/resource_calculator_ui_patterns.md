# Resource Calculator UI Pattern

This document captures the reusable design pattern behind the LLM GPU VRAM Calculator. Use it as a starting point for similar planning tools: CPU/GPU/memory/SSD sizing, accelerator throughput estimators, cluster-capacity calculators, or domain-specific resource/performance calculators.

The core idea is simple: separate guided data entry from expert control, keep formulas inspectable, and attach sources wherever the tool presents catalog facts or non-obvious heuristics.

## Product Shape

A resource calculator should usually have three primary modes:

- Guided setup: a step-by-step flow for users who know the target but not every parameter.
- Detailed controls: the full parameter workspace for expert editing, debugging, and comparison.
- Theory or method notes: formula explanations, assumptions, source links, and calibration guidance.

The first screen should be the calculator itself, not a marketing landing page. Users should immediately be able to search, choose a preset, or start the guided path.

## Guided Setup Pattern

Guided setup works best when each step answers one plain question:

1. What workload or model/component is being estimated?
2. What hardware or environment will run it?
3. What runtime assumptions, concurrency, precision, or safety margins should be applied?
4. What is the computed result?

Each step should auto-progress once a complete selection is made. Completed steps collapse into compact summaries but remain editable. The active step expands. Locked future steps show why they are locked, not a blank area.

Choice depth should be progressive:

- Primary path: direct search or a small set of high-level family choices.
- Secondary path: detailed chooser icon or button for catalog browsing.
- Tertiary path: custom numeric entry for values outside the catalog.

Avoid forcing a separate "complete" click when the selected combination is already complete. Reserve explicit actions for the final compute or result-opening moment.

## Detailed Controls Pattern

Detailed controls should be a split workspace:

- Parameter panel: current model/component, hardware/environment, and runtime assumptions.
- Workspace panel: results, formulas, source-backed facts, support hints, and warnings.

The split should be responsive. On wide screens, allow ratios such as compact parameters with wider results. On narrow screens, stack sections and collapse low-priority parameter groups. A good default is to show a compact "selected configuration" summary until the user explicitly expands a section to edit it.

The parameter panel should support three common entry modes:

- Catalog: curated sourced entries with search and filters.
- Structured: family -> type -> scale or vendor -> class -> card composition.
- Custom/numeric: manual values for non-catalog entries.

Numeric inputs should allow temporary empty or partial typing states. Do not trap users at a minimum value while they are trying to delete and retype.

## Workspace Tabs

Use tabs to keep the result area readable:

- Results: headline capacity/performance numbers and blocking errors.
- Formulas: formula cards with purpose, equation, variables, current substitution, result, and interpretation.
- Workload facts: source-backed details for the selected model, component, or workload.
- Hardware facts: source-backed details for the selected device or environment.
- Hints: marginal risks, support matrix, precision caveats, and source links.

Tabs should preserve context. Switching tabs should not reset input state.

## Formula Cards

Whenever an equation is shown, include text that explains it. A formula card should contain:

- Title: what the formula estimates.
- Purpose: when this formula matters.
- Equation: stable symbolic expression.
- Variables: name, current value, and description.
- Current substitution: the actual values being plugged in.
- Result: computed value with unit.
- Interpretation: how to read the value and what can make it wrong.

Keep formulas honest about heuristic constants. Values such as scaling exponents, safety reserves, and empirical dampeners should be visible and documented in the theory/method tab.

## Catalog and Source Policy

Every built-in catalog entry should prefer structured fields over display-only strings:

- Identity: name, family, variant, scale, vendor, class, architecture.
- Capacity: memory size, parameter count, cache geometry, storage size, device capacity.
- Performance: bandwidth, compute proxy, supported precision, release date.
- Provenance: source URLs, source notes, and known caveats.

Official sources should win when they disagree with supplemental sources. Supplemental sources are useful for practical hardware tables, but they should be labeled as supplemental. If a value is derived, estimated, or runtime-specific, put the derivation in `sourceNote` or an equivalent field.

Source links should appear near the facts they support and also in a helper/source section. Users should not need to guess where a number came from.

## Marginal Hints and Support Matrix

Resource calculators are most useful when they explain the edge cases:

- Capacity blockers: what must change to fit.
- Precision caveats: when a storage dtype does not imply fast kernels.
- Hardware generation limits: old or new architectures with incomplete backend support.
- Runtime support: whether a library officially supports the selected combination.
- Quality tradeoffs: memory-saving options that may reduce output quality.

Hints should be generated from the current selection, not hard-coded as generic banners. Each hint should include title, body, impact, severity/tone, and source links.

## Export Pattern

Offer data export for both catalog and active estimate:

- Catalog export: all structured fields, release dates, source URLs, and notes.
- Current estimate export: selected inputs, computed outputs, precision modes, and warnings.

Browser-side CSV via `Blob` is enough for static tools. A server export is only needed when the calculator depends on backend-only data.

## Internationalization and Typography

Treat i18n as content design, not only label replacement. Translate:

- App shell and footer.
- Guided setup copy.
- Detailed controls.
- Results and errors.
- Formula purposes, variable descriptions, and interpretations.
- Theory/method notes.
- Support hints and source fallback text.

Keep canonical technical identifiers in their original form when that helps users match upstream references: model names, GPU names, architecture names, dtype names, formulas, library names, paper titles, and source titles.

Use a locale-aware font stack. For Simplified Chinese, prefer Noto Sans SC or Source Han Sans SC ahead of the Latin UI font, with system CJK fonts as fallback.

## Responsive Behavior

The calculator should never require horizontal page scrolling for normal use. Recommended checks:

- Desktop wide: parameter/workspace split is readable.
- Laptop width: controls wrap into two or three columns.
- Tablet/mobile: sections stack, summaries stay compact, and buttons keep stable height.
- Long model names, GPU names, source URLs, and equations wrap without escaping their container.

Use stable dimensions for repeated cards, toolbar buttons, segmented controls, and numeric inputs so hover states or translated text do not shift layout.

## Visual Style

For operational calculators, prefer a quiet, dense, work-focused interface:

- Compact panels instead of decorative hero sections.
- Clear tab and segmented-control states.
- Icons for tools and mode switches.
- Color as a semantic hint, not a page-wide theme.
- Small source/fact cards with clear labels.
- No nested cards unless the inner card is a repeated data item.

The layout should feel like an instrument panel: calm, inspectable, and designed for repeated use.

## Testing Checklist

Before shipping a new calculator or major UI change:

- Build and lint pass.
- Guided flow can complete without manual "complete" clicks except final compute.
- Detailed controls can edit every value shown in guided summaries.
- Empty/partial numeric input typing works.
- Results, formulas, facts, hints, and sources update after selection changes.
- Locale switch updates app shell, content, document language, and typography.
- Desktop and mobile have zero horizontal overflow.
- Source links are present for built-in catalog facts where reliable sources exist.
- Export files contain the current fields and source metadata.

