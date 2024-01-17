import { Injectable, NotFoundException } from '@nestjs/common';

import axios from 'axios';
import { KEYCLOAK_APIS, PrismaService, kcAdminClient } from 'src/config';
import { UserInstance } from 'src/dto/user.dto';
import { UserCreateParams } from 'src/entities/user/user-request.entity';
import { EventbusService } from '../eventbus/eventbus.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private eventbus: EventbusService) {
    this.subscribeToEvent();
  }

  private subscribeToEvent(): any {
    this.eventbus.subscribe('handleUserCreateEvent', async (event) => {
      if (event.name === 'Keycloak') {
        return await kcAdminClient.users.create({
          email: event.attrs.email,
          enabled: true,
          username: event.attrs.email,
          lastName: event.attrs.last_name,
          firstName: event.attrs.first_name,
          credentials: [{
            type: 'password',
            value: '123456',
            temporary: false
          }]
        });
      }
      if (event.name === 'TelephonySystem') {
        return await axios.post(
          process.env.TELEPHONY_CREATE_USER_ENDPOINT,
          {
            name: event.attrs.first_name,
          },
          {
            headers: {
              Authorization: `${event.currentUser.access_token}`,
            },
          },
        );
      }
      if (event.name === 'TicketingSystem') {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${event.currentUser.access_token}`
        }
        const userData = {
          "first_name": "Orchestration-ts",
          "last_name": "user",
          "email": "tsagent1@gmail.com",
          "role_id": 2
        }
        await axios.post(`${process.env.TICKETING_SYSTEM_BACKEND_URL}/v1/users`, userData, {
          headers: headers
        });

      }
      if (event.name === 'OrchestrationSystem') {
        const currentTime = new Date();
        return await this.prisma.$transaction(async (prisma) => {
          const userInDatabase = await prisma.user.create({
            data: {
              email: event.attrs.email,
              kc_user_id: event.newUserInKeycloak.id,
              role_id: event.attrs.role_id,
              created_at: currentTime,
              updated_at: currentTime,
              last_name: event.attrs.last_name,
              created_by: event.currentUser.id,
              first_name: event.attrs.first_name,
            },
          });
          return userInDatabase;
        });
      }

    });

    this.eventbus.subscribe('handleUserCreateFailure', async (event) => {
    });

    this.eventbus.subscribe('handleUserUpdateEvent', async (event) => {
      if (event.name === 'keycloak') {
        console.log("=========================KEYCLOAK Updated Successfully");
        await kcAdminClient.users.update(
          {
            id: event.user.kc_user_id
          },
          {
            lastName: event.attrs.last_name,
            firstName: event.attrs.first_name
          }
        );
      }
      if (event.name === 'TelephonySystem') {
        console.log("=========================TelephonySystem Updated Successfully");
      }
      if (event.name === 'TicketingSystem') {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${event.currentUser.access_token}`
        }
        const userData = {
          "first_name": "TS-agent1",
          "email": "tsagent1@gmail.com",
          "role_id": 2
        }
        await axios.put(`${process.env.TICKETING_SYSTEM_BACKEND_URL}/v1/users/copper`, userData, { headers: headers });
        console.log("=========================TicketingSystem Updated Successfully");
      }
      if (event.name === 'OrchestrationSystem') {
        console.log("=========================OrchestrationSystem Updated Successfully");
        const updatedUser = await this.prisma.user.update({
          where: {
            id: event.user.id
          },
          data: {
            ...event.attrs,
            updated_by: event.user.id,
            updated_at: new Date()
          }
        });
      }
    });

    this.eventbus.subscribe('handleUserUpdateFailure', async (event) => {
      if (event.stepCount === 1) {
        console.log('keycloak ERR:::::');
      }
      if (event.stepCount === 2) {
        console.log('TelephonySystem ERR:::::');
      }
      if (event.stepCount === 3) {
        console.log('OrchestrationSystem ERR:::::');
      }
      if (event.stepCount === 4) {
        console.log('TicketingSystem ERR:::::');
      }

    })

  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      },
      include: {
        Role: {
          select: {
            name: true
          }
        }
      }
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

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
    let telephonyApiResponse, newUserInKeycloak: any, createdUserInDatabase, stepCount;
    try {
      // Create user in Keycloak
      stepCount = 1;
      newUserInKeycloak = this.eventbus.publish('handleUserCreateEvent', { name: 'keycloak', attrs, currentUser });

      //Create user in Telephony System
      stepCount = 2;
      telephonyApiResponse = this.eventbus.publish('handleUserCreateEvent', { name: 'TelephonySystem', attrs, currentUser });

      //Create user in PostgreSQL database
      stepCount = 3;
      createdUserInDatabase = this.eventbus.publish('handleUserCreateEvent', { name: 'OrchestrationSystem', attrs, currentUser });

      //Create user in Ticketing System
      stepCount = 4;
      this.eventbus.publish('handleUserCreateEvent', { name: 'TicketingSystem', attrs, currentUser });

      await this.prisma.user.update({
        where: { id: createdUserInDatabase.id },
        data: { confirmed_at: new Date() }
      });

      return {
        id: createdUserInDatabase.id,
        email: createdUserInDatabase.email,
        last_name: createdUserInDatabase.last_name,
        first_name: createdUserInDatabase.first_name,
        updated_at: createdUserInDatabase.updated_at,
        created_at: createdUserInDatabase.created_at,
      };

    } catch (error) {
      this.eventbus.publish('handleUserCreateFailure', { stepCount, newUserInKeycloak, telephonyApiResponse, createdUserInDatabase });
    }

  }


  async update(id: number, attrs: any, currentUser: UserInstance) {
    const user = await this.getUserById(id);
    let stepCount = 0;
    try {
      stepCount = 1;
      this.eventbus.publish('handleUserUpdateEvent', { name: 'keycloak', user, attrs, currentUser });

      // stepCount = 2;
      // await axios.put('', {})
      // this.eventbus.publish('handleUserUpdateEvent', { name: 'TelephonySystem', attrs, currentUser });

      stepCount = 3;
      this.eventbus.publish('handleUserUpdateEvent', { name: 'TicketingSystem', user, attrs, currentUser });

      stepCount = 4;
      // await axios.put('', {})
      this.eventbus.publish('handleUserUpdateEvent', { name: 'OrchestrationSystem', user, attrs, currentUser });

    } catch (error) {
      this.eventbus.publish('handleUserUpdateFailure', { stepCount });
    }

    // return await this.prisma.$transaction(async (prisma) => {
    //   const updatedUser = await prisma.user.update({
    //     where: {
    //       id: user.id
    //     },
    //     data: {
    //       ...attrs,
    //       updated_by: currentUser.id,
    //       updated_at: new Date()
    //     }
    //   });

    //   await kcAdminClient.users.update(
    //     {
    //       id: user.kc_user_id
    //     },
    //     {
    //       email: attrs.email,
    //       lastName: attrs.last_name,
    //       firstName: attrs.first_name
    //     }
    //   );
    //   return {
    //     id: updatedUser.id,
    //     email: updatedUser.email,
    //     last_name: updatedUser.last_name,
    //     first_name: updatedUser.first_name,
    //     created_at: updatedUser.created_at,
    //     updated_at: updatedUser.updated_at
    //   };
    // });
  }
}
