import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDto } from "../../../../backend/src/users/dto/user.dto";
import { UserResponse } from "../../shared/types";

export interface UserState {
    authed: boolean
    user?: UserResponse
}

const initialState: UserState = {
    authed: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action: PayloadAction<UserResponse>) {
            state.user = action.payload
            state.authed = true
        },
        logout(state, action) {
            state.authed = false;
            state.user = undefined
        }
    }
})

export default userSlice.reducer