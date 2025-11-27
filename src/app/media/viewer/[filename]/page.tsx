'use client';

import { useParams } from 'next/navigation';

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];

function getExt(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

export default function MediaViewerPage() {
  const params = useParams();
  const filename = params?.filename as string;

  if (!filename) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>No file specified.</div>
    );
  }

  const ext = getExt(filename);
  const isVideo = VIDEO_EXTS.includes(ext);
  const isImage = IMAGE_EXTS.includes(ext);
  const src = isVideo ? `/videos/${filename}` : `/images/${filename}`;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={filename} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      )}
      {isVideo && (
        <video src={src} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
      )}
      {!isImage && !isVideo && (
        <div style={{ color: '#fff' }}>Unsupported file type: {ext}</div>
      )}
    </div>
  );
}
