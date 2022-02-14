import { ApiProperty } from '@nestjs/swagger';
import { VideoDto } from './video.dto';

export class AllowedVideoDto {
    @ApiProperty({
        description: 'id of video',
    })
    id: number;
    @ApiProperty({
        description: 'count of votes',
    })
    votes: number;
    @ApiProperty({
        description: 'What is count of played videos before',
    })
    queuePositon: number;

    @ApiProperty({
        type: VideoDto,
        description: 'original video',
    })
    video: VideoDto;
}
