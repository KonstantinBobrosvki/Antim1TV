import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateQueueDto {
    @ApiProperty({ examples: ['Main', "4'th floor"] })
    @IsNotEmpty()
    @MaxLength(30)
    name: string;
}
