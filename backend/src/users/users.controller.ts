import {
    Controller,
    Get,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Body,
    Query,
    Post,
    Put,
} from '@nestjs/common';
import { UsersService } from './services/users.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Rights } from '../auth/decorators/Rights.decorator';
import { RightsEnum } from './Models/Enums/rights.enum';
import { RightsGuard } from '../auth/guards/rights.guard';
import { User } from '../auth/decorators/user.decorator';
import { UserDto } from './dto/user.dto';
import { PositivePipe } from '../common/pipes/positive.pipe';
import { ChangeRightDto } from './dto/changeRight.dto';
import { RightsService } from './services/rights.service';
import { PriorityService } from './services/priority.service';
import { ChangePriorityDto } from './dto/changePriority.dto';
import BaseError from '../common/errors/BaseError.error';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly rightsService: RightsService,
        private readonly priorityService: PriorityService,
    ) { }

    @Get()
    @Rights([[RightsEnum.BanUser], [RightsEnum.ChangePriority], [RightsEnum.ChangeRight]])
    @UseGuards(RightsGuard)
    @ApiResponse({
        description: 'List of users',
        type: [UserDto],
    })
    findAll(
        @Query('take', ParseIntPipe, PositivePipe) take: number,
        @Query('skip', ParseIntPipe) skip: number,
    ) {
        return this.usersService.findAll(take, skip);
    }

    @Delete(':id')
    @Rights([[RightsEnum.BanUser], []])
    @UseGuards(RightsGuard)
    remove(@Param('id', ParseIntPipe, PositivePipe) id: number, @User() user: UserDto) {
        return this.usersService.remove(id, user);
    }

    @Get(':id')
    @Rights([[RightsEnum.BanUser], [RightsEnum.ChangePriority], [RightsEnum.ChangeRight]])
    @UseGuards(RightsGuard)
    async getInfo(@Param('id', ParseIntPipe, PositivePipe) id: number): Promise<UserDto> {
        const users = await this.usersService.find(undefined, { id }, ['priority', 'rights']);
        if (users[0])
            return users[0].toDTO();
        else
            throw BaseError.NotFound('Няма такъв потребител')
    }

    @Post(':id/rights')
    @Rights([RightsEnum.ChangeRight])
    @UseGuards(RightsGuard)
    async addRight(
        @Body() body: ChangeRightDto,
        @Param('id', ParseIntPipe, PositivePipe) targetid: number,
        @User() user: UserDto,
    ) {
        const res = await this.rightsService.GiveRight(body.right, targetid, user);
        return { right: res };
    }

    @Delete(':id/rights')
    @Rights([RightsEnum.ChangeRight])
    @UseGuards(RightsGuard)
    deleteRight(
        @Body() body: ChangeRightDto,
        @Param('id', ParseIntPipe, PositivePipe) targetid: number,
        @User() user: UserDto,
    ) {
        return this.rightsService.RemoveRight(body.right, targetid, user);
    }

    @Put(':id/priority')
    @Rights([RightsEnum.ChangePriority])
    @UseGuards(RightsGuard)
    changePriority(
        @Body() body: ChangePriorityDto,
        @Param('id', ParseIntPipe, PositivePipe) targetid: number,
        @User() user: UserDto,
    ) {
        return this.priorityService.setPriority(body.value, targetid, user);
    }
}
