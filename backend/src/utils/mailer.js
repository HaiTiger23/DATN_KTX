import nodemailer from 'nodemailer';
import Setting from '../models/Setting.js';

/**
 * Sends an email using SMTP configuration from Setting model.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body of the email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const settings = await Setting.findOne();
    
    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      throw new Error('SMTP chưa được cấu hình. Vui lòng liên hệ Admin.');
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Hệ thống KTX" <${settings.smtpUser}>`, // sender address
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw error;
  }
};
