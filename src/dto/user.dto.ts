import { User } from '../../prisma/generated/client1';

export type UserInstance = User & {
  access_token?: string;
  Role: { name: string };
};
