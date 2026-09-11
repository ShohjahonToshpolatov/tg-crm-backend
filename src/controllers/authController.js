import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserByEmail } from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../helpers/jwt.js";

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const accessToken = generateAccessToken({ email, role: "admin" });
      const refreshToken = generateRefreshToken({ email, role: "admin" });
      return res.json({ accessToken, refreshToken });
    }

    const user = await findUserByEmail(email);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Email yoki parol noto'g'ri" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Server xatosi", error: err.message });
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
