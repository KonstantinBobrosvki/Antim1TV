import { forwardRef, Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueuesController } from './queues.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from './entities/queue.entity';
import { VideosModule } from '../videos/videos.module';

@Module({
    imports: [TypeOrmModule.forFeature([Queue]), forwardRef(() => VideosModule)],
    controllers: [QueuesController],
    providers: [QueuesService],
    exports: [TypeOrmModule, QueuesService],
})
export class QueuesModule {}
