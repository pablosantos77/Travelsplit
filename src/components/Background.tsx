import React, { useEffect, useRef } from 'react';

export const Background: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Background video autoplay failed:", err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none flex items-center justify-center bg-white dark:bg-[#000000] overflow-hidden transition-colors duration-500">
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        className="w-[140%] h-[140%] object-cover blur-[60px] scale-125 transform-gpu opacity-40 dark:opacity-20"
      >
        <source src="/grainient.webm" type="video/webm" />
      </video>
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-5 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle at 20% 30%, #FF9FFC 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, #5227FF 0%, transparent 50%)`
        }}
      />
    </div>
  );
};
