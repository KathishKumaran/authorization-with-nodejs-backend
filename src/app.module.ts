import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/database';
import { SessionModule } from './modules/session/session.module';
import { UserModelModule } from './models/user/user.model';
import { UserModule } from './modules/user/user.module';


@Module({
  imports: [
    UserModule,
    PrismaModule,
    SessionModule,
    UserModelModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
  providers: [],
  controllers: []
})
export class AppModule {}
