#!/bin/bash

# SynthezOPEDIA Git workflow script
# Usage: ./git.sh [options]

set -e

show_help() {
    cat << EOF
SynthezOPEDIA Git Workflow Script

Usage: ./git.sh [OPTIONS]

Options:
    -s, --status     Check git status
    -l, --log         Show recent commits
    -d, --diff        Show unstaged changes
    -a, --add         Add all changes and show diff
    -c, --commit      Commit with message (use -m "message")
    -p, --push        Push to remote
    -m, --message     Commit message (use with -c)
    --all             Add, commit and push
    --help            Show this help message

Examples:
    ./git.sh --status           # Check status
    ./git.sh --log -3           # Show last 3 commits
    ./git.sh --diff             # Show changes
    ./git.sh --commit -m "Fix bug"   # Commit with message
    ./git.sh --all -m "Feature"      # Add, commit, push
EOF
}

# Parse arguments
COMMAND=""
MESSAGE=""
LOG_COUNT=5

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--status)
            COMMAND="status"
            shift
            ;;
        -l|--log)
            COMMAND="log"
            shift
            # Check if next arg is a number
            if [[ "$1" =~ ^[0-9]+$ ]]; then
                LOG_COUNT=$1
                shift
            fi
            ;;
        -d|--diff)
            COMMAND="diff"
            shift
            ;;
        -a|--add)
            COMMAND="add"
            shift
            ;;
        -c|--commit)
            COMMAND="commit"
            shift
            ;;
        -m|--message)
            shift
            MESSAGE="$1"
            shift
            ;;
        -p|--push)
            COMMAND="push"
            shift
            ;;
        --all)
            COMMAND="all"
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

# ============================================
# STATUS
# ============================================
if [ "$COMMAND" = "status" ]; then
    git status
    exit 0
fi

# ============================================
# LOG
# ============================================
if [ "$COMMAND" = "log" ]; then
    git log --oneline -"$LOG_COUNT"
    exit 0
fi

# ============================================
# DIFF
# ============================================
if [ "$COMMAND" = "diff" ]; then
    git diff
    exit 0
fi

# ============================================
# ADD ALL
# ============================================
if [ "$COMMAND" = "add" ]; then
    git add -A
    echo "Added all files to staging"
    git status
    exit 0
fi

# ============================================
# COMMIT
# ============================================
if [ "$COMMAND" = "commit" ]; then
    if [ -z "$MESSAGE" ]; then
        echo "Error: -m required for commit"
        show_help
        exit 1
    fi
    git add -A
    git commit -m "$MESSAGE"
    echo "Committed: $MESSAGE"
    exit 0
fi

# ============================================
# PUSH
# ============================================
if [ "$COMMAND" = "push" ]; then
    git push origin HEAD:master
    exit 0
fi

# ============================================
# ALL (add + commit + push)
# ============================================
if [ "$COMMAND" = "all" ]; then
    if [ -z "$MESSAGE" ]; then
        echo "Error: -m required for --all"
        show_help
        exit 1
    fi
    git add -A
    git commit -m "$MESSAGE"
    echo "Committed: $MESSAGE"
    git push origin HEAD:master
    echo "Pushed to origin/master"
    exit 0
fi

# Default: show help
show_help
