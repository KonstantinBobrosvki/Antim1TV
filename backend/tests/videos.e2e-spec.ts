import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { AppModule } from '../src/app/app.module';
import BaseError from '../src/common/errors/BaseError.error';
import {
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
    ApiResponse,
} from './helpers';

import * as _ from './extends';
import { RightsEnum } from '../src/users/Models/Enums/rights.enum';
import { VideoDto } from '../src/videos/dto/video.dto';
import { AllowedVideoDto } from '../src/videos/dto/allowedVideo.dto';
import { VoteDTO } from '../src/videos/dto/vote.dto';

describe('Videos module e2e', () => {
    let app: INestApplication;

    let createUser: ReturnType<typeof createUserFactory>;
    let makeRequest: ReturnType<typeof requestFactory>;
    let admin: UserResponse;

    let setPriority: SenderFunc<number, PriorityResponse>;
    let giveRightRequest: SenderFunc<RightsEnum, RightResponse>;
    let deleteRightRequest: SenderFunc<RightsEnum, RightsEnum[]>;
    let suggestVideoRequest: SenderFunc<string, VideoDto>;
    let allowVideoRequest: (id: number, accsess: string) => Promise<ApiResponse<AllowedVideoDto>>;
    let disallowVideoRequest: (
        id: number,
        accsess: string,
    ) => Promise<ApiResponse<{ deleted: Boolean }>>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        createUser = createUserFactory(app.getHttpServer());
        makeRequest = requestFactory(app.getHttpServer());

        setPriority = setPriorityFactory(app.getHttpServer());

        giveRightRequest = giveRightRequestFactory(app.getHttpServer());

        deleteRightRequest = deleteRightRequestFactory(app.getHttpServer());

        admin = await getAdminUser(app.getHttpServer());

        suggestVideoRequest = (videoLink: string, queueId: number, accsees?: string) =>
            makeRequest({
                url: '/videos/',
                method: 'post',
                bearer: accsees,
                data: {
                    videoLink: `https://www.youtube.com/watch?v=${videoLink}`,
                    queueId,
                },
            });

        allowVideoRequest = (videoId, accsess) =>
            makeRequest<AllowedVideoDto>({
                url: `/videos/${videoId}/allow`,
                method: 'put',
                bearer: accsess,
                data: null,
            });

        disallowVideoRequest = (videoId, accsess) =>
            makeRequest<{ deleted: Boolean }>({
                url: `/videos/${videoId}/disallow`,
                method: 'put',
                bearer: accsess,
                data: null,
            });
    });

    describe('Suggesting', () => {
        it('bad id', async () => {
            const res = await makeRequest({
                url: '/videos/',
                method: 'post',
                bearer: admin.access,
                data: {
                    videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    queueId: 'fsd',
                },
            });
            expect(BaseError.BadData().Equal(res.status)).toBeTruthy();
        });
        it('bad id', async () => {
            const res = await makeRequest({
                url: '/videos/',
                method: 'post',
                bearer: admin.access,
                data: {
                    videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    queueId: -100,
                },
            });

            expect(BaseError.NotFound().Equal(res.status)).toBeTruthy();
        });
        it('bad id', async () => {
            const res = await makeRequest({
                url: '/videos/',
                method: 'post',
                bearer: admin.access,
                data: {
                    videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    queueId: 200,
                },
            });

            expect(res.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('no right', async () => {
            const createUserDto = generateUser();
            const user = (await createUserFactory(app.getHttpServer())(createUserDto))
                .body as UserResponse;

            const res = await makeRequest({
                url: '/videos/',
                method: 'post',
                bearer: user.access,
                data: {
                    videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    queueId: 200,
                },
            });

            expect(res.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('good test', async () => {
            const res = await makeRequest({
                url: '/videos/',
                method: 'post',
                bearer: admin.access,
                data: {
                    videoLink: `https://www.youtube.com/watch?v=${getRandomVideoId()}`,
                    queueId: 1,
                },
            });

            expect(res.body).CheckSignature(
                class {
                    id = 2;
                    link = 'f';
                    queueId = 1;
                    createdDate = 'f';
                },
            );
        });
    });

    describe('allowing', () => {
        it('normal case', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);
            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);
            expect(suggestedVideo.body.isAllowed).toBeUndefined();
            expect(suggestedVideo.body.queueId).toBe(1);

            const allowedVideo = await allowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.OK);
            expect(allowedVideo.body.id).toBe(suggestedVideo.body.id);
        });

        it('allowing already moderated', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);
            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);
            expect(suggestedVideo.body.isAllowed).toBeUndefined();
            expect(suggestedVideo.body.queueId).toBe(1);

            const allowedVideo = await allowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.OK);
            expect(allowedVideo.body.video.id).toBe(suggestedVideo.body.id);

            const secondTry = await allowVideoRequest(suggestedVideo.body.id, reLogin.body.access);
            expect(secondTry.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('not such video', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);

            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);
            //there will no be video with future id
            const allowedVideo = await allowVideoRequest(
                suggestedVideo.body.id + 1000,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('after someone declined video', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);
            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);
            expect(suggestedVideo.body.isAllowed).toBeUndefined();
            expect(suggestedVideo.body.queueId).toBe(1);

            const disallowedVideo = await disallowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(disallowedVideo.status).toBe(HttpStatus.OK);

            const secondTry = await allowVideoRequest(suggestedVideo.body.id, reLogin.body.access);
            expect(secondTry.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('disallowing', () => {
        it('not found', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);

            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);
            //there will no be video with future id
            const allowedVideo = await disallowVideoRequest(
                suggestedVideo.body.id + 1000,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('be first remover', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);

            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);

            const allowedVideo = await disallowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.OK);
            expect(allowedVideo.body.deleted).toBe(true);
        });

        it('be second remover', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);

            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);

            const disallowedVideo = await disallowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(disallowedVideo.status).toBe(HttpStatus.OK);
            expect(disallowedVideo.body.deleted).toBe(true);

            const secondTry = await disallowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(secondTry.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('change already allowed video by someone with lower priority', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);

            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);

            const allowedVideo = await allowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.OK);

            const secondUserDto = generateUser();
            const secondUser = await createUser(secondUserDto);
            await giveRightRequest(RightsEnum.AllowVideo, secondUser.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, secondUser.body.user.id, admin.access);
            await setPriority(600, secondUser.body.user.id, admin.access);
            const secondReLogin = await makeRequest({
                url: '/auth/signin',
                data: secondUserDto,
                method: 'post',
            });
            const disallow = await disallowVideoRequest(
                suggestedVideo.body.id,
                secondReLogin.body.access,
            );
            expect(disallow.status).toBe(HttpStatus.OK);
            expect(disallow.body.deleted).toBe(true);
        });

        it('change already allowed video by someone with higher priority', async () => {
            const userDto = generateUser();
            const user = await createUser(userDto);
            await giveRightRequest(RightsEnum.AllowVideo, user.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, user.body.user.id, admin.access);

            const reLogin = await makeRequest({
                url: '/auth/signin',
                data: userDto,
                method: 'post',
            });
            expect(reLogin.status).toBe(HttpStatus.CREATED);

            const suggestedVideo = await suggestVideoRequest(
                getRandomVideoId(),
                1,
                reLogin.body.access,
            );
            expect(suggestedVideo.status).toBe(HttpStatus.CREATED);

            const allowedVideo = await allowVideoRequest(
                suggestedVideo.body.id,
                reLogin.body.access,
            );
            expect(allowedVideo.status).toBe(HttpStatus.OK);

            const secondUserDto = generateUser();
            const secondUser = await createUser(secondUserDto);
            await giveRightRequest(RightsEnum.AllowVideo, secondUser.body.user.id, admin.access);
            await giveRightRequest(RightsEnum.Suggest, secondUser.body.user.id, admin.access);

            //here is the difference
            await setPriority(600, user.body.user.id, admin.access);

            const secondReLogin = await makeRequest({
                url: '/auth/signin',
                data: secondUserDto,
                method: 'post',
            });
            const disallow = await disallowVideoRequest(
                suggestedVideo.body.id,
                secondReLogin.body.access,
            );
            expect(disallow.status).toBe(HttpStatus.FORBIDDEN);
        });
    });

    describe('get video for voting', () => {
        //i cant test in full form, because i use real db, so i just check ascending date
        it('normal case', async () => {
            const result = await makeRequest<VideoDto[]>({
                url: '/videos/voting',
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(result.status).toBe(HttpStatus.OK);
            result.body.reduce(
                (prev, curr) => {
                    expect(new Date(prev.createdDate).getTime()).toBeLessThanOrEqual(
                        new Date(curr.createdDate).getTime(),
                    );
                    return curr;
                },
                { createdDate: new Date(0) },
            );
        });

        it('check consienting', async () => {
            const result = await makeRequest<VideoDto[]>({
                url: '/videos/voting',
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            const result2 = await makeRequest<VideoDto[]>({
                url: '/videos/voting',
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(result.status).toBe(HttpStatus.OK);
            expect(result2.status).toBe(HttpStatus.OK);
            expect(result.body).FullEqual(result2.body);
        });

        it('voting', async () => {
            const dummy = await createUser(generateUser());

            const result = await makeRequest<VideoDto[]>({
                url: '/videos/voting',
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(result.status).toBe(HttpStatus.OK);
            expect(result.body.length).toBeGreaterThan(0);
            expect(result.body.length).toBeLessThanOrEqual(30);

            const video = result.body[Math.floor(Math.random() * result.body.length)];
            const firstTry = await makeRequest<VoteDTO>({
                url: `/videos/allowed/${video.id}/vote`,
                method: 'put',
                data: {},
                bearer: admin.access,
            });
            expect(firstTry.status).toBe(HttpStatus.OK);
            expect(firstTry.body.videoId).toBe(video.id);
            expect(firstTry.body.voterId).toBe(admin.user.id);
            expect(Object.keys(firstTry.body).length).toBe(2);

            const thirddTry = await makeRequest<VoteDTO>({
                url: `/videos/allowed/${video.id}/vote`,
                method: 'put',
                data: {},
                bearer: dummy.body.access,
            });
            expect(thirddTry.status).toBe(HttpStatus.OK);
            expect(thirddTry.body.videoId).toBe(video.id);
            expect(thirddTry.body.voterId).toBe(dummy.body.user.id);
            expect(Object.keys(thirddTry.body).length).toBe(2);
        });
    });

    describe('get videos for moderating', () => {
        it('normal case', async () => {
            await Promise.all(
                Array.from({ length: 30 }).map((_) =>
                    suggestVideoRequest(
                        getRandomVideoId(),
                        Math.floor(Math.random() * 2),
                        admin.access,
                    ),
                ),
            );

            const result = await makeRequest<VideoDto[]>({
                url: '/videos/unmoderated',
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            expect(result.status).toBe(HttpStatus.OK);

            result.body.forEach(async (video) => {
                const request =
                    Math.random() < 0.5
                        ? allowVideoRequest(video.id, admin.access)
                        : disallowVideoRequest(video.id, admin.access);
                const response = await request;
                expect(response.status).toBe(HttpStatus.OK);
            });
        });

        it('check consienting', async () => {
            //TEst are runned in real db so async ruins constient
            await new Promise((resolve) => setTimeout(resolve, 4000));
            const result = await makeRequest<VideoDto[]>({
                url: '/videos/unmoderated',
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            const result2 = await makeRequest<VideoDto[]>({
                url: '/videos/unmoderated',
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            expect(result.status).toBe(HttpStatus.OK);
            expect(result2.status).toBe(HttpStatus.OK);

            expect(result.body).FullEqual(result2.body);
        });

        it('check normal removing after moderation', async () => {
            await Promise.all(
                Array.from({ length: 30 }).map((_) =>
                    suggestVideoRequest(
                        getRandomVideoId(),
                        Math.floor(Math.random() * 2),
                        admin.access,
                    ),
                ),
            );

            const before = await makeRequest<VideoDto[]>({
                url: '/videos/unmoderated',
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(before.status).toBe(HttpStatus.OK);

            await Promise.all(
                before.body.map(async (element) => {
                    const request =
                        Math.random() < 0.5
                            ? allowVideoRequest(element.id, admin.access)
                            : disallowVideoRequest(element.id, admin.access);
                    const response = await request;
                    expect(response.status).toBe(HttpStatus.OK);
                }),
            );

            const after = await makeRequest<VideoDto[]>({
                url: '/videos/unmoderated',
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            expect(
                after.body.some((videoAfter) =>
                    before.body.some((videoBefore) => videoAfter.id == videoBefore.id),
                ),
            ).toBeFalsy();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});

function getRandomVideoId() {
    const codeLength = 11;
    const possibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_';
    return Array.apply(null, Array(codeLength))
        .map(() => possibles.charAt(Math.floor(Math.random() * possibles.length)))
        .join('');
}
