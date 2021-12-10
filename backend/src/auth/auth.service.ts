import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/services/users.service';
import { PriorityService } from '../users/services/priority.service';
import { User } from '../users/Models/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(PriorityService) private priorityService: PriorityService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserDto> {
    return new Promise(async (resolve, reject) => {
      try {
        createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

        await getManager().transaction(
          'READ UNCOMMITTED',
          async (entityManager) => {
            const user = await this.usersService.create(
              createUserDto,
              entityManager,
            );

            const priority = await this.priorityService.setPriority(
              2,
              user.id,
              null,
              entityManager,
            );

            user.priority = priority;

            resolve(user.toDTO());
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async login(loginUserDto: LoginUserDto): Promise<UserDto> {
    const pretendent = (
      await this.usersService.find(
        {
          ...(loginUserDto.username && { username: loginUserDto.username }),
          ...(loginUserDto.email && { email: loginUserDto.email }),
        },
        ['rights', 'priority'],
      )
    )[0];

    if (!pretendent)
      throw new HttpException('Няма такъв потребител', HttpStatus.NOT_FOUND);

    if (!(await bcrypt.compare(loginUserDto.password, pretendent.password)))
      throw new HttpException('Грешна парола', HttpStatus.BAD_REQUEST);

    return pretendent.toDTO();
  }
}
