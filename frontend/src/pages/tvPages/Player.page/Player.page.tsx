import { IPage } from "../../type"
import { UserState } from "../../../store/reducers/userSlice";
import { RightsEnum } from "../../../shared/RightEnum";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
import Player from "./Player/Player";

type PlayerPageParams = {
    id: string
}

const PlayerPage: IPage = Object.assign(
    () => {
        const params = useParams<PlayerPageParams>()
        const id: number = +(params.id as any)
        const navigate = useNavigate()

        useEffect(() => {
            if (typeof id === 'undefined' || isNaN(+id) || +id < 0) {
                navigate('/404')
                return;
            }

            window.document.title = 'Телевизор'

        }, [])

        return (<Container>
            <Player id={id} />
        </Container>)
    },
    {
        checkAccess: (state: UserState): boolean => state.authed && !!state.user?.user.rights.includes(RightsEnum.ControllPlayer),
        path: '/tvs/:id',
        pageName: (<></>),
        showable: false
    }

)

export default PlayerPage

