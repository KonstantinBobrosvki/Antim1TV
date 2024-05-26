import { FC, memo, useEffect, useState } from "react"
import SocketApi from "../../../../API/Socket.api"
import { StateDto } from '../../../../types/StateDto'
import { Button, Card } from "react-bootstrap"
import { VideoBox } from "../../../../components/videoBox/videobox"
import { Center } from "../../../../components/Center/Center"
import { Actions } from "../../../../shared/ActionsEnum"

type PlayerStates = {
    socketApi: SocketApi
}

const PlayerStates: FC<PlayerStates> = ({ socketApi }) => {
    const [answers, setAnswers] = useState<StateDto[]>([])
    useEffect(() => {
        socketApi.addReceivereceiveStateallback((a) => {
            setAnswers([...answers, a])
        })

        return () => {
            socketApi.clearCallbacks('receiveState')
        }
    }, [])


    return (<div>
        <Center> <Button onClick={() => socketApi.SendAction(Actions.AskForState)}>Получи състояния</Button></Center>
        {
            answers.map((answ, ind) => {
                return <VideoBox videoUrl={answ.CurrentVideo.video.link} key={answ.Seconds}>
                    <div>
                        <p>Звукът е {answ.IsMuted ? 'изключен' : 'включен'} и е {answ.Volume}</p>
                        <p>Видеото е {answ.IsPlaying ? 'включено' : 'изключено'}</p>
                        <p>Секундата е {answ.Seconds}</p>

                    </div>
                </VideoBox>
            })
        }
    </div>)
}

export default memo(PlayerStates)