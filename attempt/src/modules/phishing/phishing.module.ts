import { Module } from '@nestjs/common';
import { PhishingService } from './phishing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import {
  Phishing,
  PhishingSchema,
} from '../../schemas/phishing/phishing.schema';
import { MongoConfigService } from '../../common/config/mongo-config.service';
import { MailService } from '../mail/mail.service';
import { PhishingController } from './phishing.controller';

@Module({
  imports: [
    MailModule,
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      { name: Phishing.name, schema: PhishingSchema },
    ]),
  ],
  providers: [PhishingService, MailService],
  controllers: [PhishingController],
})
export class PhishingModule {}