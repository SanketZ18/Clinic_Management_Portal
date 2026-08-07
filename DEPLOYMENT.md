# Deployment Guide — Render (Docker) & Vercel

This guide explains how to deploy the system with the backend on **Render (using Docker)** and the frontend on **Vercel**.

---

## 1. Backend Deployment (Render with Docker)

Since Render doesn't support Java natively in all tiers, we've set up a `Dockerfile` in the `backend` folder to build and run the backend using Docker.

### Setup Steps:
1. Sign up/log in to [Render](https://render.com).
2. Click **New +** (top right) and select **Web Service**.
3. Connect your Git repository.
4. Configure the Web Service settings:
   - **Name**: `clinic-backend` (or your choice)
   - **Region**: Select the closest region to your users.
   - **Runtime**: Select **Docker** (instead of Java or Node).
   - **Root Directory**: `backend` (Important: points to the backend sub-folder containing the Dockerfile)
   - **Instance Type**: Select the Free tier (or standard tier).
5. Click **Advanced** and add the following **Environment Variables**:
   - `JWT_SECRET`: A secure random secret string (e.g., `your-super-long-random-secret-key-32-chars-or-more`).
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/ClinicSystem?appName=Clinic` (Your MongoDB connection string).
   - `MONGO_DB`: `ClinicSystem`
   - `FRONTEND_URL`: The URL of your Vercel frontend (e.g., `https://your-app.vercel.app`).
6. Click **Create Web Service**.

Once deployed, copy the Render service URL (e.g., `https://clinic-management-portal.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Vercel is ideal for hosting the React Vite static site.

### Setup Steps:
1. Sign up/log in to [Vercel](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your Git repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `frontend` (Important: points to the frontend sub-folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   - Key: `VITE_API_BASE_URL`
   - Value: Your Render URL with `/api` appended (e.g., `https://clinic-management-portal.onrender.com/api`).
6. Click **Deploy**.

Vercel will build the frontend, configure SPA routing using the included `vercel.json` file, and assign you a frontend URL (e.g., `https://your-app.vercel.app`).

---

## 3. Post-Deployment Verification

1. Copy the Vercel frontend URL.
2. Go to your **Render Web Service dashboard** -> **Environment** settings.
3. Ensure `FRONTEND_URL` is set to your Vercel URL (e.g., `https://your-app.vercel.app`). If you update it, Render will automatically redeploy the backend.
4. Open the Vercel frontend URL in your browser and test registration/login.

---

## 4. Keeping Render Backend Awake (Prevent Sleep Mode)

Render free instances spin down after 15 minutes of inactivity. We use **cron-job.org** to automatically ping the backend health endpoint every 8–10 minutes to ensure 24/7 availability.

### Configuration on cron-job.org:
- **Title**: `Keep Render Backend Alive`
- **URL**: `https://clinic-management-portal.onrender.com/api/auth/health`
- **Method**: `GET`
- **Execution Interval**: Every 8–10 minutes

