import { HttpException } from '@nestjs/common';

export default class BaseError extends HttpException {
    constructor(message: string[] | string, status: number) {
        if (Array.isArray(message)) {
            message = message.join('\r\n');
        }
        super(message, status);
    }

    Equal(obj: any): boolean {
        if (obj instanceof BaseError) {
            return obj.getStatus() === this.getStatus();
        } else if (typeof obj === 'number') {
            return obj === this.getStatus();
        }
        return false;
    }

    static NotFound(message?: string[] | string): BaseError {
        return new BaseError(message ?? 'Няма такъв ресурс', 404);
    }

    static BadData(message?: string[] | string): BaseError {
        return new BaseError(message ?? 'Информацията е грешна', 400);
    }

    static Forbidden(message?: string[] | string): BaseError {
        return new BaseError(message ?? 'Нямате право за тази операция', 403);
    }

    static Unauthorized(message?: string[] | string): BaseError {
        return new BaseError(message ?? 'Моля влезте в профила си', 401);
    }

    static Any(message: string[] | string) {
        return new BaseError(message ?? 'Няма информация за грешката', 500);
    }

    static Duplicate(message?: string[] | string) {
        return new BaseError(message ?? 'Вече има ресурс с тези данни', 409);
    }
}
