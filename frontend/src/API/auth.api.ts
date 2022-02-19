import axios from "axios";
import { UserResponse } from "../shared/types";



export class AuthApi {
    static SignIn(credit: string, password: string): Promise<UserResponse> {
        return axios.post('http://localhost:5050/api/auth/signin', {
            username: credit,
            password,
            email: credit
        }).then(res => res.data)
    }
    static SignUp(username: string, email: string, password: string): Promise<UserResponse> {
        return axios.post('http://localhost:5050/api/auth/signup', {
            username,
            password,
            email
        }).then(res => res.data)
    }
}