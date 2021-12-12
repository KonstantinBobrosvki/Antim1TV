import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { AllowedVideoDto } from '../videos/dto/allowedVideo.dto';
import { VideoDto } from '../videos/dto/video.dto';
import { AllowedVideo } from '../videos/entities/allowedVideo.entity';
import { Video } from '../videos/entities/video.entity';
import { Vote } from '../videos/entities/vote.entity';
import { GetVideoDto } from './dto/get-video.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Video) private videosRepository: Repository<Video>,
    @InjectRepository(AllowedVideo)
    private allowedVideosRepository: Repository<AllowedVideo>,
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async getVideo(
    queuId: number,
    getVideoDto: GetVideoDto,
  ): Promise<AllowedVideoDto> {
    const allowedVideo = await this.allowedVideosRepository.findOne({
      select: ['id', 'queuePositon', 'video', 'votes'],
      relations: ['video'],
      where: {
        video: {
          queueId: queuId,
        },
        queuePositon: getVideoDto.next
          ? MoreThan(getVideoDto.current)
          : LessThan(getVideoDto.current),
      },
    });

    if (allowedVideo) return allowedVideo.toDto();

    if (getVideoDto.previous)
      throw new HttpException('Няма видеа преди това', HttpStatus.NOT_FOUND);

    //So we need new video

    const [nextVideo, { max: maxQueuePosition }] = await Promise.all([
      this.allowedVideosRepository
        .createQueryBuilder('allowedVideo')
        .select()
        .leftJoinAndSelect('allowedVideo.video', 'video')
        .where('allowedVideo.queuePositon IS NULL')
        .addSelect(
          `("allowedVideo"."votes"+1)*sqrt(DATE_PART('hour',CURRENT_TIMESTAMP - "video"."createdDate"))`,
          'Streght',
        )
        .orderBy('"Streght"', 'DESC')
        .getOne(),
      this.allowedVideosRepository
        .createQueryBuilder('allowedVideo')
        .select(`MAX("allowedVideo"."queuePositon") as "max"`)
        .getRawOne(),
    ]);

    nextVideo.queuePositon = maxQueuePosition + 1;
    await this.allowedVideosRepository.save(nextVideo);

    return nextVideo.toDto();
  }
}
