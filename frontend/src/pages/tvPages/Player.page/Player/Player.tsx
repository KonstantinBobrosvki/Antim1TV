import { FC, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Row, Col, Button, Form } from "react-bootstrap"
import { Forward, PauseBtn, PlayBtn, SkipBackward, SkipEnd, VolumeDown } from "react-bootstrap-icons"
import ReactPlayer from "react-player"
import { AllowedVideoDto } from "../../../../../../backend/src/videos/dto/allowedVideo.dto"
import PlayerApi from "../../../../API/Player.api"
import SocketApi from "../../../../API/Socket.api"
import { Center } from "../../../../components/Center/Center"
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux"
import { Actions } from "../../../../shared/ActionsEnum"
import { RickRollYoutube } from "../../../../shared/consts"
import { ExcepionHandler, GetVideoId } from "../../../../shared/helpers"
import { alertsSlice } from "../../../../store/reducers/alertsSlice"
import PlayerStates from './PlayersState'
import './player.sass'
type PlayerProps = {
    id: number
}

const Player: FC<PlayerProps> = ({ id }) => {
    const bearer:string = useAppSelector(state => state.userReducer.user!.access)
    const dispatch = useAppDispatch()

    const [sendActions, setSendActions] = useState(false)
    const [receiveActions, setReceiveActions] = useState(true)

    const playerApi = useMemo(() => new PlayerApi(id, bearer), [])
    const socketApi = useRef(new SocketApi(id, bearer)).current;
   
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [current, setCurrent] = useState<AllowedVideoDto>({ video: { link: RickRollYoutube } } as any)
    const [volume, setVolume] = useState(0.0)

    const playerRef = useRef<any>()

    const PlayerEvents = {
        onReady: () => {
            const pl = (playerRef as any).current?.player?.player?.player as any
            if(!pl){
                return;
            }
            pl.getPlaybackQuality('medium')
            pl.loadVideoById(GetVideoId(current.video.link))
        }, onEnded: () => {
            if (!current.queuePositon) {
                playerApi.GetNew().then(setCurrent).catch(ExcepionHandler(dispatch));
                return;
            }
            playerApi.GetNext(current.queuePositon).then(setCurrent).catch(() =>
                playerApi.GetNew().then(setCurrent).catch(ExcepionHandler(dispatch)));
        }, onPause: () => {
            setIsPlaying(false)
        }, onPlay: () => {
            setIsPlaying(true)
        }, onError: () => {
            dispatch(alertsSlice.actions.add({ type: 'warning', message: 'Възникна грешка.' }))
        },
        onStart: () => {
            setIsPlaying(true)
        }
    }

    //If event is null so action was sent from remote 
    const onFirstClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.LoadFirst)
        playerApi.GetFirst().then(setCurrent).catch(ExcepionHandler(dispatch));
    }
    const onPrevClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.LoadPrevious)

        if (!current.queuePositon) {
            dispatch(alertsSlice.actions.add({ type: 'danger', message: 'Няма текущо видео' }))
            return;
        }
        playerApi.GetPrevious(current.queuePositon).then(setCurrent).catch(ExcepionHandler(dispatch));

    }
    const onTurnDownSoundClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.DownVolume)

        setVolume(volume - 0.1)

    }
    const onTooglePlaying = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(isPlaying ? Actions.Pause : Actions.Play)

        setIsPlaying(el => !el)
    }
    const onTurnUpSoundClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.UpVolume)

        setVolume(volume + 0.1)
    }
    const onNextClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.LoadNext)

        if (!current.queuePositon) {
            dispatch(alertsSlice.actions.add({ type: 'danger', message: 'Няма текущо видео' }))
            return;
        }
        playerApi.GetNext(current.queuePositon).then(setCurrent).catch(ExcepionHandler(dispatch));
    }
    const onNewClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.LoadNew)

        playerApi.GetNew().then(setCurrent).catch(ExcepionHandler(dispatch));
    }
    const onToogleMuteClick = (notRemoteAction?: MouseEvent) => {
        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.Mute)
        setIsMuted(el => !el)
    }
    const onReloadClick = (notRemoteAction?: MouseEvent) => {

        (!Boolean(notRemoteAction) !== sendActions) && !!Boolean(notRemoteAction) && socketApi.SendAction(Actions.RefreshPage)

        document.location.reload();
    }

    const addCallbacks = useCallback(() => {
        socketApi.addReceiveActionCallback((action) => {
            switch (action.action) {
                case Actions.LoadFirst:
                    onFirstClick(undefined)
                    break;
                case Actions.LoadPrevious:
                    onPrevClick(undefined)
                    break;
                case Actions.LoadNext:
                    onNextClick(undefined)
                    break;
                case Actions.LoadNew:
                    onNewClick(undefined)
                    break;
                case Actions.DownVolume:
                    onTurnDownSoundClick(undefined)
                    break;
                case Actions.UpVolume:
                    onTurnUpSoundClick(undefined)
                    break;
                case Actions.Mute:
                    onToogleMuteClick(undefined)
                    break;
                case Actions.Pause:
                    setIsPlaying(false)
                    break;
                case Actions.Play:
                    setIsPlaying(true)
                    break;
                case Actions.RefreshPage:
                    onReloadClick(undefined)
                    break;
                case Actions.AskForState:
                    console.log(current);

                    socketApi.SendState({
                        CurrentVideo: current,
                        Volume: volume,
                        IsMuted: isMuted,
                        IsPlaying: isPlaying,
                        Seconds: playerRef?.current?.getCurrentTime() ?? 10

                    })
                    break;

                default:
                    break;
            }
        })
    }, [isPlaying, isMuted, volume, current])

    useEffect(() => {
        playerApi.GetFirst().then(setCurrent).catch(() => {
            playerApi.GetNew().then(setCurrent).catch(() => {
                dispatch(alertsSlice.actions.add({ type: 'danger', message: 'Няма видеа' }))
            })
        })
        return () => {
            socketApi && socketApi.clearCallbacks('receiveState')
            socketApi && socketApi.Close();
        }
    }, [])

    useEffect(() => {
        console.log('changed in efect');
        
        if (receiveActions) {
            addCallbacks()
        }

        return () => {
            socketApi.clearCallbacks('receiveAction')
        }
    }, [receiveActions, addCallbacks])

    useEffect(() => {
        try {
            console.log('changed current');

            const pl = (playerRef as any)?.current?.player?.player?.player as any
            if(!pl){
                return;
            }
            pl.loadVideoById(GetVideoId(current.video.link))

        } catch (error) {
            console.log(error);

        }

    }, [current])

    return (<>
        <ReactPlayer id="player"
            url={current?.video.link}
            playing={isPlaying}
            muted={isMuted}
            volume={volume}
            ref={playerRef}
            config={{
                youtube: {
                    playerVars: {
                        autoplay: 1
                    }
                }
            }}
            {...PlayerEvents as any}
        />
        <Center>
            <h1>Управление</h1>
        </Center>
        <Row id='controls-row'>
            <Col sm={12}>
                <Row style={{ justifyContent: 'space-between' }}>
                    <Form.Check
                        className="remote-toogler"
                        type="switch"
                        label="Контролирай телевизор"
                        checked={sendActions}
                        onChange={() => setSendActions(st => !st)}
                    />
                    <Form.Check
                        className="remote-toogler"
                        type="switch"
                        label="Бъди контролиран"
                        checked={receiveActions}
                        onChange={() => setReceiveActions(st => !st)}
                    />
                </Row>
            </Col>
            <Col md={4} sm={6}>
                <Row style={{ justifyContent: 'space-evenly' }}>
                    <Button onClick={onFirstClick}>
                        Първи

                        <SkipBackward />
                    </Button>
                    <Button onClick={onPrevClick}>
                        Назад
                        <Forward className="rotate-180" />
                    </Button>
                </Row>
            </Col>
            <Col md={4} sm={12}>
                <Row style={{ justifyContent: 'space-evenly', flexDirection: 'column' }}>
                    <Button onClick={onTurnDownSoundClick}>
                        Намали звук
                        <VolumeDown />
                    </Button>
                    <Button onClick={onTooglePlaying}>
                        {isPlaying ?
                            (<>
                                Спри
                                <PauseBtn />
                            </>) :
                            (<>
                                Стартирай
                                <PlayBtn />
                            </>)
                        }
                    </Button>
                    <Button onClick={onTurnUpSoundClick}>
                        Увеличи звук
                        <VolumeDown />
                    </Button>
                </Row>
            </Col>
            <Col md={4} sm={6}>
                <Row style={{ justifyContent: 'space-evenly' }}>
                    <Button onClick={onNextClick}>
                        Напред
                        <Forward />
                    </Button>
                    <Button onClick={onNewClick}>
                        Нов
                        <SkipEnd />
                    </Button>
                </Row>
            </Col>
            <Col sm={12}>
                <Row style={{ justifyContent: 'space-between' }}>
                    <Button variant="warning" onClick={onToogleMuteClick}>{isMuted ? 'В' : 'Из'}ключи звук </Button>
                    <Button variant="warning" onClick={onReloadClick}>Презареди страницата </Button>
                </Row>
            </Col>
        </Row>
        <PlayerStates socketApi={socketApi} />
    </>)
}

export default Player