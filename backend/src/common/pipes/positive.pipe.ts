import { PipeTransform, Injectable } from '@nestjs/common';
import BaseError from '../errors/BaseError.error';

@Injectable()
export class PositivePipe implements PipeTransform {
    transform(value: any) {
        if (isNaN(+value)) throw BaseError.BadData('Параметъра трябва да не е отрицателен');
        if (+value < 0) throw BaseError.BadData('Параметъра трябва да не е отрицателен');
        return +value;
    }
}
