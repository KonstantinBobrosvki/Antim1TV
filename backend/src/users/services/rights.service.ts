import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';

import { User } from '../Models/user.entity';
import { Right } from '../Models/right.entity';
import { RightsEnum } from '../Models/Enums/rights.enum';
import { UserDto } from '../dto/user.dto';


@Injectable()
export class RightsService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Right)
        private rightsRepository: Repository<Right>,
    ) { }

    async GiveRight(right: RightsEnum, targetId: number, performer: UserDto): Promise<Right> {
        if (!performer.rights.includes(right))
            throw new HttpException('За да дадете право, трябва да го имате', HttpStatus.FORBIDDEN)

        const target = await this.usersRepository.findOne(targetId);
        if (!target)
            throw new HttpException('Няма такъв потребител', HttpStatus.NOT_FOUND)

        const isExisting = !!(await this.rightsRepository.findOne({
            where: {
                receiver: { id: targetId },
                value: right
            }
        }))

        if (isExisting)
            throw new HttpException('Потребителят вече има това право', HttpStatus.BAD_REQUEST)

        const forDb = { receiver: { id: targetId }, giver: performer, value: right } as unknown as Right
        await this.rightsRepository.save(forDb)
        return forDb;
    }
}
