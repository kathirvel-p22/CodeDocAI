# 🔍 How CodeDocAI Frontend & Backend Work in Docker

## Visual Architecture Explained

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DOCKER DESKTOP                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Container 1: MongoDB (codedocai-mongodb)             │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Port: 27017                                          │ │
│  │  Database: codedocai                                  │ │
│  │  Status: Running (Healthy) ✅                         │ │
│  │                                                       │ │
│  │  What it does:                                        │ │
│  │  • Stores scan history                                │ │
│  │  • Saves analysis results                             │ │
│  │  • Provides statistics                                │ │
│  │  • Persists data across restarts                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                │
│              (Internal Docker Network)                      │
│                            ↕                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Container 2: CodeDocAI App (codedocai-app)           │ │
│  │  ─────────────────────────────────────────────────    │ │
│  │  Port: 3000 (mapped to your PC's 3000)               │ │
│  │  Status: Running (Healthy) ✅                         │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  EXPRESS.JS SERVER (Backend)                 │   │ │
│  │  │  ────────────────────────────────────────    │   │ │
│  │  │  • Serves static files from /dist            │   │ │
│  │  │  • Handles API routes:                       │   │ │
│  │  │    - POST /api/analyze                       │   │ │
│  │  │    - GET /api/history                        │   │ │
│  │  │    - GET /api/statistics                     │   │ │
│  │  │  • Connects to MongoDB                       │   │ │
│  │  │  • Calls Gemini AI API                       │   │ │
│  │  │  • Processes file uploads                    │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  /dist FOLDER (Frontend)                     │   │ │
│  │  │  ────────────────────────────────────────    │   │ │
│  │  │  • index.html (entry point)                  │   │ │
│  │  │  • assets/index-xxx.js (React bundle)        │   │ │
│  │  │  • assets/index-xxx.css (Tailwind styles)    │   │ │
│  │  │  • Built BEFORE Docker with: npm run build   │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                │
│                   (Port Mapping)                            │
│                            ↕                                │
└────────────────────────────────────────────────────────────┘
                             ↕
                  http://localhost:3000
                             ↕
                    ┌─────────────────┐
                    │  YOUR BROWSER   │
                    │  (Chrome, etc.) │
                    └─────────────────┘
```

---

## 🔄 Request Flow Step-by-Step

### Scenario 1: Loading the Website

```
1. User Types: http://localhost:3000
   ↓
2. Browser sends HTTP GET request
   ↓
3. Docker forwards port 3000 → Container codedocai-app
   ↓
4. Express.js receives request
   ↓
5. Express checks route:
   - Is it /api/*? NO
   - Then serve static file!
   ↓
6. Express sends: /dist/index.html
   ↓
7. Browser receives HTML + loads JavaScript
   ↓
8. React 19 app initializes
   ↓
9. UI appears ✅
```

### Scenario 2: Uploading Code for Analysis

```
1. User clicks "Upload Folder" button
   ↓
2. React component handles file selection
   ↓
3. Frontend sends POST request to /api/analyze
   ↓
4. Express.js receives request in server.ts
   ↓
5. Backend processes files:
   • Parses folder structure
   • Analyzes code patterns
   • Builds prompt for AI
   ↓
6. Backend calls Gemini AI API
   • Sends code + context
   • Waits for analysis
   ↓
7. Gemini returns bug report JSON
   ↓
8. Backend saves to MongoDB:
   • Scan history
   • Metrics
   • Timestamp
   ↓
9. Backend sends response to frontend
   ↓
10. React updates UI:
    • Shows bugs
    • Renders knowledge graph
    • Displays metrics
    ↓
11. User sees results ✅
```

### Scenario 3: Database Interaction

```
Frontend (React)
    ↓ API call
Backend (Express)
    ↓ MongoDB Driver
MongoDB Container
    ↓ Store data
Volume (Persistent Storage on your PC)
```

---

## 🏗️ Why Single Container for Frontend + Backend?

### Traditional Approach (Separate Containers):
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │ HTTP │  Backend    │ TCP  │  MongoDB    │
│  Container  │─────>│  Container  │─────>│  Container  │
│  (Nginx)    │      │  (Node.js)  │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```
**Issues:**
- CORS configuration needed
- Two containers to manage
- More complex networking
- Higher resource usage

### CodeDocAI Approach (Unified):
```
┌───────────────────────────────┐      ┌─────────────┐
│  CodeDocAI Container          │      │  MongoDB    │
│  ┌────────────────────────┐   │ TCP  │  Container  │
│  │ Express.js (Backend)   │   │─────>│             │
│  │  ↓                     │   │      │             │
│  │ Serves /dist (Frontend)│   │      │             │
│  └────────────────────────┘   │      │             │
└───────────────────────────────┘      └─────────────┘
```
**Benefits:**
- ✅ No CORS issues (same origin)
- ✅ One container to manage
- ✅ Simpler deployment
- ✅ Lower resource overhead
- ✅ Production-standard pattern

---

## 📦 What's Inside Each Container?

### MongoDB Container (mongo:7.0)
```
/data/db/          ← Database files (persisted in Docker volume)
/data/configdb/    ← Configuration
/tmp/mongodb-27017.sock
```

### CodeDocAI Container (codeinsight-ai-codedocai)
```
/app/
├── dist/                      ← Frontend (React app)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxx.js      ← React bundle
│   │   └── index-xxx.css     ← Tailwind styles
├── server.ts                  ← Backend server
├── src/                       ← Source code (for backend)
│   ├── lib/
│   │   ├── database.ts       ← MongoDB functions
│   │   ├── knowledgeGraph.ts
│   │   └── ...
│   └── components/            ← (Not used at runtime, just reference)
├── node_modules/              ← Dependencies
└── package.json
```

---

## 🔄 Build Process Explained

### Step 1: Local Build (BEFORE Docker)
```bash
npm run build
```

This runs **Vite** which:
1. Reads `src/` folder (React components)
2. Compiles TypeScript → JavaScript
3. Bundles all files
4. Minifies code
5. Creates `dist/` folder

**Result:** `/dist` folder with production-ready static files

### Step 2: Docker Build
```bash
docker-compose up --build
```

This:
1. **Creates MongoDB container**
   - Pulls mongo:7.0 image
   - Creates volume for persistence
   - Starts MongoDB server

2. **Creates CodeDocAI container**
   - Uses Node.js 18 base image
   - Copies package.json
   - Installs production dependencies
   - **Copies pre-built /dist folder** ← KEY!
   - Copies server.ts and backend code
   - Installs tsx for TypeScript
   - Starts server with `npm start`

---

## 🎯 How Data Persists

### MongoDB Data
```
Your PC's Disk
    ↓
Docker Volume (codeinsight-ai_mongodb_data)
    ↓
Mapped to: /data/db inside MongoDB container
    ↓
MongoDB writes data here
    ↓
Survives container restarts! ✅
```

When you run `docker-compose down`:
- Containers stop ✅
- Data in volumes remains ✅

When you run `docker-compose down -v`:
- Containers stop ✅
- Volumes deleted ❌
- All data lost ❌

---

## 🌐 Port Mapping Explained

### What Does "0.0.0.0:3000->3000/tcp" Mean?

```
0.0.0.0:3000 → 3000/tcp
    ↑           ↑
    │           └─ Container's internal port
    └─ Your PC's exposed port

Translation:
"Forward requests from your PC's port 3000 
 to container's port 3000"
```

**In Practice:**
```
Browser (localhost:3000)
    ↓
Your PC (port 3000)
    ↓
Docker Engine
    ↓
Container (port 3000)
    ↓
Express.js Server
```

---

## 🔍 How Frontend & Backend Communicate

### Same-Origin Requests (No CORS Needed)

When React calls API:
```javascript
// In React component
fetch('/api/analyze', {
  method: 'POST',
  body: formData
})
```

**What Happens:**
1. Browser sees `/api/analyze` (relative URL)
2. Browser knows current origin: `http://localhost:3000`
3. Makes request to: `http://localhost:3000/api/analyze`
4. Express.js receives it (same server!)
5. No CORS issues because same origin ✅

**Behind the Scenes:**
```
http://localhost:3000
        ↓
   Express Server
        ↓
   Route Check:
   • /api/analyze? → Backend handler
   • /index.html?  → Static file from /dist
   • /styles.css?  → Static file from /dist
```

---

## 💡 Key Insights

### 1. Frontend is Pre-Built
- React app built BEFORE Docker
- Not built inside container
- Avoids Tailwind native binding issues
- Faster Docker builds

### 2. Single Server for Everything
- Express.js serves both frontend and API
- Frontend = static files from /dist
- Backend = API routes at /api/*

### 3. Database is Separate
- MongoDB in its own container
- Connected via Docker network
- Not exposed to your PC (except port)
- Data persisted in volumes

### 4. Everything Orchestrated
- `docker-compose` manages both containers
- Ensures MongoDB starts first
- Waits for health checks
- Connects containers automatically

---

## 🎓 Common Questions

### Q: Can I see the source code in the container?
**A:** Yes! Run:
```bash
docker exec -it codedocai-app sh
ls -la /app
```

### Q: Where is the frontend "running"?
**A:** Frontend doesn't "run" - it's static files served by Express.js. The "running" part is React executing in your browser.

### Q: How does React communicate with Express?
**A:** Through HTTP requests (fetch/axios) to `/api/*` endpoints on the same origin.

### Q: Why use Docker if it works locally?
**A:** 
- Consistent environment anywhere
- Easy deployment to cloud
- No "works on my machine" problems
- Matches production setup

### Q: What happens if I change code?
**A:** 
1. Stop Docker: `docker-compose down`
2. Rebuild frontend: `npm run build`
3. Restart Docker: `docker-compose up -d`

---

## 🚀 Production Deployment Flow

```
Local Development
    ↓ (git push)
GitHub Repository
    ↓ (CI/CD pipeline)
Container Registry (ECR/ACR/Docker Hub)
    ↓ (deploy)
Cloud Service (AWS ECS/Azure/DigitalOcean)
    ↓ (expose)
Public URL (https://your-app.com)
```

---

**Understanding this architecture helps you:**
- Debug issues faster
- Explain your project confidently
- Deploy to production easily
- Scale your application effectively

---

**Author:** Kathirvel P  
**Date:** July 5, 2026  
**Project:** CodeDocAI
