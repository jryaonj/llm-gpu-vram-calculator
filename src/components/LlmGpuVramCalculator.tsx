import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Columns2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Gauge,
  HardDrive,
  Info,
  Languages,
  Layers,
  List,
  Search,
  Server,
  Settings,
  SlidersHorizontal,
  Users,
  Zap,
} from 'lucide-react';

import type { CalcResults, GPUCard, KvQuantType, ModelDef, ReferenceLink, RuntimeQuantType } from '../types/index.ts';
import { gpuCards } from '../data/gpuCards.ts';
import { modelDefs } from '../data/modelDefs.ts';

type CalculatorTab = 'results' | 'formulas' | 'model' | 'hardware' | 'hints';
type ModelPickerMode = 'catalog' | 'structured' | 'custom';
type GpuPickerMode = 'catalog' | 'numeric';
type VendorFilter = 'All' | 'NVIDIA' | 'AMD';
type EntryMode = 'guided' | 'detailed' | 'theory';
type DetailLayoutMode = 'auto' | 'manual';
type DetailLayoutRatio = '25-75' | '33-67' | '50-50' | '67-33' | '75-25';
type DetailConfigSection = 'summary' | 'model' | 'hardware' | 'deployment';
type GuideStep = 1 | 2 | 3 | 4;
type GuideCompletedStep = 0 | 1 | 2 | 3;
type GuideModelStage = 'family' | 'variant' | 'scale' | 'review';
type GuideGpuStage = 'vendor' | 'class' | 'card' | 'review';
type GuideRuntimeStage = 'preset' | 'weights' | 'kv' | 'workload';
type GpuClassFilter = 'Datacenter' | 'Workstation' | 'Consumer';
type HintTone = 'critical' | 'warning' | 'info' | 'good';
type SupportStatus = 'Supported' | 'Partial' | 'Unsupported' | 'Check';
type Locale = 'en_US' | 'zh_CN';

interface ModelMeta {
  family: string;
  variant: string;
  scale: string;
}

interface GuidanceHint {
  title: string;
  body: string;
  impact?: string;
  tone: HintTone;
  sources: ReferenceLink[];
}

interface SupportRow {
  label: string;
  status: SupportStatus;
  note: string;
  sources: ReferenceLink[];
}

interface FormulaVariable {
  name: string;
  value: string;
  description: string;
}

interface DraftNumberInputProps {
  className?: string;
  integer?: boolean;
  max?: number;
  min: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}

interface DetailLayoutOption {
  id: DetailLayoutRatio;
  label: string;
  params: number;
  workspace: number;
  className: string;
}

interface LLMVRAMCalculatorProps {
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

const translations = {
  en_US: {
    language: 'Language',
    english: 'English',
    chinese: 'Chinese',
    exportCurrent: 'Export Metrics',
    exportModels: 'Export Models',
    exportHardware: 'Export Hardware',
    selectedModel: 'Selected model',
    selectedHardware: 'Selected hardware',
    vramEstimate: 'VRAM estimate',
    throughput: 'Throughput',
    none: 'None',
    blocked: 'Blocked',
    adjustHardware: 'Adjust hardware or memory budget',
    aggregateGeneration: 'Aggregate generation bound',
    installedMemory: 'installed memory',
    guidedSetup: 'Guided Setup',
    detailedControls: 'Detailed Controls',
    theory: 'Theory',
    guidedReady: 'Guided calculation ready',
    reopenGuide: 'Reopen guide',
    dismiss: 'Dismiss',
    guidedIntroTitle: 'Guided Setup',
    guidedIntroDesc: 'Search directly, or use staged choices. Detailed controls stay one click away.',
    chooseModel: 'Choose model',
    chooseModelSubtitle: 'Start with family, then type, then scale. Search and detailed choice are optional shortcuts.',
    model: 'Model',
    type: 'Type',
    params: 'Params',
    active: 'active',
    searchModelPlaceholder: 'Type to search a model directly',
    detailedChoice: 'Detailed choice',
    released: 'Released',
    family: 'Family',
    scale: 'Scale',
    review: 'Review',
    modelSubstep1: 'Model substep 1',
    chooseModelFamily: 'Choose model family',
    modelSubstep2Type: 'Model substep 2: type',
    modelSubstep3Scale: 'Model substep 3: scale',
    options: 'options',
    combinationResult: 'Combination result',
    detailedModelChoice: 'Detailed model choice',
    totalParamsB: 'Total Params (B)',
    activeParamsB: 'Active Params (B)',
    layers: 'Layers',
    chooseScaleHint: 'Choose a scale or search result to move to hardware.',
    chooseHardware: 'Choose GPU hardware',
    chooseHardwareSubtitle: 'Start with vendor, then hardware class, then the accelerator card.',
    gpu: 'GPU',
    vram: 'VRAM',
    bandwidth: 'Bandwidth',
    lockedModelFirst: 'Complete the model choice to unlock hardware selection.',
    readyHardware: 'Ready for hardware selection.',
    searchGpuPlaceholder: 'Type to search a GPU directly',
    vendor: 'Vendor',
    class: 'Class',
    card: 'Card',
    hardwareSubstep2Class: 'Hardware substep 2: class',
    hardwareSubstep3Card: 'Hardware substep 3: card',
    detailedHardwareChoice: 'Detailed hardware choice',
    supplier: 'Supplier',
    architecture: 'Architecture',
    memoryBw: 'Memory BW (GB/s)',
    back: 'Back',
    chooseGpuHint: 'Choose a GPU card to move to parameters.',
    perfParams: 'Performance estimation parameters',
    perfParamsSubtitle: 'Pick an estimation preset first, then adjust precision, context, concurrency, and guard rails.',
    lockedHardwareFirst: 'Choose GPU hardware before tuning runtime assumptions.',
    readyPerf: 'Ready for performance parameters.',
    weights: 'Weights',
    kvCache: 'KV cache',
    context: 'Context',
    users: 'users',
    gpuUnit: 'GPU',
    preset: 'Preset',
    startPoint: 'Start point',
    workload: 'Workload',
    estimationPreset: 'Estimation preset',
    balanced: 'Balanced',
    balancedDesc: 'INT4 weights, FP8 KV, normal reserve',
    memorySaver: 'Memory saver',
    memorySaverDesc: 'Aggressive capacity margin',
    throughputProbe: 'Throughput probe',
    throughputProbeDesc: 'FP8 weights with safer KV',
    longContext: 'Long context',
    longContextDesc: 'Raises context floor to 32K',
    weightQuantization: 'Weight Quantization',
    kvCachePrecision: 'KV Cache Precision',
    concurrentUsers: 'Concurrent Users',
    parallelGpus: 'Parallel GPUs',
    maxContextLength: 'Max Context Length',
    reserveVramGb: 'Reserve VRAM (GB)',
    currentPerfAssumptions: 'Current performance assumptions',
    memoryPolicy: 'Memory policy',
    parallelism: 'Parallelism',
    stepsComplete: 'Step 1-2-3 complete',
    readyToCompute: 'Ready to compute',
    readyToComputeDesc: 'Model, GPU hardware, and runtime assumptions are set.',
    computeFinalResult: 'Compute final result',
    setupSummary: 'Setup summary',
    nextAction: 'Next action',
    nextActionModel: 'Choose a model scale or direct search result. The next step opens automatically.',
    nextActionHardware: 'Choose a GPU card. Runtime parameters open automatically after the card is selected.',
    nextActionRuntime: 'Tune assumptions, then compute once at the final step.',
    nextActionDone: 'The final result is open in Detailed Controls.',
    focusLayout: 'Focus layout',
    paramsLabel: 'Params',
    workspaceLabel: 'Workspace',
    auto: 'Auto',
    manual: 'Manual',
    shrinkParamPanel: 'Shrink parameter panel',
    expandParamPanel: 'Expand parameter panel',
    setupControls: 'Setup controls',
    selectedConfiguration: 'Selected configuration',
    editingConfiguration: 'Editing configuration',
    done: 'Done',
    hardware: 'Hardware',
    deployment: 'Deployment',
    noModelSelected: 'No model selected',
    customGpu: 'Custom GPU',
    modelPanelDesc: 'Choose from catalog, compose by family, or enter custom values',
    catalog: 'Catalog',
    structured: 'Structured',
    custom: 'Custom',
    searchModelDetailedPlaceholder: 'Search model, family, scale',
    viewModelDetails: 'View model details',
    modelSizeGb: 'Model Size (GB)',
    kvHeads: 'KV Heads',
    headDim: 'Head Dim',
    kvSizeKbToken: 'KV Size (KB/Token)',
    reset: 'Reset',
    hardwarePanelDesc: 'Pick a GPU catalog item or enter supplier numeric specs',
    numeric: 'Numeric',
    searchGpuDetailedPlaceholder: 'Search GPU, architecture, class',
    defaultKvQuant: 'Default KV Quant',
    deploymentPanelDesc: 'Concurrency, context, and memory guard rails',
    vramUtilization: 'VRAM Utilization',
    reserveVram: 'Reserve VRAM',
    sliderMax: 'Slider max',
    workspace: 'Workspace',
    workspaceDesc: 'Calculation output, equations, model facts, hardware facts, and marginal hints',
    results: 'Results',
    formulas: 'Formulas',
    hints: 'Hints',
    estimatorViews: 'Estimator views',
    guidedResultReadyDesc: 'Estimated {total} GB VRAM, {usable} GB usable budget.',
    configurationIssue: 'Configuration Issue',
    totalVramRequired: 'Total VRAM Required',
    usableAfterReserve: 'GB usable after reserve',
    awaitingConfiguration: 'Awaiting configuration',
    installedGpuMemory: 'of installed GPU memory',
    modelWeights: 'Model weights',
    kvCacheRequest: 'KV cache / request',
    reserve: 'Reserve',
    utilizationCap: 'utilization cap',
    generation: 'Generation',
    prompt: 'Prompt',
    capacity: 'Capacity',
    fullSequences: 'Full sequences',
    tokenBudget: 'Token budget',
    totalParams: 'Total params',
    activeParams: 'Active params',
    nativeContext: 'Native context',
    customValue: 'Custom',
    attentionKv: 'Attention / KV',
    hiddenSize: 'Hidden size',
    kvBytesValue: 'KV bytes/value',
    modelSources: 'Model Sources',
    noExternalSource: 'No external source is attached to this custom entry.',
    noGpuSelected: 'No GPU selected',
    vramPerGpu: 'VRAM / GPU',
    totalVram: 'Total VRAM',
    runtimeDefaults: 'Runtime Defaults',
    kvQuant: 'KV quant',
    gpuCount: 'GPU count',
    utilization: 'Utilization',
    hardwareSources: 'Hardware Sources',
    weightMargin: 'Weight margin',
    savedVsFp16Weights: 'Saved vs FP16 weights',
    kvMargin: 'KV margin',
    savedVsFp16Kv: 'Saved vs FP16 KV',
    extraVsFp16Kv: 'Extra vs FP16 KV',
    backendRisk: 'Backend risk',
    clean: 'Clean',
    blocker: 'blocker',
    blockers: 'blockers',
    check: 'check',
    checks: 'checks',
    supported: 'Supported',
    partial: 'Partial',
    unsupported: 'Unsupported',
    supportMatrix: 'Selection Support Matrix',
    supportMatrixDesc: 'Capacity estimates are local math; support status follows current vLLM/NVIDIA notes.',
    supplementSources: 'Supplement Sources',
    capacityComposition: 'Capacity Composition',
    usable: 'usable',
    kvBudget: 'KV Budget',
    equation: 'Equation',
    variables: 'Variables',
    currentSubstitution: 'Current substitution',
    result: 'Result',
  },
  zh_CN: {
    language: '语言',
    english: '英文',
    chinese: '中文',
    exportCurrent: '导出指标',
    exportModels: '导出模型',
    exportHardware: '导出硬件',
    selectedModel: '已选模型',
    selectedHardware: '已选硬件',
    vramEstimate: '显存估算',
    throughput: '吞吐量',
    none: '无',
    blocked: '受阻',
    adjustHardware: '调整硬件或显存预算',
    aggregateGeneration: '整体生成瓶颈估算',
    installedMemory: '已安装显存',
    guidedSetup: '引导设置',
    detailedControls: '详细控制',
    theory: '理论',
    guidedReady: '引导计算已就绪',
    reopenGuide: '重新打开引导',
    dismiss: '关闭',
    guidedIntroTitle: '引导式配置',
    guidedIntroDesc: '可直接搜索，也可按步骤选择；详细控制始终可以一键打开。',
    chooseModel: '选择模型',
    chooseModelSubtitle: '先选模型家族，再选类型和规模；搜索与详细选择是快捷入口。',
    model: '模型',
    type: '类型',
    params: '参数',
    active: '激活',
    searchModelPlaceholder: '直接输入搜索模型',
    detailedChoice: '详细选择',
    released: '发布日期',
    family: '家族',
    scale: '规模',
    review: '确认',
    modelSubstep1: '模型子步骤 1',
    chooseModelFamily: '选择模型家族',
    modelSubstep2Type: '模型子步骤 2：类型',
    modelSubstep3Scale: '模型子步骤 3：规模',
    options: '个选项',
    combinationResult: '组合结果',
    detailedModelChoice: '详细模型选择',
    totalParamsB: '总参数量 (B)',
    activeParamsB: '激活参数量 (B)',
    layers: '层数',
    chooseScaleHint: '选择规模或搜索结果后会进入硬件步骤。',
    chooseHardware: '选择 GPU 硬件',
    chooseHardwareSubtitle: '先选供应商，再选硬件类别，最后选择具体加速卡。',
    gpu: 'GPU',
    vram: '显存',
    bandwidth: '带宽',
    lockedModelFirst: '完成模型选择后才能选择硬件。',
    readyHardware: '可以开始选择硬件。',
    searchGpuPlaceholder: '直接输入搜索 GPU',
    vendor: '供应商',
    class: '类别',
    card: '显卡',
    hardwareSubstep2Class: '硬件子步骤 2：类别',
    hardwareSubstep3Card: '硬件子步骤 3：显卡',
    detailedHardwareChoice: '详细硬件选择',
    supplier: '供应商',
    architecture: '架构',
    memoryBw: '显存带宽 (GB/s)',
    back: '返回',
    chooseGpuHint: '选择 GPU 后会进入参数步骤。',
    perfParams: '性能估算参数',
    perfParamsSubtitle: '先选估算预设，再调整精度、上下文、并发和安全余量。',
    lockedHardwareFirst: '选择 GPU 硬件后才能调整运行时假设。',
    readyPerf: '可以开始配置性能参数。',
    weights: '权重',
    kvCache: 'KV 缓存',
    context: '上下文',
    users: '用户',
    gpuUnit: 'GPU',
    preset: '预设',
    startPoint: '起点',
    workload: '工作负载',
    estimationPreset: '估算预设',
    balanced: '均衡',
    balancedDesc: 'INT4 权重、FP8 KV、常规预留',
    memorySaver: '节省显存',
    memorySaverDesc: '更激进的容量余量',
    throughputProbe: '吞吐探测',
    throughputProbeDesc: 'FP8 权重与更稳妥的 KV',
    longContext: '长上下文',
    longContextDesc: '将上下文下限提高到 32K',
    weightQuantization: '权重量化',
    kvCachePrecision: 'KV 缓存精度',
    concurrentUsers: '并发用户',
    parallelGpus: '并行 GPU',
    maxContextLength: '最大上下文长度',
    reserveVramGb: '预留显存 (GB)',
    currentPerfAssumptions: '当前性能假设',
    memoryPolicy: '显存策略',
    parallelism: '并行度',
    stepsComplete: '步骤 1-2-3 已完成',
    readyToCompute: '可以计算',
    readyToComputeDesc: '模型、GPU 硬件和运行时假设都已设置。',
    computeFinalResult: '计算最终结果',
    setupSummary: '配置摘要',
    nextAction: '下一步',
    nextActionModel: '选择模型规模或搜索结果，下一步会自动打开。',
    nextActionHardware: '选择 GPU，随后会自动打开运行时参数。',
    nextActionRuntime: '调整假设，然后在最后一步统一计算。',
    nextActionDone: '最终结果已在详细控制中打开。',
    focusLayout: '焦点布局',
    paramsLabel: '参数区',
    workspaceLabel: '工作区',
    auto: '自动',
    manual: '手动',
    shrinkParamPanel: '缩小参数面板',
    expandParamPanel: '展开参数面板',
    setupControls: '配置控制',
    selectedConfiguration: '已选配置',
    editingConfiguration: '正在编辑配置',
    done: '完成',
    hardware: '硬件',
    deployment: '部署',
    noModelSelected: '未选择模型',
    customGpu: '自定义 GPU',
    modelPanelDesc: '从目录选择、按家族组合，或输入自定义数值',
    catalog: '目录',
    structured: '结构化',
    custom: '自定义',
    searchModelDetailedPlaceholder: '搜索模型、家族、规模',
    viewModelDetails: '查看模型详情',
    modelSizeGb: '模型大小 (GB)',
    kvHeads: 'KV 头数',
    headDim: 'Head 维度',
    kvSizeKbToken: 'KV 大小 (KB/Token)',
    reset: '重置',
    hardwarePanelDesc: '从 GPU 目录选择，或输入供应商数值规格',
    numeric: '数值',
    searchGpuDetailedPlaceholder: '搜索 GPU、架构、类别',
    defaultKvQuant: '默认 KV 量化',
    deploymentPanelDesc: '并发、上下文和显存安全余量',
    vramUtilization: '显存利用率',
    reserveVram: '预留显存',
    sliderMax: '滑条上限',
    workspace: '工作区',
    workspaceDesc: '计算结果、公式、模型信息、硬件信息和边际提示',
    results: '结果',
    formulas: '公式',
    hints: '提示',
    estimatorViews: '估算视图',
    guidedResultReadyDesc: '估算总显存 {total} GB，可用预算 {usable} GB。',
    configurationIssue: '配置问题',
    totalVramRequired: '总显存需求',
    usableAfterReserve: 'GB 预留后可用',
    awaitingConfiguration: '等待配置',
    installedGpuMemory: '占已安装 GPU 显存',
    modelWeights: '模型权重',
    kvCacheRequest: '每请求 KV 缓存',
    reserve: '预留',
    utilizationCap: '利用率上限',
    generation: '生成',
    prompt: '预填充',
    capacity: '容量',
    fullSequences: '完整序列',
    tokenBudget: 'Token 预算',
    totalParams: '总参数量',
    activeParams: '激活参数量',
    nativeContext: '原生上下文',
    customValue: '自定义',
    attentionKv: '注意力 / KV',
    hiddenSize: '隐藏维度',
    kvBytesValue: '每个 KV 值字节数',
    modelSources: '模型来源',
    noExternalSource: '该自定义条目没有绑定外部来源。',
    noGpuSelected: '未选择 GPU',
    vramPerGpu: '单卡显存',
    totalVram: '总显存',
    runtimeDefaults: '运行时默认值',
    kvQuant: 'KV 量化',
    gpuCount: 'GPU 数量',
    utilization: '利用率',
    hardwareSources: '硬件来源',
    weightMargin: '权重边际',
    savedVsFp16Weights: '相对 FP16 权重节省',
    kvMargin: 'KV 边际',
    savedVsFp16Kv: '相对 FP16 KV 节省',
    extraVsFp16Kv: '相对 FP16 KV 额外占用',
    backendRisk: '后端风险',
    clean: '无明显风险',
    blocker: '个阻断',
    blockers: '个阻断',
    check: '项需确认',
    checks: '项需确认',
    supported: '支持',
    partial: '部分支持',
    unsupported: '不支持',
    supportMatrix: '选择支持矩阵',
    supportMatrixDesc: '容量估算来自本地公式；支持状态参考当前 vLLM/NVIDIA 说明。',
    supplementSources: '补充来源',
    capacityComposition: '容量构成',
    usable: '可用',
    kvBudget: 'KV 预算',
    equation: '公式',
    variables: '变量',
    currentSubstitution: '当前代入',
    result: '结果',
  },
} as const;

type TranslationKey = keyof typeof translations.en_US;

const quantBytes: Record<RuntimeQuantType, number> = {
  fp16: 2,
  fp8: 1,
  int8: 1,
  int4: 0.5,
};

const kvQuantBytes: Record<KvQuantType, number> = {
  fp32: 4,
  fp16: 2,
  fp8: 1,
  int8: 1,
  int4: 0.5,
};

const runtimeQuantOptions: Array<{ value: RuntimeQuantType; label: string; desc: string }> = [
  { value: 'int4', label: 'INT4', desc: 'AWQ/GPTQ' },
  { value: 'int8', label: 'INT8', desc: 'Balanced' },
  { value: 'fp8', label: 'FP8', desc: 'High perf' },
  { value: 'fp16', label: 'FP16', desc: 'Full precision' },
];

const kvQuantOptions: Array<{ value: KvQuantType; label: string; desc: string }> = [
  { value: 'fp16', label: 'FP16', desc: 'Baseline quality' },
  { value: 'fp8', label: 'FP8', desc: 'vLLM stable path' },
  { value: 'int8', label: 'INT8', desc: 'Engine-specific' },
  { value: 'int4', label: 'INT4', desc: 'Aggressive/research' },
  { value: 'fp32', label: 'FP32', desc: 'Fallback/debug' },
];

const customSuppliers = ['NVIDIA', 'AMD', 'Intel', 'Other'];
const customArchitectures = ['Blackwell', 'Hopper', 'Ada', 'Ampere', 'CDNA4', 'CDNA3', 'RDNA4', 'RDNA3', 'Custom'];
const detailLayoutOptions: DetailLayoutOption[] = [
  { id: '25-75', label: '25:75', params: 25, workspace: 75, className: 'xl:grid-cols-[minmax(280px,0.25fr)_minmax(0,0.75fr)]' },
  { id: '33-67', label: '33:67', params: 33, workspace: 67, className: 'xl:grid-cols-[minmax(320px,0.33fr)_minmax(0,0.67fr)]' },
  { id: '50-50', label: '50:50', params: 50, workspace: 50, className: 'xl:grid-cols-[minmax(0,0.5fr)_minmax(0,0.5fr)]' },
  { id: '67-33', label: '67:33', params: 67, workspace: 33, className: 'xl:grid-cols-[minmax(0,0.67fr)_minmax(320px,0.33fr)]' },
  { id: '75-25', label: '75:25', params: 75, workspace: 25, className: 'xl:grid-cols-[minmax(0,0.75fr)_minmax(280px,0.25fr)]' },
];
const detailLayoutOrder = detailLayoutOptions.map((option) => option.id);

const guidanceSources = {
  vllmQuantization: {
    label: 'vLLM quantization hardware matrix',
    url: 'https://docs.vllm.ai/en/stable/features/quantization/',
    note: 'Official support matrix for AWQ, GPTQ, INT8, FP8, Marlin, GGUF, and hardware generations.',
  },
  vllmKvCache: {
    label: 'vLLM quantized KV cache docs',
    url: 'https://docs.vllm.ai/en/stable/features/quantization/quantized_kvcache/',
    note: 'Official vLLM KV-cache dtype options, FP8 calibration paths, and per-head scale notes.',
  },
  vllmFp8KvBlog: {
    label: 'vLLM FP8 KV-cache validation blog',
    url: 'https://vllm.ai/blog/2026-04-22-fp8-kvcache',
    note: 'Recent Hopper and Blackwell validation, including long-context accuracy and head-dimension caveats.',
  },
  nvidiaTensorCores: {
    label: 'NVIDIA Tensor Core precision overview',
    url: 'https://www.nvidia.com/en-eu/data-center/tensorcore/',
    note: 'Vendor overview of Volta/Turing/Ampere Tensor Core precision support and Pascal comparison.',
  },
  nvidiaCudaThroughput: {
    label: 'CUDA Programming Guide native arithmetic throughput',
    url: 'https://docs.nvidia.com/cuda/archive/10.1/pdf/CUDA_C_Programming_Guide.pdf',
    note: 'Official throughput table showing weak half-precision arithmetic on compute capability 6.1 devices.',
  },
  rooflineModel: {
    label: 'Roofline performance model',
    url: 'https://zenodo.org/records/1236156',
    note: 'Classic model connecting achievable performance to compute ceilings, memory bandwidth, and operational intensity.',
  },
};

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function atLeast(value: string, min: number, fallback: number): number {
  return Math.max(min, parseNumber(value, fallback));
}

function integerAtLeast(value: string, min: number, fallback: number): number {
  return Math.max(min, Math.round(parseNumber(value, fallback)));
}

function boundedPercent(value: string, fallback: number): number {
  return Math.min(100, Math.max(1, parseNumber(value, fallback)));
}

function clampNumber(value: number, min: number, max?: number): number {
  const upperBounded = typeof max === 'number' ? Math.min(max, value) : value;
  return Math.max(min, upperBounded);
}

function formatInputNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
}

function dynamicSliderMax(baseMax: number, currentValue: number, step: number): number {
  return Math.max(baseMax, Math.ceil(currentValue / step) * step);
}

function getDetailLayoutOption(id: DetailLayoutRatio): DetailLayoutOption {
  return detailLayoutOptions.find((option) => option.id === id) ?? detailLayoutOptions[2];
}

function autoDetailLayoutRatio(activeTab: CalculatorTab, modelMode: ModelPickerMode, gpuMode: GpuPickerMode): DetailLayoutRatio {
  if (activeTab === 'results') return '25-75';
  if (activeTab === 'formulas' || activeTab === 'hints') return '33-67';
  if (modelMode === 'custom' || gpuMode === 'numeric') return '67-33';
  return '50-50';
}

function shiftDetailLayoutRatio(current: DetailLayoutRatio, direction: -1 | 1): DetailLayoutRatio {
  const currentIndex = detailLayoutOrder.indexOf(current);
  const nextIndex = Math.min(detailLayoutOrder.length - 1, Math.max(0, currentIndex + direction));
  return detailLayoutOrder[nextIndex];
}

function estimateModelSizeGB(totalParamsB: number, quantType: RuntimeQuantType, awqGroup = 32): number {
  const quantOverheadBytes = quantType === 'int4' ? 3 / awqGroup : 0;
  const sizeGB = totalParamsB * (quantBytes[quantType] + quantOverheadBytes);
  return Math.round(sizeGB * 100) / 100;
}

function computeModelVramGB(model: ModelDef, quant: RuntimeQuantType): number {
  if (quant === model.quantType) return model.modelSizeGB;
  return estimateModelSizeGB(model.totalParamsB, quant, model.awqGroup ?? 32);
}

function computeKvCacheVramGB(maxLength: number, quant: KvQuantType, model: ModelDef): number {
  return (model.perKVsizeFp8 * kvQuantBytes[quant] * maxLength * 2) / (1024 ** 3);
}

function computeKvSizeFp8FromParams(layers: number, numKVHeads: number, headDim: number): number {
  return layers * numKVHeads * headDim;
}

function modelMeta(model: ModelDef): ModelMeta {
  const name = model.name;

  if (name.startsWith('DeepSeek-R1')) {
    return { family: 'DeepSeek R1', variant: 'Reasoning MoE', scale: name.replace(/^DeepSeek-R1-/, '') };
  }

  if (name.startsWith('DeepSeek-V4')) {
    return {
      family: 'DeepSeek V4',
      variant: name.includes('Pro') ? 'Pro MoE' : 'Flash MoE',
      scale: name.includes('Pro') ? '1.6T-A49B' : '284B-A13B',
    };
  }

  if (name.startsWith('DeepSeek-V3.1')) {
    return { family: 'DeepSeek V3.1', variant: 'Hybrid MoE', scale: '671B-A37B' };
  }

  if (name.startsWith('DeepSeek-V3')) {
    return { family: 'DeepSeek V3', variant: 'MoE', scale: name.replace(/^DeepSeek-V3-/, '671B-A37B ') };
  }

  if (name.startsWith('Gemma4')) {
    return {
      family: 'Gemma 4',
      variant: name.includes('-A') ? 'MoE' : 'Dense',
      scale: name.replace(/^Gemma4-/, ''),
    };
  }

  if (name.startsWith('Gemma3')) {
    return {
      family: 'Gemma 3',
      variant: 'Dense',
      scale: name.replace(/^Gemma3-/, ''),
    };
  }

  const family = name.startsWith('Qwen3.6') ? 'Qwen3.6' : name.startsWith('Qwen3.5') ? 'Qwen3.5' : 'Qwen3';
  const variant = name.includes('Coder')
    ? 'Coder'
    : name.includes('Next')
      ? 'Next'
      : name.includes('-A')
        ? 'MoE'
        : 'Dense';
  const scale = name
    .replace(/^Qwen3\.5-/, '')
    .replace(/^Qwen3\.6-/, '')
    .replace(/^Qwen3-/, '')
    .replace(/^Coder-/, '')
    .replace(/^Next-/, '')
    .replace(/-Instruct$/, '');

  return { family, variant, scale };
}

function getModelColor(name: string): string {
  if (name.startsWith('DeepSeek-R1')) return '#1d4ed8';
  if (name.startsWith('DeepSeek')) return '#0e7490';
  if (name.startsWith('Gemma4')) return '#a21caf';
  if (name.startsWith('Gemma3')) return '#be185d';
  if (name.includes('Coder')) return '#ea580c';
  if (name.includes('Next')) return '#2563eb';
  if (name.includes('Qwen3.6')) return '#0891b2';
  if (name.includes('Qwen3.5')) return '#0f766e';
  if (name.includes('-A')) return '#7c3aed';
  return '#4f46e5';
}

function getModelVariantColor(variant: string): string {
  if (variant === 'Reasoning MoE') return '#1d4ed8';
  if (variant === 'Pro MoE') return '#0369a1';
  if (variant === 'Flash MoE') return '#0891b2';
  if (variant === 'Hybrid MoE') return '#0e7490';
  if (variant === 'Coder') return '#ea580c';
  if (variant === 'Next') return '#2563eb';
  if (variant === 'MoE') return '#7c3aed';
  return '#4f46e5';
}

function getGpuVendor(name: string): VendorFilter | 'Other' {
  if (name.includes('NVIDIA')) return 'NVIDIA';
  if (name.includes('AMD')) return 'AMD';
  return 'Other';
}

function getVendorColor(vendor: VendorFilter | 'Intel' | 'Other'): string {
  if (vendor === 'NVIDIA') return '#76b900';
  if (vendor === 'AMD') return '#ed1c24';
  if (vendor === 'Intel') return '#0071c5';
  return '#64748b';
}

function getGpuColor(name: string): string {
  return getVendorColor(getGpuVendor(name));
}

function gpuClass(gpu: GPUCard): string {
  const name = gpu.name.toLowerCase();
  if (name.includes('b200') || name.includes('h200') || name.includes('h100') || name.includes('h20') || name.includes('h800') || name.includes('mi3')) {
    return 'Datacenter';
  }
  if (name.includes('rtx pro') || name.includes('rtx 6000') || name.includes('l40') || name.includes('l20') || name.includes('ai pro')) {
    return 'Workstation';
  }
  return 'Consumer';
}

function stripVendor(name: string): string {
  return name.replace(/^NVIDIA\s+/i, '').replace(/^AMD\s+/i, '').trim();
}

function inferArchitecture(gpu: GPUCard): string {
  if (gpu.architecture) return gpu.architecture;

  const n = gpu.name.toLowerCase();
  if (n.includes('b200') || n.includes('blackwell') || n.includes('5090')) return 'Blackwell';
  if (n.includes('h100') || n.includes('h200') || n.includes('h20') || n.includes('h800')) return 'Hopper';
  if (n.includes('l40') || n.includes('l20') || n.match(/rtx4/) || n.includes('ada')) return 'Ada';
  if (n.includes('a800') || n.includes('a40') || n.match(/rtx3/)) return 'Ampere';
  if (n.match(/rtx2/)) return 'Turing';
  if (n.includes('v100')) return 'Volta';
  if (n.includes('1080')) return 'Pascal';
  if (n.includes('mi355')) return 'CDNA4';
  if (n.includes('mi300')) return 'CDNA3';
  if (n.includes('rx9') || n.includes('r9700')) return 'RDNA4';
  if (n.includes('rx7') || n.includes('r7')) return 'RDNA3';
  return 'Unknown';
}

function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return value.toLocaleString();
}

function formatNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function formatReleaseDate(date?: string): string {
  if (!date) return 'Unknown';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function sourceList(primary?: ReferenceLink, extra?: ReferenceLink[]): ReferenceLink[] {
  const seen = new Set<string>();
  return [primary, ...(extra ?? [])].filter((source): source is ReferenceLink => {
    if (!source || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function mergeSources(...groups: Array<ReferenceLink[] | undefined>): ReferenceLink[] {
  return sourceList(undefined, groups.flatMap((group) => group ?? []));
}

type CsvCell = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvCell>;

function csvEscape(value: CsvCell): string {
  const text = value === null || typeof value === 'undefined' ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sourceSummary(primary?: ReferenceLink, extra?: ReferenceLink[]): string {
  return sourceList(primary, extra).map((source) => `${source.label}: ${source.url}`).join(' | ');
}

function sourceNoteSummary(primary?: ReferenceLink, extra?: ReferenceLink[]): string {
  return sourceList(primary, extra).map((source) => source.note).filter(Boolean).join(' | ');
}

function downloadCsv(filename: string, rows: CsvRow[]) {
  if (rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const lines = [
    columns.map(csvEscape).join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ];
  const blob = new Blob([`${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function hardwareVendor(gpu?: GPUCard | null): VendorFilter | 'Intel' | 'Other' {
  if (!gpu) return 'Other';
  if (gpu.name.includes('Intel')) return 'Intel';
  return getGpuVendor(gpu.name);
}

function isAmdArchitecture(architecture: string): boolean {
  return architecture.startsWith('CDNA') || architecture.startsWith('RDNA');
}

function isNvidiaArchitecture(architecture: string): boolean {
  return ['Pascal', 'Volta', 'Turing', 'Ampere', 'Ada', 'Hopper', 'Blackwell'].includes(architecture);
}

function selectedWeightSupport(gpu: GPUCard | null | undefined, quant: RuntimeQuantType): SupportRow {
  if (!gpu) {
    return {
      label: 'Weight quantization',
      status: 'Check',
      note: 'No hardware selected.',
      sources: [guidanceSources.vllmQuantization],
    };
  }

  const architecture = inferArchitecture(gpu);
  const vendor = hardwareVendor(gpu);

  if (quant === 'fp16') {
    if (architecture === 'Pascal') {
      return {
        label: 'FP16 weights',
        status: 'Partial',
        note: 'FP16 saves memory, but Pascal-class NVIDIA cards do not have the Tensor Core path that made FP16 inference fast on Volta and newer chips.',
        sources: [guidanceSources.nvidiaTensorCores, guidanceSources.nvidiaCudaThroughput],
      };
    }

    return {
      label: 'FP16 weights',
      status: 'Supported',
      note: 'Baseline model precision path; memory use is high, but backend quantization kernels are not required.',
      sources: [guidanceSources.nvidiaTensorCores],
    };
  }

  if (quant === 'fp8') {
    if (vendor === 'AMD' || isAmdArchitecture(architecture) || architecture === 'Ada' || architecture === 'Hopper') {
      return {
        label: 'FP8 W8A8 weights',
        status: 'Supported',
        note: 'vLLM lists FP8 W8A8 support for Ada, Hopper, and AMD GPU paths.',
        sources: [guidanceSources.vllmQuantization],
      };
    }

    if (architecture === 'Blackwell') {
      return {
        label: 'FP8 W8A8 weights',
        status: 'Partial',
        note: 'Blackwell is newer than the visible vLLM support table, but recent vLLM FP8 KV work validates Blackwell FP8 attention paths. Check the exact vLLM build.',
        sources: [guidanceSources.vllmQuantization, guidanceSources.vllmFp8KvBlog],
      };
    }

    return {
      label: 'FP8 W8A8 weights',
      status: 'Unsupported',
      note: `vLLM does not list FP8 W8A8 support for ${architecture} in its current hardware matrix.`,
      sources: [guidanceSources.vllmQuantization],
    };
  }

  if (quant === 'int8') {
    if (['Turing', 'Ampere', 'Ada', 'Hopper'].includes(architecture)) {
      return {
        label: 'INT8 W8A8 weights',
        status: 'Supported',
        note: `vLLM lists INT8 W8A8 support on ${architecture}.`,
        sources: [guidanceSources.vllmQuantization],
      };
    }

    if (architecture === 'Blackwell') {
      return {
        label: 'INT8 W8A8 weights',
        status: 'Partial',
        note: 'Blackwell should be validated against the active vLLM build because it is not represented in the published matrix excerpt.',
        sources: [guidanceSources.vllmQuantization],
      };
    }

    return {
      label: 'INT8 W8A8 weights',
      status: 'Unsupported',
      note: `vLLM does not list INT8 W8A8 support for ${vendor === 'AMD' ? 'AMD GPU' : architecture}.`,
      sources: [guidanceSources.vllmQuantization],
    };
  }

  if (vendor === 'AMD' || isAmdArchitecture(architecture)) {
    return {
      label: 'INT4 weights',
      status: 'Partial',
      note: 'The vLLM AWQ/GPTQ/Marlin rows do not list AMD GPU support; GGUF and AMD-specific quantization paths may still be viable depending on the engine.',
      sources: [guidanceSources.vllmQuantization],
    };
  }

  if (architecture === 'Volta') {
    return {
      label: 'INT4 weights',
      status: 'Partial',
      note: 'GPTQ is listed for Volta, but AWQ and Marlin are not. Choose the exact checkpoint format deliberately.',
      sources: [guidanceSources.vllmQuantization],
    };
  }

  if (['Turing', 'Ampere', 'Ada', 'Hopper'].includes(architecture)) {
    return {
      label: 'INT4 weights',
      status: 'Supported',
      note: 'AWQ/GPTQ-style INT4 is broadly supported in vLLM on this NVIDIA generation; Marlin support is strongest on Ampere and newer.',
      sources: [guidanceSources.vllmQuantization],
    };
  }

  if (architecture === 'Blackwell') {
    return {
      label: 'INT4 weights',
      status: 'Partial',
      note: 'Treat support as build-dependent because the current published vLLM matrix names generations through Hopper.',
      sources: [guidanceSources.vllmQuantization],
    };
  }

  return {
    label: 'INT4 weights',
    status: 'Check',
    note: 'No stable vLLM support claim is attached to this architecture in the calculator.',
    sources: [guidanceSources.vllmQuantization],
  };
}

function selectedKvSupport(gpu: GPUCard | null | undefined, kvQuant: KvQuantType, model?: ModelDef | null): SupportRow {
  if (!gpu) {
    return {
      label: 'KV cache dtype',
      status: 'Check',
      note: 'No hardware selected.',
      sources: [guidanceSources.vllmKvCache],
    };
  }

  const architecture = inferArchitecture(gpu);
  const vendor = hardwareVendor(gpu);

  if (kvQuant === 'fp16') {
    return {
      label: 'FP16 KV cache',
      status: 'Supported',
      note: 'Baseline KV cache precision; highest memory use among normal serving paths, but avoids KV quantization error.',
      sources: [guidanceSources.vllmKvCache],
    };
  }

  if (kvQuant === 'fp32') {
    return {
      label: 'FP32 KV cache',
      status: 'Partial',
      note: 'Useful as a conservative fallback/debug estimate, but it doubles KV memory versus FP16 and is rarely the practical serving target.',
      sources: [guidanceSources.vllmKvCache],
    };
  }

  if (kvQuant === 'fp8') {
    const headDimNote = (model?.headDim ?? 0) >= 256
      ? ' This selected model has 256-wide heads, where vLLM reported prefill regressions can still appear.'
      : '';

    if (architecture === 'Hopper' || architecture === 'Blackwell') {
      return {
        label: 'FP8 KV cache',
        status: 'Supported',
        note: `vLLM documents FP8 KV cache and recently validated Hopper/Blackwell long-context paths.${headDimNote}`,
        sources: [guidanceSources.vllmKvCache, guidanceSources.vllmFp8KvBlog],
      };
    }

    if (vendor === 'AMD' || architecture === 'Ada' || architecture === 'Ampere' || architecture === 'Turing' || architecture === 'Volta') {
      return {
        label: 'FP8 KV cache',
        status: 'Partial',
        note: `vLLM documents FP8 KV storage options, but the strongest recent performance and accuracy validation is on Hopper/Blackwell.${headDimNote}`,
        sources: [guidanceSources.vllmKvCache, guidanceSources.vllmFp8KvBlog],
      };
    }

    return {
      label: 'FP8 KV cache',
      status: 'Check',
      note: 'Check the runtime backend before assuming FP8 KV cache works or accelerates attention on this hardware.',
      sources: [guidanceSources.vllmKvCache],
    };
  }

  return {
    label: `${kvQuant.toUpperCase()} KV cache`,
    status: 'Unsupported',
    note: 'The stable vLLM KV-cache docs center on FP8 formats; INT8/INT4 KV-cache should be treated as engine-specific, experimental, or research unless your runtime explicitly supports it.',
    sources: [guidanceSources.vllmKvCache],
  };
}

function supportStatusClass(status: SupportStatus): string {
  if (status === 'Supported') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'Partial') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'Unsupported') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function localizeSupportLabel(label: string, locale: Locale): string {
  if (locale !== 'zh_CN') return label;

  const exact: Record<string, string> = {
    'Weight quantization': '权重量化',
    'FP16 weights': 'FP16 权重',
    'FP8 W8A8 weights': 'FP8 W8A8 权重',
    'INT8 W8A8 weights': 'INT8 W8A8 权重',
    'INT4 weights': 'INT4 权重',
    'KV cache dtype': 'KV 缓存 dtype',
    'FP16 KV cache': 'FP16 KV 缓存',
    'FP32 KV cache': 'FP32 KV 缓存',
    'FP8 KV cache': 'FP8 KV 缓存',
    'Aggressive KV below FP8': '低于 FP8 的激进 KV',
  };

  return exact[label] ?? label.replace('KV cache', 'KV 缓存').replace('weights', '权重');
}

function localizeSupportNote(row: SupportRow, locale: Locale): string {
  if (locale !== 'zh_CN') return row.note;
  if (row.note === 'No hardware selected.') return '未选择硬件。';

  if (row.label === 'Aggressive KV below FP8') {
    return row.status === 'Unsupported'
      ? '本计算器可以估算显存目标，但稳定 vLLM 文档没有把 INT4/INT8 KV 缓存作为常规服务路径。'
      : '当你在其他推理引擎或插件中试验低于 FP8 的 KV 缓存时，可把这一行作为风险提示。';
  }

  if (row.status === 'Supported') {
    return '该选择在当前参考资料中属于支持路径；真实部署仍应按具体运行时版本验证。';
  }

  if (row.status === 'Unsupported') {
    return '当前参考资料未把该组合列为稳定路径；容量可以估算，但不应默认它能直接运行。';
  }

  if (row.status === 'Partial') {
    return '该选择可能可用，但通常取决于硬件代际、checkpoint 格式、kernel 和运行时版本。';
  }

  return '该组合需要结合所用推理引擎、版本和插件进一步确认。';
}

function localizeSupportRow(row: SupportRow, locale: Locale): SupportRow {
  if (locale !== 'zh_CN') return row;
  return {
    ...row,
    label: localizeSupportLabel(row.label, locale),
    note: localizeSupportNote(row, locale),
  };
}

function hintToneClass(tone: HintTone): string {
  if (tone === 'critical') return 'border-red-200 bg-red-50';
  if (tone === 'warning') return 'border-amber-200 bg-amber-50';
  if (tone === 'good') return 'border-emerald-200 bg-emerald-50';
  return 'border-sky-200 bg-sky-50';
}

function hintIcon(tone: HintTone) {
  if (tone === 'good') return CheckCircle2;
  if (tone === 'info') return Info;
  return AlertTriangle;
}

function buildSupportRows(gpu: GPUCard | null | undefined, model: ModelDef | null | undefined, quant: RuntimeQuantType, kvQuant: KvQuantType): SupportRow[] {
  return [
    selectedWeightSupport(gpu, quant),
    selectedKvSupport(gpu, kvQuant, model),
    {
      label: 'Aggressive KV below FP8',
      status: kvQuant === 'int4' || kvQuant === 'int8' ? 'Unsupported' : 'Check',
      note: kvQuant === 'int4' || kvQuant === 'int8'
        ? 'This calculator can estimate the memory target, but stable vLLM docs do not expose INT4/INT8 KV-cache as the normal serving path.'
        : 'Use this row when experimenting with lower-than-FP8 KV cache in other engines or plugins.',
      sources: [guidanceSources.vllmKvCache],
    },
  ];
}

function buildGuidanceHints(
  model: ModelDef | null | undefined,
  gpu: GPUCard | null | undefined,
  quant: RuntimeQuantType,
  kvQuant: KvQuantType,
  results: CalcResults | null,
  maxLength: number,
  locale: Locale = 'en_US'
): GuidanceHint[] {
  const hints: GuidanceHint[] = [];
  if (!model || !gpu) return hints;

  const zh = locale === 'zh_CN';
  const architecture = inferArchitecture(gpu);
  const vendor = hardwareVendor(gpu);
  const weightSupport = selectedWeightSupport(gpu, quant);
  const kvSupport = selectedKvSupport(gpu, kvQuant, model);
  const fp16ModelVram = computeModelVramGB(model, 'fp16');
  const weightSaved = Math.max(0, fp16ModelVram - (results?.modelVram ?? computeModelVramGB(model, quant)));
  const fp16KvVram = computeKvCacheVramGB(maxLength, 'fp16', model);
  const selectedKvVram = results?.kvCacheVram ?? computeKvCacheVramGB(maxLength, kvQuant, model);
  const kvSaved = Math.max(0, fp16KvVram - selectedKvVram);

  if (architecture === 'Pascal' && vendor === 'NVIDIA') {
    hints.push({
      title: zh ? '旧 NVIDIA FP16 注意事项' : 'Legacy NVIDIA FP16 caveat',
      body: zh
        ? 'Pascal/GTX 级显卡可以存储半精度值，但没有 Volta 时代引入的 Tensor Core 路径。当 kernel 无法使用快速 FP16 路径时，实际推理可能退回接近 FP32 风格吞吐。'
        : 'Pascal/GTX-class cards can store half precision values, but they do not have Volta-era Tensor Cores. When kernels cannot use a fast FP16 path, practical inference may fall back toward FP32-style throughput.',
      impact: zh
        ? 'FP16/量化速度估算应视为乐观值；不支持的 kernel 出现 2x 或更差惩罚是可能的。'
        : 'Treat FP16/quantized speed estimates as optimistic; a 2x or worse penalty is plausible for unsupported kernels.',
      tone: 'critical',
      sources: [guidanceSources.nvidiaCudaThroughput, guidanceSources.nvidiaTensorCores],
    });
  } else if (isNvidiaArchitecture(architecture) && architecture !== 'Pascal') {
    hints.push({
      title: zh ? '混合精度并不是纯 FP16' : 'Mixed precision is not pure FP16',
      body: zh
        ? '现代 NVIDIA Tensor Core 路径通常把低精度输入和更宽的累加结合使用，这有利于准确性。但实际能否跑到对应硬件路径，更多取决于 kernel 是否可用，而不仅是计算器里显示的存储 dtype。'
        : 'Modern NVIDIA Tensor Core paths usually combine lower-precision inputs with wider accumulation. That is good for accuracy, but kernel availability matters more than the storage dtype shown in the calculator.',
      impact: zh
        ? '在假设量化 checkpoint 可以命中标称硬件路径之前，先查看下面的支持矩阵。'
        : 'Use the support rows below before assuming a quantized checkpoint will hit the advertised hardware path.',
      tone: 'info',
      sources: [guidanceSources.nvidiaTensorCores, guidanceSources.vllmQuantization],
    });
  }

  if (quant !== 'fp16') {
    hints.push({
      title: zh ? `${quant.toUpperCase()} 权重节省显存` : `${quant.toUpperCase()} weights save VRAM`,
      body: zh
        ? `当前权重设置相对该模型的 FP16 权重估算约节省 ${formatNumber(weightSaved)} GB。`
        : `The current weight setting saves about ${formatNumber(weightSaved)} GB versus an FP16 weight estimate for this model.`,
      impact: weightSupport.status === 'Supported'
        ? (zh ? '容量收益与 vLLM 支持路径基本一致。' : 'Capacity and vLLM support are aligned for this selection.')
        : (zh ? `容量会改善，但后端状态仍需确认：${localizeSupportNote(weightSupport, locale)}` : `Capacity improves, but backend status is ${weightSupport.status.toLowerCase()}: ${weightSupport.note}`),
      tone: weightSupport.status === 'Supported' ? 'good' : weightSupport.status === 'Unsupported' ? 'warning' : 'info',
      sources: weightSupport.sources,
    });
  }

  if (kvQuant !== 'fp16') {
    hints.push({
      title: zh ? `${kvQuant.toUpperCase()} KV 缓存改变边际` : `${kvQuant.toUpperCase()} KV cache changes the margin`,
      body: kvSaved > 0
        ? (zh
          ? `所选 KV 缓存 dtype 相对 FP16 KV，在每条完整 ${formatCompact(maxLength)} token 序列上约节省 ${formatNumber(kvSaved)} GB。`
          : `The selected KV cache dtype saves about ${formatNumber(kvSaved)} GB per full ${formatCompact(maxLength)}-token sequence versus FP16 KV.`)
        : (zh
          ? `所选 KV 缓存 dtype 相对 FP16 KV，在每条完整 ${formatCompact(maxLength)} token 序列上额外占用约 ${formatNumber(Math.abs(kvSaved))} GB。`
          : `The selected KV cache dtype uses about ${formatNumber(Math.abs(kvSaved))} GB more per full ${formatCompact(maxLength)}-token sequence versus FP16 KV.`),
      impact: kvSupport.status === 'Supported'
        ? (zh ? '这是当前 vLLM 文档中较清晰的 KV 省显存路径。' : 'This is the cleanest memory-saving KV option in current vLLM docs.')
        : localizeSupportNote(kvSupport, locale),
      tone: kvSupport.status === 'Unsupported' ? 'warning' : kvSupport.status === 'Supported' ? 'good' : 'info',
      sources: kvSupport.sources,
    });
  }

  if (kvQuant === 'fp8' && (model.headDim ?? 0) >= 256) {
    hints.push({
      title: zh ? '大 head 维度的 FP8 KV 警告' : 'Large head dimension FP8 KV warning',
      body: zh
        ? '该模型使用 256 的 head 维度。vLLM 的 FP8 KV-cache 验证说明中提到，即使解码阶段显存流量改善，大 head 维度在预填充阶段仍可能出现回退。'
        : 'This model uses a 256 head dimension. vLLM’s FP8 KV-cache validation notes that large head dimensions can still regress during prefill, even when decode memory traffic improves.',
      impact: zh
        ? '长上下文解码可能受益，但在把 FP8 KV 当作无成本收益前，应先 benchmark 预填充占比较高的工作负载。'
        : 'Long-context decode may benefit, but prompt-heavy workloads should be benchmarked before treating FP8 KV as a free win.',
      tone: 'warning',
      sources: [guidanceSources.vllmFp8KvBlog],
    });
  }

  if (kvQuant === 'fp8' && (model.name.includes('Qwen3.5') || model.name.includes('Qwen3.6') || model.name.includes('Next'))) {
    hints.push({
      title: zh ? '混合注意力模型注意事项' : 'Hybrid-attention model caution',
      body: zh
        ? '对于混合注意力模型，FP8 KV 缓存的收益可能不均匀，因为部分层具有 bounded 或特殊注意力行为。'
        : 'For hybrid-attention models, FP8 KV cache can have uneven benefit because some layers have bounded or specialized attention behavior.',
      impact: zh
        ? '如果运行时提供层级跳过或校准 scale，优先使用这些能力，而不是盲目对所有层启用 FP8 KV。'
        : 'If the runtime exposes layer skipping or calibrated scales, prefer that over a blind all-layer FP8 KV switch.',
      tone: 'warning',
      sources: [guidanceSources.vllmFp8KvBlog, ...(model.sources ?? (model.source ? [model.source] : []))],
    });
  }

  if (results?.error) {
    hints.push({
      title: zh ? '容量是当前阻断项' : 'Capacity is the active blocker',
      body: zh
        ? '当前模型、上下文和并发无法放入可用显存预算。'
        : 'The selected model, context, and concurrency do not fit inside the usable VRAM budget.',
      impact: zh
        ? '优先降低上下文/并发、增加 GPU，或降低权重/KV 精度。随后重新检查支持状态，因为最激进的选项未必在所选运行时稳定。'
        : 'First reduce context/concurrency, increase GPUs, or lower weight/KV precision. Then re-check support because the most aggressive options may not be stable on the selected runtime.',
      tone: 'critical',
      sources: [guidanceSources.vllmQuantization, guidanceSources.vllmKvCache],
    });
  }

  return hints;
}

function SourceLinks({ locale = 'en_US', sources }: { locale?: Locale; sources: ReferenceLink[] }) {
  if (sources.length === 0) {
    return <p className="text-sm text-slate-500">{translations[locale].noExternalSource}</p>;
  }

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50/50"
        >
          <span className="flex min-w-0 items-center justify-between gap-3 text-sm font-semibold text-slate-900">
            <span className="source-link-text">{source.label}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </span>
          {source.note && <span className="source-link-text mt-1 block text-xs text-slate-500">{source.note}</span>}
        </a>
      ))}
    </div>
  );
}

function StatTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="metric-tile">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-950">{value}</div>
      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </div>
  );
}

function DraftNumberInput({
  className = 'input input-bordered w-full text-sm',
  integer = false,
  max,
  min,
  onValueChange,
  step,
  value,
}: DraftNumberInputProps) {
  const [draft, setDraft] = useState(formatInputNumber(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(formatInputNumber(value));
  }, [focused, value]);

  function commit(nextDraft = draft) {
    const parsed = Number(nextDraft);
    const normalized = Number.isFinite(parsed)
      ? clampNumber(integer ? Math.round(parsed) : parsed, min, max)
      : clampNumber(value, min, max);
    setDraft(formatInputNumber(normalized));
    onValueChange(normalized);
  }

  return (
    <input
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      step={step}
      value={draft}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onChange={(event) => {
        const nextDraft = event.target.value;
        if (!/^\d*\.?\d*$/.test(nextDraft)) return;

        setDraft(nextDraft);
        if (nextDraft === '' || nextDraft === '.') return;

        const parsed = Number(nextDraft);
        if (!Number.isFinite(parsed)) return;
        if (parsed < min || (typeof max === 'number' && parsed > max)) return;

        onValueChange(integer ? Math.round(parsed) : parsed);
      }}
      className={className}
    />
  );
}

function FormulaCard({
  accentClass,
  equation,
  icon,
  interpretation,
  labels,
  purpose,
  result,
  substitution,
  title,
  variables,
}: {
  accentClass: string;
  equation: string;
  icon: ReactNode;
  interpretation: string;
  labels: {
    equation: string;
    variables: string;
    currentSubstitution: string;
    result: string;
  };
  purpose: string;
  result: string;
  substitution: string;
  title: string;
  variables: FormulaVariable[];
}) {
  return (
    <div className="panel-compact formula-card p-4">
      <div className="flex items-start gap-3">
        <div className={`formula-icon ${accentClass}`}>{icon}</div>
        <div className="min-w-0">
          <h4 className="font-bold text-slate-950">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{purpose}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{labels.equation}</div>
        <code className="formula-code block rounded-lg bg-slate-950 p-3 text-sm text-white">
          {equation}
        </code>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{labels.variables}</div>
        <div className="grid grid-cols-1 gap-2">
          {variables.map((variable) => (
            <div key={variable.name} className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-800">{variable.name}</code>
                <span className="wrap-anywhere text-xs font-semibold text-slate-700">{variable.value}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{variable.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{labels.currentSubstitution}</div>
          <p className="wrap-anywhere text-sm leading-6 text-slate-700">{substitution}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 lg:min-w-32">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{labels.result}</div>
          <div className="mt-1 text-xl font-black text-slate-950">{result}</div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{interpretation}</p>
    </div>
  );
}

function TheoryPanel({ locale, parallelGPUs, sources }: { locale: Locale; parallelGPUs: number; sources: ReferenceLink[] }) {
  const zh = locale === 'zh_CN';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.36fr)]">
      <section className="panel p-4 sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950">{zh ? '理论' : 'Theory'}</h2>
            <p className="text-sm text-slate-500">
              {zh ? '显存公式与经验吞吐先验背后的计算逻辑' : 'What sits behind the VRAM formulas and empirical throughput priors'}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel-compact p-4">
            <div className="flex items-start gap-3">
              <div className="formula-icon bg-indigo-100 text-indigo-700"><BookOpen className="h-4 w-4" /></div>
              <div>
                <h4 className="font-bold text-slate-950">{zh ? '估算器理论' : 'Estimator Theory'}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {zh
                    ? '这个计算器以容量估算为主，并叠加 roofline 风格的性能草图。它把静态模型权重、动态 KV 缓存、运行时预留、预填充计算吞吐和解码带宽吞吐分开处理。'
                    : 'The calculator is a capacity-first estimator with a roofline-style performance sketch. It separates static model weights, dynamic KV cache, reserved runtime memory, prompt compute throughput, and decode memory-bandwidth throughput.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="panel-compact p-4">
              <h4 className="text-sm font-bold text-slate-950">{zh ? '预填充路径：计算受限先验' : 'Prompt path: compute bound prior'}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {zh
                  ? '预填充被近似为一次覆盖全量参数的密集计算过程。公式从标称 FP16 风格吞吐开始，再除以总参数量和一个 `sqrt(2)` 保守阻尼项。'
                  : 'Prompt processing is modeled as a dense-compute pass over the full parameter count. The formula starts from advertised FP16-style throughput, then divides by total model parameters and a `sqrt(2)` dampener.'}
              </p>
              <code className="formula-code mt-3 block rounded-lg bg-slate-950 p-3 text-sm text-white">prompt_tok_s = fp16_tflops x 1000 x gpu_count^0.6 / (total_params_b x sqrt(2))</code>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {zh
                  ? '`sqrt(2)` 不是硬件定律，而是对非 GEMM 工作、kernel 开销、混合精度行为、batch 形状和调度损耗的保守可用性因子。它适合作为默认先验，真实部署后应使用 benchmark 校准。'
                  : '`sqrt(2)` is not a hardware law. It is a conservative usability factor for non-GEMM work, kernel overhead, mixed precision behavior, batching shape, and runtime scheduling. Use it as a default prior, then calibrate with benchmarks.'}
              </p>
            </div>

            <div className="panel-compact p-4">
              <h4 className="text-sm font-bold text-slate-950">{zh ? '生成路径：带宽受限先验' : 'Generation path: bandwidth bound prior'}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {zh
                  ? '自回归解码被近似为显存带宽主导，因为每生成一个新 token 都会反复流式读取激活权重和注意力状态。MoE 模型在这条路径上使用激活参数量，而不是总参数量。'
                  : 'Autoregressive decode is modeled as memory-bandwidth dominated because every new token repeatedly streams active weights and attention state. MoE models use active parameters rather than total parameters for this path.'}
              </p>
              <code className="formula-code mt-3 block rounded-lg bg-slate-950 p-3 text-sm text-white">gen_tok_s = bandwidth_gbs x gpu_count^0.8 / (active_params_b x weight_bytes)</code>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {zh
                  ? '`0.8` 指数是一个多 GPU 经验先验：带宽聚合通常比预填充扩展更好，但通信、路由、缓存放置和流水线空泡会让它低于理想线性扩展。'
                  : 'The `0.8` exponent is an empirical multi-GPU prior: bandwidth scaling is usually better than prompt scaling, but communication, routing, cache placement, and pipeline bubbles keep it below ideal linear scaling.'}
              </p>
            </div>

            <div className="panel-compact p-4">
              <h4 className="text-sm font-bold text-slate-950">{zh ? '为什么预填充用 `0.6`，解码用 `0.8`' : 'Why prompt uses `0.6` and decode uses `0.8`'}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {zh
                  ? '多 GPU 推理通常不会自然达到 `gpu_count^1.0`，除非工作负载、运行时、拓扑和并行策略都非常匹配。预填充同步更多、激活移动更重，所以这里使用 `0.6`；解码更接近带宽聚合问题，所以使用 `0.8`。'
                  : 'Multi-GPU serving does not scale as `gpu_count^1.0` unless the workload, runtime, topology, and parallel strategy line up unusually well. Prompt prefill has heavier synchronization and larger activation movement, so the calculator uses `0.6`. Decode is closer to a bandwidth aggregation problem, so it uses `0.8`.'}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <StatTile label={zh ? '预填充先验' : 'Prompt prior'} value={`x${Math.pow(parallelGPUs, 0.6).toFixed(2)}`} detail={`${parallelGPUs} GPU ^ 0.6`} />
                <StatTile label={zh ? '解码先验' : 'Decode prior'} value={`x${Math.pow(parallelGPUs, 0.8).toFixed(2)}`} detail={`${parallelGPUs} GPU ^ 0.8`} />
              </div>
            </div>

            <div className="panel-compact p-4">
              <h4 className="text-sm font-bold text-slate-950">{zh ? '容量推导' : 'Capacity derivation'}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {zh
                  ? '显存被拆成权重、KV 缓存和预留。权重显存取决于总参数量与存储 dtype；KV 缓存取决于层数、KV 头数、head 维度、key/value 两份张量、上下文长度、dtype 和并发活跃序列。'
                  : 'Memory is treated as weights plus KV cache plus reserve. Weight memory depends on total parameters and storage dtype. KV cache depends on layers, KV heads, head dimension, two tensors for keys and values, context length, dtype, and concurrent active sequences.'}
              </p>
              <code className="formula-code mt-3 block rounded-lg bg-slate-950 p-3 text-sm text-white">total_vram = weights + kv_cache_per_request x users + reserve</code>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {zh
                  ? '这个表达对突发流量偏保守，对碎片化运行时可能偏乐观。预留项用于吸收分配器行为、CUDA graph、临时 buffer 和运行时 bookkeeping。'
                  : 'This is intentionally pessimistic for bursty traffic and optimistic for fragmented runtimes. The reserve term is there to absorb allocator behavior, CUDA graphs, temporary buffers, and runtime bookkeeping.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="panel p-4">
          <h3 className="text-sm font-bold text-slate-950">{zh ? '如何使用这些数值' : 'How to Use This'}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {zh
              ? '这些常数应被看作规划默认值。拿到真实 benchmark 后，可以调整有效 TFLOPS、带宽、利用率或扩展指数，让估算贴近你的运行时。'
              : 'Treat these constants as planning defaults. After a real benchmark, adjust effective TFLOPS, bandwidth, utilization, or scaling exponents to match your runtime.'}
          </p>
        </section>
        <section className="panel p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-950">{zh ? '理论来源' : 'Theory Sources'}</h3>
          <SourceLinks locale={locale} sources={sources} />
        </section>
      </aside>
    </div>
  );
}

function GuideStepPanel({
  active,
  children,
  complete,
  locked = false,
  onEdit,
  step,
  subtitle,
  summary,
  title,
}: {
  active: boolean;
  children: ReactNode;
  complete: boolean;
  locked?: boolean;
  onEdit: () => void;
  step: number;
  subtitle: string;
  summary: ReactNode;
  title: string;
}) {
  const canOpen = !locked;

  return (
    <section className="panel-compact overflow-hidden">
      <button
        type="button"
        disabled={!canOpen}
        aria-expanded={active}
        onClick={() => {
          if (canOpen) onEdit();
        }}
        className={`flex w-full items-start justify-between gap-4 p-4 text-left ${canOpen ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex min-w-0 gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${complete ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-indigo-600 text-white' : locked ? 'bg-slate-50 text-slate-300 ring-1 ring-slate-200' : 'bg-slate-100 text-slate-500'}`}>
            {complete ? <CheckCircle2 className="h-4 w-4" /> : step}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-950">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
            {!active && <div className="mt-3">{summary}</div>}
          </div>
        </div>
        {!active && (
          <span className={`shrink-0 text-xs font-bold ${locked ? 'text-slate-400' : complete ? 'text-indigo-600' : 'text-slate-500'}`}>
            {locked ? 'Pending' : complete ? 'Edit' : 'Open'}
          </span>
        )}
      </button>
      {active && <div className="border-t border-slate-200 p-4">{children}</div>}
    </section>
  );
}

function SubstepRail({
  items,
}: {
  items: Array<{
    label: string;
    value?: string;
    active: boolean;
    complete: boolean;
    locked?: boolean;
    onClick: () => void;
  }>;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={item.locked}
          data-active={item.active}
          onClick={item.onClick}
          className="inline-flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-default disabled:opacity-55 data-[active=true]:border-indigo-300 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700"
        >
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.complete ? 'bg-emerald-100 text-emerald-700' : item.active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
            {item.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
          </span>
          <span className="min-w-0">
            <span className="block">{item.label}</span>
            {item.value && <span className="wrap-anywhere mt-0.5 block text-[11px] font-medium text-slate-500">{item.value}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function SegmentedButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="segmented-button" data-active={active} onClick={onClick}>
      {children}
    </button>
  );
}

function DetailSummaryCard({
  active,
  accentColor,
  detail,
  icon,
  label,
  onClick,
  value,
}: {
  active: boolean;
  accentColor: string;
  detail: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  value: string;
}) {
  return (
    <button
      type="button"
      className="picker-card"
      data-active={active}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: accentColor }}>
          {icon}
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
          <span className="wrap-anywhere mt-1 block text-sm font-bold leading-snug text-slate-950">{value}</span>
          <span className="wrap-anywhere mt-1 block text-xs leading-5 text-slate-500">{detail}</span>
        </span>
      </div>
    </button>
  );
}

export default function LLMVRAMCalculator({ locale = 'en_US', onLocaleChange }: LLMVRAMCalculatorProps) {
  const defaultCard = gpuCards.find((card) => card.name === 'NVIDIA RTX3090 24G') ?? gpuCards[0];
  const defaultModel = modelDefs.find((model) => model.name === 'Qwen3-8B') ?? modelDefs[0];
  const defaultMeta = modelMeta(defaultModel);

  const [selectedCard, setSelectedCard] = useState<GPUCard | null>(defaultCard);
  const [selectedModel, setSelectedModel] = useState<ModelDef | null>(defaultModel);
  const [quantType, setQuantType] = useState<RuntimeQuantType>('int4');
  const [kvQuantType, setKvQuantType] = useState<KvQuantType>(defaultCard?.kvQuantType ?? 'fp8');
  const [maxLength, setMaxLength] = useState<number>(8192);
  const [userCount, setUserCount] = useState<number>(10);
  const [vramUtilProportion, setVramUtilProportion] = useState<number>(0.9);
  const [minReserveVramGB, setMinReserveVramGB] = useState<number>(2);
  const [parallelGPUs, setParallelGPUs] = useState<number>(1);
  const [results, setResults] = useState<CalcResults | null>(null);
  const [entryMode, setEntryMode] = useState<EntryMode>('guided');
  const [guideStep, setGuideStep] = useState<GuideStep>(1);
  const [guideCompletedThrough, setGuideCompletedThrough] = useState<GuideCompletedStep>(0);
  const [guideModelStage, setGuideModelStage] = useState<GuideModelStage>('family');
  const [guideGpuStage, setGuideGpuStage] = useState<GuideGpuStage>('vendor');
  const [guideRuntimeStage, setGuideRuntimeStage] = useState<GuideRuntimeStage>('preset');
  const [guideGpuClass, setGuideGpuClass] = useState<GpuClassFilter>('Datacenter');
  const [showGuideModelDetailed, setShowGuideModelDetailed] = useState(false);
  const [showGuideGpuDetailed, setShowGuideGpuDetailed] = useState(false);
  const [showGuideResultBanner, setShowGuideResultBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<CalculatorTab>('results');
  const [detailLayoutMode, setDetailLayoutMode] = useState<DetailLayoutMode>('auto');
  const [manualDetailLayoutRatio, setManualDetailLayoutRatio] = useState<DetailLayoutRatio>('50-50');
  const [detailConfigSection, setDetailConfigSection] = useState<DetailConfigSection>('summary');
  const [modelMode, setModelMode] = useState<ModelPickerMode>('catalog');
  const [modelQuery, setModelQuery] = useState('');
  const [modelFamily, setModelFamily] = useState(defaultMeta.family);
  const [modelVariant, setModelVariant] = useState(defaultMeta.variant);
  const [modelScale, setModelScale] = useState(defaultMeta.scale);
  const [gpuMode, setGpuMode] = useState<GpuPickerMode>('catalog');
  const [gpuQuery, setGpuQuery] = useState('');
  const [gpuVendorFilter, setGpuVendorFilter] = useState<VendorFilter>('All');
  const [customSupplier, setCustomSupplier] = useState('NVIDIA');
  const [customArchitecture, setCustomArchitecture] = useState('Custom');
  const [customVramGB, setCustomVramGB] = useState<number>(24);
  const [customMemoryBandwidthGBs, setCustomMemoryBandwidthGBs] = useState<number>(600);
  const [customProcessPowerFP16, setCustomProcessPowerFP16] = useState<number>(30);
  const [customTotalParamsB, setCustomTotalParamsB] = useState<number>(7);
  const [customModelSizeGB, setCustomModelSizeGB] = useState<number>(4);
  const [customActiveParamsB, setCustomActiveParamsB] = useState<number>(7);
  const [customPerKVsizeFp8, setCustomPerKVsizeFp8] = useState<number>(65536);
  const [customLayers, setCustomLayers] = useState<number>(32);
  const [customNumKVHeads, setCustomNumKVHeads] = useState<number>(8);
  const [customHeadDim, setCustomHeadDim] = useState<number>(128);
  const [kvSizeUserModified, setKvSizeUserModified] = useState<boolean>(false);
  const [modelSizeUserModified, setModelSizeUserModified] = useState<boolean>(false);
  const [customKvQuantType, setCustomKvQuantType] = useState<KvQuantType>('fp8');
  const t = (key: TranslationKey) => translations[locale][key] ?? translations.en_US[key];
  const isZh = locale === 'zh_CN';

  const modelCatalog = useMemo(() => modelDefs.map((model) => ({ model, meta: modelMeta(model) })), []);
  const modelFamilies = useMemo(() => unique(modelCatalog.map((item) => item.meta.family)), [modelCatalog]);
  const modelVariants = useMemo(
    () => unique(modelCatalog.filter((item) => item.meta.family === modelFamily).map((item) => item.meta.variant)),
    [modelCatalog, modelFamily]
  );
  const modelScales = useMemo(
    () => modelCatalog
      .filter((item) => item.meta.family === modelFamily && item.meta.variant === modelVariant)
      .map((item) => item.meta.scale),
    [modelCatalog, modelFamily, modelVariant]
  );
  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    return modelCatalog.filter(({ model, meta }) => {
      const matchesQuery = !q || `${model.name} ${meta.family} ${meta.variant} ${meta.scale}`.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [modelCatalog, modelQuery]);

  const filteredGpus = useMemo(() => {
    const q = gpuQuery.trim().toLowerCase();
    return gpuCards.filter((gpu) => {
      const vendor = getGpuVendor(gpu.name);
      const matchesVendor = gpuVendorFilter === 'All' || vendor === gpuVendorFilter;
      const matchesQuery = !q || `${gpu.name} ${inferArchitecture(gpu)} ${gpuClass(gpu)}`.toLowerCase().includes(q);
      return matchesVendor && matchesQuery;
    });
  }, [gpuQuery, gpuVendorFilter]);
  const guidedModelSearchResults = useMemo(
    () => modelQuery.trim() ? filteredModels.slice(0, 8) : [],
    [filteredModels, modelQuery]
  );
  const guidedGpuSearchResults = useMemo(
    () => gpuQuery.trim() ? filteredGpus.slice(0, 8) : [],
    [filteredGpus, gpuQuery]
  );
  const guidedGpuVendors: VendorFilter[] = ['NVIDIA', 'AMD'];
  const guidedGpuClasses = useMemo(() => {
    const candidates = gpuCards.filter((gpu) => getGpuVendor(gpu.name) === gpuVendorFilter);
    return unique(candidates.map((gpu) => gpuClass(gpu))).filter((value): value is GpuClassFilter => (
      value === 'Datacenter' || value === 'Workstation' || value === 'Consumer'
    ));
  }, [gpuVendorFilter]);
  const guidedGpuChoices = useMemo(() => (
    gpuCards.filter((gpu) => getGpuVendor(gpu.name) === gpuVendorFilter && gpuClass(gpu) === guideGpuClass).slice(0, 12)
  ), [gpuVendorFilter, guideGpuClass]);

  const useCustomModel = modelMode === 'custom';
  const useCustomGPU = gpuMode === 'numeric';
  const currentModelSizeEstimate = estimateModelSizeGB(customTotalParamsB, quantType);
  const currentKvEstimate = computeKvSizeFp8FromParams(customLayers, customNumKVHeads, customHeadDim);

  const customModel = useMemo<ModelDef>(() => ({
    name: 'Custom Model',
    modelSizeGB: customModelSizeGB,
    totalParamsB: customTotalParamsB,
    activeParamsB: customActiveParamsB,
    perKVsizeFp8: customPerKVsizeFp8,
    quantType,
    quantBits: quantType === 'int4' ? 4 : quantType === 'fp16' ? 16 : 8,
    hiddenSize: customNumKVHeads * customHeadDim,
    paramsB: customTotalParamsB,
    layers: customLayers,
    numKVHeads: customNumKVHeads,
    headDim: customHeadDim,
    sourceNote: isZh ? '计算器中输入的自定义模型数值。' : 'Custom values entered in the calculator.',
  }), [
    customActiveParamsB,
    customHeadDim,
    customLayers,
    customModelSizeGB,
    customNumKVHeads,
    customPerKVsizeFp8,
    customTotalParamsB,
    isZh,
    quantType,
  ]);

  const customCard = useMemo<GPUCard>(() => ({
    name: `${customSupplier} Custom GPU`,
    vramGb: customVramGB,
    memoryBandwidthGBs: customMemoryBandwidthGBs,
    processPower: { fp16: customProcessPowerFP16 },
    kvQuantType: customKvQuantType,
    architecture: customArchitecture,
    sourceNote: isZh ? '计算器中输入的自定义硬件数值配置。' : 'Custom numeric hardware profile entered in the calculator.',
  }), [customArchitecture, customKvQuantType, customMemoryBandwidthGBs, customProcessPowerFP16, customSupplier, customVramGB, isZh]);

  const effectiveModel = useCustomModel ? customModel : selectedModel;
  const effectiveCard = useCustomGPU ? customCard : selectedCard;
  const effectiveModelMeta = effectiveModel ? modelMeta(effectiveModel) : null;
  const effectiveModelRelease = formatReleaseDate(effectiveModel?.releaseDate);
  const effectiveGpuRelease = formatReleaseDate(effectiveCard?.releaseDate);
  const totalGpuVram = (effectiveCard?.vramGb ?? 0) * parallelGPUs;
  const userSliderMax = dynamicSliderMax(1000, userCount, 100);
  const gpuSliderMax = dynamicSliderMax(64, parallelGPUs, 8);
  const contextSliderMax = dynamicSliderMax(1_048_576, maxLength, 8192);
  const reserveSliderMax = dynamicSliderMax(512, minReserveVramGB, 16);
  const quantByteValue = quantBytes[quantType];
  const kvByteValue = kvQuantBytes[kvQuantType];
  const vramPercent = results && totalGpuVram > 0 ? Math.min(100, (results.totalVram / totalGpuVram) * 100) : 0;
  const formulaScale = Math.max(results?.modelVram ?? 0, results?.kvCacheVram ?? 0, results?.reservedVram ?? 0, 1);
  const modelSources = sourceList(effectiveModel?.source, effectiveModel?.sources);
  const gpuSources = sourceList(effectiveCard?.source, effectiveCard?.sources);
  const supportRows = useMemo(
    () => buildSupportRows(effectiveCard, effectiveModel, quantType, kvQuantType),
    [effectiveCard, effectiveModel, kvQuantType, quantType]
  );
  const guidanceHints = useMemo(
    () => buildGuidanceHints(effectiveModel, effectiveCard, quantType, kvQuantType, results, maxLength, locale),
    [effectiveCard, effectiveModel, kvQuantType, locale, maxLength, quantType, results]
  );
  const guidanceSourceLinks = useMemo(
    () => mergeSources(
      supportRows.flatMap((row) => row.sources),
      guidanceHints.flatMap((hint) => hint.sources)
    ),
    [guidanceHints, supportRows]
  );
  const fp16ModelVram = effectiveModel ? computeModelVramGB(effectiveModel, 'fp16') : 0;
  const fp16KvVram = effectiveModel ? computeKvCacheVramGB(maxLength, 'fp16', effectiveModel) : 0;
  const currentWeightSaving = Math.max(0, fp16ModelVram - (results?.modelVram ?? 0));
  const currentKvSaving = fp16KvVram - (results?.kvCacheVram ?? 0);
  const unsupportedSupportCount = supportRows.filter((row) => row.status === 'Unsupported').length;
  const partialSupportCount = supportRows.filter((row) => row.status === 'Partial' || row.status === 'Check').length;
  const supportRiskLabel = unsupportedSupportCount > 0
    ? `${unsupportedSupportCount} ${t(unsupportedSupportCount > 1 ? 'blockers' : 'blocker')}`
    : partialSupportCount > 0
      ? `${partialSupportCount} ${t(partialSupportCount > 1 ? 'checks' : 'check')}`
      : t('clean');
  const byteUnit = isZh ? '字节' : 'byte';
  const awqOverhead = quantType === 'int4' && effectiveModel?.awqGroup ? ` + 3/${effectiveModel.awqGroup} ${byteUnit}${isZh ? ' 开销' : ' overhead'}` : '';
  const currentReserve = results?.reservedVram ?? Math.max(totalGpuVram * (1 - vramUtilProportion), minReserveVramGB);
  const formulaCards = [
    {
      title: isZh ? '模型权重显存' : 'Model Weight Memory',
      purpose: isZh ? '估算加载一份模型权重所需的静态显存。' : 'Estimates the static VRAM needed to keep one copy of the model weights loaded.',
      equation: 'weight_vram_gb = total_params_b x (bytes_per_param + quant_overhead)',
      icon: <HardDrive className="h-4 w-4" />,
      accentClass: 'bg-blue-100 text-blue-700',
      variables: [
        { name: 'total_params_b', value: `${effectiveModel?.totalParamsB ?? 0}B`, description: isZh ? '公开的总参数量，MoE 模型包含未激活专家。' : 'Published total parameter count, including inactive experts for MoE models.' },
        { name: 'bytes_per_param', value: `${quantByteValue} ${byteUnit}`, description: isZh ? `所选 ${quantType.toUpperCase()} 权重格式的存储成本。` : `Storage cost of the selected ${quantType.toUpperCase()} weight format.` },
        { name: 'quant_overhead', value: quantType === 'int4' && effectiveModel?.awqGroup ? `3/${effectiveModel.awqGroup} ${byteUnit}` : `0 ${byteUnit}`, description: isZh ? '分组 INT4 估算中 scale 或 zero-point 的额外存储。' : 'Extra scale or zero-point storage used by grouped INT4 estimates.' },
      ],
      substitution: `${effectiveModel?.totalParamsB ?? 0}B x (${quantByteValue} ${byteUnit}${awqOverhead})`,
      result: `${formatNumber(results?.modelVram ?? 0)} GB`,
      interpretation: isZh
        ? '这是每个已加载模型副本都会支付一次的成本。更低权重精度主要会给 KV 缓存和更长上下文留下更多空间。'
        : 'This is paid once per loaded model replica. Lower weight precision mainly improves the room left for KV cache and larger contexts.',
    },
    {
      title: isZh ? 'KV 缓存显存' : 'KV Cache Memory',
      purpose: isZh ? '估算单个满长度请求中 attention key/value 缓存消耗的显存。' : 'Estimates the memory consumed by one full-length request cache for attention keys and values.',
      equation: 'kv_cache_gb = layers x kv_heads x head_dim x 2 x context_tokens x kv_bytes / 2^30',
      icon: <Server className="h-4 w-4" />,
      accentClass: 'bg-green-100 text-green-700',
      variables: [
        { name: 'layers', value: `${effectiveModel?.layers ?? 0}`, description: isZh ? '需要保存 attention cache 的 transformer block 数量。' : 'Number of transformer blocks that store attention cache.' },
        { name: 'kv_heads', value: `${effectiveModel?.numKVHeads ?? 0}`, description: isZh ? '经过 GQA/MQA 共享后的 key/value 头数。' : 'Key/value head count after GQA/MQA sharing.' },
        { name: 'head_dim', value: `${effectiveModel?.headDim ?? 0}`, description: isZh ? '每个 KV head 的宽度。' : 'Width of each KV head.' },
        { name: 'context_tokens', value: formatCompact(maxLength), description: isZh ? '单个请求保留的最大 token 数。' : 'Maximum tokens retained for one request.' },
        { name: 'kv_bytes', value: `${kvByteValue} ${byteUnit}`, description: isZh ? `${kvQuantType.toUpperCase()} KV 缓存中每个值的字节数。` : `Bytes per KV value for ${kvQuantType.toUpperCase()} cache storage.` },
      ],
      substitution: `${effectiveModel?.layers ?? 0} x ${effectiveModel?.numKVHeads ?? 0} x ${effectiveModel?.headDim ?? 0} x 2 x ${maxLength.toLocaleString()} x ${kvByteValue} / 2^30`,
      result: `${formatNumber(results?.kvCacheVram ?? 0)} GB`,
      interpretation: isZh
        ? '它会随上下文长度和活跃序列数线性增长，通常是长上下文服务最先耗尽余量的位置。'
        : 'This grows linearly with context length and active sequences. It is usually the first place where long-context serving runs out of margin.',
    },
    {
      title: isZh ? '可用显存预算' : 'Usable VRAM Budget',
      purpose: isZh ? '把已安装 GPU 显存换算为扣除安全预留后可用于权重和 KV 缓存的部分。' : 'Converts installed GPU memory into the portion available for model weights and KV cache after safety reserve.',
      equation: 'usable_vram_gb = gpu_vram x gpu_count - max(total_vram x (1 - utilization), reserve_gb)',
      icon: <Gauge className="h-4 w-4" />,
      accentClass: 'bg-indigo-100 text-indigo-700',
      variables: [
        { name: 'gpu_vram', value: `${effectiveCard?.vramGb ?? 0} GB`, description: isZh ? '所选单张加速卡的显存容量。' : 'Memory capacity on one selected accelerator.' },
        { name: 'gpu_count', value: `${parallelGPUs}`, description: isZh ? '本估算中合并为一个服务池的并行设备数量。' : 'Parallel devices counted as one aggregate serving pool in this estimate.' },
        { name: 'utilization', value: `${Math.round(vramUtilProportion * 100)}%`, description: isZh ? '允许工作负载使用的总显存最大比例。' : 'The maximum fraction of total VRAM allowed for the workload.' },
        { name: 'reserve_gb', value: `${formatNumber(minReserveVramGB)} GB`, description: isZh ? '为 runtime buffer、碎片和安全余量保留的固定下限。' : 'Minimum fixed headroom for runtime buffers, fragmentation, and safety margin.' },
      ],
      substitution: `${effectiveCard?.vramGb ?? 0} GB x ${parallelGPUs} - max(${formatNumber(totalGpuVram)} GB x ${formatNumber(1 - vramUtilProportion)}, ${formatNumber(minReserveVramGB)} GB)`,
      result: `${formatNumber(results?.usableVram ?? 0)} GB`,
      interpretation: isZh
        ? `当前预留解析为 ${formatNumber(currentReserve)} GB。提高利用率会增加表面容量，但也会提高 OOM 风险。`
        : `Current reserve resolves to ${formatNumber(currentReserve)} GB. Raising utilization increases apparent capacity, but also raises OOM risk.`,
    },
    {
      title: isZh ? 'Token 吞吐' : 'Token Throughput',
      purpose: isZh ? '粗略拆分预填充计算吞吐与生成带宽吞吐。' : 'Gives a coarse split between prompt compute throughput and generation bandwidth throughput.',
      equation: 'prompt_tok_s = fp16_tflops x 1000 x gpu_count^0.6 / (total_params_b x sqrt(2))\ngen_tok_s = bandwidth_gbs x gpu_count^0.8 / (active_params_b x weight_bytes)',
      icon: <Zap className="h-4 w-4" />,
      accentClass: 'bg-amber-100 text-amber-700',
      variables: [
        { name: 'fp16_tflops', value: `${formatNumber(effectiveCard?.processPower.fp16 ?? 0)} TFLOPS`, description: isZh ? '用于预填充处理的密集 FP16 风格计算代理值。' : 'Dense FP16-style compute proxy used for prompt processing.' },
        { name: 'bandwidth_gbs', value: `${formatNumber(effectiveCard?.memoryBandwidthGBs ?? 0, 0)} GB/s`, description: isZh ? '用于自回归生成的显存带宽代理值。' : 'Memory bandwidth proxy used for autoregressive generation.' },
        { name: 'active_params_b', value: `${effectiveModel?.activeParamsB ?? 0}B`, description: isZh ? '每个生成 token 触达的参数量；MoE 下小于总参数量。' : 'Parameters touched per generated token; smaller than total params for MoE.' },
        { name: 'weight_bytes', value: `${quantByteValue} ${byteUnit}`, description: isZh ? '带宽估算中使用的所选权重精度成本。' : 'Selected weight precision cost used in the bandwidth estimate.' },
      ],
      substitution: `${isZh ? '预填充' : 'prompt'}: ${formatNumber(effectiveCard?.processPower.fp16 ?? 0)} x 1000 x ${parallelGPUs}^0.6 / (${effectiveModel?.totalParamsB ?? 0} x sqrt(2)); ${isZh ? '生成' : 'generation'}: ${formatNumber(effectiveCard?.memoryBandwidthGBs ?? 0, 0)} x ${parallelGPUs}^0.8 / (${effectiveModel?.activeParamsB ?? 0} x ${quantByteValue})`,
      result: isZh
        ? `${formatNumber(results?.genSpeed ?? 0, 0)} 生成 / ${formatNumber(results?.promptSpeed ?? 0, 0)} 预填充 tok/s`
        : `${formatNumber(results?.genSpeed ?? 0, 0)} gen / ${formatNumber(results?.promptSpeed ?? 0, 0)} prompt tok/s`,
      interpretation: isZh
        ? '这是数量级级别的服务估算。Kernel 支持、batching、通信和量化后端都可能显著改变真实吞吐。'
        : 'This is an order-of-magnitude serving estimate. Kernel support, batching, communication, and quantization backend can move real throughput substantially.',
    },
  ];
  const modelStageOrder: GuideModelStage[] = ['family', 'variant', 'scale', 'review'];
  const gpuStageOrder: GuideGpuStage[] = ['vendor', 'class', 'card', 'review'];
  const runtimeStageOrder: GuideRuntimeStage[] = ['preset', 'weights', 'kv', 'workload'];
  const modelStageIndex = modelStageOrder.indexOf(guideModelStage);
  const gpuStageIndex = gpuStageOrder.indexOf(guideGpuStage);
  const runtimeStageIndex = runtimeStageOrder.indexOf(guideRuntimeStage);
  const autoLayoutRatio = detailConfigSection === 'summary' ? '25-75' : autoDetailLayoutRatio(activeTab, modelMode, gpuMode);
  const effectiveDetailLayoutRatio = detailLayoutMode === 'auto' ? autoLayoutRatio : manualDetailLayoutRatio;
  const effectiveDetailLayout = getDetailLayoutOption(effectiveDetailLayoutRatio);
  const compactDetailParams = effectiveDetailLayout.params <= 33 || detailConfigSection === 'summary';
  const theorySources = sourceList(undefined, [
    guidanceSources.rooflineModel,
    guidanceSources.nvidiaTensorCores,
    guidanceSources.vllmQuantization,
    guidanceSources.vllmKvCache,
  ]);

  function selectStructuredModel(nextFamily = modelFamily, nextVariant = modelVariant, nextScale = modelScale) {
    const candidates = modelCatalog.filter((item) => item.meta.family === nextFamily);
    const variant = candidates.some((item) => item.meta.variant === nextVariant) ? nextVariant : candidates[0]?.meta.variant;
    const scaled = candidates.filter((item) => item.meta.variant === variant);
    const scale = scaled.some((item) => item.meta.scale === nextScale) ? nextScale : scaled[0]?.meta.scale;
    const target = scaled.find((item) => item.meta.scale === scale)?.model ?? candidates[0]?.model;

    if (target) {
      const meta = modelMeta(target);
      setSelectedModel(target);
      setModelFamily(meta.family);
      setModelVariant(meta.variant);
      setModelScale(meta.scale);
    }
  }

  function completeGuideThrough(step: GuideCompletedStep) {
    setGuideCompletedThrough((current) => Math.max(current, step) as GuideCompletedStep);
  }

  function applyGuideModelFamily(family: string) {
    selectStructuredModel(family, modelVariant, modelScale);
    setModelMode('structured');
    setGuideModelStage('variant');
  }

  function applyGuideModelVariant(variant: string) {
    selectStructuredModel(modelFamily, variant, modelScale);
    setModelMode('structured');
    setGuideModelStage('scale');
  }

  function applyGuideModelScale(scale: string) {
    selectStructuredModel(modelFamily, modelVariant, scale);
    setModelMode('structured');
    setGuideModelStage('review');
    completeGuideThrough(1);
    setGuideStep(2);
  }

  function applyGuideGpuVendor(vendor: VendorFilter) {
    setGpuVendorFilter(vendor);
    const firstClass = unique(gpuCards.filter((gpu) => getGpuVendor(gpu.name) === vendor).map((gpu) => gpuClass(gpu)))
      .find((value): value is GpuClassFilter => value === 'Datacenter' || value === 'Workstation' || value === 'Consumer') ?? 'Datacenter';
    setGuideGpuClass(firstClass);
    setGpuMode('catalog');
    setGuideGpuStage('class');
  }

  function applyGuideGpuClass(nextClass: GpuClassFilter) {
    setGuideGpuClass(nextClass);
    setGpuMode('catalog');
    setGuideGpuStage('card');
  }

  function applyGuideGpuCard(gpu: GPUCard) {
    setSelectedCard(gpu);
    setKvQuantType(gpu.kvQuantType ?? 'fp16');
    setGpuMode('catalog');
    setGuideGpuStage('review');
    completeGuideThrough(2);
    setGuideStep(3);
  }

  function applyRuntimePreset(preset: 'balanced' | 'memory' | 'throughput' | 'long') {
    if (preset === 'balanced') {
      setQuantType('int4');
      setKvQuantType('fp8');
      setVramUtilProportion(0.9);
      setMinReserveVramGB(2);
      setGuideRuntimeStage('weights');
      return;
    }

    if (preset === 'memory') {
      setQuantType('int4');
      setKvQuantType('fp8');
      setVramUtilProportion(0.94);
      setMinReserveVramGB(1);
      setGuideRuntimeStage('weights');
      return;
    }

    if (preset === 'throughput') {
      setQuantType('fp8');
      setKvQuantType('fp16');
      setVramUtilProportion(0.88);
      setMinReserveVramGB(4);
      setGuideRuntimeStage('weights');
      return;
    }

    setQuantType('int4');
    setKvQuantType('fp8');
    setMaxLength(Math.max(maxLength, 32768));
    setVramUtilProportion(0.9);
    setMinReserveVramGB(4);
    setGuideRuntimeStage('weights');
  }

  function openDetailConfigSection(section: Exclude<DetailConfigSection, 'summary'>) {
    setDetailConfigSection(section);
    setDetailLayoutMode('manual');
    setManualDetailLayoutRatio('50-50');
  }

  function collapseDetailConfigSection() {
    setDetailConfigSection('summary');
    setDetailLayoutMode('auto');
  }

  function exportModelCatalogCsv() {
    downloadCsv('llm-model-catalog.csv', modelDefs.map((model) => {
      const meta = modelMeta(model);
      return {
        name: model.name,
        family: meta.family,
        variant: meta.variant,
        scale: meta.scale,
        total_params_b: model.totalParamsB,
        active_params_b: model.activeParamsB,
        hidden_size: model.hiddenSize,
        layers: model.layers,
        kv_heads: model.numKVHeads,
        head_dim: model.headDim,
        native_context: model.contextLength,
        max_context: model.maxContextLength,
        release_date: model.releaseDate,
        default_quant: model.quantType,
        default_weight_size_gb: model.modelSizeGB,
        source_urls: sourceSummary(model.source, model.sources),
        source_notes: [model.sourceNote, sourceNoteSummary(model.source, model.sources)].filter(Boolean).join(' | '),
      };
    }));
  }

  function exportHardwareCatalogCsv() {
    downloadCsv('llm-gpu-hardware-catalog.csv', gpuCards.map((gpu) => ({
      name: gpu.name,
      vendor: getGpuVendor(gpu.name),
      class: gpuClass(gpu),
      architecture: inferArchitecture(gpu),
      vram_gb: gpu.vramGb,
      memory_bandwidth_gbs: gpu.memoryBandwidthGBs,
      fp16_tflops: gpu.processPower.fp16,
      fp8_tflops: gpu.processPower.fp8,
      fp32_tflops: gpu.processPower.fp32,
      default_kv_cache: gpu.kvQuantType,
      release_date: gpu.releaseDate,
      source_urls: sourceSummary(gpu.source, gpu.sources),
      source_notes: [gpu.sourceNote, sourceNoteSummary(gpu.source, gpu.sources)].filter(Boolean).join(' | '),
    })));
  }

  function exportCurrentMetricsCsv() {
    downloadCsv('llm-gpu-current-estimate.csv', [{
      model: effectiveModel?.name,
      model_family: effectiveModelMeta?.family,
      model_variant: effectiveModelMeta?.variant,
      model_total_params_b: effectiveModel?.totalParamsB,
      model_active_params_b: effectiveModel?.activeParamsB,
      model_release_date: effectiveModel?.releaseDate,
      hardware: effectiveCard?.name,
      hardware_vendor: effectiveCard ? getGpuVendor(effectiveCard.name) : '',
      hardware_architecture: effectiveCard ? inferArchitecture(effectiveCard) : '',
      hardware_release_date: effectiveCard?.releaseDate,
      gpu_count: parallelGPUs,
      total_vram_gb: totalGpuVram,
      weight_quant: quantType,
      kv_cache_quant: kvQuantType,
      context_tokens: maxLength,
      concurrent_users: userCount,
      vram_utilization: vramUtilProportion,
      reserve_vram_gb: minReserveVramGB,
      model_vram_gb: results?.modelVram,
      kv_cache_vram_gb: results?.kvCacheVram,
      total_required_vram_gb: results?.totalVram,
      usable_vram_gb: results?.usableVram,
      usable_kv_cache_vram_gb: results?.usableKvCacheVram,
      generation_tokens_per_second: results?.genSpeed,
      prompt_tokens_per_second: results?.promptSpeed,
      per_user_generation_tokens_per_second: results?.sharedGen,
      per_user_prompt_tokens_per_second: results?.sharedPrompt,
      full_length_sequence_capacity: results?.fullLengthGenCount,
      token_budget: results?.maxTokenCountSimultaneous,
      status: results?.error ? 'blocked' : 'ok',
      error: results?.error,
      model_sources: sourceSummary(effectiveModel?.source, effectiveModel?.sources),
      hardware_sources: sourceSummary(effectiveCard?.source, effectiveCard?.sources),
    }]);
  }

  useEffect(() => {
    if (selectedModel && modelMode !== 'custom') {
      const meta = modelMeta(selectedModel);
      setModelFamily(meta.family);
      setModelVariant(meta.variant);
      setModelScale(meta.scale);
    }
  }, [modelMode, selectedModel]);

  useEffect(() => {
    if (useCustomModel && !kvSizeUserModified) setCustomPerKVsizeFp8(currentKvEstimate);
  }, [currentKvEstimate, kvSizeUserModified, useCustomModel]);

  useEffect(() => {
    if (useCustomModel && !modelSizeUserModified) setCustomModelSizeGB(currentModelSizeEstimate);
  }, [currentModelSizeEstimate, modelSizeUserModified, useCustomModel]);

  useEffect(() => {
    if (!useCustomGPU && selectedCard?.kvQuantType) setKvQuantType(selectedCard.kvQuantType);
  }, [selectedCard, useCustomGPU]);

  useEffect(() => {
    if (useCustomGPU) setKvQuantType(customKvQuantType);
  }, [customKvQuantType, useCustomGPU]);

  useEffect(() => {
    if (!effectiveModel || !effectiveCard) {
      setResults(null);
      return;
    }

    const modelVram = computeModelVramGB(effectiveModel, quantType);
    const kvCacheVram = computeKvCacheVramGB(maxLength, kvQuantType, effectiveModel);
    const totalCardVram = effectiveCard.vramGb * parallelGPUs;
    const proportionalReserve = totalCardVram * (1 - vramUtilProportion);
    const effectiveReserve = Math.max(proportionalReserve, minReserveVramGB);
    const usableVram = Math.max(0, totalCardVram - effectiveReserve);
    const totalVramReq = modelVram + kvCacheVram;

    if (totalVramReq > usableVram) {
      setResults({
        error: `Insufficient VRAM: need ${totalVramReq.toFixed(2)} GB, usable budget is ${usableVram.toFixed(2)} GB`,
        totalVram: totalVramReq,
        usableVram,
        usableKvCacheVram: 0,
        reservedVram: effectiveReserve,
        modelVram,
        kvCacheVram,
        genSpeed: 0,
        promptSpeed: 0,
        sharedGen: 0,
        sharedPrompt: 0,
        ppScaling: 1,
        membwScaling: 1,
        maxTokenCountSimultaneous: 0,
        fullLengthGenCount: 0,
      });
      return;
    }

    const ppScaling = Math.pow(parallelGPUs, 0.6);
    const membwScaling = Math.pow(parallelGPUs, 0.8);
    const processPowerFP16 = (effectiveCard.processPower.fp16 ?? 0) * ppScaling;
    const memoryBandwidth = effectiveCard.memoryBandwidthGBs * membwScaling;
    const activeParams = Math.max(0.01, effectiveModel.activeParamsB);
    const totalParams = Math.max(0.01, effectiveModel.totalParamsB);
    const promptSpeed = (processPowerFP16 * 1000) / (totalParams * Math.sqrt(2));
    const genSpeed = memoryBandwidth / (activeParams * quantByteValue);
    const sharedPrompt = promptSpeed / userCount;
    const sharedGen = genSpeed / userCount;
    const usableKvCacheVram = Math.max(0, usableVram - modelVram);
    const fullLengthGenCount = kvCacheVram > 0 ? usableKvCacheVram / kvCacheVram : 0;
    const maxTokenCountSimultaneous = maxLength * fullLengthGenCount;

    setResults({
      totalVram: totalVramReq,
      usableVram,
      usableKvCacheVram,
      reservedVram: effectiveReserve,
      modelVram,
      kvCacheVram,
      genSpeed,
      promptSpeed,
      sharedGen,
      sharedPrompt,
      ppScaling,
      membwScaling,
      maxTokenCountSimultaneous,
      fullLengthGenCount,
      error: null,
    });
  }, [
    effectiveCard,
    effectiveModel,
    kvQuantType,
    maxLength,
    minReserveVramGB,
    parallelGPUs,
    quantByteValue,
    quantType,
    userCount,
    vramUtilProportion,
  ]);

  return (
    <div className="space-y-6">
      <section className="panel p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <Languages className="h-4 w-4 text-slate-500" />
              <span className="sr-only">{t('language')}</span>
              <select
                className="bg-transparent text-sm font-semibold outline-none"
                value={locale}
                aria-label={t('language')}
                onChange={(event) => onLocaleChange?.(event.target.value as Locale)}
              >
                <option value="en_US">en_US</option>
                <option value="zh_CN">zh_CN</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-sm border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50" onClick={exportCurrentMetricsCsv}>
              <Download className="h-4 w-4" />
              {t('exportCurrent')}
            </button>
            <button type="button" className="btn btn-sm border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50" onClick={exportModelCatalogCsv}>
              <Database className="h-4 w-4" />
              {t('exportModels')}
            </button>
            <button type="button" className="btn btn-sm border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50" onClick={exportHardwareCatalogCsv}>
              <Cpu className="h-4 w-4" />
              {t('exportHardware')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatTile
            label={t('selectedModel')}
            value={effectiveModel?.name ?? t('none')}
            detail={effectiveModelMeta ? `${effectiveModelMeta.variant}, ${effectiveModel?.totalParamsB}B ${isZh ? '总参数' : 'total'}, ${effectiveModelRelease}` : undefined}
          />
          <StatTile
            label={t('selectedHardware')}
            value={effectiveCard ? stripVendor(effectiveCard.name) : t('none')}
            detail={effectiveCard ? `${inferArchitecture(effectiveCard)}, ${formatNumber(totalGpuVram)} GB ${isZh ? '总计' : 'total'}, ${effectiveGpuRelease}` : undefined}
          />
          <StatTile
            label={t('vramEstimate')}
            value={results ? `${results.totalVram.toFixed(1)} GB` : '0 GB'}
            detail={results ? `${formatNumber(vramPercent)}% ${t('installedMemory')}` : undefined}
          />
          <StatTile
            label={t('throughput')}
            value={results && !results.error ? `${results.genSpeed.toFixed(0)} tok/s` : t('blocked')}
            detail={results?.error ? t('adjustHardware') : t('aggregateGeneration')}
          />
        </div>
      </section>

      <section className="panel p-3">
        <div className="segmented grid-cols-3">
          <SegmentedButton active={entryMode === 'guided'} onClick={() => setEntryMode('guided')}>
            <SlidersHorizontal className="h-4 w-4" />
            {t('guidedSetup')}
          </SegmentedButton>
          <SegmentedButton active={entryMode === 'detailed'} onClick={() => setEntryMode('detailed')}>
            <List className="h-4 w-4" />
            {t('detailedControls')}
          </SegmentedButton>
          <SegmentedButton active={entryMode === 'theory'} onClick={() => setEntryMode('theory')}>
            <BookOpen className="h-4 w-4" />
            {t('theory')}
          </SegmentedButton>
        </div>
      </section>

      {showGuideResultBanner && entryMode === 'detailed' && (
        <section className="panel border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-emerald-950">{t('guidedReady')}</div>
              <p className="mt-1 text-sm text-emerald-700">
                {results?.error
                  ? results.error
                  : t('guidedResultReadyDesc')
                    .replace('{total}', results?.totalVram.toFixed(1) ?? '0.0')
                    .replace('{usable}', formatNumber(results?.usableVram ?? 0))}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800" onClick={() => { setEntryMode('guided'); setGuideStep(3); }}>
                {t('reopenGuide')}
              </button>
              <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => setShowGuideResultBanner(false)}>
                {t('dismiss')}
              </button>
            </div>
          </div>
        </section>
      )}

      {entryMode === 'theory' ? (
        <TheoryPanel locale={locale} parallelGPUs={parallelGPUs} sources={theorySources} />
      ) : entryMode === 'guided' ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(340px,0.44fr)]">
          <div className="space-y-4">
            <section className="panel p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{t('guidedIntroTitle')}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t('guidedIntroDesc')}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-2.5 w-2.5 rounded-full ${guideStep === step ? 'bg-indigo-600' : guideCompletedThrough >= step ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            <GuideStepPanel
              active={guideStep === 1}
              complete={guideCompletedThrough >= 1 && guideStep !== 1}
              onEdit={() => setGuideStep(1)}
              step={1}
              title={t('chooseModel')}
              subtitle={t('chooseModelSubtitle')}
              summary={<div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><StatTile label={t('model')} value={effectiveModel?.name ?? t('none')} detail={effectiveModelRelease} /><StatTile label={t('type')} value={effectiveModelMeta?.variant ?? 'Custom'} /><StatTile label={t('params')} value={`${effectiveModel?.totalParamsB ?? 0}B`} detail={`${effectiveModel?.activeParamsB ?? 0}B ${t('active')}`} /></div>}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                  <label className="field-shell flex items-center gap-2 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={modelQuery}
                      onChange={(event) => setModelQuery(event.target.value)}
                      placeholder={t('searchModelPlaceholder')}
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => setShowGuideModelDetailed((value) => !value)}
                  >
                    <Settings className="h-4 w-4" />
                    {t('detailedChoice')}
                  </button>
                </div>

                {guidedModelSearchResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {guidedModelSearchResults.map(({ model, meta }) => (
                      <button
                        key={model.name}
                        type="button"
                        className="picker-card"
                        data-active={selectedModel?.name === model.name}
                        onClick={() => {
                          setSelectedModel(model);
                          setModelMode('catalog');
                          setGuideModelStage('review');
                          completeGuideThrough(1);
                          setGuideStep(2);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="wrap-anywhere text-sm font-bold leading-snug text-slate-950">{model.name}</div>
                            <div className="mt-1 text-xs text-slate-500">{meta.family} / {meta.variant} / {t('released')} {formatReleaseDate(model.releaseDate)}</div>
                          </div>
                          <span className="rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: getModelColor(model.name) }}>{meta.scale}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!showGuideModelDetailed && (
                  <div className="space-y-4">
                    <SubstepRail
                      items={[
                        { label: t('family'), value: modelFamily, active: guideModelStage === 'family', complete: modelStageIndex > 0, onClick: () => setGuideModelStage('family') },
                        { label: t('type'), value: modelVariant, active: guideModelStage === 'variant', complete: modelStageIndex > 1, locked: modelStageIndex < 1, onClick: () => setGuideModelStage('variant') },
                        { label: t('scale'), value: modelScale, active: guideModelStage === 'scale', complete: modelStageIndex > 2, locked: modelStageIndex < 2, onClick: () => setGuideModelStage('scale') },
                        { label: t('review'), value: effectiveModel?.name, active: guideModelStage === 'review', complete: false, locked: modelStageIndex < 3, onClick: () => setGuideModelStage('review') },
                      ]}
                    />

                    {guideModelStage === 'family' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('modelSubstep1')}</div>
                          <h4 className="text-sm font-bold text-slate-950">{t('chooseModelFamily')}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {modelFamilies.map((family) => (
                            <button key={family} type="button" className="picker-card" data-active={modelFamily === family} onClick={() => applyGuideModelFamily(family)}>
                              <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-950">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getModelColor(family) }} />
                                {family}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">{modelCatalog.filter((item) => item.meta.family === family).length} {t('options')}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {guideModelStage === 'variant' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getModelColor(modelFamily) }} />
                            {modelFamily}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('modelSubstep2Type')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {modelVariants.map((variant) => (
                            <button key={variant} type="button" className="picker-card" data-active={modelVariant === variant} onClick={() => applyGuideModelVariant(variant)}>
                              <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-950">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getModelVariantColor(variant) }} />
                                {variant}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {guideModelStage === 'scale' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getModelColor(modelFamily) }} />
                            {modelFamily}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getModelVariantColor(modelVariant) }} />
                            {modelVariant}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('modelSubstep3Scale')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {modelScales.map((scale) => {
                            const scaleModel = modelCatalog.find((item) => item.meta.family === modelFamily && item.meta.variant === modelVariant && item.meta.scale === scale)?.model;
                            return (
                              <button key={scale} type="button" className="picker-card" data-active={modelScale === scale} onClick={() => applyGuideModelScale(scale)}>
                                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-950">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getModelColor(scaleModel?.name ?? modelFamily) }} />
                                  {scale}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {guideModelStage === 'review' && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-700">{t('combinationResult')}</div>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <StatTile label={t('model')} value={effectiveModel?.name ?? t('none')} detail={effectiveModelRelease} />
                          <StatTile label={t('type')} value={effectiveModelMeta?.variant ?? 'Custom'} detail={effectiveModelMeta?.family} />
                          <StatTile label={t('scale')} value={effectiveModelMeta?.scale ?? 'Custom'} detail={`${effectiveModel?.totalParamsB ?? 0}B total`} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showGuideModelDetailed && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-bold text-slate-950">{t('detailedModelChoice')}</div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('family')}</span><select value={modelFamily} onChange={(event) => selectStructuredModel(event.target.value, modelVariant, modelScale)} className="select select-bordered w-full text-sm">{modelFamilies.map((family) => <option key={family} value={family}>{family}</option>)}</select></label>
                      <label><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('type')}</span><select value={modelVariant} onChange={(event) => selectStructuredModel(modelFamily, event.target.value, modelScale)} className="select select-bordered w-full text-sm">{modelVariants.map((variant) => <option key={variant} value={variant}>{variant}</option>)}</select></label>
                      <label><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('scale')}</span><select value={modelScale} onChange={(event) => { selectStructuredModel(modelFamily, modelVariant, event.target.value); completeGuideThrough(1); setGuideStep(2); }} className="select select-bordered w-full text-sm">{modelScales.map((scale) => <option key={scale} value={scale}>{scale}</option>)}</select></label>
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('totalParamsB')}</span><input type="number" min={0.01} step={0.01} value={customTotalParamsB} onChange={(event) => { setModelMode('custom'); setCustomTotalParamsB(atLeast(event.target.value, 0.01, customTotalParamsB)); }} className="input input-bordered w-full text-sm" /></label>
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('activeParamsB')}</span><input type="number" min={0.01} step={0.01} value={customActiveParamsB} onChange={(event) => { setModelMode('custom'); setCustomActiveParamsB(atLeast(event.target.value, 0.01, customActiveParamsB)); }} className="input input-bordered w-full text-sm" /></label>
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('layers')}</span><input type="number" min={1} step={1} value={customLayers} onChange={(event) => { setModelMode('custom'); setCustomLayers(integerAtLeast(event.target.value, 1, customLayers)); }} className="input input-bordered w-full text-sm" /></label>
                    </div>
                  </div>
                )}

                {guideStep === 1 && guideModelStage !== 'review' && (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{t('chooseScaleHint')}</p>
                )}
              </div>
            </GuideStepPanel>

            <GuideStepPanel
              active={guideStep === 2}
              complete={guideCompletedThrough >= 2 && guideStep !== 2}
              locked={guideCompletedThrough < 1}
              onEdit={() => setGuideStep(2)}
              step={2}
              title={t('chooseHardware')}
              subtitle={t('chooseHardwareSubtitle')}
              summary={guideCompletedThrough < 1
                ? <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">{t('lockedModelFirst')}</div>
                : guideCompletedThrough < 2
                  ? <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{t('readyHardware')}</div>
                : <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><StatTile label={t('gpu')} value={effectiveCard ? stripVendor(effectiveCard.name) : t('none')} detail={effectiveGpuRelease} /><StatTile label={t('vram')} value={`${effectiveCard?.vramGb ?? 0} GB`} /><StatTile label={t('bandwidth')} value={`${formatNumber(effectiveCard?.memoryBandwidthGBs ?? 0, 0)} GB/s`} /></div>}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                  <label className="field-shell flex items-center gap-2 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={gpuQuery}
                      onChange={(event) => setGpuQuery(event.target.value)}
                      placeholder={t('searchGpuPlaceholder')}
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => setShowGuideGpuDetailed((value) => !value)}
                  >
                    <Settings className="h-4 w-4" />
                    {t('detailedChoice')}
                  </button>
                </div>

                {guidedGpuSearchResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {guidedGpuSearchResults.map((gpu) => (
                      <button key={gpu.name} type="button" className="picker-card" data-active={selectedCard?.name === gpu.name} onClick={() => applyGuideGpuCard(gpu)}>
                        <div className="wrap-anywhere text-sm font-bold leading-snug text-slate-950">{stripVendor(gpu.name)}</div>
                        <div className="mt-1 text-xs text-slate-500">{gpuClass(gpu)} / {inferArchitecture(gpu)} / {t('released')} {formatReleaseDate(gpu.releaseDate)}</div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600"><span>{gpu.vramGb} GB</span><span>{formatNumber(gpu.memoryBandwidthGBs, 0)} GB/s</span><span>{formatNumber(gpu.processPower.fp16 ?? 0)} TFLOPS</span></div>
                      </button>
                    ))}
                  </div>
                )}

                {!showGuideGpuDetailed && (
                  <div className="space-y-4">
                    <SubstepRail
                      items={[
                        { label: t('vendor'), value: gpuVendorFilter === 'All' ? undefined : gpuVendorFilter, active: guideGpuStage === 'vendor', complete: gpuStageIndex > 0, onClick: () => setGuideGpuStage('vendor') },
                        { label: t('class'), value: guideGpuClass, active: guideGpuStage === 'class', complete: gpuStageIndex > 1, locked: gpuStageIndex < 1, onClick: () => setGuideGpuStage('class') },
                        { label: t('card'), value: effectiveCard ? stripVendor(effectiveCard.name) : undefined, active: guideGpuStage === 'card', complete: gpuStageIndex > 2, locked: gpuStageIndex < 2, onClick: () => setGuideGpuStage('card') },
                        { label: t('review'), value: effectiveCard ? `${effectiveCard.vramGb} GB` : undefined, active: guideGpuStage === 'review', complete: false, locked: gpuStageIndex < 3, onClick: () => setGuideGpuStage('review') },
                      ]}
                    />

                    {guideGpuStage === 'vendor' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Hardware substep 1</div>
                          <h4 className="text-sm font-bold text-slate-950">{t('vendor')}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {guidedGpuVendors.map((vendor) => (
                            <button
                              key={vendor}
                              type="button"
                              className="picker-card"
                              data-active={gpuVendorFilter === vendor}
                              onClick={() => applyGuideGpuVendor(vendor)}
                            >
                              <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-950">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getVendorColor(vendor) }} />
                                {vendor}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">{gpuCards.filter((gpu) => getGpuVendor(gpu.name) === vendor).length} cards</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {guideGpuStage === 'class' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2 py-1 text-xs font-bold text-slate-700" style={{ borderColor: getVendorColor(gpuVendorFilter) }}>
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getVendorColor(gpuVendorFilter) }} />
                            {gpuVendorFilter}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('hardwareSubstep2Class')}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {guidedGpuClasses.map((item) => (
                            <button key={item} type="button" className="picker-card text-center" data-active={guideGpuClass === item} onClick={() => applyGuideGpuClass(item)}>
                              <div className="text-sm font-bold text-slate-950">{item}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {guideGpuStage === 'card' && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2 py-1 text-xs font-bold text-slate-700" style={{ borderColor: getVendorColor(gpuVendorFilter) }}>
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getVendorColor(gpuVendorFilter) }} />
                            {gpuVendorFilter}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{guideGpuClass}</span>
                          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('hardwareSubstep3Card')}</span>
                        </div>
                        <div className="grid max-h-[22rem] grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                          {guidedGpuChoices.map((gpu) => (
                            <button key={gpu.name} type="button" className="picker-card" data-active={selectedCard?.name === gpu.name} onClick={() => applyGuideGpuCard(gpu)}>
                              <div className="wrap-anywhere text-sm font-bold leading-snug text-slate-950">{stripVendor(gpu.name)}</div>
                              <div className="mt-1 text-xs text-slate-500">{inferArchitecture(gpu)} / {t('released')} {formatReleaseDate(gpu.releaseDate)}</div>
                              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600"><span>{gpu.vramGb} GB</span><span>{formatNumber(gpu.memoryBandwidthGBs, 0)} GB/s</span><span>{formatNumber(gpu.processPower.fp16 ?? 0)} TFLOPS</span></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {guideGpuStage === 'review' && (
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-700">{t('combinationResult')}</div>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <StatTile label={t('gpu')} value={effectiveCard ? stripVendor(effectiveCard.name) : t('none')} detail={effectiveGpuRelease} />
                          <StatTile label={t('class')} value={effectiveCard ? gpuClass(effectiveCard) : 'Custom'} detail={effectiveCard ? inferArchitecture(effectiveCard) : customArchitecture} />
                          <StatTile label={t('vram')} value={`${effectiveCard?.vramGb ?? 0} GB`} detail={`${formatNumber(effectiveCard?.memoryBandwidthGBs ?? 0, 0)} GB/s`} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {showGuideGpuDetailed && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-bold text-slate-950">{t('detailedHardwareChoice')}</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('supplier')}</span><select value={customSupplier} onChange={(event) => { setGpuMode('numeric'); setCustomSupplier(event.target.value); }} className="select select-bordered w-full text-sm">{customSuppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}</select></label>
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('architecture')}</span><select value={customArchitecture} onChange={(event) => { setGpuMode('numeric'); setCustomArchitecture(event.target.value); }} className="select select-bordered w-full text-sm">{customArchitectures.map((architecture) => <option key={architecture} value={architecture}>{architecture}</option>)}</select></label>
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('vram')} (GB)</span><input type="number" min={1} step={1} value={customVramGB} onChange={(event) => { setGpuMode('numeric'); setCustomVramGB(atLeast(event.target.value, 1, customVramGB)); }} className="input input-bordered w-full text-sm" /></label>
                      <label><span className="mb-1 block text-sm font-medium text-slate-700">{t('memoryBw')}</span><input type="number" min={1} step={1} value={customMemoryBandwidthGBs} onChange={(event) => { setGpuMode('numeric'); setCustomMemoryBandwidthGBs(atLeast(event.target.value, 1, customMemoryBandwidthGBs)); }} className="input input-bordered w-full text-sm" /></label>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-between gap-2">
                  <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" onClick={() => setGuideStep(1)}>{t('back')}</button>
                  {guideGpuStage !== 'review' && (
                    <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{t('chooseGpuHint')}</span>
                  )}
                </div>
              </div>
            </GuideStepPanel>

            <GuideStepPanel
              active={guideStep === 3}
              complete={guideCompletedThrough >= 3 && guideStep !== 3}
              locked={guideCompletedThrough < 2}
              onEdit={() => setGuideStep(3)}
              step={3}
              title={t('perfParams')}
              subtitle={t('perfParamsSubtitle')}
              summary={guideCompletedThrough < 2
                ? <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">{t('lockedHardwareFirst')}</div>
                : guideCompletedThrough < 3
                  ? <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{t('readyPerf')}</div>
                : <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><StatTile label={t('weights')} value={quantType.toUpperCase()} /><StatTile label={t('kvCache')} value={kvQuantType.toUpperCase()} /><StatTile label={t('context')} value={formatCompact(maxLength)} detail={`${userCount} ${t('users')}, ${parallelGPUs} ${t('gpuUnit')}`} /></div>}
            >
              <div className="space-y-5">
                <SubstepRail
                  items={[
                    { label: t('preset'), value: t('startPoint'), active: guideRuntimeStage === 'preset', complete: runtimeStageIndex > 0, onClick: () => setGuideRuntimeStage('preset') },
                    { label: t('weights'), value: quantType.toUpperCase(), active: guideRuntimeStage === 'weights', complete: runtimeStageIndex > 1, locked: runtimeStageIndex < 1, onClick: () => setGuideRuntimeStage('weights') },
                    { label: t('kvCache'), value: kvQuantType.toUpperCase(), active: guideRuntimeStage === 'kv', complete: runtimeStageIndex > 2, locked: runtimeStageIndex < 2, onClick: () => setGuideRuntimeStage('kv') },
                    { label: t('workload'), value: `${formatCompact(maxLength)}, ${userCount} ${t('users')}`, active: guideRuntimeStage === 'workload', complete: false, locked: runtimeStageIndex < 3, onClick: () => setGuideRuntimeStage('workload') },
                  ]}
                />

                {guideRuntimeStage === 'preset' && (
                  <div>
                  <div className="mb-2 text-sm font-semibold text-slate-800">{t('estimationPreset')}</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { id: 'balanced', label: t('balanced'), desc: t('balancedDesc') },
                      { id: 'memory', label: t('memorySaver'), desc: t('memorySaverDesc') },
                      { id: 'throughput', label: t('throughputProbe'), desc: t('throughputProbeDesc') },
                      { id: 'long', label: t('longContext'), desc: t('longContextDesc') },
                    ].map((preset) => (
                      <button key={preset.id} type="button" className="picker-card" onClick={() => applyRuntimePreset(preset.id as 'balanced' | 'memory' | 'throughput' | 'long')}>
                        <div className="text-sm font-bold text-slate-950">{preset.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                  </div>
                )}

                {guideRuntimeStage === 'weights' && (
                  <div>
                  <div className="mb-2 text-sm font-semibold text-slate-800">{t('weightQuantization')}</div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {runtimeQuantOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setQuantType(option.value);
                          setGuideRuntimeStage('kv');
                        }}
                        className="picker-card px-3 py-3 text-center"
                        data-active={quantType === option.value}
                      >
                        <div className="text-sm font-bold text-slate-950">{option.label}</div>
                        <div className="mt-1 text-xs text-slate-500">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  </div>
                )}

                {guideRuntimeStage === 'kv' && (
                  <div>
                  <div className="mb-2 text-sm font-semibold text-slate-800">{t('kvCachePrecision')}</div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-5">
                    {kvQuantOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setKvQuantType(option.value);
                          setGuideRuntimeStage('workload');
                        }}
                        className="picker-card px-3 py-3 text-center"
                        data-active={kvQuantType === option.value}
                      >
                        <div className="text-sm font-bold text-slate-950">{option.label}</div>
                        <div className="mt-1 text-xs text-slate-500">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  </div>
                )}

                {guideRuntimeStage === 'workload' && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label><span className="mb-2 block text-sm font-semibold text-slate-800">{t('concurrentUsers')}</span><DraftNumberInput integer min={1} step={1} value={userCount} onValueChange={setUserCount} /></label>
                      <label><span className="mb-2 block text-sm font-semibold text-slate-800">{t('parallelGpus')}</span><DraftNumberInput integer min={1} step={1} value={parallelGPUs} onValueChange={setParallelGPUs} /></label>
                      <label><span className="mb-2 block text-sm font-semibold text-slate-800">{t('maxContextLength')}</span><DraftNumberInput integer min={1024} step={1024} value={maxLength} onValueChange={setMaxLength} /></label>
                      <label><span className="mb-2 block text-sm font-semibold text-slate-800">{t('reserveVramGb')}</span><DraftNumberInput min={0} step={0.5} value={minReserveVramGB} onValueChange={setMinReserveVramGB} /></label>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('currentPerfAssumptions')}</div>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <StatTile label={t('memoryPolicy')} value={`${Math.round(vramUtilProportion * 100)}%`} detail={`${formatNumber(minReserveVramGB)} GB reserve`} />
                        <StatTile label={t('workload')} value={`${userCount} ${t('users')}`} detail={`${formatCompact(maxLength)} ${t('context')}`} />
                        <StatTile label={t('parallelism')} value={`${parallelGPUs} ${t('gpuUnit')}`} detail={`scale x${results?.ppScaling.toFixed(2) ?? '1.00'} / x${results?.membwScaling.toFixed(2) ?? '1.00'}`} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </GuideStepPanel>

            {guideStep === 3 && guideRuntimeStage === 'workload' && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">{t('stepsComplete')}</div>
                    <h3 className="mt-1 text-base font-bold text-slate-950">{t('readyToCompute')}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{t('readyToComputeDesc')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => setGuideStep(2)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t('back')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10"
                      onClick={() => { completeGuideThrough(3); setGuideStep(4); setActiveTab('results'); setEntryMode('detailed'); setShowGuideResultBanner(true); }}
                    >
                      <Zap className="h-4 w-4" />
                      {t('computeFinalResult')}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="panel p-4">
              <h3 className="text-sm font-bold text-slate-950">{t('setupSummary')}</h3>
              <div className="mt-4 space-y-3">
                <StatTile label={t('model')} value={effectiveModel?.name ?? t('none')} detail={`${effectiveModelMeta?.variant ?? 'Custom'}, ${effectiveModelRelease}`} />
                <StatTile label={t('hardware')} value={effectiveCard ? stripVendor(effectiveCard.name) : t('none')} detail={`${effectiveCard ? inferArchitecture(effectiveCard) : customArchitecture}, ${effectiveGpuRelease}`} />
                <StatTile label={t('params')} value={`${quantType.toUpperCase()} / ${kvQuantType.toUpperCase()}`} detail={`${formatCompact(maxLength)} ${t('context')}, ${userCount} ${t('users')}`} />
              </div>
            </section>
            <section className="panel p-4">
              <h3 className="text-sm font-bold text-slate-950">{t('nextAction')}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {guideStep === 1 && t('nextActionModel')}
                {guideStep === 2 && t('nextActionHardware')}
                {guideStep === 3 && t('nextActionRuntime')}
                {guideStep === 4 && t('nextActionDone')}
              </p>
            </section>
          </aside>
        </div>
      ) : (
      <div className="space-y-4">
        <section className="panel p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Columns2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-950">{t('focusLayout')}</div>
                <p className="text-xs text-slate-500">
                  {t('paramsLabel')} {effectiveDetailLayout.params}% / {t('workspaceLabel')} {effectiveDetailLayout.workspace}% - {detailLayoutMode === 'auto' ? t('auto') : t('manual')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 data-[active=true]:border-indigo-300 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700"
                data-active={detailLayoutMode === 'auto'}
                onClick={() => setDetailLayoutMode('auto')}
              >
                <Columns2 className="h-4 w-4" />
                {t('auto')}
              </button>
              <button
                type="button"
                title={t('shrinkParamPanel')}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                disabled={effectiveDetailLayoutRatio === '25-75'}
                onClick={() => {
                  setDetailLayoutMode('manual');
                  setManualDetailLayoutRatio(shiftDetailLayoutRatio(effectiveDetailLayoutRatio, -1));
                }}
              >
                <span className="text-base font-black leading-none">-</span>
                {t('paramsLabel')}
              </button>
              <button
                type="button"
                title={t('expandParamPanel')}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                disabled={effectiveDetailLayoutRatio === '75-25'}
                onClick={() => {
                  setDetailLayoutMode('manual');
                  setManualDetailLayoutRatio(shiftDetailLayoutRatio(effectiveDetailLayoutRatio, 1));
                }}
              >
                <span className="text-base font-black leading-none">+</span>
                {t('paramsLabel')}
              </button>
            </div>
          </div>
        </section>

      <div className={`grid grid-cols-1 gap-6 ${effectiveDetailLayout.className}`}>
        <div className={`detail-setup-stack space-y-5 min-w-0 ${compactDetailParams ? 'detail-params-compact' : ''}`}>
          <section className="panel p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('setupControls')}</div>
                <h2 className="mt-1 text-base font-bold text-slate-950">{detailConfigSection === 'summary' ? t('selectedConfiguration') : t('editingConfiguration')}</h2>
              </div>
              {detailConfigSection !== 'summary' && (
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={collapseDetailConfigSection}
                >
                  {t('done')}
                </button>
              )}
            </div>
            <div className="adaptive-control-grid">
              <DetailSummaryCard
                active={detailConfigSection === 'model'}
                accentColor={getModelColor(effectiveModel?.name ?? modelFamily)}
                detail={`${effectiveModelMeta?.variant ?? 'Custom'} / ${quantType.toUpperCase()} / ${t('released')} ${effectiveModelRelease}`}
                icon={<Layers className="h-4 w-4" />}
                label={t('model')}
                onClick={() => openDetailConfigSection('model')}
                value={effectiveModel?.name ?? t('noModelSelected')}
              />
              <DetailSummaryCard
                active={detailConfigSection === 'hardware'}
                accentColor={effectiveCard ? getGpuColor(effectiveCard.name) : getVendorColor(customSupplier as VendorFilter | 'Intel' | 'Other')}
                detail={`${effectiveCard ? inferArchitecture(effectiveCard) : customArchitecture} / ${formatNumber(totalGpuVram)} GB total VRAM`}
                icon={<Cpu className="h-4 w-4" />}
                label={t('hardware')}
                onClick={() => openDetailConfigSection('hardware')}
                value={effectiveCard ? stripVendor(effectiveCard.name) : t('customGpu')}
              />
              <DetailSummaryCard
                active={detailConfigSection === 'deployment'}
                accentColor="#7c3aed"
                detail={`${kvQuantType.toUpperCase()} KV / ${formatCompact(maxLength)} context / ${parallelGPUs} GPU`}
                icon={<Settings className="h-4 w-4" />}
                label={t('deployment')}
                onClick={() => openDetailConfigSection('deployment')}
                value={`${userCount} ${t('users')}`}
              />
            </div>
          </section>

          <section className={`panel p-4 sm:p-5 ${detailConfigSection === 'model' ? '' : 'hidden'}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-950">{t('model')}</h2>
                  <p className="text-sm text-slate-500">{t('modelPanelDesc')}</p>
                </div>
              </div>
            </div>

            <div className="segmented mb-4 grid-cols-3">
              <SegmentedButton active={modelMode === 'catalog'} onClick={() => setModelMode('catalog')}>
                <List className="h-4 w-4" />
                {t('catalog')}
              </SegmentedButton>
              <SegmentedButton active={modelMode === 'structured'} onClick={() => setModelMode('structured')}>
                <SlidersHorizontal className="h-4 w-4" />
                {t('structured')}
              </SegmentedButton>
              <SegmentedButton active={modelMode === 'custom'} onClick={() => setModelMode('custom')}>
                <Settings className="h-4 w-4" />
                {t('custom')}
              </SegmentedButton>
            </div>

            {modelMode === 'catalog' && (
              <div className="space-y-3">
                <label className="field-shell flex items-center gap-2 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={modelQuery}
                    onChange={(event) => setModelQuery(event.target.value)}
                    placeholder={t('searchModelDetailedPlaceholder')}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </label>
                <div className="adaptive-card-grid max-h-[28rem] overflow-y-auto pr-1">
                  {filteredModels.map(({ model, meta }) => (
                    <button
                      key={model.name}
                      type="button"
                      className="picker-card"
                      data-active={selectedModel?.name === model.name}
                      onClick={() => {
                        setSelectedModel(model);
                        setModelMode('catalog');
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="wrap-anywhere text-sm font-bold leading-snug text-slate-950">{model.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{meta.family} / {meta.variant}</div>
                        </div>
                        <span className="rounded-full px-2 py-1 text-xs font-semibold text-white" style={{ backgroundColor: getModelColor(model.name) }}>
                          {meta.scale}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <span>{model.totalParamsB}B total</span>
                        <span>{model.activeParamsB}B active</span>
                        <span>{model.contextLength ? formatCompact(model.contextLength) : 'custom'} ctx</span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-400">{t('released')} {formatReleaseDate(model.releaseDate)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modelMode === 'structured' && (
              <div className="adaptive-field-grid">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('family')}</span>
                  <select
                    value={modelFamily}
                    onChange={(event) => selectStructuredModel(event.target.value, modelVariant, modelScale)}
                    className="select select-bordered w-full text-sm"
                  >
                    {modelFamilies.map((family) => <option key={family} value={family}>{family}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('type')}</span>
                  <select
                    value={modelVariant}
                    onChange={(event) => selectStructuredModel(modelFamily, event.target.value, modelScale)}
                    className="select select-bordered w-full text-sm"
                  >
                    {modelVariants.map((variant) => <option key={variant} value={variant}>{variant}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t('scale')}</span>
                  <select
                    value={modelScale}
                    onChange={(event) => selectStructuredModel(modelFamily, modelVariant, event.target.value)}
                    className="select select-bordered w-full text-sm"
                  >
                    {modelScales.map((scale) => <option key={scale} value={scale}>{scale}</option>)}
                  </select>
                </label>
                {selectedModel && (
                  <div className="panel-compact sm:col-span-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-950">{selectedModel.name}</div>
                        <div className="text-xs text-slate-500">
                          {selectedModel.layers} layers, {selectedModel.numKVHeads} KV heads, {selectedModel.headDim} head dim
                        </div>
                      </div>
                      <button type="button" className="text-sm font-semibold text-indigo-600" onClick={() => setActiveTab('model')}>
                        {t('viewModelDetails')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {modelMode === 'custom' && (
              <div className="adaptive-field-grid">
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('totalParamsB')}</span>
                  <input type="number" min={0.01} step={0.01} value={customTotalParamsB} onChange={(event) => setCustomTotalParamsB(atLeast(event.target.value, 0.01, customTotalParamsB))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    {t('modelSizeGb')}
                    <button type="button" onClick={() => { setCustomModelSizeGB(currentModelSizeEstimate); setModelSizeUserModified(false); }} className="text-xs font-semibold text-indigo-600">{t('reset')}</button>
                  </span>
                  <input type="number" min={0.01} step={0.01} value={customModelSizeGB} onChange={(event) => { setCustomModelSizeGB(atLeast(event.target.value, 0.01, customModelSizeGB)); setModelSizeUserModified(true); }} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('activeParamsB')}</span>
                  <input type="number" min={0.01} step={0.01} value={customActiveParamsB} onChange={(event) => setCustomActiveParamsB(atLeast(event.target.value, 0.01, customActiveParamsB))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('layers')}</span>
                  <input type="number" min={1} step={1} value={customLayers} onChange={(event) => setCustomLayers(integerAtLeast(event.target.value, 1, customLayers))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('kvHeads')}</span>
                  <input type="number" min={1} step={1} value={customNumKVHeads} onChange={(event) => setCustomNumKVHeads(integerAtLeast(event.target.value, 1, customNumKVHeads))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('headDim')}</span>
                  <input type="number" min={1} step={1} value={customHeadDim} onChange={(event) => setCustomHeadDim(integerAtLeast(event.target.value, 1, customHeadDim))} className="input input-bordered w-full text-sm" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                    {t('kvSizeKbToken')}
                    <button type="button" onClick={() => { setCustomPerKVsizeFp8(currentKvEstimate); setKvSizeUserModified(false); }} className="text-xs font-semibold text-indigo-600">{t('reset')}</button>
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={Math.round(customPerKVsizeFp8 / 1024)}
                    onChange={(event) => {
                      setCustomPerKVsizeFp8(integerAtLeast(event.target.value, 1, Math.round(customPerKVsizeFp8 / 1024)) * 1024);
                      setKvSizeUserModified(true);
                    }}
                    className="input input-bordered w-full text-sm"
                  />
                </label>
              </div>
            )}

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold text-slate-800">{t('weightQuantization')}</div>
              <div className="adaptive-choice-grid">
                {runtimeQuantOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuantType(option.value)}
                    className="picker-card px-3 py-3 text-center"
                    data-active={quantType === option.value}
                  >
                    <div className="text-sm font-bold text-slate-950">{option.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={`panel p-4 sm:p-5 ${detailConfigSection === 'hardware' ? '' : 'hidden'}`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950">{t('hardware')}</h2>
                <p className="text-sm text-slate-500">{t('hardwarePanelDesc')}</p>
              </div>
            </div>

            <div className="segmented mb-4 grid-cols-2">
              <SegmentedButton active={gpuMode === 'catalog'} onClick={() => setGpuMode('catalog')}>
                <Database className="h-4 w-4" />
                {t('catalog')}
              </SegmentedButton>
              <SegmentedButton active={gpuMode === 'numeric'} onClick={() => setGpuMode('numeric')}>
                <SlidersHorizontal className="h-4 w-4" />
                {t('numeric')}
              </SegmentedButton>
            </div>

            {gpuMode === 'catalog' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                  <label className="field-shell flex items-center gap-2 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={gpuQuery}
                      onChange={(event) => setGpuQuery(event.target.value)}
                      placeholder={t('searchGpuDetailedPlaceholder')}
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </label>
                  <div className="segmented grid-cols-3">
                    {(['All', 'NVIDIA', 'AMD'] as VendorFilter[]).map((vendor) => (
                      <SegmentedButton key={vendor} active={gpuVendorFilter === vendor} onClick={() => setGpuVendorFilter(vendor)}>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getVendorColor(vendor) }} />
                        <span>{vendor}</span>
                      </SegmentedButton>
                    ))}
                  </div>
                </div>
                <div className="adaptive-card-grid max-h-[28rem] overflow-y-auto pr-1">
                  {filteredGpus.map((gpu) => (
                    <button
                      type="button"
                      key={gpu.name}
                      className="picker-card"
                      data-active={selectedCard?.name === gpu.name}
                      onClick={() => {
                        setSelectedCard(gpu);
                        setKvQuantType(gpu.kvQuantType ?? 'fp16');
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="wrap-anywhere text-sm font-bold leading-snug text-slate-950">{stripVendor(gpu.name)}</div>
                          <div className="mt-1 text-xs text-slate-500">{gpuClass(gpu)} / {inferArchitecture(gpu)}</div>
                        </div>
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: getGpuColor(gpu.name) }} />
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <span>{gpu.vramGb} GB</span>
                        <span>{formatNumber(gpu.memoryBandwidthGBs, 0)} GB/s</span>
                        <span>{formatNumber(gpu.processPower.fp16 ?? 0)} TFLOPS</span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-400">{t('released')} {formatReleaseDate(gpu.releaseDate)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gpuMode === 'numeric' && (
              <div className="adaptive-field-grid">
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('supplier')}</span>
                  <select value={customSupplier} onChange={(event) => setCustomSupplier(event.target.value)} className="select select-bordered w-full text-sm">
                    {customSuppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('architecture')}</span>
                  <select value={customArchitecture} onChange={(event) => setCustomArchitecture(event.target.value)} className="select select-bordered w-full text-sm">
                    {customArchitectures.map((architecture) => <option key={architecture} value={architecture}>{architecture}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('vram')} (GB)</span>
                  <input type="number" min={1} step={1} value={customVramGB} onChange={(event) => setCustomVramGB(atLeast(event.target.value, 1, customVramGB))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('memoryBw')}</span>
                  <input type="number" min={1} step={1} value={customMemoryBandwidthGBs} onChange={(event) => setCustomMemoryBandwidthGBs(atLeast(event.target.value, 1, customMemoryBandwidthGBs))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">FP16 TFLOPS</span>
                  <input type="number" min={0} step={0.1} value={customProcessPowerFP16} onChange={(event) => setCustomProcessPowerFP16(atLeast(event.target.value, 0, customProcessPowerFP16))} className="input input-bordered w-full text-sm" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-medium text-slate-700">{t('defaultKvQuant')}</span>
                  <select value={customKvQuantType} onChange={(event) => setCustomKvQuantType(event.target.value as KvQuantType)} className="select select-bordered w-full text-sm">
                    {kvQuantOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>
            )}
          </section>

          <section className={`panel p-4 sm:p-5 ${detailConfigSection === 'deployment' ? '' : 'hidden'}`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950">{t('deployment')}</h2>
                <p className="text-sm text-slate-500">{t('deploymentPanelDesc')}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-800">{t('kvCachePrecision')}</div>
                <div className="adaptive-choice-grid">
                  {kvQuantOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setKvQuantType(option.value)}
                      className="picker-card px-3 py-3 text-center"
                      data-active={kvQuantType === option.value}
                    >
                      <div className="text-sm font-bold text-slate-950">{option.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="adaptive-field-grid">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-800"><Users className="mr-1 inline h-4 w-4" />{t('concurrentUsers')}</span>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={userSliderMax} value={Math.min(userCount, userSliderMax)} onChange={(event) => setUserCount(integerAtLeast(event.target.value, 1, userCount))} className="slider flex-1" />
                    <DraftNumberInput integer min={1} step={1} value={userCount} onValueChange={setUserCount} className="input input-bordered w-24 text-center text-sm" />
                  </div>
                  <span className="mt-1 block text-xs text-slate-400">{t('sliderMax')}: {userSliderMax.toLocaleString()}</span>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-800"><Zap className="mr-1 inline h-4 w-4" />{t('parallelGpus')}</span>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={gpuSliderMax} value={Math.min(parallelGPUs, gpuSliderMax)} onChange={(event) => setParallelGPUs(integerAtLeast(event.target.value, 1, parallelGPUs))} className="slider flex-1" />
                    <DraftNumberInput integer min={1} step={1} value={parallelGPUs} onValueChange={setParallelGPUs} className="input input-bordered w-24 text-center text-sm" />
                  </div>
                  <span className="mt-1 block text-xs text-slate-400">{t('sliderMax')}: {gpuSliderMax.toLocaleString()}</span>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800"><HardDrive className="mr-1 inline h-4 w-4" />{t('maxContextLength')}: {maxLength.toLocaleString()} tokens</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <input type="range" min={1024} max={contextSliderMax} step={1024} value={Math.min(maxLength, contextSliderMax)} onChange={(event) => setMaxLength(integerAtLeast(event.target.value, 1024, maxLength))} className="slider w-full" />
                    <div className="mt-1 flex justify-between text-xs text-slate-400">
                      <span>1K</span>
                      <span>128K</span>
                      <span>512K</span>
                      <span>{formatCompact(contextSliderMax)}</span>
                    </div>
                  </div>
                  <DraftNumberInput integer min={1024} step={1024} value={maxLength} onValueChange={setMaxLength} className="input input-bordered w-full text-center text-sm sm:w-36" />
                </div>
              </label>

              <div className="adaptive-field-grid">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-800">{t('vramUtilization')}: {Math.round(vramUtilProportion * 100)}%</span>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={100} value={Math.round(vramUtilProportion * 100)} onChange={(event) => setVramUtilProportion(boundedPercent(event.target.value, vramUtilProportion * 100) / 100)} className="slider flex-1" />
                    <DraftNumberInput integer min={1} max={100} step={1} value={Math.round(vramUtilProportion * 100)} onValueChange={(nextValue) => setVramUtilProportion(nextValue / 100)} className="input input-bordered w-24 text-center text-sm" />
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-800">{t('reserveVram')}: {formatNumber(minReserveVramGB)} GB</span>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={reserveSliderMax} step={0.5} value={Math.min(minReserveVramGB, reserveSliderMax)} onChange={(event) => setMinReserveVramGB(atLeast(event.target.value, 0, minReserveVramGB))} className="slider flex-1" />
                    <DraftNumberInput min={0} step={0.5} value={minReserveVramGB} onValueChange={setMinReserveVramGB} className="input input-bordered w-24 text-center text-sm" />
                  </div>
                  <span className="mt-1 block text-xs text-slate-400">{t('sliderMax')}: {reserveSliderMax.toLocaleString()} GB</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <section className="panel p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">{t('workspace')}</h2>
              <p className="text-sm text-slate-500">{t('workspaceDesc')}</p>
            </div>
          </div>

          <div className="segmented mb-5 grid-cols-3 sm:grid-cols-5" role="tablist" aria-label={t('estimatorViews')}>
            {[
              { id: 'results', label: t('results'), icon: BarChart3 },
              { id: 'formulas', label: t('formulas'), icon: Gauge },
              { id: 'model', label: t('model'), icon: Layers },
              { id: 'hardware', label: t('hardware'), icon: Cpu },
              { id: 'hints', label: t('hints'), icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-label={tab.label}
                  aria-selected={activeTab === tab.id}
                  className="segmented-button"
                  data-active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as CalculatorTab)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'results' && (
            <div className="space-y-5">
              {results?.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="font-semibold text-red-900">{t('configurationIssue')}</div>
                  <p className="mt-1 text-sm text-red-700">{results.error}</p>
                </div>
              )}

              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <div className="text-sm font-medium text-slate-300">{t('totalVramRequired')}</div>
                    <div className="mt-1 text-4xl font-black tracking-tight">{results ? results.totalVram.toFixed(1) : '0.0'} GB</div>
                  </div>
                  <div className="text-sm text-slate-300">
                    {results ? `${formatNumber(results.usableVram)} ${t('usableAfterReserve')}` : t('awaitingConfiguration')}
                  </div>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
                  <div className={results?.error ? 'h-full rounded-full bg-red-400' : 'h-full rounded-full bg-indigo-400'} style={{ width: `${vramPercent}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-300">{formatNumber(vramPercent)}% {t('installedGpuMemory')}</div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatTile label={t('modelWeights')} value={`${(results?.modelVram ?? 0).toFixed(1)} GB`} detail={`${quantType.toUpperCase()} ${t('weights').toLowerCase()}`} />
                <StatTile label={t('kvCacheRequest')} value={`${(results?.kvCacheVram ?? 0).toFixed(1)} GB`} detail={`${formatCompact(maxLength)} tokens, ${kvQuantType.toUpperCase()}`} />
                <StatTile label={t('reserve')} value={`${(results?.reservedVram ?? 0).toFixed(1)} GB`} detail={`${Math.round(vramUtilProportion * 100)}% ${t('utilizationCap')}`} />
              </div>

              {!results?.error && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="panel-compact p-4">
                    <h3 className="text-sm font-bold text-slate-950">{t('throughput')}</h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <StatTile label={t('generation')} value={`${(results?.genSpeed ?? 0).toFixed(0)} tok/s`} />
                      <StatTile label={t('prompt')} value={`${(results?.promptSpeed ?? 0).toFixed(0)} tok/s`} />
                    </div>
                  </div>
                  <div className="panel-compact p-4">
                    <h3 className="text-sm font-bold text-slate-950">{t('capacity')}</h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <StatTile label={t('fullSequences')} value={(results?.fullLengthGenCount ?? 0).toFixed(2)} />
                      <StatTile label={t('tokenBudget')} value={formatNumber(results?.maxTokenCountSimultaneous ?? 0, 0)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              <div className="panel-compact p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{t('selectedModel')}</div>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{effectiveModel?.name ?? t('none')}</h3>
                    <p className="mt-1 text-sm text-slate-500">{effectiveModelMeta?.family} / {effectiveModelMeta?.variant} / {effectiveModelMeta?.scale}</p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-sm font-bold text-white" style={{ backgroundColor: getModelColor(effectiveModel?.name ?? '') }}>
                    {effectiveModel?.totalParamsB ?? 0}B
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <StatTile label={t('totalParams')} value={`${effectiveModel?.totalParamsB ?? 0}B`} />
                  <StatTile label={t('activeParams')} value={`${effectiveModel?.activeParamsB ?? 0}B`} />
                  <StatTile label={t('layers')} value={`${effectiveModel?.layers ?? 0}`} />
                  <StatTile label={t('nativeContext')} value={effectiveModel?.contextLength ? formatCompact(effectiveModel.contextLength) : t('customValue')} />
                  <StatTile label={t('released')} value={effectiveModelRelease} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="panel-compact p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-950">{t('attentionKv')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('hiddenSize')}</span><span className="font-semibold">{effectiveModel?.hiddenSize ?? 0}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('kvHeads')}</span><span className="font-semibold">{effectiveModel?.numKVHeads ?? 0}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('headDim')}</span><span className="font-semibold">{effectiveModel?.headDim ?? 0}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('kvBytesValue')}</span><span className="font-semibold">{kvByteValue}</span></div>
                  </div>
                </div>
                <div className="panel-compact p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-950">{t('modelSources')}</h4>
                  <SourceLinks locale={locale} sources={modelSources} />
                  {effectiveModel?.sourceNote && <p className="mt-3 text-xs text-slate-500">{effectiveModel.sourceNote}</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="panel-compact p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{t('selectedHardware')}</div>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{effectiveCard ? stripVendor(effectiveCard.name) : t('none')}</h3>
                    <p className="mt-1 text-sm text-slate-500">{effectiveCard ? `${gpuClass(effectiveCard)} / ${inferArchitecture(effectiveCard)}` : t('noGpuSelected')}</p>
                  </div>
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: getGpuColor(effectiveCard?.name ?? '') }} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <StatTile label={t('vramPerGpu')} value={`${effectiveCard?.vramGb ?? 0} GB`} />
                  <StatTile label={t('totalVram')} value={`${formatNumber(totalGpuVram)} GB`} />
                  <StatTile label={t('bandwidth')} value={`${formatNumber(effectiveCard?.memoryBandwidthGBs ?? 0, 0)} GB/s`} />
                  <StatTile label="FP16" value={`${formatNumber(effectiveCard?.processPower.fp16 ?? 0)} TFLOPS`} />
                  <StatTile label={t('released')} value={effectiveGpuRelease} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="panel-compact p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-950">{t('runtimeDefaults')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('kvQuant')}</span><span className="font-semibold">{kvQuantType.toUpperCase()}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('gpuCount')}</span><span className="font-semibold">{parallelGPUs}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('utilization')}</span><span className="font-semibold">{Math.round(vramUtilProportion * 100)}%</span></div>
                    <div className="flex justify-between gap-3"><span className="text-slate-500">{t('reserve')}</span><span className="font-semibold">{formatNumber(minReserveVramGB)} GB</span></div>
                  </div>
                </div>
                <div className="panel-compact p-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-950">{t('hardwareSources')}</h4>
                  <SourceLinks locale={locale} sources={gpuSources} />
                  {effectiveCard?.sourceNote && <p className="mt-3 text-xs text-slate-500">{effectiveCard.sourceNote}</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hints' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatTile label={t('weightMargin')} value={`${formatNumber(currentWeightSaving)} GB`} detail={t('savedVsFp16Weights')} />
                <StatTile
                  label={t('kvMargin')}
                  value={`${currentKvSaving >= 0 ? '' : '+'}${formatNumber(Math.abs(currentKvSaving))} GB`}
                  detail={currentKvSaving >= 0 ? t('savedVsFp16Kv') : t('extraVsFp16Kv')}
                />
                <StatTile label={t('backendRisk')} value={supportRiskLabel} detail={`${inferArchitecture(effectiveCard ?? customCard)} / ${quantType.toUpperCase()} / ${kvQuantType.toUpperCase()}`} />
              </div>

              <div className="panel-compact p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{t('supportMatrix')}</h3>
                    <p className="mt-1 text-xs text-slate-500">{t('supportMatrixDesc')}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${supportStatusClass(unsupportedSupportCount > 0 ? 'Unsupported' : partialSupportCount > 0 ? 'Partial' : 'Supported')}`}>
                    {supportRiskLabel}
                  </span>
                </div>
                <div className="space-y-2">
                  {supportRows.map((row) => {
                    const displayRow = localizeSupportRow(row, locale);
                    return (
                      <div key={row.label} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-950">{displayRow.label}</div>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{displayRow.note}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${supportStatusClass(row.status)}`}>
                            {row.status === 'Supported' ? t('supported') : row.status === 'Partial' ? t('partial') : row.status === 'Unsupported' ? t('unsupported') : t('check')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {guidanceHints.map((hint) => {
                  const Icon = hintIcon(hint.tone);
                  return (
                    <div key={hint.title} className={`rounded-xl border p-4 ${hintToneClass(hint.tone)}`}>
                      <div className="flex gap-3">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-950">{hint.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{hint.body}</p>
                          {hint.impact && <p className="mt-2 text-xs font-medium leading-5 text-slate-600">{hint.impact}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="panel-compact p-4">
                <h4 className="mb-3 text-sm font-bold text-slate-950">{t('supplementSources')}</h4>
                <SourceLinks locale={locale} sources={guidanceSourceLinks} />
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: t('weights'), value: results?.modelVram ?? 0, color: 'bg-blue-500' },
                  { label: t('kvCache'), value: results?.kvCacheVram ?? 0, color: 'bg-green-500' },
                  { label: t('reserve'), value: results?.reservedVram ?? 0, color: 'bg-slate-500' },
                ].map((item) => (
                  <div key={item.label} className="metric-tile">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      <span className="text-slate-500">{item.value.toFixed(1)} GB</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${Math.min(100, (item.value / formulaScale) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {formulaCards.map((card) => (
                  <FormulaCard
                    key={card.title}
                    accentClass={card.accentClass}
                    equation={card.equation}
                    icon={card.icon}
                    interpretation={card.interpretation}
                    labels={{
                      equation: t('equation'),
                      variables: t('variables'),
                      currentSubstitution: t('currentSubstitution'),
                      result: t('result'),
                    }}
                    purpose={card.purpose}
                    result={card.result}
                    substitution={card.substitution}
                    title={card.title}
                    variables={card.variables}
                  />
                ))}
              </div>

              <div className="panel-compact p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="font-bold text-slate-950">{t('capacityComposition')}</h4>
                  <span className="text-sm text-slate-500">{formatNumber(results?.usableVram ?? 0)} GB {t('usable')}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
                  <span className="text-slate-600">{t('weights')}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, ((results?.modelVram ?? 0) / Math.max(1, results?.usableVram ?? 1)) * 100)}%` }} />
                  </div>
                  <span className="font-semibold">{formatNumber(results?.modelVram ?? 0)} GB</span>

                  <span className="text-slate-600">{t('kvBudget')}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, ((results?.usableKvCacheVram ?? 0) / Math.max(1, results?.usableVram ?? 1)) * 100)}%` }} />
                  </div>
                  <span className="font-semibold">{formatNumber(results?.usableKvCacheVram ?? 0)} GB</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      </div>
      )}
    </div>
  );
}
