# ✅ DEPLOYMENT CHECKLIST - Step by Step

## Phase 1: Prepare Code (5 minutes)

- [ ] Read **DEPLOYMENT_FIX_SUMMARY.md** (understand what was fixed)
- [ ] Read **VISUAL_GUIDE_FIXES.md** (understand how requests flow)
- [ ] Verify in VSCode that `api/index.js` has:
  - [ ] `const pageRoutes = require('../src/routes/pageRoutes');` (line 15)
  - [ ] `app.use(express.static(publicDir));` (around line 65)
  - [ ] `app.use('/', pageRoutes);` (around line 85)

- [ ] Verify `vercel.json` has simplified routing:
  - [ ] Only one build: `"src": "api/index.js"`
  - [ ] Only one route: `"src": "/(.*)", "dest": "api/index.js"`

- [ ] Verify `netlify.toml` exists (if using Netlify)

---

## Phase 2: Commit & Push Code (3 minutes)

```bash
# Open terminal in project directory
cd "c:\jarurri kaamkaaj\health-wellness-community"

# Stage all changes
git add .

# Commit with message
git commit -m "Fix landing page rendering - add pageRoutes to serverless"

# Push to GitHub
git push origin main
```

- [ ] Verify push was successful (no errors in terminal)
- [ ] Go to GitHub and verify code was pushed
- [ ] Check that `api/index.js` shows the fix on GitHub

---

## Phase 3: Deploy to Vercel (5-10 minutes)

### 3a. Create/Connect Project

- [ ] Go to https://vercel.com (sign in or create account)
- [ ] Click **"Add New Project"**
- [ ] Click **"Import Git Repository"**
- [ ] Select your GitHub repository
- [ ] Click **"Continue"**

### 3b. Configure Build Settings

- [ ] **Project Name:** health-wellness-community (or your preferred name)
- [ ] **Framework Preset:** Other (Vercel will auto-detect)
- [ ] **Root Directory:** `./`
- [ ] **Build Command:** `npm run vercel-build`
- [ ] **Install Command:** `npm install`
- [ ] **Output Directory:** (leave empty)
- [ ] Click **"Deploy"**

**Wait for build to complete** (usually 1-2 minutes)

- [ ] ✅ When done, you'll see "Congratulations" or deployment URL
- [ ] Click on the deployment URL to see your site
- [ ] **Note:** The site might show 500 errors at this point (expected)

### 3c. Set Environment Variables ⭐ CRITICAL

The deployment will fail until you do this:

- [ ] Go back to Vercel Dashboard
- [ ] Click on your project
- [ ] Go to **Settings** (top menu)
- [ ] Click **"Environment Variables"** (left sidebar)

For each variable below, click **"Add New"** and fill in:

**Variable 1: MONGODB_URI**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://tutu:uFStc3djQ7REwrmU@cluster0.ch5oy7f.mongodb.net/healthify`
- Environments: ✓ Production ✓ Preview ✓ Development
- Click **"Save"**

**Variable 2: JWT_SECRET**
- Name: `JWT_SECRET`
- Value: `YourStrongSecretKeyMinimum32Characters1234` (make it strong!)
- Environments: ✓ Production ✓ Preview ✓ Development
- Click **"Save"**

**Variable 3: AUTH_COOKIE_NAME**
- Name: `AUTH_COOKIE_NAME`
- Value: `session_token`
- Environments: ✓ Production ✓ Preview ✓ Development
- Click **"Save"**

**Variable 4: CLOUDINARY_CLOUD_NAME**
- Name: `CLOUDINARY_CLOUD_NAME`
- Value: `dxeii3vpj` (from your .env)
- Environments: ✓ Production ✓ Preview ✓ Development
- Click **"Save"**

**Variable 5: CLOUDINARY_API_KEY**
- Name: `CLOUDINARY_API_KEY`
- Value: `169721955294936` (from your .env)
- Environments: ✓ Production ✓ Preview ✓ Development
- Click **"Save"**

**Variable 6: CLOUDINARY_API_SECRET**
- Name: `CLOUDINARY_API_SECRET`
- Value: `dB78mXqNEEcnPvqPj...` (from your .env)
- Environments: ✓ Production ✓ Preview ✓ Development
- Click **"Save"**

**Variable 7: NODE_ENV**
- Name: `NODE_ENV`
- Value: `production`
- Environments: ✓ Production ✓ Preview
- Click **"Save"**

### 3d. Redeploy with Environment Variables

- [ ] Go to **Deployments** tab
- [ ] Click the latest deployment (shows as "Building..." or date)
- [ ] Click the **three dots** (⋮) on the right
- [ ] Select **"Redeploy"**
- [ ] Click **"Redeploy"** to confirm
- [ ] **Wait for deployment** (1-2 minutes)

- [ ] When complete, you should see "Congratulations"

---

## Phase 4: Verify Deployment (5 minutes)

### 4a. Test Landing Page

- [ ] Click on your deployment URL
- [ ] You should see: **landing page** with site content
- [ ] If you see 500 error or blank page, check Phase 3c (environment variables)
- [ ] Try different pages:
  - [ ] Visit `/sign-in` → should show sign-in page
  - [ ] Visit `/register` → should show register page
  - [ ] Visit `/app` → should show app page (or redirect if not authenticated)

### 4b. Test API Health Check

- [ ] Open browser and visit: `https://your-domain.vercel.app/api/health`
- [ ] Should see:
  ```json
  {
    "status": "ok",
    "mongodb": "connected"
  }
  ```

- [ ] If mongodb shows "disconnected":
  - [ ] Check MONGODB_URI is set in environment variables
  - [ ] Check connection string is correct
  - [ ] Check MongoDB Atlas allows connections from Vercel
    - Go to https://cloud.mongodb.com
    - Your Project → Network Access
    - Click "Add IP Address"
    - Enter `0.0.0.0/0` (allows all)
    - Click "Confirm"

### 4c. Check Console for Errors

- [ ] Open browser DevTools (F12)
- [ ] Go to **Console** tab
- [ ] Check for errors
- [ ] If errors, note them and check TROUBLESHOOTING.md

---

## Phase 5: Optional - Deploy to Netlify (Alternative)

Skip this if you already deployed to Vercel. This is for having a backup or alternative deployment.

### 5a. Create/Connect Project

- [ ] Go to https://netlify.com (sign in or create account)
- [ ] Click **"Add new site"**
- [ ] Click **"Import an existing project"**
- [ ] Connect GitHub
- [ ] Select your repository
- [ ] Click **"Deploy site"**

### 5b. Configure Build Settings

- [ ] Build Command: `npm run vercel-build`
- [ ] Publish Directory: (leave empty)
- [ ] Click **"Deploy"**

**Wait for build** (1-2 minutes)

### 5c. Set Environment Variables

- [ ] Site Settings (top menu)
- [ ] **Build & deploy** → **Environment** (left sidebar)
- [ ] Click **"Edit variables"**
- [ ] Add same variables as Vercel (from Phase 3c)

### 5d. Trigger Redeploy

- [ ] Go to **Deploys** tab
- [ ] Click **"Trigger deploy"** → **"Deploy site"**
- [ ] Wait for completion

- [ ] Test: `https://your-site.netlify.app/`

---

## Phase 6: Cleanup

- [ ] Do NOT commit your `.env` file (should be in `.gitignore`)
- [ ] Share `.env.example` with your team instead
- [ ] Delete `pre-deploy.sh` and `pre-deploy.bat` if not needed
- [ ] Keep all documentation files (DEPLOYMENT_*.md, TROUBLESHOOTING.md, etc.)

---

## 🎉 You're Done!

If you see:
- ✅ Landing page rendering on `/`
- ✅ Pages loading on `/sign-in`, `/register`, `/app`
- ✅ API health check showing `"mongodb": "connected"`

**Congratulations! Your app is successfully deployed!** 🚀

---

## 🐛 If Something Goes Wrong

1. **Check the guide:**
   - DEPLOYMENT_FIX_SUMMARY.md - What was fixed
   - TROUBLESHOOTING.md - Common errors

2. **Check Vercel/Netlify logs:**
   - Vercel: Deployments → [Your Deploy] → Logs
   - Netlify: Deploys → [Your Deploy] → Deploy log

3. **Check environment variables:**
   - Are all 7 variables set?
   - Do they have correct values?
   - Did you redeploy after setting them?

4. **Test locally:**
   ```bash
   npm install -g vercel
   vercel dev
   # Visit http://localhost:3000
   ```

---

**You've got this! Deploy with confidence!** 💪
