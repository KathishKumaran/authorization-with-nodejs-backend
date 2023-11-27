import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/config';
import { ExecutionContext } from '@nestjs/common';
import { UserAuthStrategy } from '../strategies/login-auth.strategy';

export class UserAuthGuard extends UserAuthStrategy {
  constructor(private reflector: Reflector, prismaService: PrismaService) {
    super(prismaService);
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) return true;
    const req = context.switchToHttp().getRequest();
    return await this.validate(req);
  }
}
