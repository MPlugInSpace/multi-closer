import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { deflateSync } from 'node:zlib';

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([typeBuf, data]));
  crc.writeUInt32BE(crcValue, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
};

const makePng = (width, height, pixels) => {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    const srcStart = y * width * 4;
    pixels.copy(raw, rowStart + 1, srcStart, srcStart + width * 4);
  }
  const compressed = deflateSync(raw);
  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const parseColor = (hex) => {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    255,
  ];
};

const drawRoundedRect = (pixels, size, rect, color) => {
  const [r, g, b, a] = color;
  const { x, y, w, h, radius } = rect;
  const rSq = radius * radius;

  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      const dx =
        px < x + radius ? x + radius - px : px >= x + w - radius ? px - (x + w - radius - 1) : 0;
      const dy =
        py < y + radius ? y + radius - py : py >= y + h - radius ? py - (y + h - radius - 1) : 0;
      if (dx > 0 || dy > 0) {
        if (dx * dx + dy * dy > rSq) {
          continue;
        }
      }
      const idx = (py * size + px) * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = a;
    }
  }
};

const renderIcon = async (size) => {
  const pixels = Buffer.alloc(size * size * 4, 0);
  const scale = size / 128;

  const shapes = [
    { x: 30, y: 18, w: 80, h: 80, radius: 16, color: '#2b3550' },
    { x: 22, y: 26, w: 80, h: 80, radius: 16, color: '#3b4768' },
    { x: 14, y: 34, w: 80, h: 80, radius: 16, color: '#d2d9ec' },
    { x: 76, y: 44, w: 36, h: 54, radius: 8, color: '#e1583a' },
    { x: 73.6, y: 36, w: 40.8, h: 8, radius: 4, color: '#a83422' },
  ].map((shape) => ({
    x: Math.round(shape.x * scale),
    y: Math.round(shape.y * scale),
    w: Math.round(shape.w * scale),
    h: Math.round(shape.h * scale),
    radius: Math.max(1, Math.round(shape.radius * scale)),
    color: shape.color,
  }));

  for (const shape of shapes) {
    drawRoundedRect(pixels, size, shape, parseColor(shape.color));
  }

  const png = makePng(size, size, pixels);
  const output = join('src', 'icons', `icon-${size}.png`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, png);
};

const main = async () => {
  for (const size of [16, 32, 48, 128]) {
    await renderIcon(size);
  }
};

main();
