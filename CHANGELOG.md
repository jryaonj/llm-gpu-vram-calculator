# Changelog

## 2026-05-26

### Documentation and design patterns

- Updated README feature notes for expanded zh_CN coverage and Noto Sans SC typography.
- Refreshed calculation notes to describe the current i18n/content translation scope and the deliberate choice to keep model, hardware, dtype, formula, and source names aligned with upstream references.
- Added a reusable resource-calculator UI pattern guide for future CPU, GPU, memory, SSD, accelerator, and other performance-estimator projects.

## 2026-05-25

### i18n polish

- Lifted locale state to the app shell and added a global header language switcher for `en_US` and `zh_CN`.
- Added the Noto Sans SC CJK font path and expanded Chinese translations across the guided setup, detailed controls, workspace tabs, formulas, theory notes, source fallbacks, and marginal support hints.

### Catalog precision follow-up

- Corrected DeepSeek V4 default weight footprints to vLLM recipe deployment floors: 170 GB for Flash and 960 GB for Pro.
- Documented why HF `safetensors.total` should not be treated as GB, and why FP8 `-Base` repos should not be mixed with the served FP4+FP8 Pro/Flash rows.
- Added DeepSeek-V4-Flash and DeepSeek-V4-Pro with sourced total/active parameters, 1M context length, mixed FP4/FP8 artifact sizes, release dates, and compressed-attention KV-cache notes.
- Expanded Gemma 4 from the previous two medium entries to all four official sizes: E2B, E4B, 26B-A4B, and 31B.
- Corrected Gemma4-26B-A4B from 26.1B/4B to the model-card values 25.2B total and 3.8B active.
- Corrected Gemma4-31B from 31B to the model-card value 30.7B and updated the INT4 planning size accordingly.
- Updated source documentation with DeepSeek V4 model/report links, DeepSeek V4 Transformers docs, and Gemma 4 model-card links.

### Commit comparison notes

- `HEAD~2..HEAD~1` (`918214a`): binary-only favicon optimization in `public/icon.png`, reducing the icon from about 1.46 MB to 18 KB without source-code behavior changes.
- `HEAD~1..HEAD` (`0c445d4`): main calculator modernization across 11 files: added `CHANGELOG.md`, replaced the old emoji component path, rebuilt the React calculator layout, added guided/detailed/theory flows, expanded GPU/model metadata, added source-link handling, added CSV export, added initial i18n controls, and refreshed docs.
- File-level shape of `0c445d4`: `src/components/LlmGpuVramCalculator.tsx` carried the main UI/data-flow work, `src/data/modelDefs.ts` and `src/data/gpuCards.ts` carried catalog/source metadata, `src/index.css` carried adaptive layout styling, and README/docs captured user-facing behavior and formula/source policy.

### Initial catalog, UI, and export pass

- Expanded the model catalog with Qwen3.6-35B-A3B, DeepSeek V3/V3.1/R1-0528, Gemma 3, and Gemma 4 entries.
- Added release dates, source links, and source notes for the new model rows.
- Updated model family parsing and model color hints so guided and detailed selectors group Qwen, DeepSeek, and Gemma cleanly.
- Added browser-side CSV export for model catalog data, GPU catalog data, and the active estimate.
- Added initial i18n support with `en_US` default and `zh_CN` selectable from the top control bar.
- Updated README and calculation notes with source policy, export behavior, and i18n scope.
