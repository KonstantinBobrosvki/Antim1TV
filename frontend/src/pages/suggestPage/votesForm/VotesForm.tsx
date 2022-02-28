import { memo, useMemo, useState } from "react"
import { Button, Col, Container, Row } from "react-bootstrap"
import { VideoDto, VideosApi } from "../../../API/Videos.api"
import { Center } from "../../../components/Center/Center"
import CustomCarousel from "../../../components/CustomCarousel/CustomCarousel"
import { TextLoader } from "../../../components/Loaders/TextLoader/TextLoader"
import { VideoBox } from "../../../components/videoBox/videobox"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import useBreakpoint from "../../../hooks/useBreakpoints"
import { useFetching } from "../../../hooks/useFetching"
import { useTvs } from "../../../hooks/useTvs"
import { ExcepionHandler } from "../../../shared/helpers"
import { alertsSlice } from "../../../store/reducers/alertsSlice"

export const VotesForm = memo(() => {
    const access = useAppSelector(state => state.userReducer.user!.access)
    let { result, error, isLoading } = useFetching(VideosApi.GetForVote(access))
    const breakpoint = useBreakpoint();
    const [brokenIds, setBrokenIds] = useState<number[]>([])

    const dispatch = useAppDispatch();

    const { tvIdToName } = useTvs();

    const filtredResult = useMemo(() => {
        if (isLoading)
            return [];
        return result!.filter(el => true !== brokenIds.some(broken => broken === el.id))
    }, [result, brokenIds, isLoading])

    const onVoteClick = (video: VideoDto) => {
        return () => {
            const videoId = video.id;
            VideosApi.Vote(videoId.toString(), access).
                then(_ => {
                    setBrokenIds([video.id, ...brokenIds])
                    dispatch(alertsSlice.actions.add({ type: 'info', 'message': 'Успешно гласуване' }))
                })
                .catch(ExcepionHandler(dispatch));
        }
    }

    if (isLoading)
        return <Container>
            <Col xs={12}>
                <Center><TextLoader>Видеата за гласуване зареждат</TextLoader></Center>
            </Col>
        </Container>

    return (
        <Container>
            <CustomCarousel show={Math.min(breakpoint + 1, 4)}>
                {filtredResult?.map(video => (

                    <Col xs={6} md={4} lg={3} key={video.id}>
                        <div style={{ padding: '10px', maxWidth: 'max(30vw,200px)' }}>
                            <VideoBox videoUrl={video.link} onFailLoad={() => setBrokenIds([video.id, ...brokenIds])}>
                                <Center>За телевизор:{tvIdToName(video.queueId)}</Center>
                                <Row>
                                    <Button data-video-id={video.id} onClick={onVoteClick(video)}>Гласувай</Button>
                                </Row>
                            </VideoBox>
                        </div>
                    </Col>
                ))}
            </CustomCarousel>
        </Container>)
})