# water-column-sonar-visualization

Water Column Sonar Data Visualization Project for Warren Tech 2025 to 2026 Capstone

## Installation and setup

1. Clone the repository

2. Install dependencies

```sh
npm install
```

3. Run Vite to start server
```sh
npx vite
```

## Structure

This project uses React and Vite, so 

## Deployment

### Dev

All pushes to `main` will be automatically deployed to [dev.watercolumnproject.org](dev.watercolumnproject.org)

### Test

Tagging any commit will automatically deploy it to [test.watercolumnproject.org](test.watercolumnproject.org)

### Prod

All prod deployments must be manually triggered

1. Go to the `Actions` tab

2. Click on the tab on the side that begins with `Deploy PROD`

3. Click the `Run workflow` button and input the tag to deploy

## Tagging Commands

`git tag -a v25.9.x -m "Releasing v25.9.x"`

`git push origin --tags`

_Make sure to increase x by one every time. Will reset when a new month starts (October will reset to 25.10.0)_

If you forget to tag a push use the following command:

`git tag -a v25.9.x [(part of or all) commit checksum] -m "Releasing v25.9.x"`
