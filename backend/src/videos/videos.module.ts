import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Queue } from '../queues/entities/queue.entity';
import { AllowedVideo } from './entities/allowedVideo.entity';
import { Vote } from './entities/vote.entity';
import { QueuesModule } from '../queues/queues.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, Queue, AllowedVideo, Vote]),
    QueuesModule,
    UsersModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
