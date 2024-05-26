import { AllowedVideoDto } from "./AllowedVideoDto";

export type StateDto = {
  Volume: number;
  IsMuted: boolean;
  CurrentVideo: AllowedVideoDto;
  IsPlaying: boolean;
  Seconds: number;
};
