import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { VideosModule } from '../videos/videos.module';
import { QueuesModule } from '../queues/queues.module';
import { PlayersGateway } from './players.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [VideosModule, QueuesModule, AuthModule],
    controllers: [PlayersController],
    providers: [PlayersService, PlayersGateway],
})
export class PlayersModule {}
