import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidTokenException } from 'src/common/exceptions/invalid-token.exception';
import { Users } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { AccessAndRefreshToken } from './auth';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Users) 
        private readonly usersRepository: Repository<Users>
    ) {}

    async validateUser(userId: number, email: string) {
        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
                email
            }
        });
        if (!user) {
            return null;
        }
        return user;
    }

    async validateRefreshToken(userId: number, email: string, refreshToken: any): Promise<Users> | null {
        const user = await this.usersRepository.findOneOrFail({ where: { id: userId, email }})
            .catch(_ => { throw new InvalidTokenException() });
        const tokenMatched = await bcrypt.compare(refreshToken, user.refresh_token);
        if (!tokenMatched) {
            return null;
        }
        return user;
    }

    login({ id, email }): AccessAndRefreshToken {
        return {
            appAccessToken: this.jwtService.sign({ email }, {
                expiresIn: '12h',
                subject: String(id),
                issuer: 'alardin',
                secret: process.env.JWT_SECRET
            }),
            appRefreshToken: this.jwtService.sign({ email }, {
                expiresIn: '30d',
                subject: String(id),
                issuer: 'alardin',
                secret: process.env.JWT_SECRET
            })
        };
    }

    async appleAuth() {
        
    }
}
