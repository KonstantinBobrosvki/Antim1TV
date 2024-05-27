import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Right } from './entities/right.entity';
import { Priority } from './entities/priority.entity';
import { PriorityService } from './services/priority.service';
import { RightsService } from './services/rights.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Right, Priority])],
    controllers: [UsersController],
    providers: [UsersService, PriorityService, RightsService],
    exports: [UsersService, PriorityService, RightsService, TypeOrmModule],
})
export class UsersModule {}
