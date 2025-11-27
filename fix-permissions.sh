#!/bin/bash

# GLB Viewer - Fix Upload Permissions
# This script fixes permission issues for model uploads in Docker deployments

set -e

echo "🔧 GLB Viewer Upload Permission Fixer"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs sudo privileges to fix permissions."
    echo "Please run: sudo $0"
    exit 1
fi

# Detect models directory from docker-compose or ask user
MODELS_DIR=""

if [ -f "docker-compose.yml" ]; then
    echo "📁 Found docker-compose.yml"
    # Try to extract models directory from docker-compose.yml
    MODELS_DIR=$(grep -A 5 "volumes:" docker-compose.yml | grep "/app/public/models" | cut -d':' -f1 | xargs | sed 's/^- //')
    
    if [ -n "$MODELS_DIR" ]; then
        echo "   Detected models directory: $MODELS_DIR"
    fi
fi

# If not detected, ask user
if [ -z "$MODELS_DIR" ]; then
    read -p "Enter the full path to your models directory: " MODELS_DIR
fi

# Expand tilde if present
MODELS_DIR="${MODELS_DIR/#\~/$HOME}"

# Verify directory exists
if [ ! -d "$MODELS_DIR" ]; then
    echo "❌ Directory not found: $MODELS_DIR"
    echo "   Creating directory..."
    mkdir -p "$MODELS_DIR"
fi

echo ""
echo "📊 Current permissions:"
ls -lhd "$MODELS_DIR"
echo ""

# Show current owner
CURRENT_OWNER=$(stat -c '%u:%g' "$MODELS_DIR" 2>/dev/null || stat -f '%u:%g' "$MODELS_DIR")
echo "   Current owner: UID:GID = $CURRENT_OWNER"
echo "   Required owner: UID:GID = 1001:1001 (container user)"
echo ""

# Ask for confirmation
read -p "Fix permissions by changing owner to 1001:1001? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Fix permissions
echo "🔧 Fixing permissions..."
chown -R 1001:1001 "$MODELS_DIR"
chmod -R 755 "$MODELS_DIR"

echo "✅ Permissions fixed!"
echo ""
echo "📊 New permissions:"
ls -lhd "$MODELS_DIR"
echo ""

# Check if container is running and offer to restart
if command -v docker &> /dev/null; then
    CONTAINER=$(docker ps --filter "ancestor=glb-viewer" --format "{{.Names}}" | head -n1)
    
    if [ -z "$CONTAINER" ]; then
        CONTAINER=$(docker ps --filter "name=glb-viewer" --format "{{.Names}}" | head -n1)
    fi
    
    if [ -n "$CONTAINER" ]; then
        echo "🐳 Found running container: $CONTAINER"
        read -p "Restart container to apply changes? (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "   Restarting container..."
            docker restart "$CONTAINER"
            echo "   ✅ Container restarted"
        fi
        
        # Test if container can write
        echo ""
        echo "🧪 Testing write permissions..."
        if docker exec "$CONTAINER" touch /app/public/models/.permission_test 2>/dev/null; then
            docker exec "$CONTAINER" rm /app/public/models/.permission_test 2>/dev/null
            echo "   ✅ Write test successful! Container can write to the models directory."
        else
            echo "   ❌ Write test failed. There may be other issues."
            echo "   Check container logs: docker logs $CONTAINER"
        fi
    fi
fi

echo ""
echo "✨ Done! You should now be able to upload models."
echo ""
echo "Test with:"
echo "curl -X POST http://localhost:3000/api/upload \\"
echo "  -H \"X-API-Key: your-api-key\" \\"
echo "  -F \"file=@/path/to/model.glb\""
