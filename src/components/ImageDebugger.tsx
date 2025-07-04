import React, { useState } from 'react';

interface ImageDebuggerProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (error: Event) => void;
  onLoad?: (event: Event) => void;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = ({ 
  src, 
  alt, 
  className = '', 
  onError, 
  onLoad 
}) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('✅ Image chargée:', currentSrc);
    setImageStatus('loaded');
    if (onLoad) onLoad(event.nativeEvent);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('❌ Erreur de chargement:', currentSrc);
    console.log('🔄 Tentative de fallback...');
    setImageStatus('error');
    
    // Fallback vers une image par défaut
    const fallbackSrc = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80';
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageStatus('loading');
    }
    
    if (onError) onError(event.nativeEvent);
  };

  return (
    <div className="relative">
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg">
          <div>Status: {imageStatus}</div>
          <div>Src: {currentSrc}</div>
        </div>
      )}
    </div>
  );
};

export default ImageDebugger;
