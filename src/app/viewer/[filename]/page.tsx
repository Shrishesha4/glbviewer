'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

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

export default function ViewOnlyModelPage() {
  const params = useParams();
  const filename = params?.filename as string;

  if (!filename) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1a1a1a',
        color: 'white'
      }}>
        <div>Model not specified</div>
      </div>
    );
  }

  const modelUrl = `/api/models/${filename}`;

  return <GLBViewer modelUrl={modelUrl} />;
}
