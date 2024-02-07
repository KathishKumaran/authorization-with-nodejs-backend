import * as Joi from 'joi';

import { PrismaModule, PrismaService } from '../../config';

import { Module, Inject, forwardRef, ConflictException } from '@nestjs/common';

export class UserModel {
  constructor(
    @Inject(forwardRef(() => PrismaService)) private prisma: PrismaService,
  ) {}

  isEmailUnique = async (value: string) => {
    const userEmail = await this.prisma.user.findFirst({
      where: { email: value },
      select: { email: true },
    });
    if (userEmail) throw new ConflictException('Email already exists');
  };

  getRoleById = async (id: number) => {
    const role = await this.prisma.role.findUnique({ where: { id: id } });
    if (!role) throw new Error('Role not found');
  };

  user = Joi.object({
    first_name: Joi.string()
      .pattern(new RegExp(/^([a-zA-Z 0-9_]){1,100}$/))
      .error(new Error('First name should be in alphabet format')),

    last_name: Joi.string()
      .pattern(new RegExp(/^([a-zA-Z 0-9_]){1,100}$/))
      .error(new Error('Last name should be in alphabet format')),

    email: Joi.string()
      .min(1)
      .max(100)
      .empty()
      .external(this.isEmailUnique)
      .error(new Error('Email should be valid format')),

    role_id: Joi.number().external(this.getRoleById),

    kc_user_id: Joi.string(),

    matrix_name: Joi.string(),

    confirmed_at: Joi.date(),

    created_at: Joi.date(),

    deleted_at: Joi.date(),

    updated_at: Joi.date(),

    user_name: Joi.string(),

    last_seen_at: Joi.date(),

    last_sign_in_at: Joi.date(),

    last_sign_in_ip: Joi.string(),

    current_sign_in_at: Joi.date(),

    current_sign_in_ip: Joi.string(),

    created_by: Joi.number().prefs({ convert: false }),

    updated_by: Joi.number().prefs({ convert: false }),

    sign_in_count: Joi.number().prefs({ convert: false }),
  });
}

@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [UserModel],
  exports: [UserModel],
})
export class UserModelModule {}
