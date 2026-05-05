const fs = require('fs');
function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  console.log(`${filePath.split('/').pop()}: ${width}x${height}`);
}
try { getPngDimensions('c:/dev/Ecotip/assets/images/icon.png'); } catch (e) { console.error(e); }
try { getPngDimensions('c:/dev/Ecotip/assets/images/carga.png'); } catch (e) { console.error(e); }
