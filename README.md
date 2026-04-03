# Gecko Pulse Dashboard

A real-time employee pulse dashboard for Gecko, built with Next.js and deployed on Vercel.

## What it does

- Reads weekly pulse responses from your Google Sheet in real-time
- Role-based views: Ruth/Matt/Neil see everything, Paul sees Engineering + Product, managers see their team only
- Everyone can see the overall company average for comparison
- Auto-refreshes every 5 minutes, with a manual refresh button
- Mobile-friendly — managers can check this on their phones

---

## Running locally

### Prerequisites
- Node.js 18+
- Your Google service account JSON key file

### 1. Install dependencies

```bash
cd gecko-pulse
npm install
```

### 2. Set up Google Sheets access

You need to give your service account permission to read the spreadsheet:

1. Open Google Sheets: `https://docs.google.com/spreadsheets/d/1n7-1OpeqCqPzLBh6WFXp2BdVTZcVCrbcw24gth2Stk0`
2. Click **Share**
3. Add your service account email (e.g. `gecko-pulse@your-project.iam.gserviceaccount.com`) with **Viewer** access
4. Click **Send**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
GOOGLE_CLIENT_EMAIL=gecko-pulse@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
```

**Where to find these values:** Open your service account JSON key file. Copy:
- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY` (the whole value, paste inside double quotes)

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the login screen.

---

## Deploying to Vercel

### First time

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, skip them — we'll add them in the Vercel dashboard.

### Set environment variables on Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Go to **Settings → Environment Variables**
3. Add:
   - `GOOGLE_CLIENT_EMAIL` — your service account email
   - `GOOGLE_PRIVATE_KEY` — the full private key (Vercel handles newlines correctly)
4. Redeploy: `vercel --prod`

### Subsequent deploys

```bash
vercel --prod
```

---

## Adjusting the role config

Open `src/lib/roleConfig.js` to:

- **Add/remove users** in the `USERS` array
- **Fix manager name matching** — the `managerName` field must exactly match what's in column I of your Google Sheet
- **Fix department names** — Paul's `departments` array must match column H exactly

The most common issue is capitalisation — e.g. "Customer Success" vs "customer success".

---

## Adjusting the company size

In `src/components/CompanyOverview.jsx`, update the `TOTAL_EMPLOYEES` constant (line 12) to match your headcount. This affects the response rate calculation.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Google API credentials not configured" | Create `.env.local` from the example file |
| "Permission denied (403)" | Share the Google Sheet with your service account email |
| "Invalid private key format" | Make sure `GOOGLE_PRIVATE_KEY` is wrapped in double quotes |
| Team data shows 0 responses | Check `managerName` in roleConfig.js matches column I exactly |
| Department breakdown is empty | Check department names in roleConfig.js match column H exactly |
| Scores look wrong | Verify column order in the sheet: A=Timestamp, B=Email, C=Name, D=WeekScore, E=Comment, F=RotatingScore, G=RotatingQuestion, H=Department, I=Manager |

---

## Tech stack

- **Next.js 14** (App Router) — React framework with built-in API routes
- **Tailwind CSS** — utility-first styling
- **Recharts** — area and bar charts
- **googleapis** — Google Sheets API client (server-side only)
- **Syne + DM Sans** — typography (loaded via `next/font`)
- **Vercel** — hosting

---

## Coming soon (planned)

- [ ] SSO / proper authentication (replacing the dropdown selector)
- [ ] Export to CSV
- [ ] Email digest / Slack notifications
- [ ] Dark/light mode toggle
