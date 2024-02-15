import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  private readonly secretKey: string = 'your_secret_key'; // Replace 'your_secret_key' with your actual secret key

  async generateToken(user: User): Promise<string> {
    const payload = {
      email: user.email,
      displayName: user.name,
      profileImageUrl: user.image,
    };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: '1h' });

    return token;
  }
}
