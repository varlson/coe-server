import {
  Router,
  Request as Req,
  Response as Res,
  NextFunction as Next,
} from "express";
const route = Router();
import multer from "multer";
import { deleteFile, uploadFile } from "../middleware/fileManager";
import PostSchema from "../models/post";
import { IPost, PostTypes } from "../types/types";
import UserModel from "../models/user";
import { documentToIpost } from "../util/util";
import { storage } from "../config/multer";

const upload = multer({ storage: storage });
route.post("/posts", upload.single("file"), async (req: Req, res: Res) => {
  const { title, body, author, postType } = req.body as IPost;
  const file = req.file;

  if (file) {
    const resp = await uploadFile(file);
    try {
      const newSlide = new PostSchema({
        title,
        body,
        img: "https://drive.google.com/uc?export=view&id=" + resp,
        author,
        postType,
      });
      await newSlide.save();
      return res.status(200).json({
        newSlide,
        success: true,
      });
    } catch (error) {
      return res.status(501).json({
        error: error,
        success: false,
      });
    }
  } else {
    return res.status(501).json({
      data: "error",
      success: true,
    });
  }
});

route.get("/slides", async (req: Req, res: Res) => {
  try {
    const slides = await PostSchema.find({ postType: PostTypes.SLIDE });
    return res.status(200).json({
      msg: "",
      success: true,
      slides: slides,
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      msg: "Houve um erro interno",
      error: error,
    });
  }
});

route.get("/posts", async (req: Req, res: Res) => {
  try {
    const slides = await PostSchema.find({ postType: PostTypes.NEWS });

    const promises = slides.map(async (item) => {
      const converted = await documentToIpost(item);
      return converted;
    });

    return res.status(200).json({
      msg: "",
      success: true,
      slides: slides,
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      msg: "Houve um erro interno",
      error: error,
    });
  }
});

// route.get("/posts/:id", async (req: Req, res: Res) => {
//   const { id } = req.params;

//   if (!id)
//     return res.status(404).json({
//       msg: "id do item não encontrado",
//       success: false,
//     });
//   try {
//     const post = await PostSchema.findById({ _id: id });
//     if (!post)
//       return res
//         .status(404)
//         .json({ success: false, msg: "O post não encontrado" });
//     return res.status(200).json({
//       msg: "",
//       success: true,
//       post: post,
//     });
//   } catch (error) {
//     return res.status(501).json({
//       success: false,
//       msg: "Houve um erro interno",
//       error: error,
//     });
//   }
// });

route.get("/delete-slide/:id", async (req: Req, res: Res) => {
  const { id } = req.params;
  if (!id)
    return res.status(501).json({
      msg: "id do objeto nao encontrado",
      success: false,
    });

  console.log("id", id);
  const resp = await PostSchema.findOneAndDelete({ _id: id });
  if (resp) {
    const file = resp.img.split("=")[2];
    console.log("deleted file");
    console.log(file);
    await deleteFile(file);
    return res.status(200).json({
      data: resp,
      success: true,
      msg: "Item deletado com sucesso",
    });
  }
  return res.status(501).json({
    msg: "erro interno do servidor",
    success: false,
  });
});

route.get("/", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  console.log("token");
  console.log(token);
  res.status(200).json({
    success: true,
    msg: "Hello world",
  });
});

route.post(
  "/edit-post/:postId",
  upload.single("file"),
  async (req: Req, res: Res) => {
    const { postId } = req.params;

    if (!postId) {
      return res.status(404).json({
        success: false,
        msg: "Post não encontrado",
      });
    }
    const existPost = await PostSchema.findOne({ _id: postId });
    if (!existPost) {
      return res.status(404).json({
        msg: "Post não encontrado",
        success: false,
      });
    }

    const { title, body, userUpdateId, isSlide } = req.body;
    const file = req.file;
    var post = { title, body, userUpdateId, img: "" };

    if (file) {
      await deleteFile(existPost.img.split("=")[2]);
      const id = await uploadFile(file);
      const img = "https://drive.google.com/uc?export=view&id=" + id;
      post.img = img;
    }

    try {
      PostSchema.findOneAndUpdate({ _id: postId }, post)
        .then((success) => {
          console.log(success);

          return res.status(200).json({
            post: success,
            success: true,
            msg: "Post atualizado com sucesso",
          });
        })
        .catch((error) => {
          console.log(error);

          return res.status(501).json({
            error: error,
            success: false,
            msg: "Houve erro interno",
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        error: error,
        success: false,
        msg: "Algo deu errado ",
      });
    }
  }
);
export default route;
