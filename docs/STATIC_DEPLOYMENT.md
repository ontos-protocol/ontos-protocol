# Static Deployment Runbook

The `.ontos Protocol` website is a static site built into `website/dist`.

## Build

Run:

```bash
npm run docs:build
```

Expected output:

```text
website build ok
```

Required files:

- `website/dist/index.html`
- `website/dist/app.js`
- `website/dist/styles.css`
- `website/dist/assets/viewer-screenshot.svg`
- `website/dist/assets/cli-screenshot.svg`
- `website/dist/assets/social-preview.svg`
- `website/dist/robots.txt`
- `website/dist/sitemap.xml`
- `website/dist/.nojekyll`

## Local Verification

Serve `website/dist` with any static file server and verify:

- home page loads
- default example loads
- search works
- export buttons work
- links to spec, schema, examples, and package docs work
- no network account is required
- local-only behavior is visible

## GitHub Pages

Recommended settings:

- source: GitHub Actions or `main` branch deployment artifact
- publish directory: `website/dist`
- custom domain: optional
- HTTPS: required when a custom domain is configured

If using GitHub Pages, keep `.nojekyll` in `website/dist`.

The repository includes `.github/workflows/deploy-docs.yml`.

The workflow:

- runs `npm ci`
- installs `ffmpeg` on the GitHub Actions runner for demo video validation
- runs `npm run release:check`
- uploads `website/dist`
- deploys through GitHub Pages

Manual dispatch is supported through `workflow_dispatch`.

## Other Static Hosts

The site can also be deployed to static hosting platforms that support:

- HTML
- CSS
- JavaScript
- static asset routing
- HTTPS

No server runtime is required.

## Deployment Gate

Before promoting the URL publicly:

```bash
npm run release:check
npm run validate:deployment
```

Then verify the deployed URL manually:

- page title is `.ontos Protocol`
- README and docs links are correct
- viewer demo opens the default example
- public naming is consistent
- no unrelated product or private context appears

## Rollback

If deployment is wrong:

- restore the previous static artifact
- pause public announcements
- fix the source
- rerun `npm run docs:build`
- rerun `npm run release:check`
- redeploy
