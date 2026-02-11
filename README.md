# pi-subagent-model-selection

Shared model-selection policy for pi subagent extensions.

## Installation

```bash
npm install pi-subagent-model-selection
```

## Usage

```ts
import { getSmallModelFromProvider } from "pi-subagent-model-selection";

const selection = getSmallModelFromProvider(ctx.modelRegistry, ctx.model);
if (!selection) {
  // no suitable model available
}
```

The return value includes:
- `model` (`provider`, `id`)
- `thinkingLevel`
- selection diagnostics: `authMode`, `authSource`, `reason`

## Model selection policy

Selection uses `modelRegistry.getAvailable()` and current-model auth context.

If current model uses OAuth credentials:
1. `google-antigravity/gemini-3-flash`
2. Fallback strategy

If current model uses API key credentials:
1. `google-vertex` Gemini 3 Flash (`gemini-3-flash*`)
2. `google` Gemini 3 Flash (`gemini-3-flash*`)
3. Fallback strategy

Fallback strategy:
1. Gemini 3 Flash on current provider
2. Claude Haiku 4.5 on current provider
3. Current model with `thinkingLevel: low`

If no current model is available, defaults to API-key policy and sets diagnostics accordingly.

## Development

```bash
npm test
npm run pack:check
```

## License

Apache-2.0
