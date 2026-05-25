# Calculator Adapter Contract

The base calculator should own the shell. A domain adapter should own the meaning.

The shell is responsible for:

- Entry mode layout.
- Guided step rendering.
- Detailed parameter and workspace layout.
- Formula cards.
- Source and fact cards.
- Hint display.
- Export controls.
- Locale switching hooks.
- Accessibility and responsive behavior.

The adapter is responsible for:

- Domain entities.
- Catalog data.
- Guided step definitions.
- Input defaults and validation.
- Formula execution.
- Formula traces.
- Hints and support caveats.
- Export data shape.
- Domain copy and translations.

## Type Shape

This is intentionally a contract sketch, not a package API yet.

```ts
export interface CalculatorAdapter<TInputs, TResult> {
  manifest: CalculatorManifest;
  getInitialInputs(): TInputs;
  validateInputs(inputs: TInputs): ValidationIssue[];
  compute(inputs: TInputs): CalculationEnvelope<TResult>;
  getGuidedState(inputs: TInputs): GuidedState;
  getFacts(inputs: TInputs, result: TResult | null): FactSection[];
  getHints(inputs: TInputs, result: TResult | null): GuidanceHint[];
  exportCurrent(inputs: TInputs, result: TResult | null): ExportFile[];
  exportCatalogs(): ExportFile[];
}

export interface CalculationEnvelope<TResult> {
  result: TResult | null;
  blockingIssues: ValidationIssue[];
  formulaTraces: FormulaTrace[];
  sourceRefs: SourceRef[];
}

export interface FormulaTrace {
  id: string;
  title: string;
  purpose: string;
  equation: string;
  variables: FormulaVariable[];
  substitution: string;
  result: string;
  interpretation: string;
  caveats?: string[];
  sources?: SourceRef[];
}
```

## Boundary Rule

The base can know that a calculator has entities, steps, formulas, facts, hints, and exports. It should not know what `KV cache`, `GPU memory bandwidth`, `mortgage interest`, or `daily calories` means.

When a concept needs domain vocabulary to be correct, keep it in the adapter.

