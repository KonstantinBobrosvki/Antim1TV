import { ApiResponse } from '@nestjs/swagger';
import * as request from 'supertest';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { UserDto } from '../src/users/dto/user.dto';
import { randomUUID } from 'crypto';

export type ApiResponse = {
    status: number;
    body: any;
};

export type Request = {
    url: string;
    data: any;
    method: 'post' | 'get' | 'delete' | 'put';
    bearer?: string;
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
                    //  console.log(req.bearer ? req.bearer : 'no bearer');

                    result = result[req.method](req.url);
                    result = req.bearer
                        ? result.set('authorization', 'Bearer ' + req.bearer)
                        : result;
                    result = result.send(req.data);
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
    }).then((res) => {
        if (res.status == 201) return res.body;
        throw new Error('No admin account');
    });

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

export const generateUser = (): CreateUserDto => {
    const usernames = [
        ['Good', 'Bad', 'BOLD', 'High', 'White', 'Dark'],
        ['Human', 'Elf', 'Orc', 'Dog', 'Cow', 'Knight'],
    ];

    return {
        username: RandomCombiner(usernames[0], usernames[1], '-' + randomUUID().substring(0, 10)),
        email: RandomCombiner(
            usernames[0],
            usernames[1],
            randomUUID().substring(0, 5) +
                (Math.random() > 0.6
                    ? '@yandex.ru'
                    : Math.random() > 0.5
                    ? '@abv.bg'
                    : '@gmail.com'),
        ),
        password: randomUUID().substring(0, 20),
    };
};

function RandomCombiner(
    array1: string[],
    array2: string[],
    salt?: string,
    separator: string = '',
): string {
    const rA = Math.floor(Math.random() * array1.length);
    const rB = Math.floor(Math.random() * array2.length);
    return [array1[rA], array2[rB], salt].join(separator);
}
