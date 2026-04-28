# AI Voting Assistant

A complete full-stack web application designed for secure voting with an integrated AI Assistant to help voters make informed decisions.

## Features
- **User Authentication:** Secure registration and login using JWT.
- **Secure Voting System:** Ensures each user can only vote once.
- **Real-time Results Dashboard:** View live standings of the election.
- **AI Voting Assistant:** An integrated chatbot powered by Gemini API to answer questions and provide unbiased voting information.
- **Modern UI/UX:** Clean, responsive design built with React and custom CSS.

## Tech Stack
- **Frontend:** React, React Router, Vite, Axios, Lucide Icons, plain CSS.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **AI Integration:** Google Generative AI (Gemini).

## Folder Structure
```
election-assistant/
├── backend/
│   ├── models/ (User.js, Candidate.js inside server.js for simplicity)
│   ├── server.js
│   ├── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ (Navbar, Chatbot)
│   │   ├── pages/ (Login, Dashboard, Vote, Results)
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   ├── package.json
│   ├── vite.config.js
└── README.md
```

## Setup & Local Development

### 1. Database & Environment Variables
- Ensure you have MongoDB running locally or a MongoDB Atlas URI.
- In the `backend` folder, create a `.env` file with the following:
  ```env
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/voting-app
  JWT_SECRET=your_super_secret_jwt_key
  GEMINI_API_KEY=your_google_gemini_api_key
  ```

### 2. Backend Setup
1. Open a terminal and navigate to `backend`: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. *Optional:* Seed the database with initial candidates by making a POST request to `http://localhost:5000/api/admin/seed`.

### 3. Frontend Setup
1. Open a new terminal and navigate to `frontend`: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Deployment to GitHub Pages & Render

Since this project requires both a frontend and a backend, the recommended deployment strategy is:

### Backend Deployment (Render / Heroku)
1. Push this repository to GitHub.
2. Go to [Render](https://render.com/) and create a new "Web Service".
3. Connect your GitHub repository and select the `backend` folder as the Root Directory.
4. Set the build command to `npm install` and the start command to `node server.js`.
5. Add your Environment Variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) in the Render dashboard.

### Frontend Deployment (Vercel / Netlify / GitHub Pages)
1. Before deploying, update the `API_URL` in your frontend components (`Login.jsx`, `Vote.jsx`, `Results.jsx`, `Chatbot.jsx`) from `http://localhost:5000/api` to your newly deployed Render backend URL.
2. Go to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) and create a new project.
3. Select your GitHub repository and set the Root Directory to `frontend`.
4. The build command will automatically be detected as `npm run build` and output directory as `dist`.
5. Click deploy!

*(For GitHub Pages specifically, you would use the `gh-pages` npm package and add a `"homepage": "https://yourusername.github.io/repo-name"` to your `frontend/package.json`, then run `npm run build && gh-pages -d dist`)*
