# 🚀 Quick Start with Docker - CodeDocAI

## Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (comes with Docker Desktop)
- Google Gemini API Key ([Get free key](https://ai.google.dev/))

---

## ⚡ 3-Step Quick Start

### Step 1: Clone & Configure
```bash
# Clone the repository
git clone https://github.com/kathirvel-p22/CodeDocAI.git
cd CodeDocAI

# Create environment file
cp .env.example .env
```

Edit `.env` file and add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb://mongodb:27017
DB_NAME=codedocai
```

### Step 2: Start Services
```bash
# Build and start all services (MongoDB + CodeDocAI)
docker-compose up -d --build
```

This will:
- ✅ Build the CodeDocAI application (frontend + backend)
- ✅ Start MongoDB database
- ✅ Create Docker network
- ✅ Set up persistent volumes

### Step 3: Access Application
Open your browser:
```
http://localhost:3000
```

---

## 📊 Verify Everything is Running

### Check Services Status
```bash
docker-compose ps
```

Expected output:
```
NAME                 STATUS              PORTS
codedocai-app        Up (healthy)        0.0.0.0:3000->3000/tcp
codedocai-mongodb    Up (healthy)        0.0.0.0:27017->27017/tcp
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just application
docker-compose logs -f codedocai

# Just database
docker-compose logs -f mongodb
```

---

## 🛠️ Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Stop and Remove Everything (including data)
```bash
docker-compose down -v
```

---

## 🔍 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000

# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

### Issue: Cannot connect to MongoDB
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Issue: Application won't start
```bash
# Check logs
docker-compose logs codedocai

# Verify environment variables
docker-compose exec codedocai env | grep GEMINI
```

---

## ✅ Requirements Checklist

After successful deployment, verify:

- [ ] MongoDB running on port 27017
- [ ] CodeDocAI running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can upload project files
- [ ] Analysis completes successfully
- [ ] Data persists after restart

---

## 🌐 Production Deployment

### Deploy to Cloud

#### AWS (Elastic Container Service)
```bash
# Push to ECR
docker tag codedocai:latest <account>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest
```

#### Azure (Container Instances)
```bash
# Build and push
az acr build --registry codedocaiacr --image codedocai:latest .
```

#### Google Cloud (Cloud Run)
```bash
# Deploy
gcloud run deploy codedocai --source . --port 3000
```

---

## 📖 What's Running?

### Frontend (React + TypeScript)
- Built with Vite
- Served as static files
- Accessible at http://localhost:3000

### Backend (Node.js + Express)
- Handles API requests
- Integrates with Gemini AI
- Connects to MongoDB
- API endpoint: http://localhost:3000/api/*

### Database (MongoDB)
- Stores scan history
- Stores analytics data
- Port: 27017
- Database name: codedocai

---

## 🎉 Success!

Your CodeDocAI platform is now running!

**Next Steps:**
1. Upload a code project
2. Review bug detection results
3. Export comprehensive reports
4. Monitor scan history in MongoDB

---

**Need Help?**
- GitHub Issues: https://github.com/kathirvel-p22/CodeDocAI/issues
- Documentation: README.md
- Deployment Guide: DEPLOYMENT.md
