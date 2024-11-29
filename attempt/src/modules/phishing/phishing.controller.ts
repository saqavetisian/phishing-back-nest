import { Controller } from '@nestjs/common';
import { PhishingService } from './phishing.service';
import { SendDto } from './dto/send.dto';
import { ApiTags } from '@nestjs/swagger';
import { OutputDto } from './dto/output.dto';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Phishing')
@Controller('phishing')
export class PhishingController {
  constructor(private readonly phishingService: PhishingService) {}

  @MessagePattern('send-email')
  async sendEmail(sendDto: SendDto): Promise<OutputDto> {
    const response = await this.phishingService.sendEmail(sendDto.email);

    return new OutputDto(response);
  }

  @MessagePattern('victim-clicked')
  async victimClick(email: string): Promise<{ success: boolean }> {
    await this.phishingService.markAttemptAsClicked(email);

    return { success: true };
  }

  @MessagePattern('get-attempts')
  async getAttempts(): Promise<OutputDto[]> {
    const attempts = await this.phishingService.getAttempts();

    return attempts.map((attempt) => new OutputDto(attempt));
  }
}
