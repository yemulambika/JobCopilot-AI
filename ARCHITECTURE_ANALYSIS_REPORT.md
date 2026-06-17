# 🏗️ AI Resume Matcher — Architecture Analysis & Migration Report

**Generated:** June 14, 2026  
**Analyst:** Cline (Senior Software Architect)  
**Project:** AI_Resume_Maker → Jobright-like AI Career Assistant Migration  
**Status:** READ-ONLY ANALYSIS — No code modifications made

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete Codebase Inventory](#2-complete-codebase-inventory)
3. [Current Architecture](#3-current-architecture)
4. [Technology Stack](#4-technology-stack)
5. [ATS Score Implementation](#5-ats-score-implementation)
6. [Resume Parsing Logic](#6-resume-parsing-logic)
7. [Database Schema](#7-database-schema)
8. [Reusable Modules](#8-reusable-modules)
9. [Current Limitations & Gaps](#9-current-limitations--gaps)
10. [Jobright Feature Gap Analysis](#10-jobright-feature-gap-analysis)
11. [Migration Plan](#11-migration-plan)
12. [Recommended Architecture (Target State)](#12-recommended-architecture-target-state)
13. [Implementation Roadmap](#13-implementation-roadmap)

---

## 1. Executive Summary

The current project is a **minimal, single-page MERN application** that performs resume-JD skill matching. It has:

- **2 API endpoints** (`/upload` and `/match`)
- **1 page** (Home with upload form)
- **No database** (stateless, no persistence)
- **No authentication**
- **Basic keyword-based ATS scoring** (string matching against ~50 hardcoded skills)
- **Unused semantic AI module** (`aiMatcher.js` is defined but NOT imported/called in `index.js`)
- **No routing** on the client side

The transformation to a Jobright-like AI career assistant requires a **complete architectural overhaul** — moving from a single-page tool to a multi-feature platform with user accounts, AI-powered resume optimization, job matching, interview coaching, and analytics.

---

## 2. Complete Codebase Inventory

### File Tree
```
Ai-Resume-Maker/
├── README.md                          # Project documentation
├── client/                            # Frontend (React + Vite)
│   ├── .gitignore
│   ├── eslint.config.js               # ESLint configuration
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Client dependencies
│   ├── package-lock.json
│   ├── postcss.config.js              # PostCSS config (for Tailwind)
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── vite.config.js                 # Vite build configuration
│   ├── public/                        # Static assets (empty or minimal)
│   └── src/
│       ├── main.jsx                   # React entry point (10 lines)
│       ├── App.jsx                    # Root component (11 lines)
│       ├── App.css                    # Global CSS (likely empty/minimal)
│       ├── index.css                  # Tailwind directives only (3 lines)
│       ├── assets/
│       │   ├── hero.png
│       │   ├── react.svg
│       │   └── vite.svg
│       ├── components/
│       │   ├── Loader.jsx             # Spinner component (9 lines)
│       │   ├── Navbar.jsx             # Header bar (15 lines)
│       │   ├── ResultCard.jsx         # Results display (142 lines)
│       │   └── UploadSection.jsx      # Main upload + analyze UI (117 lines)
│       └── pages/
│           └── Home.jsx               # Single page (17 lines)
│
└── server/                            # Backend (Node.js + Express)
    ├── .gitignore
    ├── index.js                       # Main server + all routes (206 lines)
    ├── aiMatcher.js                   # Semantic similarity module (41 lines)
    ├── skills.js                      # Skills database (53 lines)
    ├── package.json                   # Server dependencies
    ├── package-lock.json
    └── uploads/                       # Temp upload directory
```

### Lines of Code Summary
| File | Lines | Purpose |
|------|-------|---------|
| `server/index.js` | 206 | All server logic: routes, PDF parsing, scoring, explanations |
| `server/aiMatcher.js` | 41 | Semantic embedding-based scoring (UNUSED) |
| `server/skills.js` | 53 | Static skills array |
| `client/src/components/UploadSection.jsx` | 117 | Main UI: upload + JD input |
| `client/src/components/ResultCard.jsx` | 142 | Result display with score, skills, analysis |
| `client/src/components/Navbar.jsx` | 15 | App header |
| `client/src/components/Loader.jsx` | 9 | Loading spinner |
| `client/src/pages/Home.jsx` | 17 | Home page layout |
| `client/src/App.jsx` | 11 | Root component |
| **TOTAL** | **~611** | Very small codebase |

---

## 3. Current Architecture

### Architecture Pattern: **Monolithic Single-Page Tool**

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (React)                │
│                                                 │
│  App.jsx → Home.jsx → Navbar + UploadSection    │
│                              │                  │
│                    ┌─────────┴─────────┐        │
│                    │  Upload File (PDF) │        │
│                    │  Paste JD Text     │        │
│                    │  Click "Analyze"   │        │
│                    └─────────┬─────────┘        │
│                              │                  │
│               ┌──────────────┴──────────┐       │
│               │  POST /upload (FormData) │       │
│               │  POST /match (JSON)      │       │
│               └──────────────┬──────────┘       │
└──────────────────────────────┼──────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────┐
│                SERVER (Express)                  │
│                                                  │
│  POST /upload → PDF parse → extract text → return│
│  POST /match  → skill match → score → return     │
│                                                  │
│  Modules:                                        │
│  ├── skills.js (static array)                    │
│  └── aiMatcher.js (NOT IMPORTED/USED)            │
│                                                  │
│  No database │ No auth │ No sessions             │
└──────────────────────────────────────────────────┘
```

### Key Architectural Observations

1. **No Client-Side Routing:** Single `Home.jsx` page only, no `react-router-dom`
2. **No State Management:** Local `useState` only, no Redux/Zustand/Context
3. **No Database:** Zero persistence — results are ephemeral
4. **No Authentication:** No user accounts, no JWT, no sessions
5. **Monolithic Backend:** All logic (routes, parsing, scoring, explanations) in one `index.js` file
6. **Dead Code:** `aiMatcher.js` is never imported in `index.js` — semantic scoring is not active
7. **Two-Step Client Flow:** Upload PDF → get text → send text + JD for matching (two sequential API calls)

---

## 4. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.6 | UI library |
| Vite | 8.0.12 | Build tool / dev server |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| Axios | 1.16.0 | HTTP client |
| PostCSS | 8.5.14 | CSS processing (Tailwind) |
| Autoprefixer | 10.5.0 | CSS vendor prefixes |
| ESLint | 10.3.0 | Code linting |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | (system) | Runtime |
| Express | 5.2.1 | HTTP framework |
| Multer | 2.1.1 | File upload handling |
| pdfjs-dist | 3.4.120 | PDF text extraction |
| pdf-parse | 2.4.5 | PDF parsing (installed but unused in code) |
| @xenova/transformers | 2.17.2 | Local ML embeddings (imported in aiMatcher.js but NOT used) |
| CORS | 2.8.6 | Cross-origin support |

### Notable Observations
- **`pdf-parse` is installed but never imported** — only `pdfjs-dist` is used for PDF extraction
- **`@xenova/transformers` is installed and defined** in `aiMatcher.js` but **never imported or called** from `index.js`
- **No MongoDB client** is installed or configured despite README claiming MongoDB support
- **No environment variable management** (no `.env` file, no `dotenv`)
- `VITE_API_URL` is used on the client but no `.env` file exists in the repo

---

## 5. ATS Score Implementation

### Current Implementation Location
- **File:** `server/index.js`, lines 121-167 (`getScore` function)
- **Scoring endpoint:** `POST /match` (lines 168-201)

### Scoring Algorithm (Detailed)

```
ALGORITHM: Keyword-Based Skill Matching

1. Normalize both resume text and JD text:
   - Convert to lowercase
   - Replace .js extensions (react.js→react, node.js→node, express.js→express)
   - Remove non-alphanumeric characters (keep spaces)

2. Extract JD skills:
   - Filter skillsDatabase (50 hardcoded skills) against normalized JD text
   - Result: list of skills mentioned in JD

3. Extract Resume skills:
   - Filter skillsDatabase against normalized resume text
   - Result: list of skills found in resume

4. Calculate matches:
   - matched = JD skills ∩ Resume skills (intersection)
   - missing = JD skills - Resume skills (difference)

5. Calculate score:
   - score = (matched.length / jdSkills.length) × 100
   - Rounded to nearest integer

6. "Final score" calculation (BUG):
   - semanticScore = result.score (same value — redundant!)
   - finalScore = (result.score + semanticScore) / 2 = result.score (no change)
   - This is dead code leftover from when semantic scoring was planned
```

### Score Thresholds & Response
| Score Range | Label | Badge | Explanation |
|-------------|-------|-------|-------------|
| ≥ 80% | "Excellent Match" | Green "Recommended" | Strong candidate profile |
| 60-79% | "Good Match" | — | — |
| 50-79% | "Moderate Match" | Yellow "Consider" | Moderate alignment |
| < 50% | "Low Match" | Red "Not Recommended" | Low compatibility |

### Issues with Current ATS Implementation

1. **No real ATS logic:** True ATS systems parse sections (experience, education, skills, certifications), weight them differently, and use industry-standard criteria. This is pure string matching.
2. **Keyword matching is naive:** Uses `String.includes()` — no fuzzy matching, no stemming, no synonym handling.
3. **Fixed skill list:** Only 50 hardcoded skills. No dynamic skill extraction.
4. **Equal weight for all skills:** "react" and "problem solving" have the same weight.
5. **No section awareness:** Cannot distinguish between skills listed in a skills section vs. mentioned incidentally in text.
6. **No experience/education parsing:** Does not extract work history, education, certifications.
7. **Semantic scoring is dead code:** `aiMatcher.js` exists but is never used.
8. **Score averaging bug:** Lines 175-179 compute `finalScore` by averaging `result.score` with itself.

---

## 6. Resume Parsing Logic

### Current Implementation
- **File:** `server/index.js`, lines 47-67 (`extractPdfText` function)
- **Endpoint:** `POST /upload` (lines 68-82)

### Parsing Flow
```
1. Receive PDF file via multer (temp storage in /uploads/)
2. Read file into Uint8Array buffer
3. Parse with pdfjs-dist:
   - Iterate all pages
   - Extract text content items (item.str)
   - Join with spaces
4. Return raw text string to client
5. Delete temp file from disk
```

### Limitations
| Limitation | Impact |
|------------|--------|
| **PDF-only** | No DOCX, TXT, RTF, or URL parsing |
| **No structured extraction** | Returns raw text blob — no sections identified |
| **No contact info extraction** | Cannot parse name, email, phone, LinkedIn |
| **No education parsing** | Cannot identify degrees, institutions, dates |
| **No experience parsing** | Cannot identify job titles, companies, durations |
| **No skills section detection** | Skills are found by substring search in entire text |
| **No multi-language support** | Only English text extraction |
| **No OCR** | Cannot handle scanned/image-based PDFs |
| **No format preservation** | Loses all document structure |

---

## 7. Database Schema

### Current State: **NO DATABASE**

```
┌──────────────────────────────────────────┐
│           DATABASE: NONE                 │
│                                          │
│  • No MongoDB installed or configured    │
│  • No mongoose/monodb driver             │
│  • No .env file with connection strings  │
│  • No models, schemas, or migrations     │
│  • README mentions MongoDB but it's      │
│    not actually in the codebase          │
│                                          │
│  All data is STATELESS and EPHEMERAL:    │
│  • Resume text: extracted → sent → lost  │
│  • Match results: calculated → sent → lost│
│  • No user accounts                      │
│  • No history                            │
│  • No saved analyses                     │
└──────────────────────────────────────────┘
```

---

## 8. Reusable Modules

### Modules That Can Be Reused

| Module | File | Reusability | Notes |
|--------|------|-------------|-------|
| `extractPdfText()` | `server/index.js` | ✅ **High** | Core PDF parsing — works well, can be extracted as utility |
| `normalizeText()` | `server/index.js` | ✅ **High** | Text normalization — useful for any NLP pipeline |
| `getScore()` | `server/index.js` | ⚠️ **Medium** | Skill matching logic — needs major upgrade but core concept reusable |
| `generateExplanation()` | `server/index.js` | ⚠️ **Medium** | Rule-based explanation — can be enhanced with LLM |
| `generateSuggestions()` | `server/index.js` | ⚠️ **Medium** | Simple suggestion generation — can be enhanced with LLM |
| `cosineSimilarity()` | `server/aiMatcher.js` | ✅ **High** | Math utility — universally reusable for embeddings |
| `loadModel()` / `getSemanticScore()` | `server/aiMatcher.js` | ✅ **High** | Semantic scoring — should be activated and expanded |
| `skillsDatabase` | `server/skills.js` | ⚠️ **Medium** | Static list — useful as seed data but needs dynamic expansion |
| `Loader` | `client/src/components/Loader.jsx` | ✅ **High** | Generic spinner — reusable anywhere |
| `Navbar` | `client/src/components/Navbar.jsx` | ⚠️ **Medium** | Needs redesign for multi-page app but concept reusable |
| `ResultCard` | `client/src/components/ResultCard.jsx` | ⚠️ **Medium** | Score display + skill lists — can be decomposed into smaller widgets |
| Tailwind theme | `client/tailwind.config.js` | ✅ **High** | Dark theme design system — extend for new pages |

### Client-Side Component Architecture (Current)
```
App.jsx
└── Home.jsx
    ├── Navbar.jsx          (static header)
    └── UploadSection.jsx   (file upload + JD textarea + analyze button)
        ├── Loader.jsx      (conditional spinner)
        └── ResultCard.jsx  (conditional results display)
```

---

## 9. Current Limitations & Gaps

### Critical Gaps
| Gap | Severity | Impact |
|-----|----------|--------|
| No database/persistence | 🔴 Critical | Cannot save users, resumes, analyses, history |
| No authentication | 🔴 Critical | Cannot personalize experience, track progress |
| No client routing | 🔴 Critical | Single page only — cannot add features |
| No state management | 🟡 High | Complex features will need shared state |
| No API abstraction | 🟡 High | Direct axios calls, no centralized API layer |
| No error boundaries | 🟡 High | App crashes on unhandled errors |
| No form validation | 🟡 High | User can submit empty forms |
| No tests | 🟡 High | No unit, integration, or E2E tests |
| No environment config | 🟡 High | Hardcoded URLs, no `.env` setup |
| No logging/monitoring | 🟡 High | Console.log only |
| No rate limiting | 🟠 Medium | API is vulnerable to abuse |
| No input sanitization | 🟠 Medium | Potential XSS/injection risks |
| No file size limits | 🟠 Medium | Large files could crash server |
| No TypeScript | 🟠 Medium | No type safety |

### Architecture Gaps vs. Jobright
| Jobright Feature | Current State | Gap |
|------------------|---------------|-----|
| User accounts & profiles | ❌ None | Complete rebuild needed |
| Resume upload & management | ⚠️ Basic PDF text extraction | Need structured parsing, multiple formats, versioning |
| AI resume scoring | ⚠️ Basic keyword matching | Need semantic analysis, section-aware scoring |
| Job matching & recommendations | ❌ None | Complete build needed |
| Resume optimization/suggestions | ⚠️ Basic missing skills list | Need AI-powered rewrite suggestions |
| Cover letter generation | ❌ None | Complete build needed |
| Interview preparation | ❌ None | Complete build needed |
| Job search/integration | ❌ None | Complete build needed |
| Analytics dashboard | ❌ None | Complete build needed |
| Recruiter mode | ❌ None | Complete build needed |
| Email notifications | ❌ None | Complete build needed |
| Subscription/billing | ❌ None | Complete build needed |

---

## 10. Jobright Feature Gap Analysis

### What Jobright Offers vs. Current Project

| Feature | Jobright | Current | Priority |
|---------|----------|---------|----------|
| **User Registration/Login** | ✅ OAuth + Email | ❌ None | P0 |
| **Resume Upload (PDF/DOCX)** | ✅ Multiple formats | ⚠️ PDF only | P0 |
| **Resume Parsing (Structured)** | ✅ Sections, skills, experience | ❌ Raw text only | P0 |
| **AI Resume Scoring** | ✅ Multi-factor analysis | ⚠️ Skill keyword match only | P0 |
| **Job Description Matching** | ✅ Semantic + keyword | ⚠️ Keyword only | P0 |
| **AI Resume Rewriting** | ✅ Line-by-line suggestions | ❌ None | P1 |
| **Cover Letter Generation** | ✅ AI-generated | ❌ None | P1 |
| **Job Search Integration** | ✅ Aggregated listings | ❌ None | P1 |
| **Personalized Job Recommendations** | ✅ AI matching | ❌ None | P1 |
| **Interview Q&A Preparation** | ✅ AI mock interviews | ❌ None | P2 |
| **Resume Templates** | ✅ Multiple templates | ❌ None | P2 |
| **Analytics/Dashboard** | ✅ Application tracking | ❌ None | P2 |
| **Team/Recruiter Features** | ✅ Multi-user | ❌ None | P3 |
| **Subscription/Pricing** | ✅ Freemium model | ❌ None | P3 |
| **Browser Extension** | ✅ Auto-apply | ❌ None | P3 |

---

## 11. Migration Plan

### Phase 0: Foundation (Weeks 1-3)
**Goal:** Solidify architecture, add database, auth, and proper project structure

#### 0.1 Project Restructuring
- Add monorepo tooling (Turborepo or Nx)
- Add TypeScript to both client and server
- Set up proper `.env` configuration (dotenv / Vite env)
- Add ESLint + Prettier shared config
- Set up CI/CD pipeline (GitHub Actions)
- Add Docker support for local development

#### 0.2 Database Setup
- Install MongoDB + Mongoose (or switch to PostgreSQL with Prisma)
- Design and implement core schemas:
  - `User` (auth, profile, preferences)
  - `Resume` (parsed data, versions, file references)
  - `JobDescription` (parsed requirements, company info)
  - `Analysis` (score history, matched/missing skills, timestamps)
  - `SavedJob` (bookmarked opportunities)
- Set up database indexes for performance

#### 0.3 Authentication & Authorization
- Add JWT-based authentication (or NextAuth.js if migrating to Next.js)
- Implement registration, login, password reset
- Add OAuth providers (Google, LinkedIn)
- Create middleware for route protection
- Add role-based access control (user, recruiter, admin)

#### 0.4 Client-Side Architecture
- Add `react-router-dom` for client-side routing
- Add state management (Zustand recommended for simplicity)
- Create API service layer (centralized axios instance with interceptors)
- Add error boundaries
- Create reusable UI component library (shadcn/ui recommended)

### Phase 1: Enhanced Resume Intelligence (Weeks 4-7)
**Goal:** Transform basic PDF extraction into structured resume intelligence

#### 1.1 Advanced Resume Parser
- Support PDF + DOCX + TXT formats
- Build section detection (header, summary, experience, education, skills, certifications, projects)
- Extract structured data:
  - Contact information (name, email, phone, LinkedIn, GitHub)
  - Work experience (company, title, dates, descriptions)
  - Education (institution, degree, dates, GPA)
  - Skills (technical, soft, tools — categorized)
  - Certifications
  - Projects
- Use libraries: `mammoth` (DOCX), `textract`, or `pdf2json`
- Consider using an existing parser like `rapido-resume` or build custom

#### 1.2 Enhanced ATS Scoring Engine
- Keep keyword matching but enhance with:
  - Fuzzy string matching (Levenshtein distance)
  - Synonym detection (e.g., "ML" = "machine learning")
  - Skill categorization and weighting
  - Section-aware scoring (skills in skills section vs. mentioned in body)
- Integrate `aiMatcher.js` (activate semantic scoring with `@xenova/transformers`)
- Add multi-factor scoring:
  - Skills match (30%)
  - Experience relevance (25%)
  - Education match (15%)
  - Semantic similarity (20%)
  - Keyword density (10%)
- Generate detailed scoring breakdown

#### 1.3 Resume Storage & Management
- Save parsed resume data to database
- Support multiple resume versions
- Resume comparison (before/after optimization)
- Resume PDF generation from structured data

### Phase 2: AI-Powered Features (Weeks 8-12)
**Goal:** Add LLM-powered intelligence for resume optimization

#### 2.1 AI Resume Analysis
- Integrate OpenAI GPT-4 / Claude API for:
  - Section-by-section feedback
  - Impact statement optimization ("led a team of 5" → "Led cross-functional team of 5 engineers, reducing deployment time by 40%")
  - Keyword optimization for ATS
  - Industry-specific recommendations
  - Tone and readability analysis

#### 2.2 AI Resume Rewriting
- Line-by-line rewrite suggestions
- Bullet point enhancement
- Action verb optimization
- Quantification suggestions
- Before/after diff view

#### 2.3 Cover Letter Generation
- AI-generated cover letters based on:
  - Resume content
  - Target job description
  - Company research
  - User preferences
- Multiple tone options (professional, enthusiastic, etc.)
- Template-based + free-form generation

#### 2.4 Job Matching & Recommendations
- Build job description ingestion pipeline
- Semantic matching between resume and job requirements
- Personalized job recommendations based on:
  - Skills match
  - Experience level
  - Location preferences
  - Salary expectations
  - Industry preferences
- Integration with job APIs (LinkedIn, Indeed, Glassdoor, Adzuna)

### Phase 3: Platform Features (Weeks 13-18)
**Goal:** Build the complete platform experience

#### 3.1 Job Search & Tracking
- Job search aggregator (multiple job board APIs)
- Save/bookmark jobs
- Application tracking dashboard
- Status management (applied, interviewed, offered, rejected)

#### 3.2 Interview Preparation
- AI-generated interview questions based on:
  - Job description
  - Resume content
  - Industry/company
- Mock interview mode (AI interviewer)
- STAR method response builder
- Common questions database

#### 3.3 Analytics Dashboard
- Resume view analytics
- Application success rates
- Skills demand trends
- Resume score history
- Improvement tracking over time

#### 3.4 User Dashboard
- Personalized home feed
- Upcoming tasks/reminders
- Resume health score
- Job market insights
- Career path suggestions

### Phase 4: Advanced Features (Weeks 19-24)
**Goal:** Differentiation and monetization

#### 4.1 Recruiter Mode
- Multi-resume batch analysis
- Candidate comparison
- Custom scoring criteria
- Team collaboration features
- Candidate pipeline management

#### 4.2 Subscription & Billing
- Stripe integration
- Free tier (limited analyses)
- Pro tier (unlimited + AI features)
- Enterprise tier (team features + API access)

#### 4.3 Additional Features
- Browser extension for auto-filling applications
- LinkedIn profile import
- Email notifications and digests
- Multi-language support
- Accessibility improvements (WCAG 2.1)

---

## 12. Recommended Architecture (Target State)

### Target Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Auth    │ │ Dashboard│ │ Resume   │ │   Jobs   │      │
│  │  Pages   │ │  Page    │ │ Builder  │ │ Explorer │      │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘      │
│       │            │            │            │              │
│  ┌────┴────────────┴────────────┴────────────┴────┐        │
│  │              State Management (Zustand)         │        │
│  └────────────────────┬───────────────────────────┘        │
│                       │                                     │
│  ┌────────────────────┴───────────────────────────┐        │
│  │           API Service Layer (Axios)             │        │
│  └────────────────────┬───────────────────────────┘        │
└───────────────────────┼─────────────────────────────────────┘
                        │ HTTPS / REST + WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (Express)                      │
│                                                             │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Auth   │ │  Resume  │ │  AI/ML   │ │   Jobs   │       │
│  │ Routes  │ │  Routes  │ │  Routes  │ │  Routes  │       │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │           │            │            │               │
│  ┌────┴───────────┴────────────┴────────────┴────┐         │
│  │            Middleware Layer                     │         │
│  │  Auth │ Rate Limit │ Validation │ Logging      │         │
│  └────────────────────┬──────────────────────────┘         │
└───────────────────────┼─────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────────┐
         ▼              ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│   MongoDB    │ │  AI Services │ │   External APIs  │
│              │ │              │ │                  │
│ • Users      │ │ • OpenAI     │ │ • LinkedIn       │
│ • Resumes    │ │ • Xenova     │ │ • Indeed         │
│ • Jobs       │ │   (local)    │ │ • Glassdoor      │
│ • Analyses   │ │ • Custom     │ │ • Stripe         │
│ • Subs       │ │   Embeddings │ │                  │
└──────────────┘ └──────────────┘ └──────────────────┘
```

### Target Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 19 + Vite + TypeScript | Already in use, add TS |
| **UI Library** | shadcn/ui + Tailwind CSS | Consistent, accessible components |
| **State** | Zustand | Lightweight, simple |
| **Routing** | React Router v7 | Industry standard |
| **Backend** | Node.js + Express 5 | Already in use |
| **Database** | MongoDB + Mongoose | Document DB fits resume data |
| **ORM/Schema** | Mongoose | Schema validation |
| **Auth** | JWT + Passport.js | Flexible auth |
| **AI/LLM** | OpenAI API + local Xenova | Hybrid cloud/local |
| **PDF Parsing** | pdfjs-dist + mammoth | Multi-format support |
| **Job APIs** | Adzuna/Jooble API | Job aggregation |
| **Payments** | Stripe | Industry standard |
| **File Storage** | AWS S3 / Cloudflare R2 | Resume file storage |
| **Email** | Resend / SendGrid | Notifications |
| **Caching** | Redis | Session + data caching |
| **Testing** | Vitest + Playwright | Unit + E2E tests |
| **CI/CD** | GitHub Actions | Automation |
| **Monitoring** | Sentry + Pino | Error tracking + logging |
| **Deployment** | Vercel (FE) + Railway/Render (BE) | Cost-effective |

---

## 13. Implementation Roadmap

### Gantt-Style Summary

```
PHASE 0: Foundation           ████████████░░░░░░░░░░░░░░░░░░  Weeks 1-3
PHASE 1: Resume Intelligence  ░░░░░░░░░░░░████████████░░░░░░  Weeks 4-7
PHASE 2: AI Features          ░░░░░░░░░░░░░░░░░░░░██████████  Weeks 8-12
PHASE 3: Platform Features    ░░░░░░░░░░░░░░░░░░░░░░░░██████  Weeks 13-18
PHASE 4: Advanced Features    ░░░░░░░░░░░░░░░░░░░░░░░░░░░███  Weeks 19-24
```

### Priority Matrix

| Feature | Effort | Impact | Priority | Phase |
|---------|--------|--------|----------|-------|
| Database + Auth | Medium | Critical | P0 | 0 |
| Project restructuring | Low | High | P0 | 0 |
| Structured resume parser | High | Critical | P0 | 1 |
| Enhanced ATS scoring | Medium | Critical | P0 | 1 |
| AI resume analysis (LLM) | High | Very High | P1 | 2 |
| Job matching engine | High | Very High | P1 | 2 |
| Cover letter generation | Medium | High | P1 | 2 |
| Job search integration | High | High | P1 | 2 |
| Interview preparation | Medium | Medium | P2 | 3 |
| Analytics dashboard | Medium | Medium | P2 | 3 |
| Recruiter mode | High | Medium | P3 | 4 |
| Subscription/billing | Medium | Medium | P3 | 4 |

### Quick Wins (Keep from Current Codebase)
1. ✅ **Dark theme design** — Tailwind dark mode is already in place
2. ✅ **PDF text extraction** — `extractPdfText()` works and is solid
3. ✅ **Semantic scoring module** — `aiMatcher.js` just needs to be activated
4. ✅ **Text normalization** — `normalizeText()` is a good utility
5. ✅ **Skills seed data** — `skillsDatabase` is a good starting point
6. ✅ **Score visualization** — `ResultCard.jsx` score bar and badges work well

### Dependencies to Add (Phase 0)
```
# Server
mongoose          # MongoDB ODM
dotenv            # Environment variables
bcryptjs          # Password hashing
jsonwebtoken      # JWT tokens
express-validator # Input validation
express-rate-limit # Rate limiting
helmet            # Security headers
pino              # Logging
mammoth           # DOCX parsing

# Client
react-router-dom  # Client routing
zustand           # State management
@tanstack/react-query  # Server state management
react-hook-form   # Form handling
zod               # Schema validation
@radix-ui/*       # Accessible primitives (via shadcn/ui)
lucide-react      # Icons
recharts          # Charts (for analytics)
```

### Dependencies to Remove
```
# Server
pdf-parse         # Installed but unused — remove to reduce dependencies
```

---

## 📌 Summary

The current project is a **well-scoped prototype** that demonstrates the core concept of resume-job matching. However, it is architecturally minimal (~611 lines of code, 2 API endpoints, no database, no auth) and requires a **complete overhaul** to become a Jobright-like platform.

**Key strengths to preserve:**
- Clean, working PDF parsing
- Semantic scoring infrastructure (activate `aiMatcher.js`)
- Modern frontend stack (React 19 + Vite + Tailwind)
- Simple, readable codebase

**Critical next steps:**
1. Add TypeScript, database, and authentication (Phase 0)
2. Build structured resume parsing (Phase 1)
3. Integrate LLM-powered analysis (Phase 2)
4. Build platform features incrementally (Phases 3-4)

**Estimated total effort:** 24 weeks (6 months) for a small team, or 36-48 weeks for a solo developer.

---

*This report is a READ-ONLY analysis. No code has been modified.*