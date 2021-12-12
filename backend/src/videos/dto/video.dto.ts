import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @ApiProperty({ example: 1488 })
  id: number;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  link: string;

  @ApiProperty({ example: false })
  isAllowed?: boolean;

  @ApiProperty({ example: 5, description: 'On which screen should be played' })
  queueId: number;

  @ApiProperty({ description: 'suggest date' })
  createdDate: Date;
}
