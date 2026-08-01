export class SignJWT {
  setProtectedHeader() { return this; }
  setSubject() { return this; }
  setJti() { return this; }
  setIssuedAt() { return this; }
  setNotBefore() { return this; }
  setExpirationTime() { return this; }
  sign() { return Promise.resolve('mocked-token'); }
}

export const jwtVerify = jest.fn().mockResolvedValue({
  payload: { sub: 'admin', jti: 'test-jti' },
});
