import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import {
  startRegister,
  handleConfirm,
  handleCancel,
  handleRegisterInput,
} from "./helpers/register.js";
import {
  startAdminLogin,
  handleAdminText,
  adminSessions,
} from "./bot/adminScene.js";
import { handleBroadcast } from "./bot/broadcast.js";
import {
  listUsers,
  handleDeleteUser,
  handleEditStart,
  handleEditInput,
  editSessions,
} from "./bot/adminUsers.js";
import {
  startAdminAddUser,
  handleAdminAddUserText,
  adminAddUserSessions,
} from "./bot/adminAddUser.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  adminSessions.delete(ctx.from.id);
  editSessions.delete(ctx.from.id);
  adminAddUserSessions.delete(ctx.from.id);
  return startRegister(ctx);
});

bot.command("admin", async (ctx) => {
  return startAdminLogin(ctx);
});

bot.command("broadcast", handleBroadcast);
bot.command("users", listUsers);
bot.command("adduser", startAdminAddUser);

bot.action(/^del_user_\d+$/, handleDeleteUser);
bot.action(/^edit_user_\d+$/, handleEditStart);
bot.action("confirm", handleConfirm);
bot.action("cancel", handleCancel);

bot.on("text", async (ctx) => {
  if (adminSessions.has(ctx.from.id)) {
    return handleAdminText(ctx);
  }
  if (editSessions.has(ctx.from.id)) {
    return handleEditInput(ctx);
  }
  if (adminAddUserSessions.has(ctx.from.id)) {
    return handleAdminAddUserText(ctx);
  }
  return handleRegisterInput(ctx);
});

bot.on("photo", async (ctx) => {
  if (
    adminSessions.has(ctx.from.id) ||
    editSessions.has(ctx.from.id) ||
    adminAddUserSessions.has(ctx.from.id)
  ) {
    return;
  }
  return handleRegisterInput(ctx);
});

bot.launch().then(() => {
  console.log("Telegram bot ishga tushdi");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
