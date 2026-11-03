import React, { useState, useEffect } from 'react';

interface AmbientBackgroundProps {
  photos: string[];
  intervalSeconds?: number;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  photos,
  intervalSeconds = 25
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!photos || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [photos, intervalSeconds]);

  if (!photos || photos.length === 0) {
    return <div className="fixed inset-0 bg-[#090d16] -z-20" />;
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none select-none">
      <img
        key={currentPhoto}
        src={currentPhoto}
        alt="Ambient background"
        className="w-full h-full object-cover transition-opacity duration-1000 opacity-30 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
      />
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/85 to-[#090d16]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
    </div>
  );
};
