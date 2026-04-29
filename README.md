# AI Voting Assistant

A full-stack web application designed for secure, role-based voting with an integrated AI assistant. 
It supports proper role-based access control (RBAC), real-time election status management, and a dedicated admin portal.

## Features

**For Voters:**
- Secure Registration and Login
- Profile dashboard showing voting status
- Single-vote enforcement
- Real-time AI Assistant to compare candidate platforms
- Final results view (only after the election is marked ended by admin)

**For Admins:**
- Dedicated Admin Panel
- Voter Management (Block, Approve, Delete users)
- Candidate Management (Add, Edit, Delete candidates)
- Election Control (Start, End, Reset election status)
- Live Analytics (Total voters, participation rate, live results)

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Currently using `mongodb-memory-server` for easy testing, but can be easily swapped to a persistent MongoDB cluster)
- **AI**: Google Generative AI (Gemini)

## Setup Guide

### 1. Clone & Install
Ensure you have Node.js installed.

Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Navigate to the `frontend` folder and install dependencies:
```bash
cd frontend
npm install
```

### 2. Configuration (Environment Variables)
In the `backend` directory, create a `.env` file with the following variables:
```
PORT=5000
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is not provided, the chatbot will run in a mock mode.)*

### 3. Running Locally
Start the backend server:
```bash
cd backend
npm run dev # or node server.js
```

Start the frontend server:
```bash
cd frontend
npm run dev
```

The application will be accessible at `http://localhost:5173`.
An initial admin account is automatically seeded for you:
- **Username**: `admin`
- **Password**: `admin123`

## Deployment

The project is structured within a single Git repository for ease of deployment.

### Deploying the Backend (Render or Heroku)
1. Commit your code to the `main` branch.
2. Link your repository to a service like **Render**.
3. Create a new "Web Service" and select the `backend` folder as the Root Directory.
4. Set the Build Command: `npm install`
5. Set the Start Command: `node server.js`
6. Add your Environment Variables (`JWT_SECRET`, `GEMINI_API_KEY`). *IMPORTANT: Change from `mongodb-memory-server` to a real MongoDB URI for production!*

### Deploying the Frontend (Vercel, Netlify, or Firebase)
1. Link your repository to a service like **Vercel**.
2. Select the `frontend` folder as the Root Directory.
3. The build settings should automatically be detected (Build Command: `npm run build`, Output Directory: `dist`).
4. **Important:** Update `API_URL` in `frontend/src/pages/*.jsx` components to point to your live deployed backend URL instead of `http://localhost:5000/api`.

---
*Developed for a secure and transparent democratic process.*
