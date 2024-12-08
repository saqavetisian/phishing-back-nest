import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Phishing } from '../../schemas/phishing/phishing.schema';
import * as process from 'node:process';
import { MailService } from '../mail/mail.service';
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class PhishingService {
  constructor(
    @InjectModel(Phishing.name)
    private readonly phishingSchema: Model<Phishing>,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async sendEmail(email: string): Promise<Phishing> {
    const alreadyAttempted = await this.phishingSchema
      .findOne({ email })
      .exec();

    if (alreadyAttempted) {
      throw new RpcException({
        message: 'Email already sent.',
        type: 'BAD_REQUEST',
      });
    }

    try {
      const hashedToken = this.jwtService.sign({
        email
      });

      const url = `${process.env.APP_URL}/phishing/clicked?token=${hashedToken}`;
      const content = `<p>This is a simulated phishing attempt. Click <a href="${url}">here</a> to check the result.</p>`;

      await this.mailService.sendPhishingEmail(email, content);

      const newPhishingAttempt = new this.phishingSchema({
        email,
        status: 'pending',
        content,
      });

      await newPhishingAttempt.save();

      return newPhishingAttempt;
    } catch (err) {
      throw new RpcException({
        message: err.message,
        type: 'INTERNAL_SERVER_ERROR',
      });
    }
  }

  async markAttemptAsClicked(token: string): Promise<void> {
    if (!token) {
      throw new RpcException({
        message: 'Token is required',
        type: 'BAD_REQUEST',
      });
    }

    let targetEmail = '';

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: (process.env.JWT_SECRET as string) || 'Xb7EpgsF4kI0DXL',
      })) as { email: string };

      console.log(payload)
      targetEmail = payload.email;
    } catch {
      throw new RpcException({
        message: 'Link already expired',
        type: 'BAD_REQUEST',
      });
    }

    const attempt = await this.phishingSchema.findOne({
      email: targetEmail
    });

    if (!attempt) {
      throw new RpcException({
        message: 'Pending email address not found',
        type: 'BAD_REQUEST',
      });
    }

    attempt.status = 'clicked';
    await attempt.save();
  }

  async getAttempts(): Promise<Phishing[]> {
    try {
      return await this.phishingSchema.find().exec();
    } catch {
      throw new RpcException({
        message: 'Failed attempts.',
        type: 'INTERNAL_SERVER_ERROR',
      });
    }
  }
}
