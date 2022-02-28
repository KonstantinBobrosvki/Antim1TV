import { useState, useEffect, useCallback } from "react";
import { TVApi } from "../API/TV.api";
import { useAppSelector } from "./redux";


export const useTvs = () => {
    const userState = useAppSelector(state => state.userReducer);
    const [remoteTvs, setRemoteTvs] = useState<Awaited<ReturnType<typeof TVApi.GetTvs>>>();
    useEffect(() => {
        TVApi.GetTvs(userState.user!.access).then(setRemoteTvs)
    }, [])

    const tvIdToName = useCallback((id: number) => {
        if (remoteTvs)
            return remoteTvs!.find(tv => tv.id === id)?.name || 'Изтрит телевизор'
        return 'Зарежда...'
    }, [remoteTvs])

    return { tvs: remoteTvs, tvIdToName }
}