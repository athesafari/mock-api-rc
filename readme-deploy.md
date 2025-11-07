# Render Deployment Guide

This walkthrough explains how to deploy the WireMock stubs API (`wiremock-service`) and the mock management dashboard (`mock-dashboard`) to [Render](https://render.com) using the included `render.yaml` blueprint.

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
   - Depends on `wiremock-service` through the `WIREMOCK_URL` environment variable, injected via `fromService`.
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
