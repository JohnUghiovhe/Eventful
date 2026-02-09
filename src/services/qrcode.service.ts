import QRCode from 'qrcode';
import { Logger } from '../utils/logger';

export class QRCodeService {
  /**
   * Generate QR code data URL from ticket information
   */
  static async generateQRCode(ticketData: {
    ticketNumber: string;
    eventId: string;
    userId: string;
    eventTitle: string;
  }): Promise<string> {
    try {
      const qrData = JSON.stringify(ticketData);
      // Generate QR code as data URL
      const qrCodeDataURL = (await QRCode.toDataURL(qrData)) as string;

      return qrCodeDataURL;
    } catch (error) {
      Logger.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify QR code data
   */
  static verifyQRCodeData(qrCodeData: string, ticketNumber: string): boolean {
    try {
      const parsedData = JSON.parse(qrCodeData);
      return parsedData.ticketNumber === ticketNumber;
    } catch (error) {
      Logger.error('QR Code verification failed:', error);
      return false;
    }
  }

  /**
   * Extract ticket data from QR code
   */
  static extractTicketData(qrCodeData: string): {
    ticketNumber: string;
    eventId: string;
    userId: string;
    eventTitle: string;
  } | null {
    try {
      return JSON.parse(qrCodeData);
    } catch (error) {
      Logger.error('Failed to extract ticket data:', error);
      return null;
    }
  }
}
