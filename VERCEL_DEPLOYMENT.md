# Vercel Deployment Guide

## Setup for Serverless Functions

This project is configured for Vercel deployment using serverless functions. The API has been restructured to work with Vercel's serverless environment.

### Directory Structure

```
├── api/                    # Vercel serverless functions
│   ├── index.js           # Main API handler
│   └── pages.js           # Static page routes
├── src/                   # Application source code
│   ├── routes/           # Express route handlers
│   ├── controllers/       # Business logic
│   ├── models/           # MongoDB schemas
│   └── middleware/       # Express middleware
├── public/               # Static frontend files
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore in deployment
└── package.json         # Project dependencies
```

### Key Changes

1. **Serverless Entry Point**: `/api/index.js` exports the Express app as a serverless function handler
2. **Database Connection**: Reuses MongoDB connection across invocations to avoid connection pooling issues
3. **Vercel Config**: `vercel.json` defines build settings and routing rules
4. **Environment Variables**: Uses Vercel's environment variable management system

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project" → "Import Git Repository"
   - Select this repository
   - Configure project settings

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `AUTH_COOKIE_NAME`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Local Development

For local testing with the serverless setup:

```bash
npm install -g vercel

# Run locally with Vercel CLI
vercel dev
```

Or use the traditional method:
```bash
npm run dev
```

### API Endpoints

All API endpoints remain the same:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/communities/*` - Communities
- `/api/posts/*` - Posts
- `/api/comments/*` - Comments
- `/api/health/*` - Health tracking
- `/api/resources/*` - Resources

### Static Files

Frontend files are served from `/public` directory. Page routes are handled by `/api/pages.js`:
- `/` - Landing page
- `/app` - Main application
- `/sign-in` - Sign-in page
- `/register` - Registration page

### Database Connection

The serverless handler implements connection pooling to reuse MongoDB connections across invocations. This improves performance and prevents connection exhaustion.

### Monitoring

Use Vercel's dashboard to:
- Monitor function executions
- View logs
- Check error rates
- Monitor database connections
- Track performance metrics

### Troubleshooting

1. **Connection Timeout**: Increase the timeout in `vercel.json` if needed
2. **Environment Variables**: Ensure all variables are set in Vercel dashboard
3. **Module Not Found**: Verify all dependencies are in `package.json`
4. **Static Files Not Serving**: Check paths in `/api/pages.js`

### Production Considerations

- Set `IS_PRODUCTION=true` in environment variables
- Enable CORS if frontend is on different domain
- Implement rate limiting for API endpoints
- Use strong JWT_SECRET (min 32 characters)
- Monitor MongoDB connection limits
- Set up error tracking (Sentry, etc.)
