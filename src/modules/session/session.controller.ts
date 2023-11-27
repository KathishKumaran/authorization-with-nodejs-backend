import { Public } from 'src/common/decorators';
import { SessionService } from './session.service';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  errorOpts,
  loginOpts,
  headerOpts,
  LoginParams,
  logoutOpts,
} from 'src/entities';

import {
  Req,
  Res,
  Post,
  Body,
  Delete,
  Header,
  Controller,
  HttpStatus
} from '@nestjs/common';

import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiHeaders,
} from '@nestjs/swagger';

@ApiTags('sessions')
@ApiInternalServerErrorResponse({
  description: 'Something went wrong',
  schema: errorOpts
})
@Controller()
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Public()
  @Post('login')
  @ApiOkResponse({
    description: 'Successfully logged in',
    schema: loginOpts
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
    schema: errorOpts
  })
  @ApiResponse({
    description: 'bearer token ',
    schema: headerOpts
  })
  @Header('Authorization', 'none')
  login(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() loginParams: LoginParams
  ) {
    return this.sessionService
      .signin(loginParams, req.socket.remoteAddress)
      .then((user) => {
        reply.header('Authorization', `Bearer ${user.access_token}`);
        reply.header('Refresh_token', `Bearer ${user.refresh_token}`);
        reply.code(HttpStatus.OK).send(user.userDetails);
      })
      .catch((error) => {
        reply.send(error);
      });
  }


  @Delete('logout')
  @ApiBearerAuth()
  @ApiHeaders([
    {
      name: 'header',
      required: true,
      description: 'Authorization',
      schema: { default: 'Bearer token' }
    },
    {
      name: 'header ',
      required: true,
      description: 'refresh_token',
      schema: { default: 'Bearer token' }
    }
  ])
  @ApiUnauthorizedResponse({
    description: 'Invalid session',
    schema: errorOpts
  })
  @ApiOkResponse({
    description: 'Successfully logged out',
    schema: logoutOpts
  })
  logout(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.sessionService
      .logout(req.headers.refresh_token as string)
      .then(() => {
        reply.header('Authorization', null);
        reply
          .status(HttpStatus.OK)
          .send({ message: 'Successfully logged out' });
      })
      .catch((error) => reply.send(error));
  }
}
