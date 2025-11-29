import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// API Key authentication middleware
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const validApiKey = process.env.UPLOAD_API_KEY;
  
  if (!validApiKey) {
    // If no API key is set in the environment, allow all uploads
    return true;
  }
  
  return apiKey === validApiKey;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXTENSIONS = ['.glb', '.gltf'];
const MODELS_DIR = 'models';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API Key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { 
          status: 401,
          headers: { 'WWW-Authenticate': 'Bearer realm="Model Upload API"' }
        }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    
    // 2. Define public directory for models
    const publicDir = existsSync('/app/public') 
      ? '/app/public'
      : path.join(process.cwd(), 'public');
    const modelsDir = path.join(publicDir, MODELS_DIR);

    if (!existsSync(modelsDir)) {
      await mkdir(modelsDir, { recursive: true });
    }

    // 3. Handle URL-based upload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url } = body;
      
      if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch file from URL' }, { status: 400 });
      }
      
      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      let filename = path.basename(new URL(url).pathname);
      filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      if (uint8Array.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }, { status: 400 });
      }

      const filePath = path.join(modelsDir, filename);
      await writeFile(filePath, uint8Array);
      
      if (!existsSync(filePath)) {
        throw new Error('Failed to save file to disk. Check permissions.');
      }
      
      return NextResponse.json({
        success: true,
        message: `Model '${filename}' uploaded successfully from URL.`,
        filename,
      });
    }
    
    // 4. Handle multipart form upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` }, { status: 400 });
      }
      
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }, { status: 400 });
      }
      
      let filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filePath = path.join(modelsDir, filename);
      await writeFile(filePath, buffer);
      
      if (!existsSync(filePath)) {
        throw new Error('Failed to save file to disk. Check permissions.');
      }

      return NextResponse.json({
        success: true,
        message: `Model '${filename}' uploaded successfully.`,
        filename,
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid content type. Use multipart/form-data or application/json' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Model upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload model', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    },
  });
}
