import { UserDto } from "../../../backend/src/users/dto/user.dto";
import { IPage } from "../pages/type";

export type route = { Page: IPage } | { baseUrl: string, name: string, subRoutes: IPage[] }

export type UserResponse = {
    //for normal logic in check signature dont touch
    user: UserDto
    access: string
}
