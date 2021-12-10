import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

//needed because i use it in app module too (readjwtmiddleware)
const jwtModule = JwtModule.register({
  secret: process.env.SECRET_ACCSESS + '',
});

@Module({
  imports: [UsersModule, jwtModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [jwtModule],
})
export class AuthModule {}
