import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Try multiple possible paths for the models directory
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'models'),
      '/app/public/models',
      path.join(__dirname, '..', '..', '..', '..', 'public', 'models')
    ];
    
    let MODELS_DIR = '';
    let files: string[] = [];
    
    // Find the first path that exists and has files
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        try {
          const testFiles = fs.readdirSync(testPath);
          console.log(`Checking path: ${testPath}, files found:`, testFiles.length);
          if (testFiles.length > 0 || MODELS_DIR === '') {
            MODELS_DIR = testPath;
            files = testFiles;
            if (testFiles.length > 0) break;
          }
        } catch (err) {
          console.error(`Error reading ${testPath}:`, err);
        }
      }
    }
    
    if (!MODELS_DIR) {
      console.error('No valid models directory found');
      return NextResponse.json({ 
        models: [], 
        count: 0,
        error: 'Models directory not found',
        searchedPaths: possiblePaths 
      });
    }
    
    console.log('Using models directory:', MODELS_DIR);
    console.log('Found files:', files);
    
    // Filter for GLB and GLTF files
    const modelFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.glb' || ext === '.gltf';
    });

    const models = modelFiles.map(file => ({
      name: file,
      path: `/models/${file}`,
      url: `/api/models/${encodeURIComponent(file)}`,
      viewUrl: `/models/view/${encodeURIComponent(file)}`,
      viewerUrl: `/models/viewer/${encodeURIComponent(file)}`
    }));

    console.log('Returning models:', models.length);
    return NextResponse.json({ models, count: models.length }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error: any) {
    console.error('Error reading models directory:', error);
    return NextResponse.json(
      { error: 'Failed to read models directory', details: error.message },
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
