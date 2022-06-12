import { NextFunction, Request, Response } from "express";
import userService from "../services/user.service";

export default async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers["x-access-token"] as string;

    await userService
        .validateAccessToken({ accessToken })
        .then((payload) => {
            (req as any).userId = payload.userId;
        })
        .catch(() => {});

    next();
};
