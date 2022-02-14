import { AllowedVideoDto } from '../../videos/dto/allowedVideo.dto';

enum YoutubePlayerState {
    'unstarted',
    'ended',
    'playing',
    'paused',
    'buffering',
    'video_qued',
}

export class StateDto {
    Volume: number;
    IsMuted: boolean;
    CurrentVideo: AllowedVideoDto;
    PlayerState: YoutubePlayerState;
    Seconds: number;
}
