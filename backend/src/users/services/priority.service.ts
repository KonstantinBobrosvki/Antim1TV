import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { User } from '../Models/user.entity';
import { Priority } from '../Models/priority.entity';
import { UserDto } from '../dto/user.dto';
import BaseError from '../../common/errors/BaseError.error';

@Injectable()
export class PriorityService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Priority)
        private priorityRepository: Repository<Priority>,
    ) {}

    async setPriority(
        value: number,
        targetId: number,
        giver?: UserDto,
        manager?: EntityManager,
    ): Promise<Priority> {
        const repository = manager?.getRepository<Priority>(Priority) ?? this.priorityRepository;

        const prior = await repository.findOne({
            relations: [
                'receiver',
                'receiver.priority',
                'receiver.priority.giver',
                'receiver.priority.giver.priority',
            ],
            where: { receiver: { id: targetId } as User },
        });

        if (!prior) {
            //This can be if only user is registred or user doesnt exists
            const forInsert = {
                value,
                receiver: { id: targetId } as User,
            } as unknown as Priority;
            await repository.insert(forInsert);
            return forInsert;
        } else {
            //so we are changing existing priority
            if (giver.priority <= value)
                throw BaseError.Forbidden('Трябва да имате по-висок приоритет');
            if (giver.priority <= prior.receiver.priority.value)
                throw BaseError.Forbidden('Целта има по-висок от вас приоритет');

            if (prior.receiver.priority.giver)
                if (giver.id != prior.receiver.priority.giver.id)
                    if (giver.priority <= prior.receiver.priority.giver.priority?.value)
                        throw BaseError.Forbidden(
                            'Човека който последно е променял приоритета има повече приоритет от вас',
                        );

            prior.value = value;

            prior.giver = giver as any as User;

            await repository.update(prior.id, prior);
            prior.receiver = null;
            prior.giver = null;
            return prior;
        }
    }
}
