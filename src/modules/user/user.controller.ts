import { errorOpts } from 'src/entities/shared-schema/error.schema';
import { headerOpts } from 'src/entities/shared-schema/header.schema';
import { UserService } from './user.service';

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import {
  createUserOpts,
  detailUserOpts,
  listAndPaginationUserOpts,
} from 'src/entities/user/user-response.entity';

import {
  Res,
  Req,
  Get,
  Controller,
  HttpStatus,
  Post,
  Body,
  Query,
  Put,
  Param,
} from '@nestjs/common';

import {
  ApiTags,
  ApiHeader,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiUnprocessableEntityResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators';
import activityLogger from 'src/config/activity-logger';
import {
  UserCreateParams,
  UserUpdateParams,
} from 'src/entities/user/user-request.entity';
import { UserInstance } from 'src/dto/user.dto';

@ApiTags('user')
@ApiBearerAuth()
@ApiResponse({
  description: 'bearer token ',
  schema: headerOpts,
})
@ApiHeader({
  name: 'header',
  required: true,
  description: 'Authorization',
  schema: { default: 'Bearer token' },
})
@ApiUnauthorizedResponse({
  description: 'session has expired',
  schema: errorOpts,
})
@ApiUnprocessableEntityResponse({
  description: 'Unprocessable entity',
  schema: errorOpts,
})
@ApiInternalServerErrorResponse({
  status: 500,
  description: 'Something went wrong',
  schema: errorOpts,
})
@ApiForbiddenResponse({
  description: 'You are not allowed to perform this action',
  schema: errorOpts,
})
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'newly added user',
    schema: createUserOpts,
  })
  create(
    @Req() req: any,
    @Res() reply: FastifyReply,
    @Body() params: UserCreateParams,
    @GetCurrentUser() currentUser: UserInstance,
  ) {
    return this.userService
      .create(params, currentUser)
      .then((user) => {
        activityLogger.log(currentUser, user, 'user', 'created');
        reply.code(HttpStatus.CREATED).send(user);
      })
      .catch((error) => {
        reply.send(error);
      });
  }

  @Put(':id')
  @ApiCreatedResponse({
    description: 'update user',
    schema: createUserOpts,
  })
  update(
    @Res() reply: FastifyReply,
    @Body() body: UserUpdateParams,
    @Param() params: { id: number },
    @GetCurrentUser() currentUser: UserInstance,
  ) {
    console.log('query.id, ', params.id);
    return this.userService
      .update(Number(params.id), body, currentUser)
      .then((user) => {
        activityLogger.log(currentUser, user, 'user', 'updated');
        reply.code(HttpStatus.OK).send(user);
      })
      .catch((error) => {
        reply.send(error);
      });
  }

  @Get('verification')
  @ApiOkResponse({
    description: 'User details',
    schema: detailUserOpts,
  })
  detailUser(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.userService
      .validateAccessToken(req.headers.authorization as string)
      .then((user) => {
        reply.header('Authorization', null);
        reply.code(HttpStatus.OK).send(user);
      })
      .catch((error: FastifyError) => {
        console.log('error is', error);
        reply.send(error);
      });
  }

  @Get()
  @ApiOkResponse({
    description: 'User details',
    schema: listAndPaginationUserOpts,
  })
  listAndPagination(
    @Query() queryParams: any,
    @Res() reply: FastifyReply,
    @GetCurrentUser() currentUser: UserInstance,
  ) {
    return this.userService
      .filterAndPagination(currentUser, queryParams)
      .then((users) => {
        // reply.header('Authorization', null);
        reply.code(HttpStatus.OK).send(users);
      })
      .catch((error: FastifyError) => {
        console.log('error is', error);
        reply.send(error);
      });
  }
}
