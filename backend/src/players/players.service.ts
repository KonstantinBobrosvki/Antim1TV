import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import BaseError from '../common/errors/BaseError.error';
import { AllowedVideoDto } from '../videos/dto/allowedVideo.dto';

import { AllowedVideo } from '../videos/entities/allowedVideo.entity';
import { Video } from '../videos/entities/video.entity';
import { Vote } from '../videos/entities/vote.entity';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Video) private videosRepository: Repository<Video>,
        @InjectRepository(AllowedVideo)
        private allowedVideosRepository: Repository<AllowedVideo>,
        @InjectRepository(Vote)
        private votesRepository: Repository<Vote>,
    ) {}

    async getNewVideo(queuId: number): Promise<AllowedVideoDto> {
        const [nextVideo, { max: maxQueuePosition }] = await Promise.all([
            this.allowedVideosRepository
                .createQueryBuilder('allowedVideo')
                .select()
                .leftJoinAndSelect('allowedVideo.video', 'video')
                .where('allowedVideo.queuePositon IS NULL AND "video"."queueId" = :queuId', {
                    queuId,
                })
                .addSelect(
                    `("allowedVideo"."votes"+1)*(DATE_PART('hour',CURRENT_TIMESTAMP - "video"."createdDate")+1)`,
                    'Streght',
                )
                .orderBy('"Streght"', 'DESC')
                .getOne(),
            this.allowedVideosRepository
                .createQueryBuilder('allowedVideo')
                .select(`MAX("allowedVideo"."queuePositon") as "max"`)
                .getRawOne(),
        ]);
        if (!nextVideo) throw BaseError.NotFound('Няма нови видеа :(');

        nextVideo.queuePositon = maxQueuePosition + 1;
        await this.allowedVideosRepository.update(
            { id: nextVideo.id },
            { queuePositon: maxQueuePosition + 1 },
        );

        return nextVideo.toDto();
    }

    async getVideo(queuId: number, playPosition: number): Promise<AllowedVideoDto> {
        const allowedVideo = await this.allowedVideosRepository.findOne({
            select: ['id', 'queuePositon', 'video', 'votes'],
            relations: ['video'],
            where: {
                video: {
                    queueId: queuId,
                },
                queuePositon: playPosition,
            },
        });

        if (allowedVideo) return allowedVideo.toDto();
        throw BaseError.NotFound('Няма видео с тази позиция');
    }

    async getVideoAfter(queuId: number, playPosition: number): Promise<AllowedVideoDto> {
        const allowedVideo = await this.allowedVideosRepository.findOne({
            select: ['id', 'queuePositon', 'video', 'votes'],
            relations: ['video'],
            where: {
                video: {
                    queueId: queuId,
                },
                queuePositon: MoreThan(playPosition),
            },
            order: { queuePositon: 'ASC' },
        });

        if (allowedVideo) return allowedVideo.toDto();
        return this.getNewVideo(queuId);
    }

    async getVideoBefore(queuId: number, playPosition: number): Promise<AllowedVideoDto> {
        const allowedVideo = await this.allowedVideosRepository.findOne({
            select: ['id', 'queuePositon', 'video', 'votes'],
            relations: ['video'],
            where: {
                video: {
                    queueId: queuId,
                },
                queuePositon: LessThan(playPosition),
            },
            order: { queuePositon: 'DESC' },
        });

        if (allowedVideo) return allowedVideo.toDto();
        throw BaseError.NotFound('Няма видео преди това');
    }
}
