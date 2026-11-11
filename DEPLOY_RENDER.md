# Deploying Vintisk Pharma to Render

This guide outlines how to deploy the Vintisk Pharmaceuticals website and batch verification system to [Render](https://render.com).

---

## 1. Prerequisites & Architecture

- **Runtime:** Node.js `>=22.5.0` (utilizes native `node:sqlite`).
- **Database:** SQLite (`vintisk_pharma.db`).
- **File Storage:** Private batch PDF directory.
- **Persistent Disk:** Required so uploaded batch PDFs and database updates persist across Render deployments and restarts.
- **Port:** Render provides `PORT` automatically (defaults to `10000` or `3000`).

---

## 2. Environment Variables

Configure these in the Render Dashboard (**Environment** tab):

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production security, secure cookies, and strict asset filters. |
| `ADMIN_USERNAME` | Optional | `admin` | Username for the Admin Portal. |
| `ADMIN_PASSWORD` | **Yes** (in production) | *None* | Secure password for initial admin creation. |
| `PERSISTENT_DATA_DIR` | **Yes** (with disk) | `/var/data` | Absolute path where the Render Persistent Disk is mounted. |
| `UPDATE_ADMIN_PASSWORD`| Optional | `false` | Set to `true` to force-sync admin password to `ADMIN_PASSWORD` on deploy. |
| `CORS_ORIGIN` | Optional | *Same-origin* | Comma-separated list of allowed origins (e.g., `https://vintisk-pharma.onrender.com`). |

---

## 3. Persistent Disk Configuration

Render disks ensure your database and uploaded documents are not wiped when containers restart.

- **Disk Name:** `vintisk-data`
- **Mount Path:** `/var/data`
- **Recommended Size:** `1 GB` (or larger depending on document volume)

> **Automatic Initial Seeding:** On the very first deployment with a new persistent disk, the server automatically copies existing seed database records and test batch PDFs from the repository into `/var/data/data/` and `/var/data/storage/batch_documents/`.

---

## 4. Deployment Methods

### Option A: Render Blueprint (Recommended)

1. Push your repository to GitHub / GitLab.
2. In the Render Dashboard, click **New +** &rarr; **Blueprint**.
3. Select your repository.
4. Render will read `render.yaml`, configure the Web Service, attach the 1GB persistent disk at `/var/data`, and generate an `ADMIN_PASSWORD`.
5. Click **Apply**.

---

### Option B: Manual Web Service Setup

1. In Render Dashboard, click **New +** &rarr; **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name:** `vintisk-pharma`
   - **Region:** Any (e.g. Frankfurt, Oregon, Singapore)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Starter` (Required for persistent disks)
4. Add **Persistent Disk** (under *Disks* tab):
   - **Name:** `vintisk-data`
   - **Mount Path:** `/var/data`
   - **Size:** `1 GB`
5. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PERSISTENT_DATA_DIR`: `/var/data`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `<your-secure-password>`
6. Set **Health Check Path** (under *Advanced*):
   - `/healthz`
7. Click **Create Web Service**.

---

## 5. Security Summary

- **Source Code Leak Prevention:** Strict static route filtering prevents downloading `server.js`, `package.json`, test scripts, or `.env` files.
- **Secure Authentication:** Passwords hashed with `scrypt` using unique per-user salts and timing-safe comparison.
- **Cookie Security:** Sessions use `httpOnly`, `sameSite: 'lax'`, and `secure` in production.
- **Brute Force Protection:** Built-in rate limiting on `/api/admin/login` (5 attempts / 15 mins).
- **Document Access:** Unverified or inactive batch documents cannot be streamed without admin authentication.
