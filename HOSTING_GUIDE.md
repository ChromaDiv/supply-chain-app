# Git Deployment Guide for Hostinger

This guide covers how to deploy your Supply Chain App to Hostinger Shared Hosting (using Git & Python App).

---

## Prerequisites
1.  **Git Repository:** Your project is in a Git repo (GitHub, GitLab, etc.).
2.  **Hostinger Plan:** Supports Python and Git.
3.  **Domain:** Added in Hostinger.

---

## 🚀 The Workflow (Commit Build)

Since Hostinger's Python App doesn't build Node.js apps automatically, we have configured your project to allow **committing the built frontend**.

### Step 1: Build & Commit Locally
1.  Open your terminal.
2.  Build the frontend:
    ```bash
    cd static
    npm run build
    cd ..
    ```
3.  Commit the changes (including the new `static/dist` folder):
    ```bash
    git add .
    git commit -m "Deploy: Updated frontend build"
    git push origin main
    ```

### Step 2: Setup Hostinger Python App (First Time Only)
1.  Log in to **hPanel** > **Websites**.
2.  Find **Git** in the sidebar (under Advanced or Files).
    - **Repository:** Enter your GitHub repo URL.
    - **Branch:** `main`.
    - **Directory:** leave empty (deploys to `public_html`).
    - **Webhook:** (Optional) Copy this URL if you want auto-deploy on push.
    - Click **Create**.
    - *Note: If it asks to overwrite files, ensure the directory is empty or choose overwrite.*

3.  Find **Python App** in the sidebar.
    - **Create New Application**:
        - **Python Version:** 3.9+
        - **Application Root:** `public_html`
        - **Startup File:** `passenger_wsgi.py`
        - **Entry Point:** `application`
    - Click **Create**.

4.  **Install Dependencies:**
    - In the Python App dashboard, type `requirements.txt` in the requirements file field.
    - Click **Install**.

### Step 3: Deployment Updates
Whenever you want to update your site:

1.  **Locally:** Run `npm run build` inside `static/`, then commit and push.
2.  **Hostinger:**
    - If you set up the Webhook, it updates automatically!
    - Otherwise, go to **Git** in hPanel and click **Pull**.
    - Go to **Python App** and click **Restart**.

---

## Configuration Details
- **.htaccess:** automatically routes traffic. API requests go to Python, everything else checks `static/dist/` for files.
- **Environment Variables:**
    - Upload your `.env` file via File Manager to `public_html` (do not commit it to Git!).
    - Update `DATABASE_URL` in `.env` if using a different database in production.
