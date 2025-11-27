# GLB Viewer

A Next.js application for viewing GLB and GLTF 2.0 3D model files using Three.js. Fully containerized with Docker for easy deployment.

## Features

- 🎨 Interactive 3D model viewer with orbit controls
- 📁 File-based model management (place models in a folder)
- 🔍 Model explorer interface to browse all available models
- 🔗 Direct links to view specific models
- 🐳 Fully Dockerized for easy deployment
- 📦 Deployable to any container registry

## Project Structure

```
glbviewer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── models/          # API routes for model listing and serving
│   │   ├── explore/             # Browse all available models
│   │   ├── view/[filename]/     # View specific model by filename
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       └── GLBViewer.tsx        # Three.js 3D viewer component
├── public/
│   └── models/                  # Place your GLB/GLTF files here
├── models/                      # Volume mount for Docker (external models)
├── Dockerfile
├── docker-compose.yml
├── next.config.js
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your 3D models:**
   Place your `.glb` or `.gltf` files in the `public/models/` directory.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Usage

- **Home page:** `http://localhost:3000`
- **Explore models:** `http://localhost:3000/explore`
- **View specific model:** `http://localhost:3000/view/[filename.glb]`

## Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t glb-viewer:latest .

# Or use docker-compose
docker-compose build
```

### Run with Docker Compose

1. **Place your models in the `models/` directory** (this will be mounted as a volume)

2. **Start the container:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Run with Docker directly

```bash
# Create a models directory
mkdir -p models

# Run the container
docker run -d \
  --name glb-viewer \
  -p 3000:3000 \
  -v $(pwd)/models:/app/public/models:ro \
  glb-viewer:latest
```

## Push to Container Registry

### Docker Hub

1. **Tag the image:**
   ```bash
   docker tag glb-viewer:latest your-dockerhub-username/glb-viewer:latest
   docker tag glb-viewer:latest your-dockerhub-username/glb-viewer:1.0.0
   ```

2. **Login to Docker Hub:**
   ```bash
   docker login
   ```

3. **Push the image:**
   ```bash
   docker push your-dockerhub-username/glb-viewer:latest
   docker push your-dockerhub-username/glb-viewer:1.0.0
   ```

### GitHub Container Registry (ghcr.io)

1. **Create a Personal Access Token (PAT)** with `write:packages` permission

2. **Login to GHCR:**
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Tag the image:**
   ```bash
   docker tag glb-viewer:latest ghcr.io/your-github-username/glb-viewer:latest
   docker tag glb-viewer:latest ghcr.io/your-github-username/glb-viewer:1.0.0
   ```

4. **Push the image:**
   ```bash
   docker push ghcr.io/your-github-username/glb-viewer:latest
   docker push ghcr.io/your-github-username/glb-viewer:1.0.0
   ```

### Amazon ECR

1. **Authenticate Docker to ECR:**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   ```

2. **Create a repository:**
   ```bash
   aws ecr create-repository --repository-name glb-viewer --region us-east-1
   ```

3. **Tag the image:**
   ```bash
   docker tag glb-viewer:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/glb-viewer:latest
   ```

4. **Push the image:**
   ```bash
   docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/glb-viewer:latest
   ```

## Deploy from Registry

Once your image is pushed to a registry, you can deploy it anywhere:

### Using Docker

```bash
# Pull and run from Docker Hub
docker run -d \
  --name glb-viewer \
  -p 3000:3000 \
  -v $(pwd)/models:/app/public/models:ro \
  your-dockerhub-username/glb-viewer:latest

# Pull and run from GHCR
docker run -d \
  --name glb-viewer \
  -p 3000:3000 \
  -v $(pwd)/models:/app/public/models:ro \
  ghcr.io/your-github-username/glb-viewer:latest
```

### Using Docker Compose with Registry Image

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  glb-viewer:
    image: your-dockerhub-username/glb-viewer:latest
    container_name: glb-viewer
    ports:
      - "3000:3000"
    volumes:
      - ./models:/app/public/models:ro
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## Adding Models

1. **For local development:** Place models in `public/models/`
2. **For Docker deployment:** Place models in the `models/` directory (mounted as volume)

Supported formats:
- `.glb` (Binary GLTF 2.0)
- `.gltf` (JSON GLTF 2.0)

## API Endpoints

- `GET /api/models` - List all available models
- `GET /api/models/[filename]` - Serve a specific model file

## Technology Stack

- **Next.js 14** - React framework
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics library
- **@react-three/drei** - Useful helpers for React Three Fiber
- **TypeScript** - Type safety
- **Docker** - Containerization

## Environment Variables

No environment variables required. The application works out of the box.

## Health Check

The Docker container includes a health check that runs every 30 seconds:
```bash
curl http://localhost:3000
```

## Troubleshooting

### Models not appearing

1. Ensure your model files have `.glb` or `.gltf` extensions
2. Check file permissions (models should be readable)
3. Verify the models directory is correctly mounted (for Docker)
4. Check browser console for errors

### Docker volume issues

```bash
# Restart with fresh volume mount
docker-compose down
docker-compose up -d
```

### Port already in use

```bash
# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
