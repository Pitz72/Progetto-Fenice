import { useState, useEffect, CSSProperties } from 'react';

// The native resolution of the game. All UI is designed for this size.
const NATIVE_WIDTH = 1920;
const NATIVE_HEIGHT = 1080;

export const useGameScale = (): CSSProperties => {
  const [scaleStyle, setScaleStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: screenWidth, innerHeight: screenHeight } = window;

      // Calculate the scale factor to fit the screen while maintaining aspect ratio
      const scale = Math.min(screenWidth / NATIVE_WIDTH, screenHeight / NATIVE_HEIGHT);

      // Calculate the dimensions of the scaled game
      const scaledWidth = NATIVE_WIDTH * scale;
      const scaledHeight = NATIVE_HEIGHT * scale;

      // Calculate the top and left offsets to center the game on the screen
      const offsetX = (screenWidth - scaledWidth) / 2;
      const offsetY = (screenHeight - scaledHeight) / 2;

      setScaleStyle({
        position: 'absolute',
        transform: `scale(${scale})`,
        transformOrigin: 'top left', // Scale from the top-left corner
        left: `${offsetX}px`,
        top: `${offsetY}px`,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return scaleStyle;
};