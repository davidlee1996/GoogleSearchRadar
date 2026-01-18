#!/bin/bash

# Docker Container Auto-Cleanup Script
# Stops containers that have been inactive for 24 hours

set -e

# Configuration
INACTIVITY_HOURS=24
PROJECT_NAME="googlesearchradar"
LOG_FILE="./docker-cleanup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Check if container is inactive for more than specified hours
is_inactive() {
    local container_name=$1
    local hours=$2

    # Get container start time
    local start_time
    start_time=$(docker inspect --format='{{.State.StartedAt}}' "$container_name" 2>/dev/null)

    if [[ -z "$start_time" ]]; then
        return 1 # Container doesn't exist
    fi

    # Convert to seconds since epoch
    local start_seconds
    start_seconds=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$(echo "$start_time" | cut -d'.' -f1)" "+%s" 2>/dev/null)

    if [[ -z "$start_seconds" ]]; then
        # Fallback for different date formats
        start_seconds=$(date -j -f "%Y-%m-%d %H:%M:%S" "$(echo "$start_time" | cut -d'.' -f1 | tr 'T' ' ')" "+%s" 2>/dev/null)
    fi

    if [[ -z "$start_seconds" ]]; then
        log "Warning: Could not parse start time for $container_name"
        return 1
    fi

    local current_seconds
    current_seconds=$(date +%s)

    local age_hours=$(( (current_seconds - start_seconds) / 3600 ))

    if [[ $age_hours -ge $hours ]]; then
        return 0 # Inactive
    else
        return 1 # Active
    fi
}

# Main cleanup function
cleanup_containers() {
    log "Starting Docker container cleanup (inactivity threshold: ${INACTIVITY_HOURS} hours)"

    # Get running containers for this project
    local containers
    containers=$(docker ps --filter "label=com.docker.compose.project=$PROJECT_NAME" --format "{{.Names}}" 2>/dev/null)

    if [[ -z "$containers" ]]; then
        log "No running containers found for project: $PROJECT_NAME"
        return 0
    fi

    local stopped_count=0

    for container in $containers; do
        log "Checking container: $container"

        if is_inactive "$container" "$INACTIVITY_HOURS"; then
            log "${YELLOW}Stopping inactive container: $container${NC}"
            if docker stop "$container" >/dev/null 2>&1; then
                log "${GREEN}Successfully stopped: $container${NC}"
                ((stopped_count++))
            else
                log "${RED}Failed to stop: $container${NC}"
            fi
        else
            log "${GREEN}Container still active: $container${NC}"
        fi
    done

    log "Cleanup complete. Stopped $stopped_count container(s)."
}

# Help function
show_help() {
    cat << EOF
Docker Container Auto-Cleanup Script

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    -p, --project NAME  Specify project name (default: googlesearchradar)
    -t, --hours HOURS   Inactivity threshold in hours (default: 24)
    --dry-run          Show what would be stopped without actually stopping

Examples:
    $0                          # Cleanup with default settings
    $0 --hours 48              # Use 48-hour threshold
    $0 --project myproject     # Cleanup different project
    $0 --dry-run               # Preview what would be stopped

This script stops Docker containers that have been running for more than
the specified hours. It only affects containers with the matching project label.
EOF
}

# Parse command line arguments
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -p|--project)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -t|--hours)
            INACTIVITY_HOURS="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Dry run mode
if [[ "$DRY_RUN" == true ]]; then
    log "DRY RUN MODE - No containers will be stopped"
    # Override the docker stop command to just log
    docker() {
        if [[ "$1" == "stop" ]]; then
            log "Would stop container: $2"
            return 0
        else
            command docker "$@"
        fi
    }
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "${RED}Error: Docker is not installed or not in PATH${NC}"
    exit 1
fi

# Run cleanup
cleanup_containers

log "Script completed successfully"