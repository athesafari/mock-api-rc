# WireMock Mock API & Dashboard

This repository contains two deployable pieces:

- **WireMock service** (Java/WireMock) that serves mock API responses and exposes the `__admin` endpoints for managing stubs.
- **Dashboard** (Node/Express + static frontend) that provides a friendly UI for adding or deleting WireMock stubs without touching JSON files manually.

The dashboard talks to the WireMock service via HTTP, so the mocked APIs can be consumed by any external application once deployed.

## Project Layout

```
wiremock-mockapi/
├── wiremock/
│   ├── Dockerfile           # Custom WireMock image for Render
│   ├── mappings/            # Default WireMock stubs
│   └── __files/             # Payload bodies referenced by the stubs
├── dashboard/               # Express server + Apple-style UI
├── docker-compose.yml       # Local orchestration of both services
└── render.yaml              # Render blueprint (deploy both services together)
```

## Local Development

Requirements: Docker, Docker Compose, Node.js 20+ and npm.

### Option A – Docker Compose (runs everything)

```bash
docker compose up --build
```

This builds the dashboard image, starts WireMock on `http://localhost:8080`, and runs the dashboard on `http://localhost:8081`. Open the dashboard to manage mocks; added stubs are immediately available from `http://localhost:8080/<your-path>`.

### Option B – Run services separately

1. Start WireMock only:
   ```bash
   docker compose up wiremock
   ```
2. Run the dashboard from source:
   ```bash
   cd dashboard
   npm install
   WIREMOCK_URL=http://localhost:8080 npm start
   ```

The dashboard auto-refreshes from `WIREMOCK_URL`, so feel free to point it to any remote WireMock instance as long as the `__admin` API is reachable.

## Deploying to Render

Render can provision both services for you via the provided blueprint (`render.yaml`). Commit all changes and push the repo to GitHub/GitLab before continuing.

### 1. Create the blueprint stack

1. Visit [dashboard.render.com](https://dashboard.render.com/) → **New +** → **Blueprint**.
2. Select the repository containing this project.
3. Render reads `render.yaml` and shows two services:
   - `wiremock-service` (Docker-based, exposes `/:8080`).
   - `mock-dashboard` (Node service serving the UI + API).
4. Review the instance size/region and click **Apply**.

Render deploys `wiremock-service` first, then automatically injects its public URL into the dashboard via the `WIREMOCK_URL` env var defined in the blueprint (using `fromService`). Once both are live:

- Dashboard URL: `https://mock-dashboard.onrender.com`
- WireMock API URL: `https://wiremock-service.onrender.com`

### 2. Consuming the mocks

Point any client application to the WireMock URL above. Everything you create in the dashboard (new routes, edits, deletions) becomes available immediately at the WireMock endpoint.

### 3. Optional persistence

WireMock writes dynamically created mappings to its filesystem. Render instances keep those files between deploys, but a manual **Scale to Zero** or disk rebuild will reset them. If you need stronger guarantees, add a small [Render Disk](https://render.com/docs/disks) to `wiremock-service` and mount it to `/home/wiremock/data`, then set the `--root-dir=/home/wiremock/data` option in the service settings.

## Environment Variables

| Service          | Variable       | Description                                           | Default                       |
| ---------------- | -------------- | ----------------------------------------------------- | ----------------------------- |
| Dashboard        | `WIREMOCK_URL` | Base URL of the WireMock service (`https://...`).     | `http://localhost:8080`       |
| Dashboard        | `PORT`         | Port Render assigns; falls back to `8081` locally.    | `8081`                        |
| WireMock (opt.)  | `JAVA_OPTS`    | Extra JVM flags; configure in Render if you need it.  | _unset_                       |

## Useful Commands

- `docker compose logs -f wiremock` – tail the WireMock container logs locally.
- `docker compose down` – stop both services.
- `npm --prefix dashboard start` – run only the dashboard from the repo root.

With this setup you can iterate locally using Docker Compose, then push to Render and get both the dashboard and the mock API live with a single deploy. Need more services (e.g., a consumer app)? Just point them at the WireMock URL Render gives you.
