import QRCode from 'qrcode';

export async function generateTableQRCode(tableNumber, baseUrl = '') {
  try {
    const origin = baseUrl || (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const targetUrl = `${origin}/menu?table=${encodeURIComponent(tableNumber)}`;
    
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1b18',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    return {
      targetUrl,
      qrDataUrl,
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    return {
      targetUrl: '',
      qrDataUrl: '',
    };
  }
}
