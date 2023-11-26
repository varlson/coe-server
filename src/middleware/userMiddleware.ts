import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { userType } from "../types/types";

declare global {
  namespace Express {
    interface Request {
      user: userType; // Substitua 'typeof UserModel' pelo tipo correto do seu modelo de usuário
    }
  }
}

export const checkUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const existUser = await UserModel.findOne({ username: username });

    if (existUser) {
      if (!existUser?.activityStatus) {
        return res.status(403).json({
          msg: "Usuário desabilitado, contacte Admin",
          success: false,
        });
      }
      req.user = existUser;
      return next();
    }

    return res.status(404).json({
      success: false,
      msg: "Usuário não encontrado",
    });
  } catch (error: any) {
    return res.status(501).json({
      success: false,
      msg: error.message || "Usuário não encontrado",
      error: error,
    });
  }
};
