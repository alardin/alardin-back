import { JwtSignOptions } from '@nestjs/jwt';

export const jwtSignOption: JwtSignOptions = {
  secret: process.env.JWT_SECRET,
  expiresIn: '1800s',
};
