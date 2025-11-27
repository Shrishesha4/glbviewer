'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface Model {
  name: string;
  path: string;
  url: string;
  viewUrl: string;
  viewerUrl?: string;
}

export default function ModelsExplorePage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const loadModels = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setUploading(true);
    setUploadMessage(null);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: uploadUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({ type: 'success', text: `✓ ${data.message}` });
        setUploadUrl('');
        loadModels();
        setTimeout(() => setUploadMessage(null), 5000);
      } else {
        setUploadMessage({ type: 'error', text: `✗ ${data.error}` });
      }
    } catch (err) {
      setUploadMessage({ type: 'error', text: '✗ Failed to upload file from URL' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({ type: 'success', text: `✓ ${data.message}` });
        loadModels();
        setTimeout(() => setUploadMessage(null), 5000);
      } else {
        setUploadMessage({ type: 'error', text: `✗ ${data.error}` });
      }
    } catch (err) {
      setUploadMessage({ type: 'error', text: '✗ Failed to upload file' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (filename: string) => {
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('uploadApiKey') : null;
    
    // Check if API key is set
    if (!apiKey || !apiKey.trim()) {
      setUploadMessage({ 
        type: 'error', 
        text: '✗ API Key required. Set it in localStorage as "uploadApiKey" or configure in Media Explorer.' 
      });
      setTimeout(() => setUploadMessage(null), 5000);
      return;
    }

    if (!confirm(`Delete ${filename}?\n\nThis action cannot be undone.`)) return;

    setDeleting(filename);
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['X-API-Key'] = apiKey;

      const response = await fetch(`/api/models/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({ type: 'success', text: `✓ ${filename} deleted` });
        loadModels();
        setTimeout(() => setUploadMessage(null), 3000);
      } else {
        setUploadMessage({ type: 'error', text: `✗ ${data.error || 'Delete failed'}` });
        setTimeout(() => setUploadMessage(null), 5000);
      }
    } catch (err) {
      setUploadMessage({ type: 'error', text: `✗ Failed to delete ${filename}` });
      setTimeout(() => setUploadMessage(null), 5000);
    } finally {
      setDeleting(null);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#0070f3', fontSize: '0.9rem' }}>
            ← Back to Home
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#666'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Explore 3D Models
      </h1>
      
      <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
        {models.length === 0 
          ? 'No models found. Upload your first GLB/GLTF file below.'
          : `${models.length} model${models.length !== 1 ? 's' : ''} available`
        }
      </p>

      {/* Upload Section */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showUploadForm ? '1.5rem' : '0'
        }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
            📤 Upload Model
          </h2>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              padding: '0.5rem 1rem',
              background: showUploadForm ? '#e0e0e0' : '#0070f3',
              color: showUploadForm ? '#333' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            {showUploadForm ? 'Hide' : 'Show Upload'}
          </button>
        </div>

        {showUploadForm && (
          <div>
            {/* Upload from URL */}
            <form onSubmit={handleUrlUpload} style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Upload from URL
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://example.com/model.glb"
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={uploading || !uploadUrl.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: uploading ? '#ccc' : '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.5rem 0'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
              <span style={{ color: '#666', fontSize: '0.9rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            </div>

            {/* Upload from File */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Upload from Computer
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
                Accepts .glb and .gltf files (max 100MB)
              </p>
            </div>
          </div>
        )}

        {/* Upload Message */}
        {uploadMessage && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: uploadMessage.type === 'success' ? '#d4edda' : '#f8d7da',
            color: uploadMessage.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${uploadMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            {uploadMessage.text}
          </div>
        )}
      </div>

      {models.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {models.map((model) => (
            <div
              key={model.name}
              style={{
                padding: '1.5rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <Link href={model.viewUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(model.name);
                }}
                disabled={deleting === model.name}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem 0.75rem',
                  background: deleting === model.name ? '#ccc' : '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleting === model.name ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {deleting === model.name ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
