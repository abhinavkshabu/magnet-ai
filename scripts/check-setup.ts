/**
 * Check if everything is set up correctly
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const SETUP_API_BASE = 'http://localhost:9002';

async function checkSetup() {
  console.log('🔍 Checking Setup...\n');

  // 1. Check if server is running
  console.log('1️⃣ Checking if server is running...');
  try {
    const response = await fetch(`${SETUP_API_BASE}/api/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Server is running');
      console.log('   📊 Response:', data);
    } else {
      console.log('   ❌ Server responded but health check failed');
      console.log('   📊 Response:', data);
    }
  } catch (error) {
    console.log('   ❌ Server is NOT running!');
    console.log('   💡 Run: npm run dev');
    process.exit(1);
  }

  // 2. Check environment variables
  console.log('\n2️⃣ Checking environment variables...');
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('   ✅ FIREBASE_SERVICE_ACCOUNT is set');
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log(`   ✅ Project ID: ${serviceAccount.project_id}`);
      console.log(`   ✅ Client Email: ${serviceAccount.client_email}`);
    } catch (error) {
      console.log('   ❌ FIREBASE_SERVICE_ACCOUNT is invalid JSON');
    }
  } else {
    console.log('   ❌ FIREBASE_SERVICE_ACCOUNT is NOT set');
    console.log('\n   💡 Create a .env.local file with Firebase credentials');
    console.log('   See .env.example for reference');
  }
  
  if (process.env.GOOGLE_GENAI_API_KEY) {
    console.log('   ✅ GOOGLE_GENAI_API_KEY is set');
  } else {
    console.log('   ⚠️  GOOGLE_GENAI_API_KEY is NOT set (LLM features will not work)');
  }

  // 3. Test workflow creation
  console.log('\n3️⃣ Testing workflow creation...');
  try {
    const response = await fetch(`${SETUP_API_BASE}/api/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Workflow',
        description: 'Setup check test',
        nodes: [],
        connections: [],
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Workflow creation works!');
      console.log('   📊 Created workflow:', data.data.id);
    } else {
      console.log('   ❌ Workflow creation failed');
      console.log('   📊 Error:', data.error);
      if (data.details) {
        console.log('   📊 Details:', data.details);
      }
    }
  } catch (error) {
    console.log('   ❌ Failed to create workflow');
    console.log('   📊 Error:', error);
  }

  // 4. Test workflow listing
  console.log('\n4️⃣ Testing workflow listing...');
  try {
    const response = await fetch(`${SETUP_API_BASE}/api/workflows`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`   ✅ Workflow listing works! Found ${data.data.length} workflows`);
    } else {
      console.log('   ❌ Workflow listing failed');
      console.log('   📊 Error:', data.error);
    }
  } catch (error) {
    console.log('   ❌ Failed to list workflows');
    console.log('   📊 Error:', error);
  }

  console.log('\n✅ Setup check complete!\n');
}

checkSetup().catch(console.error);
