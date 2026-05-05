/**
 * Generates splash logo images matching the SplashScreen.tsx component.
 * Creates both light and dark mode versions with correct text colors.
 * 
 * Run: node make-splash-screen.js
 */
const sharp = require('sharp');
const path = require('path');

const IMG_WIDTH = 480;
const CIRCLE_DIAMETER = 200;
const CIRCLE_R = CIRCLE_DIAMETER / 2;
const CIRCLE_CX = IMG_WIDTH / 2;

// Vertical layout
const LOGO_TOP = 40;
const CIRCLE_CY = LOGO_TOP + CIRCLE_R;
const TEXT_Y = CIRCLE_CY + CIRCLE_R + 24 + 40;
const TAGLINE_Y = TEXT_Y + 4 + 24;
const TOTAL_HEIGHT = TAGLINE_Y + 40;

// Leaf SVG paths
const leafPaths = `
<path fill="#FFFFFF" d="M161.35,242a16,16,0,0,1,22.62-.68c73.63,69.36,147.51,111.56,234.45,133.07,11.73-32,12.77-67.22,2.64-101.58-13.44-45.59-44.74-85.31-90.49-114.86-40.84-26.38-81.66-33.25-121.15-39.89-49.82-8.38-96.88-16.3-141.79-63.85-5-5.26-11.81-7.37-18.32-5.66-7.44,2-12.43,7.88-14.82,17.6-5.6,22.75-2,86.51,13.75,153.82,25.29,108.14,65.65,162.86,95.06,189.73,38,34.69,87.62,53.9,136.93,53.9A186,186,0,0,0,308,461.56c41.71-6.32,76.43-27.27,96-57.75-89.49-23.28-165.94-67.55-242-139.16A16,16,0,0,1,161.35,242Z"/>
<path fill="#FFFFFF" d="M467.43,384.19c-16.83-2.59-33.13-5.84-49-9.77a157.71,157.71,0,0,1-12.13,25.68c-.73,1.25-1.5,2.49-2.29,3.71a584.21,584.21,0,0,0,58.56,12,16,16,0,1,0,4.87-31.62Z"/>
`;

const leafIconSize = CIRCLE_R * 1.1;
const leafScale = leafIconSize / 512;
const leafOffsetX = CIRCLE_CX - leafIconSize / 2;
const leafOffsetY = CIRCLE_CY - leafIconSize / 2;

function buildSvg({ titleColor, taglineColor, circleColors }) {
  return `
<svg width="${IMG_WIDTH}" height="${TOTAL_HEIGHT}" viewBox="0 0 ${IMG_WIDTH} ${TOTAL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="circleGrad" x1="0" y1="${CIRCLE_CY - CIRCLE_R}" x2="0" y2="${CIRCLE_CY + CIRCLE_R}">
      <stop offset="0%" stop-color="${circleColors[0]}" />
      <stop offset="50%" stop-color="${circleColors[1]}" />
      <stop offset="100%" stop-color="${circleColors[2]}" />
    </linearGradient>
  </defs>

  <!-- Main circle with gradient -->
  <circle cx="${CIRCLE_CX}" cy="${CIRCLE_CY}" r="${CIRCLE_R}" fill="url(#circleGrad)" />

  <!-- Leaf icon -->
  <g transform="translate(${Math.round(leafOffsetX)}, ${Math.round(leafOffsetY)}) scale(${leafScale.toFixed(4)})">
    ${leafPaths}
  </g>

  <!-- App name -->
  <text x="${CIRCLE_CX}" y="${TEXT_Y}" text-anchor="middle" 
        font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="900" 
        fill="${titleColor}" letter-spacing="1">Ecotip</text>

  <!-- Tagline -->
  <text x="${CIRCLE_CX}" y="${TAGLINE_Y}" text-anchor="middle" 
        font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="400" 
        fill="${taglineColor}">Tu compañero de reciclaje</text>
</svg>
`;
}

async function generate() {
  // Light mode: dark text on light green background
  const lightSvg = buildSvg({
    titleColor: '#263238',
    taglineColor: '#9E9E9E',
    circleColors: ['#4CAF50', '#81C784', '#A5D6A7'],
  });
  
  const lightPath = path.join(__dirname, 'assets', 'images', 'splash-logo.png');
  await sharp(Buffer.from(lightSvg)).png().toFile(lightPath);
  const lightMeta = await sharp(lightPath).metadata();
  console.log(`✅ Light: splash-logo.png — ${lightMeta.width}x${lightMeta.height}`);

  // Dark mode: white/light text on dark green background
  const darkSvg = buildSvg({
    titleColor: '#FAFAFA',      // matches Colors.dark.text
    taglineColor: '#A5D6A7',    // matches Colors.dark.textSecondary
    circleColors: ['#4CAF50', '#81C784', '#A5D6A7'],
  });
  
  const darkPath = path.join(__dirname, 'assets', 'images', 'splash-logo-dark.png');
  await sharp(Buffer.from(darkSvg)).png().toFile(darkPath);
  const darkMeta = await sharp(darkPath).metadata();
  console.log(`✅ Dark:  splash-logo-dark.png — ${darkMeta.width}x${darkMeta.height}`);
}

generate().catch(console.error);
