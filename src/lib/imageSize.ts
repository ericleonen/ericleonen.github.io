/**
 * Reads the intrinsic pixel dimensions out of an image file's header, at build
 * time, without decoding it. The origami gallery needs every photo's aspect
 * ratio to pack its rows, and reading a few dozen header bytes beats pulling in
 * an image library for it.
 *
 * Handles the formats the gallery accepts: JPEG, PNG, GIF and WebP.
 */
import fs from 'node:fs';

export interface ImageSize {
  width: number;
  height: number;
}

/** JPEG: walk the marker segments to the frame header, which carries the size. */
function jpegSize(b: Buffer): ImageSize | null {
  let i = 2; // skip SOI
  while (i < b.length - 9) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    // SOF0-SOF15 hold the dimensions; C4/C8/CC share the range but aren't frames.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

/** WebP: three container flavours, each storing the size differently. */
function webpSize(b: Buffer): ImageSize | null {
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    // 24-bit little-endian, stored as (dimension - 1)
    return {
      width: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
      height: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1,
    };
  }
  return null;
}

/** Returns null for anything unreadable, so a bad file degrades instead of failing the build. */
export function imageSize(filePath: string): ImageSize | null {
  let b: Buffer;
  try {
    b = fs.readFileSync(filePath);
  } catch {
    return null;
  }
  if (b.length < 32) return null;

  if (b[0] === 0xff && b[1] === 0xd8) return jpegSize(b);

  if (b.toString('ascii', 1, 4) === 'PNG') {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  if (b.toString('ascii', 0, 3) === 'GIF') {
    return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  }

  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    return webpSize(b);
  }

  return null;
}
