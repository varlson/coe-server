import {
  Router,
  Request as Req,
  Response as Res,
  NextFunction as Next,
  query,
} from "express";
const route = Router();
import multer from "multer";
import { deleteFile, uploadFile } from "../middleware/fileManager";
import PostSchema from "../models/post";
import { IPost, PostTypes } from "../types/types";
import UserModel from "../models/user";
import {
  authorNameSetter,
  documentToIpost,
  getAuthorNames,
  tagBuilder,
} from "../util/util";
import { storage } from "../config/multer";
const upload = multer({ storage: storage });
const postRoutes = Router();

//CREATE POST

postRoutes.post(
  "/create",
  upload.single("file"),
  async (req: Req, res: Res) => {
    const { title, body, author, postType, noticeNumber, resumo } = req.body;
    const file = req.file;
    const postContent = { title, body, author, postType, resumo } as IPost;

    if (postType == PostTypes.NOTICE) {
      postContent.noticeNumber = noticeNumber;
    }

    if (file) {
      const resp = await uploadFile(file);
      postContent.img = "https://drive.google.com/uc?export=view&id=" + resp;
      try {
        const newSlide = new PostSchema(postContent);
        await newSlide.save();
        return res.status(200).json({
          content: newSlide,
          success: true,
          msg: "Post criado com sucesso",
        });
      } catch (error: any) {
        return res.status(501).json({
          error: error,
          success: false,
          msg:
            error?.message ||
            "Houve um erro interno, post nnão pode ser criado",
        });
      }
    } else {
      return res.status(501).json({
        data: "error",
        success: false,
        msg: "A imagem não foi enviada",
      });
    }
  }
);

//EDIT POST

postRoutes.post(
  "/update/:id",
  upload.single("file"),
  async (req: Req, res: Res) => {
    const { id } = req.params;

    if (!id)
      return res.status(404).json({
        success: false,
        msg: "O item não encontrado",
      });

    const existedPost = await PostSchema.findOne({ _id: id });

    if (!existedPost)
      return res.status(404).json({
        success: false,
        msg: "O item não encontrado",
      });

    const { title, body, edit_by, postType, resumo } = req.body;
    // console.log({ title, body, edit_by, postType });
    const post = { title, body, edit_by, postType, resumo } as IPost;

    const file = req.file;

    if (file) {
      const resp = await uploadFile(file);
      await deleteFile(existedPost.img.split("=")[2]);
      post.img = "https://drive.google.com/uc?export=view&id=" + resp;
    }

    try {
      PostSchema.findOneAndUpdate({ _id: id }, post)
        .then((success) => {
          if (!success) {
            return res.status(502).json({
              success: false,
              msg: "Erro interno de servidor!",
              post: success,
            });
          }

          return res.status(200).json({
            success: true,
            msg: "Item atualizado com sucesso!",
            post: success,
          });
        })
        .catch((error) => {
          return res.status(200).json({
            success: false,
            msg: "Ocorreu um erro interno",
            error: error,
          });
        });
    } catch (error: any) {
      return res.status(501).json({
        error: error,
        success: false,
        msg:
          error?.message || "Houve um erro interno, post nnão pode ser criado",
      });
    }
  }
);

//DELETE POST

postRoutes.get("/delete/:id", async (req: Req, res: Res) => {
  const { id } = req.params;
  if (!id)
    return res.status(501).json({
      msg: "id do objeto nao encontrado",
      success: false,
    });

  const resp = await PostSchema.findOneAndDelete({ _id: id });
  if (resp) {
    const file = resp.img.split("=")[2];
    await deleteFile(file);
    return res.status(200).json({
      data: resp,
      success: true,
      msg: "Item deletado com sucesso",
    });
  }
  return res.status(501).json({
    msg: "erro interno do servidor, item não pode ser apagado",
    success: false,
  });
});

postRoutes.get("/:postId", async (req: Req, res: Res) => {
  const { postId } = req.params;

  if (!postId)
    return res.status(404).json({
      success: false,
      msg: "Id do item não encontrado",
    });

  try {
    const post = await PostSchema.findOne({ _id: postId });

    if (!post)
      return res.status(404).json({
        success: false,
        msg: "Post não encontrado",
      });

    return res.status(200).json({
      success: true,
      post: post,
      msg: "Post encontrado com successo!",
    });
  } catch (error: any) {
    return res.status(501).json({
      success: false,
      msg:
        error.name == "CastError"
          ? "Post não encontrado"
          : "Post encontrado com successo!",
    });
  }
});

//LIST POSTS

postRoutes.get("/lists/:postType/", async (req: Req, res: Res) => {
  const { postType } = req.params;
  try {
    const posts = await PostSchema.find({ postType: parseInt(postType) });

    if (!posts) {
      return res.status(501).json({
        success: false,
        msg: "Houve um erro interno",
        posts: posts,
      });
    }

    return res.status(200).json({
      msg: "",
      success: true,
      posts: posts,
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      msg: "Houve um erro interno de servidor",
      error: error,
    });
  }
});

postRoutes.post("/search", async (req: Req, res: Res) => {
  const query = req.body.query;
  const searchParams = await tagBuilder(query, "", "");

  try {
    const results = await PostSchema.find({ tags: { $in: searchParams } });

    return res.status(200).json({
      success: true,
      msg: "",
      posts: results,
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      msg: "",
      error: error,
    });
  }
});

export default postRoutes;
