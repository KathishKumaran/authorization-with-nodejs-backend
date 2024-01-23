import { Injectable } from '@nestjs/common';

import axios from 'axios';
import {
  KEYCLOAK_APIS,
  PrismaService,
  kcAdminClient,
  MatrixDBPrismaService,
} from 'src/config';
import { UserInstance } from 'src/dto/user.dto';
import { UserCreateParams } from 'src/entities/user/user-request.entity';

import { generateHash } from 'src/config';
import { encryptPass } from 'src/config/encrypt-decrypt';
import { User } from 'prisma/generated/client1';

import { paginate, paginatorResult } from 'src/lib/paginator-result';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private matrixDb: MatrixDBPrismaService,
  ) {}

  async validateAccessToken(token: string) {
    const config = {
      method: 'GET',
      url: KEYCLOAK_APIS.validateToken,
      headers: {
        Authorization: token,
      },
    };
    const userInfo = await axios(config);
    console.log('userInfo ------', userInfo);

    return {
      kc_userId: userInfo.data.sub,
      name: userInfo.data.name,
      email: userInfo.data.email,
    };
  }

  async create(attrs: UserCreateParams, currentUser: UserInstance) {
    const currentTime = new Date();

    const hash = generateHash('12345678');
    const encryptedPassword = encryptPass('12345678', attrs.email);
    console.log('encryptedPass', encryptedPassword);

    // Create user in Keycloak
    const newUserInKeycloak = await kcAdminClient.users.create({
      email: attrs.email,
      enabled: true,
      username: attrs.email,
      lastName: attrs.last_name,
      firstName: attrs.first_name,
      attributes: {
        hashPass: encryptedPassword,
      },
    });

    // Create user in Telephony Application
    let telephonyApiResponse;
    try {
      // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      telephonyApiResponse = await axios.post(
        process.env.TELEPHONY_CREATE_USER_ENDPOINT,
        {
          name: attrs.first_name,
        },
        {
          headers: {
            Authorization: `${currentUser.access_token}`,
          },
        },
      );
    } catch (error) {
      // Rollback: Delete the newly created user from Keycloak
      await kcAdminClient.users.del({
        id: newUserInKeycloak.id,
      });

      throw new Error('Failed to create user in telephony application');
    }

    // Create Matrix user
    let matrixUser;
    try {
      const creationTs = new Date().getTime();
      matrixUser = await this.matrixDb.user.create({
        data: {
          name: `@${attrs.first_name}:matrix.yavar.ai`,
          password_hash: hash,
          admin: 1,
          creation_ts: creationTs,
          upgrade_ts: creationTs,
        },
      });
    } catch (error) {
      await kcAdminClient.users.del({
        id: newUserInKeycloak.id,
      });
      // await axios.delete(telephonyApiResponse.headers.location);
      await axios.delete(telephonyApiResponse.headers.location, {
        headers: {
          Authorization: `${currentUser.access_token}`,
        },
      });

      throw new Error('Failed to create user in Matrix database');
    }

    //Create user in PostgreSQL database
    let createdUserInDatabase;
    try {
      createdUserInDatabase = await this.prisma.$transaction(async (prisma) => {
        const userInDatabase = await prisma.user.create({
          data: {
            email: attrs.email,
            kc_user_id: newUserInKeycloak.id,
            role_id: attrs.role_id,
            created_at: currentTime,
            updated_at: currentTime,
            last_name: attrs.last_name,
            created_by: currentUser.id,
            first_name: attrs.first_name,
          },
        });
        return userInDatabase;
      });
    } catch (error) {
      // Rollback: Delete the newly created user from Keycloak and Telephony Application
      await kcAdminClient.users.del({
        id: newUserInKeycloak.id,
      });

      await this.matrixDb.user.delete({ where: { name: matrixUser.name } });

      // await axios.delete(telephonyApiResponse.headers.location);
      await axios.delete(telephonyApiResponse.headers.location, {
        headers: {
          Authorization: `${currentUser.access_token}`,
        },
      });

      throw new Error('Failed to create user in PostgreSQL database');
    }

    return {
      id: createdUserInDatabase.id,
      email: createdUserInDatabase.email,
      last_name: createdUserInDatabase.last_name,
      first_name: createdUserInDatabase.first_name,
      updated_at: createdUserInDatabase.updated_at,
      created_at: createdUserInDatabase.created_at,
    };
  }

  async filterAndPagination(user: User, query: any) {
    const page = Number(query.page);
    const perPage = Number(query.per_page);
    const pages = page && page > 0 ? page : 1;
    const perPages = perPage && perPage > 0 && perPage <= 10 ? perPage : 10;

    const skip = (pages - 1) * perPages;
    const take = perPages;

    const [users, count] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
      }),
      this.prisma.user.count({}),
    ]);

    const rowsAndCounts = {
      rows: users,
      count: count,
    };
    const result = paginate(rowsAndCounts, perPages, pages);
    return paginatorResult(result, 'users');
  }
}
