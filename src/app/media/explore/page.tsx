'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type MediaType = 'image' | 'video';

interface MediaItem {
  name: string;
  type: MediaType;
  path: string;
  url: string;
  viewUrl: string;
  size: number;
  modified: string;
}

export default function MediaExplorePage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [counts, setCounts] = useState<{ images: number; videos: number }>({ images: 0, videos: 0 });

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadType, setUploadType] = useState<'auto' | MediaType>('auto');
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  };

  useEffect(() => {
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('uploadApiKey') : null;
    if (savedKey) setApiKey(savedKey);
  }, []);

  const fetchMedia = async (currentFilter: 'all' | 'images' | 'videos') => {
    setLoading(true);
    setError(null);
    try {
      const qs = currentFilter === 'all' ? '' : `?type=${currentFilter}`;
      const res = await fetch(`/api/media${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load media');
      setMedia(data.media || []);
      setCounts({ images: data.types?.images ?? 0, videos: data.types?.videos ?? 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const totalCount = useMemo(() => counts.images + counts.videos, [counts]);

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {};
    if (apiKey && apiKey.trim()) {
      h['X-API-Key'] = apiKey.trim();
    }
    return h;
  }, [apiKey]);

  const handleSaveApiKey = () => {
    localStorage.setItem('uploadApiKey', apiKey.trim());
    setShowApiKey(false);
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          url: uploadUrl.trim(),
          ...(uploadType !== 'auto' ? { type: uploadType } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setUploadMessage({ type: 'success', text: `✓ ${data.message}` });
      setUploadUrl('');
      fetchMedia(filter);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (e) {
      setUploadMessage({ type: 'error', text: `✗ ${(e as Error).message}` });
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
      const fd = new FormData();
      fd.append('file', file);
      if (uploadType !== 'auto') {
        fd.append('type', uploadType);
      }
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setUploadMessage({ type: 'success', text: `✓ ${data.message}` });
      fetchMedia(filter);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (e) {
      setUploadMessage({ type: 'error', text: `✗ ${(e as Error).message}` });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (item: MediaItem) => {
    // Check if API key is set
    if (!apiKey || !apiKey.trim()) {
      setUploadMessage({ 
        type: 'error', 
        text: '✗ API Key required. Click "Set API Key" button to configure it.' 
      });
      setTimeout(() => setUploadMessage(null), 5000);
      return;
    }

    if (!confirm(`Delete ${item.name}?\n\nThis action cannot be undone.`)) return;

    setDeleting(item.name);
    try {
      const dirName = item.type === 'image' ? 'images' : 'videos';
      const res = await fetch(`/api/media/${dirName}/${encodeURIComponent(item.name)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadMessage({ type: 'success', text: `✓ ${item.name} deleted` });
        fetchMedia(filter);
        setTimeout(() => setUploadMessage(null), 3000);
      } else {
        setUploadMessage({ type: 'error', text: `✗ ${data.error || 'Delete failed'}` });
        setTimeout(() => setUploadMessage(null), 5000);
      }
    } catch (e) {
      setUploadMessage({ type: 'error', text: `✗ Failed to delete ${item.name}` });
      setTimeout(() => setUploadMessage(null), 5000);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
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

      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Explore Media</h1>
      <p style={{ color: '#666', marginBottom: '1.25rem' }}>
        {totalCount === 0 ? 'No media found. Upload an image or video.' : `${totalCount} item${totalCount !== 1 ? 's' : ''} • ${counts.images} images • ${counts.videos} videos`}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: filter === 'all' ? '#0070f3' : '#fff',
            color: filter === 'all' ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >All</button>
        <button
          onClick={() => setFilter('images')}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: filter === 'images' ? '#0070f3' : '#fff',
            color: filter === 'images' ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >Images</button>
        <button
          onClick={() => setFilter('videos')}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: filter === 'videos' ? '#0070f3' : '#fff',
            color: filter === 'videos' ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >Videos</button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 8,
            border: 'none',
            background: showUploadForm ? '#e0e0e0' : '#0070f3',
            color: showUploadForm ? '#333' : '#fff',
            cursor: 'pointer',
          }}
        >{showUploadForm ? 'Hide Upload' : 'Upload Media'}</button>
      </div>

      {showUploadForm && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 500 }}>Type</label>
            <select value={uploadType} onChange={(e) => setUploadType(e.target.value as any)} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}>
              <option value="auto">Auto (by extension)</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <div style={{ width: 1, height: 20, background: '#eee' }} />
            <button onClick={() => setShowApiKey(!showApiKey)} style={{ padding: '0.4rem 0.7rem', borderRadius: 6, border: '1px solid #ddd', background: '#fafafa', cursor: 'pointer' }}>
              {showApiKey ? 'Hide API Key' : 'Set API Key'}
            </button>
            {showApiKey && (
              <>
                <input
                  type="password"
                  placeholder="UPLOAD_API_KEY (optional)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{ flex: 1, minWidth: 240, padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}
                />
                <button onClick={handleSaveApiKey} style={{ padding: '0.45rem 0.75rem', borderRadius: 6, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>Save</button>
              </>
            )}
          </div>

          <form onSubmit={handleUrlUpload} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="url"
              placeholder="https://example.com/file.jpg | file.mp4"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              disabled={uploading}
              style={{ flex: 1, minWidth: 260, padding: '0.75rem', border: '1px solid #ddd', borderRadius: 6 }}
            />
            <button type="submit" disabled={uploading || !uploadUrl.trim()} style={{ padding: '0.75rem 1.2rem', borderRadius: 6, border: 'none', background: uploading ? '#ccc' : '#0070f3', color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? 'Uploading…' : 'Upload from URL'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0.75rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#eee' }} />
            <span style={{ color: '#888', fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#eee' }} />
          </div>

          <div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploading} />
            <p style={{ color: '#666', fontSize: 12, marginTop: 6 }}>Images up to 20MB. Videos up to 500MB.</p>
          </div>

          {uploadMessage && (
            <div style={{ marginTop: 10, padding: '0.6rem 0.8rem', borderRadius: 6, background: uploadMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: uploadMessage.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${uploadMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>
              {uploadMessage.text}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading media…</div>
      ) : error ? (
        <div style={{ color: '#d32f2f' }}>{error}</div>
      ) : media.length === 0 ? (
        <div style={{ color: '#666' }}>No media found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {media.map((item) => (
            <div key={`${item.type}:${item.name}`} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: '100%', height: 160, background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <video src={item.url} controls preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', wordBreak: 'break-word' }}>{item.name}</h3>
                  <span style={{ fontSize: 12, color: '#666', textTransform: 'uppercase' }}>{item.type}</span>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{(item.size / 1024).toFixed(1)} KB • {new Date(item.modified).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Link href={item.viewUrl} target="_blank" style={{ padding: '0.4rem 0.6rem', borderRadius: 6, background: '#0070f3', color: '#fff', textDecoration: 'none', fontSize: 12 }}>Open</Link>
                  <a href={item.url} target="_blank" style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #ddd', textDecoration: 'none', color: '#333', fontSize: 12 }}>Direct URL</a>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.name}
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: 6,
                      border: 'none',
                      background: deleting === item.name ? '#ccc' : '#ff4444',
                      color: '#fff',
                      cursor: deleting === item.name ? 'not-allowed' : 'pointer',
                      fontSize: 12
                    }}
                  >
                    {deleting === item.name ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
