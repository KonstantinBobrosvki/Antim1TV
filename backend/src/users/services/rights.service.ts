import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../Models/user.entity';
import { Right } from '../Models/right.entity';
import { RightsEnum } from '../Models/Enums/rights.enum';
import { UserDto } from '../dto/user.dto';
import BaseError from '../../common/errors/BaseError.error';
import { Priority } from '../Models/priority.entity';

let isSettedAdmin = false;

@Injectable()
export class RightsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Right)
        private rightsRepository: Repository<Right>,
        @InjectRepository(Priority)
        private priorityRepository: Repository<Right>,
    ) {}

    async GiveRight(right: RightsEnum, targetId: number, performer: UserDto): Promise<RightsEnum> {
        if (!performer.rights.includes(right))
            throw BaseError.Forbidden('За да дадете право, трябва да го имате');

        const target = await this.usersRepository.findOne({
            where: {
                id: targetId,
            },
        });
        if (!target) throw BaseError.NotFound('Няма такъв потребител');

        const isExisting = !!(await this.rightsRepository.findOne({
            where: {
                receiver: target,
                value: right,
            },
        }));

        if (isExisting) throw BaseError.Duplicate('Потребителят вече има това право');

        const forDb = {
            receiver: target,
            giver: performer,
            value: right,
        } as unknown as Right;
        await this.rightsRepository.insert(forDb);
        return right;
    }

    async RemoveRight(
        right: RightsEnum,
        targetId: number,
        performer: UserDto,
    ): Promise<RightsEnum[]> {
        const target = await this.usersRepository.findOne({
            where: { id: targetId },
            relations: ['rights', 'priority'],
        });
        if (!target) throw BaseError.NotFound('Не е намерен потребител с това id');

        if (target.priority.value >= performer.priority)
            throw BaseError.Forbidden('Трябва да имате по-висок приоритет от целта');

        const rightToDelete = target.rights.find((r) => r.value == right);

        if (!rightToDelete) throw BaseError.NotFound('Потребителя няма това право');
        const giverOfRightId = rightToDelete.giverId;
        if (giverOfRightId != performer.id && giverOfRightId) {
            const priorityOfGiver = await this.priorityRepository.findOne({
                where: { receiver: { id: giverOfRightId } },
            });
            if (priorityOfGiver && priorityOfGiver.value >= performer.priority)
                throw BaseError.Forbidden('Трябва да имате по-висок приоритет');
        }
        await this.rightsRepository.delete(rightToDelete);

        return target.rights.filter((r) => r != rightToDelete).map((r) => r.value);
    }

    async AddAll(targetId: number) {
        if (isSettedAdmin) throw new Error('ВЕЧЕ ИМА АДМИНИСТРАТОР');

        for (const item in RightsEnum) {
            if (!isNaN(Number(item))) {
                const name = RightsEnum[item];
                const forDb = {
                    receiver: { id: targetId },
                    giver: targetId,
                    value: RightsEnum[name],
                } as unknown as Right;
                await this.rightsRepository.insert(forDb);
            }
        }

        isSettedAdmin = true;
    }
}
