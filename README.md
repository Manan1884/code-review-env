---
title: Code Review Environment
emoji: 📝
colorFrom: green
colorTo: blue
sdk: docker
app_port: 3000
pinned: false
---

# OpenEnv - AI-Powered Code Review Environment

A production-grade implementation of the OpenEnv specification where AI agents review pull request diffs and perform structured review actions — flagging style issues, logic bugs, and security vulnerabilities.

## Tech Stack

- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS
- **Backend**: Node.js via Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose
- **Auth**: NextAuth.js
- **AI**: OpenAI GPT-4o

## Features

- **AI Agent Review**: GPT-4o analyzes code diffs and flags issues
- **Three Difficulty Levels**:
  - Easy: Style issues (missing semicolons, indentation, unused variables)
  - Medium: Logic bugs (off-by-one errors, wrong conditionals, null pointer risks)
  - Hard: Security vulnerabilities (SQL injection, XSS, hardcoded secrets)
- **Reward System**: Agents are scored against expert human labels
- **OpenEnv Loop**: Implements state/step/reset environment protocol
- **Leaderboard**: Track top-performing agent reviews
- **Admin Panel**: Set expert labels and task difficulty

## Environment Variables

Create `.env.local`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB Atlas**:
   - Create a cluster at [mongodb.com](https://mongodb.com)
   - Get your connection string
   - Add to `MONGODB_URI` in `.env.local`

3. **Set up OpenAI**:
   - Get API key from [platform.openai.com](https://platform.openai.com)
   - Add to `OPENAI_API_KEY` in `.env.local`

4. **Generate NextAuth Secret**:
   ```bash
   openssl rand -base64 32
   ```
   - Add to `NEXTAUTH_SECRET` in `.env.local`

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
/app
  /api                 # API routes
    /auth              # NextAuth & registration
    /prs               # Pull request CRUD
    /env               # OpenEnv state/step/reset
    /agent             # AI agent runner
    /reviews           # Review data
    /admin             # Admin endpoints
    /leaderboard       # Leaderboard data
  /page.tsx            # Landing page
  /submit              # PR submission form
  /review/[id]         # Live review page
  /prs                 # PR gallery
  /leaderboard         # Leaderboard
  /dashboard           # User dashboard
  /admin               # Admin panel
/components            # React components
/lib
  /mongodb.ts          # MongoDB connection
  /openai.ts           # OpenAI client
  /auth.ts             # Auth helpers
  /openenv             # OpenEnv implementation
    /state.ts
    /step.ts
    /reset.ts
    /reward.ts
/models                # Mongoose models
/types                 # TypeScript types
openenv.yaml           # OpenEnv spec
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth endpoints |
| GET | `/api/prs` | List all PRs |
| POST | `/api/prs` | Create new PR |
| GET | `/api/prs/[id]` | Get single PR |
| DELETE | `/api/prs/[id]` | Delete PR |
| GET | `/api/env/state/[prId]` | Get environment state |
| POST | `/api/env/step/[prId]` | Execute action |
| POST | `/api/env/reset/[prId]` | Reset environment |
| POST | `/api/agent/run/[prId]` | Run AI agent review |
| GET | `/api/reviews/[prId]` | Get review data |
| PATCH | `/api/admin/reviews/[prId]` | Update expert labels |
| GET | `/api/leaderboard` | Get leaderboard |

## Pages

- `/` - Landing page with stats and OpenEnv explanation
- `/submit` - Submit new pull request (auth required)
- `/review/[id]` - View diff and run AI review
- `/prs` - Browse all pull requests
- `/leaderboard` - Top agent scores
- `/dashboard` - User's PRs and stats
- `/admin` - Admin panel for expert labels

## Design System

- **Background**: `#0d0d0d`
- **Surface**: `#141414` with 1px border `#1f1f1f`
- **Primary**: `#00ff88` (electric green)
- **Style**: `#60a5fa` (blue)
- **Logic**: `#fbbf24` (yellow)
- **Security**: `#f87171` (red)
- **Fonts**: Syne (headings), JetBrains Mono (code)

## License

MIT
