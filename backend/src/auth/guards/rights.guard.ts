import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDto } from '../../users/dto/user.dto';
import { RightsEnum } from '../../users/Models/Enums/rights.enum';

@Injectable()
export class RightsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rights = this.reflector.get<RightsEnum[][]>(
      'rights',
      context.getHandler(),
    );
    if (!rights) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: UserDto = request.user;

    return rights
      .map((array) =>
        array.reduce(
          (last, needed) => user.rights.includes(needed) && last,
          true,
        ),
      )
      .reduce((prev, curr) => prev || curr, false);
  }
}
