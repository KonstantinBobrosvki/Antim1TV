import { Inject, Injectable } from '@nestjs/common';
import { getManager, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/services/users.service';
import { PriorityService } from '../users/services/priority.service';
import { LoginUserDto } from './dto/login-user.dto';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../common/const/db';
import BaseError from '../common/errors/BaseError.error';

@Injectable()
export class AuthService {
    constructor(
        @Inject(UsersService) private usersService: UsersService,
        @Inject(PriorityService) private priorityService: PriorityService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<UserDto> {
        return new Promise(async (resolve, reject) => {
            try {
                createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
                let dto: UserDto;
                await getManager().transaction('READ UNCOMMITTED', async (entityManager) => {
                    const user = await this.usersService.create(createUserDto, entityManager);

                    const priority = await this.priorityService.setPriority(
                        2,
                        user.id,
                        null,
                        entityManager,
                    );

                    user.priority = priority;

                    dto = user.toDTO();
                });

                resolve(dto);
            } catch (error) {
                if (error instanceof QueryFailedError) {
                    if (error.driverError.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                        reject(BaseError.Duplicate('Вече има потребител с това име или email'));
                    }
                }
                reject(error);
            }
        });
    }

    async login(loginUserDto: LoginUserDto): Promise<UserDto> {
        const pretendent = (
            await this.usersService.find(
                ['id', 'password', 'email', 'username'],
                [
                    { username: loginUserDto.username },
                    { email: loginUserDto.email?.toLowerCase() }
                ],
                ['rights', 'priority'],
            )
        )[0];

        if (!pretendent) throw BaseError.NotFound('Няма такъв потребител');

        if (!(await bcrypt.compare(loginUserDto.password, pretendent.password)))
            throw BaseError.BadData('Грешна парола');

        return pretendent.toDTO();
    }
}
