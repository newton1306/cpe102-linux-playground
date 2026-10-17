import QRCode from 'qrcode';

// Generates an ASCII string of half-blocks for a WHITE background and BLACK text:
// '█' = top black, bottom black
// '▀' = top black, bottom white
// '▄' = top white, bottom black
// ' ' = top white, bottom white
export function generateBlackOnWhiteQR(url) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const margin = 2; // quiet zone
  const total = size + margin * 2;

  // Helper to check if module at (r, c) is black (1)
  const isBlack = (r, c) => {
    if (r < margin || r >= size + margin || c < margin || c >= size + margin) {
      return false; // quiet zone is white
    }
    return data[(r - margin) * size + (c - margin)] === 1;
  };

  const lines = [];

  // Group 2 vertical rows into 1 character line
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

const qrRick = generateBlackOnWhiteQR('https://youtu.be/dQw4w9WgXcQ');
const qrGoogle = generateBlackOnWhiteQR('https://www.google.com');

console.log('=== RICK ROLL (Black on White) ===');
console.log(qrRick);

console.log('=== GOOGLE (Black on White) ===');
console.log(qrGoogle);
