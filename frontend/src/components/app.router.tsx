import { Routes, Route } from 'react-router-dom'
import { usePageFilter } from '../hooks/usePageFilter'
import { IPage } from '../pages/type';

export const AppRouter = () => {

    const routes = usePageFilter();

    return (<Routes>
        {
            routes.map(route => {
                if ((route as any).Page) {
                    const Page: IPage = (route as any).Page;
                    return (<Route path={Page.path}
                        key={Page.path}
                        element={<Page/>}
                    />)
                }

            })

        }
    </Routes>)
}