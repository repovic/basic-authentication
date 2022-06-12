import { hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import User from "../models/user.model";

interface User {
    _id: String;
    email: string;
    password: string;
    isAdmin: boolean;
    isBanned: boolean;
    refreshTokens: string[];
    createdAt: String;
    updatedAt: String;
}
interface TokenPayload {
    userId: string;
}

export default {
    getById: async ({ userId }: { userId: string }): Promise<User> => {
        return await User.findById(userId);
    },
    isUserExistById: async ({
        userId,
    }: {
        userId: string;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await User.findById(userId)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(false);
            }
        });
    },
    getByEmail: async ({ email }: { email: string }): Promise<User> => {
        return await User.findOne({ email });
    },
    isUserExistByEmail: async ({
        email,
    }: {
        email: string;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (await User.findOne({ email })) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(false);
            }
        });
    },
    create: async ({
        email,
        password,
    }: {
        email: string;
        password: string;
    }): Promise<User> => {
        password = await hash(password, 10);
        return await new User({
            email,
            password,
        }).save();
    },
    generateAccessToken: async ({
        userId,
    }: {
        userId: string;
    }): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload: TokenPayload = {
                    userId,
                };

                resolve(
                    sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
                        expiresIn: process.env.ACCESS_TOKEN_EXPIRE as string,
                    })
                );
            } catch (error) {
                reject(error);
            }
        });
    },
    validateAccessToken: async ({
        accessToken,
    }: {
        accessToken: string;
    }): Promise<TokenPayload> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = verify(
                    accessToken,
                    process.env.ACCESS_TOKEN_SECRET as string
                ) as TokenPayload;
                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    },
    generateRefreshToken: async ({
        userId,
        userAgent,
        ip,
    }: {
        userId: string;
        userAgent: string;
        ip: string;
    }): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload: TokenPayload = {
                    userId,
                };
                const refreshToken = sign(
                    payload,
                    process.env.REFRESH_TOKEN_SECRET as string,
                    {
                        expiresIn: process.env.REFRESH_TOKEN_EXPIRE as string,
                    }
                );

                const user = await User.findById(userId);
                user.refreshTokens.push({
                    token: refreshToken,
                    userAgent,
                    ip,
                });
                await user.save();

                resolve(refreshToken);
            } catch (error) {
                reject(error);
            }
        });
    },
    validateRefreshToken: async ({
        refreshToken,
    }: {
        refreshToken: string;
    }): Promise<TokenPayload> => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET as string
                ) as TokenPayload;
                resolve(payload);
            } catch (error) {
                reject(error);
            }
        });
    },
    invalidateRefreshToken: async ({
        refreshToken,
    }: {
        refreshToken: string;
    }): Promise<boolean> => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({
                    refreshTokens: {
                        $elemMatch: {
                            token: refreshToken,
                        },
                    },
                });
                user.refreshTokens = user.refreshTokens.filter(
                    ({ token }) => token !== refreshToken
                );
                await user.save();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
};
