import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'web-jwt') {
  constructor(config: ConfigService, private prisma:PrismaService) {
    
    const secret = config.get<string>('WEB_JWT_SECRET');
    if (!secret) {
      throw new Error('WEB_JWT_SECRET is not defined in .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: {sub:number,email:string,role:string}) {

    const user = await this.prisma.webuser.findUnique({
      where: { id: payload.sub }
    });
    if (!user) {
      throw new UnauthorizedException('User not found'); // or throw new UnauthorizedException();
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}
}
