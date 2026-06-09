# Campaign Website

## Blog & News Page

The page at `/pages/articles.html` now runs fully on hardcoded blog content with no paid CMS dependency.

### Current blog behavior

- `js/blogs.js` contains 10 mental wellness blog posts.
- Each card includes an image box at the top.
- Cards only show compact previews and use a **Read More** action.
- Full post content opens in a modal to save screen space.
- Search and category filters are available.

### UX and responsiveness

- Mobile-first spacing and typography adjustments for small screens.
- Card excerpts are clamped to keep the layout clean.
- Modal and controls are optimized for touch and narrow viewports.

### Run locally

Use the existing script:

```bash
./start-all.sh
```

## Q&A Server Architecture

- Runtime: Express + WebSocket server in `qa-server/server.js`.
- Persistence: Questions, moderation state, and participant records are stored in `qa-server/questions.json`.
- Moderation statuses: Every question has a `status` of `pending`, `approved`, or `flagged`.
- RBAC: JWT-based roles are enforced for `candidate` and `admin` users.
	- `candidate`: can monitor all comments, answer, and moderate status.
	- `admin`: full moderation permissions, including delete and user ban/unban.

## High Availability (PM2)

The Q&A server includes PM2 configuration in `qa-server/ecosystem.config.cjs`.

Run from `qa-server`:

```bash
npm install
npm run start:pm2
pm2 save
```

Useful commands:

```bash
npm run restart:pm2
npm run stop:pm2
npm run logs:pm2
```

## Role Authentication

Authentication endpoint:

- `POST /api/auth/login`

Default local credentials (change in production):

- `admin` / `MachAdmin@1039`
- `candidate` / `MaureenChat@2027$`

Production override:

- Set `JWT_SECRET`
- Set `CAMPAIGN_USERS_JSON` with username, passwordHash, role, and displayName entries.

## Form Email Routing

Volunteer form endpoint:

- `POST /api/forms/volunteer`
- Routed to:
	- `team@vote4maureen.co.ke`
	- `thayu@votemaureen4karen.co.ke`

Partner form endpoint:

- `POST /api/forms/partner`
- Routed to:
	- `partner@votemaureen4karen.co.ke`

SMTP environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `FORM_FROM`

If SMTP is not configured, submissions are still persisted to `qa-server/form-submissions.json` for manual follow-up.

## KickHost + Render Production Setup

Recommended architecture:

- Frontend static files on KickHost: `https://votemaureen4karen.co.ke`
- Backend realtime/API on Render (or equivalent Node host)

### Frontend production endpoints

Configured in `config.js`:

- API: `https://api.votemaureen4karen.co.ke/api`
- WebSocket: `wss://api.votemaureen4karen.co.ke`

If your `api` subdomain is not live yet, temporarily switch `config.js` to your Render domain values.

### Backend CORS and environment

Use `qa-server/.env.example` as your template.

Important variables:

- `CORS_ALLOWED_ORIGINS=https://votemaureen4karen.co.ke,https://www.votemaureen4karen.co.ke`
- `JWT_SECRET=<strong-random-secret>`
- SMTP settings for volunteer/partner email routing

### Quick production checks

1. Homepage loads on `https://votemaureen4karen.co.ke`
2. `https://api.votemaureen4karen.co.ke/health` returns status ok
3. Forum questions load/submit from frontend
4. Volunteer and partner forms submit successfully
5. Admin panel opens and authenticates
