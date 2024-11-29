import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as process from 'node:process';

@Injectable()
export class MailService {
  private transporter: Transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendPhishingEmail(to: string, emailContent: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'Sargis Avetisyan',
      to,
      subject: 'Test Test',
      html: emailContent,
    });
  }
}
