# Deployment architecture

The site is a Next.js 16 App Router app. CI builds a standalone Node image and publishes it to GitHub Container Registry. The planned runtime is the homelab Kubernetes cluster (Traefik at the edge), not a managed frontend host.

```
push
  → GitHub Actions
      → npm ci
      → lint
      → typecheck
      → next build
      → tests
      → docker build
      → (main) push ghcr.io/baris-batur/personal-website
      → (main + KUBECONFIG) kubectl apply -k deploy/k8s
           Traefik Ingress
             → Service
               → Deployment (standalone `node server.js`)
```

Prometheus, if added later for the telemetry panel, stays private. The public app never scrapes it; a same-origin sanitizer would sit in front. That path is not in this image yet.

## What runs where

| Piece | Where it lives |
|---|---|
| Source of truth | this repository |
| Quality gate | `.github/workflows/ci.yml` |
| Image | `Dockerfile` (standalone output, Node 24 LTS) |
| Local prod-shaped run | `docker compose up --build` |
| Cluster shape | `deploy/k8s/` (namespace, deployment, service, Traefik ingress) |

The homepage does not describe this. The homelab diagram on the site is the planned cluster, still labelled as planned.

## Image

```
docker build -t personal-website .
docker compose up --build
```

Health: `GET /healthz` returns `ok`. Probes and the image `HEALTHCHECK` use that path, not `/`.

## Cluster apply

1. Set the Ingress host in `deploy/k8s/ingress.yaml` (placeholder: `portfolio.home.arpa`).
2. Create a GitHub Actions secret `KUBECONFIG` with a kubeconfig that can apply `personal-website`.
3. Pushes to `main` that pass CI will retag the image to the commit SHA and `kubectl apply -k deploy/k8s`.

Until `KUBECONFIG` exists, main still publishes the image. The apply step is skipped. That is intentional: the homelab is not live yet, and CI should not pretend it is.

GHCR packages are private by default. Make `ghcr.io/baris-batur/personal-website` public, or add an imagePullSecret on the cluster.

## Local quality (same order as CI)

```
npm ci
npm run lint
npm run typecheck
npm run build
npm test
docker build -t personal-website .
```

npm is the lockfile CI uses (`package-lock.json`).
