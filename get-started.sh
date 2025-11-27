#!/bin/bash

# Getting Started Script
# This script helps you set up and run the GLB Viewer quickly

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║           GLB Viewer - Getting Started               ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if command_exists node; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
  echo -e "${YELLOW}! Node.js not found (required for local development)${NC}"
fi

if command_exists npm; then
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
  echo -e "${YELLOW}! npm not found (required for local development)${NC}"
fi

if command_exists docker; then
  DOCKER_VERSION=$(docker -v)
  echo -e "${GREEN}✓${NC} Docker installed: $DOCKER_VERSION"
else
  echo -e "${YELLOW}! Docker not found (required for Docker deployment)${NC}"
fi

echo ""

# Ask user which setup they want
echo -e "${YELLOW}How would you like to run the GLB Viewer?${NC}"
echo "1) Local development (npm)"
echo "2) Docker Compose"
echo "3) Download sample models only"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    echo -e "\n${BLUE}Setting up for local development...${NC}\n"
    
    if [ ! -d "node_modules" ]; then
      echo -e "${YELLOW}Installing dependencies...${NC}"
      npm install
      echo -e "${GREEN}✓ Dependencies installed${NC}\n"
    else
      echo -e "${GREEN}✓ Dependencies already installed${NC}\n"
    fi
    
    if [ ! -d "public/models" ]; then
      mkdir -p public/models
    fi
    
    # Ask about sample models
    read -p "Download sample models for testing? (y/n): " download_samples
    if [ "$download_samples" = "y" ] || [ "$download_samples" = "Y" ]; then
      ./download-samples.sh
    fi
    
    echo -e "\n${GREEN}✓ Setup complete!${NC}\n"
    echo -e "${YELLOW}To start the development server, run:${NC}"
    echo -e "  ${BLUE}npm run dev${NC}\n"
    echo -e "Then open: ${BLUE}http://localhost:3000${NC}\n"
    
    read -p "Start development server now? (y/n): " start_now
    if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
      echo -e "\n${GREEN}Starting development server...${NC}\n"
      npm run dev
    fi
    ;;
    
  2)
    echo -e "\n${BLUE}Setting up for Docker...${NC}\n"
    
    if ! command_exists docker; then
      echo -e "${YELLOW}Docker is not installed. Please install Docker first.${NC}"
      exit 1
    fi
    
    if [ ! -d "models" ]; then
      mkdir -p models
      echo -e "${GREEN}✓ Created models directory${NC}"
    fi
    
    # Ask about sample models
    read -p "Download sample models for testing? (y/n): " download_samples
    if [ "$download_samples" = "y" ] || [ "$download_samples" = "Y" ]; then
      # Download to Docker models directory
      mkdir -p models
      echo "Downloading to models/ directory..."
      curl -L -o models/Duck.glb "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb"
      curl -L -o models/Avocado.glb "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb"
      echo -e "${GREEN}✓ Sample models downloaded${NC}"
    fi
    
    echo -e "\n${GREEN}✓ Setup complete!${NC}\n"
    echo -e "${YELLOW}To start with Docker Compose, run:${NC}"
    echo -e "  ${BLUE}docker-compose up -d${NC}\n"
    echo -e "Then open: ${BLUE}http://localhost:3000${NC}\n"
    
    read -p "Start Docker container now? (y/n): " start_now
    if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
      echo -e "\n${GREEN}Building and starting Docker container...${NC}\n"
      docker-compose up -d
      echo -e "\n${GREEN}✓ Container started!${NC}"
      echo -e "\nView logs with: ${BLUE}docker-compose logs -f${NC}"
      echo -e "Stop with: ${BLUE}docker-compose down${NC}\n"
      echo -e "Open: ${BLUE}http://localhost:3000${NC}\n"
    fi
    ;;
    
  3)
    echo -e "\n${BLUE}Downloading sample models...${NC}\n"
    ./download-samples.sh
    ;;
    
  4)
    echo -e "\n${YELLOW}Exiting...${NC}\n"
    exit 0
    ;;
    
  *)
    echo -e "\n${YELLOW}Invalid choice. Exiting...${NC}\n"
    exit 1
    ;;
esac

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║           Setup Complete! Happy viewing! 🎉          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

echo -e "For more information, see:"
echo -e "  - ${BLUE}README.md${NC} for full documentation"
echo -e "  - ${BLUE}QUICKSTART.md${NC} for quick reference"
echo -e "  - ${BLUE}SETUP.md${NC} for deployment guide"
echo ""
