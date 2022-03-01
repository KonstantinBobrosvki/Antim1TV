import { Routes, Route, Navigate } from 'react-router-dom'
import { usePageFilter } from '../hooks/usePageFilter'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
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

        <Route path="/404" element={<NotFoundPage />} key='404' />
        
        <Route path="*" element={<Navigate to='/404'/>} key='navigate'/>
    </Routes>)
}