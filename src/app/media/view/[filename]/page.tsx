'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];

function getExt(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

export default function MediaViewPage() {
  const params = useParams();
  const filename = params?.filename as string;

  if (!filename) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No file specified.</div>
    );
  }

  const ext = getExt(filename);
  const isVideo = VIDEO_EXTS.includes(ext);
  const isImage = IMAGE_EXTS.includes(ext);
  const src = isVideo ? `/videos/${filename}` : `/images/${filename}`;

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/media/explore" style={{ color: '#0070f3' }}>← Back to Media</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={filename} style={{ maxWidth: '100%', height: 'auto' }} />
        )}
        {isVideo && (
          <video src={src} controls style={{ maxWidth: '100%' }} />
        )}
        {!isImage && !isVideo && (
          <div>Unsupported file type: {ext}</div>
        )}
      </div>
    </div>
  );
}
