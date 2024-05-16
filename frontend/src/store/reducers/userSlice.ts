import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserLocalStorageKey } from "../../shared/consts";
import { UserResponse } from "../../shared/types";

export interface UserState {
    authed: boolean
    user?: UserResponse
    TvsId?: number[]

}

const savedUser = localStorage.getItem(UserLocalStorageKey)

const initialState: UserState = savedUser ? JSON.parse(savedUser) : {
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
        },
        setTvs(state, action: PayloadAction<number[]>) {
            state.TvsId=action.payload;
        }
    }
})

export default userSlice.reducer