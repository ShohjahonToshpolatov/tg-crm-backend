import { findUserByTelegramId } from "../config/db.js";
import { startRegister } from "./register.js";

async function handleStart(ctx) {
  const telegramId = ctx.from.id;

  try {
    const existingUser = await findUserByTelegramId(telegramId);

    if (existingUser) {
      return ctx.reply(
        `Siz allaqachon ro'yxatdan o'tgansiz, ${existingUser.full_name}`,
      );
    }

    await ctx.reply(
      "Assalomu alaykum! Ro'yxatdan o'tish uchun bir nechta ma'lumot kiriting.",
    );
    return startRegister(ctx);
  } catch (err) {
    console.error("/start xatosi:", err.message);
    return ctx.reply("Xatolik yuz berdi");
  }
}

export { handleStart };
