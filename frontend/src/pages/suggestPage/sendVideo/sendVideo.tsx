import { Col, Form, Row, Button } from "react-bootstrap"
import './sendVideo.sass'
export const SendVideoForm = () => {
    return (
        <Form.Group className="mb-3 bg-dark sender-wrapper">

            <div className="border-rotate-wrapper bg-dark">
                <div className="border-rotate"></div>

            </div>
            <div className="p-3">
                <Form.Label className="color-white w-100 text-center">Линк към видео от Youtube</Form.Label>
                <Row>
                    <Col xs={9} className='mt-3'>
                        <Form.Control placeholder="Линк към видеото" />
                    </Col>
                    <Col xs={4} md={3} className='text-center mt-3'>
                        <Button className='send-button'>Изпрати</Button>
                    </Col>
                </Row>
            </div>

        </Form.Group>
    )
}