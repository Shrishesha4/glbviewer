import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// API Key authentication middleware
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  const validApiKey = process.env.UPLOAD_API_KEY;
  
  if (!validApiKey) {
    return true;
  }
  
  return apiKey === validApiKey;
}

// Determine media type and allowed extensions
const MEDIA_TYPES = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'],
    maxSize: 20 * 1024 * 1024, // 20MB
    dir: 'images'
  },
  video: {
    extensions: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'],
    maxSize: 500 * 1024 * 1024, // 500MB
    dir: 'videos'
  }
};

function getMediaType(filename: string): keyof typeof MEDIA_TYPES | null {
  const ext = path.extname(filename).toLowerCase();
  
  for (const [type, config] of Object.entries(MEDIA_TYPES)) {
    if (config.extensions.includes(ext)) {
      return type as keyof typeof MEDIA_TYPES;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="Media CDN Upload API"'
          }
        }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    
    // Base public directory
    const publicDir = existsSync('/app/public') 
      ? '/app/public'
      : path.join(process.cwd(), 'public');

    // Handle URL-based upload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url, filename, type } = body;
      
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
      let finalFilename = filename || path.basename(fileUrl.pathname);
      
      // Sanitize filename
      finalFilename = finalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      // Determine media type
      const mediaType: keyof typeof MEDIA_TYPES | null = (type as keyof typeof MEDIA_TYPES) || getMediaType(finalFilename);
      
      if (!mediaType) {
        return NextResponse.json(
          { error: 'Unsupported file type. Supported: images (jpg, png, gif, webp, svg) and videos (mp4, webm, mov)' },
          { status: 400 }
        );
      }
      
      const config = MEDIA_TYPES[mediaType];
      
      // Validate file extension
      const ext = path.extname(finalFilename).toLowerCase();
      if (!config.extensions.includes(ext)) {
        finalFilename += config.extensions[0];
      }
      
      // Check size
      if (uint8Array.length > config.maxSize) {
        return NextResponse.json(
          { error: `File size exceeds ${config.maxSize / 1024 / 1024}MB limit for ${mediaType}` },
          { status: 400 }
        );
      }
      
      // Create media directory
      const mediaDir = path.join(publicDir, config.dir);
      if (!existsSync(mediaDir)) {
        await mkdir(mediaDir, { recursive: true });
      }
      
      const filePath = path.join(mediaDir, finalFilename);
      
      // Write file
      await writeFile(filePath, uint8Array);
      
      // Generate full URLs
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || '';
      
      return NextResponse.json({
        success: true,
        filename: finalFilename,
        type: mediaType,
        size: uint8Array.length,
        message: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully from URL`,
        cdnUrl: `${baseUrl}/${config.dir}/${finalFilename}`,
        viewUrl: `${baseUrl}/media/view/${finalFilename}`,
        fileUrl: `/${config.dir}/${finalFilename}`
      });
    }
    
    // Handle multipart form upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const typeOverride = formData.get('type') as string | null;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Determine media type
      const mediaType: keyof typeof MEDIA_TYPES | null = (typeOverride as keyof typeof MEDIA_TYPES) || getMediaType(file.name);
      
      if (!mediaType) {
        return NextResponse.json(
          { error: 'Unsupported file type. Supported: images (jpg, png, gif, webp, svg) and videos (mp4, webm, mov)' },
          { status: 400 }
        );
      }
      
      const config = MEDIA_TYPES[mediaType];
      
      // Validate file type
      const ext = path.extname(file.name).toLowerCase();
      if (!config.extensions.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid file extension for ${mediaType}. Allowed: ${config.extensions.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Validate file size
      if (file.size > config.maxSize) {
        return NextResponse.json(
          { error: `File size exceeds ${config.maxSize / 1024 / 1024}MB limit for ${mediaType}` },
          { status: 400 }
        );
      }
      
      // Sanitize filename
      let filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      // Create media directory
      const mediaDir = path.join(publicDir, config.dir);
      if (!existsSync(mediaDir)) {
        await mkdir(mediaDir, { recursive: true });
      }
      
      // Check if file exists and generate unique name if needed
      let finalFilename = filename;
      let counter = 1;
      while (existsSync(path.join(mediaDir, finalFilename))) {
        const extName = path.extname(filename);
        const name = path.basename(filename, extName);
        finalFilename = `${name}_${counter}${extName}`;
        counter++;
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filePath = path.join(mediaDir, finalFilename);
      await writeFile(filePath, buffer);
      
      // Generate full URLs
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || '';
      
      return NextResponse.json({
        success: true,
        filename: finalFilename,
        type: mediaType,
        size: file.size,
        message: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully`,
        cdnUrl: `${baseUrl}/${config.dir}/${finalFilename}`,
        viewUrl: `${baseUrl}/media/view/${finalFilename}`,
        fileUrl: `/${config.dir}/${finalFilename}`
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid content type. Use multipart/form-data or application/json' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Media upload error:', error);
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
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    },
  });
}
