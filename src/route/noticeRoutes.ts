// import { IPost, PostTypes } from "./../types/types";
import {
  Router,
  Request as Req,
  Response as Res,
  NextFunction as Next,
  Request,
  Response,
} from "express";
const noticeRouter = Router();

import PostSchema from "../models/post";
import { IPost, PostTypes } from "../types/types";
import { IpostValidarion } from "../util/iPostValidation";
import multer from "multer";
import { storage } from "../config/multer";
import { deleteFile, uploadFile } from "../middleware/fileManager";

const upload = multer({ storage: storage });

// LISTAR EDITAIS
noticeRouter.get("/", (req: Request, res: Response) => {
  try {
    PostSchema.find({ postType: PostTypes.NOTICE })
      .then((notices) => {
        if (notices.length)
          return res.status(200).json({
            success: true,
            notices: notices,
          });

        return res.status(200).json({
          msg: "Ainda não foram adicionados editais",
          success: true,
        });
      })
      .catch((error) => {
        return res.status(200).json({
          success: false,
          error: error,
          msg: "Algo deu errado",
        });
      });
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error,
      msg: "Ocorreu um erro interno",
    });
  }
});

// CRIAR EDITAIS
noticeRouter.post(
  "/create-notice",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { title, body, postType, author } = req.body;
    console.log(title, body, postType, author);
    const notice = { title, body, postType, author, img: "" };
    // const notice = req.body.notice as IPost;
    const validation = IpostValidarion(notice as IPost);
    if (!req.file || !validation.succes) {
      return res.status(404).json({
        success: false,
        msg: validation.msg || "O arquivo não encontrado",
      });
    }

    try {
      const id = await uploadFile(req.file);
      const link = (process.env.GOOGLE_LINK as string) + id;
      notice.img = link;
      const newNotice = new PostSchema(notice);
      await newNotice.save();
      return res.status(200).json({
        success: true,
        msg: "Edital salvo com sucesso",
      });
    } catch (error) {
      return res.status(200).json({
        success: false,
        msg: "Houve um erro interno",
        error: error,
      });
    }
  }
);

// LISTAR UM EDITAL
noticeRouter.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(404).json({
      success: false,
      msg: "Id do post não encontrado",
    });

  PostSchema.findOne({ _id: id })
    .then((notice) => {
      return res.status(200).json({
        success: true,
        msg: "Edital encontrado com successo",
        notice: notice,
      });
    })
    .catch((error) => {
      return res.status(501).json({
        success: false,
        msg: "Id do post não encontrado",
        error: error,
      });
    });
});

// DELETAR UM EDITAL
noticeRouter.get("/delete/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(404).json({
      success: false,
      msg: "Id do post não encontrado",
    });

  PostSchema.findOneAndDelete({ _id: id })
    .then(async (success) => {
      if (!success) {
        return res.status(200).json({
          success: false,
          msg: "Editar não encontrado",
        });
      }

      await deleteFile(success.img.split("=")[2]);
      return res.status(200).json({
        success: true,
        msg: "Editar deletado com successo",
      });
    })
    .catch((error) => {
      return res.status(501).json({
        success: false,
        msg: "Houve um erro, post não pode ser apagado",
        error: error,
      });
    });
});

// EDITAR UM EDITAL
noticeRouter.post(
  "/update/:id",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id)
      return res.status(404).json({
        success: false,
        msg: "Id de post não encontrado",
      });

    const existedPost = await PostSchema.findOne({ _id: id });

    if (!existedPost)
      return res.status(404).json({
        success: false,
        msg: "Post não encontrado",
      });

    const file = req.file;
    const { title, body, edit_by } = req.body as IPost;
    const notice: Pick<IPost, "title" | "edit_by" | "body" | "img"> = {
      title,
      edit_by,
      body,
      img: existedPost.img,
    };
    if (file) {
      deleteFile(existedPost.img.split("=")[2]);
      const id = await uploadFile(file);
      notice.img = (process.env.GOOGLE_LINK as string) + id;
    }

    PostSchema.findOneAndUpdate({ _id: id }, notice)
      .then((update) => {
        if (update)
          return res.status(200).json({
            success: true,
            msg: "Edital atualizado com successo",
          });

        return res.status(501).json({
          success: false,
          msg: "Houve um erro interno, edital não pode ser atualizado",
        });
      })
      .catch((error) => {
        return res.status(501).json({
          success: false,
          msg: "Houve um erro interno, edital não pode ser atualizado",
          error: error,
        });
      });
  }
);

export default noticeRouter;
