import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserDto } from '../users/dto/output.user.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('register')
  async register(registerDto: RegisterDto): Promise<unknown> {
    return await this.authService.register(registerDto);
  }

  @MessagePattern('login')
  async logIn(
    logInDto: LoginDto,
  ): Promise<{ access_token: string; data: UserDto }> {
    return await this.authService.logIn(logInDto.email, logInDto.password);
  }
}
