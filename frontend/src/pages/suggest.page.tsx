import { IPage } from "./type"
import { UserDto } from '../../../backend/src/users/dto/user.dto'
import React from "react";
import { UserState } from "../store/reducers/userSlice";

export const SuggestPage: IPage = Object.assign(
    () => (<div>
        Videos
    </div>),
    {
        checkAccess: (state: UserState): boolean => state.authed,
        path: '/suggest',
        pageName: 'Предложи'
    }

)


