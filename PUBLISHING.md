# Publishing & Portal Access Guide

This site has **two parts** that are deployed separately:

| Part | What it is | Where it lives |
| --- | --- | --- |
| **Frontend** (static site) | All the HTML/CSS/JS/images, the blog, **and both moderation portals** (`admin.html`, `maureen.html`) | **KickHost** → `https://votemaureen4karen.co.ke` |
| **Backend** (Q&A server) | The Node.js server that stores questions, handles logins, and sends form emails | **Render** → `https://maureen-campaign-qa.onrender.com` |

KickHost is a static host and **cannot run Node.js**, so the live Q&A/login server must stay on Render (or any Node host). The portals are plain HTML pages served from KickHost; they simply call the Render backend for data. Which backend they call is decided automatically by [`config.js`](config.js):

- On `localhost` / `127.0.0.1` → talks to `http://localhost:3001`
- On any real domain → talks to the production backend in `config.js`

---

## A. Run everything locally

From the project root:

```bash
./start-all.sh
```

This starts:
- the **website** on `http://localhost:8000`
- the **Q&A backend** on `http://localhost:3001`

Stop everything with:

```bash
./stop-all.sh
```

### Open the portals locally
- **Admin portal:** http://localhost:8000/admin.html
- **Maureen portal:** http://localhost:8000/maureen.html
- Or use the launcher page: http://localhost:8000/pages/admin.html

Sign in with the credentials in section **D**.

---

## B. Publish the FRONTEND to KickHost

1. Log in to KickHost → **File Manager** (or connect via FTP).
2. Go to the site's web root (usually `public_html/`).
3. Upload the **whole project folder contents EXCEPT the `qa-server/` folder** (the backend does not run on KickHost). At minimum upload:
   - `index.html`, `admin.html`, `maureen.html`, `config.js`
   - `pages/`, `css/`, `js/`, `assets/`, `images/`, `data/`, `pdf/`
4. Make sure `config.js` and `admin.html` sit at the **web root** (so the URLs `.../admin.html` and `.../maureen.html` work).
5. Visit `https://votemaureen4karen.co.ke` to confirm the site loads.

> Tip: If you upload a `campaign-website.zip`, extract it, then move the files out of any nested folder so `index.html` is directly in `public_html/`.

---

## C. Deploy the BACKEND to Render

The backend is already deployed at `https://maureen-campaign-qa.onrender.com`. To redeploy or set one up:

1. On Render → **New → Web Service** → connect this GitHub repo.
2. Settings:
   - **Root Directory:** `qa-server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add **Environment Variables** (see `qa-server/.env.example`):
   - `JWT_SECRET` = a long random string
   - `CORS_ALLOWED_ORIGINS` = `https://votemaureen4karen.co.ke,https://www.votemaureen4karen.co.ke`
   - `CAMPAIGN_USERS_JSON` = (optional) custom logins — **strongly recommended for production** (see section D)
   - SMTP settings if you want volunteer/partner form emails delivered
4. Deploy. Confirm health: `https://maureen-campaign-qa.onrender.com/health` returns `{"status":"ok",...}`.

If you later move the backend to a different URL (e.g. an `api.votemaureen4karen.co.ke` subdomain), update the two `PROD_` values at the top of [`config.js`](config.js) and re-upload it to KickHost.

---

## D. Access the LIVE portals (after publishing)

- **Admin portal:** `https://votemaureen4karen.co.ke/admin.html`
- **Maureen portal:** `https://votemaureen4karen.co.ke/maureen.html`

### Default credentials
| Portal | Username | Password |
| --- | --- | --- |
| Admin | `admin` (or leave blank) | `MachAdmin@1039` |
| Maureen | `candidate` (or leave blank) | `MaureenChat@2027$` |

The **username field is optional** — if left blank it defaults to that portal's role. The **Maureen** portal only accepts the `candidate` account; the **Admin** portal only accepts the `admin` account.

> **Change these before real use.** Generate SHA-256 hashes and set `CAMPAIGN_USERS_JSON` on Render. Example to hash a password locally:
> ```bash
> node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"
> ```
> Then set on Render:
> ```
> CAMPAIGN_USERS_JSON=[{"username":"admin","passwordHash":"<hash>","role":"admin","displayName":"System Admin"},{"username":"candidate","passwordHash":"<hash>","role":"candidate","displayName":"Maureen"}]
> ```

### What each portal can do
- **Admin:** full moderation — approve/flag/answer/edit/**delete** questions and **ban/unban** users.
- **Maureen (candidate):** monitor, answer, edit, and change status of questions (no delete/ban).

---

## E. Publish checklist

1. [ ] `https://votemaureen4karen.co.ke` homepage loads
2. [ ] `https://maureen-campaign-qa.onrender.com/health` returns `ok`
3. [ ] Community Forum loads and accepts a question
4. [ ] `https://votemaureen4karen.co.ke/admin.html` logs in as admin
5. [ ] `https://votemaureen4karen.co.ke/maureen.html` logs in as candidate
6. [ ] The blog opens: `https://votemaureen4karen.co.ke/pages/raison-detre.html`
