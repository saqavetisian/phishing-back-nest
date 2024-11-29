import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  Inject,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { OutputDto } from '../common/interfaces/attempt/dto/output.dto';
import { SendDto } from '../common/interfaces/attempt/dto/send-dto';
import { AuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Phishing')
@Controller('phishing')
export class PhishingController {
  constructor(
      @Inject('PHISHING_ATTEMPT') private readonly attemptClient: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'Send a phishing email to a specified address' })
  @Post('send')
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async sendEmail(
      @Body() sendDto: SendDto,
  ): Promise<OutputDto> {
    try {
      const response = await firstValueFrom(
          this.attemptClient.send('send-email', sendDto),
      );

      return new OutputDto(response);
    } catch (error) {

      if (error?.type === 'BAD_REQUEST') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      if (error?.type === 'INTERNAL_SERVER_ERROR') {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      throw new HttpException(
          'An unexpected error occurred while sending phishing email',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get attempts' })
  @Get('attempts')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getAttempts(): Promise<OutputDto[]> {
    try {
      const response = await firstValueFrom(
          this.attemptClient.send('get-attempts', {}),
      );

      return response.map((item) => new OutputDto(item));
    } catch (error) {
      throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('clicked')
  @ApiOperation({ summary: 'Mark attempt as clicked' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'Email address to mark as clicked',
  })
  async victimClick(
      @Query('email') email: string,
  ): Promise<{ success: boolean }> {
    try {
      const response = await firstValueFrom(
          this.attemptClient.send('victim-clicked', email),
      );

      return { success: response };
    } catch (err) {
      throw new HttpException(
          err.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
