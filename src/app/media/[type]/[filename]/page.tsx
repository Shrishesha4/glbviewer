'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MediaViewerPage({ params }: { params: Promise<{ type: string; filename: string }> }) {
  const { type, filename } = use(params);
  const router = useRouter();
  
  const mediaUrl = `/${type}/${filename}`;
  const isImage = type === 'image';
  const isVideo = type === 'video';
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a1a' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        background: 'rgba(0, 0, 0, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>
            {decodeURIComponent(filename)}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href={mediaUrl}
            download={filename}
            style={{
              padding: '0.5rem 1rem',
              background: '#0070f3',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            Download
          </a>
          <Link
            href="/explore"
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            Explore
          </Link>
        </div>
      </div>

      {/* Media Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'auto'
      }}>
        {isImage && (
          <img
            src={mediaUrl}
            alt={filename}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
        
        {isVideo && (
          <video
            src={mediaUrl}
            controls
            autoPlay
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '8px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
      </div>

      {/* Info Footer */}
      <div style={{
        padding: '1rem 2rem',
        background: 'rgba(0, 0, 0, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.9rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Direct URL:</strong>{' '}
          <code style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>
            {typeof window !== 'undefined' ? `${window.location.origin}${mediaUrl}` : mediaUrl}
          </code>
        </div>
        <div>
          Type: {isImage ? 'Image' : 'Video'}
        </div>
      </div>
    </div>
  );
}
