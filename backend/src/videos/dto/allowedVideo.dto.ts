import { VideoDto } from './video.dto';

export class AllowedVideoDto {
    id: number;
    votes: number;
    queuePositon: number;
    video: VideoDto;
}
