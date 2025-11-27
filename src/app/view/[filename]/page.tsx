'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import GLBViewer to avoid SSR issues with Three.js
const GLBViewer = dynamic(() => import('@/components/GLBViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1a1a1a',
      color: 'white',
      fontSize: '1.5rem'
    }}>
      Loading 3D model...
    </div>
  ),
});

export default function ViewModelPage() {
  const params = useParams();
  const filename = params?.filename as string;

  if (!filename) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Model not specified</h1>
        <Link href="/explore" style={{ color: '#0070f3' }}>
          Back to Explorer
        </Link>
      </div>
    );
  }

  const modelUrl = `/api/models/${filename}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'white'
      }}>
        <Link 
          href="/explore" 
          style={{ 
            color: '#4da6ff',
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Explorer
        </Link>
        <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
          {decodeURIComponent(filename)}
        </h2>
      </div>
      <GLBViewer modelUrl={modelUrl} />
    </div>
  );
}
