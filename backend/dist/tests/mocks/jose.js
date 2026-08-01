"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtVerify = exports.SignJWT = void 0;
class SignJWT {
    setProtectedHeader() { return this; }
    setSubject() { return this; }
    setJti() { return this; }
    setIssuedAt() { return this; }
    setNotBefore() { return this; }
    setExpirationTime() { return this; }
    sign() { return Promise.resolve('mocked-token'); }
}
exports.SignJWT = SignJWT;
exports.jwtVerify = jest.fn().mockResolvedValue({
    payload: { sub: 'admin', jti: 'test-jti' },
});
