# Manual Deployment Guide - GhostClass

Complete step-by-step guide to deploy GhostClass with split architecture.

## Prerequisites

- GitHub account
- Render account (sign up at render.com)
- Vercel account (sign up at vercel.com)
- Your code pushed to GitHub

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. Go to **https://render.com**
2. Click **"Sign Up"** (use GitHub to sign in)
3. Click **"New +"** button in top right
4. Select **"Web Service"**

### Step 3: Connect Repository

1. Click **"Connect a repository"**
2. If first time: Click **"Configure account"** → Grant access to your GitHub repositories
3. Find and select your **EdgeClass** repository
4. Click **"Connect"**

### Step 4: Configure Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `ghostclass-backend` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., Singapore, Oregon)
- **Branch**: `main`
- **Root Directory**: `backend`

**Build Settings:**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `NODE_ENV=production node server.js`

**Instance Type:**
- Select **"Free"** (gives you 750 hours/month)

### Step 5: Add Environment Variables

Scroll to **"Environment Variables"** section and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

Click **"Add"** for each variable.

### Step 6: Add Persistent Disk

This is crucial for SQLite database:

1. Scroll to **"Disks"** section
2. Click **"Add Disk"**
3. **Name**: `ghostclass-data`
4. **Mount Path**: `/app/data`
5. **Size**: `1 GB` (free tier)
6. Click **"Save"**

### Step 7: Deploy Backend

1. Review all settings
2. Click **"Create Web Service"** button
3. Wait for deployment (3-5 minutes)
4. Once deployed, you'll see **"Live"** status

### Step 8: Copy Backend URL

1. At the top of the page, you'll see your service URL
2. It will look like: `https://ghostclass-backend.onrender.com`
3. **Copy this URL** - you'll need it for frontend deployment
4. Test it by visiting: `https://your-backend-url.onrender.com/health`
5. You should see: `{"status":"healthy",...}`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

Before deploying frontend, update the Vercel configuration with your backend URL:

1. Open `frontend/vercel.json` in your code editor
2. Replace `YOUR_BACKEND_URL_HERE` with your actual Render backend URL
3. Example:
```json
{
  "env": {
    "VITE_API_URL": "https://ghostclass-backend.onrender.com"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ghostclass-backend.onrender.com/api/:path*"
    }
  ]
}
```
4. Save the file
5. Commit and push:
```bash
git add frontend/vercel.json
git commit -m "chore: configure backend URL for production"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to **https://vercel.com**
2. Click **"Sign Up"** (use GitHub to sign in)
3. Click **"Add New..."** button
4. Select **"Project"**

### Step 3: Import Repository

1. Click **"Import Git Repository"**
2. If first time: Click **"Install Vercel for GitHub"** → Select your repositories
3. Find and select your **EdgeClass** repository
4. Click **"Import"**

### Step 4: Configure Project

Fill in the following settings:

**Project Settings:**
- **Project Name**: `ghostclass` (or any name)
- **Framework Preset**: Select **"Vite"**
- **Root Directory**: Click **"Edit"** → Select **"frontend"** → Click **"Continue"**

**Build Settings:**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Environment Variables:**

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` |

(Replace with your actual Render backend URL)

### Step 5: Deploy Frontend

1. Review all settings
2. Click **"Deploy"** button
3. Wait for deployment (2-3 minutes)
4. Once deployed, you'll see **"Congratulations"** screen

### Step 6: Get Your Live URL

1. Vercel will show your deployment URL
2. It will look like: `https://ghostclass-xyz123.vercel.app`
3. Click **"Visit"** to open your live app
4. Test the app:
   - Login as Teacher
   - Create a quiz
   - Login as Student (different browser/incognito)
   - Take the quiz
   - Check sync status page

---

## Part 3: Verify Deployment

### Test Backend

Visit these URLs in your browser:

1. **Health Check**: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"healthy"}`

2. **Stats**: `https://your-backend.onrender.com/api/stats`
   - Should return: `{"users":0,"quizzes":0,"attempts":0}`

### Test Frontend

1. Visit your Vercel URL: `https://your-frontend.vercel.app`
2. Complete user flow:
   - Login → Create Quiz → Take Quiz → Check Sync

### Test Offline Functionality

1. Open DevTools (F12)
2. Go to **Network** tab
3. Select **"Offline"** from throttling dropdown
4. Try creating a quiz offline
5. Go back online
6. Check sync status - should sync automatically

---

## Part 4: Optional Configurations

### Add Custom Domain (Vercel)

1. Go to Vercel dashboard → Your project
2. Click **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Enter your domain: `ghostclass.com`
5. Follow DNS configuration instructions
6. Wait for SSL certificate (automatic)

### Add Custom Domain (Render)

1. Go to Render dashboard → Your service
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter domain: `api.ghostclass.com`
5. Add CNAME record to your DNS
6. Wait for verification

### Enable Auto-Deploy

Both platforms auto-deploy by default:

**Vercel**: Every push to `main` branch auto-deploys
**Render**: Every push to `main` branch auto-deploys

To disable: Go to Settings → Git → Turn off auto-deploy

---

## Monitoring & Maintenance

### View Logs

**Render Logs:**
1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time backend logs

**Vercel Logs:**
1. Go to Vercel dashboard
2. Click on your project
3. Click **"Deployments"**
4. Click on any deployment → **"View Function Logs"**

### Database Backup (Render)

1. Go to Render dashboard → Your service
2. Click **"Shell"** tab
3. Run backup command:
```bash
sqlite3 /app/data/ghost.db .dump > /tmp/backup.sql
```
4. Download from Render dashboard

### Update Environment Variables

**Render:**
1. Dashboard → Service → Environment
2. Edit variables
3. Click **"Save Changes"**
4. Service will auto-restart

**Vercel:**
1. Dashboard → Project → Settings → Environment Variables
2. Edit variables
3. Click **"Save"**
4. Redeploy for changes to take effect

---

## Troubleshooting

### Backend Issues

**Problem**: Service crashes
- **Solution**: Check Render logs for errors
- Common: Missing environment variables, database path issues

**Problem**: Database not persisting
- **Solution**: Verify disk is mounted at `/app/data`
- Check: Settings → Disks

**Problem**: High response times
- **Solution**: Free tier sleeps after inactivity (30s cold start)
- Upgrade to paid plan for always-on

### Frontend Issues

**Problem**: API calls fail
- **Solution**: Check VITE_API_URL in Vercel environment variables
- Verify CORS is enabled on backend

**Problem**: Build fails
- **Solution**: Check Vercel build logs
- Common: Missing dependencies in package.json

**Problem**: Old version showing
- **Solution**: Hard refresh (Ctrl+Shift+R)
- Clear browser cache

### Sync Issues

**Problem**: Data not syncing
- **Solution**: 
  1. Check browser console for errors
  2. Verify backend is responding: `/health` endpoint
  3. Check sync queue in IndexedDB

---

## Cost Breakdown

### Free Tier Limits

**Vercel:**
- Unlimited deployments
- 100GB bandwidth/month
- 100 build hours/month
- Automatic SSL

**Render:**
- 750 hours/month (enough for 24/7)
- 100GB bandwidth/month  
- 1GB persistent disk
- Automatic SSL

### When to Upgrade

Upgrade if you hit these limits:
- **Vercel**: 100GB bandwidth exceeded (rare for MVP)
- **Render**: Need always-on (no sleep) or >750 hours

**Estimated costs for production:**
- Vercel: Stays FREE for most use cases
- Render: $7/month for Starter plan (always-on)
- **Total**: ~$7/month for 1000+ users

---

## Success Checklist

- [ ] Backend deployed on Render
- [ ] Backend URL copied
- [ ] Persistent disk added to backend
- [ ] Frontend vercel.json updated with backend URL
- [ ] Frontend deployed on Vercel
- [ ] Health check passes
- [ ] Can login and create quiz
- [ ] Can take quiz as student
- [ ] Offline mode works
- [ ] Sync queue processes correctly
- [ ] Custom domain configured (optional)

---

## Support & Resources

**Render Documentation**: https://render.com/docs
**Vercel Documentation**: https://vercel.com/docs
**GitHub Issues**: https://github.com/yourusername/EdgeClass/issues

**Need Help?**
- Check logs first (Render/Vercel dashboards)
- Review this guide's troubleshooting section
- Open GitHub issue with error logs
