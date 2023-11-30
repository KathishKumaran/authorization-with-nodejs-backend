import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { KEYCLOAK_APIS, PrismaService, kcAdminClient } from 'src/config';
import { UserInstance } from 'src/dto/user.dto';
import { UserCreateParams } from 'src/entities/user/user-request.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async validateAccessToken(token: string) {
    const config = {
      method: 'GET',
      url: KEYCLOAK_APIS.validateToken,
      headers: {
        Authorization: token,
      },
    };
    const userInfo = await axios(config);

    return {
      kc_userId: userInfo.data.sub,
      name: userInfo.data.name,
      email: userInfo.data.email,
    };
  }

  async create(attrs: UserCreateParams, currentUser: UserInstance) {
    const currentTime = new Date();

    // Create user in Keycloak
    const newUserInKeycloak = await kcAdminClient.users.create({
      email: attrs.email,
      enabled: true,
      username: attrs.email,
      lastName: attrs.last_name,
      firstName: attrs.first_name,
    });

    // Create user in Telephony Application
    let telephonyApiResponse;
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      telephonyApiResponse = await axios.post(
        process.env.TELEPHONY_CREATE_USER_ENDPOINT,
        {
          name: attrs.first_name,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.access_token}`,
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
      await axios.delete(telephonyApiResponse.headers.location);

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
}