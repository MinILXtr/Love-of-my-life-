# Deploying the Birthday Surprise Site

## Quick Overview
You have a **static** website (HTML, CSS, JavaScript) that runs locally by opening `index.html`. To make it *sharable* with a public URL you can host it on any free static‑site service. The most straightforward approach is **GitHub Pages** because it requires only a GitHub account and a few clicks.

---

## 1. Create a GitHub Repository
1. Go to <https://github.com> and sign in (or create an account).
2. Click **New** → **Create a new repository**.
3. Name the repo, e.g. `birthday‑surprise`.
4. **Do NOT** initialize with a README – we will push the existing folder.
5. Click **Create repository**.

## 2. Push Your Local Files
Open **PowerShell** in the project folder and run the following commands (replace `YOUR-USERNAME` and `REPO-NAME` with your actual values):

```powershell
cd C:\Users\manan\Downloads\HappyBirthday

git init

git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

git add .

git commit -m "Initial commit – birthday surprise site"

git branch -M main

git push -u origin main
```

If you don’t have Git installed, download it from <https://git-scm.com/downloads> and follow the installer prompts.

## 3. Enable GitHub Pages
1. Open the repo on GitHub.
2. Go to **Settings** → **Pages** (in the left‑hand menu).
3. Under **Source**, select the `main` branch and the folder `/ (root)`.
4. Click **Save**.
5. After a few seconds GitHub will display a public URL, e.g.
   ```
   https://YOUR-USERNAME.github.io/REPO-NAME/
   ```
   This is the shareable link you can send to anyone.

## 4. (Optional) Automatic Deploy with GitHub Actions
If you want the site to redeploy automatically whenever you push new changes, add the following workflow file:

```text
.github/workflows/deploy.yml
```
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```
Create the `.github/workflows` folders inside the project, add the `deploy.yml` file, commit and push. GitHub Actions will take care of publishing the site after each push.

## 5. Verify the Site
Open the generated URL in a browser. All interactive features (cake animation, love‑letter, timers, etc.) should work exactly as they do locally.

---

## Alternative Hosting Options
| Service | Main Steps | Cost |
|---|---|---|
| **Netlify** | Drag‑and‑drop the `HappyBirthday` folder on <https://app.netlify.com> or connect a GitHub repo. | Free tier |
| **Vercel** | `vercel` CLI (`npm i -g vercel`), then run `vercel` in the folder. | Free tier |
| **GitLab Pages** | Similar to GitHub Pages – push to a GitLab repo and enable Pages. | Free |
| **Firebase Hosting** | `firebase init hosting` → `firebase deploy`. Requires a Google account. | Free tier |

Choose whichever you prefer; the site will be reachable via a public link.

---

## TL;DR Command Cheat‑Sheet
```powershell
# Initialize repo & push
cd C:\Users\manan\Downloads\HappyBirthday

git init

git remote add origin https://github.com/YOUR-USERNAME/birthday-surprise.git

git add .

git commit -m "Initial commit"

git branch -M main

git push -u origin main
```
Then enable **GitHub Pages** in the repo settings. 🎉
