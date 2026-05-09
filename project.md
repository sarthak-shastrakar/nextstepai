# 🚀 NextStep AI — AI-Powered Career Coach

NextStep AI is a comprehensive, modern career coaching platform designed to help users navigate their professional journey with the power of Artificial Intelligence. From building perfect resumes to preparing for high-stakes interviews, NextStep AI provides personalized guidance and tools.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS + Framer Motion (for premium animations)
- **Authentication**: Custom Auth with [NextAuth.js v5](https://next-auth.js.org/) (formerly Clerk)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **AI Integration**: 
  - Google Gemini AI (`@google/generative-ai`)
  - OpenAI / OpenRouter
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **Email Service**: [Resend](https://resend.com/)
- **UI Components**: Radix UI + Lucide Icons + Shadcn/UI patterns
- **State Management**: Redux Toolkit

---

## ✨ Key Features

1.  **AI Resume Builder**: Create professional, ATS-friendly resumes with AI-generated content tailored to specific job roles.
2.  **AI Cover Letter Generator**: Generate compelling cover letters that highlight your strengths and fit the job description.
3.  **Interview Preparation**: AI-driven mock interviews and preparation guides to boost confidence and performance.
4.  **Job Discovery**: Explore industry-specific roles and find the best fit for your skills.
5.  **Industry Insights**: Detailed analytics and trends for various career paths to help you stay ahead.
6.  **Personalized Onboarding**: A tailored experience that understands your career goals from the start.
7.  **Smart Dashboard**: Overview of your career progress, saved documents, and AI assessments.

---

## 📂 Project Structure

```text
├── actions/            # Server Actions for database and business logic
├── app/                # Next.js App Router (Routes & Pages)
│   ├── (auth)/         # Authentication routes (Login, Register, Reset Password)
│   ├── (main)/         # Main application features (Dashboard, Resume, etc.)
│   ├── api/            # API Route handlers (Auth, Inngest, etc.)
│   └── globals.css     # Global styles and Tailwind configurations
├── components/         # Reusable React components (UI, Layouts, Features)
├── data/               # Static data and constant definitions
├── hooks/              # Custom React hooks
├── lib/                # Shared utilities (db connection, helper functions)
├── models/             # Mongoose schemas (User, Resume, Assessment, etc.)
├── public/             # Static assets (Images, Fonts, etc.)
├── scripts/            # Database or utility scripts
└── styles/             # Additional CSS modules or style constants
```

---

## 🏗️ Architecture & Core Logic

### 1. Server Actions (`actions/`)
The project heavily uses Next.js Server Actions for secure, server-side operations:
- **Auth Actions**: Handles registration, password reset, and session management.
- **Feature Actions**: logic for creating resumes, generating cover letters, and recording interview assessments.
- **Review Actions**: Logic for user feedback and ratings.

### 2. AI Service Layer (`lib/ai-service.js`)
A centralized wrapper for interacting with AI models (Gemini/OpenRouter). It handles:
- Prompt engineering for different career tools.
- Response parsing and structured data extraction.

### 3. Background Workflows (`lib/inngest/`)
Uses Inngest for asynchronous tasks such as:
- Sending automated follow-up emails.
- Periodic data synchronization or industry insight updates.

### 4. Email System (`lib/mail.js`)
Comprehensive mail system using **Resend** for:
- Email verification.
- Password reset links.
- Career milestone notifications.

---

## 🗄️ Database Schema (Models)

- **`User`**: Stores user profiles, career goals, and account settings.
- **`Resume`**: Manages user-created resumes, including education, experience, and skills.
- **`CoverLetter`**: Stores AI-generated cover letters for specific job applications.
- **`Assessment`**: Tracks AI-driven interview assessments and feedback.
- **`IndustryInsight`**: Cached data about industry trends and salaries.

---

## 🔑 Environment Variables

To run this project locally, you need a `.env` file with the following keys:

```bash
# Authentication
NEXTAUTH_SECRET=      # Generate with: npx auth secret
NEXTAUTH_URL=         # http://localhost:3000
GOOGLE_CLIENT_ID=     # Google Cloud Console
GOOGLE_CLIENT_SECRET= # Google Cloud Console

# Database
MONGODB_URI=          # MongoDB Atlas connection string

# AI Services
GENERATIVE_AI_KEY=    # Google AI Studio API Key
OPENROUTER_API_KEY=   # OpenRouter API Key

# Email
RESEND_API_KEY=       # Resend API Key
```

---

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Copy the `.env.example` (or use the list above) and fill in your API keys.
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Open Browser**:
    Visit `http://localhost:3000` to see the application in action.

---

## 🎨 Design Philosophy

NextStep AI follows a **Premium Glassmorphism** design aesthetic:
- Vibrant, harmonious color palettes.
- Subtle gradients and backdrop blurs.
- Smooth micro-animations using Framer Motion.
- Clean, modern typography (Inter/Geist).

---

*This document is maintained to help AI and developers understand the project architecture and goals.*
