import axios from "axios";

export type VideoDto = {
    id: number;
    link: string;
    isAllowed?: boolean;
    queueId: number;
}

export type YoutubeVideo = {
    title: string
    thumbnail_url: string
}

export class VideosApi {
    static GetMine(bearer: string,skip:number=0): Promise<VideoDto[]> {

        return axios.get('/videos/mine?take=30&skip='+skip*30,
            {
                headers: {
                    authorization: 'Bearer ' + bearer
                }
            }).then((res) => {
                return res.data
            })
    }

    static GetYouTubeMetadata(videourl: string): Promise<YoutubeVideo> {
        return fetch(`https://www.youtube.com/oembed?url=${videourl}&format=json`).then(res => res.json())
    }
}