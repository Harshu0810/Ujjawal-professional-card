import QRCode from 'qrcode';

export interface QRCodeOptions {
  url: string;
  errorCorrectionLevel?: 'M' | 'Q' | 'H';
  margin?: number; // Quiet zone in modules (default: 4)
  width?: number;
}

export async function generateQRCodeSVG(options: QRCodeOptions): Promise<string> {
  const {
    url,
    errorCorrectionLevel = 'Q', // Level Q per Section 2A
    margin = 4, // 4 modules minimum quiet zone
    width = 300
  } = options;

  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel,
    margin,
    width,
    color: {
      dark: '#020617', // High contrast dark modules
      light: '#ffffff' // Pure white matte background
    }
  });
}

export async function generateQRCodeDataURL(options: QRCodeOptions): Promise<string> {
  const {
    url,
    errorCorrectionLevel = 'Q',
    margin = 4,
    width = 400
  } = options;

  return QRCode.toDataURL(url, {
    errorCorrectionLevel,
    margin,
    width,
    color: {
      dark: '#020617',
      light: '#ffffff'
    }
  });
}
