import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    console.log('=== Model Request ===');
    console.log('Filename:', filename);
    
    // Basic path traversal protection (do this first)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error('Invalid filename - path traversal attempt:', filename);
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    // Check file extension
    const ext = path.extname(filename).toLowerCase();
    if (ext !== '.glb' && ext !== '.gltf') {
      console.error('Invalid file extension:', ext);
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    // Try multiple possible paths
    const possibleBasePaths = [
      '/app/public/models',
      path.join(process.cwd(), 'public', 'models')
    ];
    
    console.log('Searching in paths:', possibleBasePaths);
    
    let filePath = '';
    for (const basePath of possibleBasePaths) {
      const testPath = path.join(basePath, filename);
      console.log('Testing path:', testPath);
      
      if (fs.existsSync(testPath)) {
        try {
          const stats = fs.statSync(testPath);
          console.log('Found file:', testPath, 'size:', stats.size, 'bytes');
          filePath = testPath;
          break;
        } catch (err: any) {
          console.error('Error stating file:', testPath, err.message);
        }
      } else {
        console.log('Path does not exist:', testPath);
      }
    }
    
    if (!filePath) {
      console.error('Model file not found after checking all paths');
      return NextResponse.json(
        { error: 'Model not found', filename, searchedPaths: possibleBasePaths.map(p => path.join(p, filename)) },
        { status: 404 }
      );
    }

    console.log('Using file path:', filePath);

    // Read and return the file
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = ext === '.glb' ? 'model/gltf-binary' : 'model/gltf+json';

    console.log('Successfully read file, size:', fileBuffer.length, 'bytes');

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Error serving model:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to load model', details: error.message },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
