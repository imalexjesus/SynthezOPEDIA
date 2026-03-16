#!/bin/bash

# Script to update and deploy SynthezOPEDIA
# Usage: ./deploy.sh [options]

set -e  # Exit on error

REPO_DIR="/opt/docker/synthezopedia"
CONTAINER_NAME="synthezopedia"
IMAGE_NAME="synthezopedia:latest"
BRANCH="master"

show_help() {
    cat << EOF
SynthezOPEDIA Deploy Script

Usage: ./deploy.sh [OPTIONS]

Options:
    -f, --force    Force pull (reset local changes)
    -h, --help     Show this help message

Examples:
    ./deploy.sh           # Normal update
    ./deploy.sh --force   # Force update (reset changes)
EOF
}

# Parse arguments
FORCE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
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

echo "🚀 Starting deployment..."

# Step 1: Navigate to project directory
echo "📁 Changing to project directory..."
cd "$REPO_DIR" || exit 1

# Step 2: Pull changes from GitHub
echo "📥 Pulling changes from GitHub..."
if [ "$FORCE" = true ]; then
    echo "   Force mode enabled - resetting local changes..."
    git fetch --all
    git reset --hard origin/"$BRANCH"
else
    git pull origin "$BRANCH"
fi

# Step 3: Build Docker image
echo "🏗️ Building Docker image..."
docker build -t "$IMAGE_NAME" .

# Step 4: Restart container
echo "🔄 Restarting container..."
docker restart "$CONTAINER_NAME"

# Step 5: Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Container status:"
docker ps -a | grep "$CONTAINER_NAME" || echo "Container not found"
echo ""
echo "Access the site at:"
echo "   http://62.171.162.59:3001/"
echo "   http://synth.alexj.top (when NPM configured)"
