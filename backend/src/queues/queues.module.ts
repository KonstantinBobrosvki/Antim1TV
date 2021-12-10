import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueuesController } from './queues.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from './entities/queue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Queue])],
  controllers: [QueuesController],
  providers: [QueuesService],
  exports: [TypeOrmModule, QueuesService],
})
export class QueuesModule {}
