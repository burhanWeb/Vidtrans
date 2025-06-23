import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const createJWT = (data, res) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: oneDay,
    sameSite: "None",
    secure: true,
  });

  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

export { createJWT, isTokenValid };
