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

Render will detect the `render.yaml` file and create an **Environment Group** called `shared-secrets`. You must manually enter the values for these secrets in the Render Dashboard.

### 3a. Getting your MongoDB URI (Critical)

1.  **Log in to MongoDB Atlas** and open your Cluster.
2.  **Network Access**:
    - Click "Network Access" in the sidebar.
    - Click "Add IP Address".
    - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`). (Required because Render's IPs change dynamicall).
3.  **Database Access**:
    - Click "Database Access".
    - Click "Add New Database User".
    - **Username**: Enter a name (e.g., `tax-admin`).
    - **Password**: Click "Autogenerate Secure Password" (and copy it!).
    - **Database User Privileges**: Select **"Read and write to any database"**. (Critical: You must select this!).
    - Click **Add User**.
4.  **Get Connection String**:
    - Click "Database" -> "Connect".
    - Select **"Drivers"** (Node.js).
    - Copy the connection string. It looks like:
      `mongodb+srv://tax-admin:<password>@cluster0.12345.mongodb.net/?retryWrites=true&w=majority`
    - **Replace `<password>`** with the actual password you created in step 3.

### 3b. Entering Secrets in Render

1.  Go to your Render Dashboard.
2.  Find the **Environment Groups** tab at the top.
3.  Select the `shared-secrets` group created by the blueprint (or create it if missing).
4.  Add/Edit the following variables:

- **MONGODB_URI**: Paste your full Atlas connection string.
- **RAZORPAY_KEY_ID**: Your Razorpay Test Key ID.
- **RAZORPAY_KEY_SECRET**: Your Razorpay Test Key Secret.
- **RAZORPAY_WEBHOOK_SECRET**: Your Webhook Secret.
- **JWT_SECRET**: (Auto-generated if you leave it blank, or type a random string).
- **CLOUDINARY_CLOUD_NAME**: Your Cloudinary Cloud Name.
- **CLOUDINARY_API_KEY**: Your Cloudinary API Key.
- **CLOUDINARY_API_SECRET**: Your Cloudinary API Secret.

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
