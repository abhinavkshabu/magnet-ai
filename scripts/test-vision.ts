/**
 * Test Vision Analysis
 * Tests the vision API endpoint with sample images
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const API_BASE = 'http://localhost:9002';

// Sample test images (publicly accessible)
const TEST_IMAGES = {
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
};

async function testVisionAPI() {
  console.log('🎨 Testing Vision Analysis API\n');

  // Test 1: Basic image description
  console.log('1️⃣ Test: Basic Image Description');
  try {
    const response = await fetch(`${API_BASE}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: TEST_IMAGES.cat,
        prompt: 'Describe this image in detail.',
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('   ✅ Success!');
      console.log('   📊 Analysis:', data.analysis.substring(0, 200) + '...');
      console.log('   ⏱️  Duration:', data.metadata.duration + 'ms\n');
    } else {
      console.log('   ❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error);
  }

  // Test 2: Object detection
  console.log('2️⃣ Test: Object Detection');
  try {
    const response = await fetch(`${API_BASE}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: TEST_IMAGES.city,
        prompt: 'List all the objects and elements you can see in this image.',
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('   ✅ Success!');
      console.log('   📊 Objects:', data.analysis.substring(0, 200) + '...');
      console.log('   ⏱️  Duration:', data.metadata.duration + 'ms\n');
    } else {
      console.log('   ❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error);
  }

  // Test 3: Scene understanding
  console.log('3️⃣ Test: Scene Understanding');
  try {
    const response = await fetch(`${API_BASE}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: TEST_IMAGES.nature,
        prompt: 'What is the mood and atmosphere of this scene? What time of day is it?',
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('   ✅ Success!');
      console.log('   📊 Analysis:', data.analysis.substring(0, 200) + '...');
      console.log('   ⏱️  Duration:', data.metadata.duration + 'ms\n');
    } else {
      console.log('   ❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error);
  }

  // Test 4: Food analysis
  console.log('4️⃣ Test: Food Analysis');
  try {
    const response = await fetch(`${API_BASE}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: TEST_IMAGES.food,
        prompt: 'What food items are in this image? Estimate the ingredients.',
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('   ✅ Success!');
      console.log('   📊 Analysis:', data.analysis.substring(0, 200) + '...');
      console.log('   ⏱️  Duration:', data.metadata.duration + 'ms\n');
    } else {
      console.log('   ❌ Failed:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error);
  }

  console.log('✅ Vision API tests complete!\n');
}

async function testVisionWorkflow() {
  console.log('🔄 Testing Vision in Workflow\n');

  try {
    // Create a workflow with vision node
    console.log('Creating workflow with vision node...');
    const createResponse = await fetch(`${API_BASE}/api/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vision Analysis Workflow',
        description: 'Test workflow with vision node',
        nodes: [
          {
            id: 'vision1',
            type: 'vision',
            name: 'Analyze Image',
            description: 'Analyze an image',
            icon: 'Eye',
            position: { x: 100, y: 100 },
            content: {
              imageUrl: TEST_IMAGES.cat,
              prompt: 'Describe this image and identify the main subject.',
            },
          },
          {
            id: 'output1',
            type: 'output',
            name: 'Output Result',
            description: 'Output the analysis',
            icon: 'FileOutput',
            position: { x: 300, y: 100 },
            content: {
              format: 'json',
            },
          },
        ],
        connections: [
          {
            id: 'conn1',
            from: 'vision1',
            to: 'output1',
          },
        ],
      }),
    });

    const workflow = await createResponse.json();
    if (!workflow.id) {
      console.log('   ❌ Failed to create workflow');
      return;
    }

    console.log('   ✅ Workflow created:', workflow.id);

    // Execute the workflow
    console.log('\nExecuting workflow...');
    const executeResponse = await fetch(
      `${API_BASE}/api/workflows/${workflow.id}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );

    const execution = await executeResponse.json();
    if (!execution.executionId) {
      console.log('   ❌ Failed to execute workflow');
      return;
    }

    console.log('   ✅ Execution started:', execution.executionId);

    // Wait for execution to complete
    console.log('\nWaiting for execution to complete...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get execution result
    const resultResponse = await fetch(
      `${API_BASE}/api/executions/${execution.executionId}`
    );
    const result = await resultResponse.json();

    console.log('\n📊 Execution Result:');
    console.log('   Status:', result.status);
    console.log('   Duration:', result.duration + 'ms');
    if (result.output) {
      console.log('   Output:', JSON.stringify(result.output, null, 2).substring(0, 300) + '...');
    }

    console.log('\n✅ Vision workflow test complete!\n');
  } catch (error) {
    console.log('   ❌ Error:', error);
  }
}

async function main() {
  console.log('🚀 Vision Analysis Test Suite\n');
  console.log('Make sure the server is running: npm run dev\n');

  // Test standalone API
  await testVisionAPI();

  // Test vision in workflow
  await testVisionWorkflow();

  console.log('🎉 All tests complete!');
}

main().catch(console.error);
