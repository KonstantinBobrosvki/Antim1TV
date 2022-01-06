import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, QueryFailedError, Repository } from 'typeorm';
import { PG_FOREIGN_KEY_VIOLATION } from '../common/const/db';
import BaseError from '../common/errors/BaseError.error';
import { UserDto } from '../users/dto/user.dto';
import { User } from '../users/Models/user.entity';
import { UsersService } from '../users/services/users.service';

import { CreateVideoDto } from './dto/create-video.dto';
import { VideoDto } from './dto/video.dto';
import { AllowedVideo } from './entities/allowedVideo.entity';
import { Video } from './entities/video.entity';
import { Vote } from './entities/vote.entity';

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video) private videosRepository: Repository<Video>,
        @InjectRepository(AllowedVideo)
        private allowedVideosRepository: Repository<AllowedVideo>,
        @InjectRepository(Vote)
        private votesRepository: Repository<Vote>,
        private usersService: UsersService,
    ) {}

    async getForvote(max: number): Promise<VideoDto[]> {
        const videos = await this.videosRepository.find({
            select: ['id', 'link', 'queue'],
            where: {
                isAllowed: null,
            },
            take: max,
        });
        return videos.map((video) => video.toDTO());
    }

    async suggest(createVideoDto: CreateVideoDto, suggester: UserDto) {
        const video = this.videosRepository.create({
            link: createVideoDto.videoLink,
            suggester: suggester as unknown as User,
            queue: { id: createVideoDto.queueId },
        });
        try {
            await this.videosRepository.insert(video);

            return video.toDTO();
        } catch (error) {
            if (error instanceof QueryFailedError) {
                if (error.driverError.code === PG_FOREIGN_KEY_VIOLATION) {
                    throw BaseError.NotFound('Няма такъв телевизор');
                }
            }
            throw error;
        }
    }

    async Allow(videoId: number, allower: UserDto) {
        const video = await this.videosRepository.findOne(videoId);

        if (!video) {
            throw BaseError.NotFound('Няма видео с това id');
        }
        if (video.isAllowed !== null) {
            throw BaseError.BadData('Някой друг вече модерира това видео');
        }

        video.isAllowed = true;
        const allowedVideo = this.allowedVideosRepository.create({
            video,
            allowerId: allower.id,
        });
        await getManager().transaction('READ UNCOMMITTED', async (entityManager) => {
            await entityManager.save(allowedVideo);
            await entityManager.save(video);
        });

        return allowedVideo;
    }

    async disallow(videoId: number, disAllower: UserDto): Promise<boolean> {
        const video = await this.videosRepository.findOne(videoId);

        if (!video) {
            throw BaseError.NotFound('Няма видео с това id');
        }

        if (video.isAllowed === false)
            throw BaseError.BadData('Някой друг вече модерира това видео');

        if (video.isAllowed === null) {
            video.isAllowed = false;
            await this.videosRepository.save(video);
            return true;
        }
        //If we are here video is allowed by someone
        const allowedVideo = await this.allowedVideosRepository.findOne({
            where: { video },
        });
        const lastAllower = (
            await this.usersService.find(
                {
                    id: allowedVideo.allowerId,
                },
                ['rights'],
            )
        )[0];

        //if that dude has more priority than us
        if (
            lastAllower?.priority?.value &&
            lastAllower.priority.value > disAllower.priority &&
            lastAllower.id !== disAllower.id
        ) {
            throw BaseError.Forbidden('Видеото е позволено от човек с по-висок приоритет');
        }

        await getManager().transaction('READ UNCOMMITTED', async (entityManager) => {
            video.isAllowed = false;
            await entityManager.getRepository<AllowedVideo>(AllowedVideo).delete(allowedVideo);
            await entityManager.save(video);
        });

        return true;
    }

    async vote(allowedVideoId: number, voter: UserDto) {
        const [allowedVideo, vote] = await Promise.all([
            this.allowedVideosRepository.findOne({ id: allowedVideoId }),
            this.votesRepository.findOne({
                where: {
                    videoId: allowedVideoId,
                    voterId: voter.id,
                },
            }),
        ]);

        if (!allowedVideo) throw BaseError.NotFound('Няма видео с това id');

        if (vote) throw BaseError.Duplicate('Вече гласувахте');

        const toDbVote = this.votesRepository.create({
            videoId: allowedVideoId,
            voterId: voter.id,
        });

        await getManager().transaction('READ UNCOMMITTED', async (entityManager) => {
            await entityManager.save(toDbVote);
            await entityManager.getRepository(AllowedVideo).increment(allowedVideo, 'votes', 1);
        });

        return toDbVote;
    }
}
