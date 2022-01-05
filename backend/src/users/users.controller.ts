import { Controller, Get, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './services/users.service';

import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Rights } from '../auth/decorators/Rights.decorator';
import { RightsEnum } from './Models/Enums/rights.enum';
import { RightsGuard } from '../auth/guards/rights.guard';
import { User } from '../auth/decorators/user.decorator';
import { UserDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Rights([[RightsEnum.BanUser], [RightsEnum.ChangePriority], [RightsEnum.ChangeRight]])
    @UseGuards(RightsGuard)
    @ApiResponse({
        description: 'List of users',
        type: UserDto,
    })
    findAll() {
        return this.usersService.findAll();
    }

    @Delete(':id')
    @Rights([[RightsEnum.BanUser], []])
    @UseGuards(RightsGuard)
    remove(@Param('id', ParseIntPipe) id: number, @User() user: UserDto) {
        return this.usersService.remove(id, user);
    }
}
