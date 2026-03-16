#!/bin/bash

# SynthezOPEDIA Deploy Script (VPS)
# Run on VPS to update from GitHub
# Usage: ./deploy-vps.sh [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Make scripts executable
chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true

CONTAINER_NAME="synthezopedia"
IMAGE_NAME="synthezopedia:latest"
BRANCH="main"

# Set upstream branch
git branch --set-upstream-to=origin/$BRANCH $BRANCH 2>/dev/null || true

show_help() {
    cat << EOF
SynthezOPEDIA Deploy Script (VPS)

Usage: ./deploy-vps.sh [OPTIONS]

Options:
    -p, --pull      Pull changes and restart (fast update)
    -c, --check     Check container status and logs
    -h, --hard      Full reinstall (stop, remove, rebuild, start)
    --help          Show this help message

Examples:
    ./deploy-vps.sh -p          # Fast update (pull + restart)
    ./deploy-vps.sh --check    # Check status and logs
    ./deploy-vps.sh --hard     # Full reinstall
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
        -h|--hard)
            MODE="hard"
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

echo "🚀 Mode: $MODE"

# CHECK STATUS
if [ "$MODE" = "check" ]; then
    echo ""
    echo "📊 Container status:"
    docker ps -a | grep "$CONTAINER_NAME" || echo "Container not found"
    echo ""
    echo "📜 Recent logs:"
    docker logs "$CONTAINER_NAME" --tail 30 2>&1 || echo "No logs available"
    echo ""
    echo "🌐 Port check:"
    curl -s --connect-timeout 5 http://localhost:3001/ | head -10 || echo "Connection failed"
    exit 0
fi

# HARD REINSTALL
if [ "$MODE" = "hard" ]; then
    echo "🛑 Stopping and removing container..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    
    echo "🗑️ Removing old image..."
    docker image rm "$IMAGE_NAME" 2>/dev/null || true
    
    echo "📥 Pulling latest code..."
    git fetch --all
    git reset --hard origin/"$BRANCH"
    
    echo "🏗️ Building Docker image..."
    docker build -t "$IMAGE_NAME" .
    
    echo "🚀 Starting container..."
    docker run -d --name "$CONTAINER_NAME" --restart=unless-stopped -p 3001:3000 \
        -v ./data:/app/data \
        -v ./cache:/app/static/images/cache \
        --env-file .env "$IMAGE_NAME"
    
    echo ""
    echo "✅ Hard reinstall complete!"
    docker ps -a | grep "$CONTAINER_NAME"
    exit 0
fi

# PULL AND RESTART (default)
echo "📥 Pulling changes from GitHub..."
git fetch --all
git pull origin "$BRANCH" 2>/dev/null || git merge origin/"$BRANCH" 2>/dev/null || git reset --hard origin/"$BRANCH"

echo "🏗️ Building Docker image..."
docker build -t "$IMAGE_NAME" .

echo "🔄 Restarting container..."
docker restart "$CONTAINER_NAME"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Container status:"
docker ps -a | grep "$CONTAINER_NAME" || echo "Container not found"
echo ""
echo "Access the site at:"
echo "   http://62.171.162.59:3001/"
