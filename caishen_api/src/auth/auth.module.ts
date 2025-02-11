import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtStrategy } from './jwt.strategy';
import { Invite, InviteSchema } from './schemas/invite.schema';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      inject:[ConfigService],
      useFactory:(config: ConfigService)=>{
          return{
            secret: config.get<string>('JWT_SECRET'),
            signOptions:  {
              expiresIn: config.get<string | number>('JWT_EXPIRES'),
            },
          }
      }
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }])
],
  controllers: [AuthController],
  providers: [AuthService,jwtStrategy],
  exports: [jwtStrategy,PassportModule,AuthService],
})
export class AuthModule {}
