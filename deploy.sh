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

# ============================================
# ADDITIONAL COMMANDS (run manually on server)
# ============================================

# 1. Обновление изменений:
# ------------------------------------
# 1. Войти в директорию проекта
# cd /opt/docker/synthezopedia
# 2. Обновить код с GitHub
# git pull origin master --force
# 3. Пересобрать Docker образ
# docker build -t synthezopedia:latest .
# 4. Перезапустить контейнер
# docker restart synthezopedia

# 2. Проверка статуса:
# ------------------------------------
# Статус контейнера
# docker ps -a | grep synthezopedia
# Логи контейнера
# docker logs synthezopedia --tail 20
# Проверка порта
# curl http://localhost:3001/ | head -5

# 3. Полная переустановка (если сломалось):
# ------------------------------------
# Остановить и удалить
# docker stop synthezopedia && docker rm synthezopedia
# docker image rm synthezopedia:latest
# Собрать заново
# docker build -t synthezopedia:latest .
# docker run -d --name synthezopedia --restart=unless-stopped -p 3001:3000 synthezopedia:latest
