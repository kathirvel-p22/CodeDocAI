# 🚀 Deployment Guide - CodeDocAI

## Prerequisites

- Docker & Docker Compose installed
- Google Gemini API Key ([Get it here](https://ai.google.dev/))
- (Optional) MongoDB Atlas account for cloud database

---

## 🐳 Docker Deployment (Recommended)

### Quick Start with Docker Compose

1. **Clone the repository**
```bash
git clone https://github.com/kathirvel-p22/CodeDocAI.git
cd CodeDocAI
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY="your_actual_api_key_here"
MONGODB_URI="mongodb://mongodb:27017"
DB_NAME="codedocai"
```

3. **Start all services**
```bash
docker-compose up -d
```

This will start:
- **MongoDB** on port 27017
- **CodeDocAI** on port 3000

4. **Access the application**
```
http://localhost:3000
```

5. **View logs**
```bash
docker-compose logs -f codedocai
```

6. **Stop services**
```bash
docker-compose down
```

7. **Stop and remove data**
```bash
docker-compose down -v
```

---

## ☁️ Cloud Deployment Options

### Option 1: AWS Deployment

#### Using AWS ECS (Elastic Container Service)

1. **Build and push to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t codedocai .

# Tag image
docker tag codedocai:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest
```

2. **Create ECS Task Definition**
```json
{
  "family": "codedocai",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "codedocai",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "GEMINI_API_KEY",
          "value": "your-api-key"
        },
        {
          "name": "MONGODB_URI",
          "value": "mongodb+srv://username:password@cluster.mongodb.net/"
        }
      ]
    }
  ]
}
```

3. **Use MongoDB Atlas for database**
- Create cluster at https://www.mongodb.com/cloud/atlas
- Get connection string
- Update MONGODB_URI in ECS task

---

### Option 2: Azure Deployment

#### Using Azure Container Instances

1. **Build and push to ACR**
```bash
# Create resource group
az group create --name codedocai-rg --location eastus

# Create container registry
az acr create --resource-group codedocai-rg --name codedocaiacr --sku Basic

# Build and push
az acr build --registry codedocaiacr --image codedocai:latest .
```

2. **Deploy to Azure Container Instances**
```bash
az container create \
  --resource-group codedocai-rg \
  --name codedocai-app \
  --image codedocaiacr.azurecr.io/codedocai:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables \
    GEMINI_API_KEY='your-api-key' \
    MONGODB_URI='your-mongodb-uri'
```

---

### Option 3: Digital Ocean / Heroku / Render

#### Digital Ocean App Platform

1. Connect GitHub repository
2. Add environment variables:
   - `GEMINI_API_KEY`
   - `MONGODB_URI`
3. Deploy automatically on push

#### Heroku

```bash
heroku create codedocai
heroku config:set GEMINI_API_KEY=your-key
heroku config:set MONGODB_URI=your-mongodb-uri
git push heroku main
```

---

## 🗄️ Database Setup

### Option 1: Local MongoDB (Development)

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install locally
# Ubuntu: sudo apt install mongodb
# Mac: brew install mongodb-community
# Windows: Download from mongodb.com
```

### Option 2: MongoDB Atlas (Production - Recommended)

1. **Create free cluster** at https://www.mongodb.com/cloud/atlas
2. **Setup network access** - Add your IP or 0.0.0.0/0 (allow all)
3. **Create database user**
4. **Get connection string**:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/codedocai
```

5. **Update .env**:
```env
MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
DB_NAME="codedocai"
```

---

## 🔧 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key | `AIza...` |
| `MONGODB_URI` | ⚠️ Optional | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | ⚠️ Optional | Database name | `codedocai` |
| `NODE_ENV` | No | Environment mode | `production` |
| `PORT` | No | Server port | `3000` |

**Note:** App works without MongoDB (uses localStorage), but database is required for project submission.

---

## 📊 Health Checks

### Application Health
```bash
curl http://localhost:3000/
# Should return 200 OK
```

### MongoDB Health
```bash
docker exec -it codedocai-mongodb mongosh --eval "db.adminCommand('ping')"
```

### View Logs
```bash
# Application logs
docker-compose logs -f codedocai

# MongoDB logs
docker-compose logs -f mongodb
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Added to `.gitignore`
2. **Use secrets management** - AWS Secrets Manager, Azure Key Vault
3. **Enable MongoDB authentication** in production
4. **Use HTTPS** in production with SSL certificates
5. **Limit MongoDB network access** - Whitelist IPs only

---

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  codedocai:
    deploy:
      replicas: 3
```

### Load Balancer
Use Nginx or cloud load balancer:
```nginx
upstream codedocai {
    server codedocai1:3000;
    server codedocai2:3000;
    server codedocai3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://codedocai;
    }
}
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to MongoDB
**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs codedocai-mongodb

# Test connection
mongosh "mongodb://localhost:27017/codedocai"
```

### Issue: Application not starting
**Solution:**
```bash
# Check logs
docker logs codedocai-app

# Verify environment variables
docker exec codedocai-app env | grep GEMINI

# Restart services
docker-compose restart
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Mac/Linux

# Kill process or change port in docker-compose.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Application accessible at URL
- [ ] Can upload project files
- [ ] Analysis completes successfully
- [ ] MongoDB stores scan history
- [ ] Can view past scans
- [ ] Export reports work
- [ ] No console errors

---

## 📞 Support

For deployment issues:
- Check logs: `docker-compose logs`
- GitHub Issues: https://github.com/kathirvel-p22/CodeDocAI/issues
- Documentation: [README.md](./README.md)

---

**Deployed successfully? Share your URL! 🎉**
