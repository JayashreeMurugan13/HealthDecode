# Quick Database Setup

## 1. Create Neon Database (Free)
- Go to https://neon.tech
- Sign up with GitHub
- Create new project: "medical-app"
- Copy connection string

## 2. Add to Vercel
- Vercel Dashboard → medical-win → Settings → Environment Variables
- Add: DATABASE_URL = your_neon_connection_string

## 3. Redeploy
The app will automatically create tables on next deployment.

Connection string format:
postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require