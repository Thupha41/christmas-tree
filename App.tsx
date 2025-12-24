
import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { TreeMode } from './types';

// Default photos to display on the tree
const DEFAULT_PHOTOS = [
  '/photos/z7360734546167_92e3622f1ec1cdc5ced46906d6c7d0c4.jpg',
  '/photos/z7360734556376_a03660e9dd0311a54f35d7e4e105a9e5.jpg',
  '/photos/z7360734559888_2607fa1d666d0c2af1991db994c39d48.jpg',
  '/photos/z7360734570227_51887180340024d69a745bfb751047f7.jpg',
  '/photos/z7360734593516_ff4cb9a9d4f9bc14bd421215be9c268a.jpg',
  '/photos/z7360734600235_747c8adacb18625f5355c945c84ebafc.jpg',
];

// Simple Error Boundary to catch 3D resource loading errors (like textures)
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error loading 3D scene:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can customize this fallback UI
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-[#D4AF37] font-serif p-8 text-center">
          <div>
            <h2 className="text-2xl mb-2">Something went wrong</h2>
            <p className="opacity-70">A resource failed to load (likely a missing image). Check the console for details.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [mode, setMode] = useState<TreeMode>(TreeMode.FORMED);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(DEFAULT_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play music on first user interaction (required by browsers)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log('Audio autoplay prevented:', err);
        });
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === TreeMode.FORMED ? TreeMode.CHAOS : TreeMode.FORMED));
  };

  const handlePhotosUpload = (photos: string[]) => {
    setUploadedPhotos(photos);
  };

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  const closePhotoPopup = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-black via-[#001a0d] to-[#0a2f1e]">
      {/* Background Music - Auto-plays on first click */}
      <audio 
        ref={audioRef} 
        src="/music/Last_Christmas.mp3" 
        loop 
        preload="auto"
      />

      <ErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 4, 20], fov: 45 }}
          gl={{ antialias: false, stencil: false, alpha: false }}
          shadows
        >
          <Suspense fallback={null}>
            <Experience mode={mode} uploadedPhotos={uploadedPhotos} onPhotoClick={handlePhotoClick} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      <Loader 
        containerStyles={{ background: '#000' }} 
        innerStyles={{ width: '300px', height: '10px', background: '#333' }}
        barStyles={{ background: '#D4AF37', height: '10px' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'Cinzel' }}
      />
      
      <UIOverlay 
        mode={mode} 
        onToggle={toggleMode} 
        onPhotosUpload={handlePhotosUpload} 
        hasPhotos={uploadedPhotos.length > 0}
        uploadedPhotos={uploadedPhotos}
        isSharedView={false}
      />

      {/* Photo Popup Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer animate-fade-in"
          onClick={closePhotoPopup}
        >
          {/* Polaroid frame with photo */}
          <div 
            className="relative transform transition-all duration-300 ease-out animate-scale-in cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Polaroid container */}
            <div className="bg-white p-4 pb-8 shadow-2xl" style={{ width: '70vmin', maxWidth: '700px' }}>
              {/* Gold clip at top */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-6 bg-gradient-to-b from-[#D4AF37] to-[#C5A028] rounded-sm shadow-lg"></div>
              
              {/* Photo */}
              <img 
                src={selectedPhoto} 
                alt="Selected Memory" 
                className="w-full aspect-square object-cover"
              />
              
              {/* Text label */}
              <div className="text-center mt-4 font-serif text-gray-700 text-lg">
                Happy Memories ✨
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={closePhotoPopup}
              className="absolute -top-4 -right-4 w-10 h-10 bg-[#D4AF37] hover:bg-[#C5A028] rounded-full flex items-center justify-center text-black text-xl font-bold shadow-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

