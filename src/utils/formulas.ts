import type { KvQuantType, RuntimeQuantType } from '../types';

export const weightBytesByQuant: Record<RuntimeQuantType, number> = {
  fp16: 2,
  fp8: 1,
  int8: 1,
  int4: 0.5,
};

export const kvBytesByQuant: Record<KvQuantType, number> = {
  fp32: 4,
  fp16: 2,
  fp8: 1,
  int8: 1,
  int4: 0.5,
};

export function estimateModelWeightGB(paramsB: number, quant: RuntimeQuantType, awqGroup = 32): number {
  const overheadBytes = quant === 'int4' ? 3 / awqGroup : 0;
  return paramsB * (weightBytesByQuant[quant] + overheadBytes);
}

export function computeKvCacheVramGB(
  layers: number,
  numKVHeads: number,
  headDim: number,
  maxLength: number,
  quant: KvQuantType
): number {
  const bytesPerToken = layers * numKVHeads * headDim * 2 * kvBytesByQuant[quant];
  return (bytesPerToken * maxLength) / (1024 ** 3);
}

export function estimatePromptTokensPerSecond(fp16Tflops: number, totalParamsB: number, gpuCount: number): number {
  return (fp16Tflops * 1000 * Math.pow(gpuCount, 0.6)) / (Math.max(0.01, totalParamsB) * Math.sqrt(2));
}

export function estimateGenerationTokensPerSecond(
  memoryBandwidthGBs: number,
  activeParamsB: number,
  quant: RuntimeQuantType,
  gpuCount: number
): number {
  return (memoryBandwidthGBs * Math.pow(gpuCount, 0.8)) / (Math.max(0.01, activeParamsB) * weightBytesByQuant[quant]);
}
