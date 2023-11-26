import Mailjet from "node-mailjet";

export const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_KEY,
  apiSecret: process.env.MAILJET_SECRET,
});

export const message = {
  from: {
    name: "John Doe",
    email: "johndoe@example.com",
  },
  to: [
    {
      name: "Jane Doe",
      email: "janedoe@example.com",
    },
  ],
  subject: "Hello, world!",
  text: "This is a test email.",
  html: "<h1>Hello, world!</h1>",
};
