// Generate proper PNG icons for PWA manifest
// Creates a minimal but valid 512x512 and 192x192 PNG icon
const fs = require('fs');
const zlib = require('zlib');

function createPNG(size) {
  const width = size;
  const height = size;

  // Create pixel data: dark navy background with golden star pattern
  const bgR = 14, bgG = 14, bgB = 36; // #0e0e24
  const goldR = 222, goldG = 174, goldB = 82; // #deae52

  const rawData = Buffer.alloc(height * (1 + width * 4)); // filter byte + RGBA per pixel

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // filter: none

    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      const cx = x - width / 2;
      const cy = y - height / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const maxR = width * 0.42;
      const innerR = width * 0.15;

      // Radial gradient background
      const bgFade = Math.min(1, dist / (width * 0.5));
      const r0 = Math.round(bgR * (1 - bgFade * 0.3) + 20 * bgFade * 0.3);
      const g0 = Math.round(bgG * (1 - bgFade * 0.3) + 10 * bgFade * 0.3);
      const b0 = Math.round(bgB * (1 - bgFade * 0.3) + 50 * bgFade * 0.3);

      // Star burst pattern (8 rays)
      const angle = Math.atan2(cy, cx);
      const rayCount = 8;
      const rayAngle = (angle + Math.PI) % (2 * Math.PI / rayCount);
      const rayCenter = Math.PI / rayCount;
      const rayDist = Math.abs(rayAngle - rayCenter);
      const rayWidth = 0.12 - 0.04 * (dist / maxR);
      const isRay = rayDist < Math.max(0.02, rayWidth) && dist < maxR && dist > innerR * 0.5;

      // Center circle
      const isCenter = dist < innerR;
      const centerEdge = dist > innerR * 0.85 && dist < innerR;

      // Outer ring
      const isRing = dist > maxR * 0.92 && dist < maxR;

      let r, g, b, a = 255;

      if (isCenter) {
        const t = dist / innerR;
        r = Math.round(goldR * 0.8 * (1 - t * 0.3));
        g = Math.round(goldG * 0.8 * (1 - t * 0.3));
        b = Math.round(goldB * 0.5 * (1 - t * 0.3));
      } else if (centerEdge) {
        r = goldR; g = goldG; b = goldB;
      } else if (isRay) {
        const t = 1 - rayDist / Math.max(0.02, rayWidth);
        const fade = 1 - (dist - innerR) / (maxR - innerR);
        const intensity = t * fade * 0.9;
        r = Math.round(r0 + (goldR - r0) * intensity);
        g = Math.round(g0 + (goldG - g0) * intensity);
        b = Math.round(b0 + (goldB - b0) * intensity);
      } else if (isRing) {
        const ringT = (dist - maxR * 0.92) / (maxR * 0.08);
        const ringIntensity = Math.sin(ringT * Math.PI) * 0.7;
        r = Math.round(r0 + (goldR - r0) * ringIntensity);
        g = Math.round(g0 + (goldG - g0) * ringIntensity);
        b = Math.round(b0 + (goldB - b0) * ringIntensity);
      } else {
        r = r0; g = g0; b = b0;
      }

      rawData[px] = Math.max(0, Math.min(255, r));
      rawData[px + 1] = Math.max(0, Math.min(255, g));
      rawData[px + 2] = Math.max(0, Math.min(255, b));
      rawData[px + 3] = a;
    }
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // Build PNG file
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0, 0);
  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table.push(c);
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}

// Generate icons
console.log('Generating 512x512 icon...');
const icon512 = createPNG(512);
fs.writeFileSync('public/icon-512.png', icon512);
console.log('  -> icon-512.png (' + icon512.length + ' bytes)');

console.log('Generating 192x192 icon...');
const icon192 = createPNG(192);
fs.writeFileSync('public/icon-192.png', icon192);
console.log('  -> icon-192.png (' + icon192.length + ' bytes)');

// Verify
const v = fs.readFileSync('public/icon-512.png');
console.log('Verification:', v[0] === 0x89 && v[1] === 0x50 ? 'Valid PNG ✓' : 'FAILED');
console.log('Done!');
