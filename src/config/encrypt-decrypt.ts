import * as cryptojs from 'crypto-js';
import { User } from 'prisma/generated/client1';

function encryptPass(password: string, user: User) {
  const secretKey = `${user.email}_${user.id}`;
  return cryptojs.AES.encrypt(password, secretKey).toString();
}

export { encryptPass };
