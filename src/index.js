import { config } from "dotenv";
config();
import "./server.js"; // Express serverni birga ishga tushiradi
import { Telegraf } from "telegraf";
import { handleStart } from "./helpers/start.js";
import {
  startRegister,
  handleText,
  handleConfirm,
  handleCancel,
} from "./helpers/register.js";
import { startAdminLogin, handleAdminText } from "./bot/adminScene.js";
import {
  startProfile,
  handleProfileText,
  handleProfilePhoto,
} from "./bot/profileScene.js";
import { handleBroadcast } from "./bot/broadcast.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(handleStart);

bot.command("admin", startAdminLogin);
bot.command("profile", startProfile);
bot.command("broadcast", handleBroadcast);

bot.action("confirm", handleConfirm);
bot.action("cancel", handleCancel);

bot.on("photo", async (ctx) => {
  await handleProfilePhoto(ctx);
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (text.startsWith("/")) return;

  await handleAdminText(ctx);
  await handleProfileText(ctx);
  await handleText(ctx);
});

bot.launch().then(() => {
  console.log("Telegram bot muvaffaqiyatli ishga tushdi!");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
