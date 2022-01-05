import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';

import { HttpStatus, INestApplication } from '@nestjs/common';
import BaseError from '../src/common/errors/BaseError.error';
import { createUserFactory, requestFactory } from './helpers';

describe('Videos module e2e', () => {
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

    describe('Suggesting', () => {
        it('suggest', async () => expect(true).toBeTruthy());
    });

    afterAll(async () => {
        await app.close();
    });
});
