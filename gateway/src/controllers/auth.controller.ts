import { Body, Controller, HttpCode, HttpException, HttpStatus, Inject, Post,} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { catchError, firstValueFrom, timeout } from "rxjs";
import { RegisterDto } from "../common/interfaces/simulator/auth/dto/register.dto";
import { LoginDto } from "../common/interfaces/simulator/auth/dto/login.dto";
import { ClientProxy } from "@nestjs/microservices";
import { IUserPayload } from "../common/interfaces/simulator/user/user-payload.interface";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
      @Inject('PHISHING_SIMULATOR') private readonly simulatorClient: ClientProxy,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 409, description: 'User or email already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string; status: number }> {
    try {
      return await firstValueFrom(
          this.simulatorClient
              .send('register', registerDto)
              .pipe(
                  timeout(5000),
                  catchError((error) => {
                    if (error?.type) {
                      if (error.type === 'CONFLICT') {
                        throw new HttpException(error.message, HttpStatus.CONFLICT);
                      }
                      if (error.type === 'INTERNAL_ERROR') {
                        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
                      }
                    }

                    if (error.name === 'TimeoutError') {
                      throw new HttpException(
                          'Microservice timeout',
                          HttpStatus.REQUEST_TIMEOUT,
                      );
                    }

                    throw new HttpException(
                        'Internal server error',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  }),
              ),
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'Authenticate user and return a token' })
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 408, description: 'Microservice timeout' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(200)
  async logIn(
    @Body() logInDto: LoginDto,
  ): Promise<{ access_token: string; data: IUserPayload }> {
    try {
      return await firstValueFrom(
          this.simulatorClient
              .send('login', logInDto)
              .pipe(
                  timeout(5000),
                  catchError((error) => {
                    if (error?.type) {
                      if (error.type === 'UNAUTHORIZED') {
                        throw new HttpException(
                            error.message || 'Invalid credentials',
                            HttpStatus.UNAUTHORIZED,
                        );
                      }

                      if (error.type === 'BAD_REQUEST') {
                        throw new HttpException(
                            error.message || 'Bad request',
                            HttpStatus.BAD_REQUEST,
                        );
                      }
                    }

                    if (error.name === 'TimeoutError') {
                      throw new HttpException(
                          'Microservice timeout',
                          HttpStatus.REQUEST_TIMEOUT,
                      );
                    }

                    throw new HttpException(
                        'Internal server error',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  }),
              ),
      );
    } catch (error) {
      throw new error;
    }
  }
}
