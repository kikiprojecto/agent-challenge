# NeuroCoder AI - Deployment Script (PowerShell)
# Usage: .\deploy.ps1 [build|test|push|deploy|all]

param(
    [Parameter(Position=0)]
    [ValidateSet('build', 'test', 'push', 'deploy', 'all')]
    [string]$Command = 'all'
)

$ImageName = "kikiprojecto/neurocoder-ai"
$Version = "v1"
$FullImage = "${ImageName}:${Version}"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Build-Image {
    Write-Info "Building Docker image: $FullImage"
    docker build -t $FullImage .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed!"
        exit 1
    }
    docker tag $FullImage "${ImageName}:latest"
    Write-Info "Build complete!"
}

function Test-Image {
    Write-Info "Testing Docker image locally..."
    
    # Stop any existing container
    docker stop neurocoder-test 2>$null
    docker rm neurocoder-test 2>$null
    
    # Run container
    Write-Info "Starting container..."
    docker run -d `
        --name neurocoder-test `
        -p 3000:3000 `
        -e OLLAMA_API_URL=http://localhost:11434/api `
        -e MODEL_NAME_AT_ENDPOINT=qwen3:8b `
        $FullImage
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start container!"
        exit 1
    }
    
    # Wait for container to start
    Write-Info "Waiting for container to start..."
    Start-Sleep -Seconds 10
    
    # Test health endpoint
    Write-Info "Testing health endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Info "Health check passed!"
            Write-Host $response.Content
        }
    } catch {
        Write-Error "Health check failed!"
        docker logs neurocoder-test
        exit 1
    }
    
    # Test generate endpoint
    Write-Info "Testing generate endpoint..."
    try {
        $body = @{
            prompt = "Create a hello world function"
            language = "python"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000/api/generate" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing
        
        Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
    } catch {
        Write-Warn "Generate endpoint test failed (this is okay if Ollama is not running)"
    }
    
    Write-Info "Test complete! Container is running on http://localhost:3000"
    Write-Warn "To stop: docker stop neurocoder-test"
}

function Push-Image {
    Write-Info "Pushing to Docker Hub..."
    
    # Check if logged in
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -notmatch "Username") {
        Write-Warn "Not logged in to Docker Hub. Running docker login..."
        docker login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker login failed!"
            exit 1
        }
    }
    
    Write-Info "Pushing $FullImage..."
    docker push $FullImage
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Push failed!"
        exit 1
    }
    
    Write-Info "Pushing ${ImageName}:latest..."
    docker push "${ImageName}:latest"
    
    Write-Info "Push complete!"
}

function Deploy-ToNosana {
    Write-Info "Deploying to Nosana..."
    
    # Check if Nosana CLI is installed
    $nosanaCmd = Get-Command nosana -ErrorAction SilentlyContinue
    if (-not $nosanaCmd) {
        Write-Error "Nosana CLI not found. Install with: npm install -g @nosana/cli"
        exit 1
    }
    
    # Check if job definition exists
    if (-not (Test-Path "./nos_job_def/nosana_mastra.json")) {
        Write-Error "Job definition not found: ./nos_job_def/nosana_mastra.json"
        exit 1
    }
    
    Write-Info "Posting job to Nosana..."
    nosana job post `
        --file ./nos_job_def/nosana_mastra.json `
        --market nvidia-3090 `
        --timeout 30
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment failed!"
        exit 1
    }
    
    Write-Info "Deployment initiated! Check status with: nosana job list"
}

# Main script execution
switch ($Command) {
    'build' {
        Build-Image
    }
    'test' {
        Test-Image
    }
    'push' {
        Push-Image
    }
    'deploy' {
        Deploy-ToNosana
    }
    'all' {
        Write-Info "Running full deployment pipeline..."
        Build-Image
        Test-Image
        Push-Image
        Deploy-ToNosana
        Write-Info "All steps complete!"
    }
}
