# 🚀 NeuroCoder AI - Deployment Guide

Complete guide for building, testing, and deploying NeuroCoder AI to Nosana decentralized infrastructure.

## 📋 Prerequisites

- Docker installed and running
- Docker Hub account
- Nosana CLI installed
- Nosana wallet with NOS tokens

## 🔧 Installation

### 1. Install Nosana CLI

```bash
npm install -g @nosana/cli
```

### 2. Configure Nosana

```bash
# Initialize Nosana configuration
nosana init

# Check your balance
nosana balance
```

## 🐳 Docker Build & Push

### Step 1: Build Docker Image

```bash
# Build the Docker image
docker build -t kikiprojecto/neurocoder-ai:v1 .

# Build with no cache (if needed)
docker build --no-cache -t kikiprojecto/neurocoder-ai:v1 .
```

### Step 2: Test Locally

```bash
# Run the container locally
docker run -p 3000:3000 kikiprojecto/neurocoder-ai:v1

# Test with environment variables
docker run -p 3000:3000 \
  -e OLLAMA_API_URL=http://localhost:11434/api \
  -e MODEL_NAME_AT_ENDPOINT=qwen3:8b \
  kikiprojecto/neurocoder-ai:v1

# Test the health endpoint
curl http://localhost:3000/api/health

# Test the generate endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a hello world function",
    "language": "python"
  }'
```

### Step 3: Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push kikiprojecto/neurocoder-ai:v1

# Tag and push additional versions
docker tag kikiprojecto/neurocoder-ai:v1 kikiprojecto/neurocoder-ai:latest
docker push kikiprojecto/neurocoder-ai:latest
```

## ☁️ Deploy to Nosana

### Option 1: Using Nosana CLI

```bash
# Deploy to Nosana with nvidia-3090 market
nosana job post \
  --file ./nos_job_def/nosana_mastra.json \
  --market nvidia-3090 \
  --timeout 30

# Deploy with custom market
nosana job post \
  --file ./nos_job_def/nosana_mastra.json \
  --market nvidia-4090 \
  --timeout 60

# Check job status
nosana job status <job-id>

# Get job logs
nosana job logs <job-id>
```

### Option 2: Using Nosana Dashboard

1. Go to [Nosana Dashboard](https://dashboard.nosana.io)
2. Connect your wallet
3. Navigate to "Jobs" → "Create Job"
4. Upload `nos_job_def/nosana_mastra.json`
5. Select market (nvidia-3090 recommended)
6. Set timeout (30+ minutes recommended)
7. Submit job

## 🔍 Monitoring & Debugging

### Check Container Status

```bash
# List running containers
docker ps

# View container logs
docker logs <container-id>

# Execute commands in container
docker exec -it <container-id> sh

# Inspect container
docker inspect <container-id>
```

### Monitor Nosana Job

```bash
# Get job details
nosana job get <job-id>

# Stream job logs
nosana job logs <job-id> --follow

# List all your jobs
nosana job list
```

### Health Checks

```bash
# Check application health
curl http://<nosana-url>/api/health

# Test code generation
curl -X POST http://<nosana-url>/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a fibonacci function",
    "language": "javascript"
  }'
```

## 🛠️ Troubleshooting

### Build Issues

**Problem**: Build fails with dependency errors
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
docker build --no-cache -t kikiprojecto/neurocoder-ai:v1 .
```

**Problem**: Build takes too long
```bash
# Solution: Use .dockerignore to exclude unnecessary files
# Already configured in .dockerignore
```

### Runtime Issues

**Problem**: Container exits immediately
```bash
# Check logs
docker logs <container-id>

# Run with interactive shell
docker run -it kikiprojecto/neurocoder-ai:v1 sh
```

**Problem**: Cannot connect to Ollama
```bash
# Verify Ollama container is running
# Check environment variables are set correctly
# Ensure depends_on is configured in nosana_mastra.json
```

### Nosana Deployment Issues

**Problem**: Job fails to start
```bash
# Check job definition syntax
cat nos_job_def/nosana_mastra.json | jq .

# Verify image is accessible
docker pull kikiprojecto/neurocoder-ai:v1

# Check Nosana balance
nosana balance
```

**Problem**: Insufficient VRAM
```bash
# Solution: Use a market with more VRAM
# Update system_requirements in nosana_mastra.json
# Try nvidia-4090 market instead of nvidia-3090
```

## 📊 Performance Optimization

### Docker Image Size

```bash
# Check image size
docker images kikiprojecto/neurocoder-ai

# Optimize by using alpine base
# Already configured in Dockerfile

# Remove unused dependencies
npm prune --production
```

### Build Time

```bash
# Use Docker BuildKit
DOCKER_BUILDKIT=1 docker build -t kikiprojecto/neurocoder-ai:v1 .

# Use build cache
docker build --cache-from kikiprojecto/neurocoder-ai:latest \
  -t kikiprojecto/neurocoder-ai:v1 .
```

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - Use `.env` files (already in .gitignore)
   - Pass secrets via environment variables

2. **Use non-root user**
   - Already configured in Dockerfile

3. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Scan for vulnerabilities**
   ```bash
   docker scan kikiprojecto/neurocoder-ai:v1
   ```

## 📈 Scaling

### Horizontal Scaling

```bash
# Deploy multiple instances
for i in {1..3}; do
  nosana job post \
    --file ./nos_job_def/nosana_mastra.json \
    --market nvidia-3090 \
    --timeout 30
done
```

### Load Balancing

- Use Nosana's built-in load balancing
- Configure multiple job instances
- Monitor performance metrics

## 🎯 Production Checklist

- [ ] Docker image builds successfully
- [ ] Local testing passes
- [ ] Health endpoint responds
- [ ] API endpoints work correctly
- [ ] Image pushed to Docker Hub
- [ ] Nosana job definition validated
- [ ] Environment variables configured
- [ ] Resource requirements set
- [ ] Monitoring enabled
- [ ] Backup plan in place

## 📚 Additional Resources

- [Nosana Documentation](https://docs.nosana.io)
- [Docker Documentation](https://docs.docker.com)
- [Mastra Documentation](https://mastra.ai/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Support

- GitHub Issues: [Your Repo URL]
- Nosana Discord: [Nosana Community](https://discord.gg/nosana)
- Documentation: See README.md

---

**Built with ❤️ for Nosana Agents 102 Challenge**
