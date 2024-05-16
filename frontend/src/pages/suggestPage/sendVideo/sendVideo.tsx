import { useState } from "react"
import { Col, Form, Row, Button } from "react-bootstrap"
import { VideosApi } from "../../../API/Videos.api"
import { Center } from "../../../components/Center/Center"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { useTvs } from "../../../hooks/useTvs"
import { alertsSlice } from "../../../store/reducers/alertsSlice"
import './sendVideo.sass'

export const SendVideoForm = () => {
    const token = useAppSelector(state => state.userReducer.user!.access)
    const defaultTvs = useAppSelector(state => state.userReducer.TvsId)

    const [input, setInput] = useState('')
    const [choosenTv, setChoosenTv] = useState<number>((defaultTvs && defaultTvs[0]) || 0);
    const dispatch = useAppDispatch();
    const { tvs, tvIdToName } = useTvs();

    const sendButtonClick = () => {
        if (!input.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)) {
            dispatch(alertsSlice.actions.add({ type: 'warning', message: 'Приемат се само линкове от ютуб' }))
            return;
        }
        if (choosenTv == 0) {
            dispatch(alertsSlice.actions.add({ type: 'warning', message: 'Моля изберете телевизор' }))
            return;
        }
        VideosApi.Suggest(input, +choosenTv, token).then(() => {
            dispatch(alertsSlice.actions.add({ type: 'info', message: 'Успешно изпратено за телевизор '+tvIdToName(+choosenTv) }))
            setInput('')
        }
        ).catch(err => {
            if (err.response) {
                dispatch(alertsSlice.actions.add({ type: 'danger', message: err.response.data.message }))
                return;
            }
            dispatch(alertsSlice.actions.add({ type: 'danger', message: 'Не е получен отговор от сървъра' }))
        })

    }

    return (
        <Form.Group className="mb-3 bg-dark sender-wrapper">

            <div className="border-rotate-wrapper bg-dark">
                <div className="border-rotate"></div>

            </div>
            <div className="p-3">
                <Form.Label className="color-white w-100 text-center">Линк към видео от Youtube</Form.Label>
                <Row>
                    <Col xs={9} className='mt-3'>
                        <Form.Control value={input} onChange={(ev) => setInput(ev.target.value)} placeholder="Линк към видеото" />
                    </Col>

                    <Col xs={3} id="tv-choose-select-wrapper" className='mt-3'>
                        <Form.Select onChange={(ev) => setChoosenTv(+ev.target.value)} >
                            <option value={0}>За телевизор</option>
                            {tvs?.map(tv => (
                                <option value={tv.id} key={tv.id}>{tv.name}</option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col xs={4} md={{ offset: 9, span: 2 }} className='mt-3'>
                        <Center>
                            <Button className='send-button' onClick={sendButtonClick}>Изпрати</Button>
                        </Center>
                    </Col>
                </Row>
            </div>

        </Form.Group>
    )
}