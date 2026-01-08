# Deployment Guide - EdgeClass

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Render account (for backend)

## Backend Deployment (Render)

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin jei
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the **EdgeClass** repository
5. Configure the service:
   - **Name**: `edgeclass-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `NODE_ENV=production node server.js`
   - **Plan**: Free

6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

7. Add Persistent Disk:
   - Click **"Add Disk"**
   - **Name**: `ghostclass-data`
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB

8. Click **"Create Web Service"**

9. **Important**: Copy your backend URL (e.g., `https://edgeclass-backend.onrender.com`)

### Backend URL
After deployment, your backend will be available at:
```
https://your-service-name.onrender.com
```

---

## Frontend Deployment (Vercel)

### 1. Update Frontend Configuration

Edit `frontend/vercel.json` and update the backend URL:
```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://YOUR-BACKEND-URL.onrender.com"
  }
}
```

### 2. Deploy on Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: `edgeclass` (or your preference)
   - In which directory is your code located? `./`
   - Override settings? **Y**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Development Command: `npm run dev`

5. Add environment variable:
```bash
vercel env add VITE_API_URL production
```
Enter your Render backend URL: `https://your-backend.onrender.com`

6. Deploy to production:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com`

6. Click **"Deploy"**

### Frontend URL
After deployment, your frontend will be available at:
```
https://your-project.vercel.app
```

---

## Post-Deployment Configuration

### 1. Update Backend CORS

If you encounter CORS issues, update `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### 2. Test the Deployment

1. Visit your Vercel frontend URL
2. Create a student account and login
3. Go offline (disconnect network)
4. Create quiz attempts
5. Go online and verify sync works

### 3. Custom Domain (Optional)

#### Vercel:
1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain

#### Render:
1. Go to your service settings
2. Click **"Custom Domain"**
3. Add your custom domain

---

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV` = `production`
- `PORT` = `3000`

### Frontend (Vercel)
- `VITE_API_URL` = `https://your-backend.onrender.com`

---

## Troubleshooting

### Backend Issues

**Problem**: Database not persisting
- **Solution**: Ensure persistent disk is mounted at `/app/data`

**Problem**: Service crashes on startup
- **Solution**: Check logs in Render dashboard, ensure all dependencies installed

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Verify `VITE_API_URL` is set correctly in Vercel environment variables

**Problem**: Build fails
- **Solution**: Ensure `package.json` has correct build script

### CORS Issues

Add to `backend/server.js`:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

---

## Monitoring

### Render Dashboard
- View logs: Click on your service → **"Logs"**
- Check health: Service status shows in dashboard
- View metrics: CPU, memory usage in service overview

### Vercel Dashboard
- View deployments: Project page shows all deployments
- Check logs: Click deployment → **"Function Logs"**
- Analytics: View traffic and performance metrics

---

## Quick Deploy Commands

```bash
# Backend (via Render dashboard - automatic)
# Every push to main branch triggers auto-deploy if connected

# Frontend (via Vercel CLI)
cd frontend
vercel --prod

# Or commit and push (if connected to GitHub)
git add .
git commit -m "Deploy updates"
git push origin jei
```

---

## Important Notes

1. **Free Tier Limitations**:
   - Render: Service sleeps after 15 min inactivity (30s cold start)
   - Vercel: 100GB bandwidth/month limit

2. **Database Backups**:
   - Render persistent disk: Download via SSH or API
   - Consider periodic backups for production

3. **Offline-First Still Works**:
   - Students can use app offline
   - Data syncs when online
   - Backend can be temporarily down without breaking app

---

## Success Checklist

- [ ] Backend deployed on Render
- [ ] Persistent disk configured for database
- [ ] Frontend deployed on Vercel
- [ ] Environment variable `VITE_API_URL` set in Vercel
- [ ] CORS configured in backend
- [ ] Test: Create user → Logout → Login
- [ ] Test: Go offline → Create quiz attempt → Go online → Verify sync
- [ ] Test: Teacher creates quiz → Student takes quiz
- [ ] Test: Doubts system works
- [ ] Monitor both services for first 24 hours

Your app is now live! 🎉
