# Admin Authentication Guide

## Overview

GLB Viewer includes admin authentication to protect upload and management interfaces while keeping all viewer routes publicly accessible.

## Configuration

### Environment Variables

```bash
# Required for admin access
ADMIN_PASSWORD=your-secure-password-here

# Required for API access (optional for web UI)
UPLOAD_API_KEY=your-api-key-here

# Recommended for CDN URLs
NEXT_PUBLIC_BASE_URL=https://models.yourdomain.com
```

### Docker Compose

```yaml
services:
  glb-viewer:
    environment:
      - ADMIN_PASSWORD=your-secure-password
      - UPLOAD_API_KEY=your-api-key
      - NEXT_PUBLIC_BASE_URL=https://models.yourdomain.com
```

## Access Methods

### 1. Web UI Login

**Protected Routes:**
- `/models/explore` - Upload and manage 3D models
- `/media/explore` - Upload and manage images/videos

**Login Flow:**
1. Navigate to a protected route
2. Automatically redirected to `/admin/login`
3. Enter your `ADMIN_PASSWORD`
4. Session lasts 24 hours
5. Use "Logout" button in top-right corner to end session

### 2. API Key Authentication

Bypass login requirement by including API key in headers:

```bash
# Access protected pages
curl -H "X-API-Key: your-api-key" https://models.yourdomain.com/models/explore

# Upload files
curl -X POST https://models.yourdomain.com/api/upload \
  -H "X-API-Key: your-api-key" \
  -F "file=@model.glb"

# Delete files
curl -X DELETE https://models.yourdomain.com/api/models/model.glb \
  -H "X-API-Key: your-api-key"
```

**Supported Header Formats:**
- `X-API-Key: your-api-key`
- `Authorization: Bearer your-api-key`

## Public Routes (No Authentication)

The following routes remain publicly accessible:

### Viewer Pages
- `/` - Home page
- `/models/view/[filename]` - Model viewer with navigation
- `/models/viewer/[filename]` - Model viewer (view-only)
- `/media/view/[filename]` - Media viewer with navigation
- `/media/viewer/[filename]` - Media viewer (fullscreen)

### Direct File Access
- `/models/[filename]` - Direct GLB/GLTF file
- `/images/[filename]` - Direct image file
- `/videos/[filename]` - Direct video file

### API Endpoints (Public Read)
- `GET /api/models` - List all models
- `GET /api/models/[filename]` - Get specific model
- `GET /api/media` - List all media
- `GET /api/media?type=images` - List images only
- `GET /api/media?type=videos` - List videos only

### API Endpoints (Require Auth)
- `POST /api/upload` - Upload model
- `POST /api/media/upload` - Upload image/video
- `DELETE /api/models/[filename]` - Delete model
- `DELETE /api/media/[type]/[filename]` - Delete media

## Security Best Practices

### Password Management
```bash
# Generate a strong password
openssl rand -base64 32

# Set in environment (don't commit to git)
export ADMIN_PASSWORD="generated-password"
```

### API Key Management
```bash
# Generate a secure API key
openssl rand -base64 32

# Store securely (use secrets management in production)
export UPLOAD_API_KEY="generated-api-key"
```

### Production Deployment

1. **Use HTTPS:** Always deploy behind HTTPS in production
2. **Secure Cookies:** Session cookies are automatically secure in production
3. **Environment Secrets:** Use proper secrets management (AWS Secrets Manager, Kubernetes Secrets, etc.)
4. **Rotate Keys:** Regularly rotate admin passwords and API keys
5. **Monitor Access:** Review logs for unauthorized access attempts

## Integration Examples

### Python Script with API Key
```python
import requests

API_KEY = "your-api-key"
BASE_URL = "https://models.yourdomain.com"

headers = {"X-API-Key": API_KEY}

# Upload a model
with open("model.glb", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/api/upload",
        headers=headers,
        files={"file": f}
    )
print(response.json())

# Delete a model
response = requests.delete(
    f"{BASE_URL}/api/models/model.glb",
    headers=headers
)
print(response.json())
```

### Node.js Script with API Key
```javascript
const API_KEY = process.env.UPLOAD_API_KEY;
const BASE_URL = "https://models.yourdomain.com";

// Upload a file
const formData = new FormData();
formData.append('file', fileBlob, 'model.glb');

const response = await fetch(`${BASE_URL}/api/upload`, {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY
  },
  body: formData
});

console.log(await response.json());
```

### cURL Examples
```bash
# Login via web UI (get session cookie)
curl -X POST https://models.yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}' \
  -c cookies.txt

# Use session cookie
curl https://models.yourdomain.com/models/explore \
  -b cookies.txt

# Or use API key (no login needed)
curl https://models.yourdomain.com/models/explore \
  -H "X-API-Key: your-api-key"
```

## Troubleshooting

### "Admin authentication not configured"
- Set `ADMIN_PASSWORD` environment variable
- Restart the application

### "Invalid password"
- Double-check your `ADMIN_PASSWORD` value
- Ensure no extra whitespace in environment variable

### "Unauthorized" on API requests
- Include `X-API-Key` or `Authorization` header
- Verify API key matches `UPLOAD_API_KEY` environment variable

### Session expired
- Sessions last 24 hours
- Login again at `/admin/login`
- Or use API key for persistent access

### Can't access viewer pages
- Viewer pages are always public (no auth required)
- Only `/models/explore` and `/media/explore` require authentication
- Direct file URLs always work without authentication
