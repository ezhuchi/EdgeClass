# Railway Deployment Guide

## Manual Deployment via Railway Website

### 1. **Prepare Your Code**
Make sure all changes are committed and pushed to GitHub:
```bash
git add .
git commit -m "feat: configure for Railway deployment"
git push origin main
```

### 2. **Deploy on Railway**

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **EdgeClass** repository
5. Railway will auto-detect the project

### 3. **Configure Service**

Railway will automatically:
- Install dependencies
- Build frontend
- Copy frontend to backend/public
- Start the server

### 4. **Add Environment Variables** (Optional)

In Railway dashboard → Variables tab:
```
NODE_ENV=production
PORT=3000
```

### 5. **Add Persistent Storage**

For SQLite database:
1. Go to **Volumes** tab
2. Click **"New Volume"**
3. Mount point: `/app/backend/data`
4. Click **Create**

### 6. **Generate Domain**

1. Go to **Settings** tab
2. Scroll to **Domains**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `yourapp.up.railway.app`)

### 7. **Test Your Deployment**

Visit your Railway URL:
- Frontend: `https://yourapp.up.railway.app`
- API Health: `https://yourapp.up.railway.app/health`
- Stats: `https://yourapp.up.railway.app/api/stats`

---

## What Happens During Build

Railway will execute these steps automatically:

1. **Install** → `npm install` in both frontend & backend
2. **Build** → `npm run build` in frontend (creates `dist/`)
3. **Copy** → Copies `frontend/dist/*` to `backend/public/`
4. **Start** → Runs `node backend/server.js` with `NODE_ENV=production`

---

## Troubleshooting

### Build Fails
Check **Build Logs** in Railway dashboard for errors.

### App Crashes
Check **Deploy Logs** for runtime errors.

### Database Issues
Ensure volume is mounted to `/app/backend/data`

### Frontend Not Loading
Verify `backend/public` directory has files after build.

---

## Update Deployment

Every time you push to GitHub, Railway will automatically:
1. Detect the push
2. Rebuild the app
3. Redeploy with zero downtime

---

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `ghostclass.com`)
4. Add DNS records as shown
5. Wait for SSL certificate (automatic)

---

## Monitoring

Railway provides:
- **Metrics** → CPU, Memory, Network usage
- **Logs** → Real-time application logs
- **Alerts** → Email notifications for crashes

---

## Costs

Railway Free Tier includes:
- 500 hours/month
- 100GB network
- Automatic SSL
- Persistent storage

Perfect for MVP and small-scale deployments!
