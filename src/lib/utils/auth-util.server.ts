export function createToken(payload: object, expiresIn: number) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Date.now();
  const tokenPayload = { ...payload, exp: now + expiresIn, iat: now };
  return `${btoa(JSON.stringify(header))}.${btoa(
    JSON.stringify(tokenPayload)
  )}`;
}

export function verifyToken(token: string): boolean {
  try {
    const [_, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}
