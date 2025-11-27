import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>GLB Viewer</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        View and explore 3D models in GLB/GLTF 2.0 format
      </p>
      <Link 
        href="/explore" 
        style={{ 
          padding: '1rem 2rem', 
          background: '#0070f3', 
          color: 'white', 
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '500',
          transition: 'background 0.2s'
        }}
      >
        Explore Models
      </Link>
    </main>
  );
}
