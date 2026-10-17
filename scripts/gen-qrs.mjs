import QRCode from 'qrcode';

async function generate() {
  const qrRick = await QRCode.toString('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    type: 'terminal',
    small: true,
  });

  const qrGoogle = await QRCode.toString('https://www.google.com', {
    type: 'terminal',
    small: true,
  });

  console.log('=== RICK ROLL QR ===');
  console.log(qrRick);
  console.log('=== GOOGLE QR ===');
  console.log(qrGoogle);
}

generate();
