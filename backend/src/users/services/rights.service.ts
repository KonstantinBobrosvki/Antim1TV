import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';

import { User } from '../Models/user.entity';
import { Right } from '../Models/right.entity';


@Injectable()
export class RightsService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Right)
        private rightsRepository: Repository<Right>,
    ) { }

    
}
