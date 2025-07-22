import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';

@Injectable()
export class AuthWebService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(credentials: SignupDto) {
    const hashPassword = await argon.hash(credentials.password);

    //create a user in the DB
    try {
      const user = await this.prisma.webuser.create({
        data: {
          email: credentials.email,
          password: hashPassword,
          username: credentials.username,
        },
      });

      // If the user is an owner, create a VehicleOwner record with the same id
      if (user.role === 'owner') {
        await this.prisma.vehicleOwner.create({
          data: {
            id:user.id,
            email:user.email
          },
        });
      }

      return this.signToken(user.id, user.email, user.role);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }

    // return('siging up')
  }

  async login(credentials: LoginDto) {
    //find the user by email
    const user = await this.prisma.webuser.findUnique({
      where: {
        email: credentials.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    //campare password
    const passwordMatches = await argon.verify(
      user.password,
      credentials.password,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.signToken(user.id, user.email, user.role);
  }

  async signToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const jwtSecret = this.config.get('WEB_JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: jwtSecret,
    });

    return {
      access_token: token,
    };
  }
}
