
import { generateQRCode, generateQRCodeBuffer } from '../qrCodeService';

describe('QR Code Service', () => {
  describe('generateQRCode', () => {
    it('should generate a valid QR code as base64 string', async () => {
      const testUrl = 'https://example.com/test-media.jpg';
      
      const qrCode = await generateQRCode(testUrl);
      
      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should use custom options when provided', async () => {
      const testUrl = 'https://example.com/test-media.mp4';
      const options = {
        width: 200,
        color: {
          dark: '#FF0000',
          light: '#FFFFFF'
        }
      };
      
      const qrCode = await generateQRCode(testUrl, options);
      
      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle long URLs correctly', async () => {
      const longUrl = 'https://very-long-domain-name-for-testing.example.com/storage/reports/2024/01/very-long-filename-with-lots-of-characters-and-numbers-12345.pdf?token=very-long-token-string';
      
      const qrCode = await generateQRCode(longUrl);
      
      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
    });
  });

  describe('generateQRCodeBuffer', () => {
    it('should generate a valid QR code as buffer', async () => {
      const testUrl = 'https://example.com/test-audio.mp3';
      
      const buffer = await generateQRCodeBuffer(testUrl);
      
      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Test with empty string which should trigger error handling
      await expect(generateQRCode('')).rejects.toThrow('Falha na geração do QR Code');
    });
  });
});
