import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Rights } from '../auth/decorators/Rights.decorator';
import { RightsEnum } from '../users/Models/Enums/rights.enum';
import { User } from '../auth/decorators/user.decorator';
import { UserDto } from '../users/dto/user.dto';
import { RightsGuard } from '../auth/guards/rights.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VideoDto } from './dto/video.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Videos')
@UseGuards(AuthGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @Rights([RightsEnum.Suggest])
  @UseGuards(RightsGuard)
  @ApiResponse({
    type: VideoDto,
  })
  create(@Body() createVideoDto: CreateVideoDto, @User() user: UserDto) {
    return this.videosService.suggest(createVideoDto, user);
  }

  @Get()
  @Rights([RightsEnum.Suggest])
  @UseGuards(RightsGuard)
  @ApiResponse({
    description: 'Videos which should be reviewed',
    type: [VideoDto],
  })
  getForVoting() {
    return this.videosService.getForvote(30);
  }

  @Put('/:id/allow')
  @Rights([RightsEnum.AllowVideo])
  @UseGuards(RightsGuard)
  @ApiResponse({
    type: VideoDto,
  })
  async allow(@Param('id', ParseIntPipe) id: number, @User() user: UserDto) {
    return await this.videosService.Allow(id, user);
  }

  @Put('/:id/disallow')
  @Rights([RightsEnum.AllowVideo])
  @UseGuards(RightsGuard)
  @ApiResponse({
    type: VideoDto,
  })
  async disallow(@Param('id', ParseIntPipe) id: number, @User() user: UserDto) {
    return await this.videosService.disallow(id, user);
  }

  @Put('/allowed/:id/vote')
  @ApiResponse({
    description: 'returns created vote if operation was sucsedd',
  })
  async vote(@Param('id', ParseIntPipe) id: number, @User() user: UserDto) {
    return await this.videosService.vote(id, user);
  }
}
