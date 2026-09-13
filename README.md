# PromptWise 🚀
### *Ask Better. Learn Better.*

<div align="center">
  <img src="public/Icon.png" alt="PromptWise Logo" width="128" height="128" />

  <p align="center">
    <strong>An intelligent AI literacy and prompt engineering platform designed for students, researchers, and creators.</strong><br />
    Stop getting mediocre, surface-level answers from AI. Master how to craft structured, high-impact prompts through intelligent Socratic follow-ups, real-time diagnostic scoring, interactive practice arenas, and PWA capabilities.
  </p>

  <p align="center">
    <a href="https://promptwise.naseem2917.workers.dev/"><strong>🌐 Live Demo: promptwise.naseem2917.workers.dev</strong></a>
  </p>

  <p align="center">
    <a href="#-live-demo">Live Demo</a> •
    <a href="#-the-problem--philosophy">Philosophy</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-deployment">Deployment</a>
  </p>

  <p align="center">
    <a href="https://promptwise.naseem2917.workers.dev/"><img src="https://img.shields.io/badge/Live_Demo-promptwise.naseem2917.workers.dev-success?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Demo" /></a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/PWA-Ready-38B2AC?logo=pwa&logoColor=white" alt="PWA Ready" />
    <img src="https://img.shields.io/badge/Cloudflare_Workers-Serverless-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
    <img src="https://img.shields.io/badge/Google_Gemini-3.5%20Lite%20|%203.6%20Flash%20|%203.7-4285F4?logo=google&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  </p>
</div>

---

## 🌐 Live Demo

PromptWise is deployed live on Cloudflare's global edge network:
👉 **[https://promptwise.naseem2917.workers.dev/](https://promptwise.naseem2917.workers.dev/)**

- **Instant access**: No sign-in required to test prompt improvements or take quizzes.
- **Guest Mode & Google Sign-In**: Save prompts to cloud history and track your learning progress.
- **Install as App (PWA)**: Install directly on Android, iOS, Windows, or macOS for an offline-ready, full-screen desktop/mobile app experience.

---

## 📖 The Problem & Philosophy

Most students and learners use Generative AI tools (ChatGPT, Gemini, Claude, DeepSeek) like a search engine—entering vague, single-sentence prompts such as:
> *"Write an essay about climate change"* or *"Explain binary search"*.

This leads to generic, inaccurate, or superficial answers. Typical prompt "rewriters" simply slap generic buzzwords onto the prompt without knowing what the student actually needs.

### 💡 The PromptWise Approach
> **"Don't just rewrite the prompt. Understand what the user actually wants first."**

Instead of guessing your intent, **PromptWise acts as an AI Thinking Partner**:
1. **Stage A (Verification & Clarification)**: Analyzes your initial input. Detects gibberish/keyboard smashes locally with **0 API calls**. If vague, asks targeted clarification until clear.
2. **Stage B (Adaptive Follow-Ups)**: Asks **0–4 smart questions** (e.g., target audience, technical depth, formatting, specific boundaries) with clickable option pills or open text (with skip support).
3. **Stage C (Synthesis & Scoring)**: Synthesizes your answers into a **masterfully engineered, production-ready prompt**, evaluates quality (0–100) across 6 core parameters, and provides educational "What Changed & Why" explanations.

---

## ⚡ Key Features

### 1. 🛠️ Socratic Prompt Improvement Engine (`/improve`)
- **3-Stage Intelligent Architecture**:
  - **Local Garbage Rejection (Stage A)**: Instant regex-based rejection for keyboard smashes (`asdfgh`, `xxxxx`, `qwertyuiop`, repetitive symbols) with **0 Gemini calls**. Short technical terms (`SQL`, `HTML`, `MERN`, `GPT`, `Python`) are safely preserved.
  - **Adaptive Clarification Loop**: If prompt intent is unclear, guides the user with a single friendly question: *"What would you like me to help you create or figure out?"* The verified clear prompt replaces vague input and becomes the official prompt.
  - **Adaptive Follow-Up Questions (Stage B)**: Dynamic choice pills or open text to extract missing context. Users can easily **Skip** optional questions.
  - **Final Synthesis (Stage C)**: Generates a high-impact prompt with role/persona, context, specific tasks, formatting, and constraints.
- **Response Modes**:
  - ⚡ **Low / Fast** (`gemini-3.5-flash-lite`): Instant turnaround for quick queries.
  - ⚖️ **Medium / Balanced** (`gemini-3.6-flash`): Ideal blend of speed and depth (Default).
  - 🧠 **High / Deep** (`gemini-3.7-flash`): Maximum depth for advanced research, complex code, and thesis generation.
- **Diagnostic Scorecard (0–100)**: Evaluates prompts across 6 core dimensions:
  - 🎯 **Goal**: Clear objective defined.
  - 🌐 **Context**: Relevant background included.
  - 👥 **Audience**: Target reader/consumer specified.
  - 🔍 **Specificity**: Technical/subject details provided.
  - 📋 **Output Format**: Layout and structure outlined.
  - 📐 **Constraints**: Negative rules and boundaries set.
- **Before & After Visualizer**: Side-by-side comparison with one-click copy and auto-saving.
- **"What Changed & Why" Breakdown**: Teaches students why each addition was made.

### 2. 📚 Prompt Engineering Masterclass (`/learn`)
- **The 6 Core Building Blocks**: Role, Objective, Context, Step-by-Step Instructions, Constraints, and Output Format.
- **Interactive Anti-Pattern Guide**: Real examples of "vague prompts", "conflicting instructions", and "overloaded contexts" with interactive before/after fixes.
- **Prompting Frameworks**: Zero-shot, Few-shot, Chain-of-Thought (CoT), and Role-Prompting explained simply.

### 3. 💡 Curated Examples Library (`/examples`)
- Categorized real-world prompt templates for:
  - 💻 Software Development & Code Debugging
  - 📝 Academic Research & Thesis Writing
  - 🧮 Mathematics & Data Science
  - 🎓 Exam Revision & Active Recall
  - 💼 Resume & Career Preparation
- **1-Click Testing**: Load any example directly into the improvement engine with a single tap.

### 4. 🎯 Practice Arena (`/practice`)
- Hands-on sandbox exercises with realistic scenarios (e.g. debugging slow SQL queries, cold email rewrites, junior developer bug reports).
- Hint system and expert solutions to verify understanding.

### 5. 🧠 Skills & Knowledge Quiz (`/quiz`)
- 6-question interactive quiz testing prompt engineering principles, token economics, and LLM behavior.
- **`🔁 Retake Quiz` Feature**: Reset and re-attempt the exact same quiz questions to master weak spots.
- **`🔄 New Quiz` Feature**: Fetch fresh AI-generated questions from the server.
- Rank and proficiency scoring from *Prompt Explorer* to *Prompt Grandmaster*.

### 6. 🛡️ Responsible AI Hub (`/responsible-ai`)
- Academic integrity, plagiarism avoidance, citing AI contributions.
- Privacy protection (never sharing passwords, API keys, or personal identifiable information).
- Detecting hallucinations and verifying critical facts.

### 7. 📱 Progressive Web App (PWA) & Mobile Excellence
- Offline caching with Workbox Service Worker.
- Installable on mobile and desktop devices with dedicated high-res icons.
- Mobile-first bottom navigation bar and gesture-friendly cards.

### 8. 🔐 Admin Feedback Center (`/admin`)
- **Strict Privacy**: No personal user data or quiz history exposed; strictly feedback-focused.
- **Full Prompt Context**: Displays the exact **User Prompt** and **Improved Output Shown** alongside user comments.
- **Smart Rating Badges**: `👍 Helpful (Yes)` and `👎 Needs Improvement (No)` badges, 1-5 star ratings, and one-click copy buttons.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PromptWise Client                             │
│       (React 19 + TypeScript + Tailwind CSS v4 + Framer Motion)         │
│          [ Progressive Web App with Service Worker & Caching ]          │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
            Edge API Requests                 User Auth & Storage
                    │                                 │
                    ▼                                 ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────┐
│       Cloudflare Worker Gateway       │   │        Firebase SDK         │
│     (Single-Bundle Serverless Edge)   │   │  - Google OAuth Login       │
│                                       │   │  - Cloud Firestore          │
│  Endpoints:                           │   │    - Saved Prompts          │
│  - POST /api/analyze                  │   │    - History Tracking       │
│  - POST /api/improve                  │   │    - User Feedback          │
│  - GET  /api/quiz                     │   └─────────────────────────────┘
└───────────────────┬───────────────────┘
                    │
           Resilient Fallbacks
        (Lite ⇄ Mid ⇄ High Chain)
                    │
                    ▼
┌───────────────────────────────────────┐
│           Google Gemini AI            │
│  - gemini-3.5-flash-lite  (Analyze)   │
│  - gemini-3.6-flash       (Medium)    │
│  - gemini-3.7-flash       (High/Deep) │
└───────────────────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | **React 19** | Latest React features, concurrent rendering, hooks |
| **Language** | **TypeScript 5** | Strict type-safety across client and edge workers |
| **Styling** | **Tailwind CSS v4** | Ultra-fast CSS engine with theme variables |
| **Animations** | **Framer Motion** | Smooth micro-animations and screen transitions |
| **PWA** | **vite-plugin-pwa & Workbox** | Offline caching, install manifest, service worker |
| **Build Tool** | **Vite 8** | Unified bundle pipeline for client and Cloudflare worker |
| **Edge Backend** | **Cloudflare Workers** | Sub-millisecond serverless execution at the edge |
| **AI Engine** | **Google Gemini Models** | `gemini-3.5-flash-lite`, `3.6-flash`, and `3.7-flash` |
| **Database & Auth** | **Firebase Firestore & Auth** | Google OAuth, persistent cloud history, feedback store |

---

## 📁 Project Structure

```
PromptWise/
├── public/
│   ├── Icon.png             # Official Transparent Brand Logo
│   ├── favicon.png          # App Favicon (64x64)
│   ├── pwa-192.png          # PWA Android/Desktop Icon (192x192)
│   └── pwa-512.png          # PWA Android/Desktop Icon (512x512)
├── src/
│   ├── components/
│   │   ├── improve/         # PromptInput, QuestionCard, BeforeAfter, ScoreDisplay, FeedbackWidget
│   │   ├── layout/          # Navbar, Footer, MobileNav, ScrollToTop
│   │   └── ui/              # Button, Spinner, ThemeToggle
│   ├── contexts/            # AuthContext, ThemeContext
│   ├── lib/
│   │   ├── api.ts           # Client API for Cloudflare Worker & Gemini
│   │   ├── auth.ts          # Google OAuth & Sign-in helpers
│   │   ├── db.ts            # Firestore operations (prompts, feedback, history)
│   │   ├── firebase.ts      # Firebase configuration & initialization
│   │   └── validation.ts    # Conservative local garbage check (0 API calls)
│   ├── pages/               # Home, Improve, Learn, Examples, Practice, Quiz, Admin, Dashboard
│   ├── types/               # TypeScript models & API interfaces
│   ├── App.tsx              # Application routing & layout tree
│   └── main.tsx             # React root mount point
├── worker/
│   └── index.ts             # Cloudflare Worker API (Analyze, Improve, Quiz)
├── .dev.vars                # Local development environment secrets (Gemini API Key)
├── wrangler.jsonc           # Cloudflare Worker deployment configuration
├── vite.config.ts           # Unified Vite + Cloudflare + PWA build configuration
└── package.json             # Root dependencies & build scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)
- A **Firebase Project** with Firestore and Google Authentication enabled

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/PromptWise.git
cd PromptWise

# Install all dependencies (root, worker, and PWA plugins)
npm install
```

### 2. Configure Environment Variables

#### Frontend Configuration (`.env.local`)
Create `.env.local` in the project root:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Cloudflare Worker Secrets (`.dev.vars`)
Create `.dev.vars` in the root directory for local worker development:
```env
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
This compiles:
1. `dist/promptwise/index.js` — Cloudflare Worker API bundle.
2. `dist/client/` — Client web application with PWA service worker and precached assets.

---

## 🌐 Deployment to Cloudflare

PromptWise runs entirely on **Cloudflare Workers & Pages**:

### Deploy with Wrangler:
```bash
# 1. Set production secret in Cloudflare
npx wrangler secret put GEMINI_API_KEY

# 2. Deploy worker and client assets
npx wrangler deploy
```

Your app will be live at:
`https://promptwise.<your-subdomain>.workers.dev/`

---

## 🔒 Security & Academic Ethics

- **Zero-Storage by Default**: Prompts are only saved if a logged-in user chooses to store them in their personal dashboard.
- **Client & Server Isolation**: API keys are securely held inside Cloudflare Worker environment secrets and never exposed to the client.
- **Privacy First**: The admin panel exposes strictly user feedback and prompt context for model improvement, completely hiding personal user profiles and quiz metrics.

---

## 📄 License & Credits

Developed with ❤️ by **Naseem Khan** for students, educators, and creators worldwide.  
Released under the [MIT License](LICENSE).