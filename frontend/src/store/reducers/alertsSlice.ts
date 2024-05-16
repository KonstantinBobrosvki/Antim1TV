import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { guid } from "../../shared/helpers";


type Alert = {
    type: 'danger' | 'warning' | 'info',
    message: string,
    id?: string
}

export interface AlertsState {
    alerts: Alert[];
}

const initialState: AlertsState = {
    alerts: []
}

export const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        add(state, action: PayloadAction<Alert>) {
            state.alerts.push({ ...action.payload, id: guid() });
        },
        clear(state, action) {
            state.alerts = [];
        },
        remove(state, action: PayloadAction<Alert>) {
            state.alerts = state.alerts.filter(alert => alert.type === action.payload.type && alert.message === action.payload.message)
        }
    }
})

export default alertsSlice.reducer