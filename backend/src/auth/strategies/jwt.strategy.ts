import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth.service';
import { UserType } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'your-default-secret-key',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    let user: any = null;

    // Find user based on userType and the ID from the JWT payload (sub)
    if (payload.userType === UserType.CUSTOMER) {
      user = await this.prisma.user.findUnique({
        where: { id: parseInt(payload.sub, 10) },
      });
    } else if (payload.userType === UserType.DRIVER) {
      user = await this.prisma.driver.findUnique({
        where: { id: parseInt(payload.sub, 10) },
      });
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return a consistent user object to be attached to the request
    return {
      userId: user.id,
      phone: user.phone,
      userType: payload.userType,
      isVerified: payload.isVerified,
    };
  }
}
