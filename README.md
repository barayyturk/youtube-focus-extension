# YouTube Focus website

This folder contains the finished static website and a GitHub Actions workflow
that publishes it to GitHub Pages. No Jekyll, Node.js, pnpm, or dependency
installation is required.

## Upload and publish

1. Extract this ZIP file.
2. Upload everything inside the extracted folder to a new GitHub repository.
3. Make sure `.github/workflows/deploy-pages.yml` is included. If you cannot
   see the `.github` folder, turn on hidden-file visibility before uploading.
4. Commit the files to the `main` branch.
5. In GitHub, open **Settings → Pages**.
6. Set **Source** to **GitHub Actions**.
7. Open the **Actions** tab and wait for **Deploy YouTube Focus website** to
   finish.
8. GitHub will show the live website URL in the completed deployment.

The website files are already built in `dist/public`. The downloadable Chrome
extension ZIP is included in that folder.