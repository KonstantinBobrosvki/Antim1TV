import { useMemo } from 'react'
import { routes } from '../pages'
import { IPage } from '../pages/type';
import { route } from '../shared/types';
import { useAppSelector } from './redux';
let last: any;

export const usePageFilter = (): route[] => {

    const userState = useAppSelector(state => state.userReducer)

    const filtred = useMemo(() => {
        return routes.filter((route, index) => {
            if ((route as any).Page) {
                return ((route as any).Page as IPage).checkAccess(userState)
            }
            //so it is sub domain
            const filtedSubRoutes = ((route as any).subRoutes as IPage[]).filter(route => route.checkAccess(userState))
            if (filtedSubRoutes.length == 0)
                return false;

            (routes[index] as any).subRoutes = filtedSubRoutes;

            return true;
        })
    }, [userState])

    return filtred;
}