# 🎉 Share CodeDocAI with Friends - Quick Guide

**Your IP Address:** `10.149.243.107`

---

## ✅ Setup Complete!

Your Docker is now configured to allow network access!

---

## 📱 For Your Friends to Access

### Step 1: Ensure Same WiFi Network
Your friends must be connected to the **SAME WiFi network** as you.

### Step 2: Share This Link
Tell your friends to open their browser and go to:

```
http://10.149.243.107:3000
```

That's it! They can now use CodeDocAI from their devices! 🎉

---

## 🔥 Important: Windows Firewall

You need to allow port 3000 through Windows Firewall **ONCE**.

### Option 1: Automatic (Recommended)

**Open PowerShell as Administrator:**
1. Press `Win + X`
2. Select **"PowerShell (Admin)"** or **"Terminal (Admin)"**
3. Run this command:

```powershell
New-NetFirewallRule -DisplayName "CodeDocAI Docker" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Option 2: Manual (Windows Firewall UI)

1. Press `Win + R`, type `wf.msc`, press Enter
2. Click **"Inbound Rules"** → **"New Rule..."**
3. Select **"Port"** → Click **"Next"**
4. Select **"TCP"** → Specific local ports: **3000**
5. Click **"Next"** → **"Allow the connection"**
6. Check all (Domain, Private, Public)
7. Name: **"CodeDocAI"**
8. Click **"Finish"**

---

## 🧪 Test It Yourself First

Before sharing with friends:

1. Open your browser
2. Try both URLs:
   - `http://localhost:3000` (should work)
   - `http://10.149.243.107:3000` (should also work)

If both work, your friends can access it!

---

## 📱 What Your Friends Will See

```
┌─────────────────────────────────┐
│     CodeDocAI                   │
│     AI-Powered Code Review      │
│                                 │
│  [Upload Folder] [Upload ZIP]  │
│                                 │
│  • Drag & drop code files       │
│  • AI analyzes bugs             │
│  • Get detailed reports         │
└─────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Problem: Friend can't access

**Check 1: Same WiFi?**
```bash
# On your computer
ipconfig

# On friend's computer (they should run)
ipconfig

# Both should show 10.149.x.x (same network)
```

**Check 2: Firewall allowed?**
- Follow firewall steps above
- Restart browser after setting firewall

**Check 3: Docker running?**
```bash
docker ps
# Should show 2 containers running
```

**Check 4: Try pinging**
Friend's computer (in CMD):
```bash
ping 10.149.243.107
# Should get replies
```

---

## 🌍 Share Over Internet (Advanced)

Want friends from different networks to access?

### Use ngrok (Free & Easy)

1. **Install ngrok:**
   Download: https://ngrok.com/download

2. **Run ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Share the HTTPS URL:**
   ```
   ngrok gives you: https://abc123.ngrok-free.app
   Share this with anyone, anywhere!
   ```

See `NETWORK_SHARING_GUIDE.md` for complete details.

---

## 🔒 Security Tips

1. **Trust your friends** - They're using your API key quota
2. **Monitor usage** - Check Gemini AI console for API calls
3. **Close when done:**
   ```bash
   docker-compose down
   ```

4. **Remove firewall rule when done:**
   ```powershell
   # PowerShell as Admin
   Remove-NetFirewallRule -DisplayName "CodeDocAI Docker"
   ```

---

## 📊 Quick Reference

| What | Command/Link |
|------|--------------|
| **Your Access** | http://localhost:3000 |
| **Friends' Access** | http://10.149.243.107:3000 |
| **Check Docker** | `docker ps` |
| **View Logs** | `docker-compose logs -f` |
| **Stop Sharing** | `docker-compose down` |
| **Restart** | `docker-compose up -d` |

---

## ✅ Checklist

Before sharing with friends:

- [ ] Docker containers running (`docker ps` shows 2 containers)
- [ ] Firewall rule added (PowerShell as Admin)
- [ ] Tested http://10.149.243.107:3000 on your computer
- [ ] Friends are on same WiFi network
- [ ] Share link: http://10.149.243.107:3000

---

## 🎓 Example Conversation

**You to Friend:**
> "Hey! I built an AI code review tool. Want to try it?"
> "Just open: http://10.149.243.107:3000"
> "Upload any code folder and it'll analyze it!"

**Friend:**
> "Cool! Opening now..."
> *(uploads code)*
> "Wow, it found bugs and gave me 3 ways to fix each! 🔥"

---

**Need more help?** Check `NETWORK_SHARING_GUIDE.md` for advanced options!

**Last Updated:** July 5, 2026  
**Your IP:** 10.149.243.107  
**Port:** 3000
