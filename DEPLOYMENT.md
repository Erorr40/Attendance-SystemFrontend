# Frontend Deployment Guide (Standalone Host)

This `frontend/` folder is **100% self-contained** and can be deployed independently to any static or SPA cloud hosting platform (such as [Vercel](https://vercel.com), [Netlify](https://netlify.com), [Cloudflare Pages](https://pages.cloudflare.com), [Firebase Hosting](https://firebase.google.com), or [AWS S3 + CloudFront](https://aws.amazon.com/s3/)).

---

## 📁 Files Included in `frontend/`
```
frontend/
├── assets/             # Brand logos & static assets
├── components/         # All modular UI components (Attendance, Teachers, Modals, Toast, etc.)
├── services/           # Authenticated API client (api.ts)
├── types/              # Frontend TypeScript interfaces
├── .env.example        # Production environment template
├── .env                # Local development environment
├── index.html          # HTML entry point
├── main.tsx            # React application bootstrap
├── App.tsx             # Root application component & routing
├── index.css           # Tailwind CSS styles & animations
├── package.json        # Dependencies & build scripts
├── tsconfig.json       # TypeScript configuration
├── vite-env.d.ts       # Vite environment & asset declarations
└── vite.config.ts      # Vite configuration & plugins
```

---

## ⚙️ Required Environment Variables on Your Host

Configure this environment variable in your frontend hosting dashboard:

| Variable | Description | Example Production Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Full URL to your hosted backend API | `https://your-backend-api.onrender.com/api` |

---

## 🚀 Deployment Steps (Example: Vercel / Netlify / Cloudflare Pages)

1. **Upload / Connect Repository**: Point your frontend service to the `frontend/` directory (or push only this folder to your frontend Git repository).
2. **Framework Preset**: `Vite`
3. **Build Command**:
   ```bash
   npm run build
   ```
4. **Output Directory**:
   ```bash
   dist
   ```
5. **Single Page Application (SPA) Routing**:
   Ensure fallback redirects route `/*` to `/index.html` (Vercel and Netlify handle this automatically with Vite preset).
