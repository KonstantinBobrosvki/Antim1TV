import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindConditions } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../Models/user.entity';
import { UserDto } from '../dto/user.dto';
import { PriorityService } from './priority.service';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../common/const/db';

type UserRelations = 'rights' | 'priority';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(PriorityService) private priorityService: PriorityService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const repository =
      manager?.getRepository<User>(User) ?? this.usersRepository;
    const user = repository.create(createUserDto);

    try {
      await repository.save(user);

      return user;
    } catch (error) {
      if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new HttpException(
          'Вече има потребител с това име или тази поща',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw error;
      }
    }
  }

  findAll() {
    return this.usersRepository.find({ select: ['id', 'username'] });
  }

  find(where: FindConditions<User>, relations: UserRelations[] = []) {
    return this.usersRepository.find({ where, relations });
  }

  async remove(targetId: number, performer: UserDto): Promise<UserDto> {
    if (targetId === performer.id) {
      //if we are deleting our acc
      await this.usersRepository.delete({ id: targetId });
      return performer;
    } else {
      const target = await this.usersRepository;
      throw new Error('NOT IMPLEMTED');
    }
  }
}
