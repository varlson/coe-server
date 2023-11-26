import bcryt from "bcrypt";
import { Request, Response, Router } from "express";
import UserModel from "../models/user";
import { accessTokenGenerator } from "../util/util";

const loginRoute = Router();
loginRoute.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  console.log("username, password");
  console.log(username, password);

  const existUser = await UserModel.findOne({ username: username });

  if (existUser) {
    if (!existUser?.activityStatus) {
      return res.status(403).json({
        msg: "Usuário desabilitado, contacte Admin",
        success: false,
      });
    }

    bcryt.compare(password, existUser.password, async (error, result) => {
      if (error) {
        return res.status(401).json({
          success: false,
          msg: "Um erro interno ocorreu, por favor tente mais tarde!",
          error: "Um erro interno ocorreu, por favor tente mais tarde!",
        });
      }
      if (result) {
        const accessToken = await accessTokenGenerator(existUser);
        // console.log(accessToken);
        return res.status(200).json({
          success: true,
          user: {
            accessToken: accessToken,
            id: existUser._id,
            username: existUser.username,
            name: existUser.name,
          },
        });
      }

      return res.status(401).json({
        success: false,
        msg: "Senha incorreta",
        error: "Senha incorreta",
      });
    });
  } else {
    return res.status(404).json({
      success: false,
      msg: "Usuario não encontrado!",
      error: "Usuario não encontrado!",
    });
  }
});

export default loginRoute;
