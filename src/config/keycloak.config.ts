import KcAdminClient from '@keycloak/keycloak-admin-client';

import { Issuer } from 'openid-client';

export const kcAdminClient = new KcAdminClient({
  realmName: process.env.KC_REALM,
  baseUrl: process.env.KC_BASE_URL
});

export async function keyCloakConnection() {
  try {
    await kcAdminClient.auth({
      password: process.env.KC_PASSWORD,
      username: process.env.KC_USER_NAME,
      clientId: process.env.KC_CLIENT_ID,
      grantType: 'password',
      clientSecret: process.env.KC_CLIENT_SECRET
    });

    const keycloakIssuer = await Issuer.discover(
      `${process.env.KC_BASE_URL}/realms/${process.env.KC_REALM}`
    );

    const client = new keycloakIssuer.Client({
      client_id: process.env.KC_CLIENT_ID,
      client_secret: process.env.KC_CLIENT_SECRET
    });

    let tokenSet = await client.grant({
      password: process.env.KC_PASSWORD,
      username: process.env.KC_USER_NAME,
      client_id: process.env.KC_CLIENT_ID,
      grant_type: 'password',
      client_secret: process.env.KC_CLIENT_SECRET
    });

    setInterval(async () => {
      const refreshToken = tokenSet.refresh_token;
      tokenSet = await client.refresh(refreshToken);
      kcAdminClient.setAccessToken(tokenSet.access_token);
    }, Number(process.env.KC_TOKEN_REFRESH_INTERVAL_TIME)); // MS
  } catch (error) {
    throw error;
  }
}
