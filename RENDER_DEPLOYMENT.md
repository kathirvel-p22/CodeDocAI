# 🚀 Render Deployment Guide - CodeDocAI

## Quick Deployment to Render

### Option 1: Web Service (Recommended for Free Tier)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `kathirvel-p22/CodeDocAI`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: codedocai
   Region: Oregon (US West)
   Branch: main
   Runtime: Docker
   
   Instance Type: Free
   ```

4. **Set Environment Variables**
   Click "Advanced" → Add Environment Variables:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build (5-10 minutes)
   - Your app will be live at: `https://codedocai.onrender.com`

---

## Option 2: Docker Deployment (Paid Plans)

For full Docker Compose support with MongoDB, you need Render's paid plan:

1. **Create Web Service** (as above)
2. **Add MongoDB**
   - Go to "New +" → "Private Service"
   - Choose "MongoDB" from marketplace
   - Note the connection string

3. **Update App Environment Variable**
   ```
   MONGODB_URI=mongodb+srv://username:password@host/database
   ```

---

## ⚠️ Important Notes

### Free Tier Limitations
- MongoDB not included (app will work without database, uses localStorage)
- Service spins down after 15 minutes of inactivity
- 750 hours/month free

### Database Workarounds for Free Tier
If you need database on free tier:

**Option A: MongoDB Atlas (Free)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to Render environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codedocai
   ```

**Option B: Railway (Free MongoDB)**
1. Deploy to Railway.app instead
2. They offer free MongoDB addon

---

## 🔧 Troubleshooting

### Build Fails: "dist not found"
**Fixed!** The new Dockerfile builds `dist` inside Docker.

### Port Issues
Render automatically sets `PORT` environment variable. Our app uses `process.env.PORT || 3000`.

### API Key Not Working
- Make sure `GEMINI_API_KEY` is set in Render dashboard
- Don't commit API keys to GitHub!

### App Doesn't Start
Check logs in Render dashboard:
- Click your service
- Go to "Logs" tab
- Look for errors

---

## 📊 Deployment Checklist

- [ ] GitHub repository is public
- [ ] Dockerfile builds frontend inside Docker (✅ updated)
- [ ] Render account created
- [ ] Web Service created
- [ ] Environment variables set (GEMINI_API_KEY)
- [ ] Build completed successfully
- [ ] App accessible at Render URL
- [ ] Can upload and analyze code
- [ ] Knowledge graph displays correctly

---

## 🌐 Your Render URLs

After deployment:
```
Application: https://codedocai.onrender.com
Dashboard: https://dashboard.render.com/web/srv-xxxxx
```

---

## 💰 Cost Comparison

| Feature | Free Tier | Paid |
|---------|-----------|------|
| App Hosting | ✅ Free | $7/month |
| MongoDB | ❌ Not included | $15/month |
| Uptime | Spins down after 15min | Always on |
| Build Time | Standard | Priority |
| Custom Domain | ✅ Yes | ✅ Yes |

**Recommendation:** Start with Free tier + MongoDB Atlas (free) = $0/month

---

## 🎯 Alternative: Railway Deployment

Railway offers better free tier with MongoDB:

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select CodeDocAI repository
4. Add MongoDB plugin (free)
5. Set environment variables
6. Deploy!

Railway URL: `https://codedocai.up.railway.app`

---

## ✅ Success Verification

After deployment, test these:

1. **Homepage loads:** Visit your Render URL
2. **Upload works:** Try uploading a code folder
3. **AI analysis works:** Check if Gemini API responds
4. **Graph renders:** View Digital Twin panel
5. **No errors:** Check browser console (F12)

---

**Updated:** July 5, 2026  
**Status:** Dockerfile updated for Render compatibility ✅
