import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
