import axios from "axios";
import { AllowedVideoDto } from "../types/allowedVideo.dto";
const MaxInteger = 2147483640;
class PlayerApi {
  constructor(private tvId: number, private bearer: string) {
    console.log("new");
  }

  GetNew(): Promise<AllowedVideoDto> {
    return axios
      .post(
        `/players/${this.tvId}/new`,
        {},
        {
          headers: {
            authorization: "Bearer " + this.bearer,
          },
        }
      )
      .then((res) => res.data);
  }

  GetExact(currentPosition: number): Promise<AllowedVideoDto> {
    return axios
      .get(`/players/${this.tvId}/${currentPosition}/`, {
        headers: {
          authorization: "Bearer " + this.bearer,
        },
      })
      .then((res) => res.data);
  }

  GetPrevious(currentPosition: number): Promise<AllowedVideoDto> {
    return axios
      .get(`/players/${this.tvId}/${currentPosition}/previous`, {
        headers: {
          authorization: "Bearer " + this.bearer,
        },
      })
      .then((res) => res.data);
  }

  GetNext(currentPosition: number): Promise<AllowedVideoDto> {
    return axios
      .get(`/players/${this.tvId}/${currentPosition}/next`, {
        headers: {
          authorization: "Bearer " + this.bearer,
        },
      })
      .then((res) => res.data);
  }

  GetFirst(): Promise<AllowedVideoDto> {
    return axios
      .get(`/players/${this.tvId}/0/next`, {
        headers: {
          authorization: "Bearer " + this.bearer,
        },
      })
      .then((res) => res.data);
  }

  GetLast(): Promise<AllowedVideoDto> {
    return axios
      .get(`/players/${this.tvId}/${MaxInteger}/previous`, {
        headers: {
          authorization: "Bearer " + this.bearer,
        },
      })
      .then((res) => res.data);
  }
}

export default PlayerApi;
