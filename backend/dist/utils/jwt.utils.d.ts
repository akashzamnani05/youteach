import { TokenPayload, AuthTokens } from '../types';
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const generateTokens: (payload: TokenPayload) => AuthTokens;
export declare const verifyAccessToken: (token: string) => TokenPayload | null;
export declare const verifyRefreshToken: (token: string) => TokenPayload | null;
export declare const decodeToken: (token: string) => TokenPayload | null;
//# sourceMappingURL=jwt.utils.d.ts.map