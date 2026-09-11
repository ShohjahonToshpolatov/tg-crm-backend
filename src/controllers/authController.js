import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../models/userModel.js";

async function loginAdmin(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email va parolni kiritish majburiy",
      });
    }

    const user = await findUserByEmail(email);

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Sizda admin paneliga kirish huquqi yo'q",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email yoki parol noto'g'ri",
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token topilmadi",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const payload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Refresh token yaroqsiz yoki muddati o'tgan",
    });
  }
}

export { loginAdmin, refreshToken };
