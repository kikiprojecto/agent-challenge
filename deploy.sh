#!/bin/bash

# NeuroCoder AI - Deployment Script
# Usage: ./deploy.sh [build|test|push|deploy|all]

set -e

IMAGE_NAME="kikiprojecto/neurocoder-ai"
VERSION="v1"
FULL_IMAGE="${IMAGE_NAME}:${VERSION}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build Docker image
build() {
    echo_info "Building Docker image: ${FULL_IMAGE}"
    docker build -t ${FULL_IMAGE} .
    docker tag ${FULL_IMAGE} ${IMAGE_NAME}:latest
    echo_info "Build complete!"
}

# Test Docker image locally
test() {
    echo_info "Testing Docker image locally..."
    
    # Stop any existing container
    docker stop neurocoder-test 2>/dev/null || true
    docker rm neurocoder-test 2>/dev/null || true
    
    # Run container
    echo_info "Starting container..."
    docker run -d \
        --name neurocoder-test \
        -p 3000:3000 \
        -e OLLAMA_API_URL=http://localhost:11434/api \
        -e MODEL_NAME_AT_ENDPOINT=qwen3:8b \
        ${FULL_IMAGE}
    
    # Wait for container to start
    echo_info "Waiting for container to start..."
    sleep 10
    
    # Test health endpoint
    echo_info "Testing health endpoint..."
    if curl -f http://localhost:3000/api/health; then
        echo_info "Health check passed!"
    else
        echo_error "Health check failed!"
        docker logs neurocoder-test
        exit 1
    fi
    
    # Test generate endpoint
    echo_info "Testing generate endpoint..."
    curl -X POST http://localhost:3000/api/generate \
        -H "Content-Type: application/json" \
        -d '{
            "prompt": "Create a hello world function",
            "language": "python"
        }' | jq .
    
    echo_info "Test complete! Container is running on http://localhost:3000"
    echo_warn "To stop: docker stop neurocoder-test"
}

# Push to Docker Hub
push() {
    echo_info "Pushing to Docker Hub..."
    
    # Check if logged in
    if ! docker info | grep -q "Username"; then
        echo_warn "Not logged in to Docker Hub. Running docker login..."
        docker login
    fi
    
    echo_info "Pushing ${FULL_IMAGE}..."
    docker push ${FULL_IMAGE}
    
    echo_info "Pushing ${IMAGE_NAME}:latest..."
    docker push ${IMAGE_NAME}:latest
    
    echo_info "Push complete!"
}

# Deploy to Nosana
deploy() {
    echo_info "Deploying to Nosana..."
    
    # Check if Nosana CLI is installed
    if ! command -v nosana &> /dev/null; then
        echo_error "Nosana CLI not found. Install with: npm install -g @nosana/cli"
        exit 1
    fi
    
    # Check if job definition exists
    if [ ! -f "./nos_job_def/nosana_mastra.json" ]; then
        echo_error "Job definition not found: ./nos_job_def/nosana_mastra.json"
        exit 1
    fi
    
    echo_info "Posting job to Nosana..."
    nosana job post \
        --file ./nos_job_def/nosana_mastra.json \
        --market nvidia-3090 \
        --timeout 30
    
    echo_info "Deployment initiated! Check status with: nosana job list"
}

# Main script
case "${1:-all}" in
    build)
        build
        ;;
    test)
        test
        ;;
    push)
        push
        ;;
    deploy)
        deploy
        ;;
    all)
        echo_info "Running full deployment pipeline..."
        build
        test
        push
        deploy
        echo_info "All steps complete!"
        ;;
    *)
        echo "Usage: $0 {build|test|push|deploy|all}"
        echo ""
        echo "Commands:"
        echo "  build   - Build Docker image"
        echo "  test    - Test Docker image locally"
        echo "  push    - Push image to Docker Hub"
        echo "  deploy  - Deploy to Nosana"
        echo "  all     - Run all steps (default)"
        exit 1
        ;;
esac
