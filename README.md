# FFL Stats — Live Google Sheet Build

This version loads live player stats from the published `Website Data` CSV in the Friday Futsal League 2026 Google Sheet.

## Upload/update GitHub
Replace the existing files in the root of the `FFL-Stats` repository with:
- `index.html`
- `style.css`
- `script.js`

You can delete the old `data.js` file because it is no longer used.

GitHub Pages should then rebuild automatically from the `main` branch.

## Data flow
Friday Futsal League tab → Website Data tab → published CSV → GitHub Pages site.
