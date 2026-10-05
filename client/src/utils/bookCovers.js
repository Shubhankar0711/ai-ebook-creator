/**
 * Generates a rich SVG book cover that looks like the reference images —
 * colourful, illustrated-style with decorative shapes, big title, author.
 * Returns a data URI usable as <img src=...> or CSS background.
 */

const COVER_THEMES = [
 // Warm orange-red (Anxiety Alchemy style)
 {
 id: 0,
 name:"Sunrise",
 bg1:"#f97316",
 bg2:"#ef4444",
 accent:"#fde68a",
 text:"#fff",
 shape:"circles",
 },
 // Soft pink-purple (Chaos to Clarity style)
 {
 id: 1,
 name:"Lavender",
 bg1:"#e9d5ff",
 bg2:"#ddd6fe",
 accent:"#7c3aed",
 text:"#2e1065",
 shape:"waves",
 },
 // Bright yellow-orange (Introvert Networking style)
 {
 id: 2,
 name:"Glow",
 bg1:"#fef08a",
 bg2:"#fed7aa",
 accent:"#f97316",
 text:"#431407",
 shape:"stars",
 },
 // Clean white-green (Plant Based style)
 {
 id: 3,
 name:"Botanic",
 bg1:"#f0fdf4",
 bg2:"#dcfce7",
 accent:"#16a34a",
 text:"#14532d",
 shape:"leaves",
 },
 // Dark blue (Blueprint style)
 {
 id: 4,
 name:"Midnight",
 bg1:"#1e3a5f",
 bg2:"#0f172a",
 accent:"#38bdf8",
 text:"#fff",
 shape:"grid",
 },
 // Purple (Blueprint 2)
 {
 id: 5,
 name:"Violet",
 bg1:"#4c1d95",
 bg2:"#6d28d9",
 accent:"#c4b5fd",
 text:"#fff",
 shape:"dots",
 },
 // Teal
 {
 id: 6,
 name:"Aqua",
 bg1:"#0d9488",
 bg2:"#0f766e",
 accent:"#99f6e4",
 text:"#fff",
 shape:"circles",
 },
 // Gold
 {
 id: 7,
 name:"Radiant",
 bg1:"#f59e0b",
 bg2:"#d97706",
 accent:"#fff7ed",
 text:"#451a03",
 shape:"stars",
 },
 // Deep pink
 {
 id: 8,
 name:"Blush",
 bg1:"#be185d",
 bg2:"#9d174d",
 accent:"#fce7f3",
 text:"#fff",
 shape:"waves",
 },
 // Slate
 {
 id: 9,
 name:"Slate",
 bg1:"#334155",
 bg2:"#1e293b",
 accent:"#94a3b8",
 text:"#fff",
 shape:"grid",
 },
 // Crimson red layout
 {
 id: 10,
 name:"Crimson",
 bg1:"#7f1d1d",
 bg2:"#dc2626",
 accent:"#fde68a",
 text:"#fff",
 shape:"arcs",
 },
 // Laptop gallery cover
 {
 id: 11,
 name:"Laptop Gallery",
 bg1:"#b91c1c",
 bg2:"#f8fafc",
 accent:"#f97316",
 text:"#111827",
 shape:"gallery",
 },
];

const shapesSVG = {
 circles: (accent) => `
 <circle cx="250" cy="60" r="80" fill="${accent}" opacity="0.18"/>
 <circle cx="30" cy="300" r="60" fill="${accent}" opacity="0.12"/>
 <circle cx="220" cy="380" r="40" fill="${accent}" opacity="0.15"/>
 <circle cx="280" cy="160" r="30" fill="${accent}" opacity="0.10"/>`,

 waves: (accent) => `
 <path d="M0,120 Q80,80 160,120 Q240,160 320,120 L320,0 L0,0 Z" fill="${accent}" opacity="0.15"/>
 <path d="M0,380 Q80,340 160,380 Q240,420 320,380 L320,500 L0,500 Z" fill="${accent}" opacity="0.15"/>
 <ellipse cx="160" cy="250" rx="120" ry="40" fill="${accent}" opacity="0.08"/>`,

 stars: (accent) => `
 <polygon points="260,30 270,60 300,60 277,77 285,107 260,90 235,107 243,77 220,60 250,60" fill="${accent}" opacity="0.25"/>
 <polygon points="50,200 56,220 77,220 60,232 67,252 50,240 33,252 40,232 23,220 44,220" fill="${accent}" opacity="0.20"/>
 <polygon points="290,350 294,362 307,362 297,370 301,382 290,374 279,382 283,370 273,362 286,362" fill="${accent}" opacity="0.20"/>`,

 leaves: (accent) => `
 <ellipse cx="240" cy="100" rx="50" ry="80" fill="${accent}" opacity="0.20" transform="rotate(-30 240 100)"/>
 <ellipse cx="80" cy="320" rx="40" ry="70" fill="${accent}" opacity="0.15" transform="rotate(20 80 320)"/>
 <ellipse cx="270" cy="380" rx="35" ry="55" fill="${accent}" opacity="0.18" transform="rotate(-10 270 380)"/>`,

 grid: (accent) => `
 ${Array.from({ length: 8 }, (_, i) => `<line x1="${i * 46}" y1="0" x2="${i * 46}" y2="500" stroke="${accent}" stroke-width="1" opacity="0.12"/>`).join("")}
 ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="320" y2="${i * 50}" stroke="${accent}" stroke-width="1" opacity="0.12"/>`).join("")}`,

 dots: (accent) => `
 ${Array.from({ length: 5 }, (_, i) =>
 Array.from(
 { length: 8 },
 (_, j) =>
 `<circle cx="${30 + i * 60}" cy="${40 + j * 55}" r="3" fill="${accent}" opacity="0.18"/>`,
 ).join(""),
 ).join("")}`,
 arcs: (accent) => `
 <path d="M0,180 Q80,120 160,180 T320,180 L320,0 L0,0 Z" fill="${accent}" opacity="0.16"/>
 <path d="M0,320 Q80,260 160,320 T320,320 L320,500 L0,500 Z" fill="${accent}" opacity="0.12"/>
 <ellipse cx="160" cy="260" rx="100" ry="35" fill="${accent}" opacity="0.08"/>`,
 gallery: (accent) => `
 <rect x="20" y="110" width="280" height="170" rx="28" fill="${accent}" opacity="0.12"/>
 <rect x="36" y="126" width="90" height="92" rx="18" fill="${accent}" opacity="0.18"/>
 <rect x="136" y="126" width="70" height="70" rx="18" fill="${accent}" opacity="0.18"/>
 <rect x="216" y="126" width="84" height="92" rx="18" fill="${accent}" opacity="0.18"/>
 <rect x="36" y="230" width="264" height="44" rx="14" fill="${accent}" opacity="0.16"/>
 <rect x="42" y="236" width="80" height="8" rx="4" fill="${accent}" opacity="0.25"/>
 <rect x="42" y="252" width="160" height="8" rx="4" fill="${accent}" opacity="0.25"/>`,
};

export const COVER_TEMPLATE_PREVIEWS = COVER_THEMES.map((theme, index) => ({
 id: index,
 name: theme.name,
 themeIndex: index,
}));

export const generateBookCoverSVG = (
 title ="",
 author ="",
 genre ="",
 themeIndex = null,
) => {
 const idx =
 typeof themeIndex ==="number"
 ? ((themeIndex % COVER_THEMES.length) + COVER_THEMES.length) %
 COVER_THEMES.length
 : (title.charCodeAt(0) || 65) % COVER_THEMES.length;
 const theme = COVER_THEMES[idx];
 const shapes = (shapesSVG[theme.shape] || shapesSVG.circles)(theme.accent);

 // Wrap title into lines of ~16 chars
 const words = title.split("");
 const lines = [];
 let current ="";
 for (const w of words) {
 if ((current +"" + w).trim().length > 16 && current) {
 lines.push(current.trim());
 current = w;
 } else {
 current = (current +"" + w).trim();
 }
 }
 if (current) lines.push(current);

 const titleFontSize = title.length > 18 ? 26 : title.length > 12 ? 32 : 38;
 const titleY = 200 - (lines.length - 1) * (titleFontSize * 0.6);

 const titleLines = lines
 .map(
 (line, i) =>
 `<text x="160" y="${titleY + i * (titleFontSize + 8)}" text-anchor="middle"
 font-family="Georgia, serif" font-size="${titleFontSize}" font-weight="bold"
 fill="${theme.text}" letter-spacing="-0.5">${line}</text>`,
 )
 .join("");

 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 500" width="320" height="500">
 <defs>
 <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
 <stop offset="0%" stop-color="${theme.bg1}"/>
 <stop offset="100%" stop-color="${theme.bg2}"/>
 </linearGradient>
 </defs>
 <rect width="320" height="500" fill="url(#bg)"/>
 ${shapes}
 <!-- Genre tag -->
 ${
 genre
 ? `<rect x="20" y="20" width="${genre.length * 8 + 20}" height="24" rx="12" fill="${theme.accent}" opacity="0.35"/>
 <text x="${genre.length * 4 + 20}" y="36" text-anchor="middle" font-family="Inter,sans-serif"
 font-size="10" font-weight="700" fill="${theme.text}" opacity="0.8" letter-spacing="1">${genre.toUpperCase()}</text>`
 :""
 }
 <!-- Title -->
 ${titleLines}
 <!-- Divider -->
 <line x1="120" y1="${titleY + lines.length * (titleFontSize + 8) + 10}" x2="200"
 y2="${titleY + lines.length * (titleFontSize + 8) + 10}" stroke="${theme.text}" stroke-width="1.5" opacity="0.4"/>
 <!-- Author -->
 ${
 author
 ? `<text x="160" y="${titleY + lines.length * (titleFontSize + 8) + 34}"
 text-anchor="middle" font-family="Inter,sans-serif" font-size="13"
 fill="${theme.text}" opacity="0.75">${author}</text>`
 :""
 }
 <!-- Bottom bar -->
 <rect x="0" y="460" width="320" height="40" fill="${theme.bg2}" opacity="0.5"/>
 </svg>`;

 return"data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};

