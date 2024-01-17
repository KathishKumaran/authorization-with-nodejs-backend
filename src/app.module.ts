import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MatrixDBPrismaModule, PrismaModule } from './config';
import { SessionModule } from './modules/session/session.module';
import { UserModelModule } from './models/user/user.model';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MatrixDBPrismaModule,
    UserModule,
    SessionModule,
    UserModelModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
