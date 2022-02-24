import { IPage } from "../type"
import { AuthFrom } from "./authForm/authForm";
import { UserState } from "../../store/reducers/userSlice";
import { Person } from "react-bootstrap-icons";

export const AuthPage: IPage = Object.assign(() => (<>
    <AuthFrom />
</>)
    ,
    {
        checkAccess: (state: UserState): boolean => !state.authed,
        pageName: (<><Person/>Влез</>),
        path: '/auth',
        showable: true
    }

)

