import KcAdminClient from '@keycloak/keycloak-admin-client';

import { PrismaClient } from '../generated/client1';
import { PrismaClient as MatrixDb } from '../generated/client2';
import { encryptPass } from '../../src/config/encrypt-decrypt';
import { generateHash } from '../../src/config';

const prisma = new PrismaClient();
const matrixDb = new MatrixDb();

const kcAdminClient = new KcAdminClient({
  realmName: process.env.KC_REALM,
  baseUrl: process.env.KC_BASE_URL,
});

async function main() {
  await kcAdminClient.auth({
    password: process.env.KC_PASSWORD,
    username: process.env.KC_USER_NAME,
    clientId: process.env.KC_CLIENT_ID,
    grantType: 'password',
    clientSecret: process.env.KC_CLIENT_SECRET,
  });

  const roleData = [
    {
      id: 1,
      name: 'Admin',
    },
    {
      id: 2,
      name: 'SM',
    },
    {
      id: 3,
      name: 'RGM',
    },
    {
      id: 4,
      name: 'AM',
    },
  ];

  const userData = [
    {
      id: 1,
      role_id: 1,
      email: 'gnana@yavar.in',
      first_name: 'Gnana',
      last_name: 'Billian',
      confirmed_at: new Date(),
    },
  ];

  for await (const role of roleData) {
    await prisma.role.upsert({
      where: {
        id: role.id,
      },
      create: role,
      update: role,
    });
  }

  for await (const user of userData) {
    const hash = generateHash('12345678');
    const encryptedPassword = encryptPass('12345678', user.email);
    console.log('encryptedPass', encryptedPassword);
    const creationTs = new Date().getTime();

    const KcUser = await kcAdminClient.users.create({
      enabled: true,
      email: user.email,
      username: user.email,
      lastName: user.last_name,
      firstName: user.first_name,
      credentials: [
        {
          type: 'password',
          value: '12345678',
          temporary: false,
        },
      ],
      attributes: {
        hashPass: encryptedPassword,
      },
    });

    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        ...user,
        kc_user_id: KcUser.id,
        matrix_name: `@${user.first_name}:matrix.yavar.ai`,
      },
      update: {
        ...user,
        kc_user_id: KcUser.id,
        matrix_name: `@${user.first_name}:matrix.yavar.ai`,
      },
    });

    await matrixDb.user.upsert({
      where: {
        name: `@${user.first_name}:matrix.yavar.ai`,
      },
      create: {
        name: `@${user.first_name}:matrix.yavar.ai`,
        password_hash: hash,
        admin: 1,
        creation_ts: creationTs,
        upgrade_ts: creationTs,
      },
      update: {
        name: `@${user.first_name}:matrix.yavar.ai`,
        password_hash: hash,
        admin: 1,
        creation_ts: creationTs,
        upgrade_ts: creationTs,
      },
    });
  }
}

main()
  .then(async () => {
    await kcAdminClient.users.logout({
      id: (await kcAdminClient.whoAmI.find()).userId,
    });

    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log('err--------', err);
    await kcAdminClient.users.logout({
      id: (await kcAdminClient.whoAmI.find()).userId,
    });
    await prisma.$disconnect();
  });
