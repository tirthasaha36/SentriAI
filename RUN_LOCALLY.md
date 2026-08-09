# Running Sentri Locally

This guide explains how to set up and run the Sentri project on your local machine for development and testing.

## Prerequisites

Before starting, ensure you have the following installed:
1. **Node.js** (Version 18+ is required, Version 22 is tested and recommended).
2. **npm** (comes packaged with Node.js).
3. **Groq API Key**: A free API key is required to power the AI features. You can get one from the [Groq Console](https://console.groq.com).

---

## Step 1: Clone or Open the Project
Ensure you are in the root directory of the project:
```bash
cd SentriAI-main
```

---

## Step 2: Configure the Backend Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install the backend dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration file:
   - Copy the `.env.example` file from the root directory into the `server` directory and rename it `.env`:
     ```bash
     cp ../.env.example .env
     ```
   - Open the newly created `server/.env` file and insert your Groq API Key:
     ```env
     GROQ_API_KEY=gsk_your_actual_groq_api_key_here
     ```

4. Start the backend server:
   ```bash
   npm start
   ```
   *Note: By default, the server runs on [http://localhost:3001](http://localhost:3001).*

---

## Step 3: Configure the Frontend Client

1. Open a new terminal window or tab and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Note: By default, the client runs on [http://localhost:5173](http://localhost:5173) and will open automatically in your browser.*

---

## Architecture & Communication (Proxy Config)

- **Local Proxying**: The client is configured to proxy all `/api/*` requests to the backend server (`http://localhost:3001`) automatically. This eliminates the need to configure CORS headers or hardcode local port numbers.
- **Port Settings**:
  - Frontend: `5173`
  - Backend: `3001`

---

## Troubleshooting

### 1. AI Features Returning "503 Service Unavailable" or 401 Unauthorized
- Double-check that your `server/.env` file exists and has the correct key `GROQ_API_KEY`.
- Make sure there are no typos, spaces, or quotes around your API key value in the `.env` file.

### 2. Port Collisions
If port `3001` or `5173` is already in use by another application:
- You can change the backend port by defining a `PORT` variable in the `server/.env` file (e.g., `PORT=3002`).
- If you change the backend port, update the target port in `client/vite.config.js` under the `server.proxy` section to match it.
