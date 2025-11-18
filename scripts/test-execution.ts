/**
 * Test script for the execution engine
 * Run with: npx tsx scripts/test-execution.ts
 */

const EXEC_API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${EXEC_API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    console.error('❌ API Error:', {
      endpoint,
      status: response.status,
      error: result.error,
    });
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSimpleWorkflow() {
  console.log('\n🧪 Test 1: Simple API Call Workflow');
  console.log('=====================================\n');

  try {
    // Create a workflow with a simple API call
    const workflow = await apiRequest<any>('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test API Workflow',
        description: 'Fetches data from JSONPlaceholder API',
        nodes: [
          {
            id: 'api-1',
            type: 'api',
            name: 'Fetch Users',
            description: 'Get users from API',
            position: { x: 100, y: 100 },
            content: {
              url: 'https://jsonplaceholder.typicode.com/users',
              method: 'GET',
            },
          },
          {
            id: 'output-1',
            type: 'output',
            name: 'Return Result',
            description: 'Format output',
            position: { x: 300, y: 100 },
            content: {
              format: 'json',
            },
          },
        ],
        connections: [
          {
            id: 'api-1-output-1',
            from: 'api-1',
            to: 'output-1',
          },
        ],
      }),
    });

    console.log('✅ Workflow created:', workflow.id);

    // Execute the workflow
    const execution = await apiRequest<any>(`/workflows/${workflow.id}/execute`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    console.log('✅ Execution started:', execution.executionId);

    // Wait for execution to complete
    console.log('⏳ Waiting for execution to complete...');
    await sleep(3000);

    // Get execution status
    const status = await apiRequest<any>(`/executions/${execution.executionId}`);
    console.log('📊 Execution status:', status.status);

    // Get logs
    const logs = await apiRequest<any>(`/executions/${execution.executionId}/logs`);
    console.log('📝 Execution logs:', logs.length, 'entries');

    if (status.status === 'completed') {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed - execution did not complete');
      console.log('Error:', status.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testLLMWorkflow() {
  console.log('\n🧪 Test 2: LLM Workflow');
  console.log('========================\n');

  try {
    // Create a workflow with LLM
    const workflow = await apiRequest<any>('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test LLM Workflow',
        description: 'Uses AI to generate text',
        nodes: [
          {
            id: 'llm-1',
            type: 'llm',
            name: 'Generate Text',
            description: 'AI text generation',
            position: { x: 100, y: 100 },
            content: {
              prompt: 'Write a haiku about {{input.topic}}',
              model: 'googleai/gemini-2.0-flash-exp',
              temperature: 0.7,
              maxTokens: 100,
            },
          },
          {
            id: 'output-1',
            type: 'output',
            name: 'Return Result',
            description: 'Format output',
            position: { x: 300, y: 100 },
            content: {
              format: 'text',
            },
          },
        ],
        connections: [
          {
            id: 'llm-1-output-1',
            from: 'llm-1',
            to: 'output-1',
          },
        ],
      }),
    });

    console.log('✅ Workflow created:', workflow.id);

    // Execute with input
    const execution = await apiRequest<any>(`/workflows/${workflow.id}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        topic: 'artificial intelligence',
      }),
    });

    console.log('✅ Execution started:', execution.executionId);

    // Wait for execution
    console.log('⏳ Waiting for AI to generate text...');
    await sleep(5000);

    // Get status
    const status = await apiRequest<any>(`/executions/${execution.executionId}`);
    console.log('📊 Execution status:', status.status);

    if (status.status === 'completed') {
      console.log('✅ Test passed!');
      console.log('🎨 Generated text:', status.output);
    } else {
      console.log('❌ Test failed');
      console.log('Error:', status.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testLogicWorkflow() {
  console.log('\n🧪 Test 3: Logic Workflow');
  console.log('==========================\n');

  try {
    // Create workflow with logic node
    const workflow = await apiRequest<any>('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Logic Workflow',
        description: 'Filters and transforms data',
        nodes: [
          {
            id: 'logic-1',
            type: 'logic',
            name: 'Transform Data',
            description: 'Transform input',
            position: { x: 100, y: 100 },
            content: {
              operation: 'transform',
              template: {
                fullName: '{{firstName}} {{lastName}}',
                email: '{{email}}',
                age: '{{age}}',
              },
            },
          },
          {
            id: 'output-1',
            type: 'output',
            name: 'Return Result',
            description: 'Format output',
            position: { x: 300, y: 100 },
            content: {
              format: 'json',
            },
          },
        ],
        connections: [
          {
            id: 'logic-1-output-1',
            from: 'logic-1',
            to: 'output-1',
          },
        ],
      }),
    });

    console.log('✅ Workflow created:', workflow.id);

    // Execute with data
    const execution = await apiRequest<any>(`/workflows/${workflow.id}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        age: 30,
      }),
    });

    console.log('✅ Execution started:', execution.executionId);

    // Wait
    await sleep(2000);

    // Get status
    const status = await apiRequest<any>(`/executions/${execution.executionId}`);
    console.log('📊 Execution status:', status.status);

    if (status.status === 'completed') {
      console.log('✅ Test passed!');
      console.log('📦 Transformed data:', status.output);
    } else {
      console.log('❌ Test failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Execution Engine Tests');
  console.log('===================================');

  // Check if server is running
  try {
    await fetch(`${EXEC_API_BASE}/api/health`);
  } catch (error) {
    console.error('❌ Server is not running!');
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  }

  await testSimpleWorkflow();
  await testLogicWorkflow();
  
  // Only test LLM if GOOGLE_API_KEY is set
  if (process.env.GOOGLE_API_KEY) {
    await testLLMWorkflow();
  } else {
    console.log('\n⚠️  Skipping LLM test (GOOGLE_API_KEY not set)');
  }

  console.log('\n✅ All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
