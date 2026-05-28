const fs = require('fs');
const path = require('path');

function createSimplePng(width, height, color) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdr = createChunk('IHDR', ihdrData);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      const centerX = width / 2;
      const centerY = height / 2;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      if (dist < width * 0.4) {
        rawData.push(color.r, color.g, color.b);
      } else {
        rawData.push(200, 200, 200);
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);
  
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return crc ^ 0xFFFFFFFF;
}

const assetsDir = path.join(__dirname, 'src', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const icons = [
  { name: 'dumbbell.png', color: { r: 100, g: 100, b: 100 } },
  { name: 'dumbbell-active.png', color: { r: 7, g: 193, b: 96 } },
  { name: 'clipboard.png', color: { r: 100, g: 100, b: 100 } },
  { name: 'clipboard-active.png', color: { r: 7, g: 193, b: 96 } },
  { name: 'chart.png', color: { r: 100, g: 100, b: 100 } },
  { name: 'chart-active.png', color: { r: 7, g: 193, b: 96 } },
  { name: 'settings.png', color: { r: 100, g: 100, b: 100 } },
  { name: 'settings-active.png', color: { r: 7, g: 193, b: 96 } },
];

icons.forEach(icon => {
  const png = createSimplePng(81, 81, icon.color);
  const filePath = path.join(assetsDir, icon.name);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${icon.name}`);
});

console.log('All icons created successfully!');
