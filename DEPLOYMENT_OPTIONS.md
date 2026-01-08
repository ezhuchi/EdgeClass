# Deployment Platform Comparison - GhostClass

## Free Tier Options

### 1. Render (RECOMMENDED)
**Cost**: FREE
- 750 hours/month free tier
- Automatic SSL
- Persistent disk (1GB free)
- Auto-deploys from GitHub
- Zero configuration needed

**Deploy**: 
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. "New" → "Web Service"
4. Connect GitHub repo
5. Render auto-detects `render.yaml`
6. Click "Create Web Service"

---

### 2. Fly.io
**Cost**: FREE
- $5/month free credits
- Global edge deployment
- Persistent volumes
- Better for international users

**Deploy**:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and launch
fly auth login
fly launch --config fly.toml
fly volumes create ghostclass_data --size 1
fly deploy
```

---

### 3. Vercel (Frontend) + Backend.ms (Backend)
**Cost**: FREE

**Vercel** (Frontend only):
- Unlimited bandwidth
- Automatic SSL
- Fast global CDN

**Backend.ms** (Backend only):
- Free Node.js hosting
- SQLite support
- 100GB/month bandwidth

**Deploy**:
```bash
# Frontend to Vercel
cd frontend
npm install -g vercel
vercel --prod

# Backend to Backend.ms
# Sign up at backend.ms
# Upload backend folder via dashboard
```

---

### 4. Netlify (Frontend) + Render (Backend)
**Cost**: FREE

Best of both worlds:
- Netlify: Fastest CDN for frontend
- Render: Free backend hosting

**Deploy**:
```bash
# Frontend to Netlify
cd frontend
npm install -g netlify-cli
netlify deploy --prod

# Backend to Render
# Use render.yaml (already configured)
```

---

### 5. Cyclic.sh
**Cost**: FREE
- 10,000 requests/month
- Serverless deployment
- GitHub integration

Not ideal for SQLite (serverless = no persistent disk)

---

## Recommended Choice: RENDER

Why Render is best for GhostClass:
1. FREE tier with no time limit
2. Supports full-stack apps (frontend + backend together)
3. Persistent disk for SQLite database
4. `render.yaml` already configured in your project
5. Auto-deploys on git push
6. Custom domain support
7. Automatic SSL certificates

### Quick Deploy to Render:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "chore: add render deployment config"
   git push origin main
   ```

2. **Deploy**:
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New" → "Blueprint"
   - Select your EdgeClass repository
   - Render will detect `render.yaml` automatically
   - Click "Apply"
   - Wait 3-5 minutes for build

3. **Done!** Your app will be live at:
   `https://ghostclass.onrender.com`

---

## Performance Comparison

| Platform | Build Time | Cold Start | Uptime | Global CDN |
|----------|-----------|------------|---------|------------|
| Render   | 3-5 min   | 30s        | 99.9%   | No         |
| Fly.io   | 2-3 min   | Instant    | 99.9%   | Yes        |
| Vercel   | 1-2 min   | Instant    | 99.99%  | Yes        |
| Railway  | 2-3 min   | Instant    | 99.9%   | No         |

---

## Migration Steps (Railway → Render)

1. Export Railway database:
   ```bash
   railway run sqlite3 /app/backend/data/ghost.db .dump > backup.sql
   ```

2. Deploy to Render (use render.yaml)

3. Import database:
   - Go to Render dashboard → Shell
   - Run: `sqlite3 /app/backend/data/ghost.db < backup.sql`

---

## Cost Projections

All platforms have generous free tiers suitable for MVPs:

- **Render**: Free forever (with 750h/month limit = ~1 app)
- **Fly.io**: $5 credit/month (enough for small apps)
- **Vercel**: Unlimited for personal projects
- **Netlify**: 100GB/month bandwidth free

For production scale (>1000 users):
- Render: ~$7/month
- Fly.io: ~$5-10/month  
- Vercel + Render: ~$7/month

---

## Support Matrix

| Feature | Render | Fly.io | Vercel | Railway |
|---------|--------|--------|--------|---------|
| Full Stack | ✓ | ✓ | ✗ | ✓ |
| SQLite | ✓ | ✓ | ✗ | ✓ |
| Auto Deploy | ✓ | ✗ | ✓ | ✓ |
| Free Tier | ✓ | ✓ | ✓ | Trial |
| Custom Domain | ✓ | ✓ | ✓ | ✓ |
