import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { AppModule } from '../src/app/app.module';
import {
    createUserFactory,
    generateUser,
    requestFactory,
    UserResponse,
    DB_Client,
    ApiResponse,
    getAdminUser,
    SenderFunc,
} from './helpers';

import * as _ from './extends';
import { VideoDto } from '../src/videos/dto/video.dto';
import { AllowedVideoDto } from '../src/videos/dto/allowedVideo.dto';
import { QueryResult } from 'pg';

// !!!! Some times this tests fail from 2 reasons- weak pc or old data in db (order of playing video is based on votes and passed hours)

describe('Players (getting video for showing, real time controlling, etc stuff) module e2e', () => {
    let app: INestApplication;
    let createUser: ReturnType<typeof createUserFactory>;
    let makeRequest: ReturnType<typeof requestFactory>;
    let admin: UserResponse;

    let addVotes: (videoId: number, count: number) => Promise<QueryResult>;

    let suggestVideoRequest: SenderFunc<string, VideoDto>;
    let allowVideoRequest: (id: number, accsess: string) => Promise<ApiResponse<AllowedVideoDto>>;
    let prepareVideo: (queueId: number) => ReturnType<typeof allowVideoRequest>;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        createUser = createUserFactory(app.getHttpServer());
        makeRequest = requestFactory(app.getHttpServer());
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

        prepareVideo = async (queueId: number) => {
            return allowVideoRequest(
                await suggestVideoRequest(getRandomVideoId(), queueId, admin.access).then(
                    (video) => video.body.id,
                ),
                admin.access,
            );
        };
        addVotes = async (videoId: number, count: number) => {
            //I am not testing voting system here so i save some time by this
            const client = await DB_Client.connect();
            const result = await client.query(
                `UPDATE "allowed_video" SET "votes" = ${count} WHERE "allowed_video"."id"=${videoId} RETURNING *;`,
            );
            client.release();
            return result;
        };

        await DB_Client.query(
            `UPDATE "allowed_video" SET "votes" = 0 WHERE "queuePositon" IS NULL AND "votes" !=0;`,
        );
    });

    describe('Getting new videos', () => {
        it('normal case', async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const firstVotes = random(40, 60);
            const secondVotes = random(10, 30);

            const [video, secondVideo] = await Promise.all([prepareVideo(1), prepareVideo(1)]);
            await addVotes(video.body.id, firstVotes);
            const votesSecondQuery = await addVotes(secondVideo.body.id, secondVotes);

            const result = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            expect(result.status).toBe(HttpStatus.CREATED);
            expect(result.body.id).toBe(video.body.id);
            expect(result.body.id).not.toBe(secondVideo.body.id);
            expect(result.body.votes).toBe(firstVotes);

            const result2 = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            expect(result2.status).toBe(HttpStatus.CREATED);
            expect(result2.body.id).not.toBe(video.body.id);

            if (result2.body.id != secondVideo.body.id) {
                console.log({ votesSecondQuery });

                console.log(result2.body);
                console.log(secondVideo.body);
            }

            expect(result2.body.id).toBe(secondVideo.body.id);
            expect(result2.body.votes).toBe(secondVotes);

            expect(result.body.queuePositon).toBeLessThan(result2.body.queuePositon);
        });

        it('no queue', async () => {
            //there is no 30 queus so not found
            const result = await makeRequest<AllowedVideoDto>({
                url: '/players/30/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            expect(result.status).toBe(HttpStatus.NOT_FOUND);
        });

        it('no rights', async () => {
            const video = await prepareVideo(1);
            const user = await createUser(generateUser());
            const result = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: user.body.access,
            });
            expect(result.status).toBe(HttpStatus.FORBIDDEN);
        });

        it('different queues', async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const firstVotes = random(80, 100);
            const secondVotes = random(30, 39);
            const thirdVotes = random(70, 80);
            const fourthVotes = random(10, 29);

            const [video, secondVideo, thirdVideo, fourtVideo] = await Promise.all([
                prepareVideo(1),
                prepareVideo(1),
                prepareVideo(2),
                prepareVideo(2),
            ]);
            await Promise.all([
                addVotes(video.body.id, firstVotes),
                addVotes(secondVideo.body.id, secondVotes),
                addVotes(thirdVideo.body.id, thirdVotes),
                addVotes(fourtVideo.body.id, fourthVotes),
            ]);

            const firstQueueVideo1 = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const firstQueueVideo2 = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const secondQueueVideo1 = await makeRequest<AllowedVideoDto>({
                url: '/players/2/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const secondQueueVideo2 = await makeRequest<AllowedVideoDto>({
                url: '/players/2/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });

            expect(firstQueueVideo1.body.id).toBe(video.body.id);
            expect(firstQueueVideo2.body.id).toBe(secondVideo.body.id);
            expect(secondQueueVideo1.body.id).toBe(thirdVideo.body.id);
            expect(secondQueueVideo1.body.id).toBe(thirdVideo.body.id);
            expect(secondQueueVideo2.body.id).toBe(fourtVideo.body.id);
        });
    });

    describe('getting exact video', () => {
        it('normal case', async () => {
            const video = await prepareVideo(1);
            const secondVideo = await prepareVideo(1);
            await Promise.all([
                addVotes(video.body.id, random(40, 60)),
                addVotes(secondVideo.body.id, random(10, 30)),
            ]);

            const playedFirst = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const playedSecond = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });

            const result1 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedFirst.body.queuePositon}`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            const result2 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedSecond.body.queuePositon}`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            expect(result1.status).toBe(HttpStatus.OK);
            expect(result1.body).FullEqual(playedFirst.body);

            expect(result2.status).toBe(HttpStatus.OK);
            expect(result2.body).FullEqual(playedSecond.body);
            expect(result2.body).not.FullEqual(playedFirst.body);
        }, 10000);

        it('no such video', async () => {
            const playedFirst = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const result3 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedFirst.body.queuePositon + 1000}`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(result3.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe('getting next video', () => {
        it('normal case', async () => {
            //my  pc is not cool so it bugs with many operations and this add timeout
            await new Promise((resolve) => setTimeout(resolve, 4000));
            const video = await prepareVideo(1);
            const secondVideo = await prepareVideo(1);
            const third = await prepareVideo(1);
            await addVotes(video.body.id, random(60, 80));
            await addVotes(secondVideo.body.id, random(30, 60));
            await addVotes(third.body.id, random(10, 29));

            const playedFirst = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const playedSecond = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const playedThird = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });

            const result1 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedFirst.body.queuePositon}/next`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            const result2 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedSecond.body.queuePositon}/next`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            const result3 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedThird.body.queuePositon}/next`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            expect(result1.status).toBe(HttpStatus.OK);
            expect(result1.body).FullEqual(playedSecond.body);

            expect(result2.status).toBe(HttpStatus.OK);
            expect(result2.body).FullEqual(playedThird.body);
            expect(result2.body).not.FullEqual(playedSecond.body);

            expect(result3.status).toBe(HttpStatus.NOT_FOUND);

            const firstAviable = await makeRequest<AllowedVideoDto>({
                url: `/players/1/0/next`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(Object.keys(firstAviable.body).length).not.toBe(0);
        }, 7000);
    });

    describe('getting previous video', () => {
        it('normal case', async () => {
            //my  pc is not cool so it bugs with many operations
            await new Promise((resolve) => setTimeout(resolve, 6500));

            const [video, secondVideo, third] = await Promise.all([
                prepareVideo(1),
                prepareVideo(1),
                prepareVideo(1),
            ]);
            await Promise.all([
                addVotes(video.body.id, random(60, 80)),
                addVotes(secondVideo.body.id, random(30, 60)),
                addVotes(third.body.id, random(10, 29)),
            ]);

            const playedFirst = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const playedSecond = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });
            const playedThird = await makeRequest<AllowedVideoDto>({
                url: '/players/1/new',
                method: 'post',
                data: {},
                bearer: admin.access,
            });

            const result1 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedFirst.body.queuePositon}/previous`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            const result2 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedSecond.body.queuePositon}/previous`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            const result3 = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedThird.body.queuePositon}/previous`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });

            expect(result1.status).toBe(HttpStatus.OK);

            expect(result2.status).toBe(HttpStatus.OK);
            expect(result2.body).FullEqual(playedFirst.body);
            expect(result2.body).not.FullEqual(playedThird.body);

            expect(result3.status).toBe(HttpStatus.OK);
            expect(result3.body).FullEqual(playedSecond.body);
            expect(result3.body).not.FullEqual(playedThird.body);

            const lastest = await makeRequest<AllowedVideoDto>({
                url: `/players/1/${playedThird.body.queuePositon + 10000}/previous`,
                method: 'get',
                data: {},
                bearer: admin.access,
            });
            expect(lastest.body).FullEqual(playedThird.body);
        }, 8000);
    });

    afterAll(async () => {
        await DB_Client.end();
        await app.close();
    }, 6000);
});

function getRandomVideoId() {
    const codeLength = 11;
    const possibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-_';
    return Array.apply(null, Array(codeLength))
        .map(() => possibles.charAt(Math.floor(Math.random() * possibles.length)))
        .join('');
}

function random(min: number, max: number): number {
    return Math.floor(Math.random() * max + min);
}
