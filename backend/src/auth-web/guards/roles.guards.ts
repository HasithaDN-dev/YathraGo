import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    //if the role is not required for unristricted access
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.role) {
      throw new UnauthorizedException('User role not found');
    }

    try {
      const hasRole = requiredRoles.includes(user.role);
      
      if (!hasRole) {
        throw new UnauthorizedException(`User role '${user.role}' not authorized. Required: ${requiredRoles.join(', ')}`);
      }
      
      return hasRole;
    } catch (error) {
      throw new UnauthorizedException('User not authorized');
    }
  }
}
