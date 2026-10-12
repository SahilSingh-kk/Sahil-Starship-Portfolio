# Sahil Starship Portfolio

A static, explorable portfolio with About Me, Projects, Résumé and Contact rooms.

## Preview on your PC

Extract this ZIP first, then open `index.html` in Chrome or Edge. No installation or build is required. Google Fonts needs an internet connection; fallback fonts work offline.

## Upload to GitHub

1. Create a new GitHub repository, for example `sahil-starship-portfolio`.
2. Choose **uploading an existing file** (or **Add file → Upload files**).
3. Upload the contents of this folder, including the `assets` folder. Upload the extracted files, not the ZIP.
4. Ensure `index.html`, `portfolio.js`, `style.css`, `vercel.json` and `assets/` are at the repository root. Commit the files.

If you prefer Git from a terminal opened in this extracted folder:

```sh
git init
git add .
git commit -m "Add spaceship portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sahil-starship-portfolio.git
git push -u origin main
```

Replace YOUR-USERNAME with your GitHub username. For this terminal route, create an empty GitHub repository without an initial README.

## Deploy on Vercel

1. Sign in to Vercel with your GitHub account.
2. Select **Add New → Project**, then import this repository.
3. Select framework preset **Other** if asked. Root Directory is the repository root.
4. This repository includes `vercel.json`: no install command, no build command, output directory `.`.
5. No environment variables are required. Select **Deploy**.
6. Open the returned `.vercel.app` URL.

The résumé and contact information in this package become accessible to visitors when you publish it. This export is independent of the ChatGPT-hosted version. Changes to the GitHub repository can be deployed by Vercel; later ChatGPT Site changes are not automatically copied into this repository.

## Edit the portfolio

- `index.html`: page structure and navigation
- `style.css`: styling and responsive layouts
- `portfolio.js`: room artwork, movement and portfolio content
- `assets/Sahil-Kumar-Resume.pdf`: your unchanged two-page résumé
- `vercel.json`: static hosting configuration

To replace the résumé, keep its filename or update the two résumé links in `portfolio.js`.
