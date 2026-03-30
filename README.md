# Effective Speech Static Mirror

This repository is a SiteSucker export of `https://effectivespeech.org/` prepared for static hosting on GitHub Pages.

`scripts/prepare-gh-pages.js` converts the remaining WordPress and Thrive dynamic sections into static HTML, and `.github/workflows/deploy-pages.yml` runs that transform before deploying the site.

If you refresh the mirror, run `node scripts/prepare-gh-pages.js` before committing the updated export.
