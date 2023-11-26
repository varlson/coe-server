import { IPost } from "../types/types";

export const IpostValidarion = (post: IPost) => {
  const { title, body } = post;
  if (!title || !body)
    return { succes: false, msg: "Por favor, forneca os dados" };

  return { succes: true, msg: "" };
};
