import User from "@/models/User";
import db from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
let bcrypt = require('bcryptjs');

interface RequestWithBody extends NextApiRequest {
  body: {
    name: string;
    email: string;
    password?: string;
    image?: string;
  };
}

async function handler(
  req: RequestWithBody,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ message: "signin required" });
  }
  const { user }:any = session;
  const { name, email, password }:any = req.body;

  if (
    !name ||
    !email ||
    !email.includes("@") ||
    (password && password.trim().length < 3)
  ) {
    res.status(422).json({
      message: "Validation error",
    });
    return;
  }

  await db.connect();
  const toUpdateUser:any = await User.findById(user._id);
  toUpdateUser.name = name;
  toUpdateUser.email = email;
  if (password) {
    toUpdateUser.password = await bcrypt.hash(password, 10);
  }
  await toUpdateUser.save();
  await db.disconnect();
  res.send({
    message: 'User updated successfully'
  })
}

export default handler;