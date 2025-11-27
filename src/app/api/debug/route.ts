import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

export async function GET(request: NextRequest) {
  try {
    const info = {
      cwd: process.cwd(),
      modelsDir: MODELS_DIR,
      exists: fs.existsSync(MODELS_DIR),
      files: [] as string[],
      permissions: null as any,
      error: null as string | null
    };

    if (fs.existsSync(MODELS_DIR)) {
      try {
        info.files = fs.readdirSync(MODELS_DIR);
        const stats = fs.statSync(MODELS_DIR);
        info.permissions = {
          mode: stats.mode.toString(8),
          isDirectory: stats.isDirectory(),
          readable: fs.constants.R_OK
        };
      } catch (err: any) {
        info.error = err.message;
      }
    }

    return NextResponse.json(info, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
