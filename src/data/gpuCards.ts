import type { GPUCard } from '../types';

const sources = {
  nvidiaDgxB200: {
    label: 'NVIDIA DGX B200 specs',
    url: 'https://www.nvidia.com/en-us/data-center/dgx-b200/',
    note: 'Per-GPU memory and bandwidth are derived from the 8-GPU system total.',
  },
  nvidiaH200: {
    label: 'NVIDIA H200 specs',
    url: 'https://www.nvidia.com/en-sg/data-center/h200/',
    note: 'FP16 uses the dense Tensor Core estimate for serving calculations.',
  },
  nvidiaH100: {
    label: 'NVIDIA H100 specs',
    url: 'https://www.nvidia.com/en-gb/data-center/h100/',
    note: 'FP16 uses the dense Tensor Core estimate for serving calculations.',
  },
  nvidiaL40s: {
    label: 'NVIDIA L40S specs',
    url: 'https://www.nvidia.com/en-in/data-center/l40s/',
  },
  nvidiaRtxBlackwell: {
    label: 'NVIDIA RTX Blackwell architecture specs',
    url: 'https://images.nvidia.com/aem-dam/Solutions/geforce/blackwell/nvidia-rtx-blackwell-gpu-architecture.pdf',
  },
  nvidiaRtxProBlackwell: {
    label: 'NVIDIA RTX PRO Blackwell architecture specs',
    url: 'https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/quadro-product-literature/pdf/NVIDIA-RTX-Blackwell-PRO-GPU-Architecture-v1_1.pdf',
  },
  nvidiaRtx6000Ada: {
    label: 'NVIDIA RTX 6000 Ada specs',
    url: 'https://www.nvidia.com/en-us/products/workstations/rtx-6000/',
  },
  amdMi300x: {
    label: 'AMD Instinct MI300X specs',
    url: 'https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html',
  },
  amdMi355x: {
    label: 'AMD Instinct MI355X product brief',
    url: 'https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/product-briefs/amd-instinct-mi355x-gpu-brochure.pdf',
  },
  amdR9700: {
    label: 'AMD Radeon AI PRO R9700 specs',
    url: 'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html',
  },
  techPowerUpNvidia: {
    label: 'TechPowerUp GPU Database, NVIDIA',
    url: 'https://www.techpowerup.com/gpu-specs/?mfgr=NVIDIA',
    note: 'Supplemental community-maintained GPU database. Cross-check against official vendor specs for final procurement.',
  },
  techPowerUpAmd: {
    label: 'TechPowerUp GPU Database, AMD',
    url: 'https://www.techpowerup.com/gpu-specs/?mfgr=AMD',
    note: 'Supplemental community-maintained GPU database. Some workstation/server entries may lag official vendor pages.',
  },
};

const gpuReleaseDates: Record<string, string> = {
  'NVIDIA B200 SXM 180G': '2024-03-18',
  'NVIDIA H200 SXM 141G': '2023-11-13',
  'NVIDIA H100 SXM 80G': '2022-03-22',
  'AMD MI355X 288G': '2025-06-12',
  'AMD MI300X 192G': '2023-12-06',
  'NVIDIA RTX PRO 6000 Blackwell 96G': '2025-03-18',
  'NVIDIA RTX 6000 Ada 48G': '2022-09-20',
  'NVIDIA L40S 48G': '2023-08-02',
  'AMD Radeon AI PRO R9700 32G': '2025-07-23',
  'NVIDIA H20 96G': '2023-11-13',
  'NVIDIA H800 80G': '2022-11-01',
  'NVIDIA A800 80G': '2022-11-01',
  'NVIDIA L20 48G': '2023-11-01',
  'NVIDIA A40 48G': '2020-10-05',
  'NVIDIA V100 32G': '2017-05-10',
  'NVIDIA RTX5090 32G': '2025-01-06',
  'NVIDIA RTX4090D 48G': '2023-12-28',
  'NVIDIA RTX4090D 24G': '2023-12-28',
  'NVIDIA RTX4090 48G': '2022-10-12',
  'NVIDIA RTX4090 24G': '2022-10-12',
  'AMD RX7900XTX 24G': '2022-12-13',
  'AMD RX9070XT 16G': '2025-03-06',
  'NVIDIA RTX4070TiS 16G': '2024-01-24',
  'NVIDIA RTX3090Ti 24G': '2022-03-29',
  'NVIDIA RTX3090 24G': '2020-09-24',
  'NVIDIA RTX3080Ti 20G': '2021-06-03',
  'NVIDIA RTX2080Ti 22G': '2018-09-20',
  'NVIDIA RTX2080Ti 11G': '2018-09-20',
  'NVIDIA GTX1080Ti 11G*': '2017-03-10',
  'AMD R8060S 48G*': '2024-01-08',
  'AMD R8050S 48G*': '2024-01-08',
  'AMD R780M 8G*': '2023-01-04',
};

const baseGpuCards: GPUCard[] = [
  { name: 'NVIDIA B200 SXM 180G', vramGb: 180, memoryBandwidthGBs: 8000, processPower: { fp16: 2250, fp8: 4500 }, kvQuantType: 'fp8', architecture: 'Blackwell', source: sources.nvidiaDgxB200, sources: [sources.nvidiaDgxB200, sources.techPowerUpNvidia] },
  { name: 'NVIDIA H200 SXM 141G', vramGb: 141, memoryBandwidthGBs: 4800, processPower: { fp16: 989, fp8: 1979 }, kvQuantType: 'fp8', architecture: 'Hopper', source: sources.nvidiaH200, sources: [sources.nvidiaH200, sources.techPowerUpNvidia] },
  { name: 'NVIDIA H100 SXM 80G', vramGb: 80, memoryBandwidthGBs: 3350, processPower: { fp16: 989, fp8: 1979 }, kvQuantType: 'fp8', architecture: 'Hopper', source: sources.nvidiaH100, sources: [sources.nvidiaH100, sources.techPowerUpNvidia] },
  { name: 'AMD MI355X 288G', vramGb: 288, memoryBandwidthGBs: 8000, processPower: { fp16: 2516.6, fp8: 5033.2 }, kvQuantType: 'fp8', architecture: 'CDNA4', source: sources.amdMi355x, sources: [sources.amdMi355x, sources.techPowerUpAmd] },
  { name: 'AMD MI300X 192G', vramGb: 192, memoryBandwidthGBs: 5300, processPower: { fp16: 1307.4, fp8: 2614.8 }, kvQuantType: 'fp8', architecture: 'CDNA3', source: sources.amdMi300x, sources: [sources.amdMi300x, sources.techPowerUpAmd] },
  { name: 'NVIDIA RTX PRO 6000 Blackwell 96G', vramGb: 96, memoryBandwidthGBs: 1792, processPower: { fp16: 126.0 }, kvQuantType: 'fp8', architecture: 'Blackwell', cores: 24064, source: sources.nvidiaRtxProBlackwell, sources: [sources.nvidiaRtxProBlackwell, sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX 6000 Ada 48G', vramGb: 48, memoryBandwidthGBs: 960, processPower: { fp16: 91.1 }, kvQuantType: 'fp8', architecture: 'Ada', cores: 18176, source: sources.nvidiaRtx6000Ada, sources: [sources.nvidiaRtx6000Ada, sources.techPowerUpNvidia] },
  { name: 'NVIDIA L40S 48G', vramGb: 48, memoryBandwidthGBs: 864.0, processPower: { fp16: 91.6 }, kvQuantType: 'fp8', architecture: 'Ada', cores: 18176, source: sources.nvidiaL40s, sources: [sources.nvidiaL40s, sources.techPowerUpNvidia] },
  { name: 'AMD Radeon AI PRO R9700 32G', vramGb: 32, memoryBandwidthGBs: 640.0, processPower: { fp16: 96.0 }, kvQuantType: 'fp8', architecture: 'RDNA4', source: sources.amdR9700, sources: [sources.amdR9700, sources.techPowerUpAmd] },

  { name: 'NVIDIA H20 96G', vramGb: 96, memoryBandwidthGBs: 4096.0, processPower: { fp16: 148.0 }, kvQuantType: 'fp8', architecture: 'Hopper', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA H800 80G', vramGb: 80, memoryBandwidthGBs: 2048.0, processPower: { fp16: 204.9 }, kvQuantType: 'fp8', architecture: 'Hopper', cores: 16896, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA A800 80G', vramGb: 80, memoryBandwidthGBs: 1940.0, processPower: { fp16: 78.0 }, kvQuantType: 'fp8', architecture: 'Ampere', cores: 6912, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA L20 48G', vramGb: 48, memoryBandwidthGBs: 864.0, processPower: { fp16: 59.4 }, kvQuantType: 'fp8', architecture: 'Ada', cores: 10752, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA A40 48G', vramGb: 48, memoryBandwidthGBs: 695.8, processPower: { fp16: 37.4 }, kvQuantType: 'fp8', architecture: 'Ampere', cores: 10752, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA V100 32G', vramGb: 32, memoryBandwidthGBs: 897.0, processPower: { fp16: 28.3 }, kvQuantType: 'fp16', architecture: 'Volta', cores: 5120, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX5090 32G', vramGb: 32, memoryBandwidthGBs: 1792.0, processPower: { fp16: 104.8 }, kvQuantType: 'fp8', architecture: 'Blackwell', cores: 21760, source: sources.nvidiaRtxBlackwell, sources: [sources.nvidiaRtxBlackwell, sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX4090D 48G', vramGb: 48, memoryBandwidthGBs: 1008.0, processPower: { fp16: 73.5 }, kvQuantType: 'fp8', architecture: 'Ada', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX4090D 24G', vramGb: 24, memoryBandwidthGBs: 1008.0, processPower: { fp16: 73.5 }, kvQuantType: 'fp8', architecture: 'Ada', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX4090 48G', vramGb: 48, memoryBandwidthGBs: 1008, processPower: { fp16: 82.6 }, kvQuantType: 'fp8', architecture: 'Ada', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX4090 24G', vramGb: 24, memoryBandwidthGBs: 1008, processPower: { fp16: 82.6 }, kvQuantType: 'fp8', architecture: 'Ada', sources: [sources.techPowerUpNvidia] },
  { name: 'AMD RX7900XTX 24G', vramGb: 24, memoryBandwidthGBs: 960.0, processPower: { fp16: 61.4 }, kvQuantType: 'fp8', architecture: 'RDNA3', cores: 6144, sources: [sources.techPowerUpAmd] },
  { name: 'AMD RX9070XT 16G', vramGb: 16, memoryBandwidthGBs: 644.6, processPower: { fp16: 48.7 }, kvQuantType: 'fp8', architecture: 'RDNA4', sources: [sources.techPowerUpAmd] },
  { name: 'NVIDIA RTX4070TiS 16G', vramGb: 16, memoryBandwidthGBs: 672.3, processPower: { fp16: 44.1 }, kvQuantType: 'fp8', architecture: 'Ada', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX3090Ti 24G', vramGb: 24, memoryBandwidthGBs: 1008.0, processPower: { fp16: 40.0 }, kvQuantType: 'fp8', architecture: 'Ampere', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX3090 24G', vramGb: 24, memoryBandwidthGBs: 936.2, processPower: { fp16: 35.6 }, kvQuantType: 'fp8', architecture: 'Ampere', cores: 10496, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX3080Ti 20G', vramGb: 20, memoryBandwidthGBs: 760.3, processPower: { fp16: 34.1 }, kvQuantType: 'fp8', architecture: 'Ampere', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX2080Ti 22G', vramGb: 22, memoryBandwidthGBs: 616.0, processPower: { fp16: 26.9 }, kvQuantType: 'fp16', architecture: 'Turing', sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA RTX2080Ti 11G', vramGb: 11, memoryBandwidthGBs: 616.0, processPower: { fp16: 26.9 }, kvQuantType: 'fp16', architecture: 'Turing', cores: 4352, sources: [sources.techPowerUpNvidia] },
  { name: 'NVIDIA GTX1080Ti 11G*', vramGb: 11, memoryBandwidthGBs: 484.4, processPower: { fp32: 11.34, fp16: 11.34 }, kvQuantType: 'fp32', architecture: 'Pascal', cores: 3584, sources: [sources.techPowerUpNvidia] },
  { name: 'AMD R8060S 48G*', vramGb: 48, memoryBandwidthGBs: 240.0, processPower: { fp16: 23.9 }, kvQuantType: 'fp8', architecture: 'RDNA3', sources: [sources.techPowerUpAmd] },
  { name: 'AMD R8050S 48G*', vramGb: 48, memoryBandwidthGBs: 240.0, processPower: { fp16: 19.1 }, kvQuantType: 'fp8', architecture: 'RDNA3', sources: [sources.techPowerUpAmd] },
  { name: 'AMD R780M 8G*', vramGb: 8, memoryBandwidthGBs: 89.6, processPower: { fp16: 16.6 }, kvQuantType: 'fp8', architecture: 'RDNA3', sources: [sources.techPowerUpAmd] },
];

export const gpuCards: GPUCard[] = baseGpuCards.map((gpu) => ({
  ...gpu,
  releaseDate: gpu.releaseDate ?? gpuReleaseDates[gpu.name],
}));
