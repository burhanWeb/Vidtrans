import { isTokenValid } from "../utils/CreateJwt.js";

const ProtectedRoute = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const payload = isTokenValid(token, process.env.JWT_SECRET);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { name, userId } = payload;
    req.user = { userId, name };

    next();
  } catch (error) {
    console.error("ProtectedRoute Error:", error.message);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default ProtectedRoute;
