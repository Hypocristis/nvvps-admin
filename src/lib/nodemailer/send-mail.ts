'use server';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_PORT = Number(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
} as nodemailer.TransportOptions);

export interface EmailData {
  sendTo: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail(emailData: EmailData) {
  if (!SMTP_USER) {
    throw new Error('SMTP_USER not configured');
  }

  try {
    const isVerified = await transporter.verify();
  } catch (error) {
    console.error('SMTP Configuration Error:', error);
    throw error;
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: emailData.sendTo,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html || '',
    });
    
    console.log('Message Sent', info.messageId);
    console.log('Mail sent to', emailData.sendTo);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
