import * as cryptojs from 'crypto-js';
import { User } from 'prisma/generated/client1';

function encryptPass(password: string, email: string) {
  const secretKey = `${email}_Random`;
  console.log('secretkey', secretKey);
  return cryptojs.AES.encrypt(password, secretKey).toString();
}

export { encryptPass };
