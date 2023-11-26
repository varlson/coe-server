import mongoose, { connect } from "mongoose";

const url =
  "mongodb+srv://coee-dev:coee-dev@cluster0.tcc6i.mongodb.net/coee-site?retryWrites=true&w=majority";

export const databaseConnection = async () => {
  await mongoose
    .connect(url)
    .then(() => {
      console.info("connected to databse. Server is runnnit at 3222");
    })
    .catch(() => {
      console.info("cant connect to database");
    });
};
