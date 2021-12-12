import {
  MiddlewareConsumer,
  Module,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ReadJwtMiddleware } from '../auth/readJwt.middleware';
import { PlayersModule } from '../players/players.module';
import { QueuesModule } from '../queues/queues.module';
import { QueuesService } from '../queues/queues.service';
import { PriorityService } from '../users/services/priority.service';
import { RightsService } from '../users/services/rights.service';
import { UsersService } from '../users/services/users.service';
import { UsersModule } from '../users/users.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
      autoLoadEntities: true,
      logging: process.env.NODE_ENV == 'DEV',
    }),
    UsersModule,
    AuthModule,
    VideosModule,
    QueuesModule,
    PlayersModule,
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
    if (process.env.NODE_ENV != 'DEV') return;
    //CREate admin
    try {
      //password is password
      const admin = await this.usersService.create({
        username: 'Admin11',
        email: 'maile@gmail.com',
        password:
          '$2a$12$c5h/cCoqZFjXeDWer4Fh3e47kvnxqJyei3JRvGEdoMR4etgi7Ohzi',
      });
      await this.rightService.AddAll(admin.id);
      await this.priorityService.setPriority(10000, admin.id, admin.toDTO());
    } catch (error) {
      console.log(error);
      //there will be errors, be calm everything is ok
    }

    //Create queues
    try {
      await this.queuesService.create({ name: 'Main' });
      await this.queuesService.create({ name: 'Second floor' });
    } catch (error) {
      console.log(error);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ReadJwtMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
