import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindConditions, FindOneOptions, ObjectLiteral } from 'typeorm';

import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { User } from '../Models/user.entity';
import { UserDto } from '../dto/user.dto';
import { PriorityService } from './priority.service';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../common/const/db';
import BaseError from '../../common/errors/BaseError.error';
import { RightsEnum } from '../Models/Enums/rights.enum';

type UserRelations = 'rights' | 'priority';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(PriorityService) private priorityService: PriorityService,
    ) {}

    async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
        const repository = manager?.getRepository<User>(User) ?? this.usersRepository;
        const user = repository.create(createUserDto);

        try {
            await repository.save(user);

            return user;
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw BaseError.Duplicate('Вече има потребител с това име или тази поща');
            } else {
                throw error;
            }
        }
    }

    async findAll(skip = 0, take = 30): Promise<UserDto[]> {
        const users = await this.usersRepository.find({
            select: ['id', 'username'],
            skip,
            take,
            relations: ['priority', 'rights'],
            order: { id: 'ASC' },
        });
        return users.map((user) => user.toDTO());
    }

    async find(
        select: (keyof User)[] = ['id', 'username'],
        where: string | ObjectLiteral | FindConditions<User> | FindConditions<User>[],
        relations: UserRelations[] = [],
    ) {
        const res = await this.usersRepository.find({ select, where, relations });
        if (res) return res;
        throw BaseError.NotFound('Няма такъв потребител');
    }

    async remove(targetId: number, performer: UserDto): Promise<UserDto> {
        if (targetId === performer.id) {
            //if we are deleting our acc
            await this.usersRepository.delete({ id: targetId });
            return performer;
        } else {
            if (!performer.rights.includes(RightsEnum.BanUser))
                throw BaseError.Forbidden('Нямате право да триете потребител');
            const target = await this.usersRepository.findOne(targetId, {
                relations: ['priority'],
                select: ['id', 'username'],
            });
            if (target?.priority.value >= performer.priority)
                throw BaseError.Forbidden('Потребителя има по-висок приоритет от вас.');

            await this.usersRepository.delete({ id: targetId });

            return target.toDTO();
        }
    }
}
