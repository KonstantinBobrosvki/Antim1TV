import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { User } from '../Models/user.entity';
import { Priority } from '../Models/priority.entity';
import { UserDto } from '../dto/user.dto';



@Injectable()
export class PriorityService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Priority)
        private priorityRepository: Repository<Priority>,
    ) { }

    async setPriority(value: number, targetId: number, giver?: UserDto, manager?: EntityManager): Promise<Priority> {

        const repository = manager?.getRepository<Priority>(Priority) ?? this.priorityRepository

        const prior = await repository.findOne({
            relations: ['receiver'],
            where: { receiver: { id: targetId } as User },

        })


        if (!prior) {
            //This can be if only user is registred or user doesnt exists
            const forInsert = { value, receiver: { id: targetId } as User } as unknown as Priority;
            await repository.insert(forInsert)
            return forInsert
        }
        else {
            throw new Error('ALREADY ID WTF BRO')
            //TODO: IMPLEMENT CHANGING REAL USER
        }
    }


}
