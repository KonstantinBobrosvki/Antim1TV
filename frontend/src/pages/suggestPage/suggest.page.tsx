import { IPage } from "../type"
import { UserState } from "../../store/reducers/userSlice";
import { CloudArrowUp } from "react-bootstrap-icons";
import { RightsEnum } from "../../shared/RightEnum";
import { Container } from "react-bootstrap";
import { SendVideoForm } from "./sendVideo/sendVideo";


export const SuggestPage: IPage = Object.assign(
    () => (<Container>
        <SendVideoForm/>
    </Container>),
    {
        checkAccess: (state: UserState): boolean => state.authed && state.user?.user.rights.includes(RightsEnum.Suggest) as boolean,
        path: '/suggest',
        pageName: (<><CloudArrowUp />Предложи</>),
        showable: true
    }

)


