import { ApiResponse } from '@nestjs/swagger';
import * as request from 'supertest';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { UserDto } from '../src/users/dto/user.dto';
import { randomUUID } from 'crypto';
import { RightsEnum } from '../src/users/Models/Enums/rights.enum';

export type ApiResponse<T = any> = {
    status: number;
    body: T;
};

export type Request = {
    url: string;
    data: any;
    method: 'post' | 'get' | 'delete' | 'put';
    bearer?: string;
};

export type PriorityResponse = {
    value: number
}

export type RightResponse = {
    right: RightsEnum
}

export type SenderFunc<T, ApiResponseType = any> = (
    value: T,
    id: number,
    accsess?: string,
) => Promise<ApiResponse<ApiResponseType>>;

type SenderFuncFactory<DataType, ApiResponseType> = (app: any) => SenderFunc<DataType, ApiResponseType>

export class UserResponse {
    //for normal logic in check signature dont touch
    user: UserDto = {} as UserDto;
    access: string = '';
}

export const requestFactory =
    (server: any): (<T = any>(req: Request) => Promise<ApiResponse<T>>) =>
        <T = any>(req: Request): Promise<ApiResponse<T>> =>
            new Promise((resolve, reject) => {
                const sender = request(server);
                let final: request.Test;
                switch (req.method) {
                    case 'get':
                        final = sender.get(req.url);
                        final = req.bearer
                            ? final.set('authorization', 'Bearer ' + req.bearer)
                            : final;
                        break;
                    default:
                        //  console.log(req.bearer ? req.bearer : 'no bearer');

                        let request = sender[req.method](req.url);
                        request = req.bearer
                            ? request.set('authorization', 'Bearer ' + req.bearer)
                            : request;
                        final = request.send(req.data);
                        break;
                }
                final.end((err, res) => {
                    if (err) reject(err);
                    resolve(res);
                });
            });

export const createUserFactory =
    (server: any): ((user: CreateUserDto) => Promise<ApiResponse<UserResponse>>) =>
        (user: CreateUserDto): Promise<ApiResponse<UserResponse>> =>
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

export const generateUser = (): CreateUserDto => {
    const usernames = [
        [
            'Good',
            'Bad',
            'BOLD',
            'High',
            'White',
            'Dark',
            'Yellow',
            'Pink',
            'Gray',
            'Cute',
            'Mad',
            'Cool',
            'Boring',
        ],
        [
            'Human',
            'Elf',
            'Orc',
            'Dog',
            'Cow',
            'Knight',
            'Dragon',
            'Witch',
            'Elvis',
            'Raqn',
            'Noun',
            'Babadook',
            'Pig',
            'Lion',
        ],
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

export const setPriorityFactory: SenderFuncFactory<number, PriorityResponse> = (server) => (priority: number, id: number, accses?: string) => requestFactory(server)({
    url: `/users/${id}/priority`,
    method: 'put',
    bearer: accses,
    data: {
        value: priority,
    },
})

export const giveRightRequestFactory: SenderFuncFactory<RightsEnum, RightResponse> = (server) => (right: RightsEnum, id: number, accses?: string) => requestFactory(server)({
    url: `/users/${id}/rights`,
    method: 'post',
    bearer: accses,
    data: {
        right,
    },
});

export const deleteRightRequestFactory: SenderFuncFactory<RightsEnum, RightsEnum[]> = (server) => (right: RightsEnum, id: number, accses?: string) => requestFactory(server)({
    url: `/users/${id}/rights`,
    method: 'delete',
    bearer: accses,
    data: {
        right,
    },
});

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
