# Complete Deployment Guide - Vercel & Netlify

## ✅ Issue Fixed

**The landing page wasn't rendering because:**
- `api/index.js` was missing the `pageRoutes` import
- Static files weren't being served from the serverless function
- Routes configuration wasn't handling the root path correctly

**What we fixed:**
1. Added `pageRoutes` to `api/index.js`
2. Added static file serving with `express.static(publicDir)`
3. Simplified `vercel.json` to route everything through the serverless function
4. Created `netlify.toml` for Netlify deployment

---

## 📊 Project Structure for Deployment

```
health-wellness-community/
├── api/
│   └── index.js                 ← Serverless handler (FIXED)
├── src/
│   ├── routes/
│   │   ├── pageRoutes.js        ← HTML page routes (NOW USED)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── healthRoutes.js
│   │   └── resourceRoutes.js
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── utils/
├── public/                      ← Frontend files
│   ├── landing.html            ← LANDING PAGE
│   ├── app.html
│   ├── sign-in.html
│   ├── register.html
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   └── ...
│   ├── css/
│   │   └── base.css
│   ├── images/
│   └── avatars/
├── package.json
├── vercel.json                  ← UPDATED ✅
├── netlify.toml                 ← NEW ✅
├── .env                         ← LOCAL ONLY (don't commit)
├── .env.example                 ← Share this file
└── .gitignore
```

---

## 🚀 DEPLOYMENT WALKTHROUGH - VERCEL

### Step 1: Prepare Your Code

```bash
# Make sure you're in the project directory
cd "c:\jarurri kaamkaaj\health-wellness-community"

# Install dependencies
npm install

# Commit the fixes
git add .
git commit -m "Fix landing page rendering - add pageRoutes to serverless handler"
git push origin main
```

### Step 2: Create/Connect Vercel Project

1. **Go to** https://vercel.com
2. **Sign in** with GitHub account
3. **Click** "Add New Project"
4. **Select** your GitHub repository
5. **Configure:**
   - Project Name: `health-wellness-community`
   - Framework: `Other` (it auto-detects Node.js)
   - Root Directory: `./`
   - Build Command: `npm run vercel-build`
   - Install Command: `npm install`
   - Output Directory: (leave empty)

6. **Click** "Deploy" (first deploy will happen now)

### Step 3: Set Environment Variables ⭐ CRITICAL

The deployment will fail until you set these. Do this immediately:

1. **In Vercel Dashboard:**
   - Click on your deployed project
   - Go to **Settings** → **Environment Variables**

2. **Add each variable individually:**

```
MONGODB_URI = mongodb+srv://tutu:uFStc3djQ7REwrmU@cluster0.ch5oy7f.mongodb.net/healthify
JWT_SECRET = YourStrongSecretKeyHere123456789 (min 32 characters)
AUTH_COOKIE_NAME = session_token
CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name
CLOUDINARY_API_KEY = your_cloudinary_api_key
CLOUDINARY_API_SECRET = your_cloudinary_api_secret
NODE_ENV = production
```

3. **For each variable:**
   - Set it for: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

4. **Redeploy:**
   - Go to **Deployments**
   - Click three dots on latest deployment
   - Select **"Redeploy"**
   - Confirm

### Step 4: Verify Deployment

Test these endpoints:

```bash
# 1. Check if landing page loads
curl https://your-project.vercel.app/

# 2. Check database connection
curl https://your-project.vercel.app/api/health

# Expected response:
# { "status": "ok", "mongodb": "connected" }

# 3. Test API endpoint
curl https://your-project.vercel.app/api/posts
```

### Step 5: Monitor Logs

If something fails:
1. **Vercel Dashboard** → **Deployments** → [Your Deployment]
2. **Click** "Logs" tab
3. **Search** for errors
4. **Common issues:**
   - `MONGODB_URI is not defined` → Add env var
   - `Cannot find module` → Run `npm install`
   - `Cannot find page` → Check if pageRoutes.js has all routes

---

## 🚀 DEPLOYMENT WALKTHROUGH - NETLIFY

### Step 1: Prepare Your Code

```bash
# Same as Vercel
git push origin main
```

### Step 2: Connect to Netlify

1. **Go to** https://netlify.com
2. **Sign in** with GitHub
3. **Click** "Add new site" → "Import an existing project"
4. **Connect** GitHub and select your repository
5. **Configure:**
   - Build Command: `npm run vercel-build`
   - Publish Directory: (leave empty)
   - Base Directory: `./`

6. **Click** "Deploy site"

### Step 3: Set Environment Variables

1. **Site settings** → **Build & deploy** → **Environment**
2. **Add variables** (same as Vercel):

```
MONGODB_URI = mongodb+srv://...
JWT_SECRET = Your_Strong_Secret_Key_123456789
AUTH_COOKIE_NAME = session_token
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
NODE_ENV = production
```

3. **Trigger redeploy:**
   - Go to **Deploys**
   - Click **"Trigger deploy"** → **"Deploy site"**

### Step 4: Verify (Same as Vercel)

```bash
curl https://your-netlify-site.netlify.app/
curl https://your-netlify-site.netlify.app/api/health
```

---

## 🔍 Troubleshooting

### Issue: Landing Page Not Rendering

**Check 1: Is it reaching the server?**
```bash
curl -I https://your-domain.vercel.app/
```
Should return `200 OK`

**Check 2: Is database connected?**
```bash
curl https://your-domain.vercel.app/api/health
```
Should return: `{"status":"ok","mongodb":"connected"}`

**Check 3: Check logs**
- Vercel: Dashboard → Deployments → Logs
- Netlify: Dashboard → Deploys → Deploy log

**Issue:** `GET / returns 500`
- Solution: Check if `api/index.js` includes `pageRoutes`
- Check if `public/landing.html` exists
- Verify file path is correct

### Issue: API Returns 500 Error

**Check:**
1. Are environment variables set? (MONGODB_URI, JWT_SECRET, etc.)
2. Is MongoDB connection string valid?
3. Does MongoDB Atlas allow Vercel/Netlify IPs? (Settings → Network Access → Allow from anywhere)

**Fix MongoDB Network Access:**
1. Go to https://cloud.mongodb.com
2. Your Project → Network Access
3. Click "Add IP Address"
4. Enter `0.0.0.0/0` (allows all IPs)
5. Confirm

### Issue: Static Files Not Loading (CSS, JS broken)

**Check 1:** Are files in `/public` directory?
```bash
# On your machine
ls public/css/base.css
ls public/js/app.js
```

**Check 2:** Are file paths correct in HTML?
```html
<!-- In public/landing.html -->
<link rel="stylesheet" href="/css/base.css">  <!-- ✓ Correct -->
<script src="/js/landing.js"></script>         <!-- ✓ Correct -->
```

### Issue: 404 Not Found

**The route `/` should show landing page, not 404**

If you see 404:
1. Check that `public/landing.html` exists
2. Check that `pageRoutes.js` has the root route handler
3. Check `api/index.js` imports `pageRoutes`

---

## 📋 Quick Checklist Before Deploying

- [ ] `npm install` runs without errors
- [ ] `api/index.js` exists and includes pageRoutes
- [ ] `public/landing.html` exists
- [ ] `.env.example` is created (don't commit `.env`)
- [ ] `package.json` has all dependencies
- [ ] MongoDB connection string is valid
- [ ] All code is committed and pushed to GitHub
- [ ] Vercel/Netlify account is created
- [ ] Environment variables are set BEFORE first deploy

---

## 🌐 After Deployment

### Update Frontend API Calls

Your frontend code might need to use absolute URLs in production:

```javascript
// Instead of:
fetch('/api/posts')

// Use absolute URL in production:
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-deployment.vercel.app' 
  : 'http://localhost:3000'

fetch(`${API_BASE}/api/posts`)
```

Or update in `public/js/api.js`:
```javascript
const API_BASE = window.location.origin; // Auto-uses correct domain
fetch(`${API_BASE}/api/posts`)
```

---

## 📞 Need Help?

**If deployment still fails:**
1. Check Vercel/Netlify logs (usually shows exact error)
2. Check `.env` has all variables
3. Test locally: `vercel dev` or `netlify dev`
4. Verify MongoDB connection string with MongoDB Atlas

**Test locally first:**
```bash
# Install Vercel CLI
npm install -g vercel

# Run locally (emulates serverless)
vercel dev

# Visit http://localhost:3000/
# Check landing page loads
# Check /api/health endpoint
```

---

**You're all set! Deploy with confidence! 🚀**
