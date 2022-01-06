import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';

import { HttpStatus, INestApplication } from '@nestjs/common';
import BaseError from '../src/common/errors/BaseError.error';
import {
    checkSignature,
    createUserFactory,
    generateUser,
    getAdminUser,
    requestFactory,
    UserResponse,
} from './helpers';

describe('Videos module e2e', () => {
    let app: INestApplication;
    let createUser: ReturnType<typeof createUserFactory>;
    let makeRequest: ReturnType<typeof requestFactory>;
    let admin: UserResponse;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        createUser = createUserFactory(app.getHttpServer());
        makeRequest = requestFactory(app.getHttpServer());

        admin = await getAdminUser(app.getHttpServer());
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

            expect(BaseError.NotFound().Equal(res.status)).toBeTruthy();
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

            expect(
                checkSignature(
                    class {
                        id = 2;
                        link = 'f';
                        queueId = 1;
                        createdDate = 'f';
                    },
                    res.body,
                ),
            ).toBeTruthy();
        });
    });
    //TODO: FINISH AFTER finishing user rights logic
    describe('allowing', () => {
        it('bad input', () => {});
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
