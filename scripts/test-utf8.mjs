import QRCode from 'qrcode';

const urlRick = 'https://youtu.be/dQw4w9WgXcQ';
const urlGoogle = 'https://www.google.com';

function generateAsciiQR(url) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const margin = 2;
  const totalSize = size + margin * 2;

  // Let's test half-block format (very compact, 1 module = 1 subpixel)
  // Top module = row 2*r, Bottom module = row 2*r + 1
  // In black on white:
  // Both black: ' ' (if inverted) or '█'
  // Let's test standard inverted half-block with full white quiet zone:
  // Using:
  // █ (both black)
  // ▀ (top black, bottom white)
  // ▄ (top white, bottom black)
  // ' ' (both white)
  
  // Also let's test: What does QRCode.toString(url, { type: 'utf8', margin: 2 }) produce?
  // Let's test!
}

async function run() {
  const utf8Rick = await QRCode.toString(urlRick, {
    type: 'utf8',
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  const utf8Google = await QRCode.toString(urlGoogle, {
    type: 'utf8',
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  console.log('UTF8 RICK:');
  console.log(utf8Rick);
}

run();
