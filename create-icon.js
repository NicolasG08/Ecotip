const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'assets', 'images', 'icon.png');
const outputPath = path.join(__dirname, 'assets', 'images', 'icon-foreground.png');

async function processIcon() {
  try {
    // Read the original image, resize it to 66% (1154x1154) to fit in the safe zone
    const resizedBuffer = await sharp(inputPath)
      .resize(1154, 1154, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Create a new 1748x1748 image with transparent background, composite the resized image in the center
    await sharp({
      create: {
        width: 1748,
        height: 1748,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: resizedBuffer, gravity: 'center' }])
    .toFile(outputPath);
    
    console.log('Successfully created icon-foreground.png');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processIcon();
