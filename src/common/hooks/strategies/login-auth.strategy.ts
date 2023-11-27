import axios from 'axios';

import { AxiosError } from 'axios';
import { FastifyRequest } from 'fastify';

import { PrismaService } from 'src/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KEYCLOAK_APIS } from 'src/config/constants';

@Injectable()
export class UserAuthStrategy {
  constructor(private prisma: PrismaService) {}
  async validate(req: FastifyRequest) {
    try {
      const accessToken = req.headers['authorization'];
      if (!accessToken)
        throw new UnauthorizedException(
          'You need to sign in to access this page'
        );

      const { data } = await this.validateAccessToken(accessToken);
      const currentUser = await this.prisma.user.findFirst({
        where: {
          kc_user_id: data.sub
        },
        include: { Role: { select: { name: true } } }
      });
      if (!currentUser)
        throw new UnauthorizedException('Invalid Email or Password');
      req["user"] = {
        ...currentUser,
        access_token: accessToken
      };
      return true;
    } catch (error) {
      if (error instanceof AxiosError)
        throw new UnauthorizedException('Session has expired');
      throw error;
    }
  }

  async validateAccessToken(token: string) {
    const config = {
      method: 'GET',
      url: KEYCLOAK_APIS.validateToken,
      headers: {
        Authorization: token
      }
    };
    const a=await axios(config);
    return await axios(config);
  }
}
