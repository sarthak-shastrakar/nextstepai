# 🚀 NextStep AI — AI-Powered Career Coach

NextStep AI is a sophisticated, AI-driven career coaching platform built with **Next.js 15**. It empowers users to build professional resumes, generate tailored cover letters, prepare for interviews, and gain real-time industry insights using state-of-the-art AI models like **Google Gemini** and **OpenRouter**.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS + Framer Motion (Animations) + Radix UI
- **Authentication**: NextAuth.js v5 (Google OAuth & Custom Credentials)
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini AI & OpenRouter (OpenAI, Claude, etc.)
- **Background Jobs**: Inngest
- **Notifications**: OneSignal (Push) & Resend (Email)
- **Media Storage**: Cloudinary (Profile pictures, etc.)
- **State Management**: Redux Toolkit

---

## ✨ Key Features

1.  **AI Resume Builder**: Create ATS-friendly resumes with AI-generated suggestions.
2.  **AI Cover Letter Generator**: Generate compelling, role-specific cover letters.
3.  **Industry Insights**: Real-time analytics on job trends, salary ranges, and required skills.
4.  **Interview Preparation**: AI-driven mock interviews and feedback sessions.
5.  **Smart Dashboard**: Centralized hub for tracking career progress and documents.
6.  **Premium UI/UX**: Modern glassmorphic design with smooth animations.

---

## 📂 Project Architecture

```text
├── actions/            # Server Actions (DB logic, AI calls, Auth)
├── app/                # App Router (Pages, Layouts, API routes)
│   ├── (auth)/         # Auth routes (Login, Register)
│   ├── (main)/         # Core features (Dashboard, Resume, Insights)
│   └── api/            # API Handlers (Inngest, Webhooks)
├── components/         # UI Components (Reusable & Feature-specific)
├── lib/                # Shared utilities (DB connection, AI service, Cloudinary)
├── models/             # Mongoose schemas (User, Resume, Insight)
├── hooks/              # Custom React hooks
├── data/               # Constants and static data
└── public/             # Static assets
```

---

## 🔑 Environment Variables (Required for Deployment)

For a successful deployment on Vercel or any other platform, ensure the following environment variables are set:

### 1. Authentication (NextAuth)
- `NEXTAUTH_SECRET`: A secure secret key (generate with `npx auth secret`).
- `NEXTAUTH_URL`: Your application URL (e.g., `https://your-app.vercel.app`).
- `NEXT_PUBLIC_APP_URL`: Same as `NEXTAUTH_URL`.
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret.

### 2. Database
- `MONGODB_URI`: Your MongoDB Atlas connection string.

### 3. AI Services
- `GENERATIVE_AI_KEY`: Google AI Studio (Gemini) API Key.
- `OPENROUTER_API_KEY`: OpenRouter API Key (for alternative models).

### 4. Media & Notifications
- `RESEND_API_KEY`: API Key from Resend for emails.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API Key.
- `CLOUDINARY_API_SECRET`: Cloudinary API Secret.
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`: OneSignal App ID.
- `ONESIGNAL_REST_API_KEY`: OneSignal REST API Key.

---

## 🚀 Deployment Guide (Vercel)

1.  **Push to GitHub**: Ensure your code is in a GitHub repository.
2.  **Import to Vercel**:
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click "Add New" -> "Project".
    - Import your `nextstepai` repository.
3.  **Configure Environment Variables**:
    - Copy all keys from your `.env` file to the Vercel project settings.
    - Ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` match your Vercel deployment URL.
4.  **Database Access**:
    - Ensure your MongoDB Atlas cluster allows connections from your Vercel deployment (allow IP `0.0.0.0/0` or use Vercel's MongoDB integration).
5.  **Build Settings**:
    - Vercel automatically detects Next.js.
    - Build Command: `npm run build`
    - Output Directory: `.next`
6.  **OAuth Redirects**:
    - Update your Google Cloud Console to include the new production callback URL: `https://your-app.vercel.app/api/auth/callback/google`.

---

## 💻 Local Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd nextstepai
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup `.env`**:
    Create a `.env` file and fill in the keys mentioned above.
4.  **Run Dev Server**:
    ```bash
    npm run dev
    ```
5.  **Open**: [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the production application.
- `npm run start`: Starts the built application.
- `npm run lint`: Checks for linting errors.

---

Developed with ❤️ by Sarthak Shastrakar.
