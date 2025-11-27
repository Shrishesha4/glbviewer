'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Model {
  name: string;
  path: string;
  url: string;
  viewUrl: string;
}

export default function ExplorePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        setModels(data.models || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load models');
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading models...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#d32f2f' }}>{error}</div>
        <Link href="/" style={{ color: '#0070f3' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#0070f3', fontSize: '0.9rem' }}>
          ← Back to Home
        </Link>
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Explore 3D Models
      </h1>
      
      <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
        {models.length === 0 
          ? 'No models found. Place GLB/GLTF files in the public/models directory.'
          : `${models.length} model${models.length !== 1 ? 's' : ''} available`
        }
      </p>

      {models.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {models.map((model) => (
            <Link
              key={model.name}
              href={model.viewUrl}
              style={{
                display: 'block',
                padding: '1.5rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{
                width: '100%',
                height: '160px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem'
              }}>
                🎲
              </div>
              <h3 style={{ 
                fontSize: '1.1rem', 
                marginBottom: '0.5rem',
                wordBreak: 'break-word'
              }}>
                {model.name}
              </h3>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#666',
                margin: 0
              }}>
                Click to view
              </p>
            </Link>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <strong>Note:</strong> To add models, place your GLB or GLTF files in the{' '}
        <code style={{ 
          background: 'rgba(0,0,0,0.1)', 
          padding: '2px 6px', 
          borderRadius: '4px' 
        }}>
          public/models/
        </code>{' '}
        directory and restart the application.
      </div>
    </div>
  );
}
