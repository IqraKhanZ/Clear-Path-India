# ClearPath India — AI-Powered Tenancy & Rental Dispute Platform

[Live Deployed Website Link](https://<YOUR_DEPLOYED_WEBSITE_LINK>)

ClearPath India is an AI-assisted legal intake and custom action plan generator for urban tenants in India facing tenancy issues (such as eviction threats, arbitrary rent hikes, security deposit retention, or lease violations). 

It leverages **Retrieval-Augmented Generation (RAG)** powered by Google Gemini to cross-reference situations against local acts (like the Delhi/Maharashtra/Karnataka Rent Control Acts or the Model Tenancy Act) to deliver bilingual custom action plans.

---

## 🚀 Key Features

* **Bilingual Intake Assessment**: Intake form evaluating situation category, city, written lease status, and urgency.
* **RAG Gemini AI Service**: Connects to the `@google/generative-ai` SDK to evaluate intake data, retrieve matched statutory reference resources from MongoDB, and compile custom step-by-step advice.
* **Deterministic Local Fallback**: Seamless fallback to a rule-based matching engine (`planMatcher.js`) to guarantee 100% platform uptime even if the Gemini API fails or runs out of quota.
* **Bilingual Translation Support**: Dynamic controller localization returns English or Devanagari Hindi text according to the user's language selector.
* **Dynamic PDF Downloads**: High-quality client-side PDF document generation for both the **Document Checklist** and the **Custom Action Plan** (built with automatic line-wrapping and multi-page overflow handling using `jsPDF`).
* **DLSA Referrals Directory**: Automated geolocation mapping to find the nearest Free Legal Aid Clinic / District Legal Services Authority (DLSA) office.
* **PMAY Subsidy Calculator**: Simple eligibility check based on household income groups under the Pradhan Mantri Awas Yojana guidelines.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide React, jsPDF, i18next (Internationalization)
* **Backend**: Node.js, Express, MongoDB Atlas (Mongoose), Firebase Admin SDK (Auth Validation), Google Gen AI SDK
* **Database**: MongoDB (Atlas) for resources, referrals, intake history, and user checklists.

---

## 📂 Project Architecture

```
clear-path-india/
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── config/           # DB & Firebase admin configs
│   │   ├── controllers/      # AI Plans, Intake, Resources, & Chat Handlers
│   │   ├── middlewares/      # Firebase token verification
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Gemini RAG AI & Fallback service
│   │   └── utils/            # Legal data seeder scripts
│   ├── .env.example          # Backend environment variables template
│   └── package.json
├── src/                      # Vite + React Frontend
│   ├── components/           # Reusable UI widgets
│   ├── context/              # Authentication context
│   ├── pages/                # App pages (Landing, Intake, Results, Resources, Help)
│   ├── utils/                # API wrapper
│   └── main.jsx
├── .env.example              # Frontend environment variables template
├── .gitignore                # Production security configuration
├── package.json
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (Local instance or MongoDB Atlas cluster connection string)
* **Firebase Project** (For frontend Google/Email authentication and private key configuration)
* **Gemini API Key** (Obtained from Google AI Studio)

---

### 1. Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory (use `.env.example` as a template):
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_secret
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   
   # Firebase Admin Credentials
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   
   # Gemini Configs
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-1.5-flash
   GEMINI_TIMEOUT_MS=8000
   ```
4. **Seed the Legal Knowledge Base**:
   Populate MongoDB with local Rent Control Acts, glossary entries, and DLSA referral centers:
   ```bash
   npm run seed:legal
   ```
5. **Run the Backend Developer Server**:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

---

### 2. Frontend Setup
1. Return to the root folder of the project.
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_web_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. **Run the Frontend Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔒 Security & Deployment Precautions

To prevent credentials leak or build crashes during cloud deployment, the following changes have been made:

1. **Git Exclusions**:
   - The `.gitignore` has been configured to block `.env` configuration files and Firebase Admin credential JSON files (`clearpath-india-firebase-adminsdk-*.json`) from being uploaded to public GitHub repositories.
2. **Dynamic Admin SDK initialization**:
   - The backend Firebase configuration in [firebaseAdmin.js](backend/src/config/firebaseAdmin.js) checks for the local service account JSON. If the file is missing (on cloud servers), it automatically falls back to parsing environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`), preventing startup failures.

---

## ☁️ Deployment Guide

### A. Deploying the Backend (e.g. Render, Railway, or Heroku)
1. Link your GitHub repository.
2. Set the build command to `npm install` (or let the platform autodetect it) and the start command to `node src/app.js` (or `npm start`).
3. Add the following environment variables:
   * `MONGODB_URI`: Your MongoDB Atlas connection string.
   * `GEMINI_API_KEY`: Your Google Gemini API Key.
   * `FIREBASE_PROJECT_ID`: The project ID of your Firebase app.
   * `FIREBASE_CLIENT_EMAIL`: Service account email.
   * `FIREBASE_PRIVATE_KEY`: The full private key string from your Firebase JSON key file (be sure to copy the entire key block, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`).
   * `FRONTEND_URL`: Set this to your deployed frontend URL (e.g. `https://your-app.vercel.app`) to resolve CORS policies.

### B. Deploying the Frontend (e.g. Vercel, Netlify, or Firebase Hosting)
1. Set the build command to:
   ```bash
   npm run build
   ```
2. Set the publish directory to `dist`.
3. Add the production environment variables to your provider configuration:
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_API_BASE_URL` (Set this to your deployed **backend API URL**, e.g., `https://your-backend-api.onrender.com`).
