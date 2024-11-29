import { User } from '../../../schemas/user/user.schema';

export class UserDto {
  id: string;
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
  }
}
