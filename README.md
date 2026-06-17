# AI Resume Maker

## Project Overview
AI Resume Maker is a full‑stack application that helps users generate, tailor, and manage resumes, cover letters, emails, job applications, and career insights using AI.

## Prerequisites
- **Node.js** (v20 or later)
- **npm** (or yarn/pnpm)
- **MongoDB Atlas** account (or any MongoDB instance)
- **Docker** (optional, for production)
- **Vercel** account (for frontend deployment)

## Environment Variables
Create a `.env` file in the `backend/` directory (or `.env.production` for Docker) with the following keys:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/resumeDB
PORT=5000
JWT_SECRET=your_jwt_secret
# Add any other required variables as needed
```

## Development Setup

### 1. Install Backend Dependencies
```bash
cd Ai-Resume-Maker/backend
npm install
```

### 2. Run Backend (Development)
```bash
npm run dev
# or, if a script is defined:
node server.js
```

The API will be available at `http://localhost:5000`.

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Run Frontend (Development)
```bash
npm run dev
```

The React app will be available at `http://localhost:5173` (Vite default port).

## Production Deployment

### Backend (Docker + Nginx + PM2)
```bash
# Build Docker image
docker build -t ai-resume-maker-api .

# Start services
docker-compose up -d
```

- Nginx is configured via `nginx/nginx.conf`.
- PM2 process manager is defined in `backend/ecosystem.config.js`.

### Frontend (Vercel)
1. Build the frontend:
   ```bash
   cd Ai-Resume-Maker/frontend
   npm run build
   ```
2. Deploy the `frontend` folder to Vercel (connect your repo or use the Vercel CLI).

### Chrome Extension
```bash
cd Ai-Resume-Maker/extension
npm run build   # Adjust according to your build setup
```
Upload the generated package to the Chrome Web Store.

## Useful Commands Summary

| Task                     | Command |
|--------------------------|---------|
| Install backend deps     | `cd backend && npm install` |
| Run backend dev server   | `cd backend && npm run dev` |
| Install frontend deps    | `cd frontend && npm install` |
| Run frontend dev server  | `cd frontend && npm run dev` |
| Build Docker image        | `docker build -t ai-resume-maker-api .` |
| Start Docker compose      | `docker-compose up -d` |
| Build frontend for Vercel| `cd frontend && npm run build` |
| Build Chrome extension   | `cd extension && npm run build` |

## License
MIT