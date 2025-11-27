#!/bin/bash

# Build script for GLB Viewer
# This script builds the Docker image and optionally pushes it to a registry

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 GLB Viewer Build Script${NC}\n"

# Default values
IMAGE_NAME="glb-viewer"
VERSION="latest"
REGISTRY=""
PUSH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--version)
      VERSION="$2"
      shift 2
      ;;
    -r|--registry)
      REGISTRY="$2"
      shift 2
      ;;
    -p|--push)
      PUSH=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./build.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -v, --version VERSION    Set image version (default: latest)"
      echo "  -r, --registry REGISTRY  Set registry prefix (e.g., username/)"
      echo "  -p, --push              Push to registry after build"
      echo "  -h, --help              Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./build.sh"
      echo "  ./build.sh -v 1.0.0"
      echo "  ./build.sh -r myusername/ -v 1.0.0 -p"
      echo "  ./build.sh -r ghcr.io/myusername/ -v 1.0.0 -p"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Construct full image name
if [ -n "$REGISTRY" ]; then
  FULL_IMAGE_NAME="${REGISTRY}${IMAGE_NAME}"
else
  FULL_IMAGE_NAME="${IMAGE_NAME}"
fi

echo -e "${YELLOW}Configuration:${NC}"
echo "  Image name: ${FULL_IMAGE_NAME}"
echo "  Version: ${VERSION}"
echo "  Push to registry: ${PUSH}"
echo ""

# Build the image
echo -e "${GREEN}📦 Building Docker image...${NC}"
docker build -t "${FULL_IMAGE_NAME}:${VERSION}" .

# Tag as latest if version is not latest
if [ "$VERSION" != "latest" ]; then
  echo -e "${GREEN}🏷️  Tagging as latest...${NC}"
  docker tag "${FULL_IMAGE_NAME}:${VERSION}" "${FULL_IMAGE_NAME}:latest"
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}\n"

# Push if requested
if [ "$PUSH" = true ]; then
  if [ -z "$REGISTRY" ]; then
    echo -e "${RED}❌ Error: Registry must be specified when pushing${NC}"
    echo "Use -r or --registry to specify a registry"
    exit 1
  fi
  
  echo -e "${GREEN}📤 Pushing to registry...${NC}"
  docker push "${FULL_IMAGE_NAME}:${VERSION}"
  
  if [ "$VERSION" != "latest" ]; then
    docker push "${FULL_IMAGE_NAME}:latest"
  fi
  
  echo -e "${GREEN}✅ Push completed successfully!${NC}\n"
fi

echo -e "${GREEN}🎉 Done!${NC}"
echo ""
echo "To run the container locally:"
echo "  docker run -d -p 3000:3000 -v \$(pwd)/models:/app/public/models:ro ${FULL_IMAGE_NAME}:${VERSION}"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up -d"
