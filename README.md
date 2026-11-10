# Engineering Portal

A responsive React + Vite starter for a centralized engineering portal.

## Included
- Dashboard with five entry modules: Energy Monitoring, Equipment Monitoring, Datasheet, Document, Technical Manual
- Responsive sidebar and dashboard
- Document library with search and category filters
- Admin Preview toggle (click **Admin settings** in the sidebar)
- Multi-file local demo upload
- PDF preview using the browser PDF viewer
- Excel/XLSX preview using SheetJS, including worksheet tabs

## Important: demo vs production
This starter is ready to build and deploy as a GitHub Pages frontend. The upload UI currently stores selected files only in the current browser session (object URLs); it does **not** upload to Google Drive yet. The Google Drive API integration requires a secure backend (for example, a small Node.js service on a VPS) to keep OAuth credentials and service-account secrets out of public frontend code. The sample documents are illustrative placeholders.

The monitoring modules currently show integration placeholders. Add the real Grafana/SCADA URLs in `src/App.jsx` when they are available.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages
1. Create a GitHub repository named `engineering-portal`.
2. Upload/push the contents of this project to the repository root.
3. In `vite.config.js`, change `base: '/engineering-portal/'` if your repository name differs. For a custom domain or `username.github.io` repository, use `base: '/'`.
4. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the source.
5. Create `.github/workflows/deploy.yml` (provided below) or add it to your repository.
6. Push to `main`; GitHub Actions will build and publish the site.

## Google Drive production integration (next step)
Recommended pattern:
- Frontend calls your backend endpoints: `GET /api/documents`, `POST /api/documents`, `DELETE /api/documents/:id`.
- Backend uses Google Drive API to store files in private folders and returns metadata/short-lived view links.
- For PDF previews, backend can proxy or issue an authorized preview URL.
- For Excel, backend can return file bytes to SheetJS after authorization.
- Do not put Google OAuth client secrets, refresh tokens, or service account private keys in this repository.

## GitHub Actions workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Engineering Portal
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
