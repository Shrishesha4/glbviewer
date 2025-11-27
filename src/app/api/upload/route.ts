import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// API Key authentication middleware
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const validApiKey = process.env.UPLOAD_API_KEY;
  
  // If no API key is configured, allow uploads (backward compatibility)
  if (!validApiKey) {
    return true;
  }
  
  return apiKey === validApiKey;
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key for external access
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="GLB Viewer Upload API"'
          }
        }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    
    // Determine the models directory
    const modelsDir = existsSync('/app/public/models') 
      ? '/app/public/models'
      : path.join(process.cwd(), 'public', 'models');
    
    // Ensure models directory exists
    if (!existsSync(modelsDir)) {
      await mkdir(modelsDir, { recursive: true });
    }
    
    // Handle URL-based upload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url, filename } = body;
      
      if (!url) {
        return NextResponse.json(
          { error: 'URL is required' },
          { status: 400 }
        );
      }
      
      // Validate URL
      let fileUrl: URL;
      try {
        fileUrl = new URL(url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL provided' },
          { status: 400 }
        );
      }
      
      // Fetch the file from URL
      const response = await fetch(fileUrl.toString());
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch file from URL' },
          { status: 400 }
        );
      }
      
      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Determine filename
      let finalFilename = filename;
      if (!finalFilename) {
        const urlPath = fileUrl.pathname;
        finalFilename = path.basename(urlPath);
      }
      
      // Validate file extension
      if (!finalFilename.match(/\.(glb|gltf)$/i)) {
        finalFilename += '.glb';
      }
      
      // Sanitize filename
      finalFilename = finalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      const filePath = path.join(modelsDir, finalFilename);
      
      // Write file
      await writeFile(filePath, uint8Array);
      
      // Generate full URLs for CDN usage
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || '';
      
      return NextResponse.json({
        success: true,
        filename: finalFilename,
        message: 'File uploaded successfully from URL',
        cdnUrl: `${baseUrl}/api/models/${finalFilename}`,
        viewUrl: `${baseUrl}/view/${finalFilename}`,
        viewerUrl: `${baseUrl}/viewer/${finalFilename}`,
        fileUrl: `/api/models/${finalFilename}`
      });
    }
    
    // Handle multipart form upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Validate file type
      if (!file.name.match(/\.(glb|gltf)$/i)) {
        return NextResponse.json(
          { error: 'Only .glb and .gltf files are allowed' },
          { status: 400 }
        );
      }
      
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size exceeds 100MB limit' },
          { status: 400 }
        );
      }
      
      // Sanitize filename
      let filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      // Check if file exists and generate unique name if needed
      let finalFilename = filename;
      let counter = 1;
      while (existsSync(path.join(modelsDir, finalFilename))) {
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        finalFilename = `${name}_${counter}${ext}`;
        counter++;
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filePath = path.join(modelsDir, finalFilename);
      await writeFile(filePath, buffer);
      
      // Generate full URLs for CDN usage
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || '';
      
      return NextResponse.json({
        success: true,
        filename: finalFilename,
        size: file.size,
        message: 'File uploaded successfully',
        cdnUrl: `${baseUrl}/api/models/${finalFilename}`,
        viewUrl: `${baseUrl}/view/${finalFilename}`,
        viewerUrl: `${baseUrl}/viewer/${finalFilename}`,
        fileUrl: `/api/models/${finalFilename}`
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid content type. Use multipart/form-data or application/json' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
