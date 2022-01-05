import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../Models/user.entity';
import { Right } from '../Models/right.entity';
import { RightsEnum } from '../Models/Enums/rights.enum';
import { UserDto } from '../dto/user.dto';
import BaseError from '../../common/errors/BaseError.error';

let isSettedAdmin = false;

@Injectable()
export class RightsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Right)
        private rightsRepository: Repository<Right>,
    ) {}

    async GiveRight(right: RightsEnum, targetId: number, performer: UserDto): Promise<Right> {
        if (!performer.rights.includes(right))
            throw BaseError.Forbidden('За да дадете право, трябва да го имате');

        const target = await this.usersRepository.findOne(targetId);
        if (!target) throw BaseError.NotFound('Няма такъв потребител');

        const isExisting = !!(await this.rightsRepository.findOne({
            where: {
                receiver: { id: targetId },
                value: right,
            },
        }));

        if (isExisting) throw BaseError.Duplicate('Потребителят вече има това право');

        const forDb = {
            receiver: { id: targetId },
            giver: performer,
            value: right,
        } as unknown as Right;
        await this.rightsRepository.save(forDb);
        return forDb;
    }

    async AddAll(targetId: number) {
        if (isSettedAdmin) throw new Error('ВЕЧЕ ИМА АДМИНИСТРАТОР');

        for (const item in RightsEnum) {
            console.log(item);

            if (!isNaN(Number(item))) {
                const name = RightsEnum[item];
                const forDb = {
                    receiver: { id: targetId },
                    giver: targetId,
                    value: RightsEnum[name],
                } as unknown as Right;
                await this.rightsRepository.save(forDb);
            }
        }

        isSettedAdmin = true;
    }
}
