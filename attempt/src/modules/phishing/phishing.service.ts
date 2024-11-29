import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Phishing } from '../../schemas/phishing/phishing.schema';
import * as process from 'node:process';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PhishingService {
  constructor(
    @InjectModel(Phishing.name)
    private readonly phishingSchema: Model<Phishing>,
    private readonly mailService: MailService,
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
      const url = `${process.env.APP_URL}/phishing/clicked?email=${email}`;
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

  async markAttemptAsClicked(email: string): Promise<void> {
    if (!email) {
      throw new RpcException({
        message: 'Email is required',
        type: 'BAD_REQUEST',
      });
    }

    const attempt = await this.phishingSchema.findOne({
      email,
      status: 'pending',
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
