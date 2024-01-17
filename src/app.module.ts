import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/database';
import { SessionModule } from './modules/session/session.module';
import { UserModelModule } from './models/user/user.model';
import { UserModule } from './modules/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [
    UserModule,
    PrismaModule,
    SessionModule,
    UserModelModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true })
  ],
  providers: [],
  controllers: []
})
export class AppModule {}
