# 🚀 Setup Guide

This guide will help you set up the Magnet AI project for local development.

## Prerequisites

- Node.js 18+ installed
- A Firebase project with Firestore enabled
- Google AI (Gemini) API key

---

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd magnet-ai-protopype-
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Firebase Setup

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll update rules later)
4. Select a location (e.g., `us-central1`)
5. Wait for the database to be created

### Get Service Account Credentials

1. Go to **Project Settings** > **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. **Important:** Convert the JSON to a single-line string:
   ```bash
   # On Linux/Mac:
   cat service-account.json | jq -c
   
   # Or manually remove all newlines from the JSON
   ```

### Update Firestore Security Rules

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // ⚠️ Development only!
       }
     }
   }
   ```
3. Click **"Publish"**

> ⚠️ **Warning:** The above rules allow public access. Use proper authentication rules in production!

---

## 4️⃣ Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the API key

---

## 5️⃣ Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and fill in the required values:

   ```env
   # Firebase Service Account (single-line JSON string)
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
   
   # Firestore Database ID (check your Firebase Console)
   # If your database is named "(default)", you can omit this
   # If it has a custom name (e.g., "magnet-ai"), specify it:
   FIRESTORE_DATABASE_ID=your-database-id
   
   # Google AI API Key
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
   ```

### Finding Your Firestore Database ID

1. Go to Firebase Console > **Firestore Database**
2. Look at the "Databases" section
3. If you see a database named something other than `(default)`, use that name
4. Example: If your database is named `magnet-ai`, set:
   ```env
   FIRESTORE_DATABASE_ID=magnet-ai
   ```

---

## 6️⃣ Run the Development Server

```bash
npm run dev
```

The server will start at: http://localhost:9002

---

## 7️⃣ Verify Setup

Run the setup check script:

```bash
npm run check:setup
```

You should see:
```
✅ Server is running
✅ FIREBASE_SERVICE_ACCOUNT is set
✅ Project ID: your-project-id
✅ GOOGLE_GENAI_API_KEY is set
✅ Workflow creation works!
✅ Workflow listing works!
```

---

## 8️⃣ Test the Execution Engine

```bash
npm run test:execution
```

This will test:
- Webhook executor
- LLM executor
- API executor
- Logic executor
- Output executor

---

## 🔧 Troubleshooting

### Error: `5 NOT_FOUND`

**Cause:** Firestore database not found or wrong database ID

**Solution:**
1. Verify the database exists in Firebase Console
2. Check that `FIRESTORE_DATABASE_ID` matches your database name
3. Ensure Firestore is in **Native mode** (not Datastore mode)

### Error: `PERMISSION_DENIED`

**Cause:** Firestore security rules are blocking access

**Solution:**
1. Go to Firestore > Rules
2. Change `allow read, write: if false;` to `if true;`
3. Click "Publish"

### Error: `Invalid service account`

**Cause:** `FIREBASE_SERVICE_ACCOUNT` is not a valid JSON string

**Solution:**
1. Ensure the JSON is on a **single line** (no newlines)
2. Ensure all quotes are properly escaped
3. Test by parsing: `echo $FIREBASE_SERVICE_ACCOUNT | jq`

### Server logs show: `Using database ID: (default)` but my database has a different name

**Cause:** `FIRESTORE_DATABASE_ID` is not set or incorrect

**Solution:**
1. Check your database name in Firebase Console
2. Add to `.env.local`: `FIRESTORE_DATABASE_ID=your-database-name`
3. Restart the server

---

## 📚 Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Google AI (Gemini) Documentation](https://ai.google.dev/docs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly: `npm run check:setup && npm run test:execution`
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | ✅ Yes | Firebase service account JSON (single-line) |
| `FIRESTORE_DATABASE_ID` | ⚠️ Conditional | Database ID if not using `(default)` |
| `GOOGLE_GENAI_API_KEY` | ✅ Yes | Google AI API key for LLM features |
| `FIREBASE_DATABASE_URL` | ❌ No | Realtime Database URL (optional) |
| `OPENAI_API_KEY` | ❌ No | OpenAI API key (optional) |
| `ANTHROPIC_API_KEY` | ❌ No | Anthropic API key (optional) |
| `GROQ_API_KEY` | ❌ No | Groq API key (optional) |
| `JWT_SECRET` | ⚠️ Production | JWT secret for authentication |
| `WEBHOOK_SECRET` | ⚠️ Production | Webhook verification secret |

---

## 🎉 You're All Set!

Your Magnet AI development environment is ready. Start building workflows! 🚀
