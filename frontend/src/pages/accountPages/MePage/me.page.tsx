import { Col, Container, Row, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { RightsEnumTranslated } from "../../../shared/RightEnum";
import { userSlice, UserState } from "../../../store/reducers/userSlice";
import 'bootstrap/dist/css/bootstrap.min.css'
import { IPage } from "../../type";
import './mePage.sass'
import { TvSection } from "./tvSection";
import { MyVideosTable } from "./myVideosTable";
import { Center } from "../../../components/Center/Center";
import { useNavigate } from "react-router-dom";
export const MePage: IPage = Object.assign(
    () => {
        const navigate = useNavigate();
        const userState = useAppSelector(state => state.userReducer);
        const user = userState.user!.user;
        const dispatch = useAppDispatch();
        const onLogoutClick = () => {
            dispatch(userSlice.actions.logout(null));
            navigate('/')
        }

        return (<Container>
            <Col xs={12}>
                <h1 style={{ textAlign: 'center' }}>Ако вашите права или приоритет не се показват правилно,
                    излезте и влезте в акаунта си отново.</h1>
            </Col>
            <hr className="splitter" />



            <Col xs={12}>
                <h2 style={{ textAlign: 'center' }}>Вашите права</h2>
                <Row as='ul'>
                    {
                        user.rights.map(right => (
                            <li key={right} className="col list-group-item bg-dark text-light me-2 mb-3 rounded-pill">
                                <span className="d-flex align-items-center justify-content-center h-100 w-100">{RightsEnumTranslated[right]}</span>
                            </li>
                        ))
                    }
                </Row>
            </Col>

            <hr className="splitter" />

            <Col xs={12} md={{ offset: 3, span: 6 }} >
                <h2 className="bg-dark text-light p-2 rounded-pill" style={{ textAlign: 'center' }}>Вашият приоритет е {user.priority ?? 'не определен, помолете да ви го сложат'}</h2>
            </Col>

            <hr className="splitter" />

            <TvSection />

            <hr className="splitter" />

            <MyVideosTable />

            <hr className="splitter" />

            <Col xs={12}>
                <Center>
                    <Button size="lg" onClick={onLogoutClick} variant='danger'>Излез от акаунт</Button>
                </Center>
            </Col>


        </Container >)
    },
    {
        checkAccess: (state: UserState): boolean => state.authed,
        path: '/me',
        pageName: 'Мой профил',
        showable: false
    }

)