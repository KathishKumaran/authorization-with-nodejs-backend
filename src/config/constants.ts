import * as dotenv from 'dotenv';
dotenv.config();

export const MODEL = ['User'];

export const REALM = 'myrealm';

export const ROLES = {
  user: 'User',
  admin: 'Admin',
};

export const HTTP_CONTENT_TYPES = {
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
};
export const KEYCLOAK_APIS = {
  users: `${process.env.KC_BASE_URL}/admin/realms/${process.env.KC_REALM}/users`,
  login: `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/token`,
  logout: `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/logout`,
  validateToken: `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}/protocol/openid-connect/userinfo`,
};
