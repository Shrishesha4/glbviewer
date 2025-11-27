# GLB Viewer

A Next.js application for viewing GLB and GLTF 2.0 3D model files using Three.js. Fully containerized with Docker for easy deployment.

## Features

### 3D Models
- 🎨 Interactive 3D model viewer with orbit controls
- 🌐 **CDN Mode** - Use as a model hosting CDN with API access
- 📤 Upload models from URL or local files
- 🔍 Model explorer interface to browse all available models
- 🔗 Direct links to view specific models
- 📱 Mobile-optimized with adaptive quality settings
- ⚡ Loading indicators for better UX

### Media (Images & Videos)
- 🖼️ Image and video hosting CDN with API access
- 📤 Upload media from URL or local files (up to 20MB images, 500MB videos)
- 🎬 Built-in viewers for images and videos
- 🔍 Media explorer with filtering by type
- 📊 Support for multiple formats (jpg, png, webp, gif, mp4, webm, mov, etc.)

### Infrastructure
- 🔐 Secure API authentication for external applications
- 📁 File-based management (organized by type)
- 🐳 Fully Dockerized for easy deployment
- 📦 Deployable to any container registry

## Project Structure

```
glbviewer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── models/          # API routes for model listing and serving
│   │   │   ├── media/           # API routes for media (images/videos)
│   │   │   └── upload/          # Upload API for models and media
│   │   ├── models/
│   │   │   ├── explore/         # Browse all available models
│   │   │   ├── view/[filename]/ # View specific model with navigation
│   │   │   └── viewer/[filename]/ # View-only model (no UI chrome)
│   │   ├── media/
│   │   │   ├── explore/         # Browse all media (images/videos)
│   │   │   ├── view/[filename]/ # View media with navigation
│   │   │   └── viewer/[filename]/ # View-only media (fullscreen)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       └── GLBViewer.tsx        # Three.js 3D viewer component
├── public/
│   ├── models/                  # Place your GLB/GLTF files here
│   ├── images/                  # Uploaded images
│   └── videos/                  # Uploaded videos
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

#### Models
- **Home page:** `http://localhost:3000`
- **Explore models:** `http://localhost:3000/models/explore`
- **View specific model:** `http://localhost:3000/models/view/[filename.glb]`
- **View-only mode:** `http://localhost:3000/models/viewer/[filename.glb]`

#### Media (Images & Videos)
- **Explore media:** `http://localhost:3000/media/explore`
- **View media:** `http://localhost:3000/media/view/[filename.jpg]`
- **View-only mode:** `http://localhost:3000/media/viewer/[filename.mp4]`

### Upload Models

You can upload models in two ways:

1. **Via the Explore Page (Models):**
   - Navigate to `http://localhost:3000/models/explore`
   - Click "Show Upload"
   - Either paste a URL to a .glb/.gltf file or select a file from your computer
   - The model will be uploaded and immediately available

   **Or for Media (Images/Videos):**
   - Navigate to `http://localhost:3000/media/explore`
   - Click "Upload Media"
   - Select type (auto-detect, image, or video) and upload from URL or file
   - Uploaded media appears immediately in the gallery

2. **Via API (CDN Mode):**
   ```bash
   # Upload from URL
   curl -X POST http://localhost:3000/api/upload \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-api-key" \
     -d '{"url": "https://example.com/model.glb"}'
   
   # Upload from file
   curl -X POST http://localhost:3000/api/upload \
     -H "X-API-Key: your-api-key" \
     -F "file=@/path/to/model.glb"
   ```

3. **Manually:**
   Place your `.glb` or `.gltf` files in the `public/models/` directory (or `models/` for Docker).

## 🌐 Using as a CDN

GLB Viewer can be used as a 3D model hosting CDN with full API access for external applications.

### Quick Setup

1. **Set admin password and API key for security:**
   ```bash
   # Set admin password for web UI access
   export ADMIN_PASSWORD="your-secure-password"
   
   # Generate a secure API key for programmatic access
   export UPLOAD_API_KEY=$(openssl rand -base64 32)
   
   # Add to docker-compose or .env
   echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" >> .env.local
   echo "UPLOAD_API_KEY=$UPLOAD_API_KEY" >> .env.local
   ```

2. **Fix permissions for uploads (important!):**
   ```bash
   # The container runs as UID 1001, so fix permissions
   sudo ./fix-permissions.sh
   
   # Or manually:
   sudo chown -R 1001:1001 ./models
   ```

3. **Deploy with API access:**
   ```bash
   docker-compose up -d
   ```

3. **Upload from your application:**
   ```python
   import requests
   
   # Upload a model
   response = requests.post(
       'https://models.yourdomain.com/api/upload',
       files={'file': open('model.glb', 'rb')},
       headers={'X-API-Key': 'your-api-key'}
   )
   
   # Get the CDN URL
   cdn_url = response.json()['cdnUrl']
   print(f"Model available at: {cdn_url}")
   ```

### API Documentation

See [API.md](./API.md) for complete API documentation including:
- Authentication setup
- All API endpoints
- Code examples in multiple languages (Python, Node.js, PHP, cURL)
- CDN usage patterns
- Security best practices

See [ADMIN_AUTH.md](./ADMIN_AUTH.md) for admin authentication documentation:
- Login and session management
- API key authentication for programmatic access
- Protected vs public routes
- Integration examples
- Troubleshooting

### Example Clients

Ready-to-use client examples are available in the `examples/` directory:
- **Node.js:** `examples/cdn-client.js`
- **Python:** `examples/cdn_client.py`

Usage:
```bash
# Node.js
export GLB_VIEWER_API_KEY=your-api-key
node examples/cdn-client.js upload model.glb

# Python
export GLB_VIEWER_API_KEY=your-api-key
python examples/cdn_client.py upload model.glb
```

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
# Quick Start: Using GLB Viewer as a CDN

This guide will get you up and running with GLB Viewer as a model hosting CDN in 5 minutes.

## 1. Deploy the Server

### Option A: Docker Compose (Recommended)

```bash
# 1. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  glb-viewer:
    image: shrishesha4/glb-viewer:latest
    container_name: glb-viewer
    ports:
      - "3000:3000"
    volumes:
      - ./models:/app/public/models
    environment:
      - NODE_ENV=production
      - UPLOAD_API_KEY=your-secret-key-change-this
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000
    restart: unless-stopped
EOF

# 2. Generate secure API key
export UPLOAD_API_KEY=$(openssl rand -base64 32)
echo "Your API Key: $UPLOAD_API_KEY"
echo "Save this key - you'll need it for uploads!"

# 3. Update docker-compose.yml with your API key
sed -i.bak "s/your-secret-key-change-this/$UPLOAD_API_KEY/" docker-compose.yml

# 4. Start the server
docker-compose up -d

# 5. Verify it's running
curl http://localhost:3000
```

### Option B: Docker Run

```bash
# Generate API key
export UPLOAD_API_KEY=$(openssl rand -base64 32)
echo "Your API Key: $UPLOAD_API_KEY"

# Run container
docker run -d \
  --name glb-viewer \
  -p 3000:3000 \
  -v $(pwd)/models:/app/public/models \
  -e NODE_ENV=production \
  -e UPLOAD_API_KEY=$UPLOAD_API_KEY \
  -e NEXT_PUBLIC_BASE_URL=http://localhost:3000 \
  shrishesha4/glb-viewer:latest
```

## 2. Upload Your First Model

### Using cURL

```bash
# Upload a local file
curl -X POST http://localhost:3000/api/upload \
  -H "X-API-Key: $UPLOAD_API_KEY" \
  -F "file=@/path/to/your/model.glb"

# Upload from URL
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $UPLOAD_API_KEY" \
  -d '{"url": "https://example.com/model.glb"}'
```

### Using Python

```python
import requests
import os

API_KEY = os.getenv('UPLOAD_API_KEY')
BASE_URL = 'http://localhost:3000'

# Upload file
with open('model.glb', 'rb') as f:
    response = requests.post(
        f'{BASE_URL}/api/upload',
        files={'file': f},
        headers={'X-API-Key': API_KEY}
    )

result = response.json()
print(f"✓ Uploaded to: {result['cdnUrl']}")
print(f"  View at: {result['viewUrl']}")
```

### Using Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');

const API_KEY = process.env.UPLOAD_API_KEY;
const BASE_URL = 'http://localhost:3000';

// Upload file
const form = new FormData();
form.append('file', fs.createReadStream('model.glb'));

fetch(`${BASE_URL}/api/upload`, {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY,
    ...form.getHeaders()
  },
  body: form
})
  .then(res => res.json())
  .then(data => {
    console.log(`✓ Uploaded to: ${data.cdnUrl}`);
    console.log(`  View at: ${data.viewUrl}`);
  });
```

## 3. Access Your Models

After uploading, you'll get these URLs:

```json
{
  "cdnUrl": "http://localhost:3000/api/models/model.glb",
  "viewUrl": "http://localhost:3000/view/model.glb",
  "viewerUrl": "http://localhost:3000/viewer/model.glb"
}
```

### Use Cases

**1. Download the model file:**
```bash
curl http://localhost:3000/api/models/model.glb -o downloaded.glb
```

**2. View in browser with UI:**
```
http://localhost:3000/view/model.glb
```

**3. Embed viewer (no UI):**
```html
<iframe 
  src="http://localhost:3000/viewer/model.glb" 
  width="800" 
  height="600"
></iframe>
```

**4. Use in Three.js:**
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('http://localhost:3000/api/models/model.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

## 4. List All Models

```bash
# Get all models
curl http://localhost:3000/api/models

# Response
{
  "models": [
    {
      "name": "model.glb",
      "url": "/api/models/model.glb",
      "viewUrl": "/view/model.glb"
    }
  ]
}
```

## 5. Production Deployment

### Update Base URL

For production, update `NEXT_PUBLIC_BASE_URL` to your domain:

```bash
# In docker-compose.yml or .env
NEXT_PUBLIC_BASE_URL=https://models.yourdomain.com
```

This ensures the API returns full URLs instead of relative paths.

### With Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name models.yourdomain.com;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### With SSL/HTTPS

```bash
# Using certbot
sudo certbot --nginx -d models.yourdomain.com

# Update base URL
NEXT_PUBLIC_BASE_URL=https://models.yourdomain.com
```

## 6. Using Example Clients

We provide ready-to-use CLI clients:

### Python Client

```bash
# Install requests
pip install requests

# Set your API key
export GLB_VIEWER_URL=http://localhost:3000
export GLB_VIEWER_API_KEY=your-api-key

# Upload a model
python examples/cdn_client.py upload model.glb

# Upload from URL
python examples/cdn_client.py upload-url https://example.com/model.glb

# List all models
python examples/cdn_client.py list
```

### Node.js Client

```bash
# Install dependencies
npm install form-data

# Set your API key
export GLB_VIEWER_URL=http://localhost:3000
export GLB_VIEWER_API_KEY=your-api-key

# Upload a model
node examples/cdn-client.js upload model.glb

# Upload from URL
node examples/cdn-client.js upload-url https://example.com/model.glb

# List all models
node examples/cdn-client.js list
```

## 7. Security Checklist

- ✅ Set a strong `UPLOAD_API_KEY` (use `openssl rand -base64 32`)
- ✅ Use HTTPS in production
- ✅ Keep API key secret (use environment variables, never commit to git)
- ✅ Enable firewall rules to restrict access if needed
- ✅ Monitor disk space for the models directory
- ✅ Set up regular backups of the models directory

## 8. Common Issues

### "EACCES: permission denied" when uploading ⚠️ MOST COMMON

This is the most common issue! The container user (UID 1001) needs write permissions on the host directory.

**Fix on your production server:**
```bash
# Option 1: Change ownership to match container user (recommended)
sudo chown -R 1001:1001 /path/to/models

# Option 2: Make directory writable by all (less secure)
sudo chmod -R 777 /path/to/models

# After fixing permissions, restart container
docker restart glb-viewer
```

**For your specific case:**
```bash
# On your production server (models.shrishesha.space)
sudo chown -R 1001:1001 /home/shrishesha/servarr/glbv/data/models
docker restart glb-viewer

# Verify it works:
docker exec glb-viewer touch /app/public/models/test.txt && \
  docker exec glb-viewer rm /app/public/models/test.txt && \
  echo "✓ Permissions fixed!"
```

### "Unauthorized - Invalid or missing API key"
- Make sure `X-API-Key` header is set correctly
- Verify `UPLOAD_API_KEY` environment variable is set in the container

### "File size exceeds 100MB limit"
- Models must be under 100MB
- Compress your models or split into multiple files

### Models not appearing after upload
- Check container logs: `docker logs glb-viewer`
- Verify volume mount is read-write (not `:ro`)
- Check file permissions on the models directory

### Cannot access from external application
- Verify firewall allows port 3000
- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Use full URLs (not localhost) when accessing from other machines

## Next Steps

- 📖 Read [API.md](./API.md) for complete API documentation
- 🔧 See [SETUP.md](./SETUP.md) for advanced configuration
- 💻 Check `examples/` directory for more code samples
- 🚀 Deploy to cloud platforms (AWS, GCP, Azure)

---

**That's it! You now have a working 3D model CDN! 🎉**

## Environment Variables

### Required for Production

- `ADMIN_PASSWORD` - Password for admin access to upload/manage interfaces
- `UPLOAD_API_KEY` - API key for programmatic uploads and deletions (optional)
- `NEXT_PUBLIC_BASE_URL` - Full base URL for CDN responses (e.g., `https://models.yourdomain.com`)

### Example Configuration

```bash
# .env.local or docker-compose environment
ADMIN_PASSWORD=your-secure-password-here
UPLOAD_API_KEY=your-api-key-here
NEXT_PUBLIC_BASE_URL=https://models.yourdomain.com
```

## Admin Authentication

The application includes admin authentication to protect upload and management interfaces:

### Web UI Access

1. Navigate to `/models/explore` or `/media/explore`
2. You'll be redirected to `/admin/login`
3. Enter the `ADMIN_PASSWORD` configured in your environment
4. Session lasts 24 hours
5. Click "Logout" button to end session

### Programmatic Access (API)

For automated scripts and external applications, bypass login by including your API key in headers:

```bash
# Access explorer endpoints with API key
curl -H "X-API-Key: your-api-key" https://models.yourdomain.com/models/explore

# Or with Bearer token
curl -H "Authorization: Bearer your-api-key" https://models.yourdomain.com/media/explore
```

The same API key works for:
- Upload endpoints (`/api/upload`, `/api/media/upload`)
- Delete endpoints (`/api/models/[filename]`, `/api/media/[type]/[filename]`)
- Access to explorer pages (bypasses login requirement)

### Public Routes (No Auth Required)

These routes remain publicly accessible:
- Home page: `/`
- Model viewer: `/models/view/[filename]`, `/models/viewer/[filename]`
- Media viewer: `/media/view/[filename]`, `/media/viewer/[filename]`
- Direct file access: `/models/[filename]`, `/images/[filename]`, `/videos/[filename]`
- API endpoints (with API key): All `/api/*` routes


# Media CDN Quick Reference

## Authentication

### Admin Web UI
- Navigate to `/media/explore` or `/models/explore`
- Login with `ADMIN_PASSWORD` (set in environment)
- Session lasts 24 hours

### API Access
Include your API key in requests:
```bash
# Option 1: X-API-Key header
curl -H "X-API-Key: your-api-key" ...

# Option 2: Authorization Bearer
curl -H "Authorization: Bearer your-api-key" ...
```

## Upload Media

### Upload Image
```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "X-API-Key: your-api-key" \
  -F "file=@image.jpg"
```

### Upload Video
```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "X-API-Key: your-api-key" \
  -F "file=@video.mp4"
```

### Upload from URL
```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://example.com/image.jpg"}'
```

## List Media

### List All Media
```bash
curl http://localhost:3000/api/media
```

### List Only Images
```bash
curl http://localhost:3000/api/media?type=images
```

### List Only Videos
```bash
curl http://localhost:3000/api/media?type=videos
```

## Delete Media

### Delete Image
```bash
curl -X DELETE http://localhost:3000/api/media/images/filename.jpg \
  -H "X-API-Key: your-api-key"
```

### Delete Video
```bash
curl -X DELETE http://localhost:3000/api/media/videos/filename.mp4 \
  -H "X-API-Key: your-api-key"
```

## Access Media

### Direct URL (CDN)
- Images: `http://localhost:3000/images/filename.jpg`
- Videos: `http://localhost:3000/videos/filename.mp4`

### View with Navigation
- Any media: `http://localhost:3000/media/view/filename.jpg`
- Any media: `http://localhost:3000/media/view/filename.mp4`

### View-Only Mode (Fullscreen)
- Any media: `http://localhost:3000/media/viewer/filename.jpg`
- Any media: `http://localhost:3000/media/viewer/filename.mp4`

### Browse & Upload
- Media explorer: `http://localhost:3000/media/explore`

## Supported Formats

### Images (max 20MB)
- jpg, jpeg, png, gif, webp, svg, bmp, ico

### Videos (max 500MB)
- mp4, webm, mov, avi, mkv, ogg

## Response Format

```json
{
  "success": true,
  "filename": "image.jpg",
  "type": "image",
  "size": 123456,
  "message": "Image uploaded successfully",
  "cdnUrl": "http://localhost:3000/images/image.jpg",
  "viewUrl": "http://localhost:3000/media/view/image.jpg",
  "fileUrl": "/images/image.jpg"
}
```

**Note:** The `viewUrl` now uses a unified `/media/view/[filename]` path for all media types (images and videos).

## Integration Examples

### HTML
```html
<img src="http://localhost:3000/images/photo.jpg" alt="Photo">
<video src="http://localhost:3000/videos/clip.mp4" controls></video>
```

### React/Next.js
```jsx
<Image src="/images/photo.jpg" width={800} height={600} />
<video src="/videos/clip.mp4" controls />
```

### Markdown
```markdown
![Photo](/images/photo.jpg)
```


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

# Quick Fix for Upload Permissions

## The Problem
You're getting this error:
```
{"error":"Failed to upload file","details":"EACCES: permission denied, open '/app/public/models/Duck.glb'"}
```

## The Solution

Run these commands on your production server (`models.shrishesha.space`):

```bash
# Fix the permissions (container runs as UID 1001)
sudo chown -R 1001:1001 /home/shrishesha/servarr/glbv/data/models
```


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
