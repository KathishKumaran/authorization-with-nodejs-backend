import * as bcrypt from 'bcrypt';

function generateHash(password: string) {
  const encryptedPassword = bcrypt.hashSync(password, 10);

  return encryptedPassword;
}

export { generateHash };
