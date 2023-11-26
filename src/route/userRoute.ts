import { IUser } from "./../types/types";
import { Request, Response, Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/user";
import bcryt from "bcrypt";
import { accessTokenGenerator } from "../util/util";

import {
  chackRolePremission,
  checkTokenValidation,
  isTokenValid,
} from "../middleware/isAuhtenticated";
import { mailjet } from "../config/mailjet";
import { htmlGenerator } from "../static/htmlPart";
// import { htmlGenerator } from "../static/htmlPart";

const userRoute = Router();
userRoute.post("/create-user", async (req, res) => {
  const { name, username, password, premissionRole } = req.body;
  const existUser = await UserModel.findOne({ username: username });

  if (existUser) {
    return res.status(400).json({
      success: false,
      msg: "Já existe usuario com este email",
    });
  }

  try {
    bcryt.genSalt(10).then((salt) => {
      bcryt
        .hash(password, salt)
        .then((hashed) => {
          new UserModel({
            name,
            password: hashed,
            username,
            activityStatus: true,
            premissionRole: premissionRole,
            avatar: "",
            passRecovery: "",
          })
            .save()
            .then((resp) => {
              return res.status(200).json({
                data: resp,
                success: true,
                msg: "Usuário criado com sucesso",
              });
            })
            .catch((error) => {
              return res.status(500).json({
                error: error,
                success: false,
              });
            });
        })
        .catch((error) => {
          return res.status(500).json({
            error: error,
            success: false,
          });
        });
    });
  } catch (error) {}
});

userRoute.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // console.log("received");
  // console.log(username, password);

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
          accessToken: accessToken,
          id: existUser._id,
          username: existUser.username,
          name: existUser.name,
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

userRoute.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token_sec = process.env.JWT_SEC as string;

    if (authHeader) {
      const token = authHeader?.split(" ")[1];
      if (token) {
        const payload = (await jwt.verify(token, token_sec)) as JwtPayload;
        const id = payload?.id;

        if (!id) {
          return res
            .status(404)
            .json({ success: false, msg: "token invalido" });
        }

        const user = (await UserModel.findById({ _id: id })) as IUser;

        if (!user) {
          return res
            .status(404)
            .json({ success: false, msg: "Usuario  não encontrado" });
        }

        return res.status(200).json({
          msg: "autorizado",
          success: true,
          user: {
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            _id: user._id,
            premissionRole: user.premissionRole,
          },
        });
      } else {
        return res.status(401).json({ success: false, msg: "something wrong" });
      }
    } else {
      return res.status(401).json({ success: false, msg: "something wrong" });
    }
  } catch (error) {
    return res.status(401).json({ success: false, msg: error });
  }
});

userRoute.get("/users", async (req: Request, res: Response) => {
  const users = await UserModel.find({}, { password: 0 });

  res.status(200).json({
    success: true,
    users: users,
  });
});

userRoute.post("/update-user", (req: Request, res: Response) => {
  const { user } = req.body;
  const { _id, ..._user } = user as IUser;

  try {
    UserModel.findOneAndUpdate({ username: _user.username }, _user)
      .then((success) => {
        return res.status(200).json({
          success: true,
          user: success,
        });
      })
      .catch((error) => {
        if (error) {
          return res.status(501).json({
            msg: "Houve um erro",
            erro: error,
            success: false,
          });
        }
      });
  } catch (error) {
    if (error) {
      return res.status(501).json({
        msg: "Houve um erro",
        erro: error,
        success: false,
      });
    }
  }
});

userRoute.get("/delete-user/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res
      .status(404)
      .json({ success: false, msg: "Forneça id do usuario" });

  UserModel.findOneAndDelete({ _id: id })
    .then((success) => {
      if (success) {
        return res.status(200).json({
          msg: "Usuario Deletado com successo",
          success: true,
          user: success,
        });
      }

      return res.status(501).json({
        msg: "Usuario não existe",
        success: false,
      });
    })
    .catch((error) => {
      return res.status(501).json({
        msg: "Houve um erro interno",
        success: false,
        error: error,
      });
    });
});

userRoute.post("/reset-password", async (req: Request, res: Response) => {
  const { dest_email } = req.body;

  if (!dest_email) {
    return res.status(404).json({
      success: false,
      msg: "Usuario não encontrado",
    });
  }

  UserModel.findOne({ username: dest_email })
    .then(async (user: any) => {
      if (!user) {
        if (!user?.activityStatus) {
          return res.status(502).json({
            success: false,
            msg: "Usuario não encontrado",
          });
        }
      }

      if (!user?.activityStatus) {
        return res.status(502).json({
          success: false,
          msg: "Usuario desabilitado, favor contacte administrador",
        });
      }
      const token = await accessTokenGenerator(user, 60);
      const link = `http://localhost:3000/password-recovery/${user._id}`;
      const html = htmlGenerator(link);
      user.passRecovery = token;

      await user?.save();

      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: process.env.FROM_EMAIL,
              Name: "não-responda",
            },
            To: [
              {
                Email: dest_email,
                Name: user?.name,
              },
            ],
            Subject: "Recuperação de Senha",
            TextPart:
              "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
            HTMLPart: html,
          },
        ],
      });

      request
        .then((result) => {
          // console.log(result.body);
          return res.status(200).json({
            msg: "Um link de recuperação foi enviado para seu email",
            resp: result.body,
            success: true,
          });
        })
        .catch((err) => {
          // console.log(err);
          return res.status(501).json({
            msg: "Houve um erro interno",
            error: err,
            success: false,
          });
        });
    })
    .catch((error) => {
      return res.status(501).json({
        msg: "Houve um erro interno",
        error: error,
        success: false,
      });
    });
});

userRoute.get("/set-password/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(404).json({
      success: false,
      msg: "Id do usuário não foi encontrado",
    });

  UserModel.findOne({ _id: id })
    .then(async (user) => {
      // return res.status(200).json({
      //   user: user,
      //   msg: "deu certo",
      //   success: true,
      // });

      if (!user)
        return res.status(404).json({
          success: false,
          msg: "Usuário não encontrado",
        });

      if (!user.passRecovery) {
        return res.status(404).json({
          success: false,
          msg: "O link para resetar senha expirou",
        });
      }
      const resp = isTokenValid(user?.passRecovery as string);
      if (resp.success) {
        // user?.passRecovery = "";
        // await user?.save();

        return res.status(200).json({
          success: true,
          msg: "token válido",
          token: user.passRecovery,
        });
      }
      // user?.passRecovery = "";
      // await user?.save();
      return res.status(502).json({
        success: false,
        msg: resp.error || "Houve um erro interno",
      });
    })
    .catch((error) => {
      return res.status(502).json({
        success: false,
        error: error || "Houve um erro interno",
      });
    });
});

userRoute.post("/set-password/", async (req: Request, res: Response) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    return res.status(404).json({
      success: false,
      msg: "Os dados nao encontrado",
      error: "Os dados nao encontrado",
    });
  }

  console.log(newPassword, token);

  const resp = isTokenValid(token);

  if (!resp.success) {
    return res.status(403).json({
      error: resp.error || "Link inválido",
    });
  }

  try {
    const user = await UserModel.findOne({ passRecovery: token });

    if (user) {
      try {
        const salt = await bcryt.genSalt(10);
        const hashed = await bcryt.hash(newPassword, salt);

        user.password = hashed;
        user.passRecovery = "";
        await user.save();
        return res.status(200).json({
          success: true,
          msg: "Senha alterada com sucesso",
          token: token,
        });
      } catch (error) {
        console.log("error catch");
        return res.status(200).json({
          success: false,
          msg: "Um erro inesperado aconteceu",
          error: error,
        });
      }
    }

    return res.status(404).json({
      success: false,
      msg: "Usuário não encontrado",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: "Usuário não encontrado",
    });
  }
});

userRoute.get("/user/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id)
    return res.status(404).json({
      success: false,
      msg: "O ID de usuário não foi fornecido",
    });

  try {
    const user = await UserModel.findOne({ _id: id }, "-password");

    if (!user)
      return res.status(404).json({
        success: false,
        msg: "Usuário não encontrado",
      });

    return res.status(200).json({
      success: true,
      msg: "Usuário encontrado com sucesso!",
      user: user,
    });
  } catch (error: any) {
    return res.status(501).json({
      success: false,
      msg: error.message || "Houve um erro interno!",
      error: error,
    });
  }
});

userRoute.post("/update-me/", async (req: Request, res: Response) => {
  const { _user } = req.body;
  const user = _user as IUser;

  if (!user)
    return res.status(404).json({
      success: false,
      msg: "Os dados não foram informados",
    });
});

export default userRoute;
