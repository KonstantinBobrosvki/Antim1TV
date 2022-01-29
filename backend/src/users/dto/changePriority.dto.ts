import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class ChangePriorityDto {
    @ApiProperty({ example: 13, description: 'what value are u trying to set' })
    @IsPositive()
    @IsInt()
    value: number;
}
