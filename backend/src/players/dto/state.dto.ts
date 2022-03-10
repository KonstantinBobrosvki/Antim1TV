import { AllowedVideoDto } from '../../videos/dto/allowedVideo.dto';

export class StateDto {
    Volume: number;
    IsMuted: boolean;
    CurrentVideo: AllowedVideoDto;
    IsPlaying: boolean;
    Seconds: number;
}
