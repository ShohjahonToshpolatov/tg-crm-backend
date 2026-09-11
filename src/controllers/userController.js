import {
  findUserByTelegramId,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../models/userModel.js";

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await findUserByTelegramId(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function updateProfile(req, res) {
  try {
    const telegramId = req.user.id;
    const { university, age } = req.body;

    const updatedUser = await updateUserProfile(telegramId, {
      university,
      age,
      photoUrl: null,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profil muvaffaqiyatli yangilandi",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Rasm yuklanmadi",
      });
    }

    const telegramId = req.user.id;
    const photoUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await updateUserProfile(telegramId, {
      university: null,
      age: null,
      photoUrl,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rasm muvaffaqiyatli yuklandi",
      photoUrl,
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function listUsers(req, res) {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function changeUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Noto'g'ri rol kiritildi",
      });
    }

    const updatedUser = await updateUserRole(id, role);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Foydalanuvchi roli o'zgartirildi",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Foydalanuvchi o'chirildi",
      data: deletedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export {
  getProfile,
  updateProfile,
  uploadPhoto,
  listUsers,
  changeUserRole,
  removeUser,
};
