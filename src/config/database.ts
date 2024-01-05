import { MODEL } from './constants';
import { PrismaClient as PrismaClient1 } from '../../prisma/generated/client1';
import { ConfigService } from '@nestjs/config';

import { UserModel, UserModelModule } from 'src/models/user/user.model';

import {
  Global,
  Inject,
  Module,
  forwardRef,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient1
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    config: ConfigService,
    @Inject(forwardRef(() => UserModel)) private userModel: UserModel,
  ) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.main();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async main() {
    this.$use(async (params, next) => {
      if (params.model === 'User') {
        if (params.action === 'create') {
          try {
            await this.userModel.user.validateAsync(params.args?.data, {
              errors: {
                label: false,
              },
            });
          } catch (err) {
            throw new UnprocessableEntityException(err);
          }
        }
        if (params.action === 'update') {
          try {
            await this.userModel.user.validateAsync(params.args?.data, {
              externals: false,
            });
          } catch (err) {
            throw new UnprocessableEntityException(err);
          }
        }
      }

      if (MODEL.includes(params.model)) {
        if (params.action == 'delete') {
          params.action = 'update';
          params.args['data'] = { deleted_at: new Date() };
        }
        if (params.action == 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data != undefined) {
            params.args['data'] = { deleted_at: new Date() };
          } else {
            params.args['data'] = { deleted_at: new Date() };
          }
        }
        if (params.action === 'findUnique' || params.action === 'findFirst') {
          params.action = 'findFirst';
          params.args.where['deleted_at'] = null;
        }
        if (params.action === 'aggregate') {
          if (params.args.where) {
            if (params.args.where.deleted == undefined) {
              params.args.where['deleted_at'] = null;
            }
          } else {
            params.args['where'] = { deleted_at: null };
          }
        }
        if (params.action === 'findMany') {
          if (params.args.where) {
            if (params.args.where.deleted == undefined) {
              params.args.where['deleted_at'] = null;
            }
          } else {
            params.args['where'] = { deleted_at: null };
          }
        }
        if (params.action === 'count') {
          params.args['where'] = { deleted_at: null };
        }
      }
      return next(params);
    });
  }
}

@Global()
@Module({
  imports: [forwardRef(() => UserModelModule)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
