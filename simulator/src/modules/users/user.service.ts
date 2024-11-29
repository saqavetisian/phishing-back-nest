import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user/user.schema';
import { UserPayload } from '../../schemas/user/user.payload';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userSchema: Model<User>,
  ) {}

  async getProfile(id: string): Promise<UserPayload> {
    const user = await this.userSchema.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user.toObject() as UserPayload;
  }
}
