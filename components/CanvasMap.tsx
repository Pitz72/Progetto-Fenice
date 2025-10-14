import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { TILESET_SRC, TILE_MAP, TILE_SIZE as BASE_TILE_SIZE } from '../assets/tileset';

const CanvasMap: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const map = useGameStore((state) => state.map);
    const playerPos = useGameStore((state) => state.playerPos);

    const [tilesetImage, setTilesetImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setTilesetImage(img);
        };
        img.onerror = (error) => {
            console.error('Failed to load tileset:', error);
        };
        img.src = TILESET_SRC;
    }, []);

    // The render function now reads canvas dimensions directly from the ref.
    const renderMap = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx || !tilesetImage || !map.length || canvas.width === 0 || canvas.height === 0) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000'; // Black background for any uncovered areas
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        const { width: viewportWidth, height: viewportHeight } = canvas; // Read from canvas directly
        const mapHeight = map.length;
        const mapWidth = map[0].length;

        // --- Viewport and Camera Logic ---
        const viewportTilesVertical = 25;
        const tileSize = viewportHeight / viewportTilesVertical;
        const viewportTilesHorizontal = viewportWidth / tileSize;

        let cameraX = playerPos.x - (viewportTilesHorizontal / 2);
        let cameraY = playerPos.y - (viewportTilesVertical / 2);

        cameraX = Math.max(0, Math.min(cameraX, mapWidth - viewportTilesHorizontal));
        cameraY = Math.max(0, Math.min(cameraY, mapHeight - viewportTilesVertical));

        const startCol = Math.floor(cameraX);
        const endCol = Math.ceil(cameraX + viewportTilesHorizontal);
        const startRow = Math.floor(cameraY);
        const endRow = Math.ceil(cameraY + viewportTilesVertical);

        for (let y = startRow; y < endRow; y++) {
            for (let x = startCol; x < endCol; x++) {
                if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                    const char = map[y][x];
                    const tile = TILE_MAP[char] || TILE_MAP['.'];
                    const screenX = Math.round((x - cameraX) * tileSize);
                    const screenY = Math.round((y - cameraY) * tileSize);
                    ctx.drawImage(
                        tilesetImage,
                        tile.x, tile.y,
                        BASE_TILE_SIZE, BASE_TILE_SIZE,
                        screenX, screenY, 
                        Math.ceil(tileSize), Math.ceil(tileSize)
                    );
                }
            }
        }
        
        const playerScreenX = Math.round((playerPos.x - cameraX) * tileSize);
        const playerScreenY = Math.round((playerPos.y - cameraY) * tileSize);
        const playerTile = TILE_MAP['@'];
        
        ctx.drawImage(
            tilesetImage,
            playerTile.x, playerTile.y,
            BASE_TILE_SIZE, BASE_TILE_SIZE,
            playerScreenX, playerScreenY, 
            Math.ceil(tileSize), Math.ceil(tileSize)
        );

    }, [map, playerPos, tilesetImage]);
    
    // This effect now handles resizing without triggering React state updates.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        if (!container) return;
        
        let animationFrameId: number;

        const resizeObserver = new ResizeObserver(entries => {
            animationFrameId = window.requestAnimationFrame(() => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    const roundedWidth = Math.round(width);
                    const roundedHeight = Math.round(height);
                    if (canvas.width !== roundedWidth || canvas.height !== roundedHeight) {
                        canvas.width = roundedWidth;
                        canvas.height = roundedHeight;
                    }
                }
            });
        });
        
        resizeObserver.observe(container);

        // Disconnect observer on cleanup.
        return () => {
            resizeObserver.disconnect();
            window.cancelAnimationFrame(animationFrameId);
        }
    }, []); // Empty dependency array means this runs once on mount.

    // This effect runs the animation loop.
    useEffect(() => {
        let animationFrameId: number;
        // The renderMap function is stable due to useCallback, so this loop is not re-created unnecessarily.
        const renderLoop = () => {
            renderMap();
            animationFrameId = requestAnimationFrame(renderLoop);
        };
        animationFrameId = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [renderMap]);


    return (
        <div className="w-full h-full bg-black">
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default CanvasMap;