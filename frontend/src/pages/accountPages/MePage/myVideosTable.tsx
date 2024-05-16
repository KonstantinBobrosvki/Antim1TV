import { useState, useEffect, useCallback } from "react";
import { Button, Col, Placeholder, Row, Table } from "react-bootstrap";
import { VideosApi, VideoDto, YoutubeVideo } from "../../../API/Videos.api";
import { useAppSelector } from "../../../hooks/redux"
import './mePage.sass'
import 'bootstrap/dist/css/bootstrap.min.css'
import { TVApi } from "../../../API/TV.api";
import { useTvs } from "../../../hooks/useTvs";
import { useDispatch } from "react-redux";
import { alertsSlice } from "../../../store/reducers/alertsSlice";

export const MyVideosTable = () => {
    const userState = useAppSelector(state => state.userReducer);
    const [myVideos, setMyVideos] = useState<VideoDto[]>()
    const [metadatas, setMetadatas] = useState<(YoutubeVideo & VideoDto)[]>();
    const [page, setPage] = useState(0);
    const dispatch = useDispatch();

    useEffect(() => {
        VideosApi.GetMine(userState.user!.access, page).then(res => res.data).then(setMyVideos);
    }, [page])

    useEffect(() => {
        const theFunc = async () => {
            if (myVideos)
                await Promise.all(myVideos?.map(async video => {
                    try {
                        const metadata = await VideosApi.GetYouTubeMetadata(video.link).then(res => res.data)
                        return { ...video, ...metadata }
                    } catch (error) {
                        return video as any;
                    }

                })).then(setMetadatas);
        }
        theFunc()

    }, [myVideos])

    const { tvs, tvIdToName } = useTvs();

    const onNextPageClick = () => {
        setPage((state) => state + 1)
        dispatch(alertsSlice.actions.add({ type: 'info', message: `Сега сте на страница ${page + 2}` }))
    }

    const onPrevPageClick = () => {
        if (page <= 0) {
            dispatch(alertsSlice.actions.add({ type: 'warning', message: `Сега сте на първа страница` }))
            return
        }
        setPage((state) => state - 1)
        dispatch(alertsSlice.actions.add({ type: 'info', message: `Сега сте на ${page} страница` }))
    }

    if (typeof metadatas === 'undefined')
        return (
            <>
                <h1 className="text-center loading-dots">Видеата зареждат</h1>
                <Placeholder as="p" size='lg' animation="glow">
                    <Placeholder xs={12} >
                    </Placeholder>
                </Placeholder></>)

    return (
        <Col>
            <span className="w-100 text-center text-center">
                <h2>Предложени видеа</h2>
            </span>
            <Table variant="light" responsive>
                <thead>
                    <tr>
                        <th className="text-center" scope="col">Preview</th>
                        <th className="text-center" scope="col">Линк</th>
                        <th className="text-center" scope="col">За телевизор</th>
                        <th className="text-center" scope="col">Състояние</th>
                    </tr>
                </thead>
                <tbody>

                    {metadatas!.map(video => {
                        return (<tr key={video.id}>
                            <th>
                                <img className="table-img" src={video.thumbnail_url ?? 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'}
                                    loading="lazy" alt="Preview" />
                            </th>
                            <th className="text-center align-middle">
                                <a href={video.link}>{video.link}</a>
                            </th>
                            <td className="text-center align-middle">
                                {tvIdToName(video.queueId)}
                            </td>
                            <td className="text-center align-middle">
                                {video.isAllowed ? 'Одобрено' : video.isAllowed === false ? 'Откaзано' : 'Не е прегледано'}
                            </td>
                        </tr>)

                    })
                    }
                </tbody>
            </Table >

            <Row className='justify-content-between'>
                <Col xs={5} md={3}>
                    <Button className="w-100" onClick={onPrevPageClick}>Предишни</Button>

                </Col>
                <Col xs={5} md={3}>
                    <Button className="w-100" onClick={onNextPageClick}>Следващи</Button>
                </Col>
            </Row>
        </Col>
    )
}