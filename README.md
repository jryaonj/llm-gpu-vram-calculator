# LLM GPU VRAM Calculator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://jryaonj.github.io/llm-gpu-vram-calculator)

An interactive web calculator for estimating LLM serving VRAM, KV cache pressure, and rough throughput across model, quantization, context, concurrency, and GPU choices.

## Features

- Guided setup and detailed controls for model, hardware, and runtime parameters.
- Sourced model catalog covering Qwen3/Qwen3.5/Qwen3.6, DeepSeek V3/R1, and Gemma 3/4 families.
- GPU catalog with release dates, vendor metadata, architecture hints, and official or supplemental source links.
- Quantization and KV-cache support hints for FP16, FP8, INT8, INT4, and FP32 fallback paths.
- Formula/theory panel for the capacity and throughput estimates.
- CSV export for the model catalog, hardware catalog, and current estimate metrics.
- Initial i18n support with `en_US` as the default locale and `zh_CN` available from the top control bar.

## Quick Start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Data Files

- `src/data/modelDefs.ts` stores model parameter, context, release-date, and source-link metadata.
- `src/data/gpuCards.ts` stores GPU memory, bandwidth, compute, release-date, and source-link metadata.
- `src/utils/formulas.ts` keeps shared formula helpers.

Every built-in model or GPU entry should include source URLs when a reliable source is available. Local estimates, especially INT4 weight size and hybrid/MLA KV-cache approximations, should be documented in `sourceNote`.

## Calculation Notes

See [docs/llm_calc.md](docs/llm_calc.md) for the VRAM formulas, throughput heuristics, source policy, export notes, and the reasoning behind empirical constants such as multi-GPU scaling exponents.

## Live Demo

https://jryaonj.github.io/llm-gpu-vram-calculator

## License

MIT License
