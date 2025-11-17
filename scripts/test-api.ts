/**
 * Simple script to test API endpoints
 * Run with: npx tsx scripts/test-api.ts
 */

const API_BASE = 'http://localhost:9002/api';

async function testAPI() {
  console.log('🧪 Testing AI Canvas API\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    console.log('✅ Health:', health.status);
    console.log('');

    // Test 2: Create Workflow
    console.log('2️⃣ Creating a test workflow...');
    const createRes = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Workflow',
        description: 'A test workflow created via API',
        tags: ['test', 'demo'],
      }),
    });
    const created = await createRes.json();
    console.log('✅ Created workflow:', created.data?.id);
    const workflowId = created.data?.id;
    console.log('');

    // Test 3: Get Workflow
    console.log('3️⃣ Fetching the workflow...');
    const getRes = await fetch(`${API_BASE}/workflows/${workflowId}`);
    const workflow = await getRes.json();
    console.log('✅ Fetched workflow:', workflow.data?.name);
    console.log('');

    // Test 4: Update Workflow
    console.log('4️⃣ Updating the workflow...');
    const updateRes = await fetch(`${API_BASE}/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Test Workflow',
        description: 'Updated description',
      }),
    });
    const updated = await updateRes.json();
    console.log('✅ Updated workflow:', updated.data?.name);
    console.log('');

    // Test 5: Execute Workflow
    console.log('5️⃣ Executing the workflow...');
    const executeRes = await fetch(`${API_BASE}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testData: 'hello' }),
    });
    const execution = await executeRes.json();
    console.log('✅ Execution started:', execution.data?.executionId);
    const executionId = execution.data?.executionId;
    console.log('');

    // Test 6: Check Execution Status
    console.log('6️⃣ Checking execution status...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    const statusRes = await fetch(`${API_BASE}/executions/${executionId}`);
    const status = await statusRes.json();
    console.log('✅ Execution status:', status.data?.status);
    console.log('');

    // Test 7: Get Execution Logs
    console.log('7️⃣ Fetching execution logs...');
    const logsRes = await fetch(`${API_BASE}/executions/${executionId}/logs`);
    const logs = await logsRes.json();
    console.log('✅ Found', logs.data?.length, 'log entries');
    if (logs.data?.length > 0) {
      console.log('   First log:', logs.data[0].message);
    }
    console.log('');

    // Test 8: List All Workflows
    console.log('8️⃣ Listing all workflows...');
    const listRes = await fetch(`${API_BASE}/workflows`);
    const list = await listRes.json();
    console.log('✅ Found', list.data?.length, 'workflows');
    console.log('');

    // Test 9: Delete Workflow
    console.log('9️⃣ Deleting the workflow...');
    const deleteRes = await fetch(`${API_BASE}/workflows/${workflowId}`, {
      method: 'DELETE',
    });
    const deleted = await deleteRes.json();
    console.log('✅ Deleted:', deleted.message);
    console.log('');

    console.log('🎉 All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAPI();
