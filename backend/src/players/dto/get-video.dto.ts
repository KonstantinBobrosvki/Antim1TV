import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, Min, ValidateIf } from 'class-validator';

export class GetVideoDto {
  @ValidateIf((dto: GetVideoDto) => dto.next != dto.previous)
  @Min(0)
  @ApiProperty({
    description: 'Current allowed video id',
    example: 54,
  })
  current: number;

  @ValidateIf((dto: GetVideoDto) => !dto.previous)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Should it load next video (maybe new, maybe not)',
    example: true,
  })
  next?: boolean;

  @ValidateIf((dto: GetVideoDto) => !dto.next)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Should it previous next video (maybe new, maybe not)',
    example: true,
  })
  previous?: boolean;
}
