# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your 3D models:**
   ```bash
   # Place .glb or .gltf files in public/models/
   cp /path/to/your/model.glb public/models/
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open browser:** http://localhost:3000

### Option 2: Docker (Recommended for Production)

1. **Add your models:**
   ```bash
   mkdir models
   cp /path/to/your/model.glb models/
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Open browser:** http://localhost:3000

## 📦 Building and Deploying to Registry

### Using the Build Script

```bash
# Simple build
./build.sh

# Build with version and push to Docker Hub
./build.sh -r yourusername/ -v 1.0.0 -p

# Build and push to GitHub Container Registry
./build.sh -r ghcr.io/yourusername/ -v 1.0.0 -p
```

### Using the Deploy Script

```bash
# Deploy from Docker Hub
./deploy.sh -r yourusername/ -v 1.0.0

# Deploy from GitHub Container Registry on custom port
./deploy.sh -r ghcr.io/yourusername/ -v 1.0.0 -p 8080

# Deploy with custom models directory
./deploy.sh -r yourusername/ -m /path/to/models
```

## 🎯 Usage

### Browse Models
Navigate to: `http://localhost:3000/explore`

### View Specific Model
Navigate to: `http://localhost:3000/view/yourmodel.glb`

## 🔧 Common Commands

```bash
# Local development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Docker
docker-compose up -d              # Start container
docker-compose down               # Stop container
docker-compose logs -f            # View logs
docker-compose restart            # Restart container

# Scripts
./build.sh -h                     # Build help
./deploy.sh -h                    # Deploy help
```

## 📁 Adding Models

Simply place your `.glb` or `.gltf` files in:
- **Local dev:** `public/models/`
- **Docker:** `models/` (automatically mounted)

The app will automatically detect and display them!

## 🆘 Need Help?

Check the full [README.md](./README.md) for detailed documentation.
