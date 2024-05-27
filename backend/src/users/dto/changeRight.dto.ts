import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RightsEnum } from '../entities/Enums/rights.enum';

export class ChangeRightDto {
    @ApiProperty({ example: 2, description: 'right enum value' })
    @IsEnum(RightsEnum)
    right: RightsEnum;
}
