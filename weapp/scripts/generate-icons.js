const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../src/assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const createPNGWithShape = (width, height, color, shape) => {
  const png = [];
  png.push(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
  
  const ihdr = [
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    8, 6, 0, 0, 0
  ];
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  png.push(...ihdrChunk);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      let r = 255, g = 255, b = 255, a = 0;
      
      if (shape === 'dumbbell') {
        const barWidth = 4;
        const plateRadius = 8;
        const centerX = width / 2;
        const centerY = height / 2;
        
        if (Math.abs(y - centerY) <= barWidth/2 && x > centerX - 12 && x < centerX + 12) {
          r = color[0]; g = color[1]; b = color[2]; a = 255;
        }
        
        const leftPlateDist = Math.sqrt(Math.pow(x - (centerX - 14), 2) + Math.pow(y - centerY, 2));
        const rightPlateDist = Math.sqrt(Math.pow(x - (centerX + 14), 2) + Math.pow(y - centerY, 2));
        
        if (leftPlateDist <= plateRadius || rightPlateDist <= plateRadius) {
          r = color[0]; g = color[1]; b = color[2]; a = 255;
        }
      } else if (shape === 'clipboard') {
        if (y >= 6 && y < height - 4 && x >= 6 && x < width - 6) {
          r = color[0]; g = color[1]; b = color[2]; a = 255;
        }
        if (y >= 2 && y < 8 && x >= 10 && x < width - 10) {
          r = color[0]; g = color[1]; b = color[2]; a = 255;
        }
      } else if (shape === 'chart') {
        const barWidth = 8;
        const gaps = 6;
        const startX = (width - (barWidth * 4 + gaps * 3)) / 2;
        
        const heights = [12, 20, 16, 28];
        
        for (let i = 0; i < 4; i++) {
          const barX = startX + i * (barWidth + gaps);
          const barY = height - 6 - heights[i];
          
          if (x >= barX && x < barX + barWidth && y >= barY && y < height - 6) {
            r = color[0]; g = color[1]; b = color[2]; a = 255;
          }
        }
      } else if (shape === 'settings') {
        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = 14;
        const innerRadius = 6;
        
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const toothX = centerX + Math.cos(angle) * outerRadius;
          const toothY = centerY + Math.sin(angle) * outerRadius;
          
          const dist = Math.sqrt(Math.pow(x - toothX, 2) + Math.pow(y - toothY, 2));
          if (dist <= 3) {
            r = color[0]; g = color[1]; b = color[2]; a = 255;
          }
        }
        
        const centerDist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (centerDist <= innerRadius) {
          r = color[0]; g = color[1]; b = color[2]; a = 255;
        }
      }
      
      rawData.push(r, g, b, a);
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', [...compressed]);
  png.push(...idatChunk);
  
  const iendChunk = createChunk('IEND', []);
  png.push(...iendChunk);
  
  return Buffer.from(png);
};

const createChunk = (type, data) => {
  const length = [
    (data.length >> 24) & 0xFF,
    (data.length >> 16) & 0xFF,
    (data.length >> 8) & 0xFF,
    data.length & 0xFF
  ];
  
  const typeBytes = type.split('').map(c => c.charCodeAt(0));
  const crcData = [...typeBytes, ...data];
  const crc = crc32(crcData);
  
  const crcBytes = [
    (crc >> 24) & 0xFF,
    (crc >> 16) & 0xFF,
    (crc >> 8) & 0xFF,
    crc & 0xFF
  ];
  
  return [...length, ...typeBytes, ...data, ...crcBytes];
};

const crc32 = (data) => {
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
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const icons = [
  { name: 'dumbbell.png', shape: 'dumbbell', color: [140, 140, 140] },
  { name: 'dumbbell-active.png', shape: 'dumbbell', color: [7, 193, 96] },
  { name: 'clipboard.png', shape: 'clipboard', color: [140, 140, 140] },
  { name: 'clipboard-active.png', shape: 'clipboard', color: [7, 193, 96] },
  { name: 'chart.png', shape: 'chart', color: [140, 140, 140] },
  { name: 'chart-active.png', shape: 'chart', color: [7, 193, 96] },
  { name: 'settings.png', shape: 'settings', color: [140, 140, 140] },
  { name: 'settings-active.png', shape: 'settings', color: [7, 193, 96] }
];

icons.forEach(icon => {
  const png = createPNGWithShape(48, 48, icon.color, icon.shape);
  fs.writeFileSync(path.join(assetsDir, icon.name), png);
  console.log(`Created: ${icon.name}`);
});

console.log('All icons created!');