import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, QueryFailedError, Repository } from 'typeorm';
import { PG_FOREIGN_KEY_VIOLATION } from '../common/const/db';
import BaseError from '../common/errors/BaseError.error';
import { UserDto } from '../users/dto/user.dto';
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

    async getForvote(max: number, user: UserDto): Promise<VideoDto[]> {
        const userVotes = this.votesRepository
            .createQueryBuilder('vote')
            .select(['"videoId"'])
            .where('vote.voterId = :userId');

        const allowedVideos = this.allowedVideosRepository
            .createQueryBuilder('allowedVideo')
            .select([
                'allowedVideo.id',
                'video.createdDate',
                'video.id',
                'video.link',
                'video.queueId',
            ])
            .where(
                'allowedVideo.queuePositon IS NULL AND ' +
                    `allowedVideo.id NOT IN (${userVotes.getSql()})`,
                { userId: user.id },
            )
            .leftJoin('allowedVideo.video', 'video')
            .orderBy('video.createdDate', 'ASC')
            .take(max);

        // console.log(allowedVideos.getSql());

        return allowedVideos
            .getMany()
            .then((result) => result.map((allowedVideo) => allowedVideo.video.toDTO()));
    }

    async suggest(createVideoDto: CreateVideoDto, suggester: UserDto): Promise<VideoDto> {
        const video = this.videosRepository.create({
            link: createVideoDto.videoLink,
            suggesterId: suggester.id,
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
        if (video.isAllowed === true || video.isAllowed === false) {
            throw BaseError.BadData('Някой друг вече модерира това видео');
        }

        video.isAllowed = true;
        const allowedVideo = this.allowedVideosRepository.create({
            video,
            allowerId: allower.id,
        });

        await getManager().transaction('READ UNCOMMITTED', async (entityManager) => {
            await entityManager.insert(AllowedVideo, allowedVideo);
            await entityManager.getRepository(Video).update({ id: video.id }, video);
        });

        return allowedVideo.toDto();
    }

    async disallow(videoId: number, disAllower: UserDto): Promise<{ deleted: boolean }> {
        const video = await this.videosRepository.findOne(videoId);

        if (!video) {
            throw BaseError.NotFound('Няма видео с това id');
        }

        if (video.isAllowed === false)
            throw BaseError.BadData('Някой друг вече модерира това видео');

        //null case
        if (video.isAllowed == null || video.isAllowed == undefined) {
            video.isAllowed = false;
            await this.videosRepository.update({ id: video.id }, video);
            return { deleted: true };
        }
        //If we are here video is allowed by someone
        const allowedVideo = await this.allowedVideosRepository.findOne({
            where: { video },
        });
        const lastAllower = (
            await this.usersService.find(
                ['id'],
                {
                    id: allowedVideo.allowerId,
                },
                ['priority'],
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
            await entityManager.getRepository(Video).update({ id: video.id }, video);
        });

        return { deleted: true };
    }

    async vote(videoId: number, voter: UserDto) {
        const [allowedVideo, vote] = await Promise.all([
            this.allowedVideosRepository
                .find({
                    where: { id: videoId },
                    relations: ['video'],
                })
                .then((result) => result[0]),
            this.votesRepository.findOne({
                where: {
                    videoId: videoId,
                    voterId: voter.id,
                },
            }),
        ]);

        if (!allowedVideo) throw BaseError.NotFound('Няма видео с това id');

        if (vote) throw BaseError.Duplicate('Вече гласувахте');

        const toDbVote = this.votesRepository.create({
            videoId: videoId,
            voterId: voter.id,
        });

        await getManager().transaction('READ UNCOMMITTED', async (entityManager) => {
            await entityManager.insert(Vote, toDbVote);
            await entityManager.getRepository(AllowedVideo).increment({ id: videoId }, 'votes', 1);
        });

        return toDbVote;
    }

    async getUnmoderated(max: number, skip: number): Promise<VideoDto[]> {
        return this.videosRepository.find({
            where: { isAllowed: null },
            take: max,
            skip,
            select: ['id', 'queueId', 'link'],
            order: { id: 'ASC' },
        });
    }

    async getMine(suggesterId: number, take: number, offset: number): Promise<VideoDto[]> {
        return this.videosRepository.find({
            where: { suggesterId },
            take,
            skip: offset,
            select: ['id', 'queueId', 'link', 'isAllowed'],
        });
    }
}
