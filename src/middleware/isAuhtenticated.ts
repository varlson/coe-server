// import { userType } from "./../../types/types";

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/user";
import { userType } from "../types/types";

const token_sec = process.env.JWT_SEC as string;

export const isTokenValid = (token: string) => {
  try {
    const decoded = jwt.verify(token, token_sec);
    const { id } = decoded;

    if (id)
      return {
        success: true,
        id: id,
      };

    return { success: false, id: null };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const checkTokenValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      try {
        const resp = isTokenValid(token);

        if (resp.success) {
          const { id } = resp;
          const user = await UserModel.findById(id);

          if (user) {
            req.user = user;
            return next();
          }
        }

        return res.status(501).json({
          success: false,
          msg: "User not found",
          error: resp,
        });
      } catch (error) {
        return res.status(501).json({
          success: false,
          msg: error,
        });
      }
    }
  } catch (error) {}
};

export const chackRolePremission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;
  if (user && user.premissionRole == 1) {
    return next();
  }

  return res.status(501).json({
    success: false,
    msg: "Houve um erro interno",
  });
};
