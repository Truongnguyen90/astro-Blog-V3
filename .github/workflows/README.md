# GitHub Actions Workflows

This directory contains CI/CD workflows for the Flaco project.

## Workflows

### 1. CI Workflow (`ci.yml`)
Runs on every push and pull request to main/master/develop branches.

**Jobs:**
- **Test & Type Check**: Runs on Node 18.x and 20.x
  - Type checking (`npm run check`)
  - Unit tests (`npm run test:run`)
  - Build validation (`npm run build`)
- **Code Quality**: Checks code formatting

**Triggers:**
- Push to main/master/develop
- Pull requests to main/master/develop

---

### 2. Deploy Workflow (`deploy.yml`)
Automatically deploys to GitHub Pages on push to main/master.

**Jobs:**
- **Build**:
  - Runs type checking and tests
  - Builds the Astro site
  - Uploads build artifacts
- **Deploy**: Deploys to GitHub Pages

**Triggers:**
- Push to main/master
- Manual workflow dispatch

---

## Setup Instructions

### GitHub Pages Deployment

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Build and deployment**, select:
   - **Source**: GitHub Actions
4. Push to main/master branch to trigger deployment

### Alternative Deployment Platforms

#### Vercel
```yaml
# .github/workflows/vercel.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Netlify
```yaml
# .github/workflows/netlify.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

#### Cloudflare Pages
```yaml
# .github/workflows/cloudflare.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: flaco
          directory: dist
```

---

## Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/flaco/workflows/CI/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/flaco/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
```

---

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
npm install -g act

# Run CI workflow
act -j test

# Run specific job
act -j build
```

---

## Troubleshooting

### Build Fails
- Check Node version compatibility
- Verify all dependencies are listed in package.json
- Ensure tests pass locally: `npm run check && npm run test:run`

### Deployment Fails
- Verify GitHub Pages is enabled in repository settings
- Check build output in Actions tab
- Ensure astro.config.mjs has correct base URL

### Permission Errors
- Go to Settings > Actions > General
- Under "Workflow permissions", select "Read and write permissions"
