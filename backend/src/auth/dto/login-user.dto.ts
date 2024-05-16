import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength, MaxLength, ValidateIf } from 'class-validator';
export class LoginUserDto {
    @ValidateIf((o) => !o.email)
    @MinLength(5)
    @MaxLength(30)
    @ApiProperty({ example: 'username' })
    username: string;

    @ValidateIf((o) => !o.username)
    @IsEmail()
    @Matches(/.*@(abv\.bg|gmail\.com|yandex\.ru)$/i, {
        message: 'Пощата трябва да е abv.bg, gmail.com или yandex.ru',
    })
    @MaxLength(72)
    @ApiProperty({
        example: 'email@gmail.com',
        description: 'email from domain gmail.com or yandex.ru or abv.bg',
    })
    email: string;

    @MinLength(6)
    @MaxLength(64)
    @IsNotEmpty()
    @ApiProperty({ example: 'CoolPassword!123' })
    password: string;
}
