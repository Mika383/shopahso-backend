import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUserPayload } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
