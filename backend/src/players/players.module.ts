import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { VideosModule } from '../videos/videos.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
    imports: [VideosModule, QueuesModule],
    controllers: [PlayersController],
    providers: [PlayersService],
})
export class PlayersModule {}
