import { verifyAccessToken } from "../helpers/jwt.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token topilmadi",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decode = verifyAccessToken(token);
    req.user = decode;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token yaroqsiz yoki muddati tugagan",
    });
  }
};

export { authMiddleware };
