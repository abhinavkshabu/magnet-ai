# Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `firebase-admin` - For Firestore database
- `tsx` - For running TypeScript scripts

### 2. Set Up Firebase

#### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location

4. Get Service Account Credentials:
   - Go to Project Settings (⚙️ icon)
   - Go to "Service Accounts" tab
   - Click "Generate new private key"
   - Download the JSON file

5. Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

6. Add your Firebase credentials to `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

**Note**: Copy the entire JSON content from the downloaded file into `FIREBASE_SERVICE_ACCOUNT` (as a single line).

#### Option B: Using Firebase CLI (Alternative)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore
```

### 3. Verify Setup

Start the development server:

```bash
npm run dev
```

Test the health endpoint:

```bash
curl http://localhost:9002/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "services": {
    "database": "connected",
    "api": "operational"
  }
}
```

### 4. Run API Tests

```bash
npm run test:api
```

This will:
- ✅ Check health endpoint
- ✅ Create a test workflow
- ✅ Fetch the workflow
- ✅ Update the workflow
- ✅ Execute the workflow
- ✅ Check execution status
- ✅ Get execution logs
- ✅ List all workflows
- ✅ Delete the workflow

---

## 📁 What We Built

### Database Layer
- ✅ `src/lib/firebase-admin.ts` - Firebase Admin SDK setup
- ✅ `src/lib/db/types.ts` - Database type definitions
- ✅ `src/lib/db/utils.ts` - Database utilities
- ✅ `src/lib/db/workflows.ts` - Workflow CRUD operations
- ✅ `src/lib/db/executions.ts` - Execution tracking
- ✅ `src/lib/db/users.ts` - User management

### API Routes
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/workflows` - List workflows
- ✅ `POST /api/workflows` - Create workflow
- ✅ `GET /api/workflows/[id]` - Get workflow
- ✅ `PUT /api/workflows/[id]` - Update workflow
- ✅ `DELETE /api/workflows/[id]` - Delete workflow
- ✅ `POST /api/workflows/[id]/execute` - Execute workflow
- ✅ `GET /api/executions/[id]` - Get execution status
- ✅ `GET /api/executions/[id]/logs` - Get execution logs
- ✅ `DELETE /api/executions/[id]` - Cancel execution

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:9002/api/health

# Create workflow
curl -X POST http://localhost:9002/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"My Workflow","description":"Test workflow"}'

# Get workflow (replace {id} with actual ID)
curl http://localhost:9002/api/workflows/{id}

# Execute workflow
curl -X POST http://localhost:9002/api/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"testData":"hello"}'

# Check execution status
curl http://localhost:9002/api/executions/{execution-id}

# Get execution logs
curl http://localhost:9002/api/executions/{execution-id}/logs
```

### Using the Test Script

```bash
npm run test:api
```

---

## 🔍 Firestore Collections

Your database will have these collections:

```
firestore/
├── workflows/          # User workflows
│   └── {workflowId}
│       ├── id
│       ├── name
│       ├── userId
│       ├── nodes[]
│       ├── connections[]
│       └── ...
│
├── executions/         # Workflow executions
│   └── {executionId}
│       ├── workflowId
│       ├── status
│       ├── startedAt
│       └── ...
│
├── execution_logs/     # Execution logs
│   └── {logId}
│       ├── executionId
│       ├── nodeId
│       ├── message
│       └── ...
│
└── users/             # User profiles
    └── {userId}
        ├── email
        ├── plan
        └── ...
```

---

## 🐛 Troubleshooting

### Error: "Failed to fetch workflows"

**Cause**: Firebase not initialized or credentials missing

**Fix**:
1. Check `.env.local` exists and has `FIREBASE_SERVICE_ACCOUNT`
2. Verify the JSON is valid (no line breaks)
3. Restart the dev server

### Error: "Database connection failed"

**Cause**: Firestore not enabled or wrong project

**Fix**:
1. Go to Firebase Console
2. Enable Firestore Database
3. Check project ID matches your credentials

### Error: "Permission denied"

**Cause**: Firestore security rules blocking access

**Fix** (for development):
```javascript
// In Firestore Rules (Firebase Console)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Development only!
    }
  }
}
```

---

## ✅ Next Steps

Now that the backend is set up, we can:

1. **Connect Frontend to Backend**
   - Update `src/app/page.tsx` to use real API calls
   - Replace in-memory state with database calls

2. **Build Execution Engine**
   - Implement real node execution handlers
   - Add support for different node types

3. **Add Authentication**
   - Implement Firebase Auth
   - Add protected routes

4. **Implement Webhooks**
   - Create webhook endpoints
   - Add webhook security

5. **Add AI Features**
   - Complete workflow generation from text
   - Enhance node suggestions

---

## 📚 Resources

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
