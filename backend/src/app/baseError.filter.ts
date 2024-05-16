import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import BaseError from '../common/errors/BaseError.error';

@Catch(BaseError)
export class BaseErrorFilter implements ExceptionFilter {
    catch(error: BaseError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = error.getStatus();

        response.status(status).json({
            statusCode: status,
            error: error.message,
        });
    }
}
