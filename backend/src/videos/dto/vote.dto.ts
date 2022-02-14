import { ApiProperty } from '@nestjs/swagger';

export class VoteDTO {
    @ApiProperty({ description: 'Id of video' })
    videoId: number;
    @ApiProperty({ description: 'Id of voter' })
    voterId: number;

    constructor({ videoId, voterId }) {
        this.videoId = videoId;
        this.voterId = voterId;
    }
}
