# 🚀 Deployment Guide (Render)

**Render** is a cloud platform where we will host your application. You do **NOT** need to download anything. It is all managed via their website.

## Prerequisites

1.  **GitHub Account**: Your code must be pushed to GitHub.
2.  **Render Account**: Sign up at [dashboard.render.com](https://dashboard.render.com/).

## Step 1: Push to GitHub

Ensure all your latest changes (including `render.yaml`) are pushed to your GitHub repository.

```bash
git add .
git commit -m "feat: setup deployment config"
git push origin main
```

## Step 2: Create Infrastructure on Render

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** button in the top right.
3.  Select **Blueprints**.
4.  Connect your GitHub account if prompted.
5.  Search for and select your `TaxSaasPlatform` repository.
6.  Click **Connect**.

## Step 3: Configure Secrets

Render will detect the `render.yaml` file and ask for the "Shared Secrets" defined in the Environment Group. You will see inputs for:

- **MONGODB_URI**: Your MongoDB connection string (e.g., from MongoDB Atlas).
- **RAZORPAY_KEY_ID**: Your Razorpay Test Key ID.
- **RAZORPAY_KEY_SECRET**: Your Razorpay Test Key Secret.
- **RAZORPAY_WEBHOOK_SECRET**: Your Webhook Secret.
- **JWT_SECRET**: (Auto-generated, leave blank if option exists, or type a random string).

## Step 4: Deploy

1.  Click **Apply Blueprint**.
2.  Render will automatically:
    - Build the Backend Docker image.
    - Build the Frontend Docker image.
    - Deploy them to live URLs (e.g., `https://taxsaas-client.onrender.com`).

## Verification

Once the deployment status shows "Live":

1.  Open the Client URL.
2.  Try logging in.
3.  The app is now accessible worldwide! 🌍
