import { PersonBadge } from "react-bootstrap-icons";
import { SubRoute } from "../../shared/types";
import { MePage } from "./MePage/me.page";

export const accountRoutes: SubRoute = {
    baseUrl: '/users',
    name: (<><PersonBadge />Аккаунт </>),
    subRoutes: [MePage]
}