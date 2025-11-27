import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { unlink } from 'fs/promises';
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; filename: string } }
) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing API key' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="Media CDN Delete API"'
          }
        }
      );
    }

    const { type, filename } = params;
    
    // Validate type
    if (!['images', 'videos'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid media type. Must be "images" or "videos"' },
        { status: 400 }
      );
    }
    
    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }
    
    const publicDir = existsSync('/app/public') 
      ? '/app/public'
      : path.join(process.cwd(), 'public');
    
    const filePath = path.join(publicDir, type, filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Delete the file
    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      message: `File ${filename} deleted successfully`,
      filename,
      type
    });
    
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    },
  });
}
