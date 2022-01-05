import { ApiResponse } from '@nestjs/swagger';
import { type } from 'os';
import * as request from 'supertest';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { UserDto } from '../src/users/dto/user.dto';

export type ApiResponse = {
    status: number;
    body: any;
};

export type Request = {
    url: string;
    data: any;
    method: 'post' | 'get' | 'delete' | 'put';
};

export class UserResponse {
    //for normal logic in check signature dont touch
    user: UserDto = {} as UserDto;
    access: string = '';
}

export const requestFactory =
    (server: any): ((req: Request) => Promise<ApiResponse>) =>
    (req: Request): Promise<ApiResponse> =>
        new Promise((resolve, reject) => {
            let result: any = request(server);

            switch (req.method) {
                case 'get':
                    result = result.get(req.url);
                    break;
                default:
                    result = result[req.method](req.url).send(req.data);
                    break;
            }
            result.end((err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });

export const createUserFactory =
    (server: any): ((user: CreateUserDto) => Promise<ApiResponse>) =>
    (user: CreateUserDto): Promise<ApiResponse> =>
        new Promise((resolve, reject) => {
            request(server)
                .post('/auth/signup')
                .send({
                    ...user,
                })
                .end((err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
        });

export const getAdminUser = (server: any): Promise<UserResponse> =>
    requestFactory(server)({
        data: {
            username: 'Admin11',
            password: 'password',
        },
        method: 'post',
        url: '/auth/signin',
    }).then((res) => res.body);

export const checkSignature = (className: new () => any, object: {}): boolean => {
    const res = Object.keys(new className()).reduce(
        (acc: boolean, curr: string) =>
            acc === null || acc === undefined
                ? object.hasOwnProperty(curr)
                : object.hasOwnProperty(curr) && acc,
        null,
    );

    return res;
};
