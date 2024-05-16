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
import { RangePipe } from '../common/pipes/range.pipe';
import { Priority } from './Models/priority.entity';

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
        @Query('take', ParseIntPipe, new RangePipe(1, 100)) take: number,
        @Query('skip', ParseIntPipe, PositivePipe) skip: number,
        @Query('namePattern') namePattern?: string,

    ) {
        if (!namePattern)
            return this.usersService.findAll(skip, take);
        else
            return this.usersService.findByName(namePattern, skip, take)
    }

    @Delete(':id')
    @Rights([[RightsEnum.BanUser], []])
    @UseGuards(RightsGuard)
    @ApiResponse({
        type: UserDto,
        description: 'Return deleted user if operation was done',
    })
    remove(@Param('id', ParseIntPipe, PositivePipe) id: number, @User() user: UserDto) {
        return this.usersService.remove(id, user);
    }

    @Get(':id')
    @Rights([[RightsEnum.BanUser], [RightsEnum.ChangePriority], [RightsEnum.ChangeRight]])
    @UseGuards(RightsGuard)
    @ApiResponse({
        description: 'Returns info about one user',
        type: UserDto,
    })
    async getInfo(@Param('id', ParseIntPipe, PositivePipe) id: number): Promise<UserDto> {
        const users = await this.usersService.find(undefined, { id }, ['priority', 'rights']);
        if (users[0]) return users[0].toDTO();
        else throw BaseError.NotFound('Няма такъв потребител');
    }

    @Post(':id/rights')
    @Rights([RightsEnum.ChangeRight])
    @UseGuards(RightsGuard)
    @ApiResponse({
        description: 'Adds right to user',
        type: Number,
    })
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
    @ApiResponse({
        description: 'Returns rights that user have after deleting',
        type: [Number],
    })
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
    @ApiResponse({
        description: 'Returns new priority',
        type: Priority,
    })
    changePriority(
        @Body() body: ChangePriorityDto,
        @Param('id', ParseIntPipe, PositivePipe) targetid: number,
        @User() user: UserDto,
    ) {
        return this.priorityService.setPriority(body.value, targetid, user);
    }
}
