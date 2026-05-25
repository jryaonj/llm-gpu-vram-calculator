# LLM VRAM and Throughput Estimation Notes

This document describes the formulas used by the calculator and the intent behind the empirical constants. The numbers are planning priors, not guaranteed benchmark results.

## Estimator Shape

The calculator splits inference into two resource models:

- Capacity: static model weights, dynamic KV cache, and reserved runtime memory.
- Throughput: prompt prefill as a compute-bound path, and token generation as a memory-bandwidth-bound path.

This follows the practical intuition behind roofline-style analysis: a workload is limited by whichever ceiling is tighter, compute throughput or memory bandwidth.

Source: https://zenodo.org/records/1236156

## Catalog Data and Source Policy

The built-in catalog is intentionally practical rather than exhaustive. Model rows carry the fields needed by the estimator: total parameters, active parameters, hidden size, layer count, KV geometry, default quantization, context length, release date, and source links.

Current model families include:

- Qwen3, Qwen3.5, and Qwen3.6 dense/MoE checkpoints.
- DeepSeek V3, V3.1, R1-0528, and V4 Flash/Pro MoE checkpoints.
- Gemma 3 dense checkpoints and all four Gemma 4 sizes: E2B, E4B, 26B-A4B, and 31B.

Each built-in model and GPU should include source URLs when available. The source link usually points to the Hugging Face model card/config or an official vendor hardware page. Supplemental sources such as TechPowerUp can be useful for GPU data, but official vendor pages should win when the numbers disagree.

Some fields are estimates even when the source row is strong:

- INT4 weight size uses a local grouped-quantization estimate unless the catalog row explicitly stores a measured artifact size.
- DeepSeek V3/R1 use an MLA-style KV approximation based on latent KV rank rather than normal GQA head geometry.
- DeepSeek V4 uses the vLLM recipe `vram_minimum_gb` as the default served mixed FP4+FP8 weight footprint: 170 GB for Flash and 960 GB for Pro. Hugging Face `safetensors.total` is tensor element metadata, not GB; the FP8 `-Base` repos are larger, separate artifacts.
- DeepSeek V4 uses a compressed-attention KV planning proxy based on the model-card claim that Pro needs about 10% of DeepSeek V3.2 KV cache at 1M tokens. This is a capacity prior, not an exact runtime allocator trace.
- Gemma 3/4 hybrid local/global attention can allocate cache differently across runtimes, so the row documents this in `sourceNote`.

## Exported Data

The top control bar can save three CSV files directly in the browser:

- `llm-model-catalog.csv`: model metadata, release dates, source URLs, and notes.
- `llm-gpu-hardware-catalog.csv`: GPU metadata, release dates, throughput fields, source URLs, and notes.
- `llm-gpu-current-estimate.csv`: the active configuration and calculated memory/throughput metrics.

The export is generated from in-memory catalog data with a browser `Blob`; no server or static generated resource is required.

## Internationalization

The app defaults to `en_US` and includes an initial `zh_CN` locale. The first pass covers global navigation, summary labels, export controls, and major guided-result controls. Formula names, source titles, and highly technical catalog labels currently stay in English so they remain aligned with upstream model and hardware references.

## Model Weight Memory

```
weight_vram_gb = total_params_b * (bytes_per_param + quant_overhead)
```

`total_params_b` is the published total parameter count in billions. Dense models use almost the same value for total and active parameters. MoE models can have much smaller active parameters per token, but total parameters still matter for loaded weight memory.

`bytes_per_param` is selected from the weight dtype:

- FP16: 2 bytes
- FP8: 1 byte
- INT8: 1 byte
- INT4: 0.5 byte

For grouped INT4 estimates, the calculator can add a small per-parameter overhead for scale or zero-point metadata:

```
quant_overhead = 3 / awq_group_size
```

## KV Cache Memory

```
kv_cache_gb = layers * kv_heads * head_dim * 2 * context_tokens * kv_bytes / 2^30
```

The factor `2` accounts for key and value tensors. This estimate is per full-length active request. Total serving memory multiplies it by active users or active sequences.

KV cache is the main reason long-context serving grows quickly: it scales linearly with context length and with concurrent active requests.

Relevant runtime support sources:

- https://docs.vllm.ai/en/stable/features/quantization/quantized_kvcache/
- https://vllm.ai/blog/2026-04-22-fp8-kvcache

## Usable VRAM Budget

```
usable_vram_gb = gpu_vram_gb * gpu_count - max(total_vram_gb * (1 - utilization), reserve_gb)
```

The reserve term protects against allocator fragmentation, CUDA graphs, temporary buffers, runtime metadata, and measurement error. Raising utilization makes the calculator more permissive, but it also increases out-of-memory risk.

## Prompt Throughput

```
prompt_tok_s = fp16_tflops * 1000 * gpu_count^0.6 / (total_params_b * sqrt(2))
```

Prompt prefill reads existing context and is treated as a dense compute-heavy path over the full model. The `1000` factor converts TFLOPS per billion parameters into an approximate token-per-second scale.

The `sqrt(2)` divisor is an empirical dampener. It is not a hardware constant. It roughly accounts for non-GEMM work, imperfect kernel occupancy, runtime scheduling, attention overhead, mixed precision behavior, and batching shape.

The `gpu_count^0.6` scaling term is also empirical. Prompt prefill often pays more synchronization and activation movement across devices, so this calculator assumes sublinear scaling rather than ideal linear scaling.

## Generation Throughput

```
gen_tok_s = bandwidth_gbs * gpu_count^0.8 / (active_params_b * weight_bytes)
```

Autoregressive generation is treated as a bandwidth-heavy path because each new token repeatedly streams active weights and attention state. Dense models usually use active parameters equal to total parameters. MoE models should use the active routed parameters per token.

The `gpu_count^0.8` term assumes decode benefits more from memory-bandwidth aggregation than prefill does, while still losing some efficiency to interconnect, tensor parallel communication, routing, and pipeline bubbles.

## How to Calibrate

The calculator defaults should be treated as conservative planning values:

1. Run a small benchmark on the target runtime and model.
2. Compare measured prompt and decode throughput with the calculator.
3. Adjust the scaling exponents or effective TFLOPS/bandwidth if the local runtime is consistently above or below the estimate.
4. Keep the capacity side stricter than the speed side; a speed miss is inconvenient, but a capacity miss can prevent the workload from starting.

## Source Links

- Roofline model: https://zenodo.org/records/1236156
- NVIDIA Tensor Core overview: https://www.nvidia.com/en-eu/data-center/tensorcore/
- NVIDIA CUDA arithmetic throughput guide: https://docs.nvidia.com/cuda/archive/10.1/pdf/CUDA_C_Programming_Guide.pdf
- vLLM quantization matrix: https://docs.vllm.ai/en/stable/features/quantization/
- vLLM quantized KV cache: https://docs.vllm.ai/en/stable/features/quantization/quantized_kvcache/
- Qwen3.6-35B-A3B model card: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- DeepSeek-V3.1 model card: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- DeepSeek-R1-0528 model card: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528
- DeepSeek-V4 model card/report: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- DeepSeek-V4 Transformers docs: https://huggingface.co/docs/transformers/model_doc/deepseek_v4
- vLLM DeepSeek-V4-Pro recipe: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- vLLM DeepSeek-V4-Flash recipe: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- Gemma 3 docs: https://huggingface.co/docs/transformers/model_doc/gemma3
- Gemma 4 31B model card: https://huggingface.co/google/gemma-4-31B
- Gemma 4 26B-A4B model card: https://huggingface.co/google/gemma-4-26B-A4B
- Gemma 4 docs: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/gemma4.md
