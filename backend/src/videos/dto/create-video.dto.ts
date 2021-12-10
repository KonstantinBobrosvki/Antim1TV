import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Matches } from 'class-validator';
export class CreateVideoDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  @Matches(
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
  )
  @IsNotEmpty()
  videoLink: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  queueId: number;
}
