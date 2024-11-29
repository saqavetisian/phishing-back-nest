import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Error: Format not correct ' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password should be filled' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
