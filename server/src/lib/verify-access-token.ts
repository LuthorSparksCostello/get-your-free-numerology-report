import { createRemoteJWKSet, jwtVerify } from 'jose';
import { auth0Config } from '../config/auth0.config.js';

const JWKS = createRemoteJWKSet(
  new URL(`https://${auth0Config.domain}/.well-known/jwks.json`)
);

/** Verify an Auth0 access-token JWT and return its subject. Throws on invalid. */
export async function verifyAccessToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${auth0Config.domain}/`,
    audience: auth0Config.audience,
  });
  if (!payload.sub) throw new Error('Token missing sub');
  return { sub: payload.sub };
}
