import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';

import { HttpStatus, INestApplication } from '@nestjs/common';
import BaseError from '../src/common/errors/BaseError.error';
import {
    checkSignature,
    createUserFactory,
    getAdminUser,
    requestFactory,
    UserResponse,
} from './helpers';
import { VideoDto } from '../src/videos/dto/video.dto';

describe('Users module e2e', () => {
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
            expect(true).toBeTruthy();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
