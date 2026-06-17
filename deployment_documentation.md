# AI Resume Maker Production Deployment Guide

## 1. Prerequisites
- MongoDB Atlas account
- Docker installed
- Nginx installed
- PM2 installed
- Vercel account (for frontend)

## 2. Backend Deployment (Docker)
### a. Build Docker Image
```bash
docker build -t ai-resume-maker-api .
```

### b. Run with Docker Compose
```bash
docker-compose up -d
```

### c. Environment Variables
Create `.env.production` in backend with:
```
MONGODB_URI=mongodb://ambikayemul2001_db_user:r2h2XOpf6Kuu3ChB@ac-dn8tknq-shard-00-00.thloofe.mongodb.net:27017,ac-dn8tknq-shard-00-01.thloofe.mongodb.net:27017,ac-dn8tknq-shard-00-02.thloofe.mongodb.net:27017/JobCopilot?ssl=true&replicaSet=atlas-z4tnxk-shard-0&authSource=admin&appName=Cluster0
PORT=5000
NODE_ENV=production
```

## 3. Frontend Deployment (Vercel)
1. Build frontend:
```bash
npm run build
```
2. Deploy to Vercel:
- Connect Vercel to GitHub
- Deploy from `Ai-Resume-Maker/frontend` directory

## 4. Nginx Configuration
- Use provided `nginx.conf` with SSL configuration
- Point domain to Docker container IP

## 5. PM2 Process Manager
- Backend is already managed by PM2 in Docker
- Logs available at `/app/logs`

## 6. MongoDB Atlas
- Connect using provided URI
- Database: `resumeDB`
- Collections: `resumes`, `coverLetters`, `emails`, `jobApplications`

## 7. Chrome Extension
- Build extension:
```bash
cd extension
npm run build
```
- Publish to Chrome Web Store

## 8. Monitoring
- Health checks via `/api/health` endpoint
- Logs accessible through Docker Compose