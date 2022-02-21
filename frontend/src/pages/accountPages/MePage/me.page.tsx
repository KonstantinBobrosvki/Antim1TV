import { Col, Container, Row } from "react-bootstrap";
import { useAppSelector } from "../../../hooks/redux";
import { RightsEnumTranslated } from "../../../shared/RightEnum";
import { UserState } from "../../../store/reducers/userSlice";
import 'bootstrap/dist/css/bootstrap.min.css'
import { IPage } from "../../type";
import './mePage.sass'
import { TVApi } from "../../../API/TV.api";
import { useEffect, useState } from "react";
import { Awaited } from '../../../shared/types'
import { TvSection } from "./tvSection";
import { MyVideosTable } from "./myVideosTable";
export const MePage: IPage = Object.assign(
    () => {

        const userState = useAppSelector(state => state.userReducer);
        const user = userState.user!.user;



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
            
        </Container >)
    },
    {
        checkAccess: (state: UserState): boolean => state.authed,
        path: '/me',
        pageName: 'Мой профил',
        showable: false
    }

)