import axios, { AxiosResponse } from "axios";
import { BrokenImageURL } from "../shared/consts";
import { AllowedVideoDto } from "../types/allowedVideo.dto";
export type VideoDto = {
  id: number;
  link: string;
  isAllowed?: boolean;
  queueId: number;
};

export type YoutubeVideo = {
  title: string;
  thumbnail_url: string;
};

export class VideosApi {
  static GetMine(
    bearer: string,
    skip: number = 0
  ): Promise<AxiosResponse<VideoDto[]>> {
    return axios.get("/videos/mine?take=30&skip=" + skip * 30, {
      headers: {
        authorization: "Bearer " + bearer,
      },
    });
  }

  static GetForVote(bearer: string) {
    return axios
      .get("/videos/voting", {
        headers: {
          authorization: "Bearer " + bearer,
        },
      })
      .then((res) => res.data as VideoDto[]);
  }

  static async GetYouTubeMetadata(
    videourl: string
  ): Promise<AxiosResponse<YoutubeVideo>> {
    return await axios.get(
      `https://www.youtube.com/oembed?url=${videourl}&format=json`
    );
  }

  static Suggest(videoUrl: string, queueId: number, bearer: string) {
    return axios
      .post(
        "/videos/",
        {
          videoLink: videoUrl,
          queueId,
        },
        {
          headers: {
            authorization: "Bearer " + bearer,
          },
        }
      )
      .then((res) => res.data as VideoDto);
  }

  static Vote(
    videoId: string,
    bearer: string
  ): Promise<{
    videoId: number;
    voterId: number;
  }> {
    return axios
      .put(
        `/videos/allowed/${videoId}/vote`,
        {},
        {
          headers: {
            authorization: "Bearer " + bearer,
          },
        }
      )
      .then((res) => res.data);
  }

  static GetUnmoderated(bearer: string): Promise<VideoDto[]> {
    return axios
      .get(`/videos/unmoderated`, {
        headers: {
          authorization: "Bearer " + bearer,
        },
      })
      .then((res) => res.data as VideoDto[]);
  }

  static RejectVideo(
    videoId: number,
    bearer: string
  ): Promise<AllowedVideoDto> {
    return axios
      .put(
        `/videos/${videoId}/disallow`,
        {},
        {
          headers: {
            authorization: "Bearer " + bearer,
          },
        }
      )
      .then((res) => res.data as AllowedVideoDto);
  }

  static AllowVideo(videoId: number, bearer: string): Promise<AllowedVideoDto> {
    return axios
      .put(
        `/videos/${videoId}/allow`,
        {},
        {
          headers: {
            authorization: "Bearer " + bearer,
          },
        }
      )
      .then((res) => res.data as AllowedVideoDto);
  }
}
