'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center, PerspectiveCamera, Html, Bounds } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  isMobile: boolean;
}

function Model({ url, isMobile }: ModelProps) {
  const { scene } = useGLTF(url);
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();
  
  // Optimize materials for mobile
  useEffect(() => {
    if (isMobile) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          // Reduce material complexity for mobile
          material.roughness = Math.max(material.roughness || 0.5, 0.5);
          material.metalness = Math.min(material.metalness || 0.5, 0.5);
        }
      });
    }
  }, [clonedScene, isMobile]);
  
  return (
    <Center>
      <primitive object={clonedScene} />
    </Center>
  );
}

function Loader() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '12px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ fontSize: '14px', fontWeight: '500' }}>Loading 3D Model...</div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
}

interface GLBViewerProps {
  modelUrl: string;
}

export default function GLBViewer({ modelUrl }: GLBViewerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate initial loading state
    const timer = setTimeout(() => setIsLoading(false), 500);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          zIndex: 1000,
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(255, 255, 255, 0.2)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Initializing Viewer...</div>
          </div>
        </div>
      )}
      <Canvas
        shadows={!isMobile}
        gl={{ 
          antialias: !isMobile,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          // Mobile optimizations
          ...(isMobile && {
            precision: 'mediump',
            alpha: false,
            stencil: false,
            depth: true
          })
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        performance={{ min: 0.5 }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 5]} 
          fov={isMobile ? 60 : 50}
        />
        
        {/* Lighting - simplified for mobile */}
        <ambientLight intensity={isMobile ? 0.7 : 0.5} />
        {!isMobile && (
          <>
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
          </>
        )}
        {isMobile && (
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
        )}
        
        {/* Model */}
        <Suspense fallback={<Loader />}>
          <Bounds fit clip observe margin={1.2}>
            <Model url={modelUrl} isMobile={isMobile} />
          </Bounds>
          {!isMobile && <Environment preset="sunset" />}
          {isMobile && <Environment preset="city" environmentIntensity={0.5} />}
        </Suspense>
        
        {/* Controls - optimized for mobile touch */}
        <OrbitControls 
          enableDamping
          dampingFactor={isMobile ? 0.1 : 0.05}
          minDistance={0.1}
          maxDistance={100}
          rotateSpeed={isMobile ? 0.5 : 1}
          zoomSpeed={isMobile ? 0.6 : 1}
          panSpeed={isMobile ? 0.5 : 1}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
          makeDefault
        />
      </Canvas>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
