import { QRCodeService } from '../../src/services/QRCodeService';

describe('QR Code Service', () => {
  it('should generate a QR code', () => {
    const qrCode = QRCodeService.generateQRCode('test-data');
    expect(qrCode).toBeDefined();
    expect(typeof qrCode).toBe('string');
  });

  it('should verify a valid QR code', () => {
    const testData = JSON.stringify({ test: 'data' });
    const isValid = QRCodeService.verifyQRCode(testData);
    expect(isValid).toBe(true);
  });

  it('should not verify invalid QR code', () => {
    const isValid = QRCodeService.verifyQRCode('not-json-data');
    expect(isValid).toBe(false);
  });

  it('should generate QR image', async () => {
    const data = 'test-qr-data';
    const qrImage = await QRCodeService.generateQRImage(data);
    expect(qrImage).toBeDefined();
    expect(qrImage).toContain('data:image');
  });

  it('should generate ticket QR with all fields', async () => {
    const result = await QRCodeService.generateTicketQR('ticket-1', 'event-1', 'user-1');
    expect(result).toHaveProperty('qrCode');
    expect(result).toHaveProperty('qrImage');
    expect(result.qrImage).toContain('data:image');
  });
});
