import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import BaseError from '../../common/errors/BaseError.error';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        if (request.user) return true;
        throw BaseError.Unauthorized('Не сте влезли в акаунта си');
    }
}
