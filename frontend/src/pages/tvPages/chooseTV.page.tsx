import { IPage } from "../type"
import { UserState } from "../../store/reducers/userSlice";
import { CloudArrowUp } from "react-bootstrap-icons";

export const ChooseTvtPage: IPage = Object.assign(
    () => (<div>
        Videos
    </div>),
    {
        checkAccess: (state: UserState): boolean => state.authed,
        path: '/suggest',
        pageName: (<><CloudArrowUp />Предложи</>),
        showable: true
    }

)


