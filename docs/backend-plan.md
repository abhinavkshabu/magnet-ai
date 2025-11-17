# Backend & AI Engineering Plan
## AI Canvas - Magnet AI Prototype

---

## 🎯 Overview

This document outlines the backend and AI engineering work required to transform the AI Canvas prototype into a fully functional workflow automation platform. The focus areas are divided into core infrastructure, AI capabilities, integrations, and optimization.

---

## 🔴 Part 1: Core Backend Infrastructure

### 1.1 Database & Persistence Layer

**Current State**: All workflow data is stored in-memory and lost on page refresh.

**What We Need to Build**:

- **Firestore Integration**
  - Set up Firebase Admin SDK
  - Create database schema for workflows, nodes, connections, and executions
  - Implement CRUD operations for workflows
  - Add real-time listeners for collaborative editing support
  - Create data validation and sanitization layer

- **Data Models**
  ```
  Collections:
  - users/
  - workflows/
    - nodes (subcollection or embedded)
    - connections (subcollection or embedded)
    - executions/
      - logs/
  - templates/ (pre-built workflow templates)
  ```

- **Files to Create**:
  - `src/lib/firebase-admin.ts` - Firebase Admin initialization
  - `src/lib/db/workflows.ts` - Workflow database operations
  - `src/lib/db/executions.ts` - Execution history operations
  - `src/lib/db/users.ts` - User data operations
  - `src/lib/db/templates.ts` - Template management

**Key Features**:
- Auto-save workflows as users edit
- Version history for workflows
- Workflow sharing and permissions
- Import/export workflows as JSON

---

### 1.2 Workflow Execution Engine

**Current State**: Execution is simulated with `setTimeout` - no actual processing happens.

**What We Need to Build**:

- **Execution Engine Core**
  - Build a proper workflow executor that processes nodes in correct order
  - Implement topological sorting for node execution sequence
  - Handle parallel execution where possible
  - Manage execution state and context
  - Support pausing, resuming, and canceling executions

- **Node Execution Handlers**
  - Create execution handler for each node type:
    - `webhook` - Trigger on HTTP request
    - `llm` - Execute AI model calls
    - `iot` - Interface with IoT devices
    - `logic` - Conditional branching (if/else)
    - `api` - Make external API calls
    - `output` - Format and return results
  - Handle data transformation between nodes
  - Implement retry logic for failed nodes
  - Add timeout handling

- **Execution Context**
  - Pass data between connected nodes
  - Store intermediate results
  - Handle variables and dynamic values
  - Support connection prompts (conditional execution)

- **Files to Create**:
  - `src/lib/execution/executor.ts` - Main execution engine
  - `src/lib/execution/node-handlers/` - Individual node type handlers
    - `webhook-handler.ts`
    - `llm-handler.ts`
    - `iot-handler.ts`
    - `logic-handler.ts`
    - `api-handler.ts`
    - `output-handler.ts`
  - `src/lib/execution/execution-context.ts` - State management
  - `src/lib/execution/execution-logger.ts` - Logging system
  - `src/lib/execution/graph-resolver.ts` - Topological sorting

**Key Features**:
- Execute workflows triggered by webhooks
- Stream execution progress to frontend
- Store execution logs and results
- Handle errors gracefully with rollback support

---

### 1.3 API Routes & Endpoints

**Current State**: Only server actions exist, no RESTful API.

**What We Need to Build**:

- **Workflow Management API**
  - `GET /api/workflows` - List all workflows
  - `POST /api/workflows` - Create new workflow
  - `GET /api/workflows/[id]` - Get workflow details
  - `PUT /api/workflows/[id]` - Update workflow
  - `DELETE /api/workflows/[id]` - Delete workflow
  - `POST /api/workflows/[id]/duplicate` - Clone workflow

- **Execution API**
  - `POST /api/workflows/[id]/execute` - Trigger workflow execution
  - `GET /api/executions/[id]` - Get execution status
  - `GET /api/executions/[id]/logs` - Get execution logs
  - `POST /api/executions/[id]/cancel` - Cancel running execution

- **Webhook API**
  - `POST /api/webhooks/[webhookId]` - Receive webhook triggers
  - `GET /api/webhooks/[webhookId]/test` - Test webhook endpoint

- **Template API**
  - `GET /api/templates` - List workflow templates
  - `POST /api/templates/[id]/use` - Create workflow from template

- **Files to Create**:
  - `src/app/api/workflows/route.ts`
  - `src/app/api/workflows/[id]/route.ts`
  - `src/app/api/workflows/[id]/execute/route.ts`
  - `src/app/api/executions/[id]/route.ts`
  - `src/app/api/webhooks/[webhookId]/route.ts`
  - `src/app/api/templates/route.ts`
  - `src/middleware.ts` - Authentication & rate limiting

**Key Features**:
- Request validation using Zod schemas
- Error handling with proper HTTP status codes
- API documentation (consider adding Swagger/OpenAPI)
- Rate limiting to prevent abuse

---

### 1.4 Authentication & Authorization

**What We Need to Build**:

- **User Authentication**
  - Implement Firebase Authentication
  - Support email/password, Google, GitHub login
  - Create session management
  - Add JWT token validation for API routes

- **Authorization**
  - Workflow ownership and permissions
  - Role-based access control (owner, editor, viewer)
  - API key generation for webhook access
  - Secure webhook endpoints with signatures

- **Files to Create**:
  - `src/lib/auth/firebase-auth.ts` - Auth helpers
  - `src/lib/auth/middleware.ts` - Auth middleware
  - `src/lib/auth/permissions.ts` - Permission checks
  - `src/lib/auth/api-keys.ts` - API key management

---

## 🤖 Part 2: Advanced AI Features

### 2.1 Workflow Generation from Natural Language

**Current State**: File exists (`generate-workflow-from-prompt.ts`) but not implemented.

**What We Need to Build**:

- **Natural Language to Workflow**
  - User describes what they want: "Send me an email when my camera detects motion"
  - AI generates complete workflow with nodes and connections
  - Suggest appropriate node types and configurations
  - Auto-generate connection prompts

- **Implementation**:
  - Complete `src/ai/flows/generate-workflow-from-prompt.ts`
  - Define comprehensive output schema for workflow structure
  - Add examples and few-shot prompting for better results
  - Validate generated workflows before returning

- **Files to Work On**:
  - `src/ai/flows/generate-workflow-from-prompt.ts` - Main implementation
  - `src/ai/prompts/workflow-generation.ts` - Prompt templates
  - `src/lib/actions.ts` - Add server action for workflow generation

**Key Features**:
- Generate workflows from text descriptions
- Support follow-up refinements ("add a delay before sending email")
- Suggest improvements to existing workflows
- Explain generated workflow in plain language

---

### 2.2 Enhanced Node Suggestions

**Current State**: Basic suggestion system exists but limited.

**What We Need to Build**:

- **Smarter Suggestions**
  - Context-aware suggestions based on entire workflow graph
  - Suggest multiple possible next steps with pros/cons
  - Consider workflow goals and patterns
  - Learn from common workflow patterns

- **Connection Suggestions**
  - AI suggests which nodes should connect
  - Auto-generate meaningful connection prompts
  - Detect missing connections or logic gaps

- **Files to Create**:
  - `src/ai/flows/suggest-connections.ts` - Connection suggestions
  - `src/ai/flows/generate-connection-prompt.ts` - Prompt generation
  - `src/ai/flows/analyze-workflow.ts` - Workflow analysis
  - Enhance `src/ai/flows/suggest-next-nodes.ts` - Better context

**Key Features**:
- Multi-step lookahead suggestions
- Alternative path suggestions ("what-if" scenarios)
- Detect and suggest error handling nodes
- Suggest optimization opportunities

---

### 2.3 AI Model Provider Integration

**Current State**: Only Google Gemini is integrated.

**What We Need to Build**:

- **Multi-Provider Support**
  - OpenAI (GPT-4, GPT-4o, DALL-E, Whisper)
  - Anthropic (Claude 3.5 Sonnet, Haiku)
  - Groq (fast inference for Llama, Mixtral)
  - Google (Gemini Pro, Flash, Vision)
  - Local models via Ollama

- **Provider Abstraction Layer**
  - Unified interface for all providers
  - Handle different API formats and authentication
  - Support streaming responses
  - Implement fallback mechanisms

- **Node Configuration**
  - Let users select AI provider per node
  - Configure model parameters (temperature, max tokens, etc.)
  - Support custom system prompts
  - Handle file uploads for vision/audio models

- **Files to Create**:
  - `src/lib/ai-providers/base-provider.ts` - Abstract base class
  - `src/lib/ai-providers/openai.ts` - OpenAI integration
  - `src/lib/ai-providers/anthropic.ts` - Claude integration
  - `src/lib/ai-providers/groq.ts` - Groq integration
  - `src/lib/ai-providers/gemini.ts` - Enhanced Gemini
  - `src/lib/ai-providers/ollama.ts` - Local models
  - `src/lib/ai-providers/factory.ts` - Provider factory

**Key Features**:
- Support for text, image, audio, and video models
- Streaming responses to frontend
- Cost tracking per execution
- Model comparison and benchmarking

---

### 2.4 Workflow Intelligence

**What We Need to Build**:

- **Workflow Validation**
  - Detect logical errors before execution
  - Check for infinite loops
  - Validate node configurations
  - Ensure all required connections exist

- **Workflow Optimization**
  - Suggest performance improvements
  - Identify redundant nodes
  - Recommend parallel execution opportunities
  - Estimate execution time and cost

- **Error Prediction**
  - Analyze workflow for potential failure points
  - Suggest error handling strategies
  - Recommend retry logic and timeouts

- **Files to Create**:
  - `src/ai/flows/validate-workflow.ts` - Validation
  - `src/ai/flows/optimize-workflow.ts` - Optimization suggestions
  - `src/ai/flows/predict-errors.ts` - Error prediction
  - `src/lib/workflow-analyzer.ts` - Static analysis

---

## 🔌 Part 3: IoT & External Integrations

### 3.1 IoT Device Integration

**Current State**: IoT nodes exist in UI but no actual device integration.

**What We Need to Build**:

- **Device Communication Protocols**
  - MQTT support for IoT devices
  - WebSocket connections for real-time data
  - HTTP polling for simple devices
  - Serial communication for local devices

- **Device Registry**
  - Register and manage IoT devices
  - Store device credentials securely
  - Monitor device status (online/offline)
  - Handle device authentication

- **Common Device Support**
  - IP cameras (RTSP, ONVIF)
  - Smart home platforms (Home Assistant, HomeKit)
  - Arduino/ESP32 boards
  - Raspberry Pi
  - Sensors (temperature, motion, etc.)
  - Actuators (relays, servos, etc.)

- **Files to Create**:
  - `src/lib/iot/device-manager.ts` - Device registry
  - `src/lib/iot/mqtt-client.ts` - MQTT integration
  - `src/lib/iot/websocket-handler.ts` - WebSocket support
  - `src/lib/iot/devices/camera.ts` - Camera integration
  - `src/lib/iot/devices/sensor.ts` - Sensor support
  - `src/lib/iot/devices/actuator.ts` - Actuator control
  - `src/app/api/iot/devices/route.ts` - Device API

**Key Features**:
- Real-time device data streaming
- Device event triggers for workflows
- Bidirectional communication (read sensors, control actuators)
- Device grouping and scenes

---

### 3.2 Webhook System

**Current State**: Webhook nodes exist but no actual webhook handling.

**What We Need to Build**:

- **Webhook Management**
  - Generate unique webhook URLs per workflow
  - Support custom webhook paths
  - Handle different HTTP methods (GET, POST, PUT, DELETE)
  - Parse various content types (JSON, form-data, XML)

- **Security**
  - Webhook signature verification (HMAC)
  - API key authentication
  - IP whitelisting
  - Rate limiting per webhook

- **Testing & Debugging**
  - Webhook request history
  - Request/response logging
  - Test webhook with sample payloads
  - Webhook playground UI

- **Files to Create**:
  - `src/lib/webhooks/webhook-manager.ts` - URL generation & management
  - `src/lib/webhooks/webhook-validator.ts` - Security validation
  - `src/lib/webhooks/webhook-logger.ts` - Request logging
  - `src/app/api/webhooks/[webhookId]/route.ts` - Webhook receiver
  - `src/app/api/webhooks/[webhookId]/test/route.ts` - Testing endpoint

**Key Features**:
- Instant workflow triggering from external services
- Payload transformation and validation
- Retry failed webhook deliveries
- Webhook analytics (request count, success rate)

---

### 3.3 Third-Party API Integrations

**What We Need to Build**:

- **Popular Service Integrations**
  - Email (SendGrid, Mailgun, Resend)
  - SMS (Twilio, Vonage)
  - Notifications (Slack, Discord, Telegram)
  - Storage (AWS S3, Google Cloud Storage)
  - Databases (Supabase, MongoDB, Airtable)
  - Payment (Stripe, PayPal)
  - Calendar (Google Calendar, Outlook)

- **OAuth Integration**
  - Handle OAuth flows for services
  - Store and refresh access tokens
  - Manage user connections to services

- **Files to Create**:
  - `src/lib/integrations/` - One file per service
  - `src/lib/integrations/oauth-manager.ts` - OAuth handling
  - `src/app/api/integrations/[service]/auth/route.ts` - OAuth callbacks

**Key Features**:
- Pre-built integration nodes
- Credential management
- Action and trigger support
- Rate limit handling

---

## ⚡ Part 4: Performance & Scalability

### 4.1 Background Job Processing

**What We Need to Build**:

- **Job Queue System**
  - Use Redis + BullMQ for job queue
  - Queue long-running workflow executions
  - Process jobs in background workers
  - Support job priorities and delays

- **Scheduled Workflows**
  - Cron-based workflow triggers
  - Support various schedules (hourly, daily, weekly, custom)
  - Timezone handling
  - Schedule management UI

- **Files to Create**:
  - `src/lib/queue/queue-manager.ts` - Queue setup
  - `src/lib/queue/workers/workflow-worker.ts` - Execution worker
  - `src/lib/queue/jobs/` - Job definitions
  - `src/lib/scheduler/cron-manager.ts` - Cron scheduling

**Key Features**:
- Async workflow execution
- Job retry with exponential backoff
- Job progress tracking
- Dead letter queue for failed jobs

---

### 4.2 Caching & Optimization

**What We Need to Build**:

- **Caching Strategy**
  - Redis caching for frequently accessed data
  - Cache workflow definitions
  - Cache AI model responses (when appropriate)
  - Cache execution results for idempotent operations

- **Query Optimization**
  - Firestore query optimization
  - Implement pagination for large datasets
  - Use Firestore indexes effectively
  - Batch operations where possible

- **Files to Create**:
  - `src/lib/cache/redis-client.ts` - Redis setup
  - `src/lib/cache/cache-manager.ts` - Caching utilities
  - `src/lib/db/query-optimizer.ts` - Query helpers

**Key Features**:
- Reduced database reads
- Faster API responses
- Lower costs
- Better user experience

---

### 4.3 Monitoring & Observability

**What We Need to Build**:

- **Error Tracking**
  - Integrate Sentry or similar
  - Track errors with context
  - Alert on critical errors
  - Error grouping and deduplication

- **Performance Monitoring**
  - Track API response times
  - Monitor workflow execution duration
  - Database query performance
  - AI model latency

- **Logging**
  - Structured logging
  - Log aggregation
  - Searchable logs
  - Log retention policies

- **Metrics & Analytics**
  - Workflow execution metrics
  - User activity tracking
  - Resource usage monitoring
  - Cost tracking per workflow

- **Files to Create**:
  - `src/lib/monitoring/sentry.ts` - Error tracking
  - `src/lib/monitoring/logger.ts` - Structured logging
  - `src/lib/monitoring/metrics.ts` - Metrics collection
  - `src/app/api/health/route.ts` - Health check endpoint

**Key Features**:
- Real-time error alerts
- Performance dashboards
- Usage analytics
- System health monitoring

---

### 4.4 Rate Limiting & Security

**What We Need to Build**:

- **Rate Limiting**
  - API rate limits per user/IP
  - Workflow execution limits
  - AI model call limits
  - Webhook rate limits

- **Security Hardening**
  - Input validation and sanitization
  - SQL injection prevention (though using Firestore)
  - XSS protection
  - CSRF protection
  - Secrets management (environment variables, KMS)

- **Files to Create**:
  - `src/lib/security/rate-limiter.ts` - Rate limiting
  - `src/lib/security/validator.ts` - Input validation
  - `src/lib/security/secrets.ts` - Secrets management
  - `src/middleware.ts` - Security middleware

---

## 🧪 Part 5: Testing & Quality

### 5.1 Testing Infrastructure

**What We Need to Build**:

- **Unit Tests**
  - Test execution engine logic
  - Test node handlers
  - Test AI flows
  - Test database operations

- **Integration Tests**
  - Test API endpoints
  - Test workflow execution end-to-end
  - Test webhook handling
  - Test IoT integrations

- **Files to Create**:
  - `__tests__/lib/execution/executor.test.ts`
  - `__tests__/lib/execution/node-handlers.test.ts`
  - `__tests__/api/workflows.test.ts`
  - `__tests__/ai/flows/suggest-next-nodes.test.ts`

**Tools**:
- Jest for unit tests
- Supertest for API testing
- Mock Firestore for database tests
- Mock AI responses for testing

---

### 5.2 Development Tools

**What We Need to Build**:

- **Development Utilities**
  - Seed data for testing
  - Database reset scripts
  - Mock data generators
  - Development environment setup script

- **Files to Create**:
  - `scripts/seed-db.ts` - Seed test data
  - `scripts/reset-db.ts` - Reset database
  - `scripts/generate-mock-data.ts` - Mock data
  - `.env.example` - Environment variables template

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Set up Firebase Admin SDK
- [ ] Create database schema and models
- [ ] Implement workflow CRUD operations
- [ ] Build basic execution engine
- [ ] Create node execution handlers
- [ ] Set up authentication

### Phase 2: Core Features
- [ ] Implement API routes
- [ ] Complete workflow execution with logging
- [ ] Build webhook system
- [ ] Add real-time execution updates
- [ ] Implement workflow generation from text
- [ ] Enhance AI suggestions

### Phase 3: Integrations
- [ ] Add multiple AI provider support
- [ ] Implement IoT device integration
- [ ] Build third-party service integrations
- [ ] Add OAuth support
- [ ] Create integration marketplace

### Phase 4: Scale & Polish
- [ ] Set up job queue system
- [ ] Implement caching layer
- [ ] Add monitoring and logging
- [ ] Implement rate limiting
- [ ] Write tests
- [ ] Performance optimization

### Phase 5: Advanced Features
- [ ] Workflow templates library
- [ ] Collaborative editing
- [ ] Workflow versioning
- [ ] Analytics dashboard
- [ ] Cost estimation and tracking

---

## 🎯 Success Criteria

**We'll know we're successful when**:

1. ✅ Workflows persist across sessions and page refreshes
2. ✅ Workflows execute for real (not simulated)
3. ✅ AI can generate complete workflows from text descriptions
4. ✅ Webhooks successfully trigger workflow executions
5. ✅ At least 3 AI providers are integrated and working
6. ✅ IoT devices can trigger and be controlled by workflows
7. ✅ Execution logs are stored and queryable
8. ✅ System handles concurrent workflow executions
9. ✅ Users can authenticate and manage their workflows
10. ✅ Error handling is robust with proper logging

---

## 🤝 Collaboration Notes

**How We'll Work Together**:

- You (AI Assistant) will help implement features, write code, debug issues
- I (Developer) will test, provide feedback, make architectural decisions
- We'll iterate on each feature until it works correctly
- We'll prioritize based on demo needs and dependencies
- We'll document as we go

**Communication**:
- Ask questions when requirements are unclear
- Suggest better approaches if you see them
- Flag potential issues early
- Keep code clean and well-commented

---

## 📚 Resources & References

**Documentation to Reference**:
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Google Genkit](https://firebase.google.com/docs/genkit)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [BullMQ Documentation](https://docs.bullmq.io/)

**External APIs**:
- OpenAI API
- Anthropic API
- Groq API
- MQTT Protocol
- OAuth 2.0 Spec

---

*This is a living document. We'll update it as we progress and discover new requirements.*
