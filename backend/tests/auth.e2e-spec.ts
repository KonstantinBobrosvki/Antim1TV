import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';

import { HttpStatus, INestApplication } from '@nestjs/common';
import BaseError from '../src/common/errors/BaseError.error';
import { checkSignature, createUserFactory, requestFactory, UserResponse } from './helpers';

describe('Auth module e2e', () => {
    let app: INestApplication;
    let createUser: ReturnType<typeof createUserFactory>;
    let makeRequest: ReturnType<typeof requestFactory>;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        createUser = createUserFactory(app.getHttpServer());
        makeRequest = requestFactory(app.getHttpServer());
    });

    describe('signup tests', () => {
        it(`signup error short name`, async () => {
            const res = await createUser({
                username: 'shor',
                password: 'fdsfsd@dasd',
                email: 'fsdasdasf@gmail.com',
            });
            expect(BaseError.BadData().Equal(res.status)).toBe(true);
        });
        it(`signup error no input`, async () => {
            const res = await createUser({} as any);
            expect(BaseError.BadData().Equal(res.status)).toBe(true);
        });
        it(`signup error no input`, async () => {
            const res = await createUser({
                username: '',
                email: '',
                password: '',
            });
            expect(BaseError.BadData().Equal(res.status)).toBe(true);
        });
        it(`signup error not valid email`, async () => {
            const res = await createUser({
                username: 'normalName',
                password: 'fdsfasdasdassd',
                email: 'notValidEmail@yahoo.gf',
            });
            expect(BaseError.BadData().Equal(res.status)).toBe(true);
        });

        it(`signup good domain input`, async () => {
            const res = await createUser({
                username: 'normalName',
                password: 'fdsfasdasdassd',
                email: 'ValidEmail@gmail.com',
            });
            expect(res.status === HttpStatus.CREATED).toBe(true);
        });

        it(`signup bad domain input`, async () => {
            const res = await createUser({
                username: 'normalName',
                password: 'fdsfasdasdassd',
                email: 'ValidEmail@yahoo.com',
            });
            expect(BaseError.BadData().Equal(res.status)).toBe(true);
        });

        it(`signup for used username`, async () => {
            const goodRes = await createUser({
                username: 'normalName1',
                password: 'fdsfasdasdassd',
                email: 'ValidEmail2@gmail.com',
            });
            const badRes = await createUser({
                username: 'normalName1',
                password: 'fdsfasdasdassd',
                email: 'ValidEmail2@gmail.com',
            });
            expect(badRes.status === HttpStatus.CREATED).toBe(false);
            expect(BaseError.Duplicate().Equal(badRes.status)).toBe(true);
            expect(goodRes.status === HttpStatus.CREATED).toBe(true);
        });
    });

    describe('signin tests', () => {
        const users = [
            {
                username: 'NormalNamefsdfsd',
                password: 'hardPassword',
                email: 'email@gmail.com',
            },
            {
                username: 'CoolNameBro',
                password: '1hardPassword22',
                email: 'EmAil@yandex.ru',
            },
            {
                username: 'CoolNameSister',
                password: 'ParolaBati',
                email: 'POSHTA11@abv.bg',
            },
        ];
        beforeAll(async () => {
            await Promise.all(users.map(createUser));
        });

        it('bad input', async () =>
            makeRequest({
                url: '/auth/signin',
                method: 'post',
                data: {
                    username: 'NoAcc',
                    password: '',
                },
            }).then((res) => expect(BaseError.BadData().Equal(res.status)).toBeTruthy()));

        it('bad input', async () =>
            makeRequest({
                url: '/auth/signin',
                method: 'post',
                data: {},
            }).then((res) => expect(BaseError.BadData().Equal(res.status)).toBeTruthy()));

        it('no username', async () =>
            makeRequest({
                url: '/auth/signin',
                method: 'post',
                data: {
                    username: 'NoAccUsername',
                    password: 'dasdasdasd',
                },
            }).then((res) => expect(BaseError.NotFound().Equal(res.status)).toBeTruthy()));

        it('no email', async () =>
            makeRequest({
                url: '/auth/signin',
                method: 'post',
                data: {
                    email: 'NoAccemail@gmail.com',
                    password: 'dasdasdasd',
                },
            }).then((res) => expect(BaseError.NotFound().Equal(res.status)).toBeTruthy()));

        users.forEach((user) => {
            it('good enter by name', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        username: user.username,
                        password: user.password,
                    },
                }).then((res) => {
                    expect(res.status).toBe(HttpStatus.CREATED);
                    expect(checkSignature(UserResponse, res.body)).toBeTruthy();
                }));
        });

        users.forEach((user) => {
            it('good enter by email', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        email: user.email,
                        password: user.password,
                    },
                }).then((res) => {
                    expect(res.status).toBe(HttpStatus.CREATED);
                    expect(checkSignature(UserResponse, res.body)).toBeTruthy();
                }));
        });

        users.forEach((user) => {
            it('good enter by case differnce email', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        email: user.email
                            .split('')
                            .reduce(
                                (prev, curr) =>
                                    prev +
                                    (Math.random() > 0.5 ? curr.toLowerCase() : curr.toUpperCase()),
                                '',
                            ),
                        password: user.password,
                    },
                }).then((res) => {
                    expect(res.status).toBe(HttpStatus.CREATED);
                    expect(checkSignature(UserResponse, res.body)).toBeTruthy();
                    expect(checkSignature(UserResponse, { foo: 'bar' })).toBeFalsy();
                }));
        });

        users.forEach((user) => {
            it('bad password', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        email: user.email
                            .split('')
                            .reduce(
                                (prev, curr) =>
                                    prev + (Math.random() > 0.5)
                                        ? curr.toLowerCase()
                                        : curr.toUpperCase(),
                                '',
                            ),
                        password: 'HahaLolPassword',
                    },
                }).then((res) => expect(BaseError.BadData().Equal(res.status)).toBeTruthy()));
        });

        users.forEach((user) => {
            it('right password wrong name', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        username: user.email,
                        password: user.password,
                    },
                }).then((res) => expect(BaseError.NotFound().Equal(res.status)).toBeTruthy()));
        });

        users.forEach((user) => {
            it('right password wrong email', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        email: user.username,
                        password: user.password,
                    },
                }).then((res) => expect(BaseError.BadData().Equal(res.status)).toBeTruthy()));
        });

        users.forEach((user) => {
            it('all fields', async () =>
                makeRequest({
                    url: '/auth/signin',
                    method: 'post',
                    data: {
                        ...user,
                    },
                }).then((res) => expect(res.status).toBe(HttpStatus.CREATED)));
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
