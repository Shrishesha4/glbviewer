'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import Link from 'next/link';

export default function ApiDocsPage() {
  return (
    <div>
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem' }}>CDN API Documentation</h1>
            <Link href="/" style={{ color: '#0070f3' }}>
                ← Back to Home
            </Link>
        </div>
        <SwaggerUI url="/openapi.json" />
    </div>
  );
}
