#!/bin/bash

# SynthezOPEDIA Deploy Script (LOCAL)
# Run from local machine to build and deploy to VPS
# Usage: ./deploy-local.sh [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Make scripts executable
chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true

show_help() {
    cat << EOF
SynthezOPEDIA Deploy Script (LOCAL)

Usage: ./deploy-local.sh [OPTIONS]

Options:
    -p, --pull      Pull changes, build and deploy
    -c, --check     Check local build status
    --help          Show this help message

Examples:
    ./deploy-local.sh -p          # Build and deploy to VPS
    ./deploy-local.sh --check     # Check status
EOF
}

# Parse arguments
MODE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--pull)
            MODE="pull"
            shift
            ;;
        -c|--check)
            MODE="check"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

if [ -z "$MODE" ]; then
    MODE="pull"
fi

VPS_HOST="62.171.162.59"
VPS_USER="root"
VPS_PATH="/opt/docker/synthezopedia"

echo "🚀 Mode: $MODE"

# CHECK
if [ "$MODE" = "check" ]; then
    echo "📊 Checking git status..."
    git status
    echo ""
    echo "📜 Recent commits:"
    git log --oneline -5
    exit 0
fi

# PULL, BUILD, DEPLOY
echo "📥 Pulling latest changes..."
git fetch --all
git pull origin main

echo "🏗️ Building Docker image locally..."
docker build -t synthezopedia:latest .

echo "📦 Saving Docker image..."
docker save synthezopedia:latest -o /tmp/synthezopedia.tar

echo "🚀 Deploying to VPS..."
scp /tmp/synthezopedia.tar ${VPS_USER}@${VPS_HOST}:/tmp/
ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker load -i /tmp/synthezopedia.tar && docker stop synthezopedia 2>/dev/null || true && docker rm synthezopedia 2>/dev/null || true && docker run -d --name synthezopedia --restart=unless-stopped -p 3001:3000 -v \$(pwd)/data:/app/data -v \$(pwd)/cache:/app/static/images/cache --env-file .env synthezopedia:latest"

rm /tmp/synthezopedia.tar

echo ""
echo "✅ Deployment complete!"
echo "Access the site at: http://${VPS_HOST}:3001/"
