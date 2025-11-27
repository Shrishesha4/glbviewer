#!/bin/bash

# Script to download sample GLB models for testing
# These models are from Khronos Group's glTF Sample Models repository

set -e

MODELS_DIR="./public/models"

echo "🎨 Downloading sample GLB models for testing..."
echo ""

# Create models directory if it doesn't exist
mkdir -p "$MODELS_DIR"

# Download sample models
echo "📥 Downloading sample models..."

# Duck model (small, good for testing)
if [ ! -f "$MODELS_DIR/Duck.glb" ]; then
  echo "  - Duck.glb"
  curl -L -o "$MODELS_DIR/Duck.glb" \
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb"
fi

# Avocado model
if [ ! -f "$MODELS_DIR/Avocado.glb" ]; then
  echo "  - Avocado.glb"
  curl -L -o "$MODELS_DIR/Avocado.glb" \
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb"
fi

# Box model (very simple)
if [ ! -f "$MODELS_DIR/Box.glb" ]; then
  echo "  - Box.glb"
  curl -L -o "$MODELS_DIR/Box.glb" \
    "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb"
fi

echo ""
echo "✅ Sample models downloaded successfully!"
echo ""
echo "Models are now available in: $MODELS_DIR"
echo ""
echo "Start the app with:"
echo "  npm run dev"
echo ""
echo "Or with Docker:"
echo "  docker-compose up -d"
