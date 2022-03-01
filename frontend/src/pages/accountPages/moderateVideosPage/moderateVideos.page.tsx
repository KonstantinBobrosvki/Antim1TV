import { RightsEnum } from "../../../shared/RightEnum"
import { UserState } from "../../../store/reducers/userSlice"
import { IPage } from "../../type"

const ModerateVideosPage: IPage = Object.assign(() => {
    return (<div>Lol</div>)
},
    {
        checkAccess: (state: UserState): boolean => state.authed && state.user?.user.rights.includes(RightsEnum.AllowVideo) as boolean,
        path: '/suggest',
        pageName: (<>Одобри контент</>),
        showable: true
    })
