
import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Gera um QR Code como base64 string
 */
export async function generateQRCode(
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const defaultOptions = {
      width: 120,
      margin: 2,
      color: {
        dark: '#00966E',
        light: '#FFFFFF'
      },
      ...options
    };

    return await QRCode.toDataURL(text, defaultOptions);
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha na geração do QR Code');
  }
}

/**
 * Gera um QR Code como PNG buffer
 */
export async function generateQRCodeBuffer(
  text: string, 
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    const defaultOptions = {
      width: 120,
      margin: 2,
      ...options
    };

    return await QRCode.toBuffer(text, defaultOptions);
  } catch (error) {
    console.error('Erro ao gerar QR Code buffer:', error);
    throw new Error('Falha na geração do QR Code');
  }
}
