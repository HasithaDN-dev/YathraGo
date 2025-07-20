import { AuthGuard } from '@nestjs/passport';

export class JwtGuard extends AuthGuard('web-jwt') {
  constructor() {
    super();
  }
}
