import { Routes, Route } from 'react-router-dom'
import { usePageFilter } from '../hooks/usePageFilter'
import { IPage } from '../pages/type';

export const AppRouter = () => {

    const routes = usePageFilter();

    return (<Routes>
        {
            routes.map(route => {
                if ('Page' in route) {
                    const Page: IPage = (route as any).Page;
                    return (<Route path={Page.path}
                        key={Page.path}
                        element={<Page />}
                    />)
                }
                return route.subRoutes.map(SubRoute => (
                    <Route path={route.baseUrl + SubRoute.path}
                        key={route.baseUrl + SubRoute.path}
                        element={<SubRoute />}
                    />
                ))
            })
        }
    </Routes>)
}