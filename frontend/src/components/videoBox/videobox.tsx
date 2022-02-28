import { FC } from 'react'
import { Card } from 'react-bootstrap';
import { VideosApi, YoutubeVideo } from '../../API/Videos.api';
import { useFetching } from '../../hooks/useFetching';
import { BrokenImageURL, LoadingGifURL } from '../../shared/consts';
import { TextLoader } from '../Loaders/TextLoader/TextLoader';

type VideoBoxProps = {
    videoUrl: string,
    onFailLoad?: (videoUrl:string)=>any
};


export const VideoBox: FC<VideoBoxProps> = ({ children, videoUrl, onFailLoad = () => { } }) => {

    const { result, isLoading, error } = useFetching<YoutubeVideo>(VideosApi.GetYouTubeMetadata(videoUrl).then(res => res.data))
    if (isLoading)
        return (<Card>
            <Card.Img variant="top" src={LoadingGifURL} />
            <Card.Body>
                <Card.Title><TextLoader>Зарежда</TextLoader></Card.Title>
            </Card.Body>
        </Card>)
    if (error) {
        onFailLoad(videoUrl);
        return (<Card>
            <Card.Img variant="top" src={BrokenImageURL} />
            <Card.Body>
                <Card.Title>Не успяхме да заредим това видео</Card.Title>
            </Card.Body>
        </Card>)
    }
    return (<Card>
        <Card.Img variant="top" src={result!.thumbnail_url} />
        <Card.Body>
            <Card.Title>{result!.title}</Card.Title>
            {children}
        </Card.Body>
    </Card>)
}