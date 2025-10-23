# GitHub Actions Deployment Setup Script
# This script helps you set up deployment without Docker Desktop

Write-Host "`n=== NeuroCoder AI - GitHub Actions Setup ===" -ForegroundColor Cyan
Write-Host "Deploy without Docker Desktop!" -ForegroundColor Green

# Check if git is installed
Write-Host "`n1. Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Git not found. Please install Git first:" -ForegroundColor Red
    Write-Host "     Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if Nosana CLI is installed
Write-Host "`n2. Checking Nosana CLI..." -ForegroundColor Yellow
try {
    $nosanaVersion = nosana --version 2>&1
    Write-Host "   ✓ Nosana CLI installed: $nosanaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Nosana CLI not found" -ForegroundColor Red
    Write-Host "   Installing Nosana CLI..." -ForegroundColor Yellow
    npm install -g @nosana/cli
    Write-Host "   ✓ Nosana CLI installed" -ForegroundColor Green
}

# Check if already a git repository
Write-Host "`n3. Checking Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✓ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "   Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "   ✓ Git repository initialized" -ForegroundColor Green
}

# Check if GitHub workflow exists
Write-Host "`n4. Checking GitHub Actions workflow..." -ForegroundColor Yellow
if (Test-Path ".github\workflows\deploy.yml") {
    Write-Host "   ✓ GitHub Actions workflow exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ GitHub Actions workflow not found" -ForegroundColor Red
    Write-Host "   Please make sure .github/workflows/deploy.yml exists" -ForegroundColor Yellow
}

# Provide next steps
Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan

Write-Host "`n📋 Step 1: Create GitHub Repository" -ForegroundColor Yellow
Write-Host "   1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "   2. Repository name: neurocoder-ai" -ForegroundColor White
Write-Host "   3. Keep it Public" -ForegroundColor White
Write-Host "   4. Don't initialize with README" -ForegroundColor White
Write-Host "   5. Click 'Create repository'" -ForegroundColor White

Write-Host "`n📋 Step 2: Add Docker Hub Secrets" -ForegroundColor Yellow
Write-Host "   1. Go to repository Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "   2. Add secret: DOCKER_USERNAME = kikiprojecto" -ForegroundColor White
Write-Host "   3. Add secret: DOCKER_PASSWORD = [your Docker Hub password]" -ForegroundColor White

Write-Host "`n📋 Step 3: Push Code to GitHub" -ForegroundColor Yellow
Write-Host "   Run these commands:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "git add ." -ForegroundColor Cyan
Write-Host "   " -NoNewline
Write-Host "git commit -m `"Initial commit - NeuroCoder AI`"" -ForegroundColor Cyan
Write-Host "   " -NoNewline
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/neurocoder-ai.git" -ForegroundColor Cyan
Write-Host "   " -NoNewline
Write-Host "git branch -M main" -ForegroundColor Cyan
Write-Host "   " -NoNewline
Write-Host "git push -u origin main" -ForegroundColor Cyan

Write-Host "`n📋 Step 4: Wait for Build" -ForegroundColor Yellow
Write-Host "   1. Go to Actions tab in your GitHub repository" -ForegroundColor White
Write-Host "   2. Watch the build progress (~5-10 minutes)" -ForegroundColor White
Write-Host "   3. When complete, image is on Docker Hub!" -ForegroundColor White

Write-Host "`n📋 Step 5: Deploy to Nosana" -ForegroundColor Yellow
Write-Host "   Run this command:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "nosana job post --file ./nos_job_def/nosana_mastra.json --market nvidia-3090 --timeout 30" -ForegroundColor Cyan

Write-Host "`n=== Ready to Start! ===" -ForegroundColor Green
Write-Host "Follow the steps above to deploy without Docker Desktop!" -ForegroundColor Green
Write-Host ""

# Ask if user wants to proceed with git commands
$proceed = Read-Host "`nDo you want to add and commit files now? (Y/N)"
if ($proceed -eq "Y" -or $proceed -eq "y") {
    Write-Host "`nAdding files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "Committing files..." -ForegroundColor Yellow
    git commit -m "Initial commit - NeuroCoder AI"
    
    Write-Host "`n✓ Files committed!" -ForegroundColor Green
    Write-Host "`nNext: Create GitHub repository and run:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/neurocoder-ai.git" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor Cyan
}
