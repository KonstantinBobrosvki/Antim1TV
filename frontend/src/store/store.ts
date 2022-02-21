import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice";
import alertsReducer from "./reducers/alertsSlice";
import { UserLocalStorageKey } from "../shared/consts";

const rootReducer = combineReducers({
    userReducer,
    alertsReducer
})

export const setupStore = () => {
    const store = configureStore({
        reducer: rootReducer
    })

    store.subscribe(() => {
        localStorage.setItem(UserLocalStorageKey, JSON.stringify(store.getState().userReducer))
    })

    return store
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
