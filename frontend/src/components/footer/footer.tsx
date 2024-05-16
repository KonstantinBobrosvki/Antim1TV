import { Accordion, Carousel, Col, Row } from 'react-bootstrap'
import { Center } from '../Center/Center'
import './footer.sass'
const Footer = () => {
    return (
        <footer>
            <Row style={{ alignItems: 'center' }}>
                <Col xs={12} md={6} id='faq'>
                    <h1 className='title'> <Center >FAQ </Center></h1>
                    <Accordion >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Какво е това?</Accordion.Header>
                            <Accordion.Body>
                                Това е уеб сайт през който ученици и учители от СУ "Антим I" могат да контролират мултимедията в
                                училището
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header> Как да се включа?</Accordion.Header>
                            <Accordion.Body>
                                Регистрирай се! (И след това намери модератор и го помоли да ти да даде права)
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Кои видеа могат да се предлагат?</Accordion.Header>
                            <Accordion.Body>
                                Накратко-хубави :=)
                                <br />
                                Можете да предложите всяко видео от youtube, но то ще бъде проверено от най-професионалните
                                модератори в този свят! (Тъй че по-добре да съотвтства на училищните ценности !!1!)
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
                <Col xs={12} md={6}>
                    <Accordion >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header ><Center><span style={{ fontSize: '3em' }}>Контакти</span> </Center></Accordion.Header>
                            <Accordion.Body>
                                <Carousel fade interval={1500}>
                                    <Carousel.Item>
                                        <img src="https://s13emagst.akamaized.net/products/24752/24751657/images/res_bce415f000774caef58afea01127d8f8.jpg"
                                            className="d-block w-100" alt="..." />
                                        <div className="carousel-caption d-sm-block text-dark">
                                            <h5>konstantinbobrovski@gmail.com</h5>
                                        </div>
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <img src="https://cdn2.praktis.bg/media/catalog/product/cache/1/image/700x/9df78eab33525d08d6e5fb8d27136e95/7/_/7_shuko_kontakt_1.jpg"
                                            className="d-block w-100" alt="..." />
                                        <div className="carousel-caption d-sm-block text-dark">
                                            <h5>konstantinbobrovski@gmail.com</h5>
                                        </div>
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <img src="https://s13emagst.akamaized.net/products/24752/24751657/images/res_bce415f000774caef58afea01127d8f8.jpg"
                                            className="d-block w-100" alt="..." />
                                        <div className="carousel-caption d-sm-block text-dark">
                                            <h5>konstantinbobrovski@gmail.com</h5>
                                        </div>
                                    </Carousel.Item>
                                </Carousel>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                </Col>
            </Row>
        </footer >
    )
}

export default Footer