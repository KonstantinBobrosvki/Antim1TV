import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, EntityManager, FindConditions } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../Models/user.entity';
import { UserDto } from '../dto/user.dto';
import { Priority } from '../Models/priority.entity';
import { PriorityService } from './priority.service';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(PriorityService) private priorityService: PriorityService
  ) { }

  async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
    const repository = manager?.getRepository<User>(User) ?? this.usersRepository
    const user = repository.create(createUserDto);

    await repository.save(user)

    return user;
  }



  findAll() {
    return this.usersRepository.find({ select: ['id', 'username'] })
  }

  find(where: FindConditions<User>, relations: string[] = []) {
    return this.usersRepository.find({ where, relations })
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async remove(targetId: number, performer: UserDto): Promise<UserDto> {

    if (targetId === performer.id) {
      //if we are deleting our acc
      await this.usersRepository.delete({ id: targetId });
      return performer
    }
    else {
      const target = await this.usersRepository
      throw new Error('NOT IMPLEMTED');
    }
  }
}
