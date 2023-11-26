import express, { Request as Req, Response as Res } from "express";
import * as dotenv from "dotenv";
dotenv.config();
import route from "./route/postRoute";
import { databaseConnection } from "./database/database";
import userRoute from "./route/userRoute";
import noticeRouter from "./route/noticeRoutes";
import postRoutes from "./route/postRoutes";
import cors from "cors";
import slideRouter from "./route/slideRoutes";
import loginRoute from "./route/loginRoutes";
const app = express();

app.use(cors());

app.use(express.json());
app.use("/api", route);
app.use("/api/auth", userRoute);
app.use("/api/posts", postRoutes);
app.use("/api/notice", noticeRouter);
app.use("/api/slide", slideRouter);
app.use("/api", loginRoute);

app.listen(3222, () => {
  databaseConnection();
});
