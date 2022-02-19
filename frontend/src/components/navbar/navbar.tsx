import { Nav } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbar.sass'
import { NavLink } from "react-router-dom";
import { usePageFilter } from "../../hooks/usePageFilter";
import { IPage } from "../../pages/type";

export const AppNavbar = () => {

    const routes = usePageFilter();


    return (<Nav className="navbar navbar-expand-lg navbar-dark bg-dark">

        <Nav.Item >
            <Nav.Link as={NavLink} to='/' className="navbar-brand fst-italic fw-bold">Antim1TV</Nav.Link>
        </Nav.Item>

        <div className="collapse navbar-collapse bg-secondary justify-content-end">
            <ul className="navbar-nav mr-auto justify-content-end h3 me-2">
                {routes.map(route => {
                    if ((route as any).Page) {
                        const page: IPage = (route as any).Page;
                        return (<Nav.Item key={page.path} as="li">
                            <Nav.Link as={NavLink} to={page.path}>{page.pageName}</Nav.Link>
                        </Nav.Item>)
                    }

                })}

            </ul>
        </div>
    </Nav>)
}