#!/bin/bash

# SynthezOPEDIA API Management Script (VPS)
# Run on VPS to manage API
# Usage: ./api-vps.sh [options]

set -e

CONTAINER_NAME="synthezopedia"
BASE_URL="http://localhost:3001"

show_help() {
    cat << EOF
SynthezOPEDIA API Management Script (VPS)

Usage: ./api-vps.sh [OPTIONS]

Options:
    -l, --list          List cached images
    -r, --refresh       Refresh all image cache from URLs
    -s, --sync          Sync all synths to NocoDB
    -g, --get           Get all synths from API
    -n, --noco          Test NocoDB connection
    --help              Show this help message

Examples:
    ./api-vps.sh --list           # List cached images
    ./api-vps.sh --refresh       # Refresh all image cache
    ./api-vps.sh --sync          # Sync all synths to NocoDB
EOF
}

# Parse arguments
MODE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--list)
            MODE="list"
            shift
            ;;
        -r|--refresh)
            MODE="refresh"
            shift
            ;;
        -s|--sync)
            MODE="sync"
            shift
            ;;
        -g|--get)
            MODE="get"
            shift
            ;;
        -n|--noco)
            MODE="noco"
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
    show_help
    exit 1
fi

# LIST CACHED IMAGES
if [ "$MODE" = "list" ]; then
    echo "📸 Listing cached images..."
    curl -s "$BASE_URL/api/images/list" | head -50
    exit 0
fi

# REFRESH ALL IMAGE CACHE
if [ "$MODE" = "refresh" ]; then
    echo "🔄 Refreshing all image cache..."
    echo "This may take a while..."
    curl -s -X POST "$BASE_URL/api/cache-image/refresh-all"
    echo ""
    echo "✅ Done!"
    exit 0
fi

# SYNC ALL SYNTHS TO NOCODB
if [ "$MODE" = "sync" ]; then
    echo "🔄 Syncing all synths to NocoDB..."
    echo "Getting all synths..."
    
    SYNTHS=$(curl -s "$BASE_URL/api/synths?includeInactive=true")
    COUNT=$(echo "$SYNTHS" | grep -o '"id"' | wc -l)
    
    echo "Found $COUNT synths"
    
    echo "$SYNTHS" | grep -o '"id":"[^"]*"' | head -10
    echo "... (showing first 10)"
    echo ""
    echo "Use /photo-tool page to sync individual synths or bulk sync"
    exit 0
fi

# GET ALL SYNTHS
if [ "$MODE" = "get" ]; then
    echo "📋 Getting all synths from API..."
    curl -s "$BASE_URL/api/synths" | head -100
    exit 0
fi

# TEST NOCODB CONNECTION
if [ "$MODE" = "noco" ]; then
    echo "🔗 Testing NocoDB connection..."
    docker exec "$CONTAINER_NAME" sh -c 'echo $NOCODB_BASE_URL'
    echo "If empty, NocoDB is not configured"
    exit 0
fi
