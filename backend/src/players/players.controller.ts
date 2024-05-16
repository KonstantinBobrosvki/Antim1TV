import { Controller, Param, ParseIntPipe, Get, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Rights } from '../auth/decorators/Rights.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RightsGuard } from '../auth/guards/rights.guard';
import { PositivePipe } from '../common/pipes/positive.pipe';
import { RightsEnum } from '../users/Models/Enums/rights.enum';
import { AllowedVideoDto } from '../videos/dto/allowedVideo.dto';
import { PlayersService } from './players.service';

@Controller('players')
@UseGuards(AuthGuard)
@ApiTags('Players')
export class PlayersController {
    constructor(private readonly playersService: PlayersService) {}

    @Get('/:queueId/:playPosition/next')
    @ApiResponse({
        type: AllowedVideoDto,
        description: 'Returns first video with played position greater then given in params',
    })
    async GetNextVideo(
        @Param('queueId', ParseIntPipe, PositivePipe) queueId: number,
        @Param('playPosition', ParseIntPipe, PositivePipe) playPosition: number,
    ): Promise<AllowedVideoDto> {
        return this.playersService.getVideoAfter(queueId, playPosition);
    }

    @Get('/:queueId/:playPosition/previous')
    @ApiResponse({
        type: AllowedVideoDto,
        description: 'Returns first video with played position less then given in params',
    })
    async GetPreviousVideo(
        @Param('queueId', ParseIntPipe, PositivePipe) queueId: number,
        @Param('playPosition', ParseIntPipe, PositivePipe) playPosition: number,
    ): Promise<AllowedVideoDto> {
        return this.playersService.getVideoBefore(queueId, playPosition);
    }

    @Get('/:queueId/:playPosition')
    @ApiResponse({
        type: AllowedVideoDto,
        description: 'Returns video that with played position',
    })
    async GetVideo(
        @Param('queueId', ParseIntPipe, PositivePipe) queueId: number,
        @Param('playPosition', ParseIntPipe, PositivePipe) playPosition: number,
    ): Promise<AllowedVideoDto> {
        return this.playersService.getVideo(queueId, playPosition);
    }

    @Post('/:queueId/new')
    @Rights([RightsEnum.ControllPlayer])
    @UseGuards(RightsGuard)
    @ApiResponse({
        type: AllowedVideoDto,
        description: 'Returns video that should be runned next',
    })
    async GetNewVideo(@Param('queueId', ParseIntPipe) queueId: number): Promise<AllowedVideoDto> {
        return this.playersService.getNewVideo(queueId);
    }
}
