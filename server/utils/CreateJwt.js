import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const createJWT = (data, res) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const oneDay = 1000 * 60 * 60 * 24; // 1 day in milliseconds
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: oneDay,
    sameSite: "None",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
};

const isTokenValid = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export { createJWT, isTokenValid };
