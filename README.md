# Carlton AFLW Performance Reconditioning

Performance testing dashboard for Carlton AFLW reconditioning programs.

## Features

- **Multi-athlete tracking** — add athletes, switch between them
- **Toggleable test library** — enable/disable 40+ tests across 7 categories
- **Custom test creation** — add new tests and categories on the fly
- **Bilateral L/R tracking** — LSI calculations, asymmetry detection
- **Jump profiling quadrants** — Neuromuscular, CMJ Strategy, SSC charts
- **ISO joint profiling** — Knee & Ankle peak force vs RFD quadrants
- **Asymmetry dashboard** — Flag / Monitor / Normal status bars
- **Athlete profile radar** — Strength, Power, Reactive, Jump, Symmetry
- **Session history** — edit or delete past sessions
- **PB tracking & change deltas** — arrows showing improvement from previous session

## Deploy to Vercel (Recommended)

### Option A: Via GitHub

1. Create a new GitHub repo and push this folder:
   ```bash
   cd carlton-recon
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/carlton-recon.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up / log in
3. Click **"Add New Project"**
4. Import your GitHub repo
5. Click **Deploy** — Vercel auto-detects Next.js
6. Your app will be live at `carlton-recon.vercel.app` (or custom domain)

### Option B: Via Vercel CLI

```bash
npm install -g vercel
cd carlton-recon
npm install
vercel
```

Follow the prompts and your app will be deployed.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Storage

Data is stored in the browser's localStorage. Each browser/device maintains its own data.
For shared/synced data across devices, a database backend (e.g. Firebase, Supabase) would need to be added.

## Tech Stack

- Next.js 14 (React)
- Recharts (charting)
- localStorage (persistence)
