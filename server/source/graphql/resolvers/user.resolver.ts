import { AuthenticationError, UserInputError } from "apollo-server-express";
import { compare } from "bcrypt";
import userService from "../../services/user.service";

export default {
    Query: {
        user: async (_: any, __: any, { req, res }: any): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!req.userId) {
                        throw new AuthenticationError("Not authenticated!");
                    }
                    resolve(await userService.getById({ userId: req.userId }));
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Mutation: {
        register: async (
            _: any,
            { email, password }: { email: string; password: string },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    resolve(await userService.create({ email, password }));
                } catch (error) {
                    reject(error);
                }
            });
        },
        login: async (
            _: any,
            { email, password }: { email: string; password: string },
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!(await userService.isUserExistByEmail({ email }))) {
                        throw new UserInputError(
                            "User with this email does not exist!"
                        );
                    }

                    const user = await userService.getByEmail({ email });
                    if (user.isBanned) {
                        throw new AuthenticationError(
                            "User is banned from server!"
                        );
                    }

                    const isPasswordValid = await compare(
                        password,
                        user.password as string
                    );
                    if (!isPasswordValid) {
                        throw new UserInputError(
                            "Username or password are incorrect!"
                        );
                    }

                    const accessToken = await userService.generateAccessToken({
                        userId: user._id as string,
                    });
                    const refreshToken = await userService.generateRefreshToken(
                        {
                            userId: user._id as string,
                            userAgent: req.headers["user-agent"],
                            ip: req.ip,
                        }
                    );

                    res.cookie("refresh-token", refreshToken, {
                        maxAge: process.env
                            .REFRESH_TOKEN_COOKIE_EXPIRE as unknown as number,
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                    });
                    resolve({
                        user,
                        accessToken,
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },
        refreshToken: async (
            _: any,
            __: any,
            { req, res }: any
        ): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    const refreshToken = req.cookies["refresh-token"] as string;

                    if (!refreshToken) {
                        throw new AuthenticationError("Not Authenticated!");
                    }

                    await userService
                        .validateRefreshToken({ refreshToken })
                        .then(async (payload) => {
                            if (
                                !(await userService.isUserExistById({
                                    userId: payload.userId,
                                }))
                            ) {
                                res.clearCookie("refresh-token", {
                                    httpOnly: true,
                                    secure: true,
                                    sameSite: "none",
                                });
                                throw new AuthenticationError(
                                    "Not Authenticated!"
                                );
                            }

                            const user = await userService.getById({
                                userId: payload.userId,
                            });
                            if (user.isBanned) {
                                throw new AuthenticationError(
                                    "User is banned from server!"
                                );
                            }

                            if (
                                user.refreshTokens.filter(
                                    ({ token }: any) => token === refreshToken
                                ).length === 0
                            ) {
                                res.clearCookie("refresh-token", {
                                    httpOnly: true,
                                    secure: true,
                                    sameSite: "none",
                                });
                                throw new AuthenticationError(
                                    "Not Authenticated!"
                                );
                            }

                            const { token, userAgent, ip }: any =
                                user.refreshTokens.find(
                                    ({ token }: any) => token === refreshToken
                                );

                            if (
                                userAgent !== req.headers["user-agent"] ||
                                ip !== req.ip
                            ) {
                                await userService.invalidateRefreshToken({
                                    refreshToken,
                                });
                                res.clearCookie("refresh-token", {
                                    httpOnly: true,
                                    secure: true,
                                    sameSite: "none",
                                });
                                throw new AuthenticationError(
                                    "Browser / Network change detected! Refresh Token invalidated!"
                                );
                            }

                            const newAccessToken =
                                await userService.generateAccessToken({
                                    userId: payload.userId,
                                });

                            resolve({
                                user,
                                accessToken: newAccessToken,
                            });
                        });
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
};
