import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/environment';

export class QRCodeService {
  static generateQRCode(_data: string): string {
    return uuidv4();
  }

  static async generateQRImage(data: string): Promise<string> {
    try {
      const qrImage = await qrcode.toDataURL(data, {
        width: config.QR_CODE_SIZE,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrImage;
    } catch (error) {
      throw new Error('Error generating QR code image');
    }
  }

  static async generateTicketQR(
    ticketId: string,
    eventId: string,
    userId: string
  ): Promise<{ qrCode: string; qrImage: string }> {
    const qrData = JSON.stringify({
      ticketId,
      eventId,
      userId,
      timestamp: new Date().getTime(),
    });

    const qrCode = this.generateQRCode(qrData);
    const qrImage = await this.generateQRImage(qrData);

    return { qrCode, qrImage };
  }

  static verifyQRCode(qrData: string): boolean {
    try {
      JSON.parse(qrData);
      return true;
    } catch {
      return false;
    }
  }
}

export default QRCodeService;
