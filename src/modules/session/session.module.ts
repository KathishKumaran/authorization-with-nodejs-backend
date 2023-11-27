import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
@Module({
  imports: [PrismaModule],
  providers: [SessionService],
  controllers: [SessionController]
})
export class SessionModule {}
