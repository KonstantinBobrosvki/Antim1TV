import axios from "axios";
import { UserDto } from "../../../backend/src/users/dto/user.dto";
import { RightsEnum } from "../shared/RightEnum";

class UsersApi {
    static GetUsers(bearer: string, namePattern: string, skip: number, take: number): Promise<UserDto[]> {
        return axios.get('/users', {
            params: {
                take,
                skip, namePattern
            },

            headers: {
                authorization: 'Bearer ' + bearer
            }
        }).then(res => res.data)
    }

    static ChangePriority(bearer: string, userId: number, newPriority: number) {
        return axios.put(`/users/${userId}/priority`, {
            value: newPriority
        }, {
            headers: {
                authorization: 'Bearer ' + bearer
            }
        }).then(res => res.data)
    }

    static DeleteRight(bearer: string, userId: number, right: RightsEnum) {
        return axios.delete(`/users/${userId}/rights`, {
            data: {
                right
            },
            headers: {
                authorization: 'Bearer ' + bearer
            }
        }).then(res => res.data)
    }

    static AddRight(bearer: string, userId: number, right: RightsEnum) {
        return axios.post(`/users/${userId}/rights`, {
            right: +right
        }, {
            headers: {
                authorization: 'Bearer ' + bearer
            }
        }).then(res => res.data)
    }

    static BanUser(bearer: string, userId: number) {
        return axios.delete(`/users/${userId}/`, {
            headers: {
                authorization: 'Bearer ' + bearer
            }
        }).then(res => res.data)
    }
}

export default UsersApi