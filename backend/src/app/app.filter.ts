import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: Error, host: ArgumentsHost): void {
        const response: Response = host.switchToHttp().getResponse();
        if (exception instanceof HttpException) {
            response.status(exception.getStatus()).json({
                statusCode: exception.getStatus(),
                error: exception.message,
            });
        } else {
            console.error(exception);
            response.status(500).json({
                statusCode: 500,
                error: 'Няма информация за грешката',
            });
        }
    }
}
