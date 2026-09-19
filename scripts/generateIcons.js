import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(len + 12);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);

    // CRC
    let c = 0xffffffff;
    const typeAndData = buf.subarray(4, len + 8);
    for (let i = 0; i < typeAndData.length; i++) {
      c ^= typeAndData[i];
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
    }
    buf.writeInt32BE((c ^ 0xffffffff) | 0, len + 8);
    return buf;
  }

  // Raw image data: filter byte (0) + RGBA pixels
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // filter type None
    for (let x = 0; x < width; x++) {
      // Golden Amber icon color with border
      const isBorder = (x < 2 || x >= width - 2 || y < 2 || y >= height - 2);
      if (isBorder) {
        rawData.writeUInt8(217, offset++); // R
        rawData.writeUInt8(119, offset++); // G
        rawData.writeUInt8(6, offset++);   // B
        rawData.writeUInt8(a, offset++);
      } else {
        rawData.writeUInt8(r, offset++);
        rawData.writeUInt8(g, offset++);
        rawData.writeUInt8(b, offset++);
        rawData.writeUInt8(a, offset++);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(process.cwd(), 'extension', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Amber color: 245, 158, 11
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const png = createSolidPng(size, size, 245, 158, 11);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Created icon${size}.png`);
});

// Also create public/icons for the web app
const publicIconsDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(publicIconsDir, { recursive: true });
sizes.forEach(size => {
  const png = createSolidPng(size, size, 245, 158, 11);
  fs.writeFileSync(path.join(publicIconsDir, `icon${size}.png`), png);
});

console.log('All extension icons successfully generated!');
