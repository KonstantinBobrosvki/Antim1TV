import { ApiProperty } from '@nestjs/swagger';
import { RightsEnum } from '../Models/Enums/rights.enum';

export class UserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'username' })
  username: string;

  @ApiProperty({ example: 'email@yandex.ru' })
  email: string;

  @ApiProperty({ example: [2, 128, 64] })
  rights: RightsEnum[];

  @ApiProperty({ example: 4 })
  priority: number;
}
