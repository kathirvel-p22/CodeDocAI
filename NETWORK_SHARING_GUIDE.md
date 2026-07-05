# 🌐 Network Sharing Guide - CodeDocAI

**Share your CodeDocAI application with friends on the same network**

---

## 🎯 Overview

This guide shows how to let your friends access CodeDocAI running on your computer through:
1. **Local Network (LAN)** - Same WiFi/network
2. **Public Access** - Over the internet (advanced)

---

## 📡 Method 1: Local Network Access (Same WiFi)

### Step 1: Find Your Computer's IP Address

**On Windows (PowerShell or CMD):**
```bash
ipconfig
```

Look for **IPv4 Address** under your active network adapter:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

Your IP address will be something like:
- `192.168.1.100`
- `192.168.0.50`
- `10.0.0.25`

**Quick command:**
```bash
ipconfig | findstr IPv4
```

### Step 2: Update Docker Compose Configuration

Edit your `docker-compose.yml` to bind to all network interfaces:

```yaml
services:
  codedocai:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: codedocai-app
    restart: always
    ports:
      - "0.0.0.0:3000:3000"  # ← This allows network access
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - MONGODB_URI=mongodb://mongodb:27017
      - DB_NAME=codedocai
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - codedocai-network
```

**The change is subtle but important:**
- Before: `"3000:3000"` (localhost only)
- After: `"0.0.0.0:3000:3000"` (all network interfaces)

Your current configuration already has `0.0.0.0`, so you're good! ✅

### Step 3: Configure Windows Firewall

**Allow Docker through Windows Firewall:**

**Option A: Using PowerShell (Administrator)**
```powershell
# Open PowerShell as Administrator
New-NetFirewallRule -DisplayName "CodeDocAI Docker" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Option B: Using Windows Defender Firewall UI**
1. Press `Win + R`, type `wf.msc`, press Enter
2. Click **"Inbound Rules"** → **"New Rule..."**
3. Select **"Port"** → Click **"Next"**
4. Select **"TCP"** → Specific local ports: **3000**
5. Click **"Next"** → **"Allow the connection"**
6. Check all profiles (Domain, Private, Public)
7. Name: **"CodeDocAI Docker Access"**
8. Click **"Finish"**

### Step 4: Restart Docker Containers

```bash
# Stop containers
docker-compose down

# Start containers
docker-compose up -d

# Verify they're running
docker ps
```

### Step 5: Share Access Link with Friends

**Your friends can access CodeDocAI at:**
```
http://YOUR_IP_ADDRESS:3000
```

**Example:**
If your IP is `192.168.1.100`, share:
```
http://192.168.1.100:3000
```

---

## 🔒 Security Considerations for Network Sharing

### Important Notes:

1. **Same Network Only**
   - Friends must be on the SAME WiFi/network
   - Won't work over internet (unless you use Method 2)

2. **Firewall Protection**
   - Only allow access from trusted devices
   - Close port when not needed

3. **API Key Security**
   - Your Gemini API key is on the server (safe)
   - Not exposed to users
   - But usage charges apply to your account

4. **Rate Limiting**
   - Consider adding rate limits if many users
   - Monitor API usage in Gemini console

---

## 🌍 Method 2: Public Internet Access (Advanced)

### Option A: ngrok (Easiest - Free Tier Available)

**What is ngrok?**
Creates a secure tunnel from public internet to your localhost.

**Setup Steps:**

1. **Install ngrok**
   - Download: https://ngrok.com/download
   - Or using Chocolatey: `choco install ngrok`

2. **Sign up for free account**
   - Visit: https://dashboard.ngrok.com/signup
   - Get your auth token

3. **Configure ngrok**
   ```bash
   # Add auth token
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Start ngrok tunnel**
   ```bash
   # With Docker running on port 3000
   ngrok http 3000
   ```

5. **Share the public URL**
   ```
   ngrok will give you a URL like:
   https://abc123.ngrok-free.app
   
   Share this with your friends!
   ```

**Example ngrok output:**
```
Session Status                online
Account                       your@email.com
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   0
```

**Advantages:**
- ✅ Works from anywhere (internet)
- ✅ HTTPS encryption
- ✅ No router configuration needed
- ✅ Free tier available

**Disadvantages:**
- ⚠️ URL changes each time (free tier)
- ⚠️ Limited connections per minute (free tier)
- ⚠️ Your computer must stay on

---

### Option B: Port Forwarding (Your Router)

**Steps:**

1. **Access your router settings**
   - Usually: `192.168.1.1` or `192.168.0.1`
   - Login with admin credentials

2. **Find Port Forwarding settings**
   - Look for: "Port Forwarding", "NAT", "Virtual Server"

3. **Add new rule:**
   ```
   External Port: 3000
   Internal IP: YOUR_COMPUTER_IP (e.g., 192.168.1.100)
   Internal Port: 3000
   Protocol: TCP
   ```

4. **Find your public IP**
   ```bash
   # Visit this in browser
   https://whatismyipaddress.com
   
   # Or use curl
   curl ifconfig.me
   ```

5. **Share public access URL:**
   ```
   http://YOUR_PUBLIC_IP:3000
   ```

**Advantages:**
- ✅ Direct connection (faster)
- ✅ No third-party service

**Disadvantages:**
- ⚠️ Requires router admin access
- ⚠️ Exposes your home IP
- ⚠️ Security risks (port open to internet)
- ⚠️ ISP may block port 3000

---

### Option C: Cloud Deployment (Most Professional)

Deploy to cloud for best experience:

**AWS ECS:**
```bash
# Tag image
docker tag codeinsight-ai-codedocai:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/codedocai:latest

# Deploy to ECS
# Follow DEPLOYMENT.md guide
```

**Result:** Public URL like `https://codedocai.yourdomain.com`

See `DEPLOYMENT.md` for complete cloud deployment guide.

---

## 🚀 Quick Start Commands

### For Local Network Sharing

**On Your Computer (Host):**
```bash
# 1. Find your IP
ipconfig | findstr IPv4

# 2. Allow firewall (PowerShell as Admin)
New-NetFirewallRule -DisplayName "CodeDocAI Docker" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 3. Ensure Docker is running
docker-compose ps

# 4. Share URL with friends
# http://YOUR_IP:3000
```

**Your Friends' Computers (Clients):**
```
1. Connect to same WiFi
2. Open browser
3. Go to: http://YOUR_IP:3000
4. Start using CodeDocAI!
```

---

### For Internet Access (ngrok)

**On Your Computer:**
```bash
# 1. Install ngrok
# Download from: https://ngrok.com/download

# 2. Start Docker
docker-compose up -d

# 3. Start ngrok tunnel
ngrok http 3000

# 4. Copy the HTTPS URL shown (e.g., https://abc123.ngrok-free.app)

# 5. Share URL with friends anywhere!
```

**Your Friends:**
```
1. Open browser
2. Go to: https://abc123.ngrok-free.app
3. Click "Visit Site" (ngrok warning page)
4. Use CodeDocAI from anywhere!
```

---

## 🔍 Troubleshooting

### Problem: Friends can't access the app

**Solution 1: Check Firewall**
```bash
# Verify firewall rule exists
Get-NetFirewallRule -DisplayName "CodeDocAI Docker"

# If not, add it
New-NetFirewallRule -DisplayName "CodeDocAI Docker" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Solution 2: Verify Docker binding**
```bash
# Check docker-compose.yml has:
ports:
  - "0.0.0.0:3000:3000"  # Not just "3000:3000"
```

**Solution 3: Check same network**
```bash
# On your computer
ipconfig

# On friend's computer (they should check)
ipconfig

# Verify both are on same subnet (e.g., 192.168.1.x)
```

**Solution 4: Test connectivity**
```bash
# From friend's computer, ping your IP
ping 192.168.1.100

# If ping fails, network issue
# If ping works, firewall issue
```

---

### Problem: ngrok tunnel not working

**Solution 1: Check ngrok is running**
```bash
# Should see active session
ngrok http 3000
```

**Solution 2: Verify auth token**
```bash
ngrok config add-authtoken YOUR_TOKEN
```

**Solution 3: Try different port**
```bash
# If 3000 is blocked
ngrok http 3000 --region us
```

---

### Problem: Slow performance with multiple users

**Solution 1: Monitor Docker resources**
```bash
docker stats
```

**Solution 2: Increase Docker memory**
- Docker Desktop → Settings → Resources
- Increase Memory to 4GB or more
- Increase CPUs to 2 or more

**Solution 3: Use cloud deployment**
- Deploy to AWS/Azure for better performance
- See `DEPLOYMENT.md`

---

## 📊 Network Architecture

### Local Network Setup
```
Your Computer (192.168.1.100)
    ↓
Docker Desktop
    ↓
┌─────────────────────────────────┐
│  codedocai-app (Container)      │
│  Port 3000 → 0.0.0.0:3000      │
└─────────────────────────────────┘
    ↑
Windows Firewall (Port 3000 allowed)
    ↑
Local Network (192.168.1.x)
    ↑
Friend's Computer (192.168.1.50)
```

### ngrok Tunnel Setup
```
Your Computer
    ↓
Docker (localhost:3000)
    ↓
ngrok client
    ↓
Internet (encrypted tunnel)
    ↓
ngrok servers
    ↓
Public URL (https://abc123.ngrok-free.app)
    ↓
Friend's Computer (anywhere in the world)
```

---

## 🎓 Best Practices

### For Casual Sharing (Friends Testing)
**Recommended:** Local Network (Method 1)
- Fast
- Secure
- No additional costs

### For Demo/Presentation
**Recommended:** ngrok (Method 2A)
- Easy to share URL
- Works anywhere
- Professional HTTPS URL

### For Production Use
**Recommended:** Cloud Deployment (Method 2C)
- Always available
- Fast globally
- Professional domain
- Scalable

---

## 🔐 Security Checklist

When sharing network access:

- [ ] Trust all users accessing the app
- [ ] Monitor API usage in Gemini console
- [ ] Close firewall port when done
- [ ] Don't share with too many users (API costs)
- [ ] Use ngrok password protection for sensitive data
- [ ] Consider rate limiting for public access
- [ ] Monitor Docker logs for unusual activity
- [ ] Keep your computer/Docker updated

---

## 💡 Advanced Tips

### Add ngrok Password Protection
```bash
# Start ngrok with authentication
ngrok http 3000 --basic-auth "username:password"
```

### Add ngrok Custom Domain (Paid Plan)
```bash
ngrok http 3000 --domain=codedocai.ngrok.app
```

### Use Docker Network Inspection
```bash
# See network details
docker network inspect codeinsight-ai_codedocai-network

# Check container IP
docker inspect codedocai-app | findstr IPAddress
```

### Monitor Active Connections
```bash
# Windows: See connections to port 3000
netstat -ano | findstr :3000
```

---

## 📞 Help & Support

### Common Scenarios

**Scenario 1: Friend in same room (same WiFi)**
→ Use Local Network (Method 1)

**Scenario 2: Friend in different city**
→ Use ngrok (Method 2A)

**Scenario 3: Presenting to class/professor**
→ Use ngrok with custom auth (Method 2A + password)

**Scenario 4: Long-term shared access**
→ Deploy to cloud (Method 2C)

---

## ✅ Quick Reference

| Method | Speed | Ease | Security | Cost | Best For |
|--------|-------|------|----------|------|----------|
| Local Network | ⚡⚡⚡ | ⭐⭐⭐ | 🔒🔒🔒 | Free | Same WiFi |
| ngrok | ⚡⚡ | ⭐⭐⭐ | 🔒🔒 | Free/Paid | Remote demo |
| Port Forward | ⚡⚡⚡ | ⭐ | 🔒 | Free | Advanced users |
| Cloud Deploy | ⚡⚡⚡ | ⭐⭐ | 🔒🔒🔒 | Paid | Production |

---

**Last Updated:** July 5, 2026  
**Project:** CodeDocAI  
**Author:** Kathirvel P
