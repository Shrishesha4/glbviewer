import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MEDIA_DIRS = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  videos: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogg']
};

// Helper function to get files from a directory
async function getMediaFromDir(publicDir: string, dirName: string, mediaType: string) {
  const dirPath = path.join(publicDir, dirName);
  
  if (!existsSync(dirPath)) {
    return [];
  }
  
  const files = await readdir(dirPath);
  const validExtensions = MEDIA_DIRS[dirName as keyof typeof MEDIA_DIRS];
  
  const mediaFiles = await Promise.all(
    files
      .filter(file => {
        const ext = path.extname(file).toLowerCase().slice(1);
        return validExtensions.includes(ext) && file !== '.gitkeep';
      })
      .map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stats = await stat(filePath);
        
        return {
          name: file,
          type: mediaType,
          path: `/${dirName}/${file}`,
          url: `/${dirName}/${file}`,
          viewUrl: `/media/view/${file}`,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
  );
  
  return mediaFiles;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'images', 'videos', or null for all
    
    const publicDir = existsSync('/app/public') 
      ? '/app/public'
      : path.join(process.cwd(), 'public');
    
    const allMedia: any[] = [];
    
    // Get media based on type filter
    if (!type || type === 'images') {
      const images = await getMediaFromDir(publicDir, 'images', 'image');
      allMedia.push(...images);
    }
    
    if (!type || type === 'videos') {
      const videos = await getMediaFromDir(publicDir, 'videos', 'video');
      allMedia.push(...videos);
    }
    
    // Sort by modified date (newest first)
    allMedia.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    
    return NextResponse.json({
      media: allMedia,
      count: allMedia.length,
      types: {
        images: allMedia.filter(m => m.type === 'image').length,
        videos: allMedia.filter(m => m.type === 'video').length
      }
    });
    
  } catch (error) {
    console.error('List media error:', error);
    return NextResponse.json(
      { error: 'Failed to list media', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
