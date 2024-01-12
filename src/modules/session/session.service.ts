import axios from 'axios';

import { User } from '../../../prisma/generated/client1';

import { PrismaService } from 'src/config';
import { KEYCLOAK_APIS, HTTP_CONTENT_TYPES } from 'src/config';
import { LoginParams } from 'src/entities';

import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { kcAdminClient } from 'src/config/keycloak.config';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  private async loginToKeyCloak(credentials: URLSearchParams) {
    try {
      const config = {
        url: KEYCLOAK_APIS.login,
        method: 'POST',
        headers: {
          'content-type': HTTP_CONTENT_TYPES.urlencoded,
        },
        data: credentials.toString(),
      };
      return await axios(config);
    } catch (error) {
      console.log('error is', error);
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async markSignIn(user: User, password: string, ipAddress: string) {
    const bodyParams = new URLSearchParams({
      password,
      scope: process.env.KC_SCOPE,
      username: user.email,
      client_id: process.env.KC_CLIENT_ID,
      grant_type: process.env.KC_GRANT_TYPE,
      client_secret: process.env.KC_CLIENT_SECRET,
    });
    console.log('bodyParams are', bodyParams);

    const { data } = await this.loginToKeyCloak(bodyParams);
    console.log('data --------------is', data);

    const userUpdateAttributes = {
      last_seen_at: new Date(),
      last_sign_in_at: new Date(),
      sign_in_count: user.sign_in_count + 1,
      last_sign_in_ip: ipAddress,
      current_sign_in_ip: ipAddress,
      current_sign_in_at: new Date(),
    };

    const userData = await this.prisma.user.update({
      data: userUpdateAttributes,
      where: { id: user.id },
      include: {
        Role: {
          select: {
            name: true,
          },
        },
      },
    });

    const keyCloakUser = await kcAdminClient.users.findOne({
      id: userData.kc_user_id,
    });

    return {
      userDetails: {
        id: userData.id,
        email: userData.email,
        role: userData.Role.name,
        last_name: userData.last_name,
        kc_user_id: userData.kc_user_id,
        first_name: userData.first_name,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        matrix_pass: keyCloakUser.attributes?.hashPass[0],
      },
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  }

  async getUserByEmail(userEmail: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: userEmail },
    });
    if (!user) throw new UnauthorizedException('User does not exist');
    return user;
  }

  async signin(signinAttrs: LoginParams, ipAddress: string) {
    const currentUser = await this.getUserByEmail(signinAttrs.username);
    console.log('currentUser is', currentUser);
    if (!currentUser.confirmed_at)
      throw new ForbiddenException(
        'Kindly accept the invitation sent to your email',
      );

    return await this.markSignIn(currentUser, signinAttrs.password, ipAddress);
  }

  private async logoutToKeycloak(credentials: URLSearchParams) {
    const config = {
      url: KEYCLOAK_APIS.logout,
      method: 'POST',
      headers: {
        'Content-Type': HTTP_CONTENT_TYPES.urlencoded,
      },
      data: credentials.toString(),
    };
    await axios(config);
  }

  async logout(refreshToken: string) {
    const bodyParams = new URLSearchParams({
      client_id: process.env.KC_CLIENT_ID,
      client_secret: process.env.KC_CLIENT_SECRET,
      refresh_token: refreshToken.split(' ')[1],
    });

    await this.logoutToKeycloak(bodyParams);
  }

  // private async validateRefreshToken(credentials: URLSearchParams) {
  //   try {
  //     const config = {
  //       method: 'POST',
  //       url: KEYCLOAK_APIS.login,
  //       headers: {
  //         'content-type': HTTP_CONTENT_TYPES.urlencoded,
  //       },
  //       data: credentials.toString(),
  //     };
  //     return await axios(config);
  //   } catch (error) {
  //     throw new BadRequestException('Refresh token has expired');
  //   }
  // }

  // async refreshAccessToken(refreshToken: string) {
  //   if (!refreshToken)
  //     throw new UnauthorizedException(
  //       'You need to sign-in to access this page',
  //     );
  //   const bodyParams = new URLSearchParams({
  //     scope: process.env.KC_SCOPE,
  //     client_id: process.env.KC_CLIENT_ID,
  //     grant_type: process.env.KC_REFRESH_TOKEN_GRANT_TYPE,
  //     refresh_token: refreshToken?.split(' ')?.[1],
  //     client_secret: process.env.KC_CLIENT_SECRET,
  //   });

  //   return await this.validateRefreshToken(bodyParams);
  // }
}
