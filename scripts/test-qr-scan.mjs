import QRCode from 'qrcode';

async function test() {
  const url = 'https://youtu.be/dQw4w9WgXcQ'; // short URL = fewer modules = bigger blocks = super easy to scan!
  
  // 1. Terminal small (half blocks)
  const small = await QRCode.toString(url, {
    type: 'terminal',
    small: true,
  });

  // 2. UTF8 full blocks: 2 characters per module (e.g. '██' or '  ')
  const qrData = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const size = qrData.modules.size;
  const data = qrData.modules.data;

  // Let's create inverted or standard high-contrast full block QR
  // Standard QR: Black modules on White background (or White border)
  // With 2 spaces for black, 2 full blocks for white:
  console.log('Size:', size);
  console.log('Small lines:', small.split('\n').length);
}

test();
