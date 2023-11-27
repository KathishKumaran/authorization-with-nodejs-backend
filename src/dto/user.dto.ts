import { User } from '@prisma/client';

export type UserInstance = User & {
  access_token?: string;
  Role: { name: string };
};
