import React, { useRef } from 'react';
import { TreeMode } from '../types';

interface UIOverlayProps {
  mode: TreeMode;
  onToggle: () => void;
  onPhotosUpload: (photos: string[]) => void;
  hasPhotos: boolean;
  uploadedPhotos: string[];
  isSharedView: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ mode, onToggle, onPhotosUpload, hasPhotos, uploadedPhotos, isSharedView }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });

      readers.push(promise);
    }

    try {
      const dataUrls = await Promise.all(readers);

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: dataUrls }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { imageUrls } = await response.json();

      // Append new photos to existing ones
      onPhotosUpload([...uploadedPhotos, ...imageUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback to local data URLs if upload fails
      const dataUrls = await Promise.all(readers);
      onPhotosUpload([...uploadedPhotos, ...dataUrls]);
    }

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      
      {/* Header */}
      <header className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5E6BF] to-[#D4AF37] font-serif drop-shadow-lg tracking-wider text-center">
          Merry Christmas
        </h1>
      </header>

      {/* Right Bottom Action Area */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-auto">
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Photos Button */}
        <button
          onClick={handleUploadClick}
          className="group px-6 py-3 border-2 border-[#D4AF37] bg-black/70 backdrop-blur-md overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_#D4AF37] hover:border-[#fff] hover:bg-[#D4AF37]/20"
        >
          <span className="relative z-10 font-serif text-base md:text-lg text-[#D4AF37] tracking-[0.1em] group-hover:text-white transition-colors whitespace-nowrap flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Photos
          </span>
        </button>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37] opacity-50"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37] opacity-50"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37] opacity-50"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37] opacity-50"></div>
    </div>
  );
};