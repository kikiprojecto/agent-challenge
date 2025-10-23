# 🚀 Quick Deploy - NeuroCoder AI

## One-Command Deployment

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh all
```

### Windows (PowerShell)
```powershell
.\deploy.ps1 all
```

## Step-by-Step (Manual)

### 1️⃣ Build Docker Image
```bash
docker build -t kikiprojecto/neurocoder-ai:v1 .
```

### 2️⃣ Test Locally
```bash
docker run -p 3000:3000 kikiprojecto/neurocoder-ai:v1

# Test health
curl http://localhost:3000/api/health

# Test API
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "hello world function", "language": "python"}'
```

### 3️⃣ Push to Docker Hub
```bash
docker login
docker push kikiprojecto/neurocoder-ai:v1
```

### 4️⃣ Deploy to Nosana
```bash
# Install Nosana CLI (first time only)
npm install -g @nosana/cli

# Deploy
nosana job post \
  --file ./nos_job_def/nosana_mastra.json \
  --market nvidia-3090 \
  --timeout 30
```

## 📋 Pre-Deployment Checklist

- [ ] Docker installed and running
- [ ] Docker Hub account created
- [ ] Logged into Docker Hub (`docker login`)
- [ ] Nosana CLI installed (`npm install -g @nosana/cli`)
- [ ] Nosana wallet configured
- [ ] NOS tokens in wallet
- [ ] Job definition updated with your image

## 🔍 Verify Deployment

```bash
# Check job status
nosana job list

# Get job details
nosana job get <job-id>

# View logs
nosana job logs <job-id>

# Test deployed endpoint
curl http://<nosana-url>/api/health
```

## ⚡ Quick Commands

```bash
# Build only
./deploy.sh build

# Test only
./deploy.sh test

# Push only
./deploy.sh push

# Deploy only
./deploy.sh deploy

# Full pipeline
./deploy.sh all
```

## 🆘 Troubleshooting

### Build fails
```bash
# Clean build
docker build --no-cache -t kikiprojecto/neurocoder-ai:v1 .
```

### Can't push to Docker Hub
```bash
# Re-login
docker logout
docker login
```

### Nosana deployment fails
```bash
# Check balance
nosana balance

# Verify job definition
cat nos_job_def/nosana_mastra.json | jq .
```

## 📚 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete documentation.

---

**Ready to deploy? Run `./deploy.sh all` and you're done! 🎉**
