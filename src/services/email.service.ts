import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { Logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Configure handlebars for email templates
const handlebarOptions: any = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.resolve('./src/templates/'),
    defaultLayout: false
  },
  viewPath: path.resolve('./src/templates/'),
  extName: '.hbs'
};

transporter.use('compile', hbs(handlebarOptions));

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  attachments?: any[];
}

export class EmailService {
  /**
   * Send an email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions: any = {
        from: `Eventful <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject
      };

      if (options.template) {
        mailOptions.template = options.template;
        mailOptions.context = options.context;
      } else if (options.html) {
        mailOptions.html = options.html;
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      await transporter.sendMail(mailOptions);
      Logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      Logger.error('Email sending failed:', error);
      // Don't throw error, log it and continue
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to Eventful!',
      html: `
        <h1>Welcome to Eventful, ${name}!</h1>
        <p>Thank you for joining Eventful. We're excited to have you on board.</p>
        <p>Start exploring amazing events and create unforgettable memories!</p>
      `
    });
  }

  /**
   * Send ticket purchase confirmation
   */
  static async sendTicketConfirmation(
    to: string,
    ticketData: {
      eventTitle: string;
      ticketNumber: string;
      eventDate: string;
      venue: string;
      qrCode: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Ticket Confirmation - ${ticketData.eventTitle}`,
      html: `
        <h1>Ticket Confirmed!</h1>
        <p>Your ticket for <strong>${ticketData.eventTitle}</strong> has been confirmed.</p>
        <p><strong>Ticket Number:</strong> ${ticketData.ticketNumber}</p>
        <p><strong>Event Date:</strong> ${ticketData.eventDate}</p>
        <p><strong>Venue:</strong> ${ticketData.venue}</p>
        <p>Your QR code is attached. Please present it at the event entrance.</p>
        <p>See you there!</p>
      `,
      attachments: [
        {
          filename: 'ticket-qr-code.png',
          path: ticketData.qrCode
        }
      ]
    });
  }

  /**
   * Send event reminder
   */
  static async sendEventReminder(
    to: string,
    reminderData: {
      eventTitle: string;
      eventDate: string;
      venue: string;
      ticketNumber: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Reminder: ${reminderData.eventTitle}`,
      html: `
        <h1>Event Reminder</h1>
        <p>This is a reminder for your upcoming event: <strong>${reminderData.eventTitle}</strong></p>
        <p><strong>Date:</strong> ${reminderData.eventDate}</p>
        <p><strong>Venue:</strong> ${reminderData.venue}</p>
        <p><strong>Your Ticket Number:</strong> ${reminderData.ticketNumber}</p>
        <p>Don't forget to bring your ticket QR code!</p>
      `
    });
  }

  /**
   * Send payment confirmation
   */
  static async sendPaymentConfirmation(
    to: string,
    paymentData: {
      reference: string;
      amount: number;
      eventTitle: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Payment Confirmation',
      html: `
        <h1>Payment Successful</h1>
        <p>Your payment has been confirmed.</p>
        <p><strong>Reference:</strong> ${paymentData.reference}</p>
        <p><strong>Amount:</strong> ₦${paymentData.amount.toLocaleString()}</p>
        <p><strong>Event:</strong> ${paymentData.eventTitle}</p>
        <p>Thank you for your purchase!</p>
      `
    });
  }
}
