# Execution Engine Documentation

## 🚀 Overview

The execution engine is the core component that brings workflows to life. It processes each node in a workflow, executes the appropriate actions, and manages data flow between nodes.

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Workflow Orchestrator                    │
│  - Manages execution flow                                    │
│  - Handles topological sorting                               │
│  - Coordinates node execution                                │
│  - Tracks context and state                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├──► Executor Registry
                 │    - Maps node types to executors
                 │    - Manages executor instances
                 │
                 ├──► Execution Context
                 │    - Input data
                 │    - Node outputs
                 │    - Workflow variables
                 │
                 └──► Node Executors
                      ├─► WebhookExecutor (HTTP requests)
                      ├─► LLMExecutor (AI models)
                      ├─► APIExecutor (External APIs)
                      ├─► IoTExecutor (IoT devices)
                      ├─► LogicExecutor (Data transformation)
                      └─► OutputExecutor (Results)
```

## 🎯 Node Executors

### 1. **WebhookExecutor**
Sends HTTP requests to external services.

**Configuration:**
```json
{
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer token123"
  },
  "body": {
    "message": "Hello from workflow"
  }
}
```

**Features:**
- ✅ Supports GET, POST, PUT, DELETE, PATCH
- ✅ Custom headers
- ✅ Request/response logging
- ✅ Error handling with retries (TODO)

---

### 2. **LLMExecutor**
Executes AI model calls using Google Genkit.

**Configuration:**
```json
{
  "prompt": "Summarize this text: {{input.text}}",
  "model": "googleai/gemini-2.0-flash-exp",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Features:**
- ✅ Variable substitution in prompts
- ✅ Multiple AI models support
- ✅ Token usage tracking
- ✅ Temperature and max tokens control

**Prompt Variables:**
- `{{input.key}}` - Access input data
- `{{node_id.output}}` - Access previous node output
- `{{variable}}` - Access workflow variables

---

### 3. **APIExecutor**
Makes API calls to external services.

**Configuration:**
```json
{
  "url": "https://api.example.com/data",
  "method": "GET",
  "queryParams": {
    "limit": "10",
    "offset": "0"
  },
  "headers": {
    "X-API-Key": "your-api-key"
  },
  "auth": {
    "type": "bearer",
    "token": "your-token"
  }
}
```

**Features:**
- ✅ Query parameters
- ✅ Bearer and API key authentication
- ✅ JSON and text responses
- ✅ Status code handling

---

### 4. **IoTExecutor**
Interacts with IoT devices.

**Configuration:**
```json
{
  "deviceId": "device-123",
  "action": "turn_on",
  "protocol": "mqtt",
  "payload": {
    "brightness": 80
  }
}
```

**Supported Protocols:**
- ✅ MQTT (simulated)
- ✅ HTTP
- ✅ CoAP (simulated)

**TODO:**
- [ ] Real MQTT client integration
- [ ] Device discovery
- [ ] Status monitoring

---

### 5. **LogicExecutor**
Handles data transformation and conditional logic.

**Operations:**

#### Filter
```json
{
  "operation": "filter",
  "condition": "age > 18"
}
```

#### Transform
```json
{
  "operation": "transform",
  "template": {
    "fullName": "{{firstName}} {{lastName}}",
    "email": "{{email}}"
  }
}
```

#### Condition
```json
{
  "operation": "condition",
  "condition": "status == 'active'"
}
```

#### Merge
```json
{
  "operation": "merge",
  "strategy": "merge"  // or "array", "concat"
}
```

---

### 6. **OutputExecutor**
Formats and returns workflow results.

**Configuration:**
```json
{
  "format": "json",  // or "text", "html"
  "template": "Result: {{input.result}}"
}
```

---

## 🔄 Execution Flow

### 1. **Workflow Initialization**
```typescript
const orchestrator = new WorkflowOrchestrator(
  workflowId,
  nodes,
  connections,
  triggerData
);
```

### 2. **Execution Steps**

1. **Create Execution Record**
   - Status: `pending`
   - Store trigger data
   - Generate execution ID

2. **Find Starting Nodes**
   - Identify nodes with no incoming connections
   - These are the entry points

3. **Topological Sort**
   - Determine execution order
   - Ensure dependencies are met

4. **Execute Nodes Sequentially**
   ```
   For each node in execution order:
     1. Get executor for node type
     2. Validate node configuration
     3. Prepare input from previous nodes
     4. Execute node
     5. Store output
     6. Log result
   ```

5. **Complete Execution**
   - Status: `completed` or `failed`
   - Store final output
   - Log completion

---

## 📊 Execution Context

The execution context is passed to each node executor:

```typescript
interface ExecutionContext {
  // Current input for this node
  input: Record<string, any>;
  
  // Outputs from all previous nodes
  nodeOutputs: Map<string, any>;
  
  // Workflow-level variables
  variables: Record<string, any>;
  
  // Metadata
  executionId: string;
  workflowId: string;
  startTime: Date;
}
```

### Data Flow Between Nodes

```
Node A (output: {x: 1})
   │
   ├─► Node B (input: {x: 1})
   │   (output: {y: 2})
   │
   └─► Node C (input: {x: 1, y: 2})
       (output: {z: 3})
```

---

## 🧪 Testing

### Test a Simple Workflow

```bash
curl -X POST http://localhost:9002/api/workflows/{workflowId}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello World"
  }'
```

### Check Execution Status

```bash
curl http://localhost:9002/api/executions/{executionId}
```

### Get Execution Logs

```bash
curl http://localhost:9002/api/executions/{executionId}/logs
```

---

## 🎨 Example Workflows

### Example 1: AI Text Summarization

```json
{
  "nodes": [
    {
      "id": "webhook-1",
      "type": "webhook",
      "name": "Receive Text",
      "content": {}
    },
    {
      "id": "llm-1",
      "type": "llm",
      "name": "Summarize",
      "content": {
        "prompt": "Summarize this text in 2 sentences: {{input.text}}",
        "model": "googleai/gemini-2.0-flash-exp"
      }
    },
    {
      "id": "output-1",
      "type": "output",
      "name": "Return Summary",
      "content": {
        "format": "json"
      }
    }
  ],
  "connections": [
    {"from": "webhook-1", "to": "llm-1"},
    {"from": "llm-1", "to": "output-1"}
  ]
}
```

### Example 2: API Data Processing

```json
{
  "nodes": [
    {
      "id": "api-1",
      "type": "api",
      "name": "Fetch Users",
      "content": {
        "url": "https://jsonplaceholder.typicode.com/users",
        "method": "GET"
      }
    },
    {
      "id": "logic-1",
      "type": "logic",
      "name": "Filter Active",
      "content": {
        "operation": "filter",
        "condition": "id < 5"
      }
    },
    {
      "id": "webhook-1",
      "type": "webhook",
      "name": "Send to Slack",
      "content": {
        "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
        "method": "POST"
      }
    }
  ],
  "connections": [
    {"from": "api-1", "to": "logic-1"},
    {"from": "logic-1", "to": "webhook-1"}
  ]
}
```

---

## 🔧 Extending the Engine

### Creating a Custom Executor

```typescript
import { BaseExecutor } from '@/lib/execution/executors/base';
import type { WorkflowNode } from '@/lib/types';
import type { ExecutionContext, NodeExecutionResult } from '@/lib/execution/types';

export class CustomExecutor extends BaseExecutor {
  async execute(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    try {
      // Your custom logic here
      const result = await this.doSomething(node, context);
      
      return this.success(result, {
        duration: 100,
        customMetric: 42
      });
    } catch (error) {
      return this.error(error.message);
    }
  }

  validate(node: WorkflowNode): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    // Your validation logic
    if (!node.content?.requiredField) {
      errors.push('requiredField is required');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  private async doSomething(node: WorkflowNode, context: ExecutionContext) {
    // Implementation
  }
}
```

### Register Custom Executor

```typescript
import { executorRegistry } from '@/lib/execution/executors';
import { CustomExecutor } from './custom-executor';

executorRegistry.register('custom', new CustomExecutor());
```

---

## 📈 Performance Considerations

### Current Limitations
- ⚠️ Sequential execution (no parallel nodes yet)
- ⚠️ No execution timeout
- ⚠️ No retry logic
- ⚠️ Limited error recovery

### Future Optimizations
- [ ] Parallel node execution
- [ ] Execution timeouts
- [ ] Automatic retries with exponential backoff
- [ ] Circuit breakers for external services
- [ ] Execution caching
- [ ] Streaming execution updates

---

## 🐛 Error Handling

### Node Execution Errors
- Validation errors stop execution immediately
- Runtime errors are logged and execution fails
- Error details are stored in execution record

### Workflow Errors
- Invalid workflow structure
- Missing node executors
- Circular dependencies (TODO: detect)

---

## 📝 Logging

All execution events are logged to Firestore:

```typescript
{
  executionId: string;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: Date;
}
```

---

## 🎯 Next Steps

1. **Add Parallel Execution**
   - Execute independent nodes in parallel
   - Improve performance for complex workflows

2. **Implement Retries**
   - Automatic retry for failed nodes
   - Exponential backoff

3. **Add Timeouts**
   - Per-node timeouts
   - Workflow-level timeouts

4. **Real-time Updates**
   - WebSocket support for live execution updates
   - Progress tracking

5. **Advanced Features**
   - Conditional branching
   - Loops and iterations
   - Sub-workflows

---

*Execution Engine v1.0 - Ready for production workflows!* 🚀
