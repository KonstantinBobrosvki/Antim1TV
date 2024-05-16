import { PipeTransform, Injectable } from '@nestjs/common';
import BaseError from '../errors/BaseError.error';

@Injectable()
export class RangePipe implements PipeTransform {
    min: number;
    max: number;
    constructor(min?: number, max?: number) {
        if (typeof min === 'undefined' || min === null) this.min = Number.NEGATIVE_INFINITY;
        else this.min = min;

        if (typeof max === 'undefined' || max === null) this.max = Number.POSITIVE_INFINITY;
        else this.max = max;
    }

    transform(value: number) {
        if (isNaN(+value)) throw BaseError.BadData('Параметъра трябва да е число');
        if (value > this.max || value < this.min)
            throw BaseError.BadData(`Параметъра трябва да е от ${this.min} и до ${this.max}`);

        return +value;
    }
}
