import axios from 'axios';

import { AxiosError } from 'axios';
import { UserInstance } from 'src/dto/user.dto';
import { ServerResponse } from 'http';
import { FastifyRequest } from 'fastify';

import { PrismaService, HTTP_CONTENT_TYPES, KEYCLOAK_APIS } from 'src/config';

import {
  HttpStatus,
  Injectable,
  HttpException,
  NestMiddleware,
  UnauthorizedException
} from '@nestjs/common';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserInstance;
  }
  interface FastifyReply {
    sse: (obj: any) => void;
  }
}

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}
  use(req: FastifyRequest, reply: ServerResponse, next: (error?: any) => void) {
    const accessToken = req.headers?.authorization as string;

    if (!accessToken) {
      reply.writeHead(HttpStatus.UNAUTHORIZED, {
        'content-type': HTTP_CONTENT_TYPES.json
      });
      reply.end(
        JSON.stringify({ message: 'You need to sign-in to access this page' })
      );
    }

    this.validateAccessToken(accessToken)
      .then(async ({ data }) => {
        const currentUser = await this.prisma.user.findFirst({
          where: {
            kc_user_id: data.sub
          },
          include: { Role: { select: { name: true } } }
        });
        if (!currentUser)
          throw new UnauthorizedException('Invalid Email or Password');
        req.user = {
          ...currentUser,
          access_token: accessToken
        };
        next();
      })
      .catch(async (err) => {
        if (err instanceof AxiosError) {
          reply.writeHead(HttpStatus.UNAUTHORIZED, {
            'content-type': HTTP_CONTENT_TYPES.json
          });
          reply.end(JSON.stringify({ errors: ['Session has expired'] }));
        }
        if (err instanceof HttpException) {
          reply.writeHead(err.getStatus(), {
            'content-type': HTTP_CONTENT_TYPES.json
          });
          reply.end(JSON.stringify({ errors: err.message }));
        }
      });
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
