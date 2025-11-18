# Execution Engine

The execution engine is responsible for running workflows and executing individual nodes.

## Quick Start

```typescript
import { WorkflowOrchestrator } from './orchestrator';

// Create orchestrator
const orchestrator = new WorkflowOrchestrator(
  workflowId,
  nodes,
  connections,
  triggerData
);

// Execute workflow
const result = await orchestrator.execute();

if (result.success) {
  console.log('Workflow completed:', result.output);
} else {
  console.error('Workflow failed:', result.error);
}
```

## Architecture

```
orchestrator.ts          - Workflow execution coordinator
├── types.ts            - Core type definitions
└── executors/
    ├── base.ts         - Base executor class
    ├── webhook.ts      - HTTP requests
    ├── llm.ts          - AI models
    ├── api.ts          - External APIs
    ├── iot.ts          - IoT devices
    ├── logic.ts        - Data transformation
    ├── output.ts       - Result formatting
    └── index.ts        - Executor registry
```

## Adding a Custom Executor

1. Create a new file in `executors/`
2. Extend `BaseExecutor`
3. Implement `execute()` and `validate()`
4. Register in `executors/index.ts`

Example:

```typescript
import { BaseExecutor } from './base';

export class CustomExecutor extends BaseExecutor {
  async execute(node, context) {
    // Your logic here
    return this.success(result);
  }

  validate(node) {
    // Validation logic
    return { valid: true };
  }
}
```

## Documentation

See `/docs/EXECUTION-ENGINE.md` for complete documentation.

## Testing

```bash
npm run test:execution
```
