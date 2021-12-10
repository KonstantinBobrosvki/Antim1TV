import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDto } from '../users/dto/user.dto';
import { RightsEnum } from '../users/Models/Enums/rights.enum';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: UserDto,
  })
  async Register(@Body() createUserDto: CreateUserDto) {
    const userDto = await this.authService.register(createUserDto);

    //Temporary while there is no refresh token 36 hours or 5 years
    const expiresIn = userDto.rights.includes(RightsEnum.ControllPlayer)
      ? 129600000
      : 157784760000;
    const token = this.jwtService.sign({ ...userDto }, { expiresIn });

    return { user: userDto, accees: token };
  }

  @Post('login')
  @ApiCreatedResponse({
    description: 'The user has been successfully entered.',
    type: UserDto,
  })
  async Login(@Body() loginUserDto: LoginUserDto) {
    const userDto = await this.authService.login(loginUserDto);

    //Temporary while there is no refresh token 36 hours or 5 years
    const expiresIn = userDto.rights.includes(RightsEnum.ControllPlayer)
      ? 129600000
      : 157784760000;
    const token = this.jwtService.sign({ ...userDto }, { expiresIn });

    return { user: userDto, accees: token };
  }
}
