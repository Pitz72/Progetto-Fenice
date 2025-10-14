export const TILE_SIZE = 32;

// The SVG tileset is the primary and only tileset. It is defined in code,
// cannot be corrupted, and provides a clean, retro aesthetic.
export const TILESET_SRC = `data:image/svg+xml;base64,${btoa(`
<svg width="160" height="96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="4" height="4">
      <rect width="4" height="4" fill="#4ade80"/>
      <circle cx="1" cy="1" r="0.5" fill="#22c55e"/>
      <circle cx="3" cy="3" r="0.5" fill="#22c55e"/>
    </pattern>
    <pattern id="forestPattern" patternUnits="userSpaceOnUse" width="8" height="8">
      <rect width="8" height="8" fill="#166534"/>
      <polygon points="2,6 4,2 6,6" fill="#15803d"/>
      <polygon points="1,7 2,5 3,7" fill="#15803d"/>
      <polygon points="5,7 6,5 7,7" fill="#15803d"/>
    </pattern>
    <pattern id="waterPattern" patternUnits="userSpaceOnUse" width="16" height="8">
      <rect width="16" height="8" fill="#0ea5e9"/>
      <path d="M0,4 Q4,2 8,4 T16,4" stroke="#0284c7" stroke-width="1" fill="none"/>
      <path d="M0,6 Q4,4 8,6 T16,6" stroke="#0284c7" stroke-width="1" fill="none"/>
    </pattern>
    <pattern id="mountainPattern" patternUnits="userSpaceOnUse" width="16" height="16">
      <rect width="16" height="16" fill="#6b7280"/>
      <polygon points="8,2 12,14 4,14" fill="#9ca3af"/>
      <polygon points="2,8 6,14 0,14" fill="#9ca3af"/>
      <polygon points="14,8 16,14 10,14" fill="#9ca3af"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="32" height="32" fill="url(#grassPattern)"/>
  <rect x="0" y="0" width="32" height="32" fill="none" stroke="#22c55e" stroke-width="1"/>
  <rect x="32" y="0" width="32" height="32" fill="url(#forestPattern)"/>
  <polygon points="40,24 48,8 56,24" fill="#16a34a"/>
  <rect x="46" y="24" width="4" height="8" fill="#92400e"/>
  <rect x="64" y="0" width="32" height="32" fill="url(#waterPattern)"/>
  <circle cx="80" cy="16" r="3" fill="#0284c7" opacity="0.7"/>
  <rect x="96" y="0" width="32" height="32" fill="url(#mountainPattern)"/>
  <polygon points="112,4 120,28 104,28" fill="#d1d5db"/>
  <polygon points="112,4 116,12 108,12" fill="#f3f4f6"/>
  <rect x="128" y="0" width="32" height="32" fill="#1f2937"/>
  <rect x="0" y="32" width="32" height="32" fill="#92400e"/>
  <polygon points="16,36 8,48 24,48" fill="#dc2626"/>
  <rect x="12" y="48" width="8" height="16" fill="#7c2d12"/>
  <rect x="14" y="52" width="4" height="6" fill="#451a03"/>
  <rect x="32" y="32" width="32" height="32" fill="#374151"/>
  <rect x="36" y="40" width="6" height="24" fill="#6b7280"/>
  <rect x="44" y="36" width="6" height="28" fill="#6b7280"/>
  <rect x="52" y="42" width="6" height="22" fill="#6b7280"/>
  <rect x="38" y="44" width="2" height="2" fill="#fbbf24"/>
  <rect x="46" y="40" width="2" height="2" fill="#fbbf24"/>
  <rect x="54" y="46" width="2" height="2" fill="#fbbf24"/>
  <rect x="64" y="32" width="32" height="32" fill="#d97706"/>
  <polygon points="80,36 72,48 88,48" fill="#dc2626"/>
  <rect x="76" y="48" width="8" height="16" fill="#92400e"/>
  <rect x="78" y="52" width="4" height="6" fill="#451a03"/>
  <circle cx="84" cy="40" r="2" fill="#65a30d"/>
  <rect x="96" y="32" width="32" height="32" fill="#fbbf24"/>
  <polygon points="112,40 108,48 116,48" fill="#f59e0b"/>
  <text x="112" y="58" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#92400e">S</text>
  <rect x="128" y="32" width="32" height="32" fill="#dc2626"/>
  <circle cx="144" cy="48" r="8" fill="#b91c1c"/>
  <text x="144" y="52" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#fef2f2">E</text>
  <rect x="0" y="64" width="32" height="32" fill="#ec4899"/>
  <circle cx="16" cy="76" r="6" fill="#f9a8d4"/>
  <circle cx="14" cy="74" r="1" fill="#1f2937"/>
  <circle cx="18" cy="74" r="1" fill="#1f2937"/>
  <path d="M12,78 Q16,80 20,78" stroke="#1f2937" stroke-width="1" fill="none"/>
  <rect x="12" y="82" width="8" height="10" fill="#3b82f6"/>
  <rect x="10" y="88" width="4" height="8" fill="#1f2937"/>
  <rect x="18" y="88" width="4" height="8" fill="#1f2937"/>
  <rect x="32" y="64" width="32" height="32" fill="#1f2937"/>
  <rect x="64" y="64" width="32" height="32" fill="#1f2937"/>
  <rect x="96" y="64" width="32" height="32" fill="#1f2937"/>
  <rect x="128" y="64" width="32" height="32" fill="#1f2937"/>
</svg>
`)}`;

export const TILE_MAP: { [key: string]: { x: number; y: number } } = {
  '.': { x: 0 * TILE_SIZE, y: 0 * TILE_SIZE },   // Plains
  'F': { x: 1 * TILE_SIZE, y: 0 * TILE_SIZE },   // Forest
  '~': { x: 2 * TILE_SIZE, y: 0 * TILE_SIZE },   // Water
  'M': { x: 3 * TILE_SIZE, y: 0 * TILE_SIZE },   // Mountain
  'R': { x: 0 * TILE_SIZE, y: 1 * TILE_SIZE },   // Refuge
  'C': { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },   // City
  'V': { x: 2 * TILE_SIZE, y: 1 * TILE_SIZE },   // Village
  'S': { x: 3 * TILE_SIZE, y: 1 * TILE_SIZE },   // Start
  'E': { x: 4 * TILE_SIZE, y: 1 * TILE_SIZE },   // End
  '@': { x: 0 * TILE_SIZE, y: 2 * TILE_SIZE },   // Player
};
