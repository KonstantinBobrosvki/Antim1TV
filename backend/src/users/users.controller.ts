import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Rights } from '../auth/decorators/Rights.decorator';
import { RightsEnum } from './Models/Enums/rights.enum';
import { RightsGuard } from '../auth/guards/rights.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Rights([[RightsEnum.BanUser], [RightsEnum.ChangePriority], [RightsEnum.ChangeRight]])
  @UseGuards(RightsGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @Rights([[RightsEnum.BanUser], []])
  @UseGuards(RightsGuard)
  remove(@Param('id') id: string, @User() user) {
    return this.usersService.remove(+id, user);
  }
}
