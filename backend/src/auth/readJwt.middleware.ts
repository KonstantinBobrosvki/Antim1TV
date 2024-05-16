import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ReadJwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader) return next();
        try {
            const [bearer, token] = authHeader.split(' ');

            if (bearer == 'Bearer' && token) {
                const user = this.jwtService.verify(token);
                (req as any).user = user;
            }
        } catch (error) {}
        next();
    }
}
