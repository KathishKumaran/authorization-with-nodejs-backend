import { MODEL } from './constants';
import { PrismaClient as PrismaClient2 } from '../../prisma/generated/client2';
import { ConfigService } from '@nestjs/config';

import {
  Global,
  Module,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

@Injectable()
export class MatrixDBPrismaService
  extends PrismaClient2
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('SYNAPSE_DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Global()
@Module({
  imports: [],
  providers: [MatrixDBPrismaService],
  exports: [MatrixDBPrismaService],
})
export class MatrixDBPrismaModule {}
