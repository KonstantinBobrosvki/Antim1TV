
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';
export class CreateUserDto {

    @MinLength(5)
    @MaxLength(30)
    @IsNotEmpty()
    @ApiProperty({example:'username'})
    username: string;

    @IsEmail()
    @Matches(/.*@(abv\.bg|gmail\.com|yandex\.ru)$/)
    @MaxLength(72)
    @ApiProperty({example:'email@gmail.com',description:'email from domain gmail.com or yandex.ru or abv.bg'})
    email: string;

    @MinLength(6)
    @MaxLength(64)
    @IsNotEmpty()
    @ApiProperty({example:'CoolPassword!123'})
    password: string;
}
