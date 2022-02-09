import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';

import { HttpStatus, INestApplication } from '@nestjs/common';
import * as _ from './extends';

import {
    ApiResponse,
    createUserFactory,
    generateUser,
    getAdminUser,
    requestFactory,
    UserResponse,
    SenderFunc,
    PriorityResponse,
    RightResponse,
    setPriorityFactory,
    deleteRightRequestFactory,
    giveRightRequestFactory,
} from './helpers';
import { RightsEnum } from '../src/users/Models/Enums/rights.enum';
import { UserDto } from '../src/users/dto/user.dto';

describe('Users module e2e', () => {
    let app: INestApplication;
    let createUser: ReturnType<typeof createUserFactory>;
    let makeRequest: ReturnType<typeof requestFactory>;
    let admin: UserResponse;
    let setPriority: SenderFunc<number, PriorityResponse>;
    let giveRightRequest: SenderFunc<RightsEnum, RightResponse>;
    let deleteRightRequest: SenderFunc<RightsEnum, RightsEnum[]>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        createUser = createUserFactory(app.getHttpServer());
        makeRequest = requestFactory(app.getHttpServer());

        admin = await getAdminUser(app.getHttpServer());

        setPriority = setPriorityFactory(app.getHttpServer());

        giveRightRequest = giveRightRequestFactory(app.getHttpServer());

        deleteRightRequest = deleteRightRequestFactory(app.getHttpServer());
    });

    describe('helper', () => {
        it('FullEqual', () => {
            expect({ bar: 'foo' }).not.FullEqual({ foo: 'bar' });
            expect({ bar: 'foo' }).FullEqual({ bar: 'foo' });
            expect({ bar: 'bar', foo: { foo: 'foo' } }).not.FullEqual({
                bar: 'bar',
                foo: { foo: 'bar' },
            });
            expect({ bar: 'bar', foo: { foo: 'foo' } }).FullEqual({
                bar: 'bar',
                foo: { foo: 'foo' },
            });
            expect({ bar: 'foo' }).not.FullEqual({ foo: 'bar' });
        });
    });

    describe('rights giving', () => {
        it('check signature', async () => {
            const res = await createUser(generateUser());
            const res2 = await makeRequest({
                url: `/users/${res.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });
            expect(res.status).toBe(HttpStatus.CREATED);
            expect(res2.body.right).toBe(RightsEnum.ChangeRight);
        });

        it('No auth', async () => {
            const res = await createUser(generateUser());
            const res2 = await makeRequest({
                url: `/users/${res.body.user.id}/rights`,
                method: 'post',
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });
            expect(res2.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it('No right for changing', async () => {
            const res = await createUser(generateUser());
            const giver = await createUser(generateUser());

            const res2 = await makeRequest({
                url: `/users/${res.body.user.id}/rights`,
                method: 'post',
                bearer: giver.body.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });
            expect(res2.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('self giving', async () => {
            const res = await createUser(generateUser());

            const res2 = await makeRequest({
                url: `/users/${res.body.user.id}/rights`,
                method: 'post',
                bearer: res.body.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });
            expect(res2.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('Double giving', async () => {
            const firstUser = await createUser(generateUser());

            const FirstUserRight = await makeRequest({
                url: `/users/${firstUser.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });
            expect(FirstUserRight.status).toBe(HttpStatus.CREATED);

            const UserSecondRight = await makeRequest({
                url: `/users/${firstUser.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });

            expect(UserSecondRight.status).toBe(HttpStatus.CONFLICT);
        });

        it('Sucsesful relogin', async () => {
            const user = generateUser();
            const firstLogin = await createUser(user);

            const FirstUserRight = await makeRequest({
                url: `/users/${firstLogin.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });
            expect(FirstUserRight.status).toBe(HttpStatus.CREATED);

            const UserSecondRight = await makeRequest({
                url: `/users/${firstLogin.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.AllowVideo,
                },
            });

            expect(UserSecondRight.status).toBe(HttpStatus.CREATED);

            const userReLogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: user,
            });

            expect(userReLogin.body.user.rights).toContain(RightsEnum.AllowVideo);
            expect(userReLogin.body.user.rights).toContain(RightsEnum.ChangeRight);
            expect(userReLogin.body.user.rights).not.toContain(RightsEnum.ChangePriority);
        });

        it('Giving right from lover level', async () => {
            const user = generateUser();
            const firstLogin = await createUser(user);

            const FirstUserRight = await makeRequest({
                url: `/users/${firstLogin.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });

            expect(FirstUserRight.status).toBe(HttpStatus.CREATED);

            const UserSecondRight = await makeRequest({
                url: `/users/${firstLogin.body.user.id}/rights`,
                method: 'post',
                bearer: admin.access,
                data: {
                    right: RightsEnum.AllowVideo,
                },
            });

            expect(UserSecondRight.status).toBe(HttpStatus.CREATED);

            const userReLogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: user,
            });

            expect(userReLogin.body.user.rights).toContain(RightsEnum.AllowVideo);
            expect(userReLogin.body.user.rights).toContain(RightsEnum.ChangeRight);
            expect(userReLogin.body.user.rights).not.toContain(RightsEnum.ChangePriority);

            const secondUser = await createUser(generateUser());

            const secondUserRight1 = await makeRequest({
                url: `/users/${secondUser.body.user.id}/rights`,
                method: 'post',
                bearer: userReLogin.body.access,
                data: {
                    right: RightsEnum.AllowVideo,
                },
            });

            expect(secondUserRight1.status).toBe(HttpStatus.CREATED);
            expect(secondUserRight1.body.right).toBe(RightsEnum.AllowVideo);

            const secondUserRight2 = await makeRequest({
                url: `/users/${secondUser.body.user.id}/rights`,
                method: 'post',
                bearer: userReLogin.body.access,
                data: {
                    right: RightsEnum.ChangeRight,
                },
            });

            expect(secondUserRight2.status).toBe(HttpStatus.CREATED);
            expect(secondUserRight2.body.right).toBe(RightsEnum.ChangeRight);

            const secondUserRight3 = await makeRequest({
                url: `/users/${secondUser.body.user.id}/rights`,
                method: 'post',
                bearer: userReLogin.body.access,
                data: {
                    right: RightsEnum.BanUser,
                },
            });

            expect(secondUserRight3.status).toBe(HttpStatus.FORBIDDEN);
            expect(secondUserRight3.body.right).not.toBe(RightsEnum.BanUser);
        });
    });

    describe('rights remove', () => {
        it('no auth', async () => {
            const user1 = await createUser(generateUser());
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);
            const removing = await deleteRightRequest(RightsEnum.BanUser, user1.body.user.id);
            expect(removing.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it('forbiden', async () => {
            const user1 = await createUser(generateUser());
            const user2 = await createUser(generateUser());
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);
            const removing = await deleteRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                user2.body.access,
            );
            expect(removing.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('successful 2', async () => {
            const user1 = await createUser(generateUser());
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            const rightRes2 = await giveRightRequest(
                RightsEnum.ChangeRight,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);
            const removing = await deleteRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(removing.status).toBe(HttpStatus.OK);
            expect((removing.body as Array<RightsEnum>).length).toBe(1);
            expect(removing.body).toContain(RightsEnum.ChangeRight);
        });

        it('bad data', async () => {
            const user1 = await createUser(generateUser());
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);
            const removing = await deleteRightRequest(4123, user1.body.user.id, admin.access);
            expect(removing.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('no right', async () => {
            const user1 = await createUser(generateUser());
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);
            const removing = await deleteRightRequest(
                RightsEnum.AllowVideo,
                user1.body.user.id,
                admin.access,
            );
            expect(removing.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('same priority', async () => {
            const firstUser = generateUser();
            const user1 = await createUser(firstUser);
            const user2 = await createUser(generateUser());
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);

            const user1Relogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: firstUser,
            });

            const removing = await deleteRightRequest(
                RightsEnum.AllowVideo,
                user2.body.user.id,
                user1Relogin.body.access,
            );
            expect(removing.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('lower priority', async () => {
            const firstUser = generateUser();
            const user1 = await createUser(firstUser);
            const rightRes = await giveRightRequest(
                RightsEnum.BanUser,
                user1.body.user.id,
                admin.access,
            );
            expect(rightRes.status).toBe(HttpStatus.CREATED);

            const user1Relogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: firstUser,
            });

            const removing = await deleteRightRequest(
                RightsEnum.AllowVideo,
                admin.user.id,
                user1Relogin.body.access,
            );
            expect(removing.status).toBe(HttpStatus.FORBIDDEN);
        });
    });

    describe('priority', () => {
        it('normal case', async () => {
            const user = await createUser(generateUser());
            const response = await setPriority(4, user.body.user.id, admin.access);
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body.value).toBe(4);
            expect(response.body).CheckSignature(
                class {
                    value = 5;
                },
            );
            expect(
                Object.keys(response.body).filter((k) => response.body[k] && k != 'id').length,
            ).toBe(1);
        });

        it('forbiden', async () => {
            const user = generateUser();
            const firstuser = await createUser(user);
            await giveRightRequest(RightsEnum.ChangeRight, firstuser.body.user.id, admin.access);

            const user1Relogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: user,
            });
            const seocnd = await createUser(generateUser());
            const response = await setPriority(4, seocnd.body.user.id, user1Relogin.body.access);
            expect(response.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('no auth', async () => {
            const user = generateUser();
            const firstuser = await createUser(user);

            const response = await setPriority(4, firstuser.body.user.id);
            expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it('cascade giving', async () => {
            const user1 = generateUser();
            const firstUser = await createUser(user1);

            const user2 = generateUser();
            const secondUser = await createUser(user2);

            await giveRightRequest(RightsEnum.ChangePriority, firstUser.body.user.id, admin.access);
            await setPriority(600, firstUser.body.user.id, admin.access);

            const firstRelogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: user1,
            });

            expect(firstRelogin.body.user.priority).toBe(600);
            expect(firstRelogin.body.user.rights).toContain(RightsEnum.ChangePriority);

            const prior = await setPriority(599, secondUser.body.user.id, firstRelogin.body.access);
            expect(prior.status).toBe(HttpStatus.OK);
            expect(prior.body.value).toBe(599);
            expect(prior.body).CheckSignature(
                class {
                    value = 5;
                },
            );
            expect(Object.keys(prior.body).filter((k) => prior.body[k] && k != 'id').length).toBe(
                1,
            );
        });

        it('changing by same user', async () => {
            const dto = generateUser();
            const user = await createUser(dto);

            const firstTry = await setPriority(100, user.body.user.id, admin.access);
            expect(firstTry.status).toBe(HttpStatus.OK);
            expect(firstTry.body.value).toBe(100);

            const secondTry = await setPriority(300, user.body.user.id, admin.access);
            expect(secondTry.status).toBe(HttpStatus.OK);
            expect(secondTry.body.value).toBe(300);

            //we cant set prior higher than ours
            const thirdTry: ApiResponse<any> = await setPriority(
                admin.user.priority + 1,
                user.body.user.id,
                admin.access,
            );
            expect(thirdTry.status).toBe(HttpStatus.FORBIDDEN);
            expect(thirdTry.body.message).toBe('Трябва да имате по-висок приоритет');

            //negative is not allowed too
            const fourthTry: ApiResponse<any> = await setPriority(
                -10,
                user.body.user.id,
                admin.access,
            );
            expect(fourthTry.status).toBe(HttpStatus.BAD_REQUEST);

            //not rounded is not allowed too
            const fifthTry: ApiResponse<any> = await setPriority(
                10.6,
                user.body.user.id,
                admin.access,
            );
            expect(fifthTry.status).toBe(HttpStatus.BAD_REQUEST);

            const sixthTry = await setPriority(4, user.body.user.id, admin.access);
            expect(sixthTry.status).toBe(HttpStatus.OK);
            expect(sixthTry.body.value).toBe(4);

            const firstRelogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: dto,
            });

            expect(firstRelogin.body.user.priority).toBe(4);
        });

        it('changing by higher user', async () => {
            const dto = generateUser();
            const firstUser = await createUser(dto);
            await giveRightRequest(RightsEnum.ChangePriority, firstUser.body.user.id, admin.access);
            await setPriority(900, firstUser.body.user.id, admin.access);

            const firstRelogin = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: dto,
            });

            const dto2 = generateUser();
            const secondUser = await createUser(dto2);

            const firstPriorChange = await setPriority(
                600,
                secondUser.body.user.id,
                firstRelogin.body.access,
            );
            expect(firstPriorChange.status).toBe(HttpStatus.OK);
            expect(firstPriorChange.body.value).toBe(600);

            const secondPriorChange = await setPriority(500, secondUser.body.user.id, admin.access);
            expect(secondPriorChange.status).toBe(HttpStatus.OK);
            expect(secondPriorChange.body.value).toBe(500);

            const tridPriorChange = await setPriority(
                500,
                secondUser.body.user.id,
                firstRelogin.body.access,
            );
            expect(tridPriorChange.status).toBe(HttpStatus.FORBIDDEN);
        });
    });

    describe('user getting', () => {
        it('no auth', async () => {
            const res = await createUser(generateUser());
            const res2 = await makeRequest({
                url: `/users/${res.body.user.id}`,
                method: 'get',
                data: {},
            });
            expect(res2.status).toBe(HttpStatus.UNAUTHORIZED);
        });
        it('check signature', async () => {
            const res = await createUser(generateUser());
            const res2 = await makeRequest({
                url: `/users/${res.body.user.id}`,
                method: 'get',
                bearer: admin.access,
                data: {},
            });
            expect({ ...res.body.user, email: undefined }).FullEqual(res2.body);
        });

        it('after changing data', async () => {
            const dto = generateUser();
            const user = await createUser(dto);

            await giveRightRequest(RightsEnum.ChangePriority, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await setPriority(541, user.body.user.id, admin.access);

            const newData = await makeRequest<UserDto>({
                url: `/users/${user.body.user.id}`,
                method: 'get',
                bearer: admin.access,
                data: {},
            });
            expect(newData.body.rights.length).toBe(2);
            expect(newData.body.rights).toContain(RightsEnum.AllowVideo);
            expect(newData.body.rights).toContain(RightsEnum.ChangePriority);
            expect(newData.body.priority).toBe(541);
            expect(newData.body.email).toBeUndefined();
        });

        it('normal case', async () => {
            const result = await makeRequest<UserDto[]>({ url: '/users?skip=0&take=99', method: 'get', data: {}, bearer: admin.access })
            expect(result.status).toBe(HttpStatus.OK);
            result.body.reduce((prev, curr) => { 
                expect(curr.id).toBeGreaterThan(prev.id);
                expect(curr.email).toBeFalsy()
                expect(curr.priority).toBeGreaterThanOrEqual(0);
                return curr
            }, { id: -100 });

            const result2 = await makeRequest<UserDto[]>({ url: '/users?skip=0&take=1', method: 'get', data: {}, bearer: admin.access })
            expect(result2.status).toBe(HttpStatus.OK);

            const result3 = await makeRequest<UserDto[]>({ url: '/users?skip=-1&take=10', method: 'get', data: {}, bearer: admin.access })
            expect(result3.status).toBe(HttpStatus.BAD_REQUEST);
        })
    });

    describe('banning', () => {
        const deleteRequest = (id: number, access: string) => makeRequest<UserDto>({ url: '/users/' + id, method: 'delete', data: {}, bearer: access })
        it('no right', async () => {
            const normalUser = await createUser(generateUser())

            const secondDude = generateUser();
            const secondDudeLogin = await createUser(secondDude)
            await setPriority(100, secondDudeLogin.body.user.id, admin.access);
            const newData = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: secondDude,
            });

            const result = await deleteRequest(normalUser.body.user.id, newData.body.access);
            expect(result.status).toBe(HttpStatus.FORBIDDEN);
        })

        it('normal case', async () => {
            const normalUser = await createUser(generateUser())

            const secondDude = generateUser();
            const secondDudeLogin = await createUser(secondDude)
            await setPriority(100, secondDudeLogin.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.BanUser, secondDudeLogin.body.user.id, admin.access)
            const newData = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: secondDude,
            });

            const result = await deleteRequest(normalUser.body.user.id, newData.body.access);
            expect(result.status).toBe(HttpStatus.OK);
            expect({ ...result.body, rights: undefined, priority: undefined }).FullEqual({ username: normalUser.body.user.username, id: normalUser.body.user.id })
        })

        it('no priority', async () => {
            const normalUser = await createUser(generateUser())

            const secondDude = generateUser();
            const secondDudeLogin = await createUser(secondDude)
            await setPriority(100, secondDudeLogin.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.BanUser, secondDudeLogin.body.user.id, admin.access)

            await setPriority(100, normalUser.body.user.id, admin.access);

            const newData = await makeRequest<UserResponse>({
                url: '/auth/signin',
                method: 'post',
                data: secondDude,
            });

            const result = await deleteRequest(normalUser.body.user.id, newData.body.access);
            expect(result.status).toBe(HttpStatus.FORBIDDEN);
        })

        it('self delete', async () => {
            const normalUser = await createUser(generateUser())

            const newData = await deleteRequest(normalUser.body.user.id, normalUser.body.access)

            expect(newData.status).toBe(HttpStatus.OK);
        })
    })

    afterAll(async () => {
        await app.close();
    });
});
