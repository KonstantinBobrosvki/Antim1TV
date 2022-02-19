import { IPage } from "./type"
import { AuthFrom } from "../components/authForm/authForm";
import { UserState } from "../store/reducers/userSlice";

export const AuthPage: IPage = Object.assign(() => (<>
    <AuthFrom />
</>)
    ,
    {
        checkAccess: (state: UserState): boolean => !state.authed,
        pageName: 'Влез',
        path: '/auth'
    }

)

