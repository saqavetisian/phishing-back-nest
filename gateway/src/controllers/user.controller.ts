import {Controller, Get, Inject, Param} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { IUserPayload } from "../common/interfaces/simulator/user/user-payload.interface";

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
      @Inject('PHISHING_SIMULATOR') private readonly simulatorClient: ClientKafka
  ) {}

  @Get('/:id')
  async getProfile(@Param('id') id: string): Promise<IUserPayload> {
    return await firstValueFrom(
        this.simulatorClient.send('get-profile',  id),
    )
  }
}
