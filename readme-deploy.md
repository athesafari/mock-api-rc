# Cloud Deployment Guide

This document covers managed deployments of the WireMock API (`wiremock`) and its dashboard (`mock-dashboard`) on both [Railway](https://railway.app) and [Render](https://render.com).

---

## Deploying to Railway

Railway treats each service as an independent deployment. This repo includes `railway.json` files inside `wiremock/` and `dashboard/` so you can spin up both services from the same repository with minimal manual configuration.

### 1. Prerequisites
- Railway account connected to your GitHub repository that hosts this code.
- Railway CLI (`npm i -g railway`) if you prefer terminal-based deployment.
- Docker & Node.js locally (optional but useful for testing before pushing).

### 2. Create the project and WireMock service
1. In the Railway dashboard click **New Project → Deploy from Repo**.
2. Choose this repository and select the **wiremock** directory when prompted for the service root.
3. Railway automatically reads `wiremock/railway.json` and uses the Dockerfile build with a health check at `/__admin/mappings`.
4. Deploy the service. Once live, note its public domain (e.g., `https://wiremock-production.up.railway.app`). This will be the `WIREMOCK_URL` for the dashboard.

> **Tip:** If you prefer the CLI, run `railway up --service wiremock --root wiremock`.

### 3. Add the dashboard service
1. In the same Railway project click **New Service → Deploy from Repo** again.
2. Choose the repository and select the **dashboard** directory as the root.
3. Railway applies `dashboard/railway.json`, running `npm start` with a health check on `/healthz`.
4. After the first build, open the service **Variables** tab and add:
   - `WIREMOCK_URL=https://<wiremock-domain>`
5. Redeploy the dashboard so it can talk to WireMock.

### 4. Verify & use
1. Visit the dashboard’s public URL (shown in Railway) and add a stub.
2. Call the WireMock service URL to confirm the mock appears.
3. Any external application can now consume the mocks through the WireMock domain.

### 5. Day-2 operations on Railway
- **Auto redeploys:** Each push to the tracked branch triggers a new build; disable auto-deploy per service if desired.
- **Persistent data:** Railway containers have ephemeral disks. If you need mocks to persist across rebuilds, attach a [Railway Volume](https://docs.railway.app/guides/volumes) to the wiremock service and configure WireMock to store mappings there (e.g., mount to `/home/wiremock/mappings`).
- **Service-to-service URLs:** Railway currently doesn’t inject other service URLs automatically. Keep `WIREMOCK_URL` updated whenever the WireMock domain changes (it stays stable unless you delete the service).

---

## Deploying to Render

Render can provision both services for you via the provided blueprint (`render.yaml`). Commit all changes and push the repo to GitHub/GitLab before continuing.

## 1. Prerequisites
- Render account with GitHub access and the Starter plan (or better).
- Forked or cloned copy of this repo in your own GitHub namespace.
- Docker installed locally if you want to test the containers before deploying.

```bash
git clone https://github.com/<your-org>/wiremock-mockapi.git
cd wiremock-mockapi
```

Push any local changes (including `render.yaml`) to the branch you intend to deploy (defaults to `main` in the blueprint).

## 2. Understand the Blueprint (`render.yaml`)
The blueprint declares two services:

1. `wiremock-service`
   - `type: web`, `env: docker`
   - Builds from `wiremock/Dockerfile` (bundles all mappings and response bodies).
   - Exposes port `8080` with health check `/__admin/mappings`.

2. `mock-dashboard`
   - `type: web`, `env: node`
   - Installs and starts the dashboard inside the `dashboard` directory (`npm install`, `npm start`).
   - Depends on `wiremock-service` via `WIREMOCK_HOST`/`WIREMOCK_PORT` env vars supplied with `fromService`; the server builds the `WIREMOCK_URL` automatically from those values.
   - Health check served from `/healthz`.

Adjust the branch, plan, or service names in `render.yaml` as needed before deploying.

## 3. Deploy via Render Blueprint
1. Sign in to Render and connect your GitHub account if you have not already.
2. Click **New +** → **Blueprint**.
3. Select the repository and branch that contains this project.
4. Render will parse `render.yaml` and show both services. Review each configuration and click **Apply**.
5. Trigger the initial deploy from the confirmation screen. Render will:
   - Build and start `wiremock-service`.
   - Install dependencies and start `mock-dashboard` once WireMock is healthy.

The build logs will appear under each service. You can reopen them later from Render’s dashboard.

## 4. Verify the Deployment
After both services show **Live**:
1. Visit the WireMock base URL shown in Render (e.g., `https://wiremock-service.onrender.com/__admin/mappings`) to confirm default stubs load.
2. Open the dashboard URL (e.g., `https://mock-dashboard.onrender.com`) to add or delete stubs. Every change is stored inside the running WireMock instance.
3. Point any external applications to the WireMock service URL to consume the mock APIs.

## 5. Day-2 Operations
- **Auto deploys**: Any push to the tracked branch triggers a redeploy for both services. Disable `autoDeploy` in `render.yaml` if you prefer manual promotion.
- **Manual redeploy**: From a service page, click **Manual Deploy → Deploy latest commit**.
- **Environment overrides**: Set additional variables in the Render UI if needed (for example, basic auth for `/__admin`). They override the values provided in the blueprint.
- **Scaling**: Change plan or instance type from Render if you need more memory/CPU.
- **Custom domains**: Use Render’s dashboard to point custom hostnames at either service.

## 6. Local Testing (Optional)
Before pushing, you can run both services locally:

```bash
docker compose up --build
# Dashboard → http://localhost:8081
# WireMock  → http://localhost:8080
```

Stop the stack with `docker compose down` when finished. Once you are satisfied, push commits and let Render redeploy automatically.

---

With these steps you can provision both the WireMock backend and its management UI on Render, keep them in sync via Git, and reuse the exposed mock API in other applications. Adjust the blueprint as your deployment needs evolve.***
