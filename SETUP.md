# Complete Setup & Deployment Guide

## 🎯 Project Overview

A production-ready Next.js application for viewing GLB/GLTF 2.0 3D models with:
- Interactive 3D viewer using Three.js
- File-based model management
- Browse and explore interface
- Direct model links
- Full Docker support
- Registry-ready for deployment anywhere

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Development Workflow](#development-workflow)
3. [Docker Workflow](#docker-workflow)
4. [Registry Deployment](#registry-deployment)
5. [Production Deployment](#production-deployment)

---

## 🚀 Initial Setup

### Prerequisites
- Node.js 20+ or Docker
- Git (optional)

### First Time Setup

```bash
# 1. Navigate to project
cd glbviewer

# 2. Install dependencies (for local development)
npm install

# 3. Download sample models (optional)
./download-samples.sh

# 4. You're ready to go!
```

---

## 💻 Development Workflow

### Start Development Server

```bash
npm run dev
```

Access at: http://localhost:3000

### Add Models

Place `.glb` or `.gltf` files in:
```
public/models/
```

### Project Structure

```
src/
├── app/
│   ├── api/models/          # API for listing/serving models
│   ├── explore/             # Browse all models
│   ├── view/[filename]/     # View specific model
│   └── page.tsx             # Home page
└── components/
    └── GLBViewer.tsx        # 3D viewer component
```

### Available Routes

- `/` - Home page
- `/explore` - Browse all models
- `/view/[filename]` - View specific model
- `/api/models` - List models (JSON)
- `/api/models/[filename]` - Serve model file

---

## 🐳 Docker Workflow

### Quick Start with Docker

```bash
# 1. Ensure models directory exists
mkdir -p models

# 2. Add your models to the models/ directory
cp /path/to/model.glb models/

# 3. Start with docker-compose
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Stop
docker-compose down
```

### Build Docker Image Manually

```bash
# Build
docker build -t glb-viewer:latest .

# Run
docker run -d \
  --name glb-viewer \
  -p 3000:3000 \
  -v $(pwd)/models:/app/public/models:ro \
  glb-viewer:latest
```

### Volume Mounting

The `models/` directory is mounted as a read-only volume:
- **Host:** `./models/`
- **Container:** `/app/public/models/`

Any changes to `models/` are immediately reflected (may need page refresh).

---

## 📦 Registry Deployment

### Step 1: Build and Tag

Using the build script (recommended):

```bash
# For Docker Hub
./build.sh -r yourusername/ -v 1.0.0

# For GitHub Container Registry
./build.sh -r ghcr.io/yourusername/ -v 1.0.0

# For private registry
./build.sh -r registry.example.com/yournamespace/ -v 1.0.0
```

Manual approach:

```bash
# Build
docker build -t glb-viewer:1.0.0 .

# Tag for registry
docker tag glb-viewer:1.0.0 yourusername/glb-viewer:1.0.0
docker tag glb-viewer:1.0.0 yourusername/glb-viewer:latest
```

### Step 2: Push to Registry

#### Docker Hub

```bash
# Login
docker login

# Push with script
./build.sh -r yourusername/ -v 1.0.0 -p

# Or manually
docker push yourusername/glb-viewer:1.0.0
docker push yourusername/glb-viewer:latest
```

#### GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push with script
./build.sh -r ghcr.io/username/ -v 1.0.0 -p

# Or manually
docker push ghcr.io/username/glb-viewer:1.0.0
docker push ghcr.io/username/glb-viewer:latest
```

#### Amazon ECR

```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name glb-viewer

# Tag
docker tag glb-viewer:1.0.0 \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/glb-viewer:1.0.0

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/glb-viewer:1.0.0
```

---

## 🌐 Production Deployment

### Deploy from Registry

#### Using Deploy Script

```bash
# From Docker Hub
./deploy.sh -r yourusername/ -v 1.0.0

# From GitHub Container Registry
./deploy.sh -r ghcr.io/username/ -v 1.0.0

# Custom port and models directory
./deploy.sh -r yourusername/ -v 1.0.0 -p 8080 -m /data/models
```

#### Using Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  glb-viewer:
    image: yourusername/glb-viewer:1.0.0
    container_name: glb-viewer
    ports:
      - "3000:3000"
    volumes:
      - /data/models:/app/public/models:ro
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Manual Deployment

```bash
# Pull
docker pull yourusername/glb-viewer:1.0.0

# Run
docker run -d \
  --name glb-viewer \
  -p 3000:3000 \
  -v /data/models:/app/public/models:ro \
  --restart unless-stopped \
  yourusername/glb-viewer:1.0.0
```

### Deploy to Cloud Platforms

#### AWS ECS/Fargate

1. Push image to ECR (see above)
2. Create task definition with:
   - Image: `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/glb-viewer:1.0.0`
   - Port: 3000
   - Volume: EFS mount for models
3. Create service with load balancer

#### Google Cloud Run

```bash
# Tag for GCR
docker tag glb-viewer:1.0.0 gcr.io/PROJECT_ID/glb-viewer:1.0.0

# Push
docker push gcr.io/PROJECT_ID/glb-viewer:1.0.0

# Deploy
gcloud run deploy glb-viewer \
  --image gcr.io/PROJECT_ID/glb-viewer:1.0.0 \
  --platform managed \
  --port 3000
```

Note: Cloud Run doesn't support volumes. Models must be in image or loaded from Cloud Storage.

#### Kubernetes

Create deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glb-viewer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: glb-viewer
  template:
    metadata:
      labels:
        app: glb-viewer
    spec:
      containers:
      - name: glb-viewer
        image: yourusername/glb-viewer:1.0.0
        ports:
        - containerPort: 3000
        volumeMounts:
        - name: models
          mountPath: /app/public/models
          readOnly: true
      volumes:
      - name: models
        persistentVolumeClaim:
          claimName: models-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: glb-viewer
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: glb-viewer
```

Deploy:

```bash
kubectl apply -f deployment.yaml
```

---

## 🔧 Maintenance

### Update Models

```bash
# Add new model
cp new-model.glb models/

# Restart container to pick up changes (if needed)
docker-compose restart
```

### Update Application

```bash
# Pull new version
docker pull yourusername/glb-viewer:latest

# Restart with new version
docker-compose down
docker-compose up -d
```

### View Logs

```bash
# Docker Compose
docker-compose logs -f

# Docker
docker logs -f glb-viewer

# Last 100 lines
docker logs --tail 100 glb-viewer
```

### Health Check

```bash
# Check if container is healthy
docker ps

# Manual health check
curl http://localhost:3000
```

---

## 🎨 Customization

### Change Port

Edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Host:Container
```

### Add Environment Variables

Edit `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_VAR=value
```

### Custom Styling

Edit `src/app/globals.css` for global styles.
Edit component styles in respective files.

---

## 🆘 Troubleshooting

### Models Not Appearing

1. Check file extensions (must be `.glb` or `.gltf`)
2. Verify file permissions
3. Check Docker volume mount: `docker inspect glb-viewer`
4. Check browser console for errors

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process or use different port
```

### Container Won't Start

```bash
# Check logs
docker logs glb-viewer

# Rebuild image
docker-compose build --no-cache
docker-compose up -d
```

### Build Failures

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild
docker build --no-cache -t glb-viewer:latest .
```

---

## 📚 Additional Resources

- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [Docker Documentation](https://docs.docker.com)
- [GLTF 2.0 Specification](https://github.com/KhronosGroup/glTF)

---

## 📝 Summary Commands

```bash
# Development
npm run dev

# Docker Build
./build.sh -r yourusername/ -v 1.0.0 -p

# Docker Deploy
./deploy.sh -r yourusername/ -v 1.0.0

# Docker Compose
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose logs -f      # View logs
docker-compose restart      # Restart
```

---

**You're all set! 🎉**

For quick reference, see [QUICKSTART.md](./QUICKSTART.md)
