import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { KEYCLOAK_APIS, PrismaService } from 'src/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
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

    return {
      kc_userId: userInfo.data.sub,
      name: userInfo.data.name,
      email: userInfo.data.email,
    };
  }
}
