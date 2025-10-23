# 🚀 Deploy Without Docker - GitHub Actions Method

## ✅ No Docker Installation Required!

This method builds and deploys your application using GitHub's cloud infrastructure.

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Docker Hub account (username: kikiprojecto)
- ✅ Git installed on your computer
- ✅ Nosana CLI (for manual deployment)

---

## 🎯 Setup Steps

### **Step 1: Push Code to GitHub**

```powershell
# Navigate to project
cd "c:\Users\L O G i N\Documents\Projects\agent-challenge"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - NeuroCoder AI"

# Create repository on GitHub first, then:
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/neurocoder-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### **Step 2: Add Docker Hub Credentials to GitHub**

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**Add these two secrets:**

| Name | Value |
|------|-------|
| `DOCKER_USERNAME` | `kikiprojecto` |
| `DOCKER_PASSWORD` | Your Docker Hub password |

---

### **Step 3: Trigger Build**

The workflow will automatically run when you push code. You can also trigger it manually:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click **Build and Deploy to Nosana** workflow
4. Click **Run workflow** button
5. Click **Run workflow** (green button)

---

### **Step 4: Monitor Build**

1. Click on the running workflow
2. Watch the build progress
3. Build takes ~5-10 minutes
4. When complete, your image is on Docker Hub! ✅

---

### **Step 5: Deploy to Nosana (Manual)**

After the image is built and pushed to Docker Hub:

```powershell
# Make sure Nosana CLI is installed
nosana --version

# If not installed:
npm install -g @nosana/cli

# Initialize Nosana (first time only)
nosana init

# Deploy to Nosana
nosana job post `
  --file ./nos_job_def/nosana_mastra.json `
  --market nvidia-3090 `
  --timeout 30

# Monitor deployment
nosana job list
nosana job logs <job-id> --follow
```

---

## 🔄 Update and Redeploy

When you make changes:

```powershell
# 1. Make your code changes

# 2. Commit and push
git add .
git commit -m "Update: description of changes"
git push

# 3. GitHub Actions will automatically rebuild and push

# 4. Wait for build to complete (check Actions tab)

# 5. Deploy to Nosana
nosana job post `
  --file ./nos_job_def/nosana_mastra.json `
  --market nvidia-3090 `
  --timeout 30
```

---

## 📊 Workflow Status

Check build status:
- Go to **Actions** tab in your GitHub repository
- Green ✅ = Build successful
- Red ❌ = Build failed (click to see logs)

---

## 🎯 Advantages of This Method

✅ **No Docker Desktop needed**
✅ **No BIOS changes required**
✅ **Faster builds** (GitHub's powerful servers)
✅ **Free for public repositories**
✅ **Automatic builds on every push**
✅ **Build history and logs**
✅ **Works from any computer**

---

## 🆘 Troubleshooting

### **Build Fails**

1. Check **Actions** tab for error logs
2. Verify Docker Hub credentials in Secrets
3. Make sure secrets are named exactly: `DOCKER_USERNAME` and `DOCKER_PASSWORD`

### **Can't Push to GitHub**

```powershell
# If you get authentication error, use Personal Access Token
# 1. Go to GitHub → Settings → Developer settings → Personal access tokens
# 2. Generate new token (classic)
# 3. Select: repo (all)
# 4. Copy the token
# 5. Use token as password when pushing
```

### **Nosana Deployment Fails**

```powershell
# Check balance
nosana balance

# Verify job definition
cat nos_job_def/nosana_mastra.json

# Check if image exists on Docker Hub
# Go to: https://hub.docker.com/r/kikiprojecto/neurocoder-ai
```

---

## 📝 Quick Reference

```powershell
# Push code
git add .
git commit -m "Update"
git push

# Wait for GitHub Actions to build (~5-10 min)
# Check: https://github.com/YOUR_USERNAME/neurocoder-ai/actions

# Deploy to Nosana
nosana job post --file ./nos_job_def/nosana_mastra.json --market nvidia-3090 --timeout 30

# Monitor
nosana job list
nosana job logs <job-id>
```

---

## 🎉 Success!

Once deployed, your application will be running on Nosana's decentralized infrastructure!

**No Docker Desktop required on your local machine!** 🚀
