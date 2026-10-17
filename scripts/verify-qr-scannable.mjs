import jsQR from 'jsqr';
import QRCode from 'qrcode';

// Test if phone/scanner decodes the half-block ASCII QR code:
// In half-block: 1 character width = 1 module, 1 character height = 2 modules.
// Each module is a square pixel.
function decodeAsciiQR(asciiText) {
  const lines = asciiText.split('\n').filter(l => l.length > 0);
  const charWidth = lines[0].length;
  const numRows = lines.length * 2; // Each line is 2 module rows
  const numCols = charWidth;

  const width = numCols;
  const height = numRows;
  const imgData = new Uint8ClampedArray(width * height * 4);

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const topRow = lineIdx * 2;
    const bottomRow = topRow + 1;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      let topBlack = false;
      let bottomBlack = false;

      if (char === '█') {
        topBlack = true;
        bottomBlack = true;
      } else if (char === '▀') {
        topBlack = true;
        bottomBlack = false;
      } else if (char === '▄') {
        topBlack = false;
        bottomBlack = true;
      } else {
        topBlack = false;
        bottomBlack = false;
      }

      // Set pixel for top row (white = 255, 255, 255; black = 0, 0, 0)
      const topIdx = (topRow * width + c) * 4;
      const topColor = topBlack ? 0 : 255;
      imgData[topIdx] = topColor;
      imgData[topIdx + 1] = topColor;
      imgData[topIdx + 2] = topColor;
      imgData[topIdx + 3] = 255;

      // Set pixel for bottom row
      if (bottomRow < height) {
        const btmIdx = (bottomRow * width + c) * 4;
        const btmColor = bottomBlack ? 0 : 255;
        imgData[btmIdx] = btmColor;
        imgData[btmIdx + 1] = btmColor;
        imgData[btmIdx + 2] = btmColor;
        imgData[btmIdx + 3] = 255;
      }
    }
  }

  // Scale up 4x so jsQR has high resolution to decode
  const scale = 4;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const scaledData = new Uint8ClampedArray(scaledWidth * scaledHeight * 4);

  for (let y = 0; y < scaledHeight; y++) {
    for (let x = 0; x < scaledWidth; x++) {
      const origX = Math.floor(x / scale);
      const origY = Math.floor(y / scale);
      const origIdx = (origY * width + origX) * 4;
      const targetIdx = (y * scaledWidth + x) * 4;

      scaledData[targetIdx] = imgData[origIdx];
      scaledData[targetIdx + 1] = imgData[origIdx + 1];
      scaledData[targetIdx + 2] = imgData[origIdx + 2];
      scaledData[targetIdx + 3] = 255;
    }
  }

  return jsQR(scaledData, scaledWidth, scaledHeight);
}

// Generate QR
function generateBlackOnWhiteQR(url) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const margin = 2; // quiet zone
  const total = size + margin * 2;

  const isBlack = (r, c) => {
    if (r < margin || r >= size + margin || c < margin || c >= size + margin) {
      return false; // quiet zone is white
    }
    return data[(r - margin) * size + (c - margin)] === 1;
  };

  const lines = [];

  for (let r = 0; r < total; r += 2) {
    let line = '';
    for (let c = 0; c < total; c++) {
      const top = isBlack(r, c);
      const bottom = r + 1 < total ? isBlack(r + 1, c) : false;

      if (top && bottom) {
        line += '█';
      } else if (top && !bottom) {
        line += '▀';
      } else if (!top && bottom) {
        line += '▄';
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }

  return lines.join('\n');
}

const qr1 = generateBlackOnWhiteQR('https://youtu.be/dQw4w9WgXcQ');
const result1 = decodeAsciiQR(qr1);
console.log('Result for Rick Roll:', result1 ? result1.data : 'FAILED');

const qr2 = generateBlackOnWhiteQR('https://www.google.com');
const result2 = decodeAsciiQR(qr2);
console.log('Result for Google:', result2 ? result2.data : 'FAILED');
