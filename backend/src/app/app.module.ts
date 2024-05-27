import { configModule } from '../config/config.module';
import {
    MiddlewareConsumer,
    Module,
    OnModuleInit,
    RequestMethod,
    ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ReadJwtMiddleware } from '../auth/readJwt.middleware';
import BaseError from '../common/errors/BaseError.error';
import { PlayersModule } from '../players/players.module';
import { QueuesModule } from '../queues/queues.module';
import { QueuesService } from '../queues/queues.service';
import { PriorityService } from '../users/services/priority.service';
import { RightsService } from '../users/services/rights.service';
import { UsersService } from '../users/services/users.service';
import { UsersModule } from '../users/users.module';
import { VideosModule } from '../videos/videos.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        configModule,
        DatabaseModule,
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '../../../', 'frontend', 'build'),
        }),
        UsersModule,
        AuthModule,
        VideosModule,
        QueuesModule,
        PlayersModule,
    ],

    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: BaseError,
        },
        {
            provide: APP_FILTER,
            useClass: BaseError,
        },
    ],
})
export class AppModule implements OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly rightService: RightsService,
        private readonly priorityService: PriorityService,
        private readonly queuesService: QueuesService,
    ) {}

    async onModuleInit() {
        if (!(process.env.NODE_ENV == 'dev' || process.env.NODE_ENV == 'test')) return;
        console.log('Filling db');

        //CREate admin
        try {
            //password is password
            const admin = await this.usersService.create({
                username: 'Admin11',
                email: 'maile@gmail.com',
                password: '$2a$12$c5h/cCoqZFjXeDWer4Fh3e47kvnxqJyei3JRvGEdoMR4etgi7Ohzi',
            });
            await this.rightService.AddAll(admin.id);
            await this.priorityService.setPriority(10000, admin.id, admin.toDTO());
        } catch (error) {
            if (process.env.NODE_ENV == 'dev') console.log(error);
            //there will be errors, be calm everything is ok
        }

        //Create queues
        try {
            await this.queuesService.create({ name: 'Main' });
            await this.queuesService.create({ name: 'Second floor' });
        } catch (error) {
            if (process.env.NODE_ENV == 'dev') console.log(error);
        }
    }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ReadJwtMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
