import { Nav, NavDropdown } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbar.sass'
import { NavLink } from "react-router-dom";
import { usePageFilter } from "../../hooks/usePageFilter";
import { IPage } from "../../pages/type";
import { useLocation } from 'react-router-dom'

export const AppNavbar = () => {

    const routes = usePageFilter();
    const location = useLocation();

    return (<Nav className="navbar navbar-expand-lg navbar-dark bg-dark">

        <Nav.Item >
            <Nav.Link as={NavLink} to='/' className="navbar-brand fst-italic fw-bold">Antim1TV</Nav.Link>
        </Nav.Item>

        <div className="collapse navbar-collapse bg-secondary justify-content-end">
            <ul className="navbar-nav mr-auto justify-content-end h3 me-2">
                {routes.map(route => {
                    if ('Page' in route) {
                        const page: IPage = (route as any).Page;
                        return (<Nav.Item key={page.path} as="li">
                            <Nav.Link as={NavLink} to={page.path}>{page.pageName}</Nav.Link>
                        </Nav.Item>)
                    }

                    console.log(location.pathname.startsWith(route.baseUrl));
                    
                    return (<NavDropdown title={route.name} key={route.baseUrl} as='ul' active={location.pathname.startsWith(route.baseUrl)}>

                        {
                            route.subRoutes.map(subRoute => (
                                <NavDropdown.Item key={route.baseUrl + subRoute.path} as='li'>
                                    <Nav.Link as={NavLink} to={route.baseUrl + subRoute.path}>{subRoute.pageName}</Nav.Link>
                                </NavDropdown.Item>
                            ))
                        }


                    </NavDropdown>)

                })}

            </ul>
        </div>
    </Nav>)
}