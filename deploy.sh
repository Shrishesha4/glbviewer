#!/bin/bash

# Deployment script for GLB Viewer
# This script pulls and runs the GLB Viewer from a registry

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 GLB Viewer Deployment Script${NC}\n"

# Default values
IMAGE_NAME="glb-viewer"
VERSION="latest"
REGISTRY=""
PORT="3000"
CONTAINER_NAME="glb-viewer"
MODELS_DIR="./models"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--image)
      IMAGE_NAME="$2"
      shift 2
      ;;
    -v|--version)
      VERSION="$2"
      shift 2
      ;;
    -r|--registry)
      REGISTRY="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -m|--models-dir)
      MODELS_DIR="$2"
      shift 2
      ;;
    -n|--name)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./deploy.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -i, --image IMAGE        Image name (default: glb-viewer)"
      echo "  -v, --version VERSION    Image version (default: latest)"
      echo "  -r, --registry REGISTRY  Registry prefix (e.g., username/)"
      echo "  -p, --port PORT          Host port (default: 3000)"
      echo "  -m, --models-dir DIR     Models directory path (default: ./models)"
      echo "  -n, --name NAME          Container name (default: glb-viewer)"
      echo "  -h, --help               Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./deploy.sh"
      echo "  ./deploy.sh -r myusername/ -v 1.0.0"
      echo "  ./deploy.sh -r ghcr.io/myusername/ -p 8080"
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
echo "  Image: ${FULL_IMAGE_NAME}:${VERSION}"
echo "  Container name: ${CONTAINER_NAME}"
echo "  Port: ${PORT}"
echo "  Models directory: ${MODELS_DIR}"
echo ""

# Create models directory if it doesn't exist
if [ ! -d "$MODELS_DIR" ]; then
  echo -e "${YELLOW}📁 Creating models directory...${NC}"
  mkdir -p "$MODELS_DIR"
fi

# Stop and remove existing container if it exists
if [ "$(docker ps -a -q -f name=${CONTAINER_NAME})" ]; then
  echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
  docker stop "${CONTAINER_NAME}" || true
  docker rm "${CONTAINER_NAME}" || true
fi

# Pull the latest image if registry is specified
if [ -n "$REGISTRY" ]; then
  echo -e "${GREEN}📥 Pulling image from registry...${NC}"
  docker pull "${FULL_IMAGE_NAME}:${VERSION}"
fi

# Run the container
echo -e "${GREEN}🐳 Starting container...${NC}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:3000" \
  -v "$(pwd)/${MODELS_DIR}:/app/public/models:ro" \
  --restart unless-stopped \
  "${FULL_IMAGE_NAME}:${VERSION}"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}\n"
echo "The GLB Viewer is now running at:"
echo "  http://localhost:${PORT}"
echo ""
echo "To view logs:"
echo "  docker logs -f ${CONTAINER_NAME}"
echo ""
echo "To stop the container:"
echo "  docker stop ${CONTAINER_NAME}"
