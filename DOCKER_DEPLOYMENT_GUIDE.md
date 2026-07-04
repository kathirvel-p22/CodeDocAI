# 🐳 Docker Deployment Guide - CodeDocAI

## What Docker Is Running

Your CodeDocAI application runs **TWO services** in Docker:

1. **MongoDB Database** - Stores scan history and statistics
2. **CodeDocAI App** - Frontend (React) + Backend (Express) in ONE container

```
┌─────────────────────────────────────┐
│   Docker Compose Orchestration      │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   MongoDB Container          │  │
│  │   Port: 27017                │  │
│  │   Database: codedocai        │  │
│  └──────────────────────────────┘  │
│              ↕                      │
│  ┌──────────────────────────────┐  │
│  │   CodeDocAI Container        │  │
│  │   Port: 3000                 │  │
│  │   ┌────────────────────────┐ │  │
│  │   │ Frontend (React)       │ │  │
│  │   │ - UI Components        │ │  │
│  │   │ - Knowledge Graph      │ │  │
│  │   │ - Visualizations       │ │  │
│  │   └────────────────────────┘ │  │
│  │   ┌────────────────────────┐ │  │
│  │   │ Backend (Express)      │ │  │
│  │   │ - API Endpoints        │ │  │
│  │   │ - Gemini AI calls      │ │  │
│  │   │ - File processing      │ │  │
│  │   └────────────────────────┘ │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start Commands

### 1️⃣ Build and Start (First Time)
```bash
docker-compose up -d --build
```

### 2️⃣ View Logs
```bash
docker-compose logs -f
```

### 3️⃣ Check Status
```bash
docker-compose ps
```

### 4️⃣ Stop Application
```bash
docker-compose down
```

### 5️⃣ Restart Application
```bash
docker-compose restart
```

### 6️⃣ Remove Everything (including data)
```bash
docker-compose down -v
```

---

## 🌐 Access Your Application

Once containers are running:

- **Application URL:** http://localhost:3000
- **MongoDB:** localhost:27017 (internal use only)

---

## 📋 What Happens During Build

### Stage 1: MongoDB Setup
1. Pulls MongoDB 7.0 image from Docker Hub
2. Creates persistent volume for data storage
3. Configures health checks
4. Exposes port 27017

### Stage 2: Application Build
1. **Frontend Build:**
   - Installs Node.js dependencies
   - Compiles TypeScript to JavaScript
   - Bundles React app with Vite
   - Creates optimized production build in `/dist`

2. **Backend Setup:**
   - Copies server.ts (Express backend)
   - Installs production dependencies only
   - Configures environment variables
   - Exposes port 3000

3. **Integration:**
   - Backend serves frontend static files from `/dist`
   - Backend API endpoints handle requests
   - Connects to MongoDB for persistence

---

## 🔍 Verify Deployment

### Check Container Status
```bash
docker ps
```

You should see:
```
CONTAINER ID   IMAGE                  STATUS         PORTS
abc123...      codedocai-app          Up 2 minutes   0.0.0.0:3000->3000/tcp
def456...      mongo:7.0              Up 2 minutes   0.0.0.0:27017->27017/tcp
```

### Check Application Logs
```bash
docker-compose logs codedocai
```

Look for:
```
Server running on http://localhost:3000
✓ Frontend served from: /app/dist
✓ Backend API ready
```

### Check MongoDB Logs
```bash
docker-compose logs mongodb
```

Look for:
```
MongoDB starting
Waiting for connections on port 27017
```

---

## 🛠️ Troubleshooting

### Problem: Port 3000 Already in Use
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "8080:3000"  # Use 8080 instead
```

### Problem: MongoDB Connection Failed
```bash
# Check MongoDB is healthy
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Problem: Build Failed
```bash
# Clean everything and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Problem: Application Not Loading
```bash
# Check logs for errors
docker-compose logs codedocai

# Restart application
docker-compose restart codedocai

# Check if dist folder was built
docker-compose exec codedocai ls -la /app/dist
```

---

## 📊 Docker Desktop View

In Docker Desktop, you'll see:

### Containers Tab
- `codedocai-mongodb` - Running (green)
- `codedocai-app` - Running (green)

### Images Tab
- `mongo:7.0`
- `codeinsight-ai-codedocai`

### Volumes Tab
- `codeinsight-ai_mongodb_data` - MongoDB data persistence
- `codeinsight-ai_mongodb_config` - MongoDB configuration

---

## 🔐 Environment Variables

Required in `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
MONGODB_URI=mongodb://mongodb:27017
DB_NAME=codedocai
```

**Note:** Docker Compose automatically reads `.env` file in project root.

---

## 📈 Resource Usage

Typical resource consumption:
- **MongoDB:** ~200MB RAM
- **CodeDocAI:** ~300MB RAM
- **Total Disk:** ~1GB (images + data)

---

## 🎯 Production Deployment

### Deploy to AWS ECS
```bash
# Tag image
docker tag codeinsight-ai-codedocai:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/codedocai:latest

# Push to ECR
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/codedocai:latest

# Deploy with ECS CLI
ecs-cli compose up
```

### Deploy to Azure
```bash
# Login to Azure
az acr login --name <registry-name>

# Tag and push
docker tag codeinsight-ai-codedocai:latest <registry-name>.azurecr.io/codedocai:latest
docker push <registry-name>.azurecr.io/codedocai:latest

# Deploy
az container create --resource-group myResourceGroup \
  --name codedocai \
  --image <registry-name>.azurecr.io/codedocai:latest \
  --ports 3000
```

---

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] MongoDB container is healthy (green in Docker Desktop)
- [ ] CodeDocAI container is running (green in Docker Desktop)
- [ ] Can access http://localhost:3000
- [ ] Can upload and analyze code
- [ ] No errors in logs
- [ ] Database persistence works (check after restart)

---

## 🎓 Understanding the Setup

### Why Docker Compose?
- **Multi-container orchestration:** Runs MongoDB + App together
- **Network isolation:** Containers communicate securely
- **Volume persistence:** Data survives container restarts
- **Health checks:** Ensures MongoDB is ready before app starts
- **Easy deployment:** One command deploys everything

### Why Single Container for Frontend + Backend?
- **Simplified deployment:** One container, one port
- **No CORS issues:** Same origin for API calls
- **Reduced overhead:** Fewer containers to manage
- **Production-ready:** Mimics real-world deployment

### Docker vs Local Development
| Feature | Local Dev | Docker |
|---------|-----------|--------|
| Setup | Complex (Node, MongoDB, etc.) | Simple (one command) |
| Consistency | Varies by machine | Identical everywhere |
| Isolation | Shares system resources | Isolated environment |
| Deployment | Manual configuration | Production-ready |
| Portability | OS-dependent | Works anywhere |

---

## 📞 Need Help?

Check logs first:
```bash
docker-compose logs -f
```

Common issues:
1. **Port conflicts** → Change port in docker-compose.yml
2. **Build errors** → Check `npm run build` works locally
3. **API key missing** → Verify `.env` file exists
4. **MongoDB down** → Check health: `docker-compose ps`

---

**Deployment Date:** January 2025  
**Version:** 1.0.0  
**Docker Compose:** v3.8  
**Base Image:** Node 18 Alpine
